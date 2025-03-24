"use client"


import { Button, type ButtonProps  } from "./button";
import { LogOut } from "lucide-react";
// import { toast } from "sonner";
import { cn } from "@/lib/utils";



interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({ 
  showIcon = false, 
  className,
  ...props 
}: LogoutButtonProps) {
  

  const handleLogout = async () => {
    // const authservice = AuthService();
    // await authService.logout();
    // toast.success("Logged out successfully");
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn(className, "w-full")}
      {...props}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      <span>Log out</span>
    </Button>
  );
}