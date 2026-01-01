"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatWindow } from "@/components/chat-window"
import { EmptyState } from "@/components/empty-state"

interface Contact {
  id: string
  name: string
  phoneNumber: string
}

export function ChatInterface() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  return (
    <>
      <div className="w-full md:w-[350px] lg:w-[450px] border-r border-border flex flex-col">
        <Sidebar onSelectContact={(c: any) => setSelectedContact(c)} selectedContactId={selectedContact?.id || null} />
      </div>
      <div className="flex-1 hidden md:flex flex-col relative">
        {selectedContact ? (
          <ChatWindow
            contactId={selectedContact.id}
            contactName={selectedContact.name}
            phoneNumber={selectedContact.phoneNumber}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  )
}
