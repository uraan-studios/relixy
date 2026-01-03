"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useContacts } from "@/hooks/use-contacts";
import { cn } from "@/lib/utils";

interface ContactLabelSelectorProps {
    contactId: string;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ContactLabelSelector({ contactId, trigger, isOpen, onOpenChange }: ContactLabelSelectorProps) {
    const { labels, contacts, addLabelToContact, removeLabelFromContact } = useContacts();
    
    // Find current contact to see assigned labels
    // This assumes specific contact object structure from useContacts
    const contact = contacts?.find((c: any) => c.id === contactId);
    const assignedLabelIds = contact?.labels?.map((l: any) => l.id) || [];

    const handleToggle = async (labelId: string) => {
        const isAssigned = assignedLabelIds.includes(labelId);
        if (isAssigned) {
            await removeLabelFromContact(contactId, labelId);
        } else {
            await addLabelToContact(contactId, labelId);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Labels</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                    {labels.map((label: any) => {
                         const isAssigned = assignedLabelIds.includes(label.id);
                         return (
                            <div 
                                key={label.id} 
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => handleToggle(label.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
                                    <span className="font-medium">{label.name}</span>
                                </div>
                                {isAssigned && <Check className="h-4 w-4 text-primary" />}
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
