# KULTHX SAFEME - Secure Roblox Script Platform

## Overview

KULTHX SAFEME is a secure platform for protecting and sharing Roblox scripts with encrypted loadstrings. The application allows users to upload, encrypt, and share their Roblox scripts through secure links and loadstrings that can be executed in Roblox environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Node.js with Express.js for the web server
- **Real-time Communication**: Socket.IO for live user count and real-time features
- **Template Engine**: Handlebars (HBS) for server-side rendering
- **Security**: Helmet.js for security headers, CORS for cross-origin handling
- **Performance**: Compression middleware for response optimization

### Frontend Architecture
- **Styling**: Tailwind CSS for modern, responsive UI design
- **Client-side JavaScript**: Vanilla JavaScript for DOM manipulation and API interactions
- **Real-time Updates**: Socket.IO client for live features

### Data Storage
- **Primary Storage**: File-based JSON storage (scripts.json)
- **In-memory Cache**: JavaScript objects for runtime data management
- **No Database**: Currently uses simple file system storage without traditional database

## Key Components

### Core Modules
1. **Script Management**: Create, read, update, delete operations for protected scripts
2. **Encryption System**: Crypto module for generating secure links and encrypting script content
3. **Real-time Features**: Live user count tracking via Socket.IO
4. **Security Layer**: Rate limiting, input validation, and secure headers
5. **API Endpoints**: RESTful routes for script operations

### File Structure
- `server.js`: Main application entry point and Express server configuration
- `public/`: Static assets including CSS and JavaScript files
- `views/`: Handlebars templates for server-side rendering
- `scripts.json`: JSON file for persistent script storage

## Data Flow

1. **Script Upload**: Users submit scripts through web interface
2. **Encryption**: Scripts are encrypted using Node.js crypto module
3. **Storage**: Encrypted scripts stored in JSON file with metadata
4. **Link Generation**: Unique encrypted links created for each script
5. **Loadstring Creation**: Secure loadstrings generated for Roblox executors
6. **Real-time Updates**: Socket.IO broadcasts user activity and statistics

## External Dependencies

### Core Dependencies
- **Express**: Web application framework
- **Socket.IO**: Real-time bidirectional event-based communication
- **Handlebars**: Template engine for server-side rendering
- **Helmet**: Security middleware for HTTP headers
- **Body-parser**: Request body parsing middleware
- **Compression**: Response compression middleware
- **CORS**: Cross-Origin Resource Sharing middleware
- **Dotenv**: Environment variable management

### Frontend Dependencies
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Custom CSS**: Additional styling for animations and components
- **Vanilla JavaScript**: No frontend frameworks, pure JavaScript implementation

## Deployment Strategy

### Container Support
- **Docker Ready**: Application is containerized for easy deployment
- **Cloud Native**: Optimized specifically for Koyeb platform deployment

### Environment Configuration
- **Development**: Local development with hot reloading capabilities
- **Production**: Optimized for cloud deployment with security hardening
- **Environment Variables**: Configuration through .env files for different environments

### Security Considerations
- **Input Validation**: Client and server-side validation for script content
- **Rate Limiting**: Protection against abuse and spam
- **Secure Headers**: Helmet.js configuration for security best practices
- **CORS Policy**: Controlled cross-origin access based on environment

### Performance Optimizations
- **Compression**: Response compression for faster load times
- **Static Asset Serving**: Efficient static file delivery
- **Memory Management**: In-memory caching for frequently accessed data
- **Socket.IO Optimization**: Efficient real-time communication handling

## Notes

- The application currently uses file-based storage but may be migrated to a proper database solution like PostgreSQL in the future
- The system is designed for the Roblox scripting community with specific focus on script protection and sharing
- Real-time features enhance user experience with live statistics and activity monitoring