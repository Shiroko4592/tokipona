const apiKey = process.env.AI_API_KEY;

const response = await fetch("https://gateway.ai.cloudflare.com/.../openai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "hi" }]
  })
});
