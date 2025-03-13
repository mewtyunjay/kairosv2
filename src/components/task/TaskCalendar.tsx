/**
 * TaskCalendar component for handling calendar integration
 */

import React, { useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { createEvents } from 'ics';
import type { Task } from '../../types/task';

// Added helper function to parse time strings with AM/PM
function parseTimeString(timeStr: string): {hours: number, minutes: number} {
  const regex = /^(\d+):(\d+)\s*(AM|PM)?$/i;
  const match = timeStr.match(regex);
  if (!match) {
    console.error('Time string format is invalid:', timeStr);
    return { hours: 0, minutes: 0 };
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  return { hours, minutes };
}

interface TaskCalendarProps {
  task: Task;
  showDropdown: boolean;
  onToggleDropdown: (show: boolean) => void;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ 
  task, 
  showDropdown, 
  onToggleDropdown 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleDropdown]);

  const addToGoogleCalendar = () => {
    const timeStr = (task.scheduledFor?.split(' - ')[0] || '').trim();
    const { hours, minutes } = parseTimeString(timeStr);
    
    // Create date object with current date but specified time
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Format start time in YYYYMMDDTHHMMSS format (no timezone conversion)
    const startFormatted = `${year}${month}${day}T${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}00`;
    
    // Calculate end time
    const duration = task.duration ? task.duration.split(':').map(Number) : [1, 0];
    const durationMinutes = duration[0] * 60 + duration[1];
    
    // Calculate end hours and minutes
    let endHours = hours + Math.floor((minutes + durationMinutes) / 60);
    let endMinutes = (minutes + durationMinutes) % 60;
    
    // Handle day overflow if needed (simplified - assumes same day)
    if (endHours >= 24) {
      endHours = endHours % 24;
    }
    
    // Format end time
    const endFormatted = `${year}${month}${day}T${endHours.toString().padStart(2, '0')}${endMinutes.toString().padStart(2, '0')}00`;
    
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', task.title);
    googleCalendarUrl.searchParams.append('details', `Category: ${task.category}\nPriority: ${task.priority}`);
    googleCalendarUrl.searchParams.append('dates', `${startFormatted}/${endFormatted}`);
    
    // Log the URL for debugging
    console.log('Google Calendar URL:', googleCalendarUrl.toString());
    console.log('Original time:', `${hours}:${minutes}`, 'Formatted time:', startFormatted);

    window.open(googleCalendarUrl.toString(), '_blank');
    onToggleDropdown(false);
  };

  const addToAppleCalendar = () => {
    const timeStr = (task.scheduledFor?.split(' - ')[0] || '').trim();
    const { hours, minutes } = parseTimeString(timeStr);
    
    // Create date object with current date but specified time
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    
    // Log the time values for debugging
    console.log('Apple Calendar - Original time:', `${hours}:${minutes}`);

    // Using the ics library which handles timezone correctly
    createEvents([{
      start: [year, month, day, hours, minutes],
      end: [year, month, day, 
            hours + Math.floor((minutes + (task.duration ? parseInt(task.duration.split(':')[0]) : 1) * 60 + 
            (task.duration ? parseInt(task.duration.split(':')[1]) : 0)) / 60),
            (minutes + (task.duration ? parseInt(task.duration.split(':')[1]) : 0)) % 60],
      title: task.title,
      description: `Category: ${task.category}\nPriority: ${task.priority}`,
      status: 'CONFIRMED',
    }], (error, value) => {
      if (error) {
        console.error(error);
        return;
      }

      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${task.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    onToggleDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggleDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Add to Calendar"
      >
        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 min-w-[160px]">
          <button
            onClick={addToGoogleCalendar}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-red-500" />
            Add to Google Calendar
          </button>
          <button
            onClick={addToAppleCalendar}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-gray-600" />
            Add to Apple Calendar
          </button>
        </div>
      )}
    </div>
  );
};