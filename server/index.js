import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from 'openai';
import dotenv from "dotenv";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const queue = new Queue('file-upload-queue',
    {
        connection: {
            host: 'localhost',
            port: '6379'
        },
    }
);



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    return res.json({ status: 'All Good' });
})

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    await queue.add('file-ready', JSON.stringify({
        filename: req.file.originalname,
        source: req.file.destination,
        path: req.file.path,
    }))
    return res.json({ message: "uploaded" });
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;

  // 1. Gemini embeddings
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "models/embedding-001",
  });

  // 2. Load from Qdrant
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "langchainjs-testing",
    }
  );
  const retriever = vectorStore.asRetriever({ k: 3 });
  const result = await retriever.invoke(userQuery);

  // 3. Build system prompt
  const context = result.map(r => r.pageContent).join("\n\n");
  const SYSTEM_PROMPT = `
  You are a helpful AI Assistant. Use the context below to answer.
  Context:
  ${context}
  `;

  // 4. Gemini chat
  const chat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-pro",
  });

  const chatResult = await chat.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ]);

  return res.json({
    message: chatResult.content,
    docs: result,
  });
});

app.listen(8000, () => console.log(`Server is running on port ${8000}`))