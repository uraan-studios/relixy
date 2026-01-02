"use client"

import { useState } from "react"
import { SettingsView } from "@/components/settings-view"
import { Sidebar } from "@/components/sidebar"
import { ChatWindow } from "@/components/chat-window"
import { ContactInfoSidebar } from "@/components/contact-info-sidebar"

export default function WhatsAppClone() {
  const [activeTab, setActiveTab] = useState("chats")
  const [selectedContact, setSelectedContact] = useState<any>(null) // Lifted state
  const [showContactInfo, setShowContactInfo] = useState(false)

  // Handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "settings") {
      // Optional: Logic to open settings dialog instead of full view
    }
  }

  return (
    <main className="h-screen w-full bg-background overflow-hidden flex text-foreground font-sans">
        {/* Sidebar / Chat List - Persistent */}
        <div className="w-[380px] border-r border-border h-full bg-sidebar flex flex-col">
            <Sidebar 
                activeTab={activeTab} 
                onSelectContact={(c) => {
                    setSelectedContact(c)
                    setShowContactInfo(false) // Reset on change
                }}
                selectedContactId={selectedContact?.id || null}
                onTabChange={handleTabChange}
            />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-background relative z-0">
             {/* Main Chat Window */}
             <div className="flex-1 h-full relative flex flex-col">
                  {selectedContact ? (
                     <div className="flex-1 flex min-w-0">
                         <div className="flex-1 flex flex-col min-w-0">
                             <ChatWindow 
                                 contact={selectedContact}
                                 onBack={() => setSelectedContact(null)} // For mobile if we add it later
                                 onProfileClick={() => setShowContactInfo(!showContactInfo)}
                             />
                         </div>
                         {showContactInfo && (
                             <ContactInfoSidebar 
                                 contact={selectedContact} 
                                 onClose={() => setShowContactInfo(false)} 
                             />
                         )}
                     </div>
                  ) : activeTab === "settings" ? (
                      <SettingsView />
                  ) : (
                      // Empty State
                      <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20 text-muted-foreground p-8">
                          <div className="max-w-md text-center space-y-4">
                              <h1 className="text-2xl font-light text-foreground">Welcome to WhatsApp</h1>
                              <p className="text-sm">
                                  Send and receive messages without keeping your phone online. <br/>
                                  Use WhatsApp on up to 4 linked devices and 1 phone.
                              </p>
                              <div className="text-xs mt-8 opacity-50">
                                  <p className="flex items-center justify-center gap-1">
                                      <span>🔒</span> End-to-end encrypted
                                  </p>
                              </div>
                          </div>
                      </div>
                  )}
             </div>
        </div>
    </main>
  )
}
