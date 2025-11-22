const apiKey = process.env.AI_API_KEY;

const response = await fetch("https://gateway.ai.cloudflare.com/.../openai/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${vck_0vRjXM2tJSERsVP8VlGAKZh9PlHnC7BwSMCPrSfuso8Wp484Q5000waW}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "hi" }]
  })
});
