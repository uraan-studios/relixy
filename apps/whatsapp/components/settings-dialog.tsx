"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea" // Need to make this or use Input
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = "http://localhost:8080"

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0b141a] text-foreground border-border">
        <DialogHeader>
          <DialogTitle>Business Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                    {selectedFile ? (
                        <AvatarImage src={URL.createObjectURL(selectedFile)} />
                    ) : (
                        <AvatarFallback>DP</AvatarFallback>
                    )}
                </Avatar>
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
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                    </Button>
                    <Button 
                        size="sm" 
                        disabled={!selectedFile || isLoading}
                        onClick={handleUpdateAvatar}
                    >
                         {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                    </Button>
                </div>
            </div>

            {/* About / Status Section */}
            <div className="grid gap-2">
                <Label htmlFor="about">About (Status)</Label>
                <div className="flex gap-2">
                    <Input 
                        id="about" 
                        value={aboutText} 
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Available"
                        className="bg-transparent"
                    />
                    <Button disabled={!aboutText || isLoading} onClick={handleUpdateProfile}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
