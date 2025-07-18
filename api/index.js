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

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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
  origin: true,
  credentials: true
}));

// View engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Body parser middleware
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

// Configuration
const CONFIG = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "0.0.0.0",
  MAX_SCRIPT_LENGTH: parseInt(process.env.MAX_SCRIPT_LENGTH) || 50000,
  MAX_SCRIPTS_PER_USER: parseInt(process.env.MAX_SCRIPTS_PER_USER) || 50,
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

// Simple route for testing
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'KULTHX SAFEME',
    message: 'منصة آمنة لحماية نصوص Roblox مع روابط مشفرة'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;

