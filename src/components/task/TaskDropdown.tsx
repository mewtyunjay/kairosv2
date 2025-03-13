/**
 * TaskDropdown component for category and priority selection
 * Updated: Added support for custom categories with color indicators
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { TaskCategory, TaskPriority } from '../../types/task';
import type { CategoryPreference } from '../../types/user';

interface TaskDropdownProps {
  label: string;
  value: string;
  options?: string[];
  categories?: CategoryPreference[];
  colorClass?: string;
  show: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  type: 'category' | 'priority';
}

export const TaskDropdown: React.FC<TaskDropdownProps> = ({
  label,
  value,
  options,
  categories,
  colorClass,
  show,
  onToggle,
  onSelect,
  type
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    if (categories) {
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        return category.color;
      }
    }
    return '#b2bec3'; // Default color
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
          type === 'priority' ? getPriorityColor(value) : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {type === 'category' && (
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor(value) }}
          />
        )}
        {value}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 min-w-[120px]">
          {type === 'category' && categories ? (
            categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  onSelect(category.name);
                  onToggle();
                }}
                className={`
                  block w-full text-left px-4 py-2 text-xs
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${value === category.name ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  flex items-center gap-2
                `}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </button>
            ))
          ) : options ? (
            options.map(option => (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  onToggle();
                }}
                className={`
                  block w-full text-left px-4 py-2 text-xs
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  ${value === option ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  ${type === 'priority' ? getPriorityColor(option) : ''}
                `}
              >
                {option}
              </button>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
};