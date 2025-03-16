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

// Helper function to parse time string (e.g., "9:00 AM") to hours and minutes
const parseTime = (timeStr: string) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return { hours, minutes };
};

// Helper function to format time from hours and minutes to string (e.g., "9:00 AM")
const formatTime = (hours: number, minutes: number) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to calculate end time based on start time and duration
const calculateEndTime = (startTime: string, duration: string) => {
  const start = parseTime(startTime);
  const [durationHours, durationMinutes] = duration.split(':').map(Number);
  
  let totalMinutes = start.minutes + durationMinutes;
  let totalHours = start.hours + durationHours + Math.floor(totalMinutes / 60);
  totalMinutes %= 60;
  totalHours %= 24;

  return formatTime(totalHours, totalMinutes);
};

// Ensure scheduledFor has correct end time based on start time and duration
const validateScheduledFor = (scheduledFor?: string, duration?: string): string | undefined => {
  if (!scheduledFor || !duration) return scheduledFor;
  
  const parts = scheduledFor.split(' - ');
  if (parts.length !== 2) return scheduledFor;
  
  const startTime = parts[0];
  const calculatedEndTime = calculateEndTime(startTime, duration);
  
  return `${startTime} - ${calculatedEndTime}`;
};

export const extractTaskInfo = async (text: string, autoAssignTime: boolean = false): Promise<TaskResponse[]> => {
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

    // Get current time to use as reference for scheduling tasks
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Format current time for the prompt
    const currentTimeFormatted = formatTime(currentHour, currentMinute);
    
    // Build the prompt with or without auto time assignment instructions
    let timeAssignmentInstructions = '';
    
    if (autoAssignTime) {
      timeAssignmentInstructions = `
      For the scheduledFor field:
      - If the user explicitly mentions a time, use that time
      - If no time is specified but auto-assign time is enabled, intelligently assign a reasonable time:
        - Use the current time (${currentTimeFormatted}) as a reference
        - For tasks that seem urgent or important, schedule them soon after the current time
        - For regular daily activities, schedule them at typical times (e.g., lunch around noon)
        - For tasks that require focus, avoid scheduling during typical meeting times
        - Distribute tasks throughout the day to avoid overlaps
        - Format as "HH:MM AM/PM - HH:MM AM/PM" (start time - end time)
      `;
    } else {
      timeAssignmentInstructions = `
      For the scheduledFor field:
      - Only include this if the user explicitly mentions a time
      - Format as "HH:MM AM/PM - HH:MM AM/PM" (start time - end time)
      `;
    }

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
      
      ${timeAssignmentInstructions}
      
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
        
        return parsedData.tasks.map(task => {
          const duration = task.duration || defaultDuration;
          const scheduledFor = validateScheduledFor(task.scheduledFor, duration);
          
          return {
            taskTitle: task.taskTitle || text,
            category: task.category as TaskCategory,
            priority: task.priority as TaskPriority,
            duration,
            scheduledFor
          };
        });
      }
      
      // If we get here but no tasks array, return a single task with the original text
      return [{ taskTitle: text }];
    } catch (error) {
      console.error('Error parsing multi-task response, trying single task format:', error);
      
      try {
        // Try to parse as single task (legacy format) as fallback
        const parsedData = JSON.parse(taskData) as TaskResponse;
        const defaultDuration = "01:00";
        
        const duration = parsedData.duration || defaultDuration;
        const scheduledFor = validateScheduledFor(parsedData.scheduledFor, duration);
        
        return [{
          taskTitle: parsedData.taskTitle || text,
          category: parsedData.category as TaskCategory,
          priority: parsedData.priority as TaskPriority,
          duration,
          scheduledFor
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
