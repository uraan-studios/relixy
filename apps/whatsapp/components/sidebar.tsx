"use client"

import { useState } from "react"
import { Search, MoreVertical, MessageSquarePlus, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TemplateSelector } from "@/components/template-selector"
import useSWR from "swr"

interface Contact {
  id: string
  name: string
  phoneNumber: string
  lastMessage: string // Mapped from DB
  time: string // Mapped from DB
  unread: number // Mapped from DB
  lastMessageAt?: string
  unreadCount?: number
}

interface SidebarProps {
  onSelectContact: (contact: Contact) => void
  selectedContactId: string | null
  activeTab: string
}

const API_BASE_URL = "http://localhost:8080"
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Sidebar({ onSelectContact, selectedContactId, activeTab }: SidebarProps) {
  const { data: contactsData } = useSWR(`${API_BASE_URL}/messages/contacts`, fetcher, { refreshInterval: 5000 })
  const serverContacts = (contactsData || []).map((c: any) => ({
      id: c.id,
      name: c.name || c.id,
      phoneNumber: c.id,
      lastMessage: c.notes ? "📝 Note available" : "Message...", // Show note indicator if exists? Or just msg
      time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      unread: c.unreadCount || 0,
      isStarred: c.isStarred,
      notes: c.notes,
      profilePicUrl: c.profilePicUrl,
      about: c.about
  }))

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatName, setNewChatName] = useState("")
  const [newChatPhone, setNewChatPhone] = useState("")
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [templateComponents, setTemplateComponents] = useState<any[] | null>(null)

  const filteredContacts = serverContacts.filter(
    (contact: any) => {
      const matchesSearch = contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phoneNumber?.includes(searchQuery)
      if (activeTab === "starred") {
          return matchesSearch && contact.isStarred
      }
      if (activeTab === "archived") {
          // Placeholder for archived
          return false
      }
      return matchesSearch
    }
  )

  const handleCreateChat = async () => {
    if (!newChatName || !newChatPhone) return

    let lastMessage = "New chat started"

    if (selectedTemplateName && selectedTemplateName !== "none") {
      try {
        await fetch(`${API_BASE_URL}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: newChatPhone,
            type: "template",
            text: JSON.stringify({
                name: selectedTemplateName,
                language: { code: "en_US" },
                components: templateComponents
            })
          })
        })
        lastMessage = `Template: ${selectedTemplateName}`
      } catch (e) {
        console.error("Failed to send template", e)
        lastMessage = "Failed to send template"
      }
    }

    const newContact: Contact = {
      id: newChatPhone,
      name: newChatName,
      phoneNumber: newChatPhone,
      lastMessage: lastMessage,
      time: "Just now",
      unread: 0,
    }

    onSelectContact(newContact)
    setIsNewChatOpen(false)
    setNewChatName("")
    setNewChatPhone("")
    setSelectedTemplateName(null)
    setTemplateComponents(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-3 flex items-center justify-between bg-muted/50 border-b border-border">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1">
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0b141a] text-foreground border-border">
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="col-span-3 bg-muted border-none"
                    placeholder="Contact Name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    className="col-span-3 bg-muted border-none"
                    placeholder="e.g. 15551234567"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Template
                  </Label>
                  <div className="col-span-3">
                    <TemplateSelector 
                        onSelect={(name, params) => {
                            setSelectedTemplateName(name)
                            setTemplateComponents(params)
                        }} 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateChat} className="bg-primary hover:bg-primary/90">
                  Create Chat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings moved to NavRail */}

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-border">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchQuery ? "text-primary" : "text-muted-foreground"}`}
            />
            <Input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact: Contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`flex items-center p-3 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/50 ${
                selectedContactId === contact.id ? "bg-muted" : ""
              }`}
            >
              <Avatar className="h-12 w-12 mr-3 border border-border">
                <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${contact.name}`} />
                <AvatarFallback>{contact.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-medium truncate text-sm">{contact.name}</span>
                  <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate mr-2">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No chats found</p>
          </div>
        )}
      </div>
    </div>
  )
}
