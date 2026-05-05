import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Quick check that this process is running: open http://localhost:3001/api/health in the browser
// (or curl it) while Gift Genie dev is up.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gift-genie-api" });
});

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

app.post("/api/gift", async (req, res) => {
  try {
    const userPrompt = req.body?.userPrompt;
    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid userPrompt" });
    }

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [...messages, { role: "user", content: userPrompt }],
      reasoning_effort: "minimal",
      max_completion_tokens: 2048,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content ?? "";
    if (!content) {
      console.warn(
        "[gift] Empty assistant text. finish_reason=%s choice=%s",
        choice?.finish_reason,
        JSON.stringify(choice?.message),
      );
    }
    res.status(200).json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Gift Genie API listening at http://localhost:${PORT}`);
});
