"use client"

import { Check, CheckCheck, FileIcon, Download } from "lucide-react"
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
        "flex w-full mb-3 animate-fade-in group px-1",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl shadow-sm text-[15px] transition-all duration-300",
          "hover:shadow-md",
          isSender
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm border border-primary/20"
            : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-foreground rounded-tl-sm border border-white/20 dark:border-white/10",
          type === "image" ? "p-1" : "px-4 py-2.5"
        )}
      >
        {/* Attachment: Image */}
        {type === "image" && displayUrl && (
            <div className="relative mb-1 rounded-xl overflow-hidden bg-muted/50 group-hover:scale-[1.01] transition-transform duration-500">
              <img
                src={displayUrl}
                alt="Attachment"
                className="max-w-full h-auto object-cover max-h-[350px]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-8 text-xs text-destructive bg-destructive/10 flex items-center justify-center rounded-lg border border-destructive/20">Failed to load image</div>')
                }}
              />
              <a 
                href={displayUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                  <Download className="h-4 w-4" />
              </a>
            </div>
        )}

        {/* Attachment: File */}
        {type === "file" && (
            <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border mb-2 transition-colors",
                 isSender ? "bg-white/10 border-white/20 hover:bg-white/20" : "bg-muted/50 border-border/50 hover:bg-muted/80"
            )}>
              <div className={cn("p-2.5 rounded-lg", isSender ? "bg-white/20" : "bg-primary/10")}>
                <FileIcon className={cn("h-5 w-5", isSender ? "text-white" : "text-primary")} />
              </div>
              <div className="flex flex-col min-w-[120px]">
                <span className="text-sm font-semibold truncate opacity-95">Attachment</span>
                <span className="text-[10px] opacity-75 font-mono uppercase tracking-wider">Document</span>
              </div>
            </div>
        )}

        {/* Text Content */}
        {(type === "text" || type === "template" || caption) && (
            <p className={cn(
                "leading-relaxed whitespace-pre-wrap break-words tracking-wide", 
                type !== 'text' && "pt-2 px-1 pb-1",
                type === "template" && "italic text-sm opacity-90"
            )}>
                {caption || message}
            </p>
        )}

        {/* Metadata (Time + Status) */}
        <div className={cn(
            "flex items-center justify-end gap-1.5 mt-1.5 select-none", 
            isSender ? "text-primary-foreground/70" : "text-muted-foreground/60"
        )}>
          <span className="text-[11px] font-medium tracking-wide">{time}</span>
          {isSender && (
            <span className={cn("flex items-center", status === "read" ? "text-blue-200 shadow-blue-500/50 drop-shadow-sm" : "currentColor")}>
               {status === "read" || status === "delivered" ? (
                    <CheckCheck className={cn("h-3.5 w-3.5", status === "read" && "stroke-[2.5px]")} />
                ) : (
                    <Check className="h-3.5 w-3.5" />
                )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
