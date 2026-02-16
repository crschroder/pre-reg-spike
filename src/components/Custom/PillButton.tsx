//This is like the pill button but with a close icon.
import type { BeltColor } from "@/datatypes/belt-colors";
import type { PillSize } from "./Pill";
import { sizeClasses } from "@/datatypes/sizeClasses";
import { beltColors } from "@/datatypes/belt-colors";
import {  X } from "lucide-react";

export type PillButtonProps = {
  children: React.ReactNode;
  onRemove: () => void;
  color?: BeltColor;
  size?: PillSize;
};

export function PillButton({
  children,
  onRemove,
  color = "Blue",
  size = "md",
}: PillButtonProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full
        ${sizeClasses[size]}
        ${beltColors[color]}
      `}
    >
      <span>{children}</span>

          <button
        type="button"
        onClick={onRemove}
        className="
          ml-1 p-0.5 rounded-full
          text-white
          hover:bg-white/20
          focus:outline-none
          flex items-center justify-center
        "
      >

        <X size={12} strokeWidth={2} />
      </button>
    </span>
  )
}