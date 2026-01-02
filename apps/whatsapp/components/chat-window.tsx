"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MoreVertical, Paperclip, Smile, Send, X, MessageSquareDashed, Phone, Video } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/message-bubble"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { TemplateSelector } from "@/components/template-selector"
import { toast } from "sonner"
import { useMessages } from "@/hooks/use-messages"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  contact: {
    id: string
    name: string
    phoneNumber: string
  }
  onBack?: () => void
  onProfileClick?: () => void
}

export function ChatWindow({ contact, onBack, onProfileClick }: ChatWindowProps) {
  const { messages, mutate, lastReceivedAt, sendMessage: wsSendMessage } = useMessages(contact.phoneNumber)
  
  const phoneNumber = contact.phoneNumber
  const contactName = contact.name
  const [isSending, setIsSending] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  
  const isWithin24hWindow = lastReceivedAt 
    ? (Date.now() - new Date(lastReceivedAt).getTime() < 24 * 60 * 60 * 1000)
    : true; // DEFAULT TO TRUE FOR UI VISIBILITY to prevent "vanished" look. Handle error on send if needed.
    
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
      const uploadRes = await fetch(`http://localhost:8080/messages/upload`, { method: "POST", body: formData })
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
      await wsSendMessage({ 
          to: phoneNumber, 
          text: type === 'template' ? JSON.stringify(extraData) : currentText, 
          type, 
          mediaUrl 
      })
    } catch (error: any) {
      console.error("Send error:", error)
      toast.error(`Error: ${error.message}`)
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

  if (pendingFile) {
     return (
        <div className="flex h-full flex-col bg-background z-50 absolute inset-0 animate-in fade-in zoom-in-95 duration-200">
           <div className="p-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
               <span className="font-medium text-lg">Preview</span>
               <Button variant="ghost" size="icon" onClick={() => setPendingFile(null)}>
                   <X className="h-6 w-6" />
               </Button>
           </div>
           <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
               <img src={URL.createObjectURL(pendingFile)} className="max-h-[80vh] rounded-lg shadow-2xl" />
           </div>
           <div className="p-4 flex gap-2 justify-center bg-background/80 backdrop-blur-md">
                <Button size="lg" onClick={handleSendImage} disabled={isSending} className="w-full max-w-sm bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/20">
                    Send Image
                </Button>
           </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full bg-background relative selection:bg-primary/30">
        
      {/* Premium Glass Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onProfileClick}>
          <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${contactName}`} />
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground font-bold text-lg">{contactName?.[0]}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green border-2 border-background rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold leading-none tracking-tight text-foreground">{contactName}</h3>
            <p className="text-xs text-primary/80 font-medium mt-1 tracking-wide">{phoneNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/20 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/20 text-muted-foreground hover:text-primary transition-colors">
                <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/20 text-muted-foreground hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/20 text-muted-foreground hover:text-primary transition-colors">
                <MoreVertical className="h-5 w-5" />
            </Button>
        </div>
      </div>

      {/* Messages Area - Isolated Scroll Container */}
      <div className="flex-1 relative min-h-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          <div 
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto p-4 space-y-6 custom-scrollbar"
          >
            {messages.map((msg: any) => (
              <MessageBubble 
                key={msg.id} 
                message={msg.body || msg.text} 
                time={new Date(msg.timestamp || msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                isSender={msg.isSender || msg.from !== phoneNumber}
                status={msg.status}
                type={msg.type || "text"}
                mediaUrl={msg.mediaUrl}
                caption={msg.type === "image" ? msg.body : undefined}
              />
            ))}
             {!isWithin24hWindow && (
                <p className="text-center text-xs text-yellow-500/80 mt-6 font-medium mb-2">
                    Note: 24h window might be expired. Delivery not guaranteed unless using Templates.
                </p>
            )}
            <div className="h-4" />
          </div>
      </div>

      {/* Modern Fixed Input Area - Flex Footer */}
      <div className="flex-none w-full bg-background/80 backdrop-blur-xl border-t border-border z-30 p-4 relative">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-secondary p-2 rounded-3xl border border-border shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
            
            <div className="flex gap-1 pl-1">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-accent/50">
                    <Smile className="h-6 w-6" />
                </Button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-accent/50" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                 <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-accent/50">
                             <MessageSquareDashed className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader><DialogTitle>Send Template</DialogTitle></DialogHeader>
                      <div className="py-4"><TemplateSelector onSelect={(name, params) => { setSelectedTemplateName(name); setTemplateComponents(params) }} /></div>
                      <DialogFooter><Button onClick={handleSendTemplate}>Send</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(undefined, "text")}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 py-3 h-auto max-h-32 min-h-[44px] text-base placeholder:text-muted-foreground/50"
              autoComplete="off"
            />
            
            <Button
              size="icon"
              onClick={() => handleSendMessage(undefined, "text")}
              className={cn(
                  "h-11 w-11 rounded-full shrink-0 transition-all duration-300 mr-1 shadow-lg",
                  inputValue.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100 rotate-0" 
                    : "bg-muted text-muted-foreground scale-90 rotate-12 opacity-50"
              )}
              disabled={!inputValue.trim()}
            >
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
        </div>
      </div>
    </div>
  )
}
