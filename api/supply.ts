import { PaginationType, Supplier } from "@/types/type";
import axios from "axios";
import { getCookies } from "cookies-next";

const allCookies = getCookies();
const token = allCookies["token"];

export const postSupplier = async (data: Supplier) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/supplier/create-supplier`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export const getSupplierList = async (data: {
  page: number,
  pageSize: number,
  keySearch: string,
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  const returnQueryString = (keySearch: string) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    if (keySearch)
      queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
    return queryString;
  };
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/supplier/list-supplier${returnQueryString(
      data.keySearch
    )}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    // if (axios.isAxiosError(error)) {
    //   if (error.response && error.response.data) {
    //     return {
    //       success: false,
    //       type: error.response.data.type,
    //       message: error.response.data.message,
    //     };
    //   }
    // }
    // return { success: false, message: "Có lỗi xảy ra." };
    throw error;
  }
};

export const deleteSupplier = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/supplier/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    throw error;
  }
};

export const editSupplier = async (data: Supplier, id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/supplier/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    throw error;
  }
};

export const postSupplierExcel = async (formData: FormData) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/supplier/create-by-excel`, formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200) {
      return {
        success: true,
        data: response.data
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." }
  }
}

export const getSupplierListByProduct = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/product-supplier/list-suppliers/` + id, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        // return {
        //   success: false,
        //   type: error.response.data.type,
        //   message: error.response.data.message,
        // };
        throw error;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
};