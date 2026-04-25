import OpenAI from "openai"
import { checkEnvironment } from "./utils.js"

checkEnvironment();

const aiClient = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
    dangerouslyAllowBrowser: true,
  })

const prompt = "Suggest some gifts for someone who loves hiphop music.";

console.log("Prompt:", prompt);
console.log("Making AI request...");

try {
  const response = await aiClient.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    // gpt-5-nano spends tokens on internal reasoning first; a small budget can leave
    // message.content empty. Lower effort + a higher cap leaves room for the actual reply.
    reasoning_effort: "minimal",
    max_completion_tokens: 256,
  });

  console.log("AI response:");
  console.log(response.choices[0].message.content);

} catch (error) {
  if (error.status === 401 || error.status === 403) {
    console.error(
      "Authentication error: Check your AI_KEY and make sure it’s valid."
    );
  } else if (error.status >= 500) {
    console.error(
      "AI provider error: Something went wrong on the provider side. Try again shortly."
    );
  } else {
    console.error(
      "Unexpected error:",
      error.message || error
    );
  }
}
