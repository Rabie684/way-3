import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiApiResponse } from '../types';

// IMPORTANT: process.env.API_KEY is assumed to be pre-configured.
// Do not ask the user for it or render UI for it.

const getGeminiInstance = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Gemini API calls will fail.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getGeminiResponse = async (prompt: string): Promise<GeminiApiResponse> => {
  const ai = getGeminiInstance();
  if (!ai) {
    return { text: "Error: Gemini API Key not configured." };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Using a general Flash model for text tasks
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are an AI assistant named Jarvis, specializing in Algerian educational content. You provide reliable sources for scientific journal students and answer questions only within the Algerian context. Be concise and helpful. If a question is outside the Algerian context or too broad, politely state that you can only assist with Algerian education-related queries.`,
        tools: [{ googleSearch: {} }], // Enable Google Search for grounding
      },
    });

    const text = response.text;
    const sources: { uri: string; title?: string }[] = [];

    // Extract grounding chunks for URLs
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web && chunk.web.uri) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
        // If Maps grounding were used, you'd extract from chunk.maps here
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: `Error: Failed to get response from AI. Please try again. (${error instanceof Error ? error.message : String(error)})` };
  }
};
