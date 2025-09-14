import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {CharacterTextSplitter, TextSplitter} from '@langchain/textsplitters'
import dotenv from "dotenv";
dotenv.config();
const worker = new Worker(
    'file-upload-queue',
    async ( job)=>{
        console.log(`Job:`, job.data);
        const data = JSON.parse(job.data);
        /*
        Path: data.path
        read the pdf from path,
        chunk the pdf,
        call the openai embedding model for every chunk,
        store the chunk in qdrant db
        */

        // LOAD THE PDF.
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        // console.log(`Docs:`, docs[0])
        try{
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "models/embedding-001",
    });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: `http://localhost:6333`,
                collectionName: 'langchainjs-testing'
            }
        );
        await vectorStore.addDocuments(docs);
        console.log(`All docs are added to vector store`)
        }
        catch(err){
         console.error(err);
        }
   
    },
    {concurrency: 100,
        connection: {
            host: 'localhost',
            port: '6379'
        },
    }
);

