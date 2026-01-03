"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Upload, Loader2, Camera } from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = "http://localhost:8080"

export function SettingsDialog({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const show = isControlled ? open : internalOpen
  const setShow: any = isControlled ? onOpenChange : setInternalOpen
  
  const [isLoading, setIsLoading] = useState(false)
  
  const [aboutText, setAboutText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateProfile = async () => {
    if (!aboutText.trim()) return
    setIsLoading(true)
    try {
        const res = await fetch(`${API_BASE_URL}/settings/profile`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ about: aboutText })
        })
        if (!res.ok) throw new Error("Failed to update profile")
        toast.success("Profile status updated!")
        setAboutText("")
    } catch (e: any) {
        toast.error(e.message)
    } finally {
        setIsLoading(false)
    }
  }

  const handleUpdateAvatar = async () => {
     if (!selectedFile) return
     setIsLoading(true)
     const formData = new FormData()
     formData.append("file", selectedFile)
     
     try {
        const res = await fetch(`${API_BASE_URL}/settings/avatar`, {
            method: "POST",
            body: formData
        })
        if (!res.ok) throw new Error("Failed to update avatar")
        toast.success("Profile picture updated!")
        setSelectedFile(null)
     } catch (e: any) {
        toast.error(e.message)
     } finally {
        setIsLoading(false)
     }
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {!isControlled && (
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] glass-card border-border/40 shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-500">Business Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-8 py-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                    <Avatar className="h-28 w-28 ring-4 ring-background shadow-xl">
                        {selectedFile ? (
                            <AvatarImage src={URL.createObjectURL(selectedFile)} className="object-cover" />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary via-purple-500 to-blue-500 text-white text-2xl">DP</AvatarFallback>
                        )}
                    </Avatar>
                     <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                        onClick={() => fileInputRef.current?.click()}
                     >
                        <Camera className="h-8 w-8 text-white" />
                     </div>
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                    </Button>
                    <Button 
                        size="sm" 
                        disabled={!selectedFile || isLoading}
                        onClick={handleUpdateAvatar}
                        className="rounded-full bg-primary hover:bg-primary/90"
                    >
                         {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                    </Button>
                </div>
            </div>

            {/* About / Status Section */}
            <div className="space-y-3">
                <Label htmlFor="about" className="text-muted-foreground font-medium">About (Status)</Label>
                <div className="flex gap-2">
                    <Input 
                        id="about" 
                        value={aboutText} 
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Available"
                        className="bg-secondary/50 border-transparent focus:border-primary/50 focus:bg-background transition-all"
                    />
                    <Button 
                        disabled={!aboutText || isLoading} 
                        onClick={handleUpdateProfile}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
