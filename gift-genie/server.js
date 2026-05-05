import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie. 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading
- Include a short explanation of why it works

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.`,
  },
];

// Challenge: See challenge.md for instructions
app.post("/api/gift", async (req, res) => {
  try {
    // Step 1 — extract userPrompt from req.body and add to messages
    const userPrompt = req.body.userPrompt;
    // Step 2 — send chat completions request
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [...messages, { role: "user", content: userPrompt }],
      tools: [{ type: "web_search" }],
    });
    // Step 3 — extract content and send back as JSON
    const content = response.choices[0].message.content;
    res.status(200).json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
