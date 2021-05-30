import React, { useState } from "react";
import produce from "immer";
import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import Notification from "client/components/Notification";
import Button from "client/components/Button";

import {
  useShareListsMutation,
  useUnshareListsMutation,
  useShareListsUsersQuery,
  ShareListsUsersDocument,
  ShareListsUsersQuery,
} from "types/graphql-schema-types";

const ShareLists = () => {
  const [val, setVal] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useShareListsUsersQuery({
    fetchPolicy: "cache-and-network",
  });

  const [shareLists] = useShareListsMutation({
    variables: { input: { username: val, email: val } },
    onError: (e) => {
      setError(e.message);
    },
    update: (cache, { data }) => {
      if (!data?.shareLists) {
        return;
      }

      const result = cache.readQuery<ShareListsUsersQuery>({
        query: ShareListsUsersDocument,
      });

      if (!result) {
        return;
      }

      cache.writeQuery({
        query: ShareListsUsersDocument,
        data: produce(result, (draft) => {
          draft.shareListsUsers.push(data.shareLists);
        }),
      });
    },
  });

  const [unshareLists] = useUnshareListsMutation({
    onError: (e) => {
      setError(e.message);
    },
    update: (cache, { data }) => {
      if (!data?.unshareLists) {
        return;
      }

      const result = cache.readQuery<ShareListsUsersQuery>({
        query: ShareListsUsersDocument,
      });

      if (!result) {
        return;
      }

      cache.writeQuery({
        query: ShareListsUsersDocument,
        data: produce(result, (draft) => {
          draft.shareListsUsers = draft.shareListsUsers.filter((user) => {
            return user.id !== data.unshareLists;
          });
        }),
      });
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    shareLists();
  };

  return (
    <div>
      <Header />
      <PageContent>
        <h2 className="mt-5 text-center text-4xl">Share Lists</h2>
        {data?.shareListsUsers.map((user) => (
          <div key={user.id}>
            {user.username}
            <button
              onClick={() => unshareLists({ variables: { id: user.id } })}
            >
              Delete
            </button>
          </div>
        ))}
        <p className="my-5">
          Enter username or email of the person you want to share with.
        </p>
        <form onSubmit={onSubmit}>
          <input
            className="text-black"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <Button disabled={!val} type="submit">
            SHARE
          </Button>
          <Notification error={error} />
        </form>
      </PageContent>
    </div>
  );
};

export default ShareLists;
