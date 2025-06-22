import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (userData: any, token: string) => void; // Callback after successful login
  onShowRegister: () => void;
  onRequiresVerification: (email: string) => void; // Callback if email needs verification
}

export function LoginForm({ onLoginSuccess, onShowRegister, onRequiresVerification }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.displayName || data.user.email}!`,
        });
        onLoginSuccess(data.user, data.token);
      } else {
        if (data.emailNotVerified) {
            toast({
                title: "Email Not Verified",
                description: data.message || "Please verify your email first. A new code has been sent.",
                variant: "default", // Or "warning" if you have one
            });
            onRequiresVerification(email);
        } else {
            toast({
                title: "Login Failed",
                description: data.message || "Invalid credentials or server error.",
                variant: "destructive",
            });
        }
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email-login">Email</Label>
        <Input
          id="email-login"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password-login">Password</Label>
        <Input
          id="password-login"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Button variant="link" type="button" onClick={onShowRegister} className="p-0 h-auto dark:text-primary-light">
          Register here
        </Button>
      </p>
    </form>
  );
}
