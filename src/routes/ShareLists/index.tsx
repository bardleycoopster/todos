import React, { useState } from "react";
import Header from "components/Header";
import PageContent from "components/PageContent";

import { useShareListsMutation } from "types/graphql-schema-types";

const ShareLists = () => {
  const [val, setVal] = useState("");
  const [shareLists] = useShareListsMutation();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    shareLists({
      variables: { input: { username: val, email: val } },
    });
  };

  return (
    <div>
      <Header />
      <PageContent>
        Enter username or email of the person you want to share with.
        <form onSubmit={onSubmit}>
          <input
            className="text-black"
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <input type="submit" value="SHARE" />
        </form>
      </PageContent>
    </div>
  );
};

export default ShareLists;
