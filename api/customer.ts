import { Customer, PaginationType } from "@/types/type";
import axios from "axios";
import { getCookies } from "cookies-next";


const allCookies = getCookies()
const token = allCookies["token"]

export const getListCustomer = async (data: {
    page: number;
    pageSize: number;
    keySearch: string;
    process: string[];
}) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string, process: string[]) => {
        var queryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(keySearch)}`;
        if (process)
            queryString += `&process=${process.toString()}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/list-customer/${returnQueryString(
                data.keySearch, data.process
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
                throw error;
            }
        }
        return { success: false, message: "Có lỗi xảy ra" }
    }
}

export const deleteCustumer = async (id: number) => {
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.status === 200) {
            return {
                success: true,
            }
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

export const createCustomer = async (data: Customer) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        if (response.status === 201) {
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

export const getCustomer = async (id: number) => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/${id}`,
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
                return {
                    success: false,
                    type: error.response.data.type,
                }
            }
        }
        return { success: false, message: "Có lỗi xảy ra" }
    }
}

export const updateCustomer = async (id: number, data: Customer) => {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/${id}`,
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
                throw error;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
}

export const addCustomerExcel = async (formData: FormData) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/create-customer-by-excel`,
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
                data: response.data
            }
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                return {
                    success: false,
                    type: error.response.data.type,
                    message: error.response.data.message,
                }
            }
        }
        return { success: false, message: "Có lỗi xảy ra." }
    }
}


export const getCustomerById = async (id: any) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/${id}`,
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

export const postComplain = async (orderId: number, data: any) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/create-customer-report/${orderId}`, data,
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

export const getComplain = async (cusId: number) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/list-customer-report/${cusId}`,
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

export const postStatusComplain = async (id: number, data: any) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/customer-report/${id}`, data,
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


export const getUserPermission = async (cusId: number) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/permission-customer/${cusId}`,
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

export const deleteUserPermission = async (id: number) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/permission-customer/${id}`,
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

export const postUserPermission = async (data: any) => {
    if (!token) {
        throw new Error("No token found")
    }
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/permission-customer`, data,
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

export const getScheduleCustomer = async (id: number, data: PaginationType) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string) => {
        var queryString = `${id}?page=${data.page + 1}&pageSize=${data.pageSize
            }&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/list-contact-customer/${returnQueryString(
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

export const getTotalQuoteCustomer = async (id: number, data: PaginationType) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string) => {
        var queryString = `${id}?page=${data.page + 1}&pageSize=${data.pageSize
            }&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/quotation/get-list-quotation-by-customer/${returnQueryString(
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

export const getTotalOrderCustomer = async (id: number, data: PaginationType) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string) => {
        var queryString = `${id}?page=${data.page + 1}&pageSize=${data.pageSize
            }&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/get-list-orders-by-customerId/${returnQueryString(
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

export const getCustomerReport = async (id: number, data: PaginationType) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string) => {
        var queryString = `${id}?page=${data.page + 1}&pageSize=${data.pageSize
            }&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/order/sale/list-customer-report/${returnQueryString(
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

export const getCustomerReview = async (id: number, data: PaginationType) => {
    if (!token) {
        throw new Error("No token found")
    }
    const returnQueryString = (keySearch: string) => {
        var queryString = `${id}?page=${data.page + 1}&pageSize=${data.pageSize
            }&startDate=${data.startDate}&endDate=${data.endDate}`;
        if (keySearch)
            queryString += `&keySearch=${decodeURIComponent(data.keySearch)}`;
        return queryString;
    };
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/evaluation/get-list/${returnQueryString(
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

export const updateStatus = async (id: number) => {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/update-status/${id}`,
            {},
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

export const createCustomerReview = async (data: { customerId: number; score: number; notes: string }) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/evaluation/create-new`,
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
        throw error;
    }
}

export const updateCustomerReview = async ({ id, data }: { id: number; data: { score: string; notes: string } }) => {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/evaluation/${id}`,
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
        throw error;
    }
}

export const updateCustomerProcess = async ({ id, data }: { id: number; data: { process: string } }) => {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/update-process/${id}`,
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
        throw error;
    }
}

export const updateLevelPermission = async ({ id, data }: { id: number; data: { level: string } }) => {
    try {
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/customer/update-level-permission/${id}`,
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
        throw error;
    }
}

export const deleteCustomerReview = async (id: number) => {
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/evaluation/${id}`,
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
        throw error;
    }
}

export const deleteCustomerContact = async (id: number) => {
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/schedule-customer/${id}`,
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
        throw error;
    }
}