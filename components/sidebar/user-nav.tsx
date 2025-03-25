"use client"

import { useEffect, useState } from "react";
import { AuthService } from "@/app/backend/auth.service"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "../ui/logout-button";
import supabase from "@/lib/supabase";
 

export function UserNav() {
  const authService = new AuthService();
  const email = authService.getCurrentUserEmail();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!email) return;
      
      try {
        const userId = await authService.getCurrentUserId();
        if (!userId) return;

        // Fetch user profile from the users table
        const { data, error } = await supabase
          .from('users')
          .select('profile_picture')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        if (data && data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }

    fetchUserProfile();
  }, [email]);

  if (!email) {
    return null;
  }

  // Get initials for fallback
  const initials = email?.[0]?.toUpperCase() ?? "A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-primary/10">
            <AvatarImage src={profilePicture || ""} alt={email} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-white/80 backdrop-blur-lg backdrop-saturate-150 border border-gray-200/20 shadow-xl"
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200/50" />
        <DropdownMenuItem asChild className="focus:bg-gray-100/80">
          <a href="/profile/edit" className="cursor-pointer flex w-full items-center">
            <span>Edit Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200/50" />
        <DropdownMenuItem className="text-red-600 cursor-pointer p-0 focus:bg-gray-100/80">
          <LogoutButton showIcon className="justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
