import { MessageSquare } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <h2 className="text-2xl font-light mb-2">WhatsApp for Meta Cloud API</h2>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        Select a contact to start chatting. Manage your Meta Cloud API messages seamlessly.
      </p>
      <div className="mt-8 pt-8 border-t border-border w-full max-w-xs">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Powered by Meta Cloud API
        </p>
      </div>
    </div>
  )
}
