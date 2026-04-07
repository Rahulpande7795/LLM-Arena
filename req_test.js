const fetch = require("node-fetch");

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name:        "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: {
            type:        "string",
            description: "City name e.g. London, Mumbai, New York",
          },
          unit: {
            type:        "string",
            enum:        ["celsius", "fahrenheit"],
            description: "Temperature unit",
          },
        },
        required: ["city", "unit"],
      },
    },
  }
];

async function test() {
  const body = {
    model: "meta/llama-3.1-8b-instruct",
    messages: [
      { role: "user", content: "What is the weather in London?" }
    ],
    stream: false,
    tools: TOOL_DEFINITIONS,
    tool_choice: "auto",
    max_tokens: 1024
  };

  const res = await fetch("http://localhost:8000/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  console.log(res.status);
  const data = await res.json();
  console.log(JSON.stringify(data.choices[0], null, 2));
}

test();
