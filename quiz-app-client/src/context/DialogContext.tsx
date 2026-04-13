import { createContext, useContext, useState, type ReactNode } from "react";
import FullscreenDialog from "../components/common/FullscreenDialog";

type DialogState = {
  isOpen: boolean;
  content: ReactNode | null;
};

type DialogContextType = {
  openDialog: (content: ReactNode) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, content: null });

  const openDialog = (content: ReactNode) => {
    setDialog({ isOpen: true, content });
    document.body.style.overflow = "hidden";
  };

  const closeDialog = () => {
    setDialog({ isOpen: false, content: null });
    document.body.style.overflow = "";
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {dialog.isOpen && <FullscreenDialog onClose={closeDialog}>{dialog.content}</FullscreenDialog>}
    </DialogContext.Provider>
  );
};

// ✅ Хук не принимает аргументов
export const useDialog = (): DialogContextType => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside DialogProvider");
  return ctx;
};