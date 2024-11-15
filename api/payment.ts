import axios from "axios";
import { getCookies } from "cookies-next";

const allCookies = getCookies();
const token = allCookies["token"];

export const postBankAccount = async (data: {
  nameAccount: string;
  numberAccount: string;
  namebank: string;
  branch: string;
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/bank-account`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
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

export const getBankAccount = async () => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/bank-account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    throw error;
  }
};

export const deleteBankAccount = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/bank-account/${id}`, {
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

export const editBankAccount = async (
  data: {
    nameAccount: string;
    numberAccount: string;
    namebank: string;
    branch: string;
  },
  id: number
) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/bank-account/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
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

export const postPaymentMethod = async (data: { name: string }) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-method`, data, {
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

export const getPaymentMethod = async () => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-method`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    throw error;
  }
};

export const deletePaymentMethod = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-method/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
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

export const editPaymentMethod = async (data: { name: string }, id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-method/${id}`, data, {
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

export const getPaymentCategory = async (data: {
  page: number;
  pageSize: number;
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-category/?page=${data.page + 1}&pageSize=${data.pageSize}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    throw error;
  }
};

export const deletePaymentCategory = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-category/${id}`,
      {
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

export const postPaymentCategory = async (data: { name: string }) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-category/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
    }
  }
};

export const editPaymentCategory = async (data: any, id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/company/payment-category/${id}`, data, {
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
