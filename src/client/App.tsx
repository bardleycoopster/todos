import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";

import browserHistory from "./browserHistory";

import Home from "client/routes/Home";
import Lists from "client/routes/Lists";
import List from "client/routes/List";
import ShareLists from "client/routes/ShareLists";
import CreateAccount from "client/routes/CreateAccount";
import Login from "client/routes/Login";
import Profile from "client/routes/Profile";

import "client/styles/generated/tailwind.css";

interface Props {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

function App({ apolloClient }: Props) {
  return (
    <ApolloProvider client={apolloClient}>
      <Router history={browserHistory}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/lists" component={Lists} />
          <Route exact path="/lists/share" component={ShareLists} />
          <Route exact path="/lists/:listId" component={List} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/create-account" component={CreateAccount} />
          <Route exact path="/profile" component={Profile} />
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
