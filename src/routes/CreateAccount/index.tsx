import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "components/Header";

const CREATE_ACCOUNT_MUTATION = gql`
  mutation createAccount($input: CreateAccountInput) {
    createAccount(input: $input) {
      jwt
    }
  }
`;

const CreateAccount = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [createAccount] = useMutation(CREATE_ACCOUNT_MUTATION);
  const history = useHistory<any>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await createAccount({
        variables: { input: { username, password, email } },
      });

      localStorage.setItem("token", resp.data.createAccount.jwt);

      if (history.location.state?.referrer) {
        history.replace(history.location.state.referrer);
      } else {
        history.replace("/lists");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
      console.log(e);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-sm mx-auto">
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
      </div>
      {error && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-lg min-w-lg mx-auto py-2 px-8  border-red-700 rounded-sm bg-gradient-to-br from-red-600 to-red-800">
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateAccount;
