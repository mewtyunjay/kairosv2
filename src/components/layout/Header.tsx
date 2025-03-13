/**
 * Header component for Kairos task management app
 * Features: Logo, dark mode toggle, profile button
 * Updated: Added profile button and modal integration
 */

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ProfileButton } from '../profile/ProfileButton';
import { ProfileModal } from '../profile/ProfileModal';
import type { CategoryPreference } from '../../types/user';
import type { Task } from '../../types/task';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
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

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onThemeToggle, tasks }) => {
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
        onCategoryAdd={handleCategoryAdd}
        onCategoryUpdate={handleCategoryUpdate}
        onCategoryDelete={handleCategoryDelete}
      />
    </header>
  );
};