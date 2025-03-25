"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";

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

  if (isLoading) {
    return <div className="text-center mt-10">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Link href="/help-desk/create">
          <Button>Create New Task</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 mb-4">
        {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as typeof filter)}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          {filter === 'All' 
            ? "You haven't created any tasks yet." 
            : `No ${filter.toLowerCase()} tasks found.`}
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.task_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status}
                </Badge>
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
                    {task.status !== 'Completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTaskStatus(task.task_id, 'Completed')}
                      >
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