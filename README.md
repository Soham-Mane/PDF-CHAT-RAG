# 📄 Chat with PDF (Next.js + Express + Qdrant + LangChain)

A **Chat with PDF** tool built with **Next.js (frontend)** and **Express.js (backend)** that allows you to upload PDFs, process them into vector embeddings (using **Google Gemini / OpenAI embeddings**) and store them in **Qdrant vector DB** for semantic search and conversational querying.  

This project uses **LangChain** for embeddings/retrieval, **BullMQ** for job processing, and integrates **Clerk** for authentication.  

---

## 🚀 Features
- 📤 Upload **PDF documents** from the frontend  
- ⚡ Process PDFs asynchronously using **BullMQ workers**  
- 🧠 Generate embeddings via **Google Gemini / OpenAI**  
- 📦 Store embeddings in **Qdrant vector database**  
- 💬 Ask questions in chat UI → responses retrieved from your documents  
- 🔒 Clerk-powered authentication for secure access  

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 13 (App Router), TailwindCSS, Clerk (Auth)  
- **Backend**: Express.js, BullMQ (Redis), Multer (File Upload)  
- **Vector DB**: Qdrant (running locally at `localhost:6333`)  
- **Embeddings**: Google Generative AI (`models/embedding-001`) / OpenAI  
- **LLM**: Gemini (`gemini-1.5-pro`) / OpenAI GPT models  
- **Document Loader**: LangChain PDF Loader  

---

## 📖 How It Works
1. User uploads a PDF → file stored in `/uploads`  
2. Backend enqueues job (**BullMQ + Redis**)  
3. Worker loads PDF, chunks text, generates embeddings (**Gemini/OpenAI**), stores in **Qdrant**  
4. User asks a question in chat → relevant chunks retrieved from **Qdrant**  
5. Context + user query → sent to **Gemini/OpenAI** model  
6. Response displayed in **chat UI**  

---

## ⚠️ Notes
- **Paid OpenAI API Key is required** for embeddings + chat (free-tier API won’t work for production).  
- **Qdrant & Redis must be running locally** (or use managed services).  
- **Gemini API** can be used as an alternative to OpenAI embeddings.  

## 📂 Project Structure
- `/frontend` → Next.js app (chat + file upload UI)  
- `/backend` → Express.js server + BullMQ workers  
- `/backend/server.js` → Main Express server (upload + chat endpoints)  
- `/backend/worker.js` → BullMQ worker for PDF processing & embeddings  
- `/uploads` → Directory for uploaded PDFs  

