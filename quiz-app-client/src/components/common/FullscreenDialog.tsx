import type { FC, ReactNode } from "react";
import { createPortal } from "react-dom";

interface FullscreenDialogProps {
  children: ReactNode;
  onClose: () => void;
}

const FullscreenDialog: FC<FullscreenDialogProps> = ({ children, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal content */}
      <div className="relative bg-white rounded-lg shadow-lg w-[90%] max-w-md p-4 z-10">
        {/* header с кнопкой закрытия */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ✕
          </button>
        </div>

        {/* контент */}
        <div className="overflow-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FullscreenDialog;
