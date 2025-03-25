"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/app/backend/auth.service";

import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabase";

interface ProfileFormData {
  name: string;
  location: string;
  bio: string;
  profilePicture: File | null;
}

export default function ProfileForm() {
  const router = useRouter();
  const authService = new AuthService();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    location: "",
    bio: "",
    profilePicture: null,
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (userId: string) => {
    if (!formData.profilePicture) return null;

    try {
      const fileExt = formData.profilePicture.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/profile/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, formData.profilePicture);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Profile picture upload error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.name) {
        throw new Error("Name is required");
      }

      // Get current user
      const userId = await authService.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Upload profile picture if selected
      const profilePictureUrl = await uploadProfilePicture(userId);

      // Prepare insert data
      const insertData: any = {
        user_id: userId,
        name: formData.name,
        location: formData.location,
        bio: formData.bio,
      };

      // Add profile picture URL if uploaded
      if (profilePictureUrl) {
        insertData.profile_picture = profilePictureUrl;
      }

      // Insert user profile in database
      const { error: insertError } = await supabase
        .from('users')
        .insert(insertData);

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        throw new Error(insertError.message || "Failed to create profile");
      }

      // Redirect to dashboard or profile page
      router.push('/dashboard');
    } catch (err) {
      console.error("Profile Creation Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while creating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-4">
            <Label htmlFor="profilePicture" className="mb-2">Profile Picture</Label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              {profilePicturePreview ? (
                <Image 
                  src={profilePicturePreview} 
                  alt="Profile Preview" 
                  layout="fill" 
                  objectFit="cover" 
                  className="cursor-pointer"
                  onClick={() => document.getElementById('profilePicture')?.click()}
                />
              ) : (
                <div 
                  className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer"
                  onClick={() => document.getElementById('profilePicture')?.click()}
                >
                  Upload Picture
                </div>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location Field */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Select 
              name="location"
              value={formData.location}
              onValueChange={(value) => setFormData((prev) => ({
                ...prev,
                location: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Chennai">Chennai</SelectItem>
                <SelectItem value="Coimbatore">Coimbatore</SelectItem>
                <SelectItem value="Madurai">Madurai</SelectItem>
                <SelectItem value="Trichy">Tiruchirappalli</SelectItem>
                <SelectItem value="Salem">Salem</SelectItem>
                <SelectItem value="Erode">Erode</SelectItem>
                <SelectItem value="Tirunelveli">Tirunelveli</SelectItem>
                <SelectItem value="Vellore">Vellore</SelectItem>
                <SelectItem value="Kancheepuram">Kancheepuram</SelectItem>
                <SelectItem value="Thanjavur">Thanjavur</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bio Field */}
          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Input
              id="bio"
              name="bio"
              type="text"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Profile..." : "Save Profile"}
          </Button>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}