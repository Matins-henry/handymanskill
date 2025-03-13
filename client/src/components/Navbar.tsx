import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Wrench, Bell, Menu, User, LogOut, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Wrench className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-800">SkillMatch</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}>
                Home
              </Link>
              <Link href="/#job-search" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Jobs
              </Link>
              <Link href="/#portfolio" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Portfolio
              </Link>
              <Link href="/profile" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive('/profile') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}>
                Profile
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="sr-only">Notifications</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || ''} alt={user.username} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    await apiRequest('POST', '/api/auth/logout', {});
                    window.location.href = '/';
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/profile">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-3 mt-6">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    isActive('/') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    Home
                  </Link>
                  <Link href="/#job-search" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-base font-medium rounded-md">
                    Jobs
                  </Link>
                  <Link href="/#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-base font-medium rounded-md">
                    Portfolio
                  </Link>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    isActive('/profile') ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    Profile
                  </Link>
                </div>
                
                {user && (
                  <div className="pt-4 pb-3 border-t border-gray-200 mt-6">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <Avatar>
                          <AvatarImage src={user.avatar || ''} alt={user.username} />
                          <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{user.username}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={async () => {
                          await apiRequest('POST', '/api/auth/logout', {});
                          window.location.href = '/';
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
