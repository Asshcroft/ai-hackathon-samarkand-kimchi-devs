import { GoogleGenAI } from '@google/genai';
import logger from '../config/logger.js';

// Проверяем наличие API ключа
if (!process.env.GEMINI_API_KEY) {
  logger.error('GEMINI_API_KEY environment variable not set.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
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
      type: 'string',
      description: 'The textual response to be displayed to the user. This should always be present.'
    },
    filename: {
      type: 'string',
      description: 'The filename for an article being created or updated (e.g., "first_aid_burns.md").'
    },
    content: {
      type: 'string',
      description: 'The full markdown content for an article being created or updated.'
    },
    url: {
      type: 'string',
      description: 'A URL to be opened in a new browser tab. Used with the OPEN_BROWSER action.'
    },
    location: {
      type: 'string',
      description: 'The city or location for the weather query (e.g., "Samarkand"). Used with GET_WEATHER action.'
    },
    plotData: {
      type: 'object',
      description: 'Data for generating a chart using Chart.js. Used with the GENERATE_PLOT action.',
      properties: {
        type: { type: 'string', enum: ['line', 'bar'] },
        data: {
          type: 'object',
          properties: {
            labels: { type: 'array', items: { type: 'string' } },
            datasets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  data: { type: 'array', items: { type: 'number' } }
                },
                required: ['label', 'data']
              }
            }
          },
          required: ['labels', 'datasets']
        },
        title: { type: 'string', description: 'The main title of the chart.' },
        xAxisLabel: { type: 'string', description: 'The label for the X-axis.' },
        yAxisLabel: { type: 'string', description: 'The label for the Y-axis.' }
      },
      required: ['type', 'data', 'title', 'xAxisLabel', 'yAxisLabel']
    },
    schematicSvg: {
      type: 'string',
      description: 'A valid, complete SVG string representing a simple electronic circuit.'
    }
  },
  required: ['action', 'responseText']
};

const systemInstruction = `You are IPA, an Integrated Portable Assistant. You have multiple, equally important directives:
1.  **Engineering Assistance**: When a user asks for a circuit diagram or schematic, your first priority is accuracy. 
    -   If you are highly confident you can draw an accurate, standard schematic for a **simple** circuit, use the \`GENERATE_SCHEMATIC\` action.
    -   If the request is for a complex circuit or if you are not confident in its accuracy, you **must** use the \`OPEN_BROWSER\` action to search for a reliable schematic.
    -   In both cases, your responseText should explain the circuit's function.
2.  **Emergency Response Protocol**: When a user describes an emergency, you are to provide clear, calm, and safe instructions. You must prioritize user safety and advise calling professional emergency services.
3.  **Data Visualization**: When a user asks you to "plot", "graph", or "chart" a function or data, use the \`GENERATE_PLOT\` action. You must calculate the data points yourself.

General capabilities:
- **Autonomous Multimodal Analysis**: You can receive and analyze images. When a user uploads an image, your first step is to identify its content *autonomously*.
- **Weather Information**: When asked for the weather or temperature in a specific location, use the \`GET_WEATHER\` action and provide the location name.
- **Article Management**: 
    - When a user asks you to "create an article", "write an article", "create a new article", "add new data", or similar requests, you should:
        1. First provide a comprehensive response in the chat (responseText) with the article content
        2. Then automatically save it as a .md file using the CREATE_ARTICLE action
        3. Use descriptive filenames like "first_aid_burns.md", "voltage_divider_circuit.md", "emergency_protocols.md"
    - Save useful information (circuits, instructions, protocols) into a local database using CREATE_ARTICLE or UPDATE_ARTICLE
    - You can also list articles using LIST_ARTICLES action
    - Always use the CREATE_ARTICLE action when creating new content that should be saved
- **Browser Actions**: Use the \`OPEN_BROWSER\` action to provide links to authoritative sources.
- **Text-to-Speech (TTS)**: Respond to commands like "enable voice" ('ENABLE_TTS') or "disable voice" ('DISABLE_TTS').

You are NOT a substitute for professional medical or emergency services. Your tone should be authoritative, calm, and reassuring.

Always respond in JSON format conforming to the provided schema.`;

export const createChatSession = () => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    logger.info('Chat session created successfully');
    return chat;
  } catch (error) {
    logger.error('Error creating chat session:', error);
    throw error;
  }
};

export const sendMessage = async (chat, message, imageFile = null) => {
  try {
    logger.info('Sending message to Gemini API', { 
      messageLength: message.length, 
      hasImage: !!imageFile 
    });

    let response;
    if (imageFile) {
      const imagePart = {
        inlineData: {
          data: imageFile.toString('base64'),
          mimeType: 'image/jpeg'
        }
      };
      const textPart = { text: message };
      const parts = [textPart, imagePart];
      response = await chat.sendMessage({ message: parts });
    } else {
      response = await chat.sendMessage({ message });
    }

    const jsonText = response.text.trim();
    let actionData;
    
    try {
      actionData = JSON.parse(jsonText);
      logger.info('Gemini response parsed successfully', { action: actionData.action });
    } catch (e) {
      logger.error('Invalid JSON response from AI:', jsonText);
      if (jsonText) {
        actionData = { action: 'CHAT', responseText: jsonText };
      } else {
        throw new Error('Invalid or empty response from AI.');
      }
    }

    return actionData;
  } catch (error) {
    logger.error('Error sending message to Gemini:', error);
    throw error;
  }
};
