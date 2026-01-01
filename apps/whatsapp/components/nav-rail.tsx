"use client"

import { MessageSquare, Phone, Disc, Star, Archive, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavRailProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function NavRail({ activeTab, onTabChange }: NavRailProps) {
  const topIcons = [
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "status", icon: Disc, label: "Status" },
  ]

  const bottomIcons = [
    { id: "starred", icon: Star, label: "Starred" },
    { id: "archived", icon: Archive, label: "Archived" },
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "profile", icon: User, label: "Profile", isProfile: true }, 
  ]

  const NavItem = ({ item, isBottom = false }: { item: any, isBottom?: boolean }) => {
    const isActive = activeTab === item.id
    return (
      <button
        onClick={() => onTabChange(item.id)}
        className={cn(
          "w-full h-[40px] flex items-center justify-center relative group my-1",
          isActive && "text-primary" // Highlight active icon
        )}
        title={item.label}
      >
        {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] bg-primary rounded-r-sm" />
        )}
        
        {item.isProfile ? (
             <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="/placeholder.svg?height=24&width=24" alt="Me" />
                <AvatarFallback className="text-[10px]">ME</AvatarFallback>
            </Avatar>
        ) : (
             <item.icon 
                className={cn(
                    "h-5 w-5 transition-colors", 
                    isActive ? "text-primary fill-primary/20" : "text-muted-foreground group-hover:text-foreground"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
            />
        )}
      </button>
    )
  }

  return (
    <div className="w-[60px] h-full flex flex-col justify-between items-center bg-[#111b21] py-3 border-r border-[#222e35]">
      <div className="flex flex-col w-full items-center gap-2">
        {topIcons.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </div>
      <div className="flex flex-col w-full items-center gap-2">
         {bottomIcons.map((item) => (
          <NavItem key={item.id} item={item} isBottom />
        ))}
      </div>
    </div>
  )
}
