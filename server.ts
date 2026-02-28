import express from "express";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import Database from "better-sqlite3";
import axios from "axios";
import { format } from "date-fns";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const db = new Database("quotes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    content TEXT,
    author TEXT,
    sent_at TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function fetchDailyQuote(targetDate: string) {
  try {
    // Using ZenQuotes API (Free & Open)
    const response = await axios.get("https://zenquotes.io/api/today");
    const data = response.data[0];
    
    if (data && data.q) {
      const quoteData = {
        content: data.q,
        author: data.a || "Anonymous"
      };
      
      const stmt = db.prepare("INSERT OR REPLACE INTO quotes (date, content, author) VALUES (?, ?, ?)");
      stmt.run(targetDate, quoteData.content, quoteData.author);
      return { ...quoteData, date: targetDate };
    }
  } catch (error) {
    console.error("Error fetching from ZenQuotes API:", error);
    // Fallback to a static quote if API fails
    return {
      content: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      date: targetDate
    };
  }
  return null;
}

async function sendToWeChat(quote: any) {
  const sendKey = process.env.SERVERCHAN_SENDKEY;
  if (!sendKey) {
    console.log("SERVERCHAN_SENDKEY not set, skipping WeChat notification.");
    return;
  }

  const title = `Morning Quote - ${quote.date}`;
  const desp = `### ${quote.content}\n\n— ${quote.author}`;

  try {
    await axios.post(`https://sctapi.ftqq.com/${sendKey}.send`, {
      title,
      desp,
    });
    db.prepare("UPDATE quotes SET sent_at = ? WHERE date = ?").run(new Date().toISOString(), quote.date);
    console.log(`Quote for ${quote.date} sent to WeChat.`);
  } catch (error) {
    console.error("Error sending to ServerChan:", error);
  }
}

// Schedule task at 6:00 AM every day
cron.schedule("0 6 * * *", async () => {
  const today = format(new Date(), "yyyy-MM-dd");
  console.log(`Running scheduled task for ${today}`);
  
  let quote = db.prepare("SELECT * FROM quotes WHERE date = ?").get(today);
  if (!quote) {
    quote = await fetchDailyQuote(today);
  }
  
  if (quote) {
    await sendToWeChat(quote);
  }
}, {
  timezone: "Asia/Shanghai"
});

app.use(express.json());

// API Routes
app.get("/api/quotes/today", async (req, res) => {
  const today = format(new Date(), "yyyy-MM-dd");
  let quote = db.prepare("SELECT * FROM quotes WHERE date = ?").get(today);
  
  if (!quote) {
    quote = await fetchDailyQuote(today);
  }
  
  res.json(quote || { error: "No quote available" });
});

app.get("/api/quotes/history", (req, res) => {
  const quotes = db.prepare("SELECT * FROM quotes ORDER BY date DESC LIMIT 30").all();
  res.json(quotes);
});

app.post("/api/test-send", async (req, res) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const quote = db.prepare("SELECT * FROM quotes WHERE date = ?").get(today);
  if (quote) {
    await sendToWeChat(quote);
    res.json({ success: true, message: "Test message sent" });
  } else {
    res.status(404).json({ error: "No quote for today to send" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
