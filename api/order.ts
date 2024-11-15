import { PaginationType } from "@/types/type";
import axios from "axios";
import { getCookies } from "cookies-next";

const allCookies = getCookies()
const token = allCookies["token"]


export const getListOrder = async (data: {
    page: number,
    pageSize: number,
    keySearch: string,
    startDate: string,
    endDate: string,
    salerId: number[],
    customerId: number[],
    creatorId: number[],
}) => {

    if (!token) {
        throw new Error("No found token")
    }
    const returnQueryString = (keySearch: string, salerId: number[], customerId: number[], creatorId: number[]) => {
        var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch) queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        if (customerId.length > 0)
            queryString += `&customerId=${customerId.toString()}`;
        if (salerId.length > 0) queryString += `&salerId=${salerId.toString()}`;
        if (creatorId.length > 0) queryString += `&creatorId=${creatorId.toString()}`;
        return queryString;
    };

    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale-puchase/list-orders/${returnQueryString(
                data.keySearch,
                data.salerId,
                data.customerId,
                data.creatorId,
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        if (response.status === 200) {
            return { success: true, data: response.data };
        }
    } catch (error) {
        // if (axios.isAxiosError(error)) {
        //     if (error.response && error.response.data) {
        //         throw error.response.data
        //     }
        // }
        // return { success: false, message: "Có lỗi xảy ra." };
        throw error;
    }
}

export const getOrderById = async (id: number) => {
    if (!token) {
        throw new Error("No found token")
    }
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale-purchase/get-by-orderId/${id}`,
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
        throw error;
    }
}

export const addOrder = async ({ formData }: { formData: FormData }) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/create-order`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.status === 201) {
            return {
                success: true,
                data: response.data,
            };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                throw error.response.data
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const UpdateOrder = async (data: any) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/update-order-by-id/${data.id}`,
            data.data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
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
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const LossApplication = async (id: number, data: any) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale-purchase/lost-order/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.status === 200) {
            return { success: true, data: response.data };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                throw error.response.data
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
}


export const createOrder = async (id: number, formData: FormData) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/create-order/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.status === 201) {
            return {
                success: true,
                data: response.data,
            };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                throw error.response.data
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};


export const postExportOrder = async (id: number) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/export-order/${id}`, "",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.status === 200) {
            return { success: true, data: response.data };
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                throw error.response.data
            }
        }
        return { success: false, message: "Có lỗi xảy ra" };
    }
};