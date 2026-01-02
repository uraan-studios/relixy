"use client"

import { Check, CheckCheck, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message?: string
  time: string
  isSender: boolean
  status?: "sent" | "delivered" | "read"
  type?: "text" | "image" | "file" | "template"
  mediaUrl?: string
  caption?: string
}

export function MessageBubble({
  message,
  time,
  isSender,
  status = "sent",
  type = "text",
  mediaUrl,
  caption,
}: MessageBubbleProps) {
  
  // Helper to resolve media URL
  const API_BASE_URL = "http://localhost:8080";
  let displayUrl = mediaUrl;
  
  if (mediaUrl) {
      if (mediaUrl.startsWith("http")) {
          displayUrl = mediaUrl;
      } else if (mediaUrl.startsWith("/uploads/")) {
          // Local upload served by backend
          displayUrl = `${API_BASE_URL}${mediaUrl}`;
      } else if (!mediaUrl.includes("/")) {
          // Assume Meta Media ID -> Proxy
          displayUrl = `${API_BASE_URL}/messages/media-content/${mediaUrl}`;
      }
  }

  return (
    <div
      className={cn(
        "flex w-full mb-2",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3 py-2 shadow-sm text-sm transition-all duration-200 group",
          "animate-in fade-in slide-in-from-bottom-2",
          isSender
            ? "bg-primary text-primary-foreground rounded-tr-sm bg-linear-to-br from-primary to-primary/90 border border-primary/20"
            : "bg-card text-card-foreground rounded-tl-sm backdrop-blur-md border border-border/50 shadow-sm",
          type === "image" && "p-1"
        )}
      >
        {/* Attachment: Image */}
        {type === "image" && displayUrl && (
            <div className="relative mb-1 rounded-xl overflow-hidden bg-muted/50">
              <img
                src={displayUrl}
                alt="Attachment"
                className="max-w-full h-auto object-cover max-h-[300px]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-xs text-destructive bg-destructive/10 flex items-center justify-center rounded-lg">Failed to load image</div>')
                }}
              />
            </div>
        )}

        {/* Attachment: File */}
        {type === "file" && (
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border/50 mb-1">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium truncate opacity-90">Attachment</span>
                <span className="text-[10px] opacity-70 uppercase">FILE</span>
              </div>
            </div>
        )}

        {/* Text Content */}
        {(type === "text" || type === "template" || caption) && (
            <p className={cn("leading-relaxed whitespace-pre-wrap break-words px-1", type !== 'text' && "pt-1")}>
                {caption || message}
            </p>
        )}

        {/* Metadata (Time + Status) */}
        <div className={cn("flex items-center justify-end gap-1 mt-1 select-none opacity-70", isSender ? "text-primary-foreground/90" : "text-muted-foreground")}>
          <span className="text-[10px] font-medium">{time}</span>
          {isSender && (
            <span className={cn("flex", status === "read" ? "text-blue-200" : "currentColor")}>
               {status === "read" || status === "delivered" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
