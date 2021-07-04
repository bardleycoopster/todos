import React from "react";
import { Link } from "react-router-dom";
import useUser from "client/components/User/useUser";

const Header = () => {
  const user = useUser();
  return (
    <header className="w-full bg-gray-800 flex justify-center items-center h-14 shadow-lg">
      <Link to="/">
        <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 hover:from-pink-500 hover:to-purple-400">
          Todos
        </h1>
      </Link>
      {user && (
        <Link to="/profile" className="absolute right-3">
          {user?.username}
        </Link>
      )}
    </header>
  );
};

export default Header;
