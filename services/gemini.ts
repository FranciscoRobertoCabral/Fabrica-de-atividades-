
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityConfig, ActivityData, ActivityPack } from "../types";

async function generateImage(prompt: string): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High contrast black and white line art, children coloring book style. White background. Clear thick black outlines. No gray, no colors. Subject: ${prompt}` }],
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.error("Erro na imagem:", error);
  }
  return undefined;
}

export const generateActivities = async (
  config: ActivityConfig, 
  onProgress?: (msg: string) => void
): Promise<ActivityPack> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (onProgress) onProgress("Criando roteiro pedagógico...");

  const textPrompt = `Aja como um especialista em pedagogia infantil (BNCC). 
    Gere um pacote completo de atividades.
    Nível: "${config.level}"
    Tipo: "${config.type}"
    Tema: "${config.theme}"
    Quantidade: ${config.pages} páginas.
    
    Crie um nome criativo para o caderno no campo 'collectionName'. 
    Para cada atividade, forneça título, instrução, conteúdo e um imagePrompt (em inglês) para o desenho.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: textPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          collectionName: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ["title", "instruction", "content", "imagePrompt"],
            }
          }
        },
        required: ["collectionName", "activities"]
      },
    },
  });

  let text = response.text || "{}";
  // Limpeza de possíveis wrappers de markdown que a IA possa enviar mesmo em modo JSON
  text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  
  let pack: ActivityPack;
  try {
    pack = JSON.parse(text);
  } catch (error) {
    console.error("Erro ao parsear JSON:", text);
    throw new Error("Resposta da IA inválida.");
  }

  for (let i = 0; i < pack.activities.length; i++) {
    if (onProgress) onProgress(`Ilustrando atividade ${i + 1} de ${pack.activities.length}...`);
    const imageData = await generateImage(pack.activities[i].imagePrompt);
    pack.activities[i].imageData = imageData;
  }

  return pack;
};
