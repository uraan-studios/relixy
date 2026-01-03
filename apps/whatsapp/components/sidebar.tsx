"use client"

import { useState } from "react"
import { Search, MessageSquarePlus, Settings, Phone, User, Archive, Star, Sun, Moon, Check, CheckCheck, Bot, Filter, MoreVertical } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TemplateSelector } from "@/components/template-selector"
import { LabelManager } from "@/components/label-manager"
import { SettingsDialog } from "@/components/settings-dialog"
import { useContacts } from "@/hooks/use-contacts"
import { cn } from "@/lib/utils"

interface Contact {
  id: string
  name: string
  phoneNumber: string
  lastMessage: string 
  time: string
  unread: number
  lastMessageAt?: string
  unreadCount?: number
  isStarred?: boolean
  lastMessageStatus?: "sent" | "delivered" | "read"
  isLastMessageMine?: boolean
  labels?: { id: string, name: string, color: string }[]
}

interface SidebarProps {
  onSelectContact: (contact: Contact) => void
  selectedContactId: string | null
  activeTab: string
  onTabChange: (tab: string) => void
}

const ContactItem = ({ contact, onSelect, isSelected }: { contact: Contact, onSelect: () => void, isSelected: boolean }) => (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center p-3 mx-2 mb-1 cursor-pointer rounded-xl transition-all duration-300 border border-transparent animate-fade-in",
        isSelected 
            ? "bg-primary/10 border-primary/20 shadow-md backdrop-blur-sm" 
            : "hover:bg-sidebar-accent/50 hover:border-sidebar-border/30 hover:shadow-sm"
      )}
    >
      <div className="relative">
          <Avatar className={cn("h-12 w-12 mr-4 border-2 transition-all duration-300", isSelected ? "border-primary" : "border-transparent group-hover:border-border")}>
            <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${contact.name}`} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold text-sm">
                {contact.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {contact.unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg ring-2 ring-background animate-pulse">
                {contact.unread}
            </span>
          )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <span className={cn(
              "font-semibold truncate text-[15px] transition-colors", 
              isSelected ? "text-primary" : "text-foreground group-hover:text-foreground"
          )}>
              {contact.name}
          </span>
          <span className={cn("text-[11px] font-medium tracking-tight", isSelected ? "text-primary/70" : "text-muted-foreground/60")}>
              {contact.time}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn("text-xs truncate mr-2 font-normal line-clamp-1 flex items-center gap-1.5", isSelected ? "text-foreground/80" : "text-muted-foreground")}>
              {contact.isLastMessageMine && (
                  <span className={cn(
                      "flex items-center transition-colors",
                      contact.lastMessageStatus === "read" ? "text-blue-500" : "text-muted-foreground/70"
                  )}>
                      {contact.lastMessageStatus === "read" || contact.lastMessageStatus === "delivered" ? (
                          <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                          <Check className="h-3.5 w-3.5" />
                      )}
                  </span>
              )}
              {contact.lastMessage}
          </p>
           <div className="flex gap-1.5 items-center">
              {contact.labels?.slice(0, 3).map((l: any) => (
                  <div key={l.id} className="w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm" style={{ backgroundColor: l.color }} title={l.name} />
              ))}
          </div>
        </div>
      </div>
      
      {/* Active Indicator */}
      {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
      )}
    </div>
)

export function Sidebar({ onSelectContact, selectedContactId, activeTab, onTabChange }: SidebarProps) {
  const { contacts: contactsData } = useContacts()
  const serverContacts = (contactsData || []).map((c: any) => ({
      id: c.id,
      name: c.name || c.id,
      phoneNumber: c.id,
      lastMessage: c.lastMessage?.body || c.lastMessage?.text || (c.notes ? "📝 Note available" : "Start a conversation"), 
      time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      unread: c.unreadCount || 0,
      isStarred: c.isStarred,
      notes: c.notes,
      profilePicUrl: c.profilePicUrl,
      about: c.about,
      lastMessageStatus: c.lastMessage?.status,
      isLastMessageMine: c.lastMessage?.from === "me" || c.lastMessage?.isSender,
      labels: c.labels
  }))

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [newChatPhone, setNewChatPhone] = useState("")
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [templateComponents, setTemplateComponents] = useState<any[] | null>(null)
  const { theme, setTheme } = useTheme()

  const filteredContacts = serverContacts.filter(
    (contact: any) => {
      const matchesSearch = contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phoneNumber?.includes(searchQuery)
      if (activeTab === "starred") return matchesSearch && contact.isStarred
      if (activeTab === "archived") return false 
      if (activeTab === "agent") return false
      return matchesSearch
    }
  )

  const handleCreateChat = async () => {
    if (!newChatName || !newChatPhone) return
    let lastMessage = "New chat started"
    if (selectedTemplateName && selectedTemplateName !== "none") {
        try {
            await fetch(`http://localhost:8080/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: newChatPhone,
                    type: "template",
                    text: JSON.stringify({ name: selectedTemplateName, language: { code: "en_US" }, components: templateComponents })
                })
            })
            lastMessage = `Template: ${selectedTemplateName}`
        } catch (e) {
            console.error("Failed to send template", e)
            lastMessage = "Failed to send template"
        }
    }
    const newContact: Contact = {
        id: newChatPhone, name: newChatName, phoneNumber: newChatPhone,
        lastMessage: lastMessage, time: "Just now", unread: 0,
    }
    onSelectContact(newContact)
    setIsNewChatOpen(false)
    setNewChatName("")
    setNewChatPhone("")
    setSelectedTemplateName(null)
    setTemplateComponents(null)
  }

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "relative transition-all duration-300 rounded-xl hover:bg-primary/10 hover:text-primary", 
            activeTab === id ? "bg-primary/15 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "text-muted-foreground"
        )}
        onClick={() => onTabChange(id)}
        title={label}
      >
          <Icon className={cn("h-5 w-5 transition-transform", activeTab === id && "scale-110")} />
          {activeTab === id && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />}
      </Button>
  )

  return (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-border/40">
      {/* Header Section */}
      <div className="px-4 py-5 flex flex-col gap-6">
          {/* User & Nav Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors hover:shadow-lg hover:shadow-primary/20">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-700 text-white font-bold text-xs">ME</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 ml-2 glass-card rounded-xl">
                      <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                         {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                         Toggle Theme
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                          <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                 </DropdownMenu>

                 <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

                 {/* Navigation Pills */}
                 <div className="flex gap-1 bg-secondary/50 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
                     <NavItem id="chats" icon={MessageSquarePlus} label="Chats" />
                     <NavItem id="status" icon={Phone} label="Calls" />
                     <NavItem id="starred" icon={Star} label="Starred" />
                     <NavItem id="agent" icon={Bot} label="Agent" />
                </div>
            </div>
          </div>
          
           {/* Search & Actions */}
          <div className="flex gap-2 items-center">
              <div className="relative flex-1 group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input
                   placeholder="Search conversations..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10 h-10 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/30 focus:shadow-[0_0_15px_rgba(var(--primary),0.1)] rounded-xl transition-all"
                 />
              </div>
              
              {/* New Chat Button */}
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                    <Button 
                        size="icon" 
                        className="h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all"
                    >
                        <MessageSquarePlus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-card sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-5 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={newChatName} onChange={(e) => setNewChatName(e.target.value)} className="col-span-3 rounded-lg" placeholder="Contact Name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" value={newChatPhone} onChange={(e) => setNewChatPhone(e.target.value)} className="col-span-3 rounded-lg" placeholder="e.g. 15551234567" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Template</Label>
                      <div className="col-span-3">
                        <TemplateSelector onSelect={(name, params) => { setSelectedTemplateName(name); setTemplateComponents(params) }} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateChat} className="w-full rounded-lg bg-primary hover:bg-primary/90">Start Chat</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
      </div>

      {/* Sub Header / Filters */}
      <div className="px-6 pb-2 flex justify-between items-center text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase">
          <span>{activeTab === 'chats' ? 'Recent Chats' : activeTab}</span>
          <div className="flex gap-2">
             <LabelManager />
             <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-secondary">
                 <Filter className="h-3 w-3" />
             </Button>
          </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar px-2 pb-4">
        {filteredContacts.length > 0 ? (
           filteredContacts.map((contact: Contact) => (
               <ContactItem 
                    key={contact.id} 
                    contact={contact} 
                    onSelect={() => onSelectContact(contact)} 
                    isSelected={selectedContactId === contact.id} 
                />
           ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground animate-fade-in">
             <div className="bg-secondary/50 p-4 rounded-full mb-3">
                 <User className="h-8 w-8 opacity-50" />
             </div>
             <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
