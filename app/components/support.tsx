"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { format } from "date-fns";
import { 
  MessageCircle, 
  MapPin, 
  Calendar, 
  HandHelpingIcon, 
  UtensilsCrossed, 
  ShoppingBag,
  Filter,
  Loader2
} from "lucide-react";
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

  const initiateChat = async (creatorId: string, taskId: string) => {
    // Navigate to the chat page for this task, passing the creator's user_id
    router.push(`/support/${taskId}/chat?otherUserId=${creatorId}`);
  };

  const filteredTasks = tasks.filter(task => 
    (locationFilter === 'All' || task.location === locationFilter)
  );

  const getTaskTypeIcon = (type: string) => {
    switch(type) {
      case 'Borrow': return <HandHelpingIcon className="h-4 w-4" />;
      case 'Meal Share': return <UtensilsCrossed className="h-4 w-4" />;
      case 'Errand': return <ShoppingBag className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HandHelpingIcon className="h-6 w-6" />
          Community Tasks
        </h1>
      </div>

      {/* Enhanced Location Filter */}
      <div className="mb-6">
        <Select 
          value={locationFilter}
          onValueChange={setLocationFilter}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <SelectValue placeholder="Filter by Location" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                <div className="flex items-center gap-2">
                  {location !== 'All' && <MapPin className="h-4 w-4" />}
                  {location}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 flex flex-col items-center gap-2">
          <Filter className="h-8 w-8" />
          <p>{locationFilter === 'All' 
            ? "No tasks available." 
            : `No tasks found in ${locationFilter}.`}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getTaskTypeIcon(task.task_type)}
                  {task.title}
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {task.location}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTaskTypeIcon(task.task_type)}
                      {task.task_type}
                    </Badge>
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(task.due_date), 'PPP')}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="default"
                      className="flex items-center gap-2"
                      onClick={() => supportTask(task.task_id)}
                    >
                      <HandHelpingIcon className="h-4 w-4" />
                      Support Task
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => initiateChat(task.created_by, task.task_id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
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