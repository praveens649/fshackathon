"use client"
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/app/backend/auth.service";

import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabase";

interface ProfileEditFormData {
  name: string;
  location: string;
  bio: string;
  profilePicture: File | null;
}

export default function ProfileEditForm() {
  const router = useRouter();
  const authService = new AuthService();
  const [formData, setFormData] = useState<ProfileEditFormData>({
    name: "",
    location: "",
    bio: "",
    profilePicture: null,
  });
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user's existing profile data
    const fetchUserProfile = async () => {
      try {
        const userId = await authService.getCurrentUserId();
        if (userId) {
          const { data, error } = await supabase
            .from('users')
            .select('name, location, bio, profile_picture')
            .eq('user_id', userId)
            .single();

          if (data) {
            setFormData(prev => ({
              ...prev,
              name: data.name || "",
              location: data.location || "",
              bio: data.bio || "",
            }));

            // Set profile picture preview if exists
            if (data.profile_picture) {
              // Ensure the URL is a full URL
              const profilePicUrl = data.profile_picture.startsWith('http') 
                ? data.profile_picture 
                : `https://pmydjvruwtpmgqqdlybo.supabase.co/storage/v1/object/public/profile-pictures/${data.profile_picture}`;
              
              setProfilePicturePreview(profilePicUrl);
            }
          }

          if (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

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
      // First, delete any existing profile pictures for this user
      const { data: existingFiles } = await supabase.storage
        .from('profile-pictures')
        .list(`${userId}/profile`);

      if (existingFiles && existingFiles.length > 0) {
        const existingFileNames = existingFiles.map(file => `${userId}/profile/${file.name}`);
        await supabase.storage
          .from('profile-pictures')
          .remove(existingFileNames);
      }

      // Upload new profile picture
      const fileExt = formData.profilePicture.name.split('.').pop();
      const fileName = `${userId}/profile/${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, formData.profilePicture);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return fileName; // Return the file path, not the full URL
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

      // Prepare update data
      const updateData: any = {
        name: formData.name,
        location: formData.location,
        bio: formData.bio,
      };

      // Add profile picture URL if uploaded
      if (profilePictureUrl) {
        updateData.profile_picture = profilePictureUrl;
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Redirect to dashboard or profile page
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10 shadow-lg">
      <CardHeader className="space-y-2 text-center border-b pb-7 pt-9">
        <CardTitle className="text-3xl font-bold text-gray-800">Complete Your Profile</CardTitle>
        <p className="text-gray-500">Share your information with the community</p>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-8">
            <Label htmlFor="profilePicture" className="mb-4 text-lg font-medium">Profile Picture</Label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-md hover:border-primary/20 transition-all duration-200">
              {profilePicturePreview ? (
                <Image 
                  src={profilePicturePreview} 
                  alt="Profile Preview" 
                  layout="fill" 
                  objectFit="cover" 
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => document.getElementById('profilePicture')?.click()}
                />
              ) : (
                <div 
                  className="w-full h-full bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => document.getElementById('profilePicture')?.click()}
                >
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-gray-500">Upload Picture</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div className="col-span-2 md:col-span-1">
              <Label htmlFor="name" className="text-base font-medium mb-2 block">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11 px-4 border-gray-200 focus:border-primary/50"
              />
            </div>

            {/* Location Field */}
            <div className="col-span-2 md:col-span-1">
              <Label htmlFor="location" className="text-base font-medium mb-2 block">Location</Label>
              <Select 
                name="location"
                value={formData.location}
                onValueChange={(value) => setFormData((prev) => ({
                  ...prev,
                  location: value
                }))}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-primary/50">
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
            <div className="col-span-2">
              <Label htmlFor="bio" className="text-base font-medium mb-2 block">Bio (Optional)</Label>
              <Input
                id="bio"
                name="bio"
                type="text"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                className="h-11 px-4 border-gray-200 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-11 mt-6 text-base font-medium transition-all duration-200 hover:opacity-90"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Profile...
              </div>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}