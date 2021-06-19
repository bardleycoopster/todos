import React from "react";
import { useHistory, Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "types/graphql-schema-types";
import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import TextField from "client/components/TextField";
import useToast from "client/components/Toast/useToast";

let toastId: number;

type FormData = {
  username: string;
  password: string;
};

const Login = () => {
  const { showToast, clearToast } = useToast();
  const {
    register,
    formState: { isValid, isSubmitted, errors },
    handleSubmit,
    setError,
  } = useForm<FormData>();

  const [login] = useLoginMutation({
    onError: (e) => {
      e.graphQLErrors.forEach((error) => {
        if (error?.extensions?.fields?.username) {
          setError(
            "username",
            { message: error?.extensions?.username },
            { shouldFocus: true }
          );
        }

        if (error?.extensions?.password) {
          setError(
            "password",
            { message: error?.extensions?.fields?.password },
            { shouldFocus: true }
          );
        }
      });
      toastId = showToast({ message: "Login failed", type: "error" });
    },
  });

  const history = useHistory<IHistoryState>();

  const token = localStorage.getItem("token");
  if (token) {
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
          history.replace(history.location.state.referrer);
        } else {
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
          <div className="text-right mt-6">
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
