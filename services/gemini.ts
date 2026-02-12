
import { GoogleGenAI, Type } from "@google/genai";
import { ActivityConfig, ActivityData, ActivityPack } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Simple black and white line art for kids coloring book, white background, thick clean lines, no shading, pedagogical illustration of: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
  }
  return undefined;
}

export const suggestActivityNames = async (config: ActivityConfig): Promise<string[]> => {
  const prompt = `Como um especialista em educação lúdica e branding pedagógico, sugira EXATAMENTE 5 nomes curtos, criativos e cativantes para um caderno de atividades.
    Nível: ${config.level}
    Tipo: ${config.type}
    Tema: ${config.theme}
    Regras: Os nomes devem ser em Português, variados entre si (ex: um focado em aventura, outro em descoberta, outro em magia) e adequados para a idade selecionada.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista com exatamente 5 nomes sugeridos"
      },
    },
  });

  try {
    const names = JSON.parse(response.text || "[]");
    return names.slice(0, 5); // Garante que temos no máximo 5
  } catch (e) {
    return [
      `Aventura: ${config.theme}`, 
      `Explorando o Mundo: ${config.theme}`,
      `O Reino de ${config.theme}`,
      `Pequenos Gênios: ${config.theme}`,
      `Magia do Saber: ${config.theme}`
    ];
  }
};

export const generateActivities = async (
  config: ActivityConfig, 
  chosenName: string,
  onProgress?: (msg: string) => void
): Promise<ActivityPack> => {
  
  if (onProgress) onProgress("Organizando o plano de aula...");

  const textPrompt = `Você é um especialista em educação infantil e anos iniciais (BNCC). 
    Gere um pacote de atividades pedagógicas chamado "${chosenName}".
    Nível: "${config.level}"
    Tipo: "${config.type}"
    Tema: "${config.theme}"
    
    O pacote deve conter exatamente ${config.pages} atividades.
    Cada atividade individual deve ter um título único, instrução clara e um "imagePrompt" em inglês para uma ilustração simples de colorir.`;

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

  let pack: ActivityPack;
  try {
    pack = JSON.parse(response.text || "{}");
    pack.collectionName = chosenName;
  } catch (error) {
    throw new Error("Falha ao processar o plano das atividades.");
  }

  for (let i = 0; i < pack.activities.length; i++) {
    if (onProgress) onProgress(`Criando desenho ${i + 1} de ${pack.activities.length}...`);
    const imageData = await generateImage(pack.activities[i].imagePrompt);
    pack.activities[i].imageData = imageData;
  }

  return pack;
};
