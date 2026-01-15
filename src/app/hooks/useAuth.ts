import axios from "../shared/lib/axios";

//jotai
import { useSetAtom } from "jotai";
import atoms from "@/app/(pages)/_providers/jotai";

import { LOGIN_MUTATION, LOGOUT_MUTATION } from "../services/query/authQuery";
import { useQueryClient } from "@tanstack/react-query";
import useToast from "./useToast";
import { DISHES } from "../shared/constants";

const useAuth = () => {
  const setAuth = useSetAtom(atoms.isAuth);
  const setUserProfile = useSetAtom(atoms.userProfile);

  const toast = useToast();

  const queryClient = useQueryClient();

  const login = async (variables: LoginCredentials): Promise<LoginResponse | undefined> => {
    try {
      const { data } = await axios({
        data: {
          query: LOGIN_MUTATION,
          variables,
        },
      });

      // Axios unwraps to response.data, GraphQL has another data layer
      // So we need data.data.loginCustomer
      const response = data.data?.loginCustomer as LoginResponse;

      //graphql error
      if (data.errors || !response) {
        setUserProfile(null);
        const errorMsg = data.errors?.[0]?.message || "Authentication.loginError";
        throw new Error(errorMsg);
      }

      //if login success
      if (response?.token) {
        setUserProfile(response?.user);
        toast("Authentication.loginSuccess", "success", { duration: 2000 });
        // Reload page to update UI
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      return response;
    } catch (err: any) {
      if (err) {
        setUserProfile(null);
        const errorMessage = err?.message || "Authentication.loginError";
        toast(errorMessage, "error", { duration: 4000 });
      }
    }
  };

  const logout = async () => {
    const { data } = await axios({
      data: {
        query: LOGOUT_MUTATION,
      },
    });
    setUserProfile(null);
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    if (data.data.logoutUser) {
      toast("Actions.logoutUser", "info");
      localStorage?.removeItem(DISHES);
    }
  };

  return { login, logout };
};

export default useAuth;
