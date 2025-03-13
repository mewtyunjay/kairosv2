import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { TaskCategory, TaskPriority } from '../types/task';

// Read API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Gemini API Key is missing, please check your environment variables.");
}

interface TaskResponse {
  taskTitle: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  duration?: string;
  scheduledFor?: string;
}

export const extractTaskInfo = async (text: string): Promise<TaskResponse> => {
  try {
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Configure the model with JSON output
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Define the JSON schema for the task response
    const schema = `
      Task = {
        "taskTitle": string,
        "category": ["Work", "Personal", "Health", "Shopping", "Other"],
        "priority": ["Low", "Medium", "High"],
        "duration": string,
        "scheduledFor": string
      }
    `;

    const prompt = `
      Extract structured task information from this description: "${text}"
      Since you know the schema, format the tasks based on what the field is for. For eg, if a user says 5PPM, you know it means 5PM.
      Use the following JSON schema for the response:
      ${schema}
      
      Return a JSON object with these fields: taskTitle, category, priority, duration, scheduledFor.
      Only include fields if they're clearly specified in the text.
      Example response format:
      {"taskTitle":"Design landing page","category":"Work","priority":"High","duration":"02:00","scheduledFor":"9:00 AM - 11:00 AM"}
    `;

    // Generate content with structured output
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Parse the JSON response
    const taskData = await response.text();
    console.log('Gemini API received response:', taskData);
    const parsedData = JSON.parse(taskData) as TaskResponse;
    
    // Set default duration of 1 hour if not specified
    const defaultDuration = "01:00";
    
    return {
      taskTitle: parsedData.taskTitle || text,
      category: parsedData.category as TaskCategory,
      priority: parsedData.priority as TaskPriority,
      duration: parsedData.duration || defaultDuration, // Use default if not provided
      scheduledFor: parsedData.scheduledFor
    };
    
  } catch (error) {
    console.error('Error extracting task info:', error);
    // Fallback to original text if API fails
    return { taskTitle: text };
  }
};
