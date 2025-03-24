"use client"

import { AuthService } from "@/app/backend/auth.service"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "../ui/logout-button";
 


export function UserNav() {
  const authService = new AuthService();
  const email = authService.getCurrentUserEmail();

  if (!email) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar>
            <AvatarFallback>
              {email?.[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 cursor-pointer p-0">
          <LogoutButton showIcon className="justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>  );
}
