import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

// Logs from this file appear in the browser DevTools console (not the terminal where `npm start` runs).
console.log("messagesContext.js loaded");

checkEnvironment();

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

/*The AI model does not remember anything
 *from previous API calls.
 *If you want the model to respond to a follow-up,
 *you must include earlier messages again
 *in the next request.
 *The messages array is the ONLY context the model sees.
 */

const messages = [
  {
    role: "user",
    content: `Suggest some gifts for someone who loves hiphop music. 
          Make these suggestions thoughtful and practical. Your response 
          must be under 100 words. Skip intros and conclusions. 
          Only output gift suggestions.`,
  },
];

const completionOpts = {
  reasoning_effort: "minimal",
  max_completion_tokens: 1024,
};

try {
  const firstResponse = await openai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages,
    ...completionOpts,
  });

  // Extract the model's generated text from the response
  console.log(firstResponse.choices[0].message.content);

  // message property has role and content in it already
  const firstAssistantMessage = firstResponse.choices[0].message;
  messages.push(firstAssistantMessage);

  messages.push({
    role: "user",
    content: "More budget friendly. Less than $40.",
  });

  // Send second chat completions request with extended messages array
  const secondResponse = await openai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages,
    ...completionOpts,
  });

  console.log("Budget friendly suggestions:");
  console.log(secondResponse.choices[0].message.content);
} catch (error) {
  console.error("messagesContext request failed:", error.message || error);
}
