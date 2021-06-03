import React, { useEffect } from "react";
import { Transition } from "@headlessui/react";

interface Props {
  message: string;
  open: boolean;
  onClose: () => void;
  autoClose: boolean;
  duration?: number;
  type: "success" | "error";
}

const defaultProps: Partial<Props> = {
  duration: 3000,
  type: "success",
};

const Toast = ({
  message,
  open,
  onClose,
  duration,
  autoClose,
  type,
}: Props) => {
  useEffect(() => {
    // autoClose defaults to true if type is success
    // otherwise if type is error, autoClose defaults to false.
    if (!(autoClose ?? type === "success")) {
      return;
    }

    const timeoutRef = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timeoutRef);
    };
  }, [message, duration, onClose, autoClose, type]);

  return (
    <Transition
      show={open}
      appear
      className="fixed bottom-3 right-3"
      enter="transition transition transform-gpu duration-500"
      enterFrom="opacity-0 translate-x-20"
      enterTo="opacity-100 translate-x-0"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`${
          type === "success" ? "bg-blue-400" : "bg-red-400"
        } p-4 pr-7 relative`}
      >
        {message}
        <span
          onClick={onClose}
          className={`absolute top-0 right-0 cursor-pointer px-2 py-1
          ${type === "success" ? "hover:bg-blue-500" : "hover:bg-red-500"}`}
        >
          X
        </span>
      </div>
    </Transition>
  );
};

Toast.defaultProps = defaultProps;

export default Toast;
