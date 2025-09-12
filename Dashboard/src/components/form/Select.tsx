"use client";
import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  options?: Option[];
  children?: React.ReactNode;
}

const Select = ({
  id,
  value,
  onChange,
  className = "",
  disabled = false,
  options,
  children,
}: SelectProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`block w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none transition-all focus:border-brand-500 focus:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:focus:border-brand-500 ${
          isFocused ? "border-brand-500 shadow-md" : ""
        } ${disabled ? "cursor-not-allowed opacity-70" : ""} ${className}`}
      >
        {/* Either use children or map over options */}
        {children ? (
          children
        ) : options ? (
          options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-sm text-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {option.label}
            </option>
          ))
        ) : null}
      </select>

      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default Select;