import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { gql } from "@apollo/client";
import produce from "immer";
import {
  useCreateListMutation,
  useListsQuery,
  ListDocument,
} from "types/graphql-schema-types";

import Header from "components/Header";
import Button from "components/Button";

const LISTS_QUERY = gql`
  query lists {
    lists {
      id
      name
    }
  }
`;

const CREATE_LIST_MUTATION = gql`
  mutation createList($input: CreateListInput) {
    createList(input: $input) {
      id
      name
    }
  }
`;

const Lists = () => {
  const [newListName, setNewListName] = useState("");

  const { data, error } = useListsQuery({
    fetchPolicy: "cache-and-network",
  });

  const [createList] = useCreateListMutation({
    update: (cache, { data }) => {
      if (!data?.createList) {
        return;
      }

      const result = cache.readQuery({
        query: ListDocument,
      });

      cache.writeQuery({
        query: ListDocument,
        data: produce(result, (draft: any) => {
          draft.lists.push(data.createList);
        }),
      });
    },
  });

  // if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const addTodoList = () => {
    createList({ variables: { input: { name: newListName } } });
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
          {data?.lists.map((list: any) => (
            <Link key={list.id} to={`/lists/${list.id}`}>
              <li className="py-5 px-3 text-xl w-full font-semibold border-b-2 border-gray-500">
                {list.name}
              </li>
            </Link>
          ))}
        </ul>

        <div className="w-full mt-5">
          <input
            className="border-green-500 border-2 rounded-md px-4 py-1 text-black"
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addTodoList();
              }
            }}
          />
          <Button disabled={newListName.length === 0} onClick={addTodoList}>
            Add new List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lists;
