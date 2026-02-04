import { useState } from "react";
import type { ReactNode } from "react";

interface AccordionProps {
  title: string;
  dirty?: boolean;
  children: ReactNode;
}



export function Accordion({ title,dirty, children }: AccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border  rounded-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2 text-left 
                   font-medium text-gray-800 bg-gray-100 hover:bg-gray-200"
      >
       <span className="flex items-center gap-2">
    {title}
    {dirty && (
      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
    )}
  </span>

        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      <div
  className={`overflow-hidden transition-all duration-300 ${
    open ? "max-h-[50rem] opacity-100" : "max-h-0 opacity-0"
  }`}
>
  <div className="px-4 py-3 border-t bg-white ">
    {children}
  </div>
</div>
    </div>
  );
}

