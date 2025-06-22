import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, token, updateUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const getAvatarFallback = ()_getAvatarFallback = () => {
    if (!user) return "CQ"; // Cultural Quest default
    return (user.displayName || user.email)?.[0]?.toUpperCase() || "U";
  };

  const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!token || !user) return;
    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName }),
      });
      const updatedUser = await response.json();
      if (response.ok) {
        updateUser(updatedUser); // Update auth context
        toast({ title: "Profile Updated", description: "Your display name has been saved." });
      } else {
        toast({ title: "Update Failed", description: updatedUser.message || "Could not save profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not connect to server.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!token || !user || !avatarFile) return;
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST', // Or PUT, depending on your API design for file uploads
        headers: {
          // 'Content-Type': 'multipart/form-data' is set automatically by browser with FormData
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        updateUser({ avatarUrl: result.avatarUrl }); // Update auth context
        toast({ title: "Avatar Updated", description: "Your new avatar has been saved." });
        setAvatarFile(null); // Clear the file input after successful upload
      } else {
        toast({ title: "Avatar Upload Failed", description: result.message || "Could not save avatar.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not connect to server for avatar upload.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (authLoading && !user) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    // This page should ideally be protected by a route guard if not logged in.
    // For now, show a message or redirect.
    // Redirecting is better, handle in App.tsx or a ProtectedRoute component.
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please log in to view your profile.</p>
                </CardContent>
                <CardFooter>
                    {/* Optionally, provide a login button or link here */}
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            {/* Navigation back to home could be added here */}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Update your profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="w-32 h-32 text-4xl">
                <AvatarImage src={avatarPreview || undefined} alt={user.displayName || user.email} />
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-8 h-8 text-white" />
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {avatarFile && (
              <Button onClick={handleSaveAvatar} disabled={isUploadingAvatar} className="w-full sm:w-auto">
                {isUploadingAvatar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Avatar
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your display name and email (email is non-editable).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={handleDisplayNameChange}
                placeholder="Your public name"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="ml-auto">
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Placeholder for other settings like theme preference if stored in DB */}
      </main>
    </div>
  );
}
