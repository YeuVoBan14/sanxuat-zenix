import axios, { AxiosError } from "axios";
import { setCookie, deleteCookie, getCookies } from "cookies-next";

export const postLogin = async (userName: string, password: string) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/login/`, {
      userName,
      password,
    });
    setCookie("token", response.data.data.token.accessToken, {
      maxAge: 24 * 60 * 60,
      path: "/",
    });
    setCookie("admin", response.data.data.user.role);

    localStorage.setItem("user", JSON.stringify(response.data.data.user));
    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
          message: error.response.data.message,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
};

const allCookies = getCookies();
const token = allCookies["token"];

export const postLogout = async () => {
  if (!token) {
    return false;
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      deleteCookie("token");
      localStorage.clear();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const postChangePassword = async (passwordOld: string, passwordNew: string) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/user`,
      {
        passwordOld,
        passwordNew,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      deleteCookie("token");
      localStorage.clear();
      return { success: true };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
          message: error.response.data.message,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
};

export const updateProfile = async (data: { fullName: string; phoneNumber: string; email: string }) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/user`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true };
    }
  } catch (error) {
    console.log(error);
  }
};

export const getUserFunctions = async ({ token }: { token: string }) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/list-functions-user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.log(error);
  }
};
