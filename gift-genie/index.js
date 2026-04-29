import OpenAI from "openai";
import {
  autoResizeTextarea,
  checkEnvironment,
  setLoading,
  showStream,
} from "./genieUtils.js";
import { marked } from "marked";
import DOMPurify from "dompurify";

checkEnvironment();

//asynchronous iterable

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
// the system prompt is the initial context for the AI
// it can react to contextual clues in the user's input

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie that can search the web! 

    You generate gift ideas that feel thoughtful, specific, and genuinely useful.
    Your output must be in structured Markdown.
    Do not write introductions or conclusions.
    Start directly with the gift suggestions.
    
    Each gift must:
    - Have a clear heading with the actual product's name
    - Include a short explanation of why it works
    - Include the current price or a price range
    - Include one or more links to websites or social media business pages
    where the gift can be bought
    
    Prefer products that are widely available and well-reviewed.
    If you can't find a working link, say so rather than guessing.
    
    If the user mentions a location, situation, or constraint,
    adapt the gift ideas and add another short section 
    under each gift that guides the user to get the gift in that 
    constrained context.
    
    After the gift ideas, include a section titled "Questions for you"
    with clarifying questions that would help improve the recommendations.
    
    Finish with a section with H2 heading titled "Wanna browse yourself?"
    with links to various ecommerce sites with relevant search queries and filters 
    already applied.`,
  },
  // -------------------------------------------------------------
  // Here starts the shot prompting technique, giving it an example or a patter so the model can learn from it and the response will be more consistent and accurate.
  // -------------------------------------------------------------
  {
    role: "user",
    content:
      "dubai airport. last minute gifts for niece (arts & crafts) and nephew who loves football",
  },
  {
    role: "assistant",
    content: `
### Travel Art Kit for Niece (Compact & Portable)

A small, kid-friendly arts & crafts item that's easy to pack and perfect for a quick creative distraction during travel.

**How to get it:**
1. Head to Dubai International Airport (DXB) and proceed to Terminal 3 Departures.
2. Visit Dubai Duty Free or a nearby WHSmith that carries kids’ stationery.
3. Ask for compact arts & crafts kits or a coloring book with pencils.
4. Choose a lightweight option suitable for carry-on.
5. Request gift wrapping if available.

---

### Mini Football Keychain for Nephew

A light, inexpensive football-themed souvenir that’s easy to carry and perfect for an airport purchase.

**How to get it:**
1. Visit Dubai Duty Free or a souvenir shop near the gates.
2. Ask for football-themed keychains or small sports souvenirs.
3. Check toy or sports sections if needed.
4. Purchase and pack securely.

---

## Questions for you
1. What are the ages of your niece and nephew?
2. Do you have a budget per gift?
3. Are you departing from Terminal 3?
4. Does your nephew support a specific team?
`,
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

    const stream = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [
        ...messages,
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_completion_tokens: 256,
      reasoning_effort: "minimal",
      stream: true,
      // tools: [{ type: 'web_search' }] // this is the tool that allows the model to search the web for current information - but only available using the responses api
    });

    // streaming magic goes here --------------------------------------------

    let responseForTheUser = "";
    // Show the output container immediately (for streaming feedback)
    showStream();

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0].delta.content || "";
      responseForTheUser += chunkContent;
      const html = marked.parse(responseForTheUser);
      const sanitizedHTML = DOMPurify.sanitize(html);
      // Display the sanitized HTML
      outputContent.innerHTML = sanitizedHTML;
    }

    // Streaming magic ends here --------------------------------------------

    /* if i want to wait for the entire response to be generated, i can do this: 
    *
    const responseForTheUser = response.choices[0].message.content;

    // AI output must be treated as untrusted input.
    // Sanitize and escape HTML to prevent XSS attacks.
    const markdownHTML = marked.parse(responseForTheUser);
    const sanitizedHTML = DOMPurify.sanitize(markdownHTML);
    
    outputContent.innerHTML = sanitizedHTML;
    */

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
      console.error("Unexpected error:", error.message || error);
    }
  } finally {
    setLoading(false);
  }
}

start();
