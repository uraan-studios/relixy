"use client"

import { useState } from "react"
import { Search, MessageSquarePlus, Settings, Phone, User, Archive, Star, Sun, Moon, Check, CheckCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TemplateSelector } from "@/components/template-selector"
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
}

interface SidebarProps {
  onSelectContact: (contact: Contact) => void
  selectedContactId: string | null
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ onSelectContact, selectedContactId, activeTab, onTabChange }: SidebarProps) {
  const { contacts: contactsData } = useContacts()
  const serverContacts = (contactsData || []).map((c: any) => ({
      id: c.id,
      name: c.name || c.id,
      phoneNumber: c.id,
      lastMessage: c.lastMessage?.body || c.lastMessage?.text || (c.notes ? "📝 Note available" : "Message..."), 
      time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      unread: c.unreadCount || 0,
      isStarred: c.isStarred,
      notes: c.notes,
      profilePicUrl: c.profilePicUrl,
      about: c.about,
      lastMessageStatus: c.lastMessage?.status,
      isLastMessageMine: c.lastMessage?.from === "me" || c.lastMessage?.isSender // Adjust based on actual API
  }))

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [newChatPhone, setNewChatPhone] = useState("")
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [templateComponents, setTemplateComponents] = useState<any[] | null>(null)
  const { theme, setTheme } = useTheme()

  const filteredContacts = serverContacts.filter(
    (contact: any) => {
      const matchesSearch = contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phoneNumber?.includes(searchQuery)
      if (activeTab === "starred") return matchesSearch && contact.isStarred
      if (activeTab === "archived") return false // Placeholder
      return matchesSearch
    }
  )

  const handleCreateChat = async () => {
    // ... logic remains same ...
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
        className={cn("text-muted-foreground hover:bg-accent hover:text-accent-foreground", activeTab === id && "bg-accent text-primary")}
        onClick={() => onTabChange(id)}
        title={label}
      >
          <Icon className="h-5 w-5" />
      </Button>
  )

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header with Navigation Integration */}
      <div className="p-3 pb-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <Avatar className="h-9 w-9 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">ME</AvatarFallback>
                </Avatar>
                <div className="flex gap-1">
                     <NavItem id="chats" icon={MessageSquarePlus} label="Chats" />
                     <NavItem id="status" icon={Phone} label="Calls" />
                     <NavItem id="starred" icon={Star} label="Starred" />
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    title="Toggle Theme"
                >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <NavItem id="settings" icon={Settings} label="Settings" />
             </div>
          </div>
          
           {/* Search Bar */}
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9 h-9 bg-sidebar-accent border-sidebar-border focus-visible:ring-1 focus-visible:ring-primary/50 text-sm"
             />
          </div>
      </div>

       {/* New Chat Dialog Trigger (Hidden or integrated differently usually, reusing state) */}
       {/* To keep functionality, we can add a persistent FAB or header button. 
           Re-adding the distinct 'New Chat' button below search for clarity if needed, 
           or keeping it in header (replaced by NavItem 'Chats' logic? No, let's add a clear action) */}
       
       <div className="px-3 pt-2 pb-2 flex justify-between items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
           <span>{activeTab === 'chats' ? 'Recent Chats' : activeTab}</span>
           
           <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-transparent hover:text-primary">
                        <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input id="name" value={newChatName} onChange={(e) => setNewChatName(e.target.value)} className="col-span-3" placeholder="Contact Name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input id="phone" value={newChatPhone} onChange={(e) => setNewChatPhone(e.target.value)} className="col-span-3" placeholder="e.g. 15551234567" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Template</Label>
                      <div className="col-span-3">
                        <TemplateSelector onSelect={(name, params) => { setSelectedTemplateName(name); setTemplateComponents(params) }} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateChat} className="bg-primary text-primary-foreground hover:bg-primary/90">Create Chat</Button>
                  </DialogFooter>
                </DialogContent>
           </Dialog>
       </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact: Contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={cn(
                "group flex items-center p-2.5 cursor-pointer rounded-lg transition-all duration-200 border border-transparent",
                selectedContactId === contact.id 
                    ? "bg-sidebar-accent border-sidebar-border shadow-sm" 
                    : "hover:bg-sidebar-accent/50 hover:border-sidebar-border/50"
              )}
            >
              <Avatar className="h-10 w-10 mr-3 border border-border/50">
                <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${contact.name}`} />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">{contact.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("font-medium truncate text-sm", selectedContactId === contact.id ? "text-foreground" : "text-foreground/90")}>
                      {contact.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate mr-2 font-normal line-clamp-1 flex items-center gap-1">
                      {contact.isLastMessageMine && (
                          <span className={cn(
                              "flex items-center",
                              contact.lastMessageStatus === "read" ? "text-blue-400" : "text-muted-foreground"
                          )}>
                              {contact.lastMessageStatus === "read" || contact.lastMessageStatus === "delivered" ? (
                                  <CheckCheck className="h-3 w-3" />
                              ) : (
                                  <Check className="h-3 w-3" />
                              )}
                          </span>
                      )}
                      {contact.lastMessage}
                  </p>
                  {contact.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 text-center text-muted-foreground p-4">
            <Search className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs opacity-60 mt-1">Start a new conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}
// NEW FILE: apps/whatsapp/hooks/use-contacts.ts
