"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MoreVertical, Paperclip, Smile, Send, Phone, Video, X, ArrowLeft, MessageSquareDashed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { TemplateSelector } from "@/components/template-selector"
import { toast } from "sonner"
import { useMessages } from "@/hooks/use-messages"

interface ChatWindowProps {
  contact: {
    id: string
    name: string
    phoneNumber: string
  }
  onBack?: () => void
  onProfileClick?: () => void
}

const API_BASE_URL = "http://localhost:8080"

export function ChatWindow({ contact, onBack, onProfileClick }: ChatWindowProps) {
  const { messages, mutate, lastReceivedAt } = useMessages(contact.phoneNumber)
  // ... rest of component using contact.phoneNumber instead of phoneNumber
  const phoneNumber = contact.phoneNumber
  const contactName = contact.name
  const [isSending, setIsSending] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  
  // 24h Window Check
  const isWithin24hWindow = lastReceivedAt 
    ? (Date.now() - new Date(lastReceivedAt).getTime() < 24 * 60 * 60 * 1000)
    : false; // If no last message, assume not in window (or maybe true if new contact? usually false for business initiated)
    
  // If we have never received a message, we can't send loose messages (business initiated conversation requires template)
  // So consistent with "false" if lastReceivedAt is null.
  
  // Template State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [templateComponents, setTemplateComponents] = useState<any[] | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
    }
  }

  const handleSendImage = async () => {
    if (!pendingFile) return
    setIsSending(true)
    
    const formData = new FormData()
    formData.append("file", pendingFile)

    try {
      // Mock upload if not implemented, or use real route
      const uploadRes = await fetch(`${API_BASE_URL}/messages/upload`, { method: "POST", body: formData })
      if (!uploadRes.ok) throw new Error("Upload failed")
      
      const { url } = await uploadRes.json()
      
      await handleSendMessage(url, "image")
      
      setPendingFile(null)
    } catch (error) {
      toast.error("Failed to send image")
    } finally {
      setIsSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = async (mediaUrl?: string, type: "text" | "image" | "template" = "text", extraData?: any) => {
    if ((!inputValue.trim() && !mediaUrl && type !== 'template') || isSending) return

    setIsSending(true)
    const currentText = inputValue
    setInputValue("")

    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            to: phoneNumber, 
            text: type === 'template' ? JSON.stringify(extraData) : currentText, 
            type, 
            mediaUrl 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send")
      }

      await mutate()
    } catch (error: any) {
      console.error("Send error:", error)
      toast.error(`Failed to send: ${error.message}`)
      setInputValue(currentText)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendTemplate = async () => {
    if (!selectedTemplateName || selectedTemplateName === "none") return

    setIsTemplateModalOpen(false)
    setIsSending(true)

    try {
        await handleSendMessage(undefined, "template", {
            name: selectedTemplateName,
            language: { code: "en_US" },
            components: templateComponents
        })
        await mutate()
        toast.success("Template sent")
    } catch (e) {
        console.error("Failed to send template", e)
        toast.error("Failed to send template")
    } finally {
        setIsSending(false)
        setSelectedTemplateName(null)
        setTemplateComponents(null)
    }
  }

  // Render Preview Overlay
  if (pendingFile) {
    return (
      <div className="flex h-full flex-col bg-[#0b141a]">
        <div className="p-3 bg-muted/50 flex items-center gap-4 text-white">
          <Button variant="ghost" size="icon" onClick={() => { setPendingFile(null); setInputValue(""); }}>
             <X className="h-6 w-6 text-white" /> 
          </Button>
          <span className="font-semibold text-lg">Preview</span>
          <div className="flex-1" />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8 bg-black/90 relative min-h-0 overflow-hidden">
           <Button 
             variant="ghost" 
             className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
             onClick={() => { setPendingFile(null); setInputValue(""); }}
            >
             Cancel
           </Button>
           <img 
             src={URL.createObjectURL(pendingFile)} 
             alt="Preview" 
             className="max-h-full max-w-full object-contain" 
           />
        </div>

        <div className="p-3 bg-muted/50 border-t border-border flex items-center gap-2">
            <Input
              placeholder="Add a caption..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendImage()}
              className="flex-1 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/50 py-5"
              autoFocus
            />
            <Button 
              size="icon" 
              onClick={handleSendImage} 
              disabled={isSending}
              className="bg-[#008069] hover:bg-[#006e5a] rounded-full shrink-0 h-10 w-10"
            >
              <Send className="h-5 w-5" />
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0b141a]/50">
      <div className="p-3 flex items-center justify-between bg-muted/50 border-b border-border z-10">
        <div className="flex items-center cursor-pointer" onClick={onProfileClick}>
          <Avatar className="h-10 w-10 mr-3 border border-border">
            <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${contactName}`} />
            <AvatarFallback>{contactName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium leading-none">{contactName}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">{phoneNumber}</p>
          </div>
        </div>
        {/* Debug 24h window */}
        {/* <div className="text-[10px] text-muted-foreground">
             Last msg: {lastReceivedAt ? new Date(lastReceivedAt).toLocaleString() : 'Never'}
        </div> */}
        <div className="flex items-center gap-2">
          <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block" />
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e71a7a313f1d23b9b40d37bcd.png')] bg-repeat"
      >
        {messages.map((msg: any) => (
          <MessageBubble 
            key={msg.id} 
            message={msg.body || msg.text} // Handle different field names
            time={new Date(msg.timestamp || msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
            isSender={msg.isSender || msg.from !== phoneNumber} // Approx
            status={msg.status}
            type={msg.type || "text"}
            mediaUrl={msg.mediaUrl}
            caption={msg.type === "image" ? msg.body : undefined}
          />
        ))}
        {/* 24h Window Warning in Chat */}
        {!isWithin24hWindow && (
            <div className="flex justify-center my-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-md text-xs text-center max-w-sm">
                    The 24-hour window has expired. You can only send templates until the user responds.
                </div>
            </div>
        )}
      </div>

      <div className="p-3 bg-muted/50 border-t border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Smile className="h-5 w-5" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground" 
            onClick={() => fileInputRef.current?.click()}
            disabled={!isWithin24hWindow}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        {/* Template Button - ALWAYS ENABLED */}
        <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MessageSquareDashed className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0b141a] text-foreground border-border">
              <DialogHeader>
                <DialogTitle>Send Template</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <TemplateSelector 
                    onSelect={(name, params) => {
                        setSelectedTemplateName(name)
                        setTemplateComponents(params)
                    }} 
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSendTemplate} className="bg-primary hover:bg-primary/90">
                  Send
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        <Input
          placeholder={isWithin24hWindow ? "Type a message" : "Session expired. Send a template."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(undefined, "text")}
          className="flex-1 bg-background border-none focus-visible:ring-1 focus-visible:ring-primary/50 py-5"
          disabled={!isWithin24hWindow}
        />
        <Button
          size="icon"
          onClick={() => handleSendMessage(undefined, "text")}
          className="bg-primary hover:bg-primary/90 rounded-full shrink-0"
          disabled={!isWithin24hWindow}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
