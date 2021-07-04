import React from "react";
import { Link, useHistory, Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "types/graphql-schema-types";
import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import TextField from "client/components/TextField";
import useToast from "client/components/Toast/useToast";
import useUser from "client/components/User/useUser";

let toastId: number;

type FormData = {
  username: string;
  password: string;
};

const Login = () => {
  const user = useUser();
  const { showToast, clearToast } = useToast();
  const history = useHistory<IHistoryState>();

  const {
    register,
    formState: { isValid, isSubmitted, errors },
    handleSubmit,
    setError,
  } = useForm<FormData>();

  const [login] = useLoginMutation({
    onError: (e) => {
      e.graphQLErrors.forEach((error) => {
        if (error?.extensions?.username) {
          setError(
            "username",
            { message: error?.extensions?.username },
            { shouldFocus: true }
          );
        }

        if (error?.extensions?.password) {
          setError(
            "password",
            { message: error?.extensions?.password },
            { shouldFocus: true }
          );
        }
      });
      toastId = showToast({ message: "Login failed", type: "error" });
    },
  });

  if (user) {
    return <Redirect to="/lists" />;
  }

  const onSubmit = async ({ username, password }: FormData) => {
    clearToast(toastId);
    try {
      const resp = await login({
        variables: { input: { username, password } },
      });
      if (resp?.data) {
        localStorage.setItem("token", resp.data.login.jwt);
        if (history.location.state?.referrer) {
          console.log("history", history.location.state.referrer);
          history.replace(history.location.state.referrer);
          console.log(history);
        } else {
          console.log("history2", "/lists");
          history.replace("/lists");
        }
      }
    } catch (e) {
      toastId = showToast({ message: "Login failed", type: "error" });
    }
  };

  return (
    <div>
      <Header />
      <PageContent>
        <h2 className="mt-5 text-center text-4xl">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("username", {
              required: "Username is required.",
              maxLength: { value: 10, message: "Username is too long." },
              minLength: { value: 3, message: "Username is too short." },
            })}
            id="username"
            label="Username"
            error={errors.username}
          />
          <TextField
            {...register("password", {
              required: "Password is required.",
              minLength: { value: 8, message: "Password is too short." },
            })}
            id="password"
            type="password"
            label="Password"
            error={errors.password}
          />
          <div className="flex items-center justify-between mt-6">
            <Link
              className="text-pink-500 hover:text-pink-700 font-semibold"
              to="/create-account"
            >
              Create Account
            </Link>
            <input
              className="py-2 px-5 bg-gradient-to-br from-purple-400 to-pink-500  rounded-sm text-white font-semibold hover:from-purple-500 hover:to-pink-600 shadow-lg focus:outline-none"
              type="submit"
              value="LOGIN"
              disabled={!isValid && isSubmitted}
            />
          </div>
        </form>
      </PageContent>
    </div>
  );
};

export default Login;
