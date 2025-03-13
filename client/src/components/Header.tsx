import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const { data: user } = useQuery({ 
    queryKey: ['/api/user/profile'],
  });
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <i className="ri-tools-fill text-primary text-3xl mr-2"></i>
              <Link href="/">
                <span className="text-xl font-bold text-gray-800 cursor-pointer">SkillMatch</span>
              </Link>
            </div>
          </div>
          <nav className="flex space-x-6 items-center">
            <Link href="/job-matches">
              <a className={`text-sm font-medium ${location === '/job-matches' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                Find Jobs
              </a>
            </Link>
            <Link href="/portfolio">
              <a className={`text-sm font-medium ${location === '/portfolio' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                My Portfolio
              </a>
            </Link>
            <a href="#" className="text-sm font-medium text-gray-700 hover:text-primary">
              Applications
            </a>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src={user?.profileImage} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
