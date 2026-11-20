import { api } from "@/lib/api";
import type { AuthResult, User } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: "advertiser" | "agency";
}

/** `dev_reset_token` is only returned by the API in debug mode. */
export interface ForgotPasswordResult {
  message: string;
  dev_reset_token?: string | null;
}

export const authService = {
  login: async (input: LoginInput) => (await api.post<AuthResult>("/auth/login", input, { auth: false })).data,
  register: async (input: RegisterInput) =>
    (await api.post<AuthResult>("/auth/register", input, { auth: false })).data,
  forgotPassword: async (email: string) =>
    (await api.post<ForgotPasswordResult>("/auth/forgot-password", { email }, { auth: false })).data,
  resetPassword: (token: string, new_password: string) =>
    api.post<null>("/auth/reset-password", { token, new_password }, { auth: false }),
  me: async () => (await api.get<User>("/auth/me")).data,
  logout: (refresh_token: string | null) => api.post<null>("/auth/logout", { refresh_token }),
};
