import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  concat,
} from "@apollo/client";
import { CachePersistor } from "apollo3-cache-persist";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const SCHEMA_VERSION = "1";
const SCHEMA_VERSION_KEY = "apollo-schema-version";

async function main() {
  const cache = new InMemoryCache();
  const httpLink = new HttpLink({ uri: "/graphql" });
  const authMiddleware = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem("token");

    // add the authorization to the headers
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });

    return forward(operation);
  });

  const persistor = new CachePersistor({
    cache,
    storage: localStorage,
  });

  const currentVersion = localStorage.getItem(SCHEMA_VERSION_KEY);

  if (currentVersion === SCHEMA_VERSION) {
    await persistor.restore();
  } else {
    await persistor.purge();
    localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
  }

  const client = new ApolloClient({
    cache: cache,
    link: concat(authMiddleware, httpLink),
  });

  ReactDOM.render(
    <React.StrictMode>
      <App apolloClient={client} />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

main();

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
