import app from "@repo/api";

app.listen({
    port: 8080,
    hostname: "0.0.0.0"
}, () => {
    console.log("🦊 Elysia is running at http://localhost:8080");
    console.log("META_WABA_ID:", process.env.META_WABA_ID ? "Yes" : "No");
    console.log("DB Path:", process.env.DATABASE_URL || "Using local.db");
});
