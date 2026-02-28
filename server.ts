import express from "express";
import { createServer as createViteServer } from "vite";
import { MongoClient, ObjectId } from "mongodb";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sigean";
const DB_NAME = "sigean";

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SERVER] Attempting to connect to MongoDB...`);
  let db: any;
  try {
    // Force a timeout so it doesn't hang forever if the IP is wrong
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    db = client.db(DB_NAME);
    console.log("[SERVER] ✅ Connected successfully to MongoDB");
  } catch (error: any) {
    console.error("[SERVER] ❌ Failed to connect to MongoDB:", error.message);
    console.error("[SERVER] TIP: If using a local DB, 'localhost' won't work. Use a tunnel (ngrok) or MongoDB Atlas.");
  }

  app.use(express.json());

  // Global logging middleware
  app.use((req, res, next) => {
    console.log(`[SERVER] Request: ${req.method} ${req.url}`);
    next();
  });

  // API Status/Ping
  app.get("/api/ping", (req, res) => {
    res.json({ pong: true, dbConnected: !!db });
  });

  // Dynamic API Handler for all collections
  const validCollections = ["usuarios", "roles", "permisos", "modulos", "opciones"];

  app.get("/api/:collection", async (req, res) => {
    const { collection } = req.params;
    console.log(`[SERVER] Dynamic GET: ${collection}`);
    
    if (!validCollections.includes(collection)) {
      return res.status(404).json({ error: "Collection not found" });
    }

    try {
      if (!db) {
        console.error("[SERVER] DB not connected during GET");
        return res.status(400).json({ error: "Base de datos no conectada. Por favor, configura MONGODB_URI." });
      }
      const items = await db.collection(collection).find({}).toArray();
      res.json(items.map((item: any) => ({ ...item, id: item._id.toString() })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/:collection", async (req, res) => {
    const { collection } = req.params;
    if (!validCollections.includes(collection)) return res.status(404).json({ error: "Collection not found" });
    
    try {
      if (!db) return res.status(400).json({ error: "Base de datos no conectada" });
      const result = await db.collection(collection).insertOne(req.body);
      res.status(201).json({ id: result.insertedId.toString(), ...req.body });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/:collection/:id", async (req, res) => {
    const { collection, id } = req.params;
    if (!validCollections.includes(collection)) return res.status(404).json({ error: "Collection not found" });
    
    try {
      if (!db) return res.status(400).json({ error: "Base de datos no conectada" });
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID format" });
      const { id: _, ...updateData } = req.body;
      await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      res.json({ id, ...updateData });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/:collection/:id", async (req, res) => {
    const { collection, id } = req.params;
    if (!validCollections.includes(collection)) return res.status(404).json({ error: "Collection not found" });
    
    try {
      if (!db) return res.status(400).json({ error: "Base de datos no conectada" });
      if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID format" });
      await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API 404 handler
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: process.cwd(),
      configFile: path.resolve(process.cwd(), "vite.config.ts"), 
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (req.url.startsWith("/api")) return next();
      try {
        const template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(req.url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
