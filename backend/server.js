import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const vitData = JSON.parse(fs.readFileSync("./vitData.json"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant only for VIT Vellore students.

Important:
VTOP means VIT Online Portal.
CAT = Continuous Assessment Test.
FAT = Final Assessment Test.

Always answer in VIT academic context.
Always format neatly with headings and bullet points.
`
        },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: response.choices[0].message.content });

  } catch (err) {
    console.error(err.message);
    res.json({ reply: "⚠️ AI temporarily unavailable" });
  }
});

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// app.get("/api/test", (req, res) => {
//   res.json({ ok: true });
// });

app.listen(5000, () => console.log("Server running on port 5000"));