"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  task_type: 'Borrow' | 'Meal Share' | 'Errand';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date: string | null;
  created_at: string;
  created_by: string;
  accepted_by: string | null;
  location: string;
}

export default function Support() {
  const router = useRouter();
  const authService = new AuthService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('All');

  const LOCATIONS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 
    'Salem', 'Erode', 'Tirunelveli', 'Vellore', 
    'Kancheepuram', 'Thanjavur', 'Other', 'All'
  ];

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        setIsLoading(true);
        const userId = await authService.getCurrentUserId();
        if (!userId) {
          throw new Error("User not authenticated");
        }
        setCurrentUserId(userId);

        // Fetch current user's location
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('location')
          .eq('user_id', userId)
          .single();

        if (userError) throw userError;
        setCurrentUserLocation(userData.location);

        // Fetch tasks not created by the current user
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .neq('created_by', userId)
          .is('accepted_by', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndTasks();
  }, []);

  const supportTask = async (taskId: string) => {
    try {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Update task to mark as accepted by current user
      const { error } = await supabase
        .from('tasks')
        .update({ 
          accepted_by: currentUserId,
          status: 'Completed'
        })
        .eq('task_id', taskId);

      if (error) throw error;

      // Remove the task from the local state
      setTasks(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while supporting the task");
    }
  };

  const initiateChat = async (creatorId: string) => {
    // Navigate to the chat page for this task, passing the creator's user_id
    router.push(`chats/${creatorId}`);
  };

  const filteredTasks = tasks.filter(task => 
    (locationFilter === 'All' || task.location === locationFilter)
  );

  if (isLoading) {
    return <div className="text-center mt-10">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community Tasks</h1>
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <Select 
          value={locationFilter}
          onValueChange={setLocationFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Location" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          {locationFilter === 'All' 
            ? "No tasks available." 
            : `No tasks found in ${locationFilter}.`}
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant="secondary">{task.location}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{task.task_type}</span>
                    {task.due_date && (
                      <span>
                        Due: {format(new Date(task.due_date), 'PPP')}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => supportTask(task.task_id)}
                    >
                      Support Task
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => initiateChat(task.created_by, task.task_id)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}