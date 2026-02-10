
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const handleApiError = (error: any, context: string) => {
  console.error(`Gemini API Error [${context}]:`, error);
  
  // Detect 403 Permission Denied or 404 Not Found (common for key issues in this env)
  const errorMessage = error?.message || "";
  const isPermissionError = errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED");
  const isNotFoundError = errorMessage.includes("404") || errorMessage.includes("Requested entity was not found");

  if (isPermissionError || isNotFoundError) {
    throw new Error('NEEDS_PAID_KEY');
  }

  if (errorMessage.includes('xhr') || error?.code === 500) {
    throw new Error('Neural bridge disruption. Please verify connection and retry.');
  }
  throw error;
};

export const chatWithGemini = async (message: string, history: {role: string, parts: any[]}[]) => {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: 'You are a helpful and versatile AI assistant in the HIET Studio. Provide concise and accurate answers.',
      }
    });
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (e) {
    return handleApiError(e, 'Chat');
  }
};

export const generateTextForge = async (prompt: string, tone: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a high-quality response for the following prompt in a ${tone} tone: \n\n${prompt}`,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text;
  } catch (e) {
    return handleApiError(e, 'TextForgeGen');
  }
};

export const humanizeText = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Act as a professional human editor. Rewrite the following text to sound completely natural and human-like. 
      Eliminate repetitive AI-style structures, improve rhythm, vary sentence length, and use nuanced vocabulary. 
      Ensure the meaning stays intact but the prose feels alive and authentic: \n\n${text}`,
      config: {
        temperature: 0.9,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text;
  } catch (e) {
    return handleApiError(e, 'TextForgeHumanize');
  }
};

export const summarizeText = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please summarize the following text in a structured way with key bullet points: \n\n${text}`,
    });
    return response.text;
  } catch (e) {
    return handleApiError(e, 'Summarizer');
  }
};

export const extractTextFromImage = async (base64Image: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
          { text: 'Extract all the text visible in this image. Maintain the layout structure if possible.' }
        ]
      },
    });
    return response.text;
  } catch (e) {
    return handleApiError(e, 'OCR');
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '1:1' }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image generated');
  } catch (e) {
    return handleApiError(e, 'ImageGen');
  }
};

export const editImage = async (base64Image: string, prompt: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: prompt }
        ]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No edit returned');
  } catch (e) {
    return handleApiError(e, 'ImageEdit');
  }
};

export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const textToSpeech = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio returned");
    return base64Audio;
  } catch (e) {
    return handleApiError(e, 'TTS');
  }
};
