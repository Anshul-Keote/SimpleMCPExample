// Simple test client for MCP server
// Make sure your server is running on port 3000 before running this

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function testMCPServer() {
  console.log("🧪 Testing MCP Server...\n");

  // Create client
  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect to server
    const transport = new StreamableHTTPClientTransport(
      new URL("http://localhost:3000/mcp")
    );
    await client.connect(transport);
    console.log("✅ Connected to server\n");

    // List available tools
    const tools = await client.listTools();
    console.log("📋 Available tools:");
    tools.tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test 1: get_current_time
    console.log("🕐 Testing get_current_time...");
    const timeResult = await client.callTool({
      name: "get_current_time",
      arguments: {},
    });
    console.log("Result:", JSON.parse(timeResult.content[0].text));
    console.log();

    // Test 2: calculator - addition
    console.log("➕ Testing calculator (add)...");
    const addResult = await client.callTool({
      name: "calculator",
      arguments: {
        operation: "add",
        a: 10,
        b: 5,
      },
    });
    console.log("Result:", JSON.parse(addResult.content[0].text));
    console.log();

    // Test 3: calculator - multiply
    console.log("✖️  Testing calculator (multiply)...");
    const multiplyResult = await client.callTool({
      name: "calculator",
      arguments: {
        operation: "multiply",
        a: 7,
        b: 6,
      },
    });
    console.log("Result:", JSON.parse(multiplyResult.content[0].text));
    console.log();

    // Test 4: calculator - divide
    console.log("➗ Testing calculator (divide)...");
    const divideResult = await client.callTool({
      name: "calculator",
      arguments: {
        operation: "divide",
        a: 20,
        b: 4,
      },
    });
    console.log("Result:", JSON.parse(divideResult.content[0].text));
    console.log();

    // Test 5: is_even - even number
    console.log("🔢 Testing is_even (even number: 42)...");
    const evenResult = await client.callTool({
      name: "is_even",
      arguments: {
        number: 42,
      },
    });
    console.log("Result:", JSON.parse(evenResult.content[0].text));
    console.log();

    // Test 6: is_even - odd number
    console.log("🔢 Testing is_even (odd number: 17)...");
    const oddResult = await client.callTool({
      name: "is_even",
      arguments: {
        number: 17,
      },
    });
    console.log("Result:", JSON.parse(oddResult.content[0].text));
    console.log();

    console.log("✅ All tests completed successfully!");

    await client.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testMCPServer();
