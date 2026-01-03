
import { Database } from "bun:sqlite";

const db = new Database("packages/api/local.db");

const messages = db.query("SELECT * FROM messages WHERE metadata IS NOT NULL ORDER BY timestamp DESC LIMIT 5").all();

messages.forEach(msg => {
  console.log("---------------------------------------------------");
  console.log(`ID: ${msg.id}`);
  console.log(`Type: ${msg.type}`);
  console.log(`Body: ${msg.body}`);
  console.log(`Metadata: ${msg.metadata}`);
});
