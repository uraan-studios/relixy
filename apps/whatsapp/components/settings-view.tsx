"use client"

import { useState } from "react"
import { Search, Monitor, Key, Lock, Video, Bell, Keyboard, HelpCircle, User, Pencil, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SettingsView() {
  const [activeSetting, setActiveSetting] = useState("Profile")
  const [profileName, setProfileName] = useState("Yasin Shah")
  const [profileAbout, setProfileAbout] = useState("Hey there! I am using WhatsApp.")
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  
  // TODO: Fetch from actual user profile endpoint

  const handleSaveProfile = () => {
      // API call placeholder
      toast.success("Profile updated")
      setIsEditingName(false)
      setIsEditingAbout(false)
  }

  const settingsItems = [
    { icon: User, label: "Profile", sub: "Photo, name, about" },
    { icon: Monitor, label: "General", sub: "Startup and close" },
    { icon: Key, label: "Account", sub: "Security notifications, account info" },
    { icon: Lock, label: "Chats", sub: "Theme, wallpaper, chat settings" },
    { icon: Video, label: "Video & voice", sub: "Camera, microphone & speakers" },
    { icon: Bell, label: "Notifications", sub: "Message notifications" },
    { icon: Keyboard, label: "Shortcuts", sub: "Quick actions" },
    { icon: HelpCircle, label: "Help", sub: "Help center, contact us" },
  ]

  const renderContent = () => {
      switch (activeSetting) {
          case "Profile":
              return (
                  <div className="max-w-xl w-full p-8 animate-in fade-in duration-300">
                      <div className="flex flex-col items-center mb-8">
                          <div className="relative group cursor-pointer">
                              <Avatar className="h-40 w-40 ring-4 ring-muted">
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">YS</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-muted/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex flex-col items-center text-primary-foreground">
                                      <Camera className="h-8 w-8 mb-1" />
                                      <span className="text-xs uppercase font-medium">Change</span>
                                  </div>
                              </div>
                              <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  accept="image/*"
                                  onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                          toast.info("Uploading photo...")
                                          // Implement upload logic
                                      }
                                  }}
                              />
                          </div>
                      </div>

                      <div className="mb-8">
                          <Label className="text-primary text-sm mb-4 block">Your name</Label>
                          <div className="flex items-center justify-between group">
                              {isEditingName ? (
                                  <div className="flex items-center gap-2 w-full">
                                      <Input 
                                          value={profileName} 
                                          onChange={(e) => setProfileName(e.target.value)} 
                                          className="bg-transparent border-b-2 border-primary rounded-none px-0 focus-visible:ring-0"
                                          autoFocus
                                      />
                                      <Button size="icon" variant="ghost" onClick={handleSaveProfile}><span className="text-muted-foreground">✓</span></Button>
                                  </div>
                              ) : (
                                  <>
                                    <span className="text-foreground text-base fle-1">{profileName}</span>
                                    <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)} className="text-muted-foreground opacity-0 group-hover:opacity-100">
                                        <Pencil className="h-5 w-5" />
                                    </Button>
                                  </>
                              )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-3">
                              This is not your username or pin. This name will be visible to your WhatsApp contacts.
                          </p>
                      </div>

                      <div className="mb-8">
                          <Label className="text-primary text-sm mb-4 block">About</Label>
                           <div className="flex items-center justify-between group">
                              {isEditingAbout ? (
                                  <div className="flex items-center gap-2 w-full">
                                      <Input 
                                          value={profileAbout} 
                                          onChange={(e) => setProfileAbout(e.target.value)} 
                                          className="bg-transparent border-b-2 border-primary rounded-none px-0 focus-visible:ring-0"
                                          autoFocus
                                      />
                                        <Button size="icon" variant="ghost" onClick={handleSaveProfile}><span className="text-muted-foreground">✓</span></Button>
                                  </div>
                              ) : (
                                  <>
                                    <span className="text-foreground text-base fle-1">{profileAbout}</span>
                                    <Button size="icon" variant="ghost" onClick={() => setIsEditingAbout(true)} className="text-muted-foreground opacity-0 group-hover:opacity-100">
                                        <Pencil className="h-5 w-5" />
                                    </Button>
                                  </>
                              )}
                          </div>
                      </div>
                  </div>
              )
          default:
              return (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Monitor className="h-16 w-16 mb-4 opacity-20" />
                      <h3 className="text-foreground text-lg font-medium">Settings: {activeSetting}</h3>
                      <p>This section is under construction.</p>
                  </div>
              )
      }
  }

  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* Settings Sidebar (Left) */}
      <div className="w-[350px] flex flex-col h-full bg-sidebar border-r border-border">
        <div className="p-4 pt-8 h-full flex flex-col">
            <h1 className="text-xl font-semibold mb-4 text-foreground px-3">Settings</h1>
            <div className="relative mb-4 px-3">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search settings" 
                    className="pl-9 bg-sidebar-accent border-none text-foreground placeholder:text-muted-foreground h-9 focus-visible:ring-1 focus-visible:ring-primary rounded-md"
                />
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-1 pb-4">
                    {settingsItems.map((item, i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveSetting(item.label)}
                            className={cn(
                                "flex items-center gap-4 p-3 px-5 cursor-pointer transition-all rounded-lg mx-2",
                                activeSetting === item.label 
                                    ? 'bg-sidebar-accent text-foreground' 
                                    : 'hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", activeSetting === item.label ? 'text-primary' : 'text-muted-foreground')} />
                            <div>
                                <h3 className="text-base font-normal">{item.label}</h3>
                                {item.sub && <p className="text-xs mt-0.5 opacity-70">{item.sub}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            
            {/* Version Info */}
            <div className="p-4 text-muted-foreground text-xs border-t border-border mt-auto">
                <p>Relixy WhatsApp Clone</p>
                <p>Version 2.24.5.76</p>
            </div>
        </div>
      </div>

      {/* Settings Detail (Right) */}
      <div className="flex-1 bg-background flex flex-col overflow-y-auto">
            {renderContent()}
      </div>
    </div>
  )
}
