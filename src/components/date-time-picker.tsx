'use client';

import { useState, useEffect, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { format, subDays, addDays } from 'date-fns';
import { CalendarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
  mode?: 'date' | 'datetime'; // date = day/month/year only, datetime = date + time
}

interface QuickDateOption {
  label: string;
  startDate: Date;
  endDate: Date;
}

export function DateTimePicker({ onDateRangeChange, className = '', mode = 'datetime' }: DateTimePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check initial state
    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Quick date options
  const quickDateOptions: QuickDateOption[] = [
    {
      label: 'Today',
      startDate: new Date(),
      endDate: new Date()
    },
    {
      label: 'Yesterday',
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1)
    },
    {
      label: 'Last 7 days',
      startDate: subDays(new Date(), 6),
      endDate: new Date()
    },
    {
      label: 'Last 30 days',
      startDate: subDays(new Date(), 29),
      endDate: new Date()
    },
    {
      label: 'This month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    }
  ];

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (isRangeMode && date && endDate && date > endDate) {
      setEndDate(date);
    }
    triggerCallback(date, endDate);
    if (!isRangeMode) {
      document.dispatchEvent(new CustomEvent('filter-dropdown-close'));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (isRangeMode && startDate && date && startDate > date) {
      setStartDate(date);
    }
    triggerCallback(startDate, date);
    if (isRangeMode && startDate && date) {
      document.dispatchEvent(new CustomEvent('filter-dropdown-close'));
    }
  };

  const handleSingleDateChange = (date: Date | null) => {
    setStartDate(date);
    setEndDate(date);
    triggerCallback(date, date);
    document.dispatchEvent(new CustomEvent('filter-dropdown-close'));
  };

  // Trigger callback with current dates
  const triggerCallback = (start: Date | null, end: Date | null) => {
    onDateRangeChange(start, end);
  };

  // Handle quick date selection
  const handleQuickDateSelect = (option: QuickDateOption) => {
    setStartDate(option.startDate);
    setEndDate(option.endDate);
    setIsRangeMode(true);
    triggerCallback(option.startDate, option.endDate);
  };

  // Clear all dates
  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
    triggerCallback(null, null);
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'HH:mm');
  };

  // Custom input component for better styling (must forward ref for react-datepicker)
  const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder }, ref) => (
    <button
      ref={ref}
      type="button"
      className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      onFocus={(e) => { onClick?.(e); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e as any); } }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {value || placeholder}
          </span>
        </div>
        {isTimeEnabled && <ClockIcon className="w-4 h-4 text-gray-400" />}
      </div>
    </button>
  ));

  // Custom time input component (forward ref as well)
  const CustomTimeInput = forwardRef<HTMLButtonElement, any>(({ value, onClick, placeholder }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      type="button"
      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-gray-400" />
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {value || placeholder}
        </span>
      </div>
    </button>
  ));

  // Generate custom popper class based on theme
  const getPopperClassName = () => {
    const baseClass = 'z-50';
    const themeClass = isDarkMode ? 'dark-theme' : 'light-theme';
    return `${baseClass} ${themeClass}`;
  };

  const isTimeEnabled = mode === 'datetime';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {isTimeEnabled ? 'Date & Time' : 'Date'}
        </h3>
        <div className="flex items-center gap-2">
          {/* Range toggle kept for power-users but hidden by default */}
          <label className="hidden md:flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isRangeMode}
              onChange={(e) => setIsRangeMode(e.target.checked)}
              className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            Range
          </label>
          {(startDate || endDate) && (
            <button
              onClick={clearDates}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              <XMarkIcon className="w-3 h-3 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Date Options */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Select:</p>
        <div className="flex flex-wrap gap-2">
          {quickDateOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleQuickDateSelect(option)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date & Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRangeMode ? (isTimeEnabled ? 'Start Date & Time' : 'Start Date') : (isTimeEnabled ? 'Date & Time' : 'Date')}
          </label>
          <DatePicker
            selected={startDate}
            onChange={isRangeMode ? handleStartDateChange : handleSingleDateChange}
            showTimeSelect={isTimeEnabled}
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat={isTimeEnabled ? "MM/dd/yyyy HH:mm" : "MM/dd/yyyy"}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            customInput={<CustomInput />}
            placeholderText={isTimeEnabled ? "Select date & time" : "Select date"}
            maxDate={isRangeMode ? (endDate || undefined) : undefined}
            className="w-full border rounded-md"
            popperClassName={getPopperClassName()}
            popperPlacement="bottom-start"
            calendarClassName={isDarkMode ? 'dark-theme' : 'light-theme'}
            withPortal
            portalId="root-portal"
            shouldCloseOnSelect={!isRangeMode}
          />
        </div>

        {/* End Date & Time (Range Mode Only) */}
        {isRangeMode && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isTimeEnabled ? 'End Date & Time' : 'End Date'}
            </label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              showTimeSelect={isTimeEnabled}
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat={isTimeEnabled ? "MM/dd/yyyy HH:mm" : "MM/dd/yyyy"}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              customInput={<CustomInput />}
              placeholderText={isTimeEnabled ? "Select end date & time" : "Select end date"}
              minDate={startDate || undefined}
              className="w-full border rounded-md"
              popperClassName={getPopperClassName()}
              popperPlacement="bottom-start"
              calendarClassName={isDarkMode ? 'dark-theme' : 'light-theme'}
              withPortal
              portalId="root-portal"
              shouldCloseOnSelect={!isRangeMode}
            />
          </div>
        )}
      </div>

      {/* Selected Date Range Display */}
      {(startDate || endDate) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Selected {isRangeMode ? 'Range' : 'Date'}:
          </p>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {isRangeMode ? (
              <>
                <span className="font-medium">From:</span> {formatDate(startDate)} at {formatTime(startDate)}
                {endDate && (
                  <>
                    <br />
                    <span className="font-medium">To:</span> {formatDate(endDate)} at {formatTime(endDate)}
                  </>
                )}
              </>
            ) : (
              <>
                <span className="font-medium">Date:</span> {formatDate(startDate)} at {formatTime(startDate)}
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile-Friendly Date Inputs */}
      <div className="mt-4 md:hidden">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Input:</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              {isRangeMode ? 'Start Date' : 'Date'}
            </label>
            <input
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                handleStartDateChange(date);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          {isRangeMode && (
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleEndDateChange(date);
                }}
                min={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Time
            </label>
            <input
              type="time"
              value={startDate ? format(startDate, 'HH:mm') : ''}
              onChange={(e) => {
                if (startDate) {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = new Date(startDate);
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  handleStartDateChange(newDate);
                }
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
