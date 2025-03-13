/**
 * Category list component showing all categories with edit/delete options
 */

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { CategoryPreference } from '../../types/user';

interface CategoryListProps {
  categories: CategoryPreference[];
  onEdit: (category: CategoryPreference) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-2">
      {categories.map(category => (
        <div
          key={category.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
              style={{ backgroundColor: category.color }}
            />
            <span>{category.name}</span>
            {category.isDefault && (
              <span className="text-xs text-gray-500 dark:text-gray-400">(Default)</span>
            )}
          </div>
          {!category.isDefault && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(category)}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-1.5 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};