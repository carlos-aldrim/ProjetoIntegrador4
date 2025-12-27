import axios from "axios";
import { useState, useCallback, useMemo, createContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserContextType,
  User,
  ResponseLoginUser,
  DataCreateUser,
} from "../../types";
import { useToast } from "../../hooks";
import { ResponseCreateUser } from "../../types/responseCreateUser";

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface ApiError {
  message: string;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { handleToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = useCallback(
    async (mail: string, password: string) => {
      try {
        setLoading(true);
        const response = await axios.post<{ message: string }>(
          "http://localhost:3001/usuario/login",
          { mail, password }
        );

        if (response.status === 200) {
          setUser({ mail, password });
          setIsLogin(true);
          navigate("/confirm-token");
          handleToast(response.data.message, "success");
        } else {
          handleToast(response.data.message, "error");
        }
      } catch (error) {
        handleToast("Falha ao realizar o login.", "error");
      } finally {
        setLoading(false);
      }
    },
    [handleToast, navigate]
  );

  const confirmUser = useCallback(
    async (mail: string, confirmToken: string) => {
      try {
        setLoading(true);
        const response = await axios.post<ResponseLoginUser>(
          "http://localhost:3001/usuario/confirm-token",
          { mail, confirmToken }
        );

        if (response.status === 200) {
          setIsAuth(true);
          navigate("/");
          handleToast(response.data.message, "success");
        } else {
          handleToast(response.data.message, "error");
        }
      } catch (error) {
        handleToast("Falha ao realizar a confirmação do email.", "error");
      } finally {
        setLoading(false);
      }
    },
    [handleToast, navigate]
  );

  const createUser = useCallback(
    async (user: DataCreateUser) => {
      try {
        setLoading(true);

        console.log(user);
        const response = await axios.post<ResponseCreateUser>(
          "http://localhost:3001/usuario/new-user",
          user
        );

        console.log(response);

        if (response.status === 201) {
          navigate("/");
          handleToast(response.data.message, "success");
        } else {
          navigate("/signup");
          handleToast(response.data.message, "error");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = (error.response?.data as ApiError)?.message || "Erro ao criar o usuário.";
          navigate("/signup");
          handleToast(message, "error");
          navigate("/signup", {
            state: { resetForm: true },
          });
        } else {
          navigate("/signup");
          handleToast("Erro inesperado ao criar o usuário.", "error");
          navigate("/signup", {
            state: { resetForm: true },
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [handleToast, navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsLogin(false);
    setIsAuth(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      confirmUser,
      logout,
      isLogin,
      loading,
      isAuth,
      createUser,
    }),
    [user, login, confirmUser, logout, isLogin, loading, isAuth, createUser]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
