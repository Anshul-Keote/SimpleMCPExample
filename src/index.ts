#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

// Create server instance
const server = new Server(
  {
    name: "courtsapp-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool 1: Get Current Time
// Returns the current date and time
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_current_time",
        description: "Get the current date and time in ISO format",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "calculator",
        description: "Perform basic arithmetic operations (add, subtract, multiply, divide)",
        inputSchema: {
          type: "object",
          properties: {
            operation: {
              type: "string",
              description: "The operation to perform: add, subtract, multiply, or divide",
              enum: ["add", "subtract", "multiply", "divide"],
            },
            a: {
              type: "number",
              description: "The first number",
            },
            b: {
              type: "number",
              description: "The second number",
            },
          },
          required: ["operation", "a", "b"],
        },
      },
      {
        name: "is_even",
        description: "Check if a number is even (returns true) or odd (returns false)",
        inputSchema: {
          type: "object",
          properties: {
            number: {
              type: "number",
              description: "The number to check",
            },
          },
          required: ["number"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_current_time": {
        const now = new Date();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                timestamp: now.toISOString(),
                formatted: now.toLocaleString(),
                unix: now.getTime(),
              }, null, 2),
            },
          ],
        };
      }

      case "calculator": {
        if (!args || typeof args !== "object") {
          throw new Error("Invalid arguments");
        }

        const { operation, a, b } = args as {
          operation: string;
          a: number;
          b: number;
        };

        let result: number;
        switch (operation) {
          case "add":
            result = a + b;
            break;
          case "subtract":
            result = a - b;
            break;
          case "multiply":
            result = a * b;
            break;
          case "divide":
            if (b === 0) {
              throw new Error("Division by zero is not allowed");
            }
            result = a / b;
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                operation,
                a,
                b,
                result,
                expression: `${a} ${operation === "add" ? "+" : operation === "subtract" ? "-" : operation === "multiply" ? "*" : "/"} ${b} = ${result}`,
              }, null, 2),
            },
          ],
        };
      }

      case "is_even": {
        if (!args || typeof args !== "object") {
          throw new Error("Invalid arguments");
        }

        const { number } = args as { number: number };

        if (!Number.isInteger(number)) {
          throw new Error("Input must be an integer");
        }

        const isEven = number % 2 === 0;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                number,
                isEven,
                type: isEven ? "even" : "odd",
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the HTTP server with StreamableHttp transport
async function main() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Enable CORS for all origins (adjust for production)
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Create transport once
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  // Connect server to transport
  await server.connect(transport);

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "healthy", server: "courtsapp-mcp-server" });
  });

  // StreamableHttp endpoint for MCP
  app.post("/mcp", async (req, res) => {
    console.log("New MCP request received");
    await transport.handleRequest(req, res, req.body);
    console.log("MCP request handled");
  });

  app.listen(PORT, () => {
    console.log(`CourtsApp MCP Server running on http://localhost:${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
