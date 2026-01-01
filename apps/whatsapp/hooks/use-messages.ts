import useSWR from "swr"

const API_BASE_URL = "http://localhost:8080" // Configure this properly in real app

const fetcher = async (url: string) => {
  const res = await fetch(url)
  return res.json()
}

export function useMessages(phoneNumber?: string) {
  const { data, error, mutate } = useSWR(
    phoneNumber ? `${API_BASE_URL}/messages/${phoneNumber}` : null,
    async (url: string) => {
      const response = await fetcher(url)
      // Server now returns { data: [], meta: { lastReceivedAt } }
      // Or fallback if array
      const msgs = Array.isArray(response) ? response : (response.data || [])
      const meta = !Array.isArray(response) ? response.meta : {}
      
      return { messages: msgs, lastReceivedAt: meta?.lastReceivedAt }
    },
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    },
  )

  return {
    messages: data?.messages || [],
    lastReceivedAt: data?.lastReceivedAt,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
