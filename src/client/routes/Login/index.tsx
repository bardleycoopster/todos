import React, { useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useLoginMutation } from "client/types/graphql-schema-types";

import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import Notification from "client/components/Notification";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login] = useLoginMutation();
  const history = useHistory<IHistoryState>();

  const token = localStorage.getItem("token");
  if (token) {
    return <Redirect to="/lists" />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await login({
        variables: { input: { username, password } },
      });
      if (resp.data) {
        localStorage.setItem("token", resp.data.login.jwt);

        if (history.location.state?.referrer) {
          history.replace(history.location.state.referrer);
        } else {
          history.replace("/lists");
        }
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
      console.log(e);
    }
  };

  return (
    <div>
      <Header />
      <PageContent>
        <h2 className="mt-5 text-center text-4xl">Login</h2>
        <form onSubmit={onSubmit}>
          <div className="mt-5">
            <label className="block mb-1" htmlFor="username">
              Username
            </label>
            <input
              className="w-full text-black py-2 px-2 rounded-sm border-2 border-black"
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <label className="block mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full text-black py-2 px-2 rounded-sm border-2 border-black"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-right mt-6">
            <input
              className="py-2 px-5 bg-gradient-to-br from-purple-400 to-pink-500  rounded-sm text-white font-semibold hover:from-purple-500 hover:to-pink-600 shadow-lg focus:outline-none"
              type="submit"
              value="LOGIN"
              disabled={!username || !password}
            />
          </div>
        </form>
      </PageContent>
      <Notification error={error} />
    </div>
  );
};

export default Login;
