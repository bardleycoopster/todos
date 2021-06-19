import React from "react";
import { FieldError } from "react-hook-form";

interface IProps {
  id: string;
  label?: string;
  type?: string;
  error?: FieldError;
}

const TextField = React.forwardRef<HTMLInputElement, IProps>(
  ({ id, label, type, error, ...others }: IProps, ref) => {
    return (
      <div className="mt-5">
        {label && (
          <label className="block mb-1" htmlFor={id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className="w-full text-black py-2 px-2 rounded-sm border-2 border-black"
          type={type}
          id={id}
          {...others}
        />
        {error?.message && <p className="text-red-500">{error.message}</p>}
      </div>
    );
  }
);

TextField.defaultProps = {
  type: "text",
};

export default TextField;
