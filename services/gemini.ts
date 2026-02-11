
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityConfig, ActivityData } from "../types";

export const generateActivities = async (config: ActivityConfig): Promise<ActivityData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Você é um especialista em educação infantil e anos iniciais do ensino fundamental (BNCC). 
    Gere ${config.pages} atividades pedagógicas originais e criativas para o nível "${config.level}", 
    do tipo "${config.type}", com o tema "${config.theme}". 
    Cada atividade deve ser única e adequada à idade mencionada.
    O conteúdo deve ser detalhado e textual, pronto para ser impresso. 
    Se a atividade envolver desenho, descreva o que a criança deve desenhar ou completar.
    Se envolver escrita, forneça o texto ou as lacunas.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Título chamativo da atividade" },
            instruction: { type: Type.STRING, description: "Instrução clara e simples para a criança" },
            content: { type: Type.STRING, description: "O corpo da atividade (texto, exercícios, problemas, lacunas)" },
          },
          required: ["title", "instruction", "content"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Erro ao processar JSON do Gemini:", error);
    throw new Error("Falha ao gerar o conteúdo das atividades.");
  }
};
