import { Routes, Route } from "react-router-dom";
import { PrivateRouter } from "../components";
import { SignInPage, TokenPage, SignUpPage, ProfilePage } from "../pages";

import { ForgotPasswordPage } from "../pages";
import { ResetPasswordPage } from "../pages";

export const Router = () => {

  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/confirm-token"
        element={<TokenPage />}
      />

      <Route
        path="/signup"
        element={
          <PrivateRouter auth={true}>
            <SignUpPage />
          </PrivateRouter>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRouter auth={true}>
            <ProfilePage />
          </PrivateRouter>
        }
      />

      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
};
