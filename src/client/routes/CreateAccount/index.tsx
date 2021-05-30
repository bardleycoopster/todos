import React, { useState } from "react";
import { useCreateAccountMutation } from "types/graphql-schema-types";
import { useHistory } from "react-router-dom";
import { Link, Redirect } from "react-router-dom";
import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import Notification from "client/components/Notification";

const CreateAccount = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [createAccount] = useCreateAccountMutation();
  const history = useHistory<IHistoryState>();

  const token = localStorage.getItem("token");
  if (token) {
    return <Redirect to="/lists" />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await createAccount({
        variables: { input: { username, password, email } },
      });

      if (resp.data) {
        localStorage.setItem("token", resp.data.createAccount.jwt);

        if (history.location.state?.referrer) {
          history.replace(history.location.state.referrer);
        } else {
          history.replace("/lists");
        }
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <PageContent>
        <h2 className="mt-10 mb-10 text-center text-3xl font-bold">
          CREATE ACCOUNT
        </h2>
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
            <label className="block mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full text-black py-2 px-2 rounded-sm border-2 border-black"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="flex items-center justify-between mt-6">
            <Link
              className="text-pink-500 hover:text-pink-700 font-semibold"
              to="/login"
            >
              Login
            </Link>
            <input
              className="py-2 px-5 bg-gradient-to-br from-purple-400 to-pink-500  rounded-sm text-white font-semibold hover:from-purple-500 hover:to-pink-600 shadow-lg focus:outline-none"
              type="submit"
              value="CREATE ACCOUNT"
              disabled={!username || !password || !email}
            />
          </div>
        </form>
      </PageContent>
      <Notification error={error} />
    </div>
  );
};

export default CreateAccount;
