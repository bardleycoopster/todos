import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <header className="w-full h-80 flex justify-center items-center shadow-lg bg-gradient-to-br from-gray-800 to-gray-700">
        <h1 className="text-8xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 hover:from-pink-500 hover:to-purple-400">
          Todos
        </h1>
      </header>

      <section className="w-full h-80 bg-white text-black object-center text-center flex flex-col justify-center items-center">
        <p className="">Persisted list of todos</p>
        <div className="mt-5 bg-gray-800 shadow-md hover:shadow-lg text-center rounded">
          <Link
            className="block py-2 px-3 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-500 font-bold text-1xl "
            to="/create-account"
          >
            GET STARTED
          </Link>
        </div>
      </section>

      <footer className="w-full bg-gray-800 text-center py-5">
        <p className="my-1">A web application by Andrew Herriot.</p>
        <p className="my-1">
          Source code available at{" "}
          <a
            className="text-pink-500 hover:text-pink-700 font-semibold"
            href="https://www.github.com/aherriot/todos"
          >
            github.com/aherriot/todos
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;
