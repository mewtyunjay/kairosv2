/**
 * Main App component for Kairos task management application
 * Updated: Added categories prop to TaskCard for custom category support
 */

import React, { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/layout/Header';
import { TaskInput } from './components/task/TaskInput';
import { TaskCard } from './components/task/TaskCard';
import { PartyPopper } from 'lucide-react';
import './styles/fonts.css';
import type { Task, TaskCategory, TaskPriority } from './types/task';
import type { CategoryPreference } from './types/user';

const defaultCategories: CategoryPreference[] = [
  { id: 'work', name: 'Work', color: '#ff7675', isDefault: true },
  { id: 'personal', name: 'Personal', color: '#74b9ff', isDefault: true },
  { id: 'health', name: 'Health', color: '#55efc4', isDefault: true },
  { id: 'shopping', name: 'Shopping', color: '#ffeaa7', isDefault: true },
  { id: 'other', name: 'Other', color: '#b2bec3', isDefault: true },
];

function App() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('kairosTheme', 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  const [tasks, setTasks] = useLocalStorage<Task[]>('kairosTasks', []);
  const [categories, setCategories] = useLocalStorage<CategoryPreference[]>('kairosCategories', defaultCategories);

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTaskAdd = (taskData: {
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    duration?: string;
    scheduledFor?: string;
  }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title,
      category: taskData.category || 'Other',
      priority: taskData.priority || 'Medium',
      duration: taskData.duration,
      scheduledFor: taskData.scheduledFor,
      completed: false,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  // Add multiple tasks at once
  const handleMultipleTasksAdd = (tasksData: Array<{
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    duration?: string;
    scheduledFor?: string;
  }>) => {
    const newTasks = tasksData.map(taskData => ({
      id: crypto.randomUUID(),
      title: taskData.title,
      category: taskData.category || 'Other',
      priority: taskData.priority || 'Medium',
      duration: taskData.duration,
      scheduledFor: taskData.scheduledFor,
      completed: false,
      progress: 0,
      createdAt: new Date().toISOString()
    }));
    
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors">
      <Header 
        isDarkMode={isDarkMode} 
        onThemeToggle={handleThemeToggle}
        tasks={tasks}
        categories={categories}
        onCategoryAdd={handleCategoryAdd}
        onCategoryUpdate={handleCategoryUpdate}
        onCategoryDelete={handleCategoryDelete}
      />
      <main className="pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Active Tasks */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Active Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTasks.length > 0 ? (
                activeTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    categories={categories}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))
              ) : tasks.length > 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-card text-center">
                  <PartyPopper className="w-12 h-12 text-yellow-400 mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">You're all done for the day!</h3>
                  <p className="text-gray-600 dark:text-gray-400">Time to celebrate your productivity!</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Completed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    categories={categories}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <TaskInput 
        onTaskAdd={handleTaskAdd} 
        onMultipleTasksAdd={handleMultipleTasksAdd} 
        isEmpty={tasks.length === 0} 
      />
    </div>
  );
}

export default App;