"use client"
import { useState, useEffect } from "react";
import { AuthService } from "@/app/backend/auth.service";
import Chat from "@/app/components/chat";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;
  const authService = new AuthService();
  const userId = authService.getCurrentUserId();
  const [currentUserId, setCurrentUserId] = useState<string | null>(userId);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read otherUserId from query parameters
    const otherUserIdParam = searchParams.get('otherUserId');
    
    if (otherUserIdParam) {
      setOtherUserId(otherUserIdParam);
    }
    
    setIsLoading(false);
  }, [searchParams]);

  const handleClose = () => {
    router.push('/support');
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
    return null;
  }

  return (
    <Chat 
      currentUserId={currentUserId} 
      otherUserId={otherUserId} 
      taskId={id} 
      onClose={handleClose} 
    />
  );
}