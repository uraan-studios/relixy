"use client"

import { useState, useEffect } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

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
            toast.error("Failed to add note")
        }
    } catch (e) {
        toast.error("Failed to add note")
    } finally {
        setIsSaving(false)
    }
  }

  return (
    <div className="h-full w-[350px] bg-[#111b21] border-l border-[#222e35] flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 h-[60px] bg-[#202c33] px-6">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] -ml-2">
            <X className="h-5 w-5" />
        </Button>
        <span className="text-[#e9edef] text-base font-medium">Contact info</span>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
            {/* Profile Section */}
            <div className="flex flex-col items-center py-6 bg-[#111b21] border-b border-[#222e35]">
                <Avatar className="h-24 w-24 mb-3 cursor-pointer">
                    <AvatarImage src={profilePic || `/placeholder.svg?height=160&width=160&query=${contact.name}`} />
                    <AvatarFallback className="text-2xl">{contact.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center px-4">
                    <h2 className="text-[#e9edef] text-lg font-medium mb-0.5">{contact.name}</h2>
                    <p className="text-[#8696a0] text-sm">{contact.phoneNumber}</p>
                </div>
            </div>

            {/* Notes Timeline */}
            <div className="flex-1 overflow-y-auto bg-[#0b141a] p-4 flex flex-col gap-4">
                 <h3 className="text-[#8696a0] text-xs font-bold uppercase tracking-wider mb-2">Notes Timeline</h3>
                 
                 {/* Input Area */}
                 <div className="bg-[#202c33] p-3 rounded-lg mb-4">
                    <Textarea 
                        value={newNote}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                        placeholder="Add a new note..."
                        className="bg-transparent border-none text-[#d1d7db] min-h-[60px] resize-none focus-visible:ring-0 p-0 mb-2 placeholder:text-[#8696a0]"
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
                            className="bg-[#00a884] hover:bg-[#008f6f] h-8 w-8 rounded-full"
                        >
                            <Send className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                 </div>

                 {/* Timeline List */}
                 {notesList.map((note) => (
                     <div key={note.id} className="flex gap-3 relative">
                         {/* Timeline Line */}
                         <div className="absolute top-0 left-[7px] w-[2px] h-full bg-[#202c33] -z-10" />
                         
                         <div className="w-4 h-4 rounded-full bg-[#00a884] shrink-0 mt-1 border-4 border-[#0b141a]" />
                         
                         <div className="flex-1 bg-[#202c33] p-3 rounded-lg rounded-tl-none text-sm text-[#e9edef] shadow-sm">
                             <p className="whitespace-pre-wrap mb-1">{note.content}</p>
                             <span className="text-[10px] text-[#8696a0] block text-right">
                                 {new Date(note.createdAt).toLocaleString()}
                             </span>
                         </div>
                     </div>
                 ))}
                 
                 {notesList.length === 0 && (
                     <div className="text-center text-[#8696a0] text-sm py-4 italic">
                         No notes yet. Start a timeline.
                     </div>
                 )}
            </div>
      </div>
    </div>
  )
}
