import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";

interface TodoItem {
  id: string;
  label: string;
  isComplete: boolean;
}

const Home = () => {
  const [newTodoText, setNewTodoText] = useState("");
  const { loading, error, data } = useQuery(
    gql`
      query user {
        user {
          username
          lists {
            id
            name
          }
        }
      }
    `
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const addTodoList = () => {
    console.log("addTodoList");
  };

  return (
    <div>
      <h2>Lists:</h2>
      <ul>
        {data?.user?.lists.map((list: any) => (
          <li key={list.id}>
            <Link to={`/lists/${list.id}`}>{list.name}</Link>
          </li>
        ))}
      </ul>

      <input
        type="text"
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            addTodoList();
          }
        }}
      />
      <button disabled={newTodoText.length === 0} onClick={addTodoList}>
        Add new List
      </button>
    </div>
  );
};

export default Home;
