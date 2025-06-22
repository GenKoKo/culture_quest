import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Using standard input for simplicity, but InputOTP could be used
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface VerifyEmailFormProps {
  email: string; // Email that needs verification
  onVerificationSuccess: () => void;
  onBackToRegister?: () => void; // Optional: if user wants to go back
}

const CODE_LENGTH = 6;

export function VerifyEmailForm({ email, onVerificationSuccess, onBackToRegister }: VerifyEmailFormProps) {
  const [code, setCode] = useState(new Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Focus next input
      if (value && index < CODE_LENGTH - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, CODE_LENGTH);
    if (/^[0-9]+$/.test(pastedData)) {
        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            if (i < CODE_LENGTH) {
                newCode[i] = pastedData[i];
            }
        }
        setCode(newCode);
        const lastFilledIndex = Math.min(pastedData.length -1, CODE_LENGTH -1);
        if (lastFilledIndex < CODE_LENGTH -1) {
             inputsRef.current[lastFilledIndex + 1]?.focus();
        } else {
            inputsRef.current[lastFilledIndex]?.focus();
        }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== CODE_LENGTH) {
      toast({
        title: "Invalid Code",
        description: `Please enter a ${CODE_LENGTH}-digit code.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified. You can now log in.",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid code or server error.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        A {CODE_LENGTH}-digit verification code has been sent to <strong className="dark:text-gray-100">{email}</strong>.
        Please enter it below.
      </p>
      <div>
        <Label htmlFor="verification-code">Verification Code</Label>
        <div className="flex space-x-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <Input
              key={index}
              id={`code-input-${index}`}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 text-center text-lg"
              required
            />
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify Email
      </Button>
      {onBackToRegister && (
         <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Entered wrong email?{' '}
            <Button variant="link" type="button" onClick={onBackToRegister} className="p-0 h-auto dark:text-primary-light">
            Go back
            </Button>
      </p>
      )}
    </form>
  );
}
