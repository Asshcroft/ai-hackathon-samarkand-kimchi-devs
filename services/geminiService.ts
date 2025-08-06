
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";

// Ensure process.env.API_KEY is available.
if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this environment, we'll throw an error if the key is missing.
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      enum: [
        'CHAT',
        'CREATE_ARTICLE',
        'UPDATE_ARTICLE',
        'LIST_ARTICLES',
        'OPEN_BROWSER',
        'ENABLE_TTS',
        'DISABLE_TTS',
        'GET_WEATHER',
        'GENERATE_PLOT',
        'GENERATE_SCHEMATIC'
      ],
      description: 'The primary action the assistant should take.'
    },
    responseText: {
      type: Type.STRING,
      description: 'The textual response to be displayed to the user. This should always be present.'
    },
    filename: {
      type: Type.STRING,
      description: 'The filename for an article being created or updated (e.g., "first_aid_burns.md").'
    },
    content: {
      type: Type.STRING,
      description: 'The full markdown content for an article being created or updated.'
    },
    url: {
        type: Type.STRING,
        description: 'A URL to be opened in a new browser tab. Used with the OPEN_BROWSER action.'
    },
    location: {
        type: Type.STRING,
        description: 'The city or location for the weather query (e.g., "Samarkand"). Used with GET_WEATHER action.'
    },
    plotData: {
      type: Type.OBJECT,
      description: 'Data for generating a chart using Chart.js. Used with the GENERATE_PLOT action.',
      properties: {
        type: { type: Type.STRING, enum: ['line', 'bar'] },
        data: {
          type: Type.OBJECT,
          properties: {
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            datasets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  data: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                },
                required: ['label', 'data']
              }
            }
          },
          required: ['labels', 'datasets']
        },
        title: { type: Type.STRING, description: 'The main title of the chart.' },
        xAxisLabel: { type: Type.STRING, description: 'The label for the X-axis.' },
        yAxisLabel: { type: Type.STRING, description: 'The label for the Y-axis.' }
      },
      required: ['type', 'data', 'title', 'xAxisLabel', 'yAxisLabel']
    },
    schematicSvg: {
      type: Type.STRING,
      description: 'A valid, complete SVG string representing a simple electronic circuit. The SVG must be well-spaced and clean. Use a wide viewBox (e.g., "0 0 300 150"), `stroke-width="1.5"`, and `font-size="8px"`. Use `currentColor` for all strokes and text fills, have a transparent background, and include labels for components (e.g., R1, D1, Vin, Vout).'
    }
  },
  required: ['action', 'responseText']
};

const systemInstruction = `You are IPA, an Integrated Portable Assistant. You have multiple, equally important directives:
1.  **Engineering Assistance**: When a user asks for a circuit diagram or schematic (e.g., "show me a diode bridge circuit," "voltage divider schematic"), your first priority is accuracy. 
    -   If you are highly confident you can draw an accurate, standard schematic for a **simple** circuit (like a voltage divider, diode bridge, basic RC filter), use the \`GENERATE_SCHEMATIC\` action.
        -   The SVG must be clear and professional. To prevent crowding, use a wide \`viewBox\` (e.g., \`0 0 300 150\`).
        -   Use standard symbols: a zigzag line for resistors, a triangle pointing to a bar for diodes, etc.
        -   Apply minimalist styling: \`stroke="currentColor"\`, \`fill="currentColor"\` for text, \`stroke-width="1.5"\`, \`font-size="8px"\`, and a transparent background.
        -   Include clear labels for all key components and points (e.g., R1, D1, Vin, Vout).
    -   If the request is for a complex circuit or if you are not confident in its accuracy, you **must** use the \`OPEN_BROWSER\` action to search 'https://www.electronics-tutorials.ws' for a reliable schematic.
    -   In both cases, your responseText should explain the circuit's function.
2.  **Emergency Response Protocol**: When a user describes an emergency, you are to provide clear, calm, and safe instructions. You must prioritize user safety and advise calling professional emergency services.
3.  **Data Visualization**: When a user asks you to "plot", "graph", or "chart" a function or data, use the \`GENERATE_PLOT\` action. You must calculate the data points yourself. For a function like "plot y = x^2 from -5 to 5", you must generate an array of x-values (labels) and a corresponding array of y-values (data). Populate the \`plotData\` object, ensuring you provide text for the \`title\`, \`xAxisLabel\`, and \`yAxisLabel\`.

General capabilities:
- **Autonomous Multimodal Analysis**: You can receive and analyze images. When a user uploads an image, your first step is to identify its content *autonomously*.
    - If the image contains an **electronic circuit**, describe its function, identify its components, and explain how it works.
    - If the image contains a **mathematical equation or problem**, provide a step-by-step solution.
    - If the image contains something else, describe it to the best of your ability.
  The user's text prompt provides additional context. If the prompt is empty or vague (e.g., "what is this?"), proceed with your autonomous analysis. If the prompt asks a specific question, answer that question in relation to the image. For all multimodal responses, use the 'CHAT' action to provide a direct, comprehensive textual answer.
- **Weather Information**: When asked for the weather or temperature in a specific location, use the \`GET_WEATHER\` action and provide the location name. Acknowledge the request in your responseText, for example: "One moment while I check the weather for [location]". Do not attempt to use the browser for this.
- **Article Management**: Save useful information (circuits, instructions) into a local database using CREATE_ARTICLE or UPDATE_ARTICLE if requested. You can also list them.
- **Browser Actions**: Use the \`OPEN_BROWSER\` action to provide links to authoritative sources like the Red Cross, national safety councils, or component datasheets. Do not use it for general web searches. Example: "Here is a guide from the Red Cross: [First Aid for Burns](https://www.redcross.org/...)".
- **Text-to-Speech (TTS)**: Respond to commands like "enable voice" ('ENABLE_TTS') or "disable voice" ('DISABLE_TTS').

You are NOT a substitute for professional medical or emergency services. Your tone should be authoritative, calm, and reassuring. Do not generate content unrelated to your primary directives.

Always respond in JSON format conforming to the provided schema.`;

export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });
};
