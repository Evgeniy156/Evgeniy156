import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { DEIR_SYSTEM_INSTRUCTION } from "../constants";

export const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to strip markdown symbols
const cleanText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '') // remove bold
    .replace(/\*/g, '')   // remove italics/bullets
    .replace(/###/g, '')  // remove headers
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/^---/gm, '') // remove horizontal rules
    .replace(/`/g, '')    // remove code ticks
    .trim();
};

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[],
  newMessage: string,
  attachment?: { mimeType: string; data: string } | null,
  contextInstruction?: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Ошибка: API Key не настроен.";

  try {
    // Feature: AI powered chatbot with Thinking Mode
    // Model: gemini-3-pro-preview
    // Constraint: Set thinkingBudget, remove maxOutputTokens
    const model = 'gemini-3-pro-preview'; 
    
    // Construct current user message parts
    const currentParts: any[] = [{ text: newMessage }];
    
    // Add attachment if exists
    if (attachment) {
      currentParts.unshift({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    // Combine Base Instruction with Dynamic Context
    const fullSystemInstruction = `${DEIR_SYSTEM_INSTRUCTION}\n\n${contextInstruction || ''}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [
        ...history,
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction: fullSystemInstruction,
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
        // maxOutputTokens is intentionally removed to allow full thinking output
      }
    });

    const rawText = response.text || "Энергия мысли пока не оформилась в слова... попробуйте снова.";
    return cleanText(rawText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Связь с информационным полем прервана. Возможно, перегрузка ментального канала.";
  }
};

// Feature: Transcribe audio using gemini-3-flash-preview
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Transcribe this audio exactly as spoken in Russian."
          }
        ]
      }
    });
    return response.text || null;
  } catch (error) {
    console.error("Transcription Error:", error);
    return null;
  }
};

// Helper to construct constrained prompt
const createConstrainedPrompt = (userPrompt: string, stageContext?: string) => {
    if (!stageContext) return userPrompt;
    return `
    CONTEXT RESTRICTION: The user is currently at this development stage: "${stageContext}".
    
    SOURCE MATERIAL AUTHORITY:
    You are visualizing energy structures based STRICTLY on the "DEIR" (Verischagin) system textbooks and practicum exercises provided in the context.
    
    VISUAL RULES:
    1. ALLOWED CONCEPTS: Visualize ONLY concepts explicitly listed in the Stage Context or from previous stages.
    2. FORBIDDEN CONCEPTS: Do NOT use imagery, symbols, or advanced energy structures from higher stages (e.g. do not show "Karma" if user is at Stage 1).
    3. STYLE: Esoteric, dark background, glowing neon energy lines, schematic yet artistic, "Etheric vision" style.
    4. ACCURACY: If the user prompts for a specific technique (like "Obolochka" or "Program"), adhere strictly to the visual description in the practicum (e.g. shape, flow direction, color).
    
    USER PROMPT: ${userPrompt}
    `;
};

// Nano Banana (Fast) Image Generation for Monitor
export const generateFastImage = async (prompt: string, stageContext?: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const finalPrompt = createConstrainedPrompt(prompt, stageContext);
    
    // Nano Banana model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      // Note: responseMimeType/Schema not supported for nano banana
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Fast Image Gen Error:", error);
    throw error;
  }
};

// Updated to use gemini-3-pro-image-preview with size selection
// Added "Harry Potter Style" injection
export const generateDeirImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K', stageContext?: string): Promise<string | null> => {
  // Always create a new instance to capture the latest API KEY from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const magicStyle = "Cinematic shot, Harry Potter movie style, magical realism, 8k resolution, glowing magical energy, detailed particle effects, mystical atmosphere, volumetric lighting.";
    const constrainedPrompt = createConstrainedPrompt(prompt, stageContext);
    const enhancedPrompt = `${magicStyle} Visualization of: ${constrainedPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: enhancedPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// New: Edit Image using gemini-2.5-flash-image
// Added "Harry Potter Style" injection
export const editDeirImage = async (base64Image: string, prompt: string, stageContext?: string): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Extract base64 data and mime type
  const match = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  
  const mimeType = match[1];
  const data = match[2];

  try {
    const magicStyle = "Harry Potter magic style, cinematic lighting, glowing ethereal energy, high fantasy, 8k, photorealistic magic effects.";
    const constrainedPrompt = createConstrainedPrompt(prompt, stageContext);
    const enhancedPrompt = `${magicStyle} Add the following effect to the image: ${constrainedPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: enhancedPrompt
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// New: Generate Video using Veo
export const generateDeirVideo = async (
  base64Image: string | null, 
  aspectRatio: '16:9' | '9:16',
  prompt?: string,
  stageContext?: string
): Promise<string | null> => {
  // Use a fresh client instance to ensure latest key if selected via UI
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const constrainedPrompt = createConstrainedPrompt(prompt || "Cinematic motion, high quality, magical energy flow", stageContext);

    const request: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: constrainedPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    };

    // Add image if provided, otherwise it's text-to-video
    if (base64Image) {
        const match = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (match) {
             request.image = {
                imageBytes: match[2],
                mimeType: match[1],
            };
        }
    }

    let operation = await ai.models.generateVideos(request);

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Fetch the actual video bytes using the API Key
      const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
      const videoBlob = await videoResponse.blob();
      return URL.createObjectURL(videoBlob);
    }
    return null;
  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

// Streaming Debate Function for Neural Debate
export const runDebateStream = async function* (topic: string) {
  const ai = getAiClient();
  if (!ai) return;
  
  const prompt = `
  ТЫ - СИМУЛЯТОР НЕЙРОННЫХ ДЕБАТОВ. Твоя задача - проанализировать проблему с двух сторон.
  Тема пользователя: "${topic}"
  
  На каждом шаге ты должен думать как Agent_A, а затем как Agent_B,
  отвечая так, как будто два умных спорщика ведут диалог.

  Шаг 1: Агенты представляют свои аргументы
  initial_plan = Agent_A.develop_initial_plan()
  
  Шаг 2: Критика рассуждений друг друга (Фаза Дебатов)
  critique_B = Agent_B.critique(initial_plan, “возражаю”)
  
  Шаг 3: Агенты отвечают на критику (Фаза Опровержения)
  rebuttal_A = Agent_A.rebut(critique_B, “контраргументы”)
  
  Шаг 4: Корректировка на основе опровержений (Фаза Корректировки)
  adjusted_plan = Agent_A.adjust(rebuttal_A)

  ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ВЫВОДА (Используй эти теги для разделения):
  [AGENT_A_INIT]
  ...текст плана Агента А...
  
  [AGENT_B_CRITIQUE]
  ...текст критики Агента Б...
  
  [AGENT_A_REBUTTAL]
  ...текст опровержения Агента А...
  
  [FINAL_PLAN]
  ...финальный скорректированный план...

  Пиши на русском языке. Будь конкретен и креативен. Агент А - Стратег. Агент Б - Скептик.
  `;

  try {
     const response = await ai.models.generateContentStream({
       model: 'gemini-3-pro-preview',
       contents: [{ role: 'user', parts: [{ text: prompt }] }],
       config: {
         thinkingConfig: { thinkingBudget: 16384 }, // Allow deep reasoning for the debate
       }
     });
     
     for await (const chunk of response) {
       yield chunk.text;
     }
  } catch (e) {
    console.error("Debate Error:", e);
    throw e;
  }
};