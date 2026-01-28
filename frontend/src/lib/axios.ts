import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: "https://projetointegrador4-2.onrender.com",
});

export const getAuthorization = (token: string) => {
  api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

export interface ApiAxiosRequest<T> {
  success: boolean;
  message: string;
  entity: T;
}

export interface ApiAxiosRequestError<T>
  extends AxiosError<ApiAxiosRequest<T>> { }

export interface ApiProductsAxiosRequest<L> {
  success: boolean;
  productList: L;
}
