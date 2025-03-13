/**
 * TaskCard component for displaying individual tasks
 * Updated: Fixed task completion state and styling sync
 */

import React, { useState, useRef } from 'react';
import type { Task, TaskCategory, TaskPriority } from '../../types/task';
import type { CategoryPreference } from '../../types/user';
import { Check, Calendar, Trash2 } from 'lucide-react';
import { TaskTimeInput } from './TaskTimeInput';

interface TaskCardProps {
  task: Task;
  categories: CategoryPreference[];
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, categories, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  
  // Refs for dropdown containers
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const calendarDropdownRef = useRef<HTMLDivElement>(null);
  
  const [editedTask, setEditedTask] = useState<Task>(task);

  // Keep editedTask in sync with prop changes
  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);
  
  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close category dropdown if clicked outside
      if (showCategoryDropdown && 
          categoryDropdownRef.current && 
          !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      
      // Close priority dropdown if clicked outside
      if (showPriorityDropdown && 
          priorityDropdownRef.current && 
          !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
      
      // Close calendar dropdown if clicked outside
      if (showCalendarDropdown && 
          calendarDropdownRef.current && 
          !calendarDropdownRef.current.contains(event.target as Node)) {
        setShowCalendarDropdown(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown, showPriorityDropdown, showCalendarDropdown]);

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate(editedTask);
    }
    setIsEditing(false);
  };

  const toggleComplete = () => {
    const updatedTask = {
      ...editedTask,
      completed: !editedTask.completed
    };
    setEditedTask(updatedTask);
    if (onUpdate) {
      onUpdate(updatedTask);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];

  const handleTimeUpdate = (duration: string, scheduledFor?: string) => {
    const updatedTask = {
      ...editedTask,
      duration,
      scheduledFor
    };
    setEditedTask(updatedTask);
    if (onUpdate) {
      onUpdate(updatedTask);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#b2bec3';
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const addToGoogleCalendar = () => {
    // Parse the time string with AM/PM properly
    const timeStr = (editedTask.scheduledFor?.split(' - ') || [''])[0];
    const [time, period] = timeStr.split(' ');
    let [startHours, startMinutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format if needed
    if (period === 'PM' && startHours < 12) startHours += 12;
    if (period === 'AM' && startHours === 12) startHours = 0;
    
    // Create date object with current date but specified time
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Format start time in YYYYMMDDTHHMMSS format (no timezone conversion)
    const startFormatted = `${year}${month}${day}T${startHours.toString().padStart(2, '0')}${startMinutes.toString().padStart(2, '0')}00`;
    
    // Calculate end time
    const duration = editedTask.duration ? editedTask.duration.split(':').map(Number) : [1, 0];
    const durationMinutes = duration[0] * 60 + duration[1];
    
    // Calculate end hours and minutes
    let endHours = startHours + Math.floor((startMinutes + durationMinutes) / 60);
    let endMinutes = (startMinutes + durationMinutes) % 60;
    
    // Handle day overflow if needed (simplified - assumes same day)
    if (endHours >= 24) {
      endHours = endHours % 24;
    }
    
    // Format end time
    const endFormatted = `${year}${month}${day}T${endHours.toString().padStart(2, '0')}${endMinutes.toString().padStart(2, '0')}00`;
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', editedTask.title);
    googleCalendarUrl.searchParams.append('details', `Category: ${editedTask.category}\nPriority: ${editedTask.priority}`);
    googleCalendarUrl.searchParams.append('dates', `${startFormatted}/${endFormatted}`);
    
    // Log the URL for debugging
    console.log('Google Calendar URL:', googleCalendarUrl.toString());
    console.log('Original time:', `${startHours}:${startMinutes}`, 'Formatted time:', startFormatted);

    window.open(googleCalendarUrl.toString(), '_blank');
    setShowCalendarDropdown(false);
  };

  const addToAppleCalendar = () => {
    // Parse the time string with AM/PM properly
    const timeStr = (editedTask.scheduledFor?.split(' - ') || [''])[0];
    const [time, period] = timeStr.split(' ');
    let [startHours, startMinutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format if needed
    if (period === 'PM' && startHours < 12) startHours += 12;
    if (period === 'AM' && startHours === 12) startHours = 0;
    
    // Create date object with current date but specified time
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Format start time in YYYYMMDDTHHMMSS format (no timezone conversion)
    const startFormatted = `${year}${month}${day}T${startHours.toString().padStart(2, '0')}${startMinutes.toString().padStart(2, '0')}00`;
    
    // Calculate end time
    const duration = editedTask.duration ? editedTask.duration.split(':').map(Number) : [1, 0];
    const durationMinutes = duration[0] * 60 + duration[1];
    
    // Calculate end hours and minutes
    let endHours = startHours + Math.floor((startMinutes + durationMinutes) / 60);
    let endMinutes = (startMinutes + durationMinutes) % 60;
    
    // Handle day overflow if needed (simplified - assumes same day)
    if (endHours >= 24) {
      endHours = endHours % 24;
    }
    
    // Format end time
    const endFormatted = `${year}${month}${day}T${endHours.toString().padStart(2, '0')}${endMinutes.toString().padStart(2, '0')}00`;
    
    // Log the dates for debugging
    console.log('Apple Calendar - Original time:', `${startHours}:${startMinutes}`, 'Formatted time:', startFormatted);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${editedTask.title}`,
      `DESCRIPTION:Category: ${editedTask.category}\\nPriority: ${editedTask.priority}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${editedTask.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarDropdown(false);
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 relative 
      transition-all duration-300 hover:shadow-lg
      ${task.completed ? 'bg-gray-50 dark:bg-gray-700/50 opacity-75' : ''}
    `}>
      <div className="flex justify-between items-start mb-3">
        <div className="relative" ref={categoryDropdownRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
            style={{ backgroundColor: `${getCategoryColor(editedTask.category)}40` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(editedTask.category) }}
            />
            {editedTask.category}
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setEditedTask({ ...editedTask, category: category.name as TaskCategory });
                    setShowCategoryDropdown(false);
                    handleUpdate();
                  }}
                  className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={priorityDropdownRef}>
            <button
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(editedTask.priority)}`}
            >
              {editedTask.priority}
            </button>

            {showPriorityDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                {priorities.map(priority => (
                  <button
                    key={priority}
                    onClick={() => {
                      setEditedTask({ ...editedTask, priority });
                      setShowPriorityDropdown(false);
                      handleUpdate();
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${getPriorityColor(priority)}`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {editedTask.scheduledFor && (
            <div className="relative" ref={calendarDropdownRef}>
              <button
                onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Calendar className="w-3 h-3" />
                Add to Calendar
              </button>

              {showCalendarDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 min-w-[160px]">
                  <button
                    onClick={addToGoogleCalendar}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Google Calendar
                  </button>
                  <button
                    onClick={addToAppleCalendar}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Apple Calendar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            onBlur={handleUpdate}
            className="w-full text-xl bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary-light dark:focus:border-primary-dark"
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className="text-xl text-text-light dark:text-text-dark cursor-pointer"
          >
            {editedTask.title}
          </h3>
        )}
      </div>

      <TaskTimeInput
        duration={editedTask.duration}
        scheduledFor={editedTask.scheduledFor}
        onUpdate={handleTimeUpdate}
      />

      <div className="absolute bottom-4 right-4 flex items-center gap-2">

        <button
          onClick={handleDelete}
          className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 hover:bg-opacity-80 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleComplete}
          className={`
            p-2 rounded-full
            ${task.completed ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400'}
            hover:bg-opacity-80 transition-colors
          `}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};