import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import produce from "immer";
import { Link } from "react-router-dom";

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

  const { loading, error, data: listData } = useQuery(LIST_QUERY, {
    variables: { id: match.params.listId },
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
      console.log("count:", removeCompletedListItems);
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
    createListItem({
      variables: {
        input: { listId: match.params.listId, description: newTodoText },
      },
    });
  };

  const list = listData?.list;

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  if (!list || loading) {
    return <div>Loading...</div>;
  }

  const incompletedItems = list.items
    .filter((item: any) => !item.complete)
    .sort((a: any, b: any) => a.position - b.position);

  const completedItems = list.items
    .filter((item: any) => item.complete)
    .sort((a: any, b: any) => a.position - b.position);

  return (
    <div>
      <Link to="/">Home</Link>
      <h2>Todo: {listData?.list.name}</h2>
      <ul>
        {incompletedItems.map((item: any) => (
          <li
            key={item.id}
            onClick={() =>
              completeListItem({
                variables: {
                  input: { id: item.id, complete: !item.complete },
                },
              })
            }
          >
            {item.complete ? "\u2611" : "\u2610"} {item.description}
          </li>
        ))}
      </ul>
      {incompletedItems.length === 0 && <div>List empty</div>}

      <h2>Completed Todos</h2>
      <ul>
        {completedItems.map((item: any) => (
          <li
            key={item.id}
            onClick={() =>
              completeListItem({
                variables: {
                  input: { id: item.id, complete: !item.complete },
                },
              })
            }
          >
            {item.complete ? "\u2611" : "\u2610"} {item.description}
          </li>
        ))}
      </ul>
      {completedItems.length === 0 && <div>List empty</div>}
      <input
        type="text"
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            addTodo();
          }
        }}
      />
      <button disabled={newTodoText.length === 0} onClick={addTodo}>
        Add
      </button>
      <br />
      <button
        disabled={completedItems.length === 0}
        onClick={() => {
          removeCompletedListItems({
            variables: { listId: match.params.listId },
          });
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default List;
