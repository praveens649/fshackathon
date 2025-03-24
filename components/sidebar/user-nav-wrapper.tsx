
import { UserNav } from "./user-nav";
import {
  Avatar,
  AvatarFallback,
} from "../ui/avatar";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";


function ErrorAvatar({ message }: { message: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8 bg-red-100">
              <AvatarFallback className="text-red-600">
                <AlertCircle className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export async function UserNavWrapper() {
  try {
 
    return <UserNav  />;
  } catch (error) {
    console.error('Error loading user data:', error);
    return (
      <ErrorAvatar message="Failed to load user data" />
    );
  }
}
