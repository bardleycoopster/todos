import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";

import Home from "routes/Home";
import Lists from "routes/Lists";
import List from "routes/List";
import CreateAccount from "routes/CreateAccount";
import Login from "routes/Login";
import Profile from "routes/Profile";

import "styles/generated/tailwind.css";

interface Props {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

function App({ apolloClient }: Props) {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/lists" component={Lists} />
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
