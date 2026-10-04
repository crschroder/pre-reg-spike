import type { ReactNode } from "react";

type AppModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function AppModal({ isOpen, title, onClose, children }: AppModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-gray-700 bg-gray-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
        <div className="px-4 py-4 text-sm text-gray-200">{children}</div>
      </div>
    </div>
  );
}
