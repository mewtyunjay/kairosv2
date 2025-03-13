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

interface MultiTaskResponse {
  tasks: TaskResponse[];
}

export const extractTaskInfo = async (text: string): Promise<TaskResponse[]> => {
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
      
      MultiTaskResponse = {
        "tasks": [Task]
      }
    `;

    const prompt = `
      Extract structured task information from this description: "${text}"
      Since you know the schema, format the tasks based on what the field is for. For eg, if a user says 5PPM, you know it means 5PM.
      Use the following JSON schema for the response:
      ${schema}
      
      IMPORTANT: If the input contains multiple distinct tasks or events (e.g., "sleep at 12-6am, breakfast at 8"), create separate task objects for each one.
      
      For the duration field:
      - If the user explicitly specifies a duration, use that value
      - For time ranges (e.g., "12-6am"), calculate the duration automatically
      - If not specified, intelligently estimate a reasonable duration based on the task complexity:
        - Simple tasks (e.g., "reply to email", "make a call"): 00:30 (30 minutes)
        - Medium tasks (e.g., "write a report", "prepare presentation"): 01:00 (1 hour)
        - Complex tasks (e.g., "code a feature", "research topic"): 02:00 (2 hours)
        - Very complex tasks (e.g., "complete project", "develop application"): 04:00 (4 hours)
        - Meals (e.g., "breakfast", "lunch", "dinner"): 00:30 (30 minutes)
        - Sleep: Calculate based on the time range or default to 08:00 (8 hours)
      - Format as HH:MM (hours:minutes)
      
      For other fields, only include them if they're clearly specified in the text.
      
      Return a JSON object with an array of tasks. Each task should have these fields: taskTitle, category, priority, duration, scheduledFor.
      
      Example response format for multiple tasks:
      {
        "tasks": [
          {"taskTitle":"Sleep","category":"Health","priority":"Medium","duration":"06:00","scheduledFor":"12:00 AM - 6:00 AM"},
          {"taskTitle":"Breakfast","category":"Health","priority":"Medium","duration":"00:30","scheduledFor":"8:00 AM - 8:30 AM"}
        ]
      }
      
      Example response format for a single task:
      {
        "tasks": [
          {"taskTitle":"Design landing page","category":"Work","priority":"High","duration":"02:00","scheduledFor":"9:00 AM - 11:00 AM"}
        ]
      }
    `;

    // Generate content with structured output
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    // Parse the JSON response
    const taskData = await response.text();
    console.log('Gemini API received response:', taskData);
    
    try {
      // Try to parse as multi-task response first
      const parsedData = JSON.parse(taskData) as MultiTaskResponse;
      
      if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
        // Process each task and apply defaults where needed
        const defaultDuration = "01:00";
        
        return parsedData.tasks.map(task => ({
          taskTitle: task.taskTitle || text,
          category: task.category as TaskCategory,
          priority: task.priority as TaskPriority,
          duration: task.duration || defaultDuration,
          scheduledFor: task.scheduledFor
        }));
      }
      
      // If we get here but no tasks array, return a single task with the original text
      return [{ taskTitle: text }];
    } catch (error) {
      console.error('Error parsing multi-task response, trying single task format:', error);
      
      try {
        // Try to parse as single task (legacy format) as fallback
        const parsedData = JSON.parse(taskData) as TaskResponse;
        const defaultDuration = "01:00";
        
        return [{
          taskTitle: parsedData.taskTitle || text,
          category: parsedData.category as TaskCategory,
          priority: parsedData.priority as TaskPriority,
          duration: parsedData.duration || defaultDuration,
          scheduledFor: parsedData.scheduledFor
        }];
      } catch (innerError) {
        console.error('Error parsing single task format:', innerError);
        throw innerError;
      }
    }
    
  } catch (error) {
    console.error('Error extracting task info:', error);
    // Fallback to original text if API fails
    return [{ taskTitle: text }];
  }
};
