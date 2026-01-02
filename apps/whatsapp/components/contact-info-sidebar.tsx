"use client"

import { useState, useEffect } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ContactInfoSidebarProps {
  contact: any
  onClose: () => void
}

const API_BASE_URL = "http://localhost:8080"

export function ContactInfoSidebar({ contact, onClose }: ContactInfoSidebarProps) {
  const [profilePic, setProfilePic] = useState(contact.profilePicUrl)
  const [notesList, setNotesList] = useState<any[]>([])
  const [newNote, setNewNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Sync internal state if contact prop changes
  useEffect(() => {
    setProfilePic(contact.profilePicUrl)
    
    const fetchNotes = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${contact.id}/notes`)
            if (res.ok) setNotesList(await res.json())
        } catch (e) { console.error("Notes fetch failed", e) }
    }

    // Sync Profile (Background)
    fetch(`${API_BASE_URL}/contacts/${contact.id}/profile`)
        .then(res => res.json())
        .then(updated => {
            if (updated.profilePicUrl) setProfilePic(updated.profilePicUrl)
        })
        .catch(console.error)

    if (contact.id) fetchNotes()
  }, [contact])

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSaving(true)
    try {
        const res = await fetch(`${API_BASE_URL}/contacts/${contact.id}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newNote })
        })
        
        if (res.ok) {
            const savedNote = await res.json()
            setNotesList([savedNote, ...notesList])
            setNewNote("")
            toast.success("Note added")
        } else {
            toast.error("Failed to add note", { description: "API Response was not ok" })
        }
    } catch (e) {
        toast.error("Failed to add note", { description: "Check console for details" })
    } finally {
        setIsSaving(false)
    }
  }

  return (
    <div className="h-full w-[350px] bg-sidebar border-l border-border flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 h-[60px] bg-muted/20 px-6 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground -ml-2">
            <X className="h-5 w-5" />
        </Button>
        <span className="text-foreground text-base font-medium">Contact info</span>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
            {/* Profile Section */}
            <div className="flex flex-col items-center py-8 bg-sidebar border-b border-border">
                <Avatar className="h-28 w-28 mb-4 cursor-pointer ring-4 ring-muted shadow-xl">
                    <AvatarImage src={profilePic || `/placeholder.svg?height=160&width=160&query=${contact.name}`} />
                    <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">{contact.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center px-4">
                    <h2 className="text-foreground text-xl font-semibold mb-1">{contact.name}</h2>
                    <p className="text-muted-foreground text-sm font-mono">{contact.phoneNumber}</p>
                </div>
            </div>

            {/* Notes Timeline */}
            <div className="flex-1 overflow-y-auto bg-background/50 p-4 flex flex-col gap-4">
                 <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 px-1">Notes Timeline</h3>
                 
                 {/* Input Area */}
                 <div className="bg-card p-3 rounded-xl border border-border shadow-sm mb-4 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <Textarea 
                        value={newNote}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        className="bg-transparent border-none text-foreground min-h-[60px] resize-none focus-visible:ring-0 p-0 mb-2 placeholder:text-muted-foreground/70"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddNote();
                            }
                        }}
                    />
                    <div className="flex justify-end">
                        <Button 
                            size="icon" 
                            disabled={isSaving || !newNote.trim()}
                            onClick={handleAddNote}
                            className={cn(
                                "h-8 w-8 rounded-full transition-all", 
                                newNote.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"
                            )}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>

                 {/* Timeline List */}
                 {notesList.map((note) => (
                     <div key={note.id} className="flex gap-3 relative group">
                         {/* Timeline Line */}
                         <div className="absolute top-0 left-[7px] w-[2px] h-full bg-border -z-10" />
                         
                         <div className="w-4 h-4 rounded-full bg-primary shrink-0 mt-3 border-4 border-background shadow-sm z-10" />
                         
                         <div className="flex-1 bg-card p-3 rounded-lg rounded-tl-none text-sm text-card-foreground shadow-sm border border-border/50 group-hover:border-primary/20 transition-colors">
                             <p className="whitespace-pre-wrap mb-1">{note.content}</p>
                             <span className="text-[10px] text-muted-foreground block text-right font-medium">
                                 {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                         </div>
                     </div>
                 ))}
                 
                 {notesList.length === 0 && (
                     <div className="text-center text-muted-foreground text-sm py-8 italic opacity-50">
                         No notes yet. Start a timeline.
                     </div>
                 )}
            </div>
      </div>
    </div>
  )
}
