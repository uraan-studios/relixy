"use client"

import { useState } from "react"
import { Search, Monitor, Key, Lock, Video, Bell, Keyboard, HelpCircle, User, Pencil, Camera, ChevronLeft } from "lucide-react"
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
                  <div className="max-w-2xl w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col items-center mb-10">
                          <div className="relative group cursor-pointer">
                              <Avatar className="h-44 w-44 ring-4 ring-primary/20 shadow-2xl transition-all duration-300 group-hover:ring-primary/50">
                                  <AvatarImage src="/placeholder.svg" className="object-cover" />
                                  <AvatarFallback className="text-5xl bg-gradient-to-br from-primary via-purple-600 to-blue-600 text-white font-bold">YS</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                                  <div className="flex flex-col items-center text-white drop-shadow-md">
                                      <Camera className="h-8 w-8 mb-1" />
                                      <span className="text-xs uppercase font-bold tracking-widest">Change</span>
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

                      <div className="space-y-8 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
                          <div>
                              <Label className="text-primary font-semibold text-sm mb-2 block uppercase tracking-wider opacity-80">Your name</Label>
                              <div className="flex items-center justify-between group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                                  {isEditingName ? (
                                      <div className="flex items-center gap-2 w-full">
                                          <Input 
                                              value={profileName} 
                                              onChange={(e) => setProfileName(e.target.value)} 
                                              className="bg-transparent border-b-2 border-primary rounded-none px-0 focus-visible:ring-0 text-lg font-medium h-auto py-1"
                                              autoFocus
                                          />
                                          <Button size="icon" variant="ghost" onClick={handleSaveProfile} className="hover:bg-primary/10 hover:text-primary rounded-full"><span className="text-lg">✓</span></Button>
                                      </div>
                                  ) : (
                                      <>
                                        <span className="text-foreground text-lg font-medium flex-1">{profileName}</span>
                                        <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                      </>
                                  )}
                              </div>
                              <p className="text-muted-foreground text-xs mt-2 px-2">
                                  This is not your username or pin. This name will be visible to your WhatsApp contacts.
                              </p>
                          </div>

                          <div className="h-px bg-border/50 w-full" />

                          <div>
                              <Label className="text-primary font-semibold text-sm mb-2 block uppercase tracking-wider opacity-80">About</Label>
                               <div className="flex items-center justify-between group p-2 hover:bg-secondary/30 rounded-lg transition-colors">
                                  {isEditingAbout ? (
                                      <div className="flex items-center gap-2 w-full">
                                          <Input 
                                              value={profileAbout} 
                                              onChange={(e) => setProfileAbout(e.target.value)} 
                                              className="bg-transparent border-b-2 border-primary rounded-none px-0 focus-visible:ring-0 text-base h-auto py-1"
                                              autoFocus
                                          />
                                            <Button size="icon" variant="ghost" onClick={handleSaveProfile} className="hover:bg-primary/10 hover:text-primary rounded-full"><span className="text-lg">✓</span></Button>
                                      </div>
                                  ) : (
                                      <>
                                        <span className="text-foreground text-base flex-1 opacity-90">{profileAbout}</span>
                                        <Button size="icon" variant="ghost" onClick={() => setIsEditingAbout(true)} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-full">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              )
          default:
              return (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
                      <div className="bg-secondary/50 p-6 rounded-full mb-6">
                        <Monitor className="h-16 w-16 opacity-20" />
                      </div>
                      <h3 className="text-foreground text-2xl font-semibold mb-2">Settings: {activeSetting}</h3>
                      <p className="text-sm opacity-60">This section is currently under construction.</p>
                  </div>
              )
      }
  }

  return (
    <div className="flex h-full w-full bg-background/50 backdrop-blur-3xl text-foreground overflow-hidden">
      {/* Settings Sidebar (Left) */}
      <div className="w-[320px] flex flex-col h-full bg-secondary/20 border-r border-border/40 backdrop-blur-xl">
        <div className="p-4 pt-6 h-full flex flex-col gap-6">
            <div className="px-2">
                <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            </div>
            
            <div className="relative px-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search settings" 
                    className="pl-9 bg-background/50 border-transparent text-foreground placeholder:text-muted-foreground h-10 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl transition-all shadow-sm"
                />
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-1 pb-4">
                    {settingsItems.map((item, i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveSetting(item.label)}
                            className={cn(
                                "flex items-center gap-4 p-3 px-4 cursor-pointer transition-all duration-200 rounded-xl mx-2 group",
                                activeSetting === item.label 
                                    ? 'bg-primary/10 text-primary shadow-sm' 
                                    : 'hover:bg-background/60 text-muted-foreground hover:text-foreground hover:shadow-sm'
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 transition-colors", activeSetting === item.label ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70')} />
                            <div>
                                <h3 className="text-[15px] font-medium leading-none mb-1">{item.label}</h3>
                                {item.sub && <p className="text-[11px] opacity-70 leading-none">{item.sub}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
           
        </div>
      </div>

      {/* Settings Detail (Right) */}
      <div className="flex-1 bg-background/40 backdrop-blur-md flex flex-col overflow-y-auto relative">
         <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat pointer-events-none" />
          <div className="flex-1 flex justify-center z-10">
            {renderContent()}
          </div>
      </div>
    </div>
  )
}
