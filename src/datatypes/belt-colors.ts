
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

