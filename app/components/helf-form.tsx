"use client"
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TaskFormData {
  title: string;
  description: string;
  taskType: 'Borrow' | 'Meal Share' | 'Errand';
  dueDate: Date | undefined;
}

export default function HelpDeskForm() {
  const router = useRouter();
  const authService = new AuthService();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    taskType: "Borrow",
    dueDate: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      // Get current user
      const userId = await authService.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        task_type: formData.taskType,
        created_by: userId,
        due_date: formData.dueDate ? formData.dueDate.toISOString() : null,
      };

      // Insert task into database
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(taskData);

      if (insertError) throw insertError;

      // Redirect to help desk or tasks page
      router.push('/help-desk');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while creating task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Create a New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Provide task details"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Task Type Field */}
          <div>
            <Label htmlFor="taskType">Task Type</Label>
            <Select 
              name="taskType"
              value={formData.taskType}
              onValueChange={(value: TaskFormData['taskType']) => setFormData((prev) => ({
                ...prev,
                taskType: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Borrow">Borrow</SelectItem>
                <SelectItem value="Meal Share">Meal Share</SelectItem>
                <SelectItem value="Errand">Errand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Field */}
          <div>
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData(prev => ({
                    ...prev,
                    dueDate: date
                  }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating Task..." : "Create Task"}
          </Button>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}