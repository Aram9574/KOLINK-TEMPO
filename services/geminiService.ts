import { GoogleGenAI, Type } from "@google/genai";
import type { AdvancedSettings, InspirationPost, UserIdentity } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AutopilotGenerationOptions {
    frequency: number;
    themes: string[];
    customTopics: string;
    tone: string;
    advanced: AdvancedSettings;
    identity: UserIdentity;
    inspirationPosts: InspirationPost[];
    bestPractices: string[];
    knowledgeBaseContent: string;
    language: string;
}

interface PostGenerationOptions {
  prompt: string;
  tone: string;
  postType: string;
  customInstructions: string;
  advanced: AdvancedSettings;
  knowledgeBaseContent: string;
  identity: UserIdentity;
  inspirationPosts?: InspirationPost[];
  bestPractices?: string[];
  language: string;
}

const lengthMap = {
  short: 'corto y conciso (alrededor de 50 palabras)',
  medium: 'de longitud media (alrededor de 150 palabras)',
  long: 'detallado y largo (alrededor de 300 palabras)',
}

const emojiMap = {
    none: 'No utilices emojis.',
    subtle: 'Usa 1 o 2 emojis de forma sutil y profesional.',
    moderate: 'Usa entre 3 y 5 emojis para añadir personalidad y mejorar la legibilidad.'
}

const ctaMap = {
    question: 'Termina siempre con una pregunta directa a la audiencia.',
    debate: 'Finaliza invitando a la audiencia a compartir su opinión o a debatir sobre el tema.',
    link: 'Incluye un placeholder como `[enlace]` donde el usuario pueda añadir una URL.',
    none: 'No incluyas una llamada a la acción explícita.'
}

const hashtagsMap = {
    broad: 'Incluye entre 3 y 5 hashtags populares y amplios relacionados con el tema.',
    niche: 'Incluye entre 3 y 5 hashtags muy específicos y de nicho para llegar a una audiencia concreta.',
    none: 'No incluyas hashtags.'
}


export const generatePost = async (options: PostGenerationOptions): Promise<string> => {
  const { prompt, tone, postType, customInstructions, advanced, knowledgeBaseContent, identity, inspirationPosts, bestPractices, language } = options;
  
  try {
    const model = 'gemini-2.5-pro'; // Using Pro for higher quality text generation
    const systemInstruction = `Eres un experto en marketing de contenidos y redes sociales, especializado en crear posts virales para LinkedIn. Tu objetivo es escribir contenido que maximice el engagement, la visibilidad y siga las mejores prácticas de la plataforma.

    Considera siempre los siguientes puntos:
    1.  **Hook potente:** Comienza con una frase que capte la atención inmediatamente.
    2.  **Estructura clara:** Usa párrafos cortos, listas y saltos de línea para facilitar la lectura.
    3.  **Valor aportado:** Ofrece insights, consejos prácticos o perspectivas únicas.

    **IMPORTANTE:** Tu respuesta debe ser ÚNICAMENTE el texto del post para LinkedIn. No incluyas introducciones, saludos, explicaciones o frases como "Aquí tienes el post:". La respuesta debe empezar directamente con el contenido del post.
    `;

    const languageMap = {
      es: 'Español',
      en: 'English',
      fr: 'Français'
    };
    const targetLanguage = languageMap[language as keyof typeof languageMap] || 'Español';

    const identityPrompt = `
      **Identidad del Autor (TÚ):**
      - **Nombre:** ${identity.name}
      - **Titular/Profesión:** ${identity.occupation}
      - **Biografía/Contexto:** ${identity.bio}
      - **Instrucciones de Identidad por Defecto:** ${identity.customInstructions}
      
      Debes escribir el post desde la perspectiva de esta persona, usando su voz y contexto.
    `;
    
    const inspirationPrompt = inspirationPosts && inspirationPosts.length > 0
      ? `\n**Ejemplos de Posts Virales (Inspiración de Estilo):**\nAnaliza los siguientes posts para entender el estilo, tono, formato, uso de emojis y estructura que el usuario prefiere. Aplica estos aprendizajes al generar el nuevo post.\n\n` +
        inspirationPosts.map((p, i) => `--- EJEMPLO ${i + 1} ---\n${p.content}\n--- FIN EJEMPLO ${i + 1} ---`).join('\n\n') + '\n\n'
      : '';

    const knowledgeBasePrompt = knowledgeBaseContent.trim()
      ? `\n**Base de Conocimiento del Usuario (Contexto Clave):**\nUtiliza la siguiente información como contexto principal para dar forma al post. Esta información contiene datos sobre la marca, productos, estilo de comunicación o conocimientos específicos del usuario que deben reflejarse en el contenido.\n\n---\n${knowledgeBaseContent}\n---\n`
      : '';
    
    const bestPracticesPrompt = bestPractices && bestPractices.length > 0
      ? `\n**Mejores Prácticas a Seguir (Instrucciones Adicionales de Estructura y Estilo):**\nAdemás de todo lo anterior, aplica estrictamente las siguientes reglas al generar el post:\n- ${bestPractices.join('\n- ')}\n`
      : '';

    const fullPrompt = `
      **IDIOMA DE SALIDA:** Responde EXCLUSIVAMENTE en **${targetLanguage}**. No incluyas ninguna frase en otro idioma.

      ${identityPrompt}
      ${inspirationPrompt}
      ${knowledgeBasePrompt}
      ${bestPracticesPrompt}

      **Instrucción Específica para este Post:**
      "${prompt}"

      **Parámetros de Personalización:**
      - **Tono:** ${tone}
      - **Tipo de Post:** ${postType}
      - **Instrucciones Adicionales para este post:** ${customInstructions || "Ninguna"}

      **Parámetros de Generación Avanzados:**
      - **Público Objetivo:** ${advanced.audience || "una audiencia profesional general."}
      - **Longitud del Post:** Debe ser ${lengthMap[advanced.length]}.
      - **Uso de Emojis:** ${emojiMap[advanced.emojiUsage]}
      - **Llamada a la Acción (CTA):** ${ctaMap[advanced.cta]}
      - **Estrategia de Hashtags:** ${hashtagsMap[advanced.hashtags]}

      Basado en TODA esta información, genera el post para LinkedIn.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
            systemInstruction,
            temperature: advanced.creativity,
            topP: 1,
            topK: 1,
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text was generated by the API.");
    }
    return text;
  } catch (error) {
    console.error("Error calling Gemini API for text generation:", error);
    throw new Error("Failed to generate post from Gemini API.");
  }
};

export const analyzePostThemes = async (postsContent: string[]): Promise<{ themes: string[] }> => {
    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `Eres un analista de contenido experto en LinkedIn. Tu tarea es identificar los temas principales y recurrentes en un historial de posts de un usuario para entender su área de especialización y sus intereses.`;

        const prompt = `
            Analiza el siguiente historial de posts de LinkedIn y resume los 3 a 5 temas más recurrentes.
            Los temas deben ser concisos y claros (ej: "Inteligencia Artificial en Marketing", "Liderazgo de Equipos Remotos", "Desarrollo de Software Sostenible").

            Historial de Posts:
            ${postsContent.map(p => `- "${p}"`).join('\n')}

            Devuelve el resultado como un objeto JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        themes: {
                            type: Type.ARRAY,
                            description: 'Una lista de 3 a 5 temas clave identificados en los posts.',
                            items: {
                                type: Type.STRING,
                            }
                        }
                    },
                    required: ['themes']
                }
            }
        });

        let jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        if (!parsed.themes || !Array.isArray(parsed.themes)) {
             throw new Error("La respuesta de la API de análisis de temas no tiene el formato esperado.");
        }
        return parsed;

    } catch (error) {
        console.error("Error calling Gemini API for theme analysis:", error);
        throw new Error("Failed to analyze post themes from Gemini API.");
  }
};


export const generateAutopilotSuggestions = async (options: AutopilotGenerationOptions): Promise<{ suggestions: { content: string }[] }> => {
    try {
        const { frequency, themes, customTopics, tone, advanced, identity, inspirationPosts, bestPractices, knowledgeBaseContent, language } = options;

        const model = 'gemini-2.5-flash';
        const systemInstruction = `Eres un estratega de contenido experto en LinkedIn y un asistente de redacción. Tu tarea es generar borradores de posts para LinkedIn que sean relevantes, atractivos y que sigan las mejores prácticas de la plataforma para maximizar el engagement.

    Para cada post, considera siempre los siguientes puntos:
    1.  **Hook potente:** Comienza con una frase que capte la atención inmediatamente.
    2.  **Estructura clara:** Usa párrafos cortos, listas y saltos de línea para facilitar la lectura.
    3.  **Valor aportado:** Ofrece insights, consejos prácticos o perspectivas únicas.

    **IMPORTANTE:** El contenido de cada post debe ser únicamente el texto para LinkedIn. No incluyas introducciones, saludos o explicaciones.`;
        
        const languageMap = {
          es: 'Español',
          en: 'English',
          fr: 'Français'
        };
        const targetLanguage = languageMap[language as keyof typeof languageMap] || 'Español';

        const identityPrompt = `
          **Identidad del Autor (TÚ):**
          - **Nombre:** ${identity.name}
          - **Titular/Profesión:** ${identity.occupation}
          - **Biografía/Contexto:** ${identity.bio}
          - **Instrucciones de Identidad por Defecto:** ${identity.customInstructions}
          
          Debes escribir los posts desde la perspectiva de esta persona, usando su voz y contexto.
        `;

        const themePrompt = themes.length > 0 
            ? `\n**Temas recurrentes identificados en su historial:**\n- ${themes.join('\n- ')}\n\n`
            : '';
            
        const customTopicsPrompt = customTopics.trim() 
            ? `\n**Temas específicos proporcionados por el usuario (priorizar):**\n- ${customTopics.trim()}\n\n`
            : '';
        
        const inspirationPrompt = inspirationPosts && inspirationPosts.length > 0
          ? `**Ejemplos de Posts Virales (Inspiración de Estilo):**\nAnaliza los siguientes posts para entender el estilo, tono y formato que el usuario prefiere. Aplica estos aprendizajes al generar las nuevas sugerencias.\n\n` +
            inspirationPosts.map((p, i) => `--- EJEMPLO ${i + 1} ---\n${p.content}\n--- FIN EJEMPLO ${i + 1} ---`).join('\n\n') + '\n\n'
          : '';

        const knowledgeBasePrompt = knowledgeBaseContent.trim()
          ? `**Base de Conocimiento del Usuario (Contexto Clave):**\nUtiliza la siguiente información como contexto para dar forma a los posts.\n\n---\n${knowledgeBaseContent}\n---\n\n`
          : '';
        
        const bestPracticesPrompt = bestPractices && bestPractices.length > 0
          ? `**Mejores Prácticas a Seguir:**\nAplica estrictamente las siguientes reglas al generar cada post:\n- ${bestPractices.join('\n- ')}\n\n`
          : '';

        const prompt = `
            **IDIOMA DE SALIDA:** Genera todos los posts EXCLUSIVAMENTE en **${targetLanguage}**.

            ${identityPrompt}
            ${inspirationPrompt}
            ${knowledgeBasePrompt}
            ${bestPracticesPrompt}

            **Contexto e Inspiración Adicional:**
            Basado en TODA la información anterior, y la siguiente, genera ${frequency} borradores de posts para LinkedIn.
            
            ${themePrompt}
            ${customTopicsPrompt}

            **Directivas de Contenido Avanzadas:**
            - **Tono:** ${tone}.
            - **Longitud del Post:** Debe ser ${lengthMap[advanced.length]}.
            - **Llamada a la Acción (CTA):** ${ctaMap[advanced.cta]}.
            - **Estrategia de Hashtags:** ${hashtagsMap[advanced.hashtags]}.
            - **Público Objetivo:** ${advanced.audience || "una audiencia profesional general."}

            **Instrucciones para los posts:**
            1. Cada post debe ser único y estar alineado con el área de expertise del autor.
            2. Cada post debe tener una estructura clara, usando párrafos cortos y saltos de línea para que sea fácil de leer en dispositivos móviles.
            3. Varía el formato de los posts (ej. un consejo, una pregunta, una reflexión).
            
            Devuelve el resultado como un objeto JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                temperature: advanced.creativity,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    content: {
                                        type: Type.STRING,
                                        description: 'El texto completo del post sugerido para LinkedIn.'
                                    }
                                },
                                required: ['content']
                            }
                        }
                    },
                    required: ['suggestions']
                }
            }
        });

        let jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
             throw new Error("La respuesta de la API no tiene el formato esperado.");
        }
        return parsed;

    } catch (error) {
        console.error("Error calling Gemini API for Autopilot suggestions:", error);
        throw new Error("Failed to generate Autopilot suggestions from Gemini API.");
    }
};

export const enhancePrompt = async (rawPrompt: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `Eres un experto en "prompt engineering". Tu tarea es reescribir el siguiente prompt de usuario para que sea más claro, detallado y efectivo para una IA que genera posts de LinkedIn.
        Mantén la intención original del usuario, pero enriquece el prompt con detalles que podrían mejorar el resultado.
        Por ejemplo, si el usuario dice "post sobre IA", podrías convertirlo en "Escribe un post para LinkedIn sobre el impacto de la Inteligencia Artificial en el marketing digital, destacando 3 beneficios clave para pequeñas empresas y terminando con una pregunta para fomentar el debate".
        El resultado debe ser únicamente el prompt mejorado, sin ninguna explicación o texto adicional.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: `Prompt del usuario: "${rawPrompt}"`,
            config: {
                systemInstruction,
                temperature: 0.3,
            }
        });

        const enhancedPromptText = response.text;
        if (!enhancedPromptText) {
            console.warn("Prompt enhancement returned empty text, returning original prompt.");
            return rawPrompt;
        }
        
        return enhancedPromptText.trim().replace(/^"|"$/g, '');

    } catch (error) {
        console.error("Error calling Gemini API for prompt enhancement:", error);
        return rawPrompt; 
    }
};