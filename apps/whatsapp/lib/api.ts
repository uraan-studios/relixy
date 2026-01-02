import { treaty } from "@elysiajs/eden"
import type { App } from "@repo/api"

// Ensure this matches your API server port (API runs on 8080)
const API_BASE_URL = "http://localhost:8080" 

export const client = treaty<App>(API_BASE_URL)