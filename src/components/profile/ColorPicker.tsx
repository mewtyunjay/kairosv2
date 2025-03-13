/**
 * Color picker component with predefined color options
 */

import React, { useState } from 'react';
import { predefinedColors } from '../../constants/colors';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"
        style={{ backgroundColor: selectedColor }}
      />
      {showPicker && (
        <div className="absolute right-0 top-full mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 grid grid-cols-10 gap-1 z-10 w-[320px]">
          {predefinedColors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onColorSelect(color);
                setShowPicker(false);
              }}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};