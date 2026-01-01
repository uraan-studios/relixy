"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { NavRail } from "@/components/nav-rail"
import { SettingsView } from "@/components/settings-view"
import { Sidebar } from "@/components/sidebar"
import { ChatWindow } from "@/components/chat-window"
import { ContactInfoSidebar } from "@/components/contact-info-sidebar"

export default function WhatsAppClone() {
  const [activeTab, setActiveTab] = useState("chats")
  const [selectedContact, setSelectedContact] = useState<any>(null) // Lifted state
  const [showContactInfo, setShowContactInfo] = useState(false)

  return (
    <main className="h-screen w-full bg-[#0b141a] overflow-hidden flex text-[#e9edef] font-sans">
        {/* Navigation Rail */}
        <NavRail activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            {activeTab === "settings" || activeTab === "profile" ? (
                <SettingsView />
            ) : (
                <>
                    {/* Sidebar / Chat List */}
                    <div className="w-[400px] border-r border-[#222e35] h-full bg-[#111b21]">
                        <Sidebar 
                            activeTab={activeTab} 
                            onSelectContact={(c) => {
                                setSelectedContact(c)
                                setShowContactInfo(false) // Reset on change
                            }}
                            selectedContactId={selectedContact?.id || null}
                        />
                    </div>
                    {/* Main Chat Window */}
                    <div className="flex-1 h-full bg-[#0b141a] relative flex">
                         {selectedContact ? (
                            <>
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
                            </>
                         ) : (
                             // Empty State
                             <div className="h-full w-full flex flex-col items-center justify-center bg-[#222e35] border-b-[6px] border-[#00a884]">
                                 <h1 className="text-3xl font-light text-[#e9edef] mb-4">WhatsApp for Windows</h1>
                                 <p className="text-[#8696a0] text-sm text-center max-w-md leading-6">
                                     Send and receive messages without keeping your phone online. <br/>
                                     Use WhatsApp on up to 4 linked devices and 1 phone.
                                 </p>
                             </div>
                         )}
                    </div>
                </>
            )}
        </div>
    </main>
  )
}
