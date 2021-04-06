import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "apollo-link-error";
import { CachePersistor } from "apollo3-cache-persist";

import browserHistory from "./browserHistory";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const SCHEMA_VERSION = "1";
const SCHEMA_VERSION_KEY = "apollo-schema-version";

async function main() {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          shareListsUsers: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  });

  const host =
    process.env.NODE_ENV === "production"
      ? window.location.host
      : "localhost:8000";

  const token = localStorage.getItem("token");

  const wsLink = new WebSocketLink({
    uri: `ws://${host}/subscriptions`,
    options: {
      reconnect: true,
      connectionParams: {
        authorization: token ? `Bearer ${token}` : "",
      },
    },
  });

  const httpLink = new HttpLink({ uri: "/graphql" });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });

    return forward(operation);
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach((error) => {
        if (error.extensions?.code === "UNAUTHENTICATED") {
          localStorage.removeItem("token");
          browserHistory.replace({
            pathname: "login",
            state: { referrer: window.location.pathname },
          });
        }
      });
    }
    // if (networkError) console.log(`[Network error]: ${networkError}`);
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
    link: ApolloLink.from([
      authMiddleware,
      (errorLink as unknown) as ApolloLink,
      splitLink,
    ]),
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
