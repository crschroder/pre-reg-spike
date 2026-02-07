import type { ReactNode } from "react";

export const beltColors = {
  White: "bg-gray-200 text-black",
  Yellow: "bg-yellow-400 text-black",
  Orange: "bg-orange-500 text-white",
  Green: "bg-green-600 text-white",
  Purple: "bg-purple-600 text-white",
  Blue: "bg-blue-600 text-white",
  Brown: "bg-amber-800 text-white",
  Black: "bg-black text-white",
} as const;

export type BeltColor = keyof typeof beltColors;

export function isBeltColor(value: string): value is BeltColor {
  return value in beltColors;
}

export const sizeClasses = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1",
  lg: "text-base px-4 py-1.5 gap-2",
} as const;

export type PillSize = keyof typeof sizeClasses;

type PillProps = {
  size?: PillSize;
  color: BeltColor;
  children: ReactNode;
};

export function Pill({ size = "md", color, children }: PillProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        ${sizeClasses[size]}
        ${beltColors[color]}
      `}
    >
      {children}
    </span>
  );
}
