
import { GoogleGenAI, Type } from "@google/genai";
import type { User, AISuggestion, QuizQuestion } from '../types';

const cleanJson = (text: string) => {
  try {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    return jsonMatch ? jsonMatch[0] : text;
  } catch (e) {
    return text;
  }
};

const getAI = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined" || key === "") {
    console.warn("Elite AI: API Key missing in process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const checkApiKeyStatus = (): boolean => {
  return getAI() !== null;
};

export const generateVisualInspiration = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality professional artistic photography inspiration for a moodboard. Theme: ${prompt}. Cinematic lighting, professional aesthetic, detailed textures, masterpiece.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    // Recherche récursive de l'image dans les parts de la réponse
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
    console.error("Image Generation Error:", error);
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
      contents: {
        parts: [
          ...parts,
          { text: "Analyse le style de ces images. Retourne 3 adjectifs séparés par des virgules." }
        ]
      }
    });

    return response.text || "Professionnel, Lumineux, Épuré";
  } catch (error) {
    return "Contemporain";
  }
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
          { text: "Applique une retouche pro : améliore le contraste et la clarté." }
        ]
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
    return imageData;
  } catch (error) {
    return imageData;
  }
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
  } catch (error) {
    return [];
  }
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
  } catch (error) {
    return ["Hello !"];
  }
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
  } catch (error) {
    return { headlines: ["Artiste"], bio: "Storytelling." };
  }
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
  } catch (error) {
    return { clauses: ["Protection."] };
  }
};
