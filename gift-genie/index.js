import OpenAI from "openai";
import { autoResizeTextarea, checkEnvironment, setLoading } from "./genieUtils.js";
checkEnvironment();

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    Your response must be under 100 words. 
    Skip intros and conclusions. 
    Only output gift suggestions.`,
  },
];

async function handleGiftRequest(e) {
    try {
         // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  // Set loading state
  setLoading(true);

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [...messages, {
        role: 'user',
        content: userPrompt,
    }],
    max_completion_tokens: 256,
    reasoning_effort: "minimal",
  })

  const responseForTheUser = response.choices[0].message.content
  console.log('[🧪] ~ handleGiftRequest ~ responseForTheUser:', responseForTheUser)

//   outputContent.append(responseForTheUser)
  outputContent.textContent = responseForTheUser

  // Clear loading state
  setLoading(false);
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
    } finally {
        setLoading(false);
    }
 
}

start();
