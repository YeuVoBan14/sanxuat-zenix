import axios from "axios";
import { getCookies } from "cookies-next";


const allCookies = getCookies()
const token = allCookies["token"]

export const addQuoteRequirementNormal = async ({ formData }: { formData: FormData }) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/sale/create-normal`,
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
}

export const addQuoteRequirementExcel = async ({ formData }: { formData: FormData }) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/sale/create-by-excel`,
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
        return {
          success: false,
          type: error.response.data.type,
          message: error.response.data.message,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra." };
  }
}

export const sendQuotationRequirement = async (id: number) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/send-quote-requirement/${id}`,
      {},
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