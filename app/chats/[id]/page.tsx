"use client"
import { useState, useEffect } from "react";
import { AuthService } from "@/app/backend/auth.service";
import Chat from "@/app/components/chat";
import supabase from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authService = new AuthService();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserDetails, setOtherUserDetails] = useState<{
    name: string;
    profile_picture: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = await authService.getCurrentUserId();
        if (!userId) {
          throw new Error("User not authenticated");
        }
        setCurrentUserId(userId);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Could not fetch current user");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Read otherUserId from query parameters or route params
    const otherUserIdParam = searchParams.get('otherUserId') || params.id;
    
    const fetchOtherUserDetails = async () => {
      if (otherUserIdParam && currentUserId) {
        try {
          // Prevent chatting with self
          if (otherUserIdParam === currentUserId) {
            setError("You cannot chat with yourself");
            setIsLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from('users')
            .select('name, profile_picture')
            .eq('user_id', otherUserIdParam)
            .single();

          if (error) throw error;

          setOtherUserId(otherUserIdParam);
          setOtherUserDetails({
            name: data.name,
            profile_picture: data.profile_picture
          });
        } catch (err) {
          console.error('Error fetching other user details:', err);
          setError('Could not fetch other user details');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (currentUserId) {
      fetchOtherUserDetails();
    }
  }, [searchParams, currentUserId, params.id]);

  const handleClose = () => {
    router.push('/chats');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Ensure we have both currentUserId and otherUserId
  if (!currentUserId || !otherUserId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Unable to start chat</p>
      </div>
    );
  }

  return (
    <Chat 
      currentUserId={currentUserId} 
      otherUserId={otherUserId} 
      onClose={handleClose} 
    />
  );
}