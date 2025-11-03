# CourtsApp MCP Server

An example Model Context Protocol (MCP) server implementation in TypeScript with three simple tools.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

The server will start on `http://localhost:3000`

**MCP Client URL:** `http://localhost:3000/sse`

## Tools

This MCP server provides three tools:

### 1. get_current_time
Returns the current date and time in multiple formats.

**Parameters:** None

**Example Response:**
```json
{
  "timestamp": "2025-11-04T05:46:00.000Z",
  "formatted": "11/4/2025, 12:46:00 AM",
  "unix": 1730698360000
}
```

### 2. calculator
Performs basic arithmetic operations.

**Parameters:**
- `operation` (string): The operation to perform - "add", "subtract", "multiply", or "divide"
- `a` (number): The first number
- `b` (number): The second number

**Example Request:**
```json
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

**Example Response:**
```json
{
  "operation": "add",
  "a": 5,
  "b": 3,
  "result": 8,
  "expression": "5 + 3 = 8"
}
```

### 3. is_even
Checks if a number is even or odd.

**Parameters:**
- `number` (number): An integer to check

**Example Request:**
```json
{
  "number": 42
}
```

**Example Response:**
```json
{
  "number": 42,
  "isEven": true,
  "type": "even"
}
```

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Running the Server

Start the HTTP server:
```bash
npm start
```

Or run directly with Node:
```bash
node build/index.js
```

The server will start on port 3000 by default. You can change the port using the PORT environment variable:
```bash
PORT=8080 npm start
```

The server exposes the following endpoints:
- `http://localhost:3000/health` - Health check endpoint
- `http://localhost:3000/sse` - SSE endpoint for MCP connections
- `http://localhost:3000/message` - POST endpoint for client messages

## Development

To watch for changes and rebuild automatically:
```bash
npm run dev
```

## Connecting to an LLM Application

This MCP server uses **SSE (Server-Sent Events) transport over HTTP**, making it accessible via the web. MCP clients can connect to the server over HTTP.

### Example Client Configuration

For MCP clients that support SSE transport, configure with:

```json
{
  "url": "http://localhost:3000/sse"
}
```

### Exposing via Nginx

To expose this server to the internet using nginx, add this configuration to your nginx config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /mcp/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # SSE specific settings
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

Then clients can connect to: `http://your-domain.com/mcp/sse`

## Project Structure

```
CourtsAppMCPServer/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Dependencies

- `@modelcontextprotocol/sdk`: Official MCP SDK for TypeScript
- `express`: Web server framework for HTTP/SSE transport
- `cors`: CORS middleware for cross-origin requests
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## Deployment

### Deploy to a VPS/Cloud Server

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd CourtsAppMCPServer

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Install PM2 to keep the server running
npm install -g pm2

# 5. Start with PM2
pm2 start build/index.js --name mcp-server

# 6. Make it restart on reboot
pm2 startup
pm2 save
```

### Custom Port

```bash
PORT=8080 npm start
```

### Using with ngrok (for testing)

```bash
# Start the server
npm start

# In another terminal, expose it
ngrok http 3000
```

Then use the ngrok URL + `/sse` for your MCP client: `https://your-ngrok-url.ngrok.io/sse`

## License

MIT
