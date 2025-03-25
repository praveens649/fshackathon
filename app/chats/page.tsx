"use client"
import { useState, useEffect } from "react";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  MessageCircle, 
  Users, 
  Search,
  MessagesSquare,
  UserCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  user_id: string;
  name: string;
  profile_picture: string | null;
  avatar_url?: string; // Add this field
}

export default function ChatsPage() {
  const router = useRouter();
  const authService = new AuthService();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCurrentUserAndUsers = async () => {
      try {
        setIsLoading(true);
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

        // Fetch avatar URLs for users with profile pictures
        const usersWithAvatars = await Promise.all((data || []).map(async (user) => {
          if (user.profile_picture) {
            const { data: avatarUrl } = await supabase
              .storage
              .from('avatars')
              .getPublicUrl(user.profile_picture);
            
            return {
              ...user,
              avatar_url: avatarUrl.publicUrl
            };
          }
          return user;
        }));

        setUsers(usersWithAvatars);
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center text-red-500 space-x-2">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessagesSquare className="h-6 w-6" />
          Chat with Community
        </h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 flex flex-col items-center gap-2">
          <Users className="h-8 w-8" />
          <p>{searchQuery ? "No users found matching your search." : "No users available to chat with."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card 
              key={user.user_id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user.avatar_url || '/default-avatar.png'} 
                      alt={user.name}
                    />
                    <AvatarFallback>
                      <UserCircle className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{user.name}</h2>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={() => initiateChat(user.user_id)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}