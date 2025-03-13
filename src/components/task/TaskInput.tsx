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
  isEmpty: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({ onTaskAdd, isEmpty }) => {
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
        const extractedInfo = await extractTaskInfo(title.trim());
        
        // Allow animation to start before adding task
        requestAnimationFrame(() => {
          setTimeout(() => {
            onTaskAdd({
              title: extractedInfo.taskTitle,
              category: extractedInfo.category,
              priority: extractedInfo.priority,
              duration: extractedInfo.duration,
              scheduledFor: extractedInfo.scheduledFor
            });
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
    <form
      onSubmit={handleSubmit}
      className={`
        ${positionClass}
        transition-all duration-300 ease-in-out
        max-w-lg w-[calc(100%-2rem)]
      `}
    >
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to accomplish today?"
          className="
            w-full px-4 py-3 pr-12 rounded-xl
            border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800
            text-text-light dark:text-text-dark
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark
            shadow-sm hover:shadow-md transition-shadow duration-300
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
    </form>
  );
};