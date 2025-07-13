import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SCRIPTS_FILE = './scripts.json';

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json({ limit: '10kb' }));

// Database functions
async function readScripts() {
    try {
        const data = await fs.readFile(SCRIPTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(SCRIPTS_FILE, '[]');
            return [];
        }
        console.error('Error reading scripts file:', error);
        return [];
    }
}

async function getScript(id) {
    const scripts = await readScripts();
    return scripts.find(script => script.id === id);
}

async function updateScript(id, updates) {
    let scripts = await readScripts();
    const index = scripts.findIndex(script => script.id === id);
    if (index === -1) return false;

    scripts[index] = { ...scripts[index], ...updates };
    
    try {
        await fs.writeFile(SCRIPTS_FILE, JSON.stringify(scripts, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing scripts file:', error);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'KULTHX SAFEME Discord Bot Server',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

app.get('/script.lua', async (req, res) => {
    try {
        const id = req.query.id;
        
        if (!id) {
            return res.status(400).send('-- Missing script ID');
        }

        const scriptData = await getScript(id);
        if (!scriptData) {
            return res.status(404).send('-- Script not found or expired');
        }

        // Check User-Agent for Roblox
        const userAgent = req.headers['user-agent'] || '';
        const isRoblox = userAgent.includes('Roblox') || userAgent.includes('HttpGet');
        
        if (!isRoblox) {
            return res.status(403).send('-- Access denied: This endpoint is for Roblox execution only');
        }

        // Update access statistics
        const accessCount = (scriptData.accessCount || 0) + 1;
        const lastAccessed = new Date().toISOString();
        
        await updateScript(id, { accessCount, lastAccessed });

        // Return the script
        res.type('text/plain').send(scriptData.script);
        
        console.log(`✅ Script ${id} accessed. Total accesses: ${accessCount}`);
    } catch (error) {
        console.error('❌ Script fetch error:', error);
        res.status(500).send('-- Server error');
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        const scripts = await readScripts();
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            scripts: scripts.length
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        error: '500 - Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong on our end.'
            : err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📤 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📤 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 KULTHX SAFEME Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

