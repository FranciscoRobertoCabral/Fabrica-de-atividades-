
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityConfig, ActivityPack } from "../types";

async function generateImage(prompt: string): Promise<string | undefined> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key não encontrada.");
    return undefined;
  }

  const ai = new GoogleGenAI({ apiKey });
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
    console.error("Erro na geração de imagem:", error);
  }
  return undefined;
}

export const generateActivities = async (
  config: ActivityConfig, 
  onProgress?: (msg: string) => void
): Promise<ActivityPack> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave de API (API_KEY) não configurada no ambiente. Por favor, adicione-a nas variáveis de ambiente do Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  if (onProgress) onProgress("Criando roteiro pedagógico...");

  const textPrompt = `Aja como um especialista em pedagogia infantil (BNCC). 
    Gere um pacote completo de atividades originais.
    Nível: "${config.level}"
    Tipo: "${config.type}"
    Tema: "${config.theme}"
    Quantidade: ${config.pages} páginas.
    
    Crie um nome criativo para o caderno no campo 'collectionName'. 
    Para cada atividade, forneça título, instrução, conteúdo e um imagePrompt (em inglês) para o desenho de colorir.`;

  try {
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
    
    // Limpeza rigorosa para evitar que blocos de código Markdown quebrem o JSON.parse
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "").trim();
    }
    
    let pack: ActivityPack;
    try {
      pack = JSON.parse(text);
    } catch (parseError) {
      console.error("Falha no parse do JSON. Conteúdo bruto:", text);
      throw new Error("A IA gerou um formato de dados inválido. Tente novamente com um tema mais simples.");
    }

    if (!pack.activities || pack.activities.length === 0) {
      throw new Error("Nenhuma atividade foi gerada. Tente mudar o tema.");
    }

    for (let i = 0; i < pack.activities.length; i++) {
      if (onProgress) onProgress(`Ilustrando atividade ${i + 1} de ${pack.activities.length}...`);
      const imageData = await generateImage(pack.activities[i].imagePrompt);
      pack.activities[i].imageData = imageData;
    }

    return pack;
  } catch (error: any) {
    console.error("Erro fatal no Gemini Service:", error);
    
    // Tratamento de erros específicos da API para o usuário
    if (error?.message?.includes("API_KEY")) {
      throw new Error("Erro de autenticação: API_KEY inválida ou ausente.");
    }
    
    if (error?.message?.includes("safety")) {
      throw new Error("O conteúdo solicitado foi bloqueado pelos filtros de segurança. Tente outro tema.");
    }

    throw new Error(error.message || "Erro desconhecido ao conectar com a IA.");
  }
};
