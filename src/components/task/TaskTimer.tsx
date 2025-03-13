/**
 * TaskTimer component for handling task countdown functionality
 */

import React from 'react';
import { Clock, Play, Pause, AlertCircle } from 'lucide-react';
import type { Task, TimerStatus } from '../../types/task';

interface TaskTimerProps {
  task: Task;
  remainingTime: number;
  onTimerToggle: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ task, remainingTime, onTimerToggle }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!task.duration && !remainingTime) {
      return 'text-gray-400';
    }
    if (remainingTime === 0) {
      return 'text-red-500';
    }
    switch (task.timerStatus) {
      case 'running':
        return 'text-yellow-500';
      case 'paused':
        return 'text-blue-500';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <button
      onClick={onTimerToggle}
      className={`flex items-center gap-1 transition-colors ${getTimerColor()}`}
      disabled={task.completed || (!task.duration && !remainingTime)}
      title={!task.duration ? 'No duration set for this task' : ''}
    >
      {remainingTime === 0 && task.duration ? (
        <AlertCircle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>{formatTime(remainingTime)}</span>
      {task.timerStatus === 'running' ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
    </button>
  );
};