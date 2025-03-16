/**
 * Task input component for adding new tasks
 * Features: Adaptive positioning, smooth transitions, center-to-bottom animation
 * Updated: Added Gemini Flash API integration for intelligent task extraction
 */

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { extractTaskInfo } from '../../utils/geminiApi';
import { TaskCategory, TaskPriority } from '../../types/task';

interface TaskInputProps {
  onTaskAdd: (taskData: {
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    duration?: string;
    scheduledFor?: string;
  }) => void;
  onMultipleTasksAdd?: (tasksData: Array<{
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    duration?: string;
    scheduledFor?: string;
  }>) => void;
  isEmpty: boolean;
  autoAssignTime?: boolean;
  onAutoAssignTimeToggle?: () => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onTaskAdd, onMultipleTasksAdd, isEmpty, autoAssignTime = false, onAutoAssignTimeToggle }) => {
  const [title, setTitle] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      setIsAnimating(true);
      setIsProcessing(true);
      
      try {
        // Extract task information using Gemini Flash API
        const extractedTasks = await extractTaskInfo(title.trim(), autoAssignTime);
        
        // Allow animation to start before adding tasks
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Handle multiple tasks if detected
            if (extractedTasks.length > 0) {
              if (extractedTasks.length > 1 && onMultipleTasksAdd) {
                // If we have multiple tasks and the handler is available, use it
                const formattedTasks = extractedTasks.map(taskInfo => ({
                  title: taskInfo.taskTitle,
                  category: taskInfo.category,
                  priority: taskInfo.priority,
                  duration: taskInfo.duration,
                  scheduledFor: taskInfo.scheduledFor
                }));
                
                onMultipleTasksAdd(formattedTasks);
                console.log(`Created ${extractedTasks.length} tasks from input`);
              } else {
                // Otherwise, add each task individually (fallback or single task)
                extractedTasks.forEach(taskInfo => {
                  onTaskAdd({
                    title: taskInfo.taskTitle,
                    category: taskInfo.category,
                    priority: taskInfo.priority,
                    duration: taskInfo.duration,
                    scheduledFor: taskInfo.scheduledFor
                  });
                });
              }
            } else {
              // Fallback to basic task creation if no tasks were extracted
              onTaskAdd({ title: title.trim() });
            }
            
            setTitle('');
            setIsAnimating(false);
            setIsProcessing(false);
          }, 300); // Match the animation duration
        });
      } catch (error) {
        console.error('Error processing task:', error);
        // Fallback to basic task creation if API fails
        requestAnimationFrame(() => {
          setTimeout(() => {
            onTaskAdd({ title: title.trim() });
            setTitle('');
            setIsAnimating(false);
            setIsProcessing(false);
          }, 300);
        });
      }
    }
  };

  const positionClass = isEmpty && !isAnimating
    ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    : 'fixed bottom-4 left-1/2 transform -translate-x-1/2';

  return (
    <div
      className={`
        ${positionClass}
        transition-all duration-300 ease-in-out
        max-w-lg w-[calc(100%-2rem)]
      `}
    >
      {isEmpty && (
        <div className="mb-2 text-lg font-medium text-center text-gray-700 dark:text-gray-300">
          What do you want to accomplish today?
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isEmpty ? "Type your task here..." : "Add more tasks..."}
            className="
              w-full px-4 py-3 pr-12 rounded-xl
              border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800
              text-text-light dark:text-text-dark
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark
            "
            aria-label="New task input"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="
              absolute right-2 top-1/2 transform -translate-y-1/2
              p-2 rounded-full
              bg-primary-light dark:bg-primary-dark
              text-white
              hover:opacity-90 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Add new task"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="flex justify-center items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoAssignTime} 
              onChange={onAutoAssignTimeToggle}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-light dark:peer-focus:ring-primary-dark rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Auto-assign time
            </span>
          </label>
        </div>
      </form>
    </div>
  );
};