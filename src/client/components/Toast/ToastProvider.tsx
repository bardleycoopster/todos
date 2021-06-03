import React, { useState } from "react";

import ToastContext, { IToast } from "./ToastContext";
import Toast from "./Toast";

interface Props {
  children: React.ReactNode;
}

const ToastProvider = ({ children }: Props) => {
  const [toast, setToast] = useState<IToast | undefined>(undefined);
  const [show, setShowToast] = useState(false);

  return (
    <ToastContext.Provider
      value={{
        show,
        toast,
        showToast: (newToast) => {
          setToast(newToast);
          setShowToast(true);
        },
      }}
    >
      <div className="overflow-hidden">
        {children}
        <Toast
          open={show}
          message={toast?.message}
          duration={toast?.duration}
          autoClose={toast?.autoClose}
          type={toast?.type}
          onClose={() => {
            setShowToast(false);
          }}
        />
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
