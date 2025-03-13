/**
 * Category form component for adding and editing categories
 */

import React from 'react';
import { CategoryPreference } from '../../types/user';
import { ColorPicker } from './ColorPicker';

interface CategoryFormProps {
  category: Omit<CategoryPreference, 'id'> | CategoryPreference | null;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (name: string, value: string) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onChange,
  onCancel,
  isEditing,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={category?.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Category name"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
          />
        </div>
        <ColorPicker
          selectedColor={category?.color || ''}
          onColorSelect={color => onChange('color', color)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 text-sm bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </form>
  );
};