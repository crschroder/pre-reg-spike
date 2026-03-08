import React from "react";
import Select, { components } from "react-select";

type Props = {
  options: string[];
  selected?: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function ReactSelectMulti({ options, selected = [], onChange, placeholder = "Select..." }: Props) {
  const opts = options.map((o) => ({ value: o, label: o }));
  const value = selected.map((s) => ({ value: s, label: s }));

  return (
    <div className="min-w-[220px]">
      <Select
        options={opts}b   
        onChange={(v) => onChange(Array.isArray(v) ? v.map((x) => x.value) : [])}
        isMulti
        isClearable
        placeholder={placeholder}
        closeMenuOnSelect={false}
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          indicatorsContainer: () => ({ display: "none" }),
          control: (base, state) => ({
            ...base,
            backgroundColor: '#0f1724',
            borderColor: state.isFocused ? '#0369a1' : '#374151',
            minHeight: 32,
            height: 32,
            boxShadow: 'none',
          }),
          valueContainer: (base) => ({ ...base, padding: '0 6px' }),
          input: (base) => ({ ...base, color: '#e5e7eb', margin: 0, padding: 0 }),
          multiValue: (base) => ({ ...base, backgroundColor: '#374151', color: '#fff', padding: '0 6px', borderRadius: 6 }),
          multiValueLabel: (base) => ({ ...base, color: '#fff', fontSize: 12 }),
          multiValueRemove: (base) => ({ ...base, color: '#cbd5e1', ':hover': { backgroundColor: '#4b5563', color: '#fff' } }),
          menu: (base) => ({ ...base, backgroundColor: '#0f1724' }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#0369a1' : state.isFocused ? '#374151' : 'transparent',
            color: state.isSelected ? '#fff' : '#e5e7eb',
          }),
        }}
      />
    </div>
  );
}

export default ReactSelectMulti;
