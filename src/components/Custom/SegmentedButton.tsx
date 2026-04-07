import React from "react";

export type SegmentedButtonOption = {
  label: string;
  value: string;
};

interface SegmentedButtonProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedButtonOption[];
  disabled?: boolean;
  className?: string;
}

export const SegmentedButton: React.FC<SegmentedButtonProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  className = "",
}) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className={`inline-flex rounded-full bg-gray-800 border border-gray-700 overflow-hidden ${className}`}>
      {options.map((option, idx) => (
        <button
          key={option.value}
          type="button"
          className={
            `px-4 py-2 text-sm font-medium focus:outline-none transition-colors ` +
            (value === option.value
              ? "bg-emerald-600 text-white "
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 ") +
            (idx === 0 ? "rounded-l-full " : "") +
            (idx === options.length - 1 ? "rounded-r-full " : "")
          }
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
