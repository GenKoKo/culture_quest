import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { useAuth } from '@/hooks/useAuth'; // Will create this hook next

type AuthView = 'login' | 'register' | 'verify-email';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [emailForVerification, setEmailForVerification] = useState<string>('');
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setView(initialView); // Reset to initial view when modal opens
    }
  }, [isOpen, initialView]);

  const handleLoginSuccess = (userData: any, token: string) => {
    login(userData, token); // Update auth context
    onClose();
  };

  const handleRegisterSuccess = (email: string) => {
    setEmailForVerification(email);
    setView('verify-email');
  };

  const handleRequiresVerification = (email: string) => {
    setEmailForVerification(email);
    setView('verify-email');
  };

  const handleVerificationSuccess = () => {
    setView('login'); // After verification, prompt user to login
    // Optionally, you could try to auto-login here if the backend supports it post-verification
  };

  const renderView = () => {
    switch (view) {
      case 'register':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create an Account</DialogTitle>
              <DialogDescription>
                Join Cultural Quest to track your progress and compete with others.
              </DialogDescription>
            </DialogHeader>
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onShowLogin={() => setView('login')}
            />
          </>
        );
      case 'verify-email':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                Enter the code sent to {emailForVerification}.
              </DialogDescription>
            </DialogHeader>
            <VerifyEmailForm
              email={emailForVerification}
              onVerificationSuccess={handleVerificationSuccess}
              onBackToRegister={() => setView('register')}
            />
          </>
        );
      case 'login':
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Login to Your Account</DialogTitle>
              <DialogDescription>
                Welcome back! Access your Cultural Quest journey.
              </DialogDescription>
            </DialogHeader>
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onShowRegister={() => setView('register')}
              onRequiresVerification={handleRequiresVerification}
            />
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {renderView()}
      </DialogContent>
    </Dialog>
  );
}
