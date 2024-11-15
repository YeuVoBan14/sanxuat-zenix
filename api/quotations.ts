import axios from "axios";
import { getCookies } from "cookies-next";

const allCookies = getCookies();
const token = allCookies["token"];

export const getListQuotationRequest = async (data: {
  page: number;
  pageSize: number;
  keySearch: string;
  startDate: string;
  endDate: string;
  creatorId: number[];
  customerId: number[];
  saleId: number[];
  purchaseId: number[];
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  const returnQueryString = (
    keySearch: string,
    creatorId: number[],
    customerId: number[],
    saleId: number[],
    purchaseId: number[]
  ) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize
      }&startDate=${data.startDate}&endDate=${data.endDate}`;
    if (keySearch) queryString += `&keySearch=${decodeURIComponent(keySearch)}`;
    if (creatorId.length > 0)
      queryString += `&creatorId=${creatorId.toString()}`;
    if (customerId.length > 0)
      queryString += `&customerId=${customerId.toString()}`;
    if (saleId.length > 0) queryString += `&saleId=${saleId.toString()}`;
    if (purchaseId.length > 0)
      queryString += `&purchaseId=${purchaseId.toString()}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/quote-requirement/sale-purchase/get-list-by-user${returnQueryString(
        data.keySearch,
        data.creatorId,
        data.customerId,
        data.saleId,
        data.purchaseId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getDetailQuotationRequest = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/sale/` + id,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const purchaseConfirm = async (data: any) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/purchase/confirm/` +
      data.id,
      data.data.map((item: any) => item),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    throw error;
  }
};

export const cancelYCBG = async (data: any) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/all/lost-order`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const createQuote = async (data: any) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/create-normal`,
      data,
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

export const getListQuotationByUser = async (data: {
  page: number;
  pageSize: number;
  keySearch: string;
  startDate: string;
  endDate: string;
  userCreatedId: number[];
  customerId: number[];
  saleId: number[];
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  const returnQueryString = (
    keySearch: string,
    userCreatedId: number[],
    customerId: number[],
    saleId: number[]
  ) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize
      }&startDate=${data.startDate}&endDate=${data.endDate}`;
    if (keySearch) queryString += `&keySearch=${decodeURIComponent(keySearch)}`;
    if (userCreatedId.length > 0)
      queryString += `&userCreatedId=${userCreatedId.toString()}`;
    if (customerId.length > 0)
      queryString += `&customerId=${customerId.toString()}`;
    if (saleId.length > 0) queryString += `&saleId=${saleId.toString()}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/quotation/get-list-by-user${returnQueryString(
        data.keySearch,
        data.userCreatedId,
        data.customerId,
        data.saleId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListQuotationById = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/get-by-id/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        throw error;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListUserByDepartment = async (department: string) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/list-user-by-department?department=${department}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListUserByDepartmentAndCustomerId = async (
  department: string,
  customerId: number
) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/list-user-by-department?department=${department}&customerId=${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListProductQuotation = async () => {
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/product/list-products?page=1&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const updateYCBG = async ({
  formData,
  id,
}: {
  formData: FormData;
  id: number;
}) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/sale/update-quote-requirement/${id}`,
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
    console.error("Đã xảy ra lỗi khi lấy dữ liệu từ API:", error);
    throw error;
  }
};

export const updateFileBG = async ({
  formData,
  id,
}: {
  formData: FormData;
  id: number;
}) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/update-file-end-quotation/${id}`,
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
    console.error("Đã xảy ra lỗi khi lấy dữ liệu từ API:", error);
    throw error;
  }
};

export const createGoodsInfo = async ({
  formData,
  id,
}: {
  formData: FormData;
  id: number;
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quote-requirement/purchase/product-info/${id}`,
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
    console.error("Đã xảy ra lỗi khi lấy dữ liệu từ API:", error);
    throw error;
  }
};

export const getDetailQuotation = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/get-by-id/` + id,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const processQuotation = async ({
  value,
  id,
}: {
  value: number;
  id: number;
}) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/admin-confirm/${id}`,
      { adminIsAccept: value },
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
    console.error("Đã xảy ra lỗi khi lấy dữ liệu từ API:", error);
    throw error;
  }
};

export const createScheduleWork = async ({ id, formData }: { id: number, formData: FormData }) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/schedule-customer/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
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
    throw error;
  }
};

export const updateScheduleWork = async ({ id, formData }: { id: number, formData: FormData }) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/schedule-customer/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
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
    throw error;
  }
};

export const putCalendar = async (id: number, data: any) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/calendar/${id}`,
      data,
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
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const exportQuotation = async (id: number) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/export-quotation/` +
      id,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const exportQuotationRequest = async (data: {
  id: number;
  supplierId: number;
}) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/quote-requirement/purchase/export-quote-requirement?timelineId=${data.id
      }&supplierId=${data.supplierId === 0 ? null : data.supplierId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    throw error;
  }
};

export const getProductSupplier = async (
  data:
    | {
      productId: number;
      supplierId: number;
    }
    | undefined
) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/get-list-price-product-supplier?productId=${data?.productId}&supplierId=${data?.supplierId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getCodeQuoteList = async ({ id, type }: { id: number; type: string }) => {
  if (!token) {
    throw new Error("No token found");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/schedule/get-list-code-quote/${id}?type=${type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.data) {
        return {
          success: false,
          type: error.response.data.type,
        };
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};