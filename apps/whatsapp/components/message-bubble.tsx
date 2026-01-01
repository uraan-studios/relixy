"use client"

import { Check, CheckCheck, FileIcon, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message?: string
  time: string
  isSender: boolean
  status?: "sent" | "delivered" | "read"
  type?: "text" | "image" | "file"
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
  // Fix for ngrok abuse protection etc if needed, but for now simple
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
    <div className={cn("flex w-full mb-2", isSender ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-lg shadow-sm relative group transition-all",
          isSender
            ? "bg-primary/20 text-foreground rounded-tr-none border border-primary/20"
            : "bg-muted text-foreground rounded-tl-none border border-border/50",
          type === "image" ? "p-1" : "px-3 py-1.5",
        )}
      >
        {/* Triangle Tail */}
        <div
          className={cn(
            "absolute top-0 w-2 h-2",
            isSender
          )}
        />
        
        {/* Star Button (Hover) */}
        <button
            onClick={(e) => {
                e.stopPropagation()
                // TODO: Implement onStar callback
                toast("Starred") 
            }}
            className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded-full"
        >
            <Star className="h-3 w-3 text-[#8696a0] fill-current" />
        </button>

        <div className="flex flex-col gap-0.5">
          {type === "image" && mediaUrl && (
            <div className="flex flex-col gap-1">
              <img
                src={displayUrl || "/placeholder.svg"}
                alt="Shared media"
                className="rounded-md max-h-60 object-cover cursor-pointer"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<p class="text-xs text-red-500">Failed to load image</p>')
                }}
              />
              {caption && <p className="text-[13px] px-2 pt-1">{caption}</p>}
            </div>
          )}

          {type === "file" && (
            <div className="flex items-center gap-3 bg-background/20 p-2 rounded-md border border-white/5">
              <div className="bg-primary/30 p-2 rounded">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[12px] font-medium truncate">Document</span>
                <span className="text-[10px] text-muted-foreground">FILE</span>
              </div>
            </div>
          )}

          {type === "text" && message && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message}</p>}

          <div className="flex items-center justify-end gap-1 mt-0.5 self-end px-1">
            <span className="text-[9px] text-muted-foreground font-medium uppercase">{time}</span>
            {isSender && (
              <div className="flex items-center">
                {status === "sent" && <Check className="h-3 w-3 text-muted-foreground" />}
                {status === "delivered" && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                {status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
