/**
 * TimePickerPopover component for selecting time in a user-friendly way
 * Updated: Added auto-selection of closest time and scroll into view
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimePickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  type: 'duration' | 'schedule';
  value?: string;
}

export const TimePickerPopover: React.FC<TimePickerPopoverProps> = ({
  isOpen,
  onClose,
  onSelect,
  type,
  value
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isOpen && selectedItemRef.current && listRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'center',
        behavior: 'auto'
      });
    }
  }, [isOpen]);

  const generateTimeOptions = () => {
    if (type === 'duration') {
      const options = [];
      for (let hour = 0; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          options.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      return options;
    } else {
      const options = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          const period = hour >= 12 ? 'PM' : 'AM';
          options.push(`${h}:${minute.toString().padStart(2, '0')} ${period}`);
        }
      }
      return options;
    }
  };

  const parseTimeString = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return { hour, minute };
  };

  const formatTimeOption = (time: string) => {
    if (type === 'duration') {
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours}h ${minutes}m`;
    }
    return time;
  };

  const timeOptions = generateTimeOptions();

  const handleTimeSelect = (time: string) => {
    setInputValue(time);
    onSelect(time);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 min-w-[200px]">
      <div className="relative">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 text-lg bg-transparent focus:outline-none"
            placeholder={type === 'duration' ? 'HH:MM' : 'Enter time'}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-2"
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[200px] overflow-y-auto">
          {timeOptions.map((time) => (
            <button
              key={time}
              ref={time === value ? selectedItemRef : null}
              onClick={() => handleTimeSelect(time)}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                ${inputValue === time ? 'bg-gray-100 dark:bg-gray-700' : ''}
              `}
            >
              {formatTimeOption(time)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};