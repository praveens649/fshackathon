"use client"
import { useState, useEffect } from "react";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  user_id: string;
  name: string;
  profile_picture: string | null;
}

export default function ChatsPage() {
  const router = useRouter();
  const authService = new AuthService();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUserAndUsers = async () => {
      try {
        // Fetch current user ID
        const userId = await authService.getCurrentUserId();
        if (!userId) {
          throw new Error("User not authenticated");
        }
        setCurrentUserId(userId);

        // Fetch all users except the current user
        const { data, error } = await supabase
          .from('users')
          .select('user_id, name, profile_picture')
          .neq('user_id', userId);

        if (error) throw error;

        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Could not fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUserAndUsers();
  }, []);

  const initiateChat = (otherUserId: string) => {
    // Navigate to specific chat page with the selected user
    router.push(`/chats/${otherUserId}`);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chat with Users</h1>
      
      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users available to chat with.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
              key={user.user_id} 
              className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage 
                    src={user.profile_picture || '/default-avatar.png'} 
                    alt={user.name} 
                  />
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => initiateChat(user.user_id)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}