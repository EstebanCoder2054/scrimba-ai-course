import { checkEnvironment } from "./utils.js";
import OpenAI from "openai"

checkEnvironment();

const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
    dangerouslyAllowBrowser: true,
  })