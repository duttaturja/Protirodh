// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Use 'gemini-1.5-flash' for speed and cost-effectiveness (supports both text and vision)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Helper to fetch an image from a URL and convert it to base64
 * needed because Gemini Node SDK expects base64 data parts.
 */
async function urlToGenerativePart(url: string, mimeType: string = "image/jpeg") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

/**
 * Generates a description of a crime scene based on an uploaded image.
 */
export async function generateImageDescription(imageUrl: string): Promise<string> {
  try {
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const imagePart = await urlToGenerativePart(imageUrl);
    
    const prompt = "Analyze this image of a potential crime scene or hazard. Provide a factual, objective description of what is happening. Focus on visual evidence like damage, weapons, crowds, or hazards. Keep it under 50 words. Do not hallucinate details not present.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text() || "No description generated.";
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    throw new Error(error.message || "Failed to generate description");
  }
}

/**
 * Analyzes report data to calculate a 'fake report' confidence score.
 */
export async function analyzeReportAuthenticity(
  title: string,
  description: string,
  location: string
): Promise<{ score: number; reasoning: string }> {
  try {
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    const prompt = `
      Analyze the following crime report for potential authenticity.
      
      Title: "${title}"
      Description: "${description}"
      Location: "${location}"

      Task:
      1. Check for vagueness, clickbait style, or logical inconsistencies.
      2. Compare title and description for mismatch.
      3. Provide a "Confidence Score" from 0 to 100 (where 100 is highly likely to be authentic/serious, and 0 is likely spam/fake).
      4. Provide a 1-sentence reasoning.

      Return ONLY valid JSON in this format (no code blocks):
      {
        "score": number,
        "reasoning": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up code blocks if Gemini includes them (e.g. ```json ... ```)
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("Gemini Fake Detection Error:", error);
    return { score: 50, reasoning: "AI analysis unavailable." };
  }
}