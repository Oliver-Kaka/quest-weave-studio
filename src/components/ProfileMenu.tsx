import { useState } from "react";
import { User, Settings, LogOut, Trash2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProfileMenu = () => {
  const [theme, setTheme] = useState<"light" | "earth" | "dark">("light");
  const { user, signOut, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleThemeChange = (newTheme: "light" | "earth" | "dark") => {
    setTheme(newTheme);
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-earth", "dark");
    
    // Add the appropriate theme class
    if (newTheme === "earth") {
      root.classList.add("theme-earth");
    } else if (newTheme === "dark") {
      root.classList.add("dark");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate("/auth")} variant="outline">
          Sign In
        </Button>
        <Button onClick={() => navigate("/auth")} variant="default">
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="w-10 h-10 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-scale-in">
        {isStudent && (
          <DropdownMenuItem onClick={() => navigate("/student")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Student Dashboard</span>
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        {(isStudent || isAdmin) && <DropdownMenuSeparator />}
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Change Details</span>
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <Palette className="mr-2 h-4 w-4" />
            <span>Change Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="animate-scale-in">
            <DropdownMenuItem 
              onClick={() => handleThemeChange("light")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-gray-300" />
                <span>Light Mode</span>
                {theme === "light" && <span className="ml-auto text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleThemeChange("earth")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#8B4513] border border-gray-300" />
                <span>Muted Earth</span>
                {theme === "earth" && <span className="ml-auto text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleThemeChange("dark")}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-900 border border-gray-700" />
                <span>Dark Mode</span>
                {theme === "dark" && <span className="ml-auto text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Account</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
