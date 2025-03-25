"use client"
import { useState, useEffect } from "react";
import { AuthService } from "@/app/backend/auth.service";
import Chat from "@/app/components/chat";
import supabase from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, 
  AlertCircle, 
  MessageSquareX, 
  ArrowLeft,
  UserX 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center p-8 space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-gray-600">Loading chat...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-red-500 space-y-4">
              <AlertCircle className="h-12 w-12" />
              <p className="text-center">{error}</p>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Chats</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUserId || !otherUserId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <MessageSquareX className="h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Unable to start chat</p>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Chats</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-screen p-4">
      <div className="flex flex-col h-full">
        <Button 
          variant="ghost" 
          onClick={handleClose} 
          className="self-start mb-4 flex items-center space-x-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chats</span>
        </Button>
        
        <div className="flex-1 overflow-hidden rounded-lg shadow-lg">
          <Chat 
            currentUserId={currentUserId} 
            otherUserId={otherUserId} 
            onClose={handleClose}
            
          />
        </div>
      </div>
    </div>
  );
}