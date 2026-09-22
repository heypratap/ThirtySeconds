import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Calls Google Gemini Flash model with strict JSON response mode
 * @param {string} systemInstruction - Guiding system prompt
 * @param {string} userPrompt - Main user prompt / untrusted data prompt
 * @returns {Promise<any>} Parsed JSON object from Gemini
 */
export async function callGeminiJson(systemInstruction, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️ GEMINI_API_KEY is not configured in .env. Returning smart mock response.');
    return null; // Will trigger fallback generator in generator.js
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    
    // Parse JSON
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}
