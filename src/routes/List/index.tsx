import React, { useState, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import produce from "immer";
import { Redirect } from "react-router-dom";
import Header from "components/Header";
import Button from "components/Button";
const LIST_QUERY = gql`
  query list($id: ID!) {
    list(id: $id) {
      id
      name
      items {
        id
        description
        position
        complete
      }
    }
  }
`;

const CREATE_LIST_ITEM_MUTATION = gql`
  mutation createListItem($input: CreateListItemInput) {
    createListItem(input: $input) {
      id
      description
      position
      complete
    }
  }
`;

const COMPLETE_LIST_ITEM_MUTATION = gql`
  mutation completeListItem($input: CompleteListItemInput) {
    completeListItem(input: $input) {
      id
      description
      position
      complete
    }
  }
`;

const REMOVE_COMPLETED_LIST_ITEMS = gql`
  mutation removeCompletedListItems($listId: ID!) {
    removeCompletedListItems(listId: $listId)
  }
`;

interface Props {
  match: any;
}

const List = ({ match }: Props) => {
  const [newTodoText, setNewTodoText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { error, data: listData } = useQuery(LIST_QUERY, {
    variables: { id: match.params.listId },
    fetchPolicy: "cache-and-network",
  });

  const [createListItem] = useMutation(CREATE_LIST_ITEM_MUTATION, {
    update: (cache, { data: { createListItem: newListItem } }) => {
      const data: any = cache.readQuery({
        query: LIST_QUERY,
        variables: { id: match.params.listId },
      });

      cache.writeQuery({
        query: LIST_QUERY,
        data: produce(data, (draft: any) => {
          draft.list.items.push(newListItem);
        }),
      });
    },
  });

  const [completeListItem] = useMutation(COMPLETE_LIST_ITEM_MUTATION);

  const [removeCompletedListItems] = useMutation(REMOVE_COMPLETED_LIST_ITEMS, {
    update: (cache, { data: { removeCompletedListItems } }) => {
      const data: any = cache.readQuery({
        query: LIST_QUERY,
        variables: { id: match.params.listId },
      });

      cache.writeQuery({
        query: LIST_QUERY,
        data: produce(data, (draft: any) => {
          draft.list.items = data.list.items.filter(
            (item: any) => !item.complete
          );
        }),
      });
    },
  });

  const addTodo = () => {
    if (newTodoText) {
      createListItem({
        variables: {
          input: { listId: match.params.listId, description: newTodoText },
        },
      });
      setNewTodoText("");
      inputRef.current?.focus();
    }
  };

  const list = listData?.list;

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

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (!list) {
    return <div>Loading...</div>;
  }

  const incompletedItems = list.items
    .filter((item: any) => !item.complete)
    .sort((a: any, b: any) => a.position - b.position);

  const completedItems = list.items
    .filter((item: any) => item.complete)
    .sort((a: any, b: any) => a.position - b.position);

  return (
    <div className="h-screen">
      <Header />
      <div className="max-w-lg mx-auto border-gray-600 md:border-r-2 md:border-l-2 px-4 shadow-xl h-full">
        <h2 className="text-lg font-semibold py-4">
          Todo: {listData?.list.name}
        </h2>
        <ul>
          {incompletedItems.map((item: any) => (
            <li
              className="cursor-pointer py-2 px-2 -mx-4 bg-gradient-to-r hover:from-purple-400 hover:to-pink-500 flex items-center"
              key={item.id}
              onClick={() =>
                completeListItem({
                  variables: {
                    input: { id: item.id, complete: !item.complete },
                  },
                })
              }
            >
              <span className="mr-2 pb-1 text-2xl font-bold text-purple-500 ">
                {"\u2610"}
              </span>
              {item.description}
            </li>
          ))}
        </ul>
        {incompletedItems.length === 0 && (
          <div className="text-center">List empty</div>
        )}

        <h2 className="text-lg font-semibold py-4">Completed Todos</h2>
        <ul>
          {completedItems.map((item: any) => (
            <li
              className="cursor-pointer py-2 px-2 -mx-4 text-gray-400 bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 line-through flex items-center"
              key={item.id}
              onClick={() =>
                completeListItem({
                  variables: {
                    input: { id: item.id, complete: !item.complete },
                  },
                })
              }
            >
              <span className="mr-2 text-xl font-bold">{"\u2611"}</span>
              {item.description}
            </li>
          ))}
        </ul>
        {completedItems.length === 0 && (
          <div className="text-center">List empty</div>
        )}

        <div className="mt-8 text-center">
          <input
            className="text-black py-2 px-5 rounded-sm border-blue-600 border-2 mr-2 focus:rounded"
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            ref={inputRef}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addTodo();
              }
            }}
          />
          <Button onClick={addTodo}>ADD</Button>
          <div className="mt-6">
            <button
              className="py-2 px-5 rounded-sm  bg-gradient-to-br from-red-400 to-red-700 text-white font-semibold hover:from-red-500 hover:to-red-800 shadow-lg"
              disabled={completedItems.length === 0}
              onClick={() => {
                removeCompletedListItems({
                  variables: { listId: match.params.listId },
                });
              }}
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
