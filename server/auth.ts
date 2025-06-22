import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-please-change-me"; // Use environment variable in production
const EMAIL_USER = process.env.EMAIL_USER; // Your email address
const EMAIL_PASS = process.env.EMAIL_PASS; // Your email password or app password

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    "Email credentials (EMAIL_USER, EMAIL_PASS) are not set. Email sending will be disabled."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your email provider
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

async function sendVerificationEmail(email: string, code: string) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log(`Email sending disabled. Verification code for ${email}: ${code}`);
    return;
  }
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Verify Your Email Address for Cultural Quest",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    // In a real app, you might want to handle this more gracefully
  }
}

async function sendVerificationSuccessEmail(email: string) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log(`Email sending disabled. Verification success for ${email}.`);
    return;
  }
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Email Verification Successful - Cultural Quest",
    text: "Your email address has been successfully verified. Welcome to Cultural Quest!",
    html: "<p>Your email address has been successfully verified. Welcome to Cultural Quest!</p>",
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification success email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification success email to ${email}:`, error);
  }
}

export async function registerUser(req: Request, res: Response) {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        emailVerificationCode: verificationCode,
        displayName: displayName || email.split("@")[0], // Default display name
      })
      .returning();

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "User registered successfully. Please check your email for verification code.",
      userId: newUser[0].id,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user." });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and verification code are required." });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user[0].emailVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    if (user[0].emailVerificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    await db
      .update(users)
      .set({ emailVerified: true, emailVerificationCode: null, updatedAt: new Date().toISOString() })
      .where(eq(users.id, user[0].id));

    await sendVerificationSuccessEmail(email);

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Error verifying email." });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user[0].emailVerified) {
      // Optionally, resend verification email or prompt user to verify
      // For now, just inform them
      await sendVerificationEmail(user[0].email, user[0].emailVerificationCode!); // Resend code
      return res.status(403).json({
        message: "Email not verified. A new verification code has been sent to your email.",
        emailNotVerified: true
      });
    }

    const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    // Exclude sensitive information from the response
    const { passwordHash, emailVerificationCode, ...userData } = user[0];

    res.status(200).json({
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user." });
  }
}

export async function logoutUser(req: Request, res: Response) {
  // For JWT, logout is typically handled client-side by deleting the token.
  // Server-side might involve token blacklisting if using a more complex setup.
  res.status(200).json({ message: "Logged out successfully." });
}

// Middleware to authenticate JWT
export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.sendStatus(403); // Forbidden (invalid token)
    }
    req.user = user;
    next();
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const userRecord = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (userRecord.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const { passwordHash, emailVerificationCode, ...userData } = userRecord[0];
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Error fetching user data." });
  }
}

export async function updateUserProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const { displayName } = req.body;
  // Add more fields as needed, e.g., avatarUrl if not handled by a separate endpoint

  if (!displayName) {
    return res.status(400).json({ message: "Display name is required." });
  }

  try {
    const updatedUser = await db
      .update(users)
      .set({ displayName, updatedAt: new Date().toISOString() })
      .where(eq(users.id, req.user.userId))
      .returning({ id: users.id, email: users.email, displayName: users.displayName, avatarUrl: users.avatarUrl, emailVerified: users.emailVerified });

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile." });
  }
}

// Multer setup for avatar uploads
const AVATAR_UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "avatars"); // Adjusted path
if (!fs.existsSync(AVATAR_UPLOAD_DIR)) {
  fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: function (req: AuthenticatedRequest, file, cb) {
    // Ensure req.user is populated by authenticateToken middleware
    const userId = req.user?.userId;
    if (!userId) {
      // This should ideally not happen if authenticateToken runs first
      return cb(new Error("User not authenticated for avatar upload filename"), "");
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `user-${userId}-avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + allowedTypes));
  }
});

export const avatarUploadMiddleware = upload.single('avatar');

export async function handleAvatarUpload(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded or file type incorrect." });
  }

  const avatarPath = `/uploads/avatars/${req.file.filename}`;
  // Note: This path needs to be accessible via HTTP.
  // This requires `express.static` middleware to be set up in `server/index.ts` or `server/vite.ts`
  // to serve the `server/public` directory.

  try {
    // Before updating, potentially delete the old avatar if it exists
    const currentUser = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (currentUser[0]?.avatarUrl) {
        const oldAvatarFileName = path.basename(currentUser[0].avatarUrl);
        const oldAvatarPath = path.join(AVATAR_UPLOAD_DIR, oldAvatarFileName);
        if (fs.existsSync(oldAvatarPath)) {
            // Make sure not to delete default avatars or other shared assets
            if (oldAvatarFileName.startsWith(`user-${req.user.userId}-avatar-`)) {
                 fs.unlink(oldAvatarPath, (err) => {
                    if (err) console.error("Error deleting old avatar:", err);
                 });
            }
        }
    }

    await db.update(users)
      .set({ avatarUrl: avatarPath, updatedAt: new Date().toISOString() })
      .where(eq(users.id, req.user.userId));

    res.status(200).json({ message: "Avatar uploaded successfully.", avatarUrl: avatarPath });
  } catch (error) {
    console.error("Error uploading avatar and updating DB:", error);
    // If DB update fails, try to delete the just-uploaded file to prevent orphans
    fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting orphaned uploaded avatar:", err);
    });
    res.status(500).json({ message: "Error saving avatar information." });
  }
}
