import { useState } from "react";
import type { ToastData } from "../components/ui/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (type: ToastData["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  return { toast, showToast };
}
