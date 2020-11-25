import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import Header from "components/Header";
import Button from "components/Button";

const USER_QUERY = gql`
  query user {
    user {
      username
      lists {
        id
        name
      }
    }
  }
`;

const Home = () => {
  const [newTodoText, setNewTodoText] = useState("");
  const { error, data } = useQuery(USER_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  // if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const addTodoList = () => {
    console.log("addTodoList");
  };

  if (!window.localStorage.getItem("token")) {
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: { referrer: window.location.pathname },
        }}
      />
    );
  }

  return (
    <div className="h-full">
      <Header />
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl text-center mt-4">Lists</h1>

        <ul>
          {data?.user?.lists.map((list: any) => (
            <Link key={list.id} to={`/lists/${list.id}`}>
              <li className="py-5 px-3 text-xl w-full font-semibold border-b-2 border-gray-500">
                {list.name}
              </li>
            </Link>
          ))}
        </ul>

        <div className="w-full mt-5">
          <input
            className="border-green-500 border-2 rounded-md px-4 py-1"
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addTodoList();
              }
            }}
          />
          <Button disabled={newTodoText.length === 0} onClick={addTodoList}>
            Add new List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
