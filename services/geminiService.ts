
import { GoogleGenAI, Type } from "@google/genai";
import type { User, AISuggestion, QuizQuestion, Spot } from '../types';

const cleanJson = (text: string) => {
  try {
    // Supprime les balises de code markdown si présentes
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  } catch (e) {
    return text;
  }
};

const getAI = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined" || key === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const checkApiKeyStatus = (): boolean => {
  return getAI() !== null;
};

/**
 * Utilise Gemini avec Google Search pour trouver des spots réels.
 */
export const fetchRealTimeSpots = async (): Promise<Spot[]> => {
  const ai = getAI();
  if (!ai) return [];

  try {
    const prompt = `Trouve 6 spots photo/vidéo réels, gratuits et esthétiques à Paris (ex: colonnes, ponts, passages couverts). 
    Pour chaque spot, fournis un objet JSON avec: 
    - id (unique)
    - name (nom du lieu)
    - type ("Indoor" ou "Outdoor")
    - category ("Architecture", "Nature", "Street", etc.)
    - description (court texte de 20 mots max sur pourquoi c'est un bon spot)
    - imageUrl (utilise une URL Unsplash source valide basée sur le nom du lieu, ex: https://source.unsplash.com/featured/?paris,architecture)
    - location (objet avec lat et lng précis)
    
    Retourne UNIQUEMENT le tableau JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              location: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                required: ["lat", "lng"]
              }
            },
            required: ["id", "name", "type", "category", "description", "imageUrl", "location"]
          }
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) return [];

    const jsonStr = cleanJson(textResponse);
    const spots: Spot[] = JSON.parse(jsonStr);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sourceUrl = groundingChunks?.[0]?.web?.uri || "https://www.google.com/maps/search/photo+spots+paris";

    return spots.map(s => ({ 
      ...s, 
      sourceUrl,
      // Force une image un peu plus fiable si l'URL semble vide
      imageUrl: s.imageUrl || `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`
    }));
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
};

export const generateVisualInspiration = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality professional artistic photography inspiration. Theme: ${prompt}.` }]
      }
    });
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const analyzeUserStyle = async (base64Images: string[]): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Style Elite";
  try {
    const parts = base64Images.map(data => ({
      inlineData: { data: data.split(',')[1], mimeType: "image/jpeg" }
    }));
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [...parts, { text: "Analyse le style. 3 adjectifs." }] }
    });
    return response.text || "Professionnel, Lumineux, Épuré";
  } catch (error) { return "Contemporain"; }
};

export const applyAIRetouch = async (imageData: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return imageData;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          { inlineData: { data: imageData.split(',')[1], mimeType: "image/jpeg" } },
          { text: "Applique une retouche pro." }
        ]
      }
    });
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return imageData;
  } catch (error) { return imageData; }
};

export const generateQuizQuestions = async (): Promise<QuizQuestion[]> => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Génère 5 questions de quiz expert photo au format JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER }
            },
            required: ["question", "options", "correctAnswerIndex"]
          }
        }
      }
    });
    return JSON.parse(cleanJson(response.text || "[]"));
  } catch (error) { return []; }
};

export const getAICollaborationSuggestions = async (currentUser: User, viewedUser: User): Promise<AISuggestion[]> => {
  const ai = getAI();
  if (!ai) return [{ userId: viewedUser.id, justification: "Styles complémentaires." }];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Pourquoi un ${currentUser.types.join('/')} et un ${viewedUser.types.join('/')} devraient collaborer ?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: { justification: { type: Type.STRING } }
        }
      }
    });
    const result = JSON.parse(cleanJson(response.text || "{}"));
    return [{ userId: viewedUser.id, justification: result.justification || "Synergie visuelle." }];
  } catch (error) {
    return [{ userId: viewedUser.id, justification: "Belle synergie." }];
  }
};

export const generateChatSuggestion = async (senderType: string, receiverType: string): Promise<string[]> => {
  const ai = getAI();
  if (!ai) return ["Bonjour !"];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `3 amorces pour un ${senderType} contactant un ${receiverType}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(cleanJson(response.text || "[]"));
  } catch (error) { return ["Hello !"]; }
};

export const generateProfileSuggestions = async (userType: string): Promise<{ headlines: string[], bio: string }> => {
  const ai = getAI();
  if (!ai) return { headlines: ["Créateur"], bio: "Passionné." };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Titre et bio pro pour un profil de ${userType}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            bio: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) { return { headlines: ["Artiste"], bio: "Storytelling." }; }
};

export const generateContractClauses = async (professionalType: string, clientType: string): Promise<{ clauses: string[] }> => {
  const ai = getAI();
  if (!ai) return { clauses: ["Clauses standards."] };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `5 clauses de contrat entre un ${professionalType} et un ${clientType}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { clauses: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) { return { clauses: ["Protection."] }; }
};
