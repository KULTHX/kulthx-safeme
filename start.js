import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Starting KULTHX SAFEME Discord Bot...');

// Start the HTTP server
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
});

// Start the Discord bot
const bot = spawn('node', ['bot.js'], {
    stdio: 'inherit',
    env: process.env
});

// Handle server process
server.on('close', (code) => {
    console.log(`🌐 Server process exited with code ${code}`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Handle bot process
bot.on('close', (code) => {
    console.log(`🤖 Bot process exited with code ${code}`);
});

bot.on('error', (error) => {
    console.error('❌ Bot error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📤 Shutting down gracefully...');
    server.kill('SIGTERM');
    bot.kill('SIGTERM');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📤 Shutting down gracefully...');
    server.kill('SIGTERM');
    bot.kill('SIGTERM');
    process.exit(0);
});

