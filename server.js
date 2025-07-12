import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import crypto from "crypto";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { saveScript, getScript, getAllScripts, deleteScript } from './supabase-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? false : true,
  credentials: true
}));

// View engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || "0.0.0.0",
  MAX_SCRIPT_LENGTH: parseInt(process.env.MAX_SCRIPT_LENGTH) || 50000,
  MAX_SCRIPTS_PER_USER: parseInt(process.env.MAX_SCRIPTS_PER_USER) || 50,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

// In-memory database (for rate limiting only)
let userRequestCounts = new Map();

// Rate limiting
function rateLimit(req, res, next) {
  const userIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - CONFIG.RATE_LIMIT_WINDOW_MS;
  
  if (!userRequestCounts.has(userIP)) {
    userRequestCounts.set(userIP, []);
  }
  
  const requests = userRequestCounts.get(userIP);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= CONFIG.MAX_RATE_LIMIT_REQUESTS) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  
  recentRequests.push(now);
  userRequestCounts.set(userIP, recentRequests);
  next();
}

// Input validation
function validateScript(script) {
  if (!script || typeof script !== "string") {
    return "Script must be a non-empty string";
  }
  if (script.trim().length === 0) {
    return "Script cannot be empty";
  }
  if (script.length > CONFIG.MAX_SCRIPT_LENGTH) {
    return `Script too long. Maximum ${CONFIG.MAX_SCRIPT_LENGTH} characters allowed`;
  }
  return null;
}

function validateUserId(userId) {
  if (!userId || typeof userId !== "string") {
    return "Invalid user ID";
  }
  if (userId.length < 10 || userId.length > 100) {
    return "User ID must be between 10 and 100 characters";
  }
  return null;
}

// Routes - All routes now serve the single page
app.get("/", (req, res) => {
  res.render("index", {
    title: "KULTHX SAFEME - حماية نصوص Roblox",
    scriptCount: 0 // Will be updated dynamically by client-side
  });
});

app.get("/real-home", (req, res) => {
  res.render("index", {
    title: "KULTHX SAFEME - حماية نصوص Roblox",
    scriptCount: 0 // Will be updated dynamically by client-side
  });
});

app.get("/my-scripts", (req, res) => {
  res.render("index", {
    title: "KULTHX SAFEME - حماية نصوص Roblox",
    scriptCount: 0 // Will be updated dynamically by client-side
  });
});

app.post("/generate", rateLimit, async (req, res) => {
  try {
    const { script, userId } = req.body;
    
    // Validate inputs
    const scriptError = validateScript(script);
    if (scriptError) {
      return res.status(400).json({ error: scriptError });
    }
    
    const userIdError = validateUserId(userId);
    if (userIdError) {
      return res.status(400).json({ error: userIdError });
    }

    // Check user script limit
    const allUserScripts = await getAllScripts();
    const userScriptCount = allUserScripts.filter(s => s.userId === userId).length;
    if (userScriptCount >= CONFIG.MAX_SCRIPTS_PER_USER) {
      return res.status(400).json({ 
        error: `Maximum ${CONFIG.MAX_SCRIPTS_PER_USER} scripts per user allowed` 
      });
    }

    // Normalize script for comparison
    const normalizedScript = script.trim().replace(/\s+/g, " ");
    
    // Check for duplicate script by same user
    const existingScript = allUserScripts.find(
      (data) => data.userId === userId && 
        data.script.trim().replace(/\s+/g, " ") === normalizedScript
    );
    
    if (existingScript) {
      const id = existingScript.id;
      const url = `${req.protocol}://${req.get("host")}/script.lua?id=${id}`;
      return res.status(400).json({
        error: "This script is already protected!",
        loadstring: `loadstring(game:HttpGet("${url}"))()`,
        id
      });
    }

    // Generate unique ID
    const id = crypto.randomBytes(16).toString("hex");
    
    // Store script
    const newScriptData = {
      id,
      script: script.trim(),
      userId,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: null
    };

    const savedScript = await saveScript(newScriptData);
    
    if (!savedScript) {
      throw new Error("Failed to save script to Supabase");
    }

    const url = `${req.protocol}://${req.get("host")}/script.lua?id=${id}`;
    const loadstring = `loadstring(game:HttpGet("${url}"))()`;
    
    res.json({ loadstring, id });
  } catch (err) {
    console.error("❌ Generate error:", err);
    res.status(500).json({ error: "Server error while generating link" });
  }
});

app.get("/script.lua", async (req, res) => {
  try {
    const id = req.query.id;
    const scriptData = await getScript(id);

    if (!id || !scriptData) {
      return res.status(404).send("-- Invalid or expired script link!");
    }

    // Check User-Agent for Roblox
    const userAgent = req.headers["user-agent"] || "";
    const isRoblox = userAgent.includes("Roblox") || userAgent.includes("HttpGet");
    
    if (!isRoblox) {
      return res.status(403).send("-- Access denied: This endpoint is for Roblox execution only");
    }

    // Update access statistics
    // Note: Supabase update logic would go here if needed, for now just serve
    // scriptData.accessCount = (scriptData.accessCount || 0) + 1;
    // scriptData.lastAccessed = new Date().toISOString();
    // await updateScript(scriptData.id, { accessCount: scriptData.accessCount, lastAccessed: scriptData.lastAccessed });

    res.type("text/plain").send(scriptData.script);
  } catch (err) {
    console.error("❌ Script fetch error:", err);
    res.status(500).send("-- Server error");
  }
});

app.post("/my-scripts", async (req, res) => {
  try {
    const { userId } = req.body;
    
    const userIdError = validateUserId(userId);
    if (userIdError) {
      return res.status(400).json({ error: userIdError });
    }

    const allUserScripts = await getAllScripts();
    const userScripts = allUserScripts
      .filter(script => script.userId === userId)
      .map(script => ({
        id: script.id,
        script: script.script,
        createdAt: script.createdAt,
        accessCount: script.accessCount || 0,
        lastAccessed: script.lastAccessed,
        loadstring: `loadstring(game:HttpGet("${req.protocol}://${req.get("host")}/script.lua?id=${script.id}"))()`
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userScripts);
  } catch (err) {
    console.error("❌ Fetch scripts error:", err);
    res.status(500).json({ error: "Server error while fetching scripts" });
  }
});

app.post("/my-scripts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { script, userId } = req.body;
    
    const existingScript = await getScript(id);

    if (!id || !existingScript) {
      return res.status(404).json({ error: "Script not found" });
    }
    
    if (existingScript.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    
    const scriptError = validateScript(script);
    if (scriptError) {
      return res.status(400).json({ error: scriptError });
    }

    // Check for duplicate script by same user
    const allUserScripts = await getAllScripts();
    const normalizedScript = script.trim().replace(/\s+/g, " ");
    const duplicateScript = allUserScripts.find(
      (data) => data.id !== id && 
        data.userId === userId && 
        data.script.trim().replace(/\s+/g, " ") === normalizedScript
    );
    
    if (duplicateScript) {
      return res.status(400).json({ error: "This script is already protected by you!" });
    }

    // Update script in Supabase
    const { data, error } = await supabase
      .from("scripts")
      .update({ script: script.trim(), updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating script:", error);
      return res.status(500).json({ error: "Failed to update script" });
    }

    res.json({ message: "Script updated successfully" });
  } catch (err) {
    console.error("❌ Update script error:", err);
    res.status(500).json({ error: "Server error while updating script" });
  }
});

app.delete("/my-scripts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const existingScript = await getScript(id);

    if (!id || !existingScript) {
      return res.status(404).json({ error: "Script not found" });
    }
    
    if (existingScript.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const deleted = await deleteScript(id);
    if (!deleted) {
      throw new Error("Failed to delete script from Supabase");
    }

    res.json({ message: "Script deleted successfully" });
  } catch (err) {
    console.error("❌ Delete script error:", err);
    res.status(500).json({ error: "Server error while deleting script" });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const scriptCount = (await getAllScripts()).length;
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      scripts: scriptCount
    });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

// 404 handler - redirect to main page
app.use((req, res) => {
  res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    error: "500 - Internal Server Error",
    message: process.env.NODE_ENV === "production" 
      ? "Something went wrong on our end."
      : err.message
  });
});

// Socket.IO for online users tracking
let onlineUsers = 0;
io.on("connection", (socket) => {
  onlineUsers++;
  console.log(`✅ User connected. Online users: ${onlineUsers}`);
  io.emit("onlineUsers", onlineUsers);

  socket.on("disconnect", () => {
    onlineUsers--;
    console.log(`❌ User disconnected. Online users: ${onlineUsers}`);
    io.emit("onlineUsers", onlineUsers);
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("📤 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("📤 SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Process terminated");
    process.exit(0);
  });
});

// Initialize and start server
async function startServer() {
  try {
    server.listen(CONFIG.PORT, CONFIG.HOST, () => {
      console.log(`🚀 KULTHX SAFEME Server running on ${CONFIG.HOST}:${CONFIG.PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`💾 Database: Supabase`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();


