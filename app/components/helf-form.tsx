"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Package,
  UtensilsCrossed,
  ShoppingBag,
  Loader2,
  PenLine,
  FileText,
  ArrowLeft,
  AlertCircle,
  HandHelpingIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuthService } from "@/app/backend/auth.service";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TaskFormData {
  title: string;
  description: string;
  taskType: "Borrow" | "Meal Share" | "Errand" | "Support";
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
    setFormData((prev) => ({
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
        .from("tasks")
        .insert(taskData);

      if (insertError) throw insertError;

      // Redirect to help desk or tasks page
      router.push("/help-desk");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating task"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskTypeIcon = (type: TaskFormData["taskType"]) => {
    switch (type) {
      case "Borrow":
        return <Package className="h-4 w-4" />;
      case "Meal Share":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "Errand":
        return <ShoppingBag className="h-4 w-4" />;
      case "Support":
        return <HandHelpingIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* <div className="mb-6">
        <Link href="/help-desk" className="flex items-center text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Link>
      </div> */}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PenLine className="h-6 w-6" />
            Create a New Task
          </CardTitle>
          <CardDescription>
            Fill in the details to create a new help request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-base flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Description (Optional)
              </Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Provide task details"
                value={formData.description}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType" className="text-base">
                Task Type
              </Label>
              <Select
                name="taskType"
                value={formData.taskType}
                onValueChange={(value: TaskFormData["taskType"]) =>
                  setFormData((prev) => ({
                    ...prev,
                    taskType: value,
                  }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>

                <SelectContent className="backdrop-blur-lg bg-white/70 dark:bg-black/40 border border-border shadow-md rounded-md">
                  <SelectItem value="Borrow">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Borrow
                    </div>
                  </SelectItem>
                  <SelectItem value="Meal Share">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      Meal Share
                    </div>
                  </SelectItem>
                  <SelectItem value="Errand">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Errand
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base">Due Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: date,
                      }))
                    }
                    initialFocus
                    className="rounded-md border bg-gray-200/50 p-4 shadow-lg backdrop-blur-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base bg-black text-white hover:bg-black/80 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>Create Task</>
              )}
            </Button>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
