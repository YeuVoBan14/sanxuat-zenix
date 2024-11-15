import { getCookies } from "cookies-next";
import axios from "axios";
import { PaginationType } from "@/types/type";

const allCookie = getCookies();
const token = allCookie["token"];

export const getListPurchaseOrder = async (data: PaginationType) => {
  if (!token) {
    throw new Error("No token found!");
  }
  const returnQueryString = (keySearch: string) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize
      }&startDate=${data.startDate}&endDate=${data.endDate}`;
    if (keySearch)
      queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/order/sale-puchase/list-orders/${returnQueryString(
        data.keySearch
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getDetailPurchaseOrder = async (id: number) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/purchase/purchase-order-by-id/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListPurchase = async (data: {
  page: number;
  pageSize: number;
  keySearch: string;
  startDate: string,
  endDate: string,
  creator: number[];
  customer: number[];
  sale: number[];
  supplier: number[];
}) => {
  if (!token) {
    throw new Error("No token found!");
  }
  const returnQueryString = (
    keySearch: string,
    creator: number[],
    customer: number[],
    sale: number[],
    supplier: number[],
  ) => {
    var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    if (keySearch) queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
    if (customer.length > 0) queryString += `&customer=${customer.toString()}`;
    if (sale.length > 0) queryString += `&sale=${sale.toString()}`;
    if (creator.length > 0) queryString += `&creator=${creator.toString()}`;
    if (supplier.length > 0) queryString += `&supplier=${supplier.toString()}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/order/purchase/list-purchase-order/${returnQueryString(
        data.keySearch,
        data.creator,
        data.customer,
        data.sale,
        data.supplier,
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
    throw error;
  }
};

export const postPurchaseOrder = async (id: number, data: any) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/purchase/create-puchase-order/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const postPurchaseOrderRequest = async (id: number, data: any) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/purchase/create-puchase-order/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const postLostOrder = async (id: number, data: any) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale-purchase/lost-order/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const putRefuseOrder = async (id: number, data: any) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/purchase/refuse-order/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getExportPurchaseOrder = async (id: number) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/purchase/export-purchase-order/${id}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const postInputProposal = async (formData: FormData) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/input-warehouse`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
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

export const postOutputProposal = async (formData: FormData) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/output-warehouse`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
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

export const getListWarehouse = async (data: {
  page: number;
  pageSize: number;
  type: string;
}) => {
  if (!token) {
    throw new Error("No token found!");
  }
  const returnQueryString = (page: number, pageSize: number, type: string) => {
    var queryString = `?page=${page + 1}&pageSize=${pageSize}&type=${type}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/warehouse/po-list-suggest/${returnQueryString(
        data.page,
        data.pageSize,
        data.type
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
    throw error;
  }
};

export const exportOrderFile = async (id: number) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/export-order/${id}`,
      {},
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const getListProductsInStock = async (data: {
  page: number;
  pageSize: number;
  keySearch: string;
}) => {
  if (!token) {
    throw new Error("No token found!");
  }
  const returnQueryString = (
    page: number,
    pageSize: number,
    keySearch: string
  ) => {
    var queryString = `?page=${page + 1
      }&pageSize=${pageSize}&keySearch=${keySearch}`;
    return queryString;
  };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/warehouse/products-list/${returnQueryString(
        data.page,
        data.pageSize,
        data.keySearch
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
    throw error;
  }
};

export const confirmInput = async (data: { id: number; quantity: number }) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/input-product/${data.id}`,
      { quantity: data.quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
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

export const confirmOutput = async (data: { id: number; quantity: number }) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/output-warehouse/confirm/${data.id}`,
      { quantityExport: data.quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
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

export const confirmInputByOrder = async (id: number) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/input-warehouse/confirm/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
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

export const getListHistoryWarehouse = async (data: { page: number; pageSize: number }) => {
  if (!token) {
    throw new Error("No token found!");
  }
  // const returnQueryString = (keySearch: string) => {
  //   var queryString = `?page=${data.page + 1}&pageSize=${
  //     data.pageSize
  //   }&startDate=${data.startDate}&endDate=${data.endDate}`;
  //   if (keySearch)
  //     queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
  //   return queryString;
  // };
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL
      }/v1/api/warehouse/histories/product-io-warehouse?page=${data.page + 1}&pageSize=${data.pageSize}`,
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
        throw error.response.data;
      }
    }
    return { success: false, message: "Có lỗi xảy ra" };
  }
};

export const updateProposal = async (data: { id: number; formData: FormData }) => {
  if (!token) {
    throw new Error("No token found!");
  }
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/warehouse/suggest-ws/${data.id}`,
      data.formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 201) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    throw error;
  }
};