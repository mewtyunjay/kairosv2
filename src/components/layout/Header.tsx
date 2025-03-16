/**
 * Header component for Kairos task management app
 * Features: Logo, dark mode toggle, profile button
 * Updated: Added profile button and modal integration
 */

import React, { useState } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';
import { ProfileButton } from '../profile/ProfileButton';
import { ProfileModal } from '../profile/ProfileModal';
import type { CategoryPreference } from '../../types/user';
import type { Task } from '../../types/task';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  autoAssignTime: boolean;
  onAutoAssignTimeToggle: () => void;
  tasks: Task[];
  categories: CategoryPreference[];
  onCategoryAdd: (category: Omit<CategoryPreference, 'id'>) => void;
  onCategoryUpdate: (updatedCategory: CategoryPreference) => void;
  onCategoryDelete: (categoryId: string) => void;
}

const defaultCategories: CategoryPreference[] = [
  { id: 'work', name: 'Work', color: '#ff7675', isDefault: true },
  { id: 'personal', name: 'Personal', color: '#74b9ff', isDefault: true },
  { id: 'health', name: 'Health', color: '#55efc4', isDefault: true },
  { id: 'shopping', name: 'Shopping', color: '#ffeaa7', isDefault: true },
  { id: 'other', name: 'Other', color: '#b2bec3', isDefault: true },
];

export const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  onThemeToggle, 
  autoAssignTime,
  onAutoAssignTimeToggle,
  tasks,
  categories: propCategories,
  onCategoryAdd: propOnCategoryAdd,
  onCategoryUpdate: propOnCategoryUpdate,
  onCategoryDelete: propOnCategoryDelete
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryPreference[]>(defaultCategories);

  const handleCategoryAdd = (category: Omit<CategoryPreference, 'id'>) => {
    const newCategory = {
      ...category,
      id: crypto.randomUUID(),
      isDefault: false,
    };
    setCategories([...categories, newCategory]);
  };

  const handleCategoryUpdate = (updatedCategory: CategoryPreference) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleCategoryDelete = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background-light dark:bg-background-dark shadow-header transition-colors z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-4xl text-primary-light dark:text-primary-dark">
          Kairos
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            {/* <Clock className="w-5 h-5 text-gray-500" /> */}
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
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-800 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-text-dark" />
            ) : (
              <Moon className="w-6 h-6 text-text-light" />
            )}
          </button>
          <ProfileButton onOpenModal={() => setIsProfileOpen(true)} />
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        tasks={tasks}
        categories={categories}
        onCategoryAdd={propCategories ? propOnCategoryAdd : handleCategoryAdd}
        onCategoryUpdate={propCategories ? propOnCategoryUpdate : handleCategoryUpdate}
        onCategoryDelete={propCategories ? propOnCategoryDelete : handleCategoryDelete}
      />
    </header>
  );
};