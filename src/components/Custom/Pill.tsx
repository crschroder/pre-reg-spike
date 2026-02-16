import { BeltColor, beltColors } from "@/datatypes/belt-colors";
import { sizeClasses } from "@/datatypes/sizeClasses";
import type { ReactNode } from "react";

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
