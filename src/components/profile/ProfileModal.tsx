/**
 * Profile modal component showing user info, task history, and category management
 * Updated: Added collapsible task groups by date
 */

import React, { useState, useMemo } from 'react';
import { X, Plus, User, ChevronDown, ChevronRight } from 'lucide-react';
import type { UserProfile, CategoryPreference } from '../../types/user';
import type { Task } from '../../types/task';
import { predefinedColors } from '../../constants/colors';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  tasks: Task[];
  categories: CategoryPreference[];
  onCategoryAdd?: (category: Omit<CategoryPreference, 'id'>) => void;
  onCategoryUpdate?: (category: CategoryPreference) => void;
  onCategoryDelete?: (categoryId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  tasks,
  categories,
  onCategoryAdd,
  onCategoryUpdate,
  onCategoryDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'categories'>('history');
  const [editingCategory, setEditingCategory] = useState<CategoryPreference | null>(null);
  const [newCategory, setNewCategory] = useState<Omit<CategoryPreference, 'id'> | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // Calculate completed tasks and total time
  const completedTasks = useMemo(() => tasks.filter(task => task.completed), [tasks]);
  const totalTime = useMemo(() => completedTasks.reduce((acc, task) => {
    if (task.duration) {
      const [hours, minutes] = task.duration.split(':').map(Number);
      return acc + (hours * 60) + minutes;
    }
    return acc;
  }, 0), [completedTasks]);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const date = new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });
    return groups;
  }, [tasks]);

  if (!isOpen) return null;

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && onCategoryUpdate) {
      onCategoryUpdate(editingCategory);
      setEditingCategory(null);
    } else if (newCategory && onCategoryAdd) {
      onCategoryAdd(newCategory);
      setNewCategory(null);
    }
  };

  const handleCategoryChange = (name: string, value: string) => {
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [name]: value });
    } else if (newCategory) {
      setNewCategory({ ...newCategory, [name]: value });
    }
  };

  const toggleDateCollapse = (date: string) => {
    const newCollapsedDates = new Set(collapsedDates);
    if (collapsedDates.has(date)) {
      newCollapsedDates.delete(date);
    } else {
      newCollapsedDates.add(date);
    }
    setCollapsedDates(newCollapsedDates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center">
                <User className="w-7 h-7 text-primary-light dark:text-primary-dark" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{user?.name || 'Guest User'}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email || 'Not signed in'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors
              ${activeTab === 'history'
                ? 'border-b-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Task History
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors
              ${activeTab === 'categories'
                ? 'border-b-2 border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Categories
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'history' ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">Completed Tasks</h3>
                  <p className="text-2xl font-semibold text-primary-light dark:text-primary-dark">
                    {completedTasks.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">Total Time</h3>
                  <p className="text-2xl font-semibold text-primary-light dark:text-primary-dark">
                    {Math.floor(totalTime / 60)}h {totalTime % 60}m
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedTasks)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .map(([date, tasksForDate]) => (
                    <div key={date} className="space-y-2">
                      <button
                        onClick={() => toggleDateCollapse(date)}
                        className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-500 dark:text-gray-400 sticky top-0 bg-white dark:bg-gray-800 py-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {collapsedDates.has(date) ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {date}
                      </button>
                      {!collapsedDates.has(date) && (
                        <div className="space-y-1">
                          {tasksForDate.map(task => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                {task.title}
                              </span>
                              {task.completed && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {task.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Custom Categories</h3>
                <button
                  onClick={() => setNewCategory({ name: '', color: predefinedColors[0] })}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {(newCategory || editingCategory) && (
                <CategoryForm
                  category={editingCategory || newCategory}
                  onSubmit={handleCategorySubmit}
                  onChange={handleCategoryChange}
                  onCancel={() => {
                    setEditingCategory(null);
                    setNewCategory(null);
                  }}
                  isEditing={!!editingCategory}
                />
              )}

              <CategoryList
                categories={categories}
                onEdit={setEditingCategory}
                onDelete={onCategoryDelete || (() => {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};