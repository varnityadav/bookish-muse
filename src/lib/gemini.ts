/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Quote, Genre, Mood, UserPreferences } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchCuratedQuote(
  prefs: UserPreferences,
  currentMood?: Mood,
  specificGenre?: Genre,
  isDiscovery: boolean = false
): Promise<Quote> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert curator of impactful, emotional, and well-written text snippets.
    Your goal is to provide a single, deeply resonant quote from literature, scripts, philosophy, or manga.
    
    CRITERIAL FOR "IMPACTFUL":
    1. Known for its use in famous speeches or movie scripts.
    2. Famous turning points in novels or manga.
    3. Words that evoke strong emotional responses (melancholy, resolve, awe).
    4. Extremely well-written prose or dialogue.
    
    USER PREFERENCES:
    - Genres: ${prefs.genres.join(", ")}
    - Authors: ${prefs.authors.join(", ")}
    ${currentMood ? `- Requested Mood: ${currentMood}` : ""}
    ${specificGenre ? `- Specific Genre: ${specificGenre}` : ""}
    ${isDiscovery ? "- DISCOVERY MODE: Pick something completely unrelated to the user's preferred genres to broaden their horizons." : ""}
    
    INSTRUCTIONS:
    - Return a single quote object in JSON format.
    - If isDiscovery is true, bypass the user's favorite genres and pick something high-quality from a different category.
    - The backgroundPrompt should be a 3-5 word description of a grayscale, atmospheric high-quality photograph that matches the quote's emotion (e.g., "misty forest grayscale morning", "urban rain city lights monochrome").
    - The musicMood should be a brief description of ambient music (e.g., "soft piano with vinyl crackle", "minimalist cinematic synth").
  `;

  const response = await ai.models.generateContent({
    model,
    contents: "Curate a quote that matches my criteria.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          author: { type: Type.STRING },
          source: { type: Type.STRING },
          category: { type: Type.STRING },
          context: { type: Type.STRING, description: "Brief context of when this was said/written" },
          backgroundPrompt: { type: Type.STRING },
          musicMood: { type: Type.STRING }
        },
        required: ["text", "author", "source", "category", "backgroundPrompt", "musicMood"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as Quote;
  } catch (e) {
    console.error("Failed to parse quote:", e);
    throw new Error("Could not curate quote");
  }
}
