import React from "react";

interface Props {
  error?: React.ReactNode;
}

const Notification = ({ error }: Props) => {
  if (!error) {
    return null;
  }
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-lg min-w-lg mx-auto py-2 px-8  border-red-700 rounded-sm bg-gradient-to-br from-red-600 to-red-800">
      {error}
    </div>
  );
};

export default Notification;
