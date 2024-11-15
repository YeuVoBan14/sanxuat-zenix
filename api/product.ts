import { PaginationType } from "@/types/type";
import axios from "axios";
import { getCookies } from "cookies-next";


const allCookies = getCookies()
const token = allCookies["token"]

export const getListProduct = async (data: {
  page: number,
  pageSize: number,
  keySearch: string,
}) => {
  if (!token) {
    throw new Error("No token found")
  }
  const returnQueryString = (keySearch: string) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    if (keySearch)
      queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/list-products/${returnQueryString(
        data.keySearch
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200) {
      return { success: true, data: response.data }
    }
  } catch (error) {
    throw error;
  }
}

export const getAllListProduct = async () => {
  if (!token) {
    throw new Error("No token found")
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/list-product-no-page`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200) {
      return { success: true, data: response.data }
    }
  } catch (error) {
    throw error;
  }
}

export const getListQuotedProduct = async (data: {
  page: number,
  pageSize: number,
  keySearch: string,
}) => {
  if (!token) {
    throw new Error("No token found")
  }
  const returnQueryString = (keySearch: string) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    if (keySearch)
      queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/list/has-quotation/${returnQueryString(
        data.keySearch
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200) {
      return { success: true, data: response.data }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" }
  }
}

export const getProduct = async (id: number) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        }
      }
    }
    return { success: false, message: "Có lỗi xảy ra" }
  }
}

export const addProduct = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/create-product`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,

        },
      }
    );
    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
};

export const uploadFileProduct = async ({productId, formData}: {productId: number; formData: FormData}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/upload-file/${productId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,

        },
      }
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
};

export const addProductExcel = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/list-products`, formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,

        },
      }
    );
    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
}

export const deleteProduct = async (id: number) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      }
    }
  } catch (error) {
    throw error;
  }
}

export const deleteFileProduct = async (id: number) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/delete-file/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      }
    }
  } catch (error) {
    throw error;
  }
}

export const updateProduct = async (id: number, data: any) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (response.status === 200) {
      return { success: true }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
}
