import React from "react";

export interface IToast {
  message: string;
  autoClose?: boolean;
  type?: "success" | "error";
  duration?: number;
}

interface IToastContext {
  show: boolean;
  toast?: IToast;
  showToast: (toast: IToast) => void;
}

const defaultValue: IToastContext = {
  show: false,
  showToast: (toast: IToast) => {},
};

export default React.createContext<IToastContext>(defaultValue);
