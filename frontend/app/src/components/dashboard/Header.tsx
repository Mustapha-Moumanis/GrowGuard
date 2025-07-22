import { LogOut, ChevronDown, UserPen } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "../theme-toggle"
import { NotificationBell } from "../notifications/notification-bell"
import { useAuth } from "@/hooks/use-auth"

export function Header({setShowProfile,}: {setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;}) {
    const { user, logout } = useAuth()


  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }
    
    return (
        <header className="bg-card border-b px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">

                <div className="flex flex-row items-center gap-3">
                <img src="/agri-icon.png" alt="Logo" className="w-10 h-10 rounded-full" />
                <h1 className="font-semibold text-foreground">CropAlert</h1>
                </div>
                <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationBell />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        className="flex items-center gap-3 h-10 pl-2 pr-0 py-2 hover:bg-accent focus:bg-accent transition-colors rounded-lg"
                    >
                        <Avatar className="h-8 w-8">
                        <AvatarImage 
                            src={user?.avatar} 
                            alt={user?.username || 'User avatar'} 
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                        </Avatar>
                        
                        <div className="hidden sm:flex flex-col items-start min-w-0">
                        <span className="text-sm font-medium truncate max-w-[120px]">
                            {user?.username || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {user?.role || 'No role'}
                        </span>
                        </div>

                        <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer rounded-lg hidden sm:block" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal sm:hidden">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.role || 'No role assigned'}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator className="sm:hidden" />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                        <UserPen className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        </DropdownMenuItem>
{/*                         
                        
                        <DropdownMenuItem className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Team</span>
                        </DropdownMenuItem> */}
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
        </header>
    )
}