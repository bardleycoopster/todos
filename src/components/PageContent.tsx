import React from "react";

interface Props {
  children: React.ReactNode;
}

const PageContent = ({ children }: Props) => {
  return (
    <div className="max-w-lg mx-auto border-gray-600 md:border-r-2 md:border-l-2 px-4 shadow-xl h-full">
      {children}
    </div>
  );
};

export default PageContent;
