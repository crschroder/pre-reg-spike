import React from "react";

interface SegmentedButtonProps {
  value: number; // 0, 1, or 2
  onChange: (value: number) => void;
  labels: [string, string, string];
  disabled?: boolean;
  className?: string;
}

export const SegmentedButton: React.FC<SegmentedButtonProps> = ({
  value,
  onChange,
  labels,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`inline-flex rounded-full bg-gray-800 border border-gray-700 overflow-hidden ${className}`}>
      {labels.map((label, idx) => (
        <button
          key={label}
          type="button"
          className={
            `px-4 py-2 text-sm font-medium focus:outline-none transition-colors ` +
            (value === idx
              ? "bg-emerald-600 text-white "
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 ") +
            (idx === 0 ? "rounded-l-full " : "") +
            (idx === 2 ? "rounded-r-full " : "")
          }
          onClick={() => !disabled && onChange(idx)}
          disabled={disabled}
          aria-pressed={value === idx}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
