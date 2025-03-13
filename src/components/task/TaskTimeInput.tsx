/**
 * TaskTimeInput component for handling task duration and schedule
 * Updated: Added automatic time calculations and end time adjustments
 */

import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { TimePickerPopover } from './TimePickerPopover';

interface TaskTimeInputProps {
  duration?: string;
  scheduledFor?: string;
  onUpdate: (duration: string, scheduledFor?: string) => void;
}

export const TaskTimeInput: React.FC<TaskTimeInputProps> = ({
  duration,
  scheduledFor,
  onUpdate
}) => {
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!startTimeRef.current?.contains(event.target as Node)) {
        setShowStartTimePicker(false);
      }
      if (!endTimeRef.current?.contains(event.target as Node)) {
        setShowEndTimePicker(false);
      }
      if (!durationRef.current?.contains(event.target as Node)) {
        setShowDurationPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const formatTime = (hours: number, minutes: number) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateEndTime = (startTime: string, duration: string) => {
    const start = parseTime(startTime);
    const [durationHours, durationMinutes] = duration.split(':').map(Number);
    
    let totalMinutes = start.minutes + durationMinutes;
    let totalHours = start.hours + durationHours + Math.floor(totalMinutes / 60);
    totalMinutes %= 60;
    totalHours %= 24;

    return formatTime(totalHours, totalMinutes);
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    let diffMinutes = (endTime.hours * 60 + endTime.minutes) - (startTime.hours * 60 + startTime.minutes);
    if (diffMinutes < 0) diffMinutes += 24 * 60;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleScheduleChange = (type: 'start' | 'end', value: string) => {
    if (!scheduledFor) {
      // If no schedule exists, create one with the selected time
      const newSchedule = type === 'start'
        ? `${value} - ${calculateEndTime(value, duration || '01:00')}`
        : `12:00 AM - ${value}`;
      onUpdate(duration || '01:00', newSchedule);
      return;
    }

    const [currentStart, currentEnd] = scheduledFor.split(' - ');
    let newSchedule: string;
    let newDuration = duration;

    if (type === 'start') {
      // When start time changes, keep the duration and update end time
      newSchedule = `${value} - ${calculateEndTime(value, duration || '01:00')}`;
    } else {
      // When end time changes, keep the start time and update duration
      newSchedule = `${currentStart} - ${value}`;
      newDuration = calculateDuration(currentStart, value);
    }

    onUpdate(newDuration, newSchedule);
  };

  const handleDurationChange = (value: string) => {
    if (scheduledFor) {
      // If schedule exists, keep start time and update end time
      const [start] = scheduledFor.split(' - ');
      const newEnd = calculateEndTime(start, value);
      onUpdate(value, `${start} - ${newEnd}`);
    } else {
      // If no schedule, just update duration
      onUpdate(value, undefined);
    }
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'Set duration';
    const [hours, minutes] = duration.split(':');
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="relative flex items-center gap-2" ref={durationRef}>
        <Clock className="w-4 h-4 text-gray-500" />
        <button
          onClick={() => setShowDurationPicker(true)}
          className="px-2 py-1 text-left rounded bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {formatDuration(duration)}
        </button>
        <TimePickerPopover
          isOpen={showDurationPicker}
          onClose={() => setShowDurationPicker(false)}
          onSelect={handleDurationChange}
          type="duration"
          value={duration}
        />
      </div>

      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div className="relative" ref={startTimeRef}>
          <button
            onClick={() => setShowStartTimePicker(true)}
            className="px-2 py-1 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {scheduledFor ? scheduledFor.split(' - ')[0] : 'Start time'}
          </button>
          <TimePickerPopover
            isOpen={showStartTimePicker}
            onClose={() => setShowStartTimePicker(false)}
            onSelect={(time) => handleScheduleChange('start', time)}
            type="schedule"
            value={scheduledFor?.split(' - ')[0]}
          />
        </div>
        <span>to</span>
        <div className="relative" ref={endTimeRef}>
          <button
            onClick={() => setShowEndTimePicker(true)}
            className="px-2 py-1 text-left rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {scheduledFor ? scheduledFor.split(' - ')[1] : 'End time'}
          </button>
          <TimePickerPopover
            isOpen={showEndTimePicker}
            onClose={() => setShowEndTimePicker(false)}
            onSelect={(time) => handleScheduleChange('end', time)}
            type="schedule"
            value={scheduledFor?.split(' - ')[1]}
          />
        </div>
      </div>
    </div>
  );
};