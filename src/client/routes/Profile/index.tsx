import React from "react";
import { Redirect } from "react-router-dom";
import Header from "client/components/Header";
import PageContent from "client/components/PageContent";
import Button from "client/components/Button";
import useUser from "client/components/User/useUser";

const Profile = () => {
  const user = useUser();

  if (!user) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      <Header />
      <PageContent>
        <h1>Profile</h1>
        <Button
          onClick={() => {
            localStorage.clear();
          }}
        >
          Logout
        </Button>
      </PageContent>
    </div>
  );
};

export default Profile;
