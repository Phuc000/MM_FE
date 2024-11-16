import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
  } from "@google/generative-ai";
  import { INITIAL_PROMPT } from "../constants/INITIAL_PROMPT";
  
  const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL_NAME;
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Global variable to hold the initialized chat session
  let chatSession; // chatSession is a global variable to hold the initialized chat session
  
  export async function initializeChat() {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
      const generationConfig = {
        temperature: 1,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 2048,
      };
  
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];
  
      // Start chat with initial prompt
      chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: INITIAL_PROMPT,
          },
        ],
      });
  
      console.log(
        "Chat session initialized successfully with the initial prompt."
      );
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  }
  
  async function runChat(prompt) {
    try {
      // Ensure chatSession is initialized
      if (!chatSession) {
        await initializeChat();
      }
  
      // Send user prompt to the existing chat session
      const result = await chatSession.sendMessage(prompt);
      const response = result.response;
      console.log(response.text());
      return response.text();
    } catch (error) {
      console.error("Error in runChat:", error);
      return "Sorry, I am not able to respond to that.";
    }
  }
  
  export default runChat;