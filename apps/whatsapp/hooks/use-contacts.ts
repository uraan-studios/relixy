import { useState, useEffect } from "react"
import { client } from "@/lib/api"

// type App = any;
// const API_BASE_URL = "http://localhost:3000"
// const client: any = treaty<App>(API_BASE_URL)

export function useContacts() {
    const [contacts, setContacts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const ws = client.ws.subscribe()

        ws.on("open", () => {
            setIsLoading(false)
            ws.send({ action: "get_contacts", data: {} })
        })

        ws.on("message", (event: any) => {
            if (!event) return;
            const rawData = event.data !== undefined ? event.data : event;
            const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
            
            if (data.type === "contacts_list") {
                setContacts(data.data || [])
            }

            if (data.type === "message") {
                ws.send({ action: "get_contacts", data: {} })
            }
        })

        return () => {
            ws.close()
        }
    }, [])

    return { contacts, isLoading }
}
