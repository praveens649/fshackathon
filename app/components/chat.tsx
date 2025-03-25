"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/lib/supabase";
import { Send, X } from 'lucide-react';

// UUID validation function
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

interface ChatMessage {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  task_id: string;
  content: string;
  created_at: string;
}

interface ChatProps {
  currentUserId: string | Promise<string>;
  otherUserId: string;
  taskId: string;
  onClose: () => void;
}

export default function Chat({ currentUserId, otherUserId, taskId, onClose }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserDetails, setOtherUserDetails] = useState<{
    name: string;
    profile_picture: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCurrentUserId, setResolvedCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve currentUserId if it's a Promise
  useEffect(() => {
    const resolveCurrentUserId = async () => {
      try {
        const userId = await (currentUserId instanceof Promise 
          ? currentUserId 
          : Promise.resolve(currentUserId));
        
        setResolvedCurrentUserId(userId);
      } catch (err) {
        console.error('Error resolving current user ID:', err);
        setError('Could not resolve current user ID');
      }
    };

    resolveCurrentUserId();
  }, [currentUserId]);

  // Fetch other user's details
  useEffect(() => {
    const fetchOtherUserDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, profile_picture')
          .eq('user_id', otherUserId)
          .single();

        if (error) throw error;

        if (data) {
          setOtherUserDetails({
            name: data.name,
            profile_picture: data.profile_picture
          });
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Could not fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOtherUserDetails();
  }, [otherUserId]);

  // Fetch existing messages for this task
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Could not fetch messages');
      }
    };

    // Real-time subscription for new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        }
      )
      .subscribe();

    fetchMessages();
    scrollToBottom();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    // Ensure we have a resolved current user ID
    if (!resolvedCurrentUserId) {
      setError('Current user ID not resolved');
      return;
    }

   
    // Validate UUIDs before sending
    const isCurrentUserIdValid = isValidUUID(resolvedCurrentUserId);
    const isOtherUserIdValid = isValidUUID(otherUserId);
    const isTaskIdValid = isValidUUID(taskId);

    if (!isCurrentUserIdValid || !isOtherUserIdValid || !isTaskIdValid) {
      const invalidFields = [
        !isCurrentUserIdValid && 'Current User ID',
        !isOtherUserIdValid && 'Other User ID', 
        !isTaskIdValid && 'Task ID'
      ].filter(Boolean).join(', ');

      setError(`Invalid UUID(s): ${invalidFields}. Please provide valid UUIDs.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: resolvedCurrentUserId,
          receiver_id: otherUserId,
          task_id: taskId,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Could not send message');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed  w-96 bg-white border rounded-lg shadow-lg flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed mx-auto  w-96 bg-white border rounded-lg shadow-lg flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fixed mx-auto  w-96 bg-white border rounded-lg shadow-lg flex flex-col">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          {otherUserDetails?.profile_picture && (
            <img 
              src={otherUserDetails.profile_picture} 
              alt={otherUserDetails.name} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="font-semibold">{otherUserDetails?.name || 'User'}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-grow p-4 space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <div 
            key={msg.message_id} 
            className={`flex mb-2 ${
              msg.sender_id === resolvedCurrentUserId 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div 
              className={`max-w-[70%] p-2 rounded-lg ${
                msg.sender_id === resolvedCurrentUserId 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Message Input */}
      <div className="flex p-4 border-t">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Type a message..."
          className="flex-grow mr-2"
        />
        <Button 
          size="icon" 
          onClick={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}