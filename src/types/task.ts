/**
 * Type definitions for the Kairos task management application
 * Updated: Removed timer-related fields, simplified time tracking
 */

export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Shopping' | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  duration?: string; // HH:MM format
  priority: TaskPriority;
  completed: boolean;
  progress: number; // 0-100
  createdAt: string;
  scheduledFor?: string; // Time range (e.g., "9:00 AM - 10:00 AM")
}