import React, { useEffect, useMemo, useRef, useState } from "react";

type MultiSelectProps = {
  options: string[];
  selected?: string[];
  onChange: (vals: string[]) => void;
  labels?: Record<string, string>;
  placeholder?: string;
};

const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();

export function MultiSelect({
  options,
  selected = [],
  onChange,
  labels = {},
  placeholder = "Select...",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selectedSet = useMemo(() => new Set(selected.map((s) => normalize(s))), [selected]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return options.filter((o) => normalize(o).includes(q));
  }, [options, query]);

  const toggle = (opt: string) => {
    const norm = normalize(opt);
    if (selectedSet.has(norm)) {
      onChange(selected.filter((s) => normalize(s) !== norm));
    } else {
      onChange([...selected, opt]);
    }
  };

  const remove = (opt: string) => onChange(selected.filter((s) => normalize(s) !== normalize(opt)));

  return (
    <div ref={ref} className="relative inline-block">
      <div
        role="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 border border-gray-600 bg-gray-800 px-3 py-1 rounded-md cursor-pointer min-w-[180px] max-w-[420px]"
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 ? (
            <span className="text-xs text-gray-300">{placeholder}</span>
          ) : (
            selected.map((s) => {
              const key = String(s);
              const label = labels[key] ?? key;
              return (
                <span key={key} className="bg-gray-700 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(s);
                    }}
                    className="text-gray-300 hover:text-white ml-1"
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>
        <div className="ml-auto text-gray-400 text-xs">▾</div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-[320px] max-h-56 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to filter..."
            className="w-full mb-2 px-2 py-1 rounded bg-gray-900 text-sm border border-gray-700"
          />
          <div className="flex flex-col gap-1">
            {filtered.map((opt) => {
              const key = String(opt);
              const label = labels[key] ?? key;
              const checked = selectedSet.has(normalize(opt));
              return (
                <label key={key} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
            {filtered.length === 0 && <div className="text-xs text-gray-400 p-2">No options</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
