"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useContacts } from "@/hooks/use-contacts";

export function LabelManager() {
    const { labels, createLabel, deleteLabel } = useContacts();
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#000000"); // default black

    const handleCreate = async () => {
        if (!newLabelName) return;
        await createLabel(newLabelName, newLabelColor);
        setNewLabelName("");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Labels</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Labels</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                        <Input 
                            placeholder="New Label Name" 
                            value={newLabelName} 
                            onChange={(e) => setNewLabelName(e.target.value)} 
                        />
                        <input 
                            type="color" 
                            value={newLabelColor}
                            onChange={(e) => setNewLabelColor(e.target.value)}
                            className="h-10 w-10 p-1 rounded border cursor-pointer"
                        />
                        <Button size="icon" onClick={handleCreate}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {labels.map((label: any) => (
                            <div key={label.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }} />
                                    <span>{label.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteLabel(label.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
