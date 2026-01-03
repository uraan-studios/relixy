"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MoreVertical, Paperclip, Smile, Send, X, MessageSquareDashed, Phone, Video, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ContactLabelSelector } from "@/components/contact-label-selector"
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
  const { messages, mutate, lastReceivedAt, sendMessage: wsSendMessage, markRead } = useMessages(contact.phoneNumber)
  
  const phoneNumber = contact.phoneNumber
  const contactName = contact.name
  const [isSending, setIsSending] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  
  const isWithin24hWindow = lastReceivedAt 
    ? (Date.now() - new Date(lastReceivedAt).getTime() < 24 * 60 * 60 * 1000)
    : true; 
    
  // Template State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [templateComponents, setTemplateComponents] = useState<any[] | null>(null)
  const [isLabelsOpen, setIsLabelsOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mark read on load and when new messages arrive
  useEffect(() => {
    markRead()
  }, [messages, markRead])

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
               <span className="font-medium text-lg">Send Image</span>
               <Button variant="ghost" size="icon" onClick={() => setPendingFile(null)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                   <X className="h-6 w-6" />
               </Button>
           </div>
           <div className="flex-1 flex items-center justify-center p-8 bg-muted/20 relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
               <img src={URL.createObjectURL(pendingFile)} className="max-h-[80vh] rounded-2xl shadow-2xl ring-4 ring-background z-10" />
           </div>
           <div className="p-6 flex gap-4 justify-center bg-background/80 backdrop-blur-xl border-t border-border">
                <Button variant="outline" onClick={() => setPendingFile(null)} className="flex-1 max-w-[150px] rounded-xl">Cancel</Button>
                <Button size="lg" onClick={handleSendImage} disabled={isSending} className="flex-1 max-w-sm bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/20 rounded-xl transition-all hover:scale-[1.02]">
                    {isSending ? "Sending..." : "Send Image"}
                </Button>
           </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
        
      {/* Premium Glass Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-border/40 bg-background/70 backdrop-blur-xl sticky top-0 z-20 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
             {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden mr-1 rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            )}
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={onProfileClick}>
              <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={`/placeholder.svg?height=44&width=44&query=${contactName}`} />
                    <AvatarFallback className="bg-gradient-to-tr from-primary to-purple-400 text-white font-bold text-lg">{contactName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green border-2 border-background rounded-full shadow-sm animate-pulse"></span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-[16px] font-bold leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">{contactName}</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1 tracking-wide">{phoneNumber}</p>
              </div>
            </div>
        </div>

        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => setIsLabelsOpen(true)}>
                <MoreVertical className="h-5 w-5" />
            </Button>
            
            <ContactLabelSelector 
                contactId={contact.id} 
                isOpen={isLabelsOpen} 
                onOpenChange={setIsLabelsOpen} 
            />
        </div>
      </div>

      {/* Messages Area - with Background Pattern */}
      <div className="flex-1 relative min-h-0 bg-secondary/5">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
          
          <div 
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar scroll-smooth"
          >
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-50 animate-fade-in">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquareDashed className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Start the conversation</p>
                </div>
            )}
            
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
                <div className="flex justify-center my-6 animate-fade-in">
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-[11px] font-medium px-4 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800/50 shadow-sm">
                        24h window might be expired. Delivery not guaranteed unless using Templates.
                    </span>
                </div>
            )}
            <div className="h-2" />
          </div>
      </div>

      {/* Modern Fixed Input Area - Floating Pill Design */}
      <div className="flex-none w-full bg-background/60 backdrop-blur-xl border-t border-border/50 z-30 p-4 pb-6">
        <div className="max-w-5xl mx-auto flex items-end gap-2 bg-background/80 dark:bg-secondary/30 p-1.5 rounded-[2rem] border border-border/60 shadow-xl shadow-primary/5 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
            
            <div className="flex gap-0.5 pl-1 mb-0.5">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Smile className="h-6 w-6" />
                </Button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                 <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                             <MessageSquareDashed className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card sm:max-w-[425px]">
                      <DialogHeader><DialogTitle>Send Template</DialogTitle></DialogHeader>
                      <div className="py-4"><TemplateSelector onSelect={(name, params) => { setSelectedTemplateName(name); setTemplateComponents(params) }} /></div>
                      <DialogFooter><Button onClick={handleSendTemplate} className="w-full rounded-xl">Send Template</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(undefined, "text")}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 px-3 py-3 h-auto max-h-32 min-h-[48px] text-[15px] placeholder:text-muted-foreground/60"
              autoComplete="off"
            />
            
            <Button
              size="icon"
              onClick={() => handleSendMessage(undefined, "text")}
              className={cn(
                  "h-11 w-11 rounded-full shrink-0 transition-all duration-300 shadow-md mb-0.5 mr-0.5",
                  inputValue.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100 rotate-0 shadow-primary/25" 
                    : "bg-muted text-muted-foreground/50 scale-95 rotate-12 opacity-0 pointer-events-none"
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
