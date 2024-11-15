import axios from "axios";
import { error } from "console";
import { getCookies } from "cookies-next";

const allCookies = getCookies();
const token = allCookies["token"];

export const getCompanyInfo = async () => {
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCompanyInfo = async (id: number, data: any) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/info/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return response.data
    }
    return [];
  } catch (error) {
    console.error(error);
    throw error
  }
};
