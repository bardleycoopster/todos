import React from "react";

interface Props {
  children?: React.ReactNode;
  onClick?: () => void;
  dark?: boolean;
}

const defaultProps: Props = {
  dark: false,
};

const Button = ({ children, dark, ...others }: Props) => {
  return (
    <button
      className="py-2 px-5 bg-gradient-to-br from-purple-400 to-pink-500  rounded-sm text-white font-semibold hover:from-purple-500 hover:to-pink-600 shadow-lg focus:outline-none"
      {...others}
    >
      {children}
    </button>
  );
};

Button.defaultProps = defaultProps;

export default Button;
