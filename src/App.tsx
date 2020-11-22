import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import Home from "routes/Home";
import List from "routes/List";
import CreateAccount from "routes/CreateAccount";
import Login from "routes/Login";
import Profile from "routes/Profile";

const token = localStorage.getItem("token");

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
  headers: {
    authorization: token ? `Bearer ${token}` : "",
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
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
