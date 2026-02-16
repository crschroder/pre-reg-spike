import React from "react";

interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
  checkedColor?: string; // Tailwind color class, e.g. 'emerald-600', 'sky-600'
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  onChange,
  disabled = false,
  checkedLabel = "Yes",
  uncheckedLabel = "No",
  className = "",
  checkedColor = "emerald-600",
}) => {
  // Compose Tailwind classes for checked color
  const checkedBgClass = `peer-checked:bg-${checkedColor}`;
  const checkedRingClass = `peer-focus:ring-${checkedColor}`;

  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}
        className="sr-only peer"
      />
      <div
        className={[
          "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 rounded-full peer transition-all relative",
          checkedBgClass,
          checkedRingClass,
          !checked ? "peer-focus:ring-gray-500" : ""
        ].join(" ")}
      >
        <span
          className={
            "absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all " +
            (checked ? "translate-x-5" : "")
          }
        ></span>
      </div>
      <span className="ml-2 text-xs font-medium text-gray-200">
        {checked ? checkedLabel : uncheckedLabel}
      </span>
    </label>
  );
};
