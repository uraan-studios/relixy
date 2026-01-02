import useSWR from "swr"
import { useEffect, useState, useCallback, useRef } from "react"
import { client } from "@/lib/api"

// type App = any; // No longer needed as we import typed client
// const API_BASE_URL = "http://localhost:8080" 
// const client: any = treaty<App>(API_BASE_URL)

export function useMessages(phoneNumber?: string) {
  const [wsMessages, setWsMessages] = useState<any[]>([])
  const [lastReceivedAt, setLastReceivedAt] = useState<string | null>(null)
  const [isWsConnecting, setIsWsConnecting] = useState(true)
  const wsRef = useRef<any>(null)

  useEffect(() => {
    if (!phoneNumber) return

    const ws = client.ws.subscribe()
    wsRef.current = ws
    
    ws.on("open", () => {
        setIsWsConnecting(false)
        ws.send({ action: "get_messages", data: { phoneNumber } })
    })

    ws.on("message", (event: any) => {
      if (!event) return;
      // Handle both standard MessageEvent and Eden's direct data
      const rawData = event.data !== undefined ? event.data : event;
      const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      
      if (data.type === "messages_list" && data.phoneNumber === phoneNumber) {
          setWsMessages(data.data || [])
          setLastReceivedAt(data.meta?.lastReceivedAt)
      }

      if (data.type === "message" && data.phoneNumber === phoneNumber) {
        ws.send({ action: "get_messages", data: { phoneNumber } })
      }
    })

    ws.on("close", () => {
        setIsWsConnecting(true)
    })

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [phoneNumber])

  const sendMessage = useCallback(async (msgData: any) => {
      try {
        if (wsRef.current) {
            wsRef.current.send({ action: "send_message", data: msgData })
        } else {
            console.warn("WS not ready, skipping message send");
        }
      } catch (e) {
        console.error("Error sending message:", e)
      }
  }, [])

  const markRead = useCallback(() => {
    try {
        if (wsRef.current && phoneNumber) {
            wsRef.current.send({ action: "mark_read", data: { phoneNumber } })
        }
    } catch (e) {
        // Ignore "object not usable" errors on unmount
        console.warn("Failed to mark read (socket likely closed):", e)
    }
  }, [phoneNumber])

  return {
    messages: wsMessages,
    lastReceivedAt,
    isLoading: isWsConnecting,
    isError: false,
    mutate: () => {
        if (wsRef.current) {
            wsRef.current.send({ action: "get_messages", data: { phoneNumber } })
        }
    },
    sendMessage,
    markRead
  }
}
