import React from "react";

export interface IToast {
  id?: number;
  message: string;
  autoClose?: boolean;
  type?: "success" | "error";
  duration?: number;
}

interface IToastContext {
  show: boolean;
  toast?: IToast;
  showToast: (toast: IToast) => number;
  clearToast: (id: number) => boolean;
}

const defaultValue: IToastContext = {
  show: false,
  showToast: (toast: IToast) => {
    return -1;
  },
  clearToast: (id: number) => false,
};

export default React.createContext<IToastContext>(defaultValue);
