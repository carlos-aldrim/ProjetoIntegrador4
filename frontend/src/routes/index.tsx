import { Routes, Route } from "react-router-dom";
import { PrivateRouter } from "../components";
import { useUser } from "../hooks/UseUser";
import { SignInPage, TokenPage, SignUpPage, HomePage, UserPage, CorrecaoPage, ProfilePage, ForgotPasswordPage, ResetPasswordPage } from "../pages";

export const Router = () => {
  const { isLogin, isAuth } = useUser();

  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/confirm-token" element={<TokenPage />} />
      <Route
        path="/home"
        element={
          <PrivateRouter auth={isAuth}>
            <HomePage />
          </PrivateRouter>
        }
      />
      <Route
        path="/user"
        element={
          <PrivateRouter auth={isAuth}>
            <UserPage />
          </PrivateRouter>
        }
      />
      <Route
        path="/corrigir-prova"
        element={
          <PrivateRouter auth={isAuth}>
            <CorrecaoPage />
          </PrivateRouter>
        }
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
