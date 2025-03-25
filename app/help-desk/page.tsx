"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  UtensilsCrossed, 
  ShoppingBag,
  Calendar,
  Loader2
} from "lucide-react";

interface Task {
  task_id: string;
  title: string;
  description: string | null;
  task_type: 'Borrow' | 'Meal Share' | 'Errand';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date: string | null;
  created_at: string;
}

export default function HelpDesk() {
  const authService = new AuthService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  useEffect(() => {
    const fetchUserTasks = async () => {
      try {
        setIsLoading(true);
        const userId = await authService.getCurrentUserId();
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Fetch tasks created by the current user
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('created_by', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTasks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTasks();
  }, []);

  const getStatusBadgeVariant = (status: Task['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
    }
  };

  const filteredTasks = tasks.filter(task => 
    filter === 'All' || task.status === filter
  );

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('task_id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.task_id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating task status");
    }
  };

  const getTaskTypeIcon = (type: Task['task_type']) => {
    switch (type) {
      case 'Borrow': return <Package className="w-4 h-4" />;
      case 'Meal Share': return <UtensilsCrossed className="w-4 h-4" />;
      case 'Errand': return <ShoppingBag className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <Link href="/help-desk/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New Task
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 mb-6 bg-muted/30 p-2 rounded-lg">
        {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'ghost'}
            onClick={() => setFilter(status as typeof filter)}
            className="flex-1"
          >
            {status === 'Pending' && <AlertCircle className="w-4 h-4 mr-2" />}
            {status === 'In Progress' && <Clock className="w-4 h-4 mr-2" />}
            {status === 'Completed' && <CheckCircle2 className="w-4 h-4 mr-2" />}
            {status}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            {filter === 'All' 
              ? "You haven't created any tasks yet." 
              : `No ${filter.toLowerCase()} tasks found.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {getTaskTypeIcon(task.task_type)}
                  <CardTitle className="text-xl">{task.title}</CardTitle>
                </div>
                <Badge 
                  variant={getStatusBadgeVariant(task.status)}
                  className="flex items-center gap-1"
                >
                  {task.status === 'Pending' && <AlertCircle className="w-3 h-3" />}
                  {task.status === 'In Progress' && <Clock className="w-3 h-3" />}
                  {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                  {task.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-2">
                      {getTaskTypeIcon(task.task_type)}
                      {task.task_type}
                    </span>
                    {task.due_date && (
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due: {format(new Date(task.due_date), 'PPP')}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    {task.status !== 'Completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTaskStatus(task.task_id, 'Completed')}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Completed
                      </Button>
                    )}
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