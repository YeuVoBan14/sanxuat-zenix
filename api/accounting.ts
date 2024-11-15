import axios from "axios";
import { getCookies } from "cookies-next";

const allCookies = getCookies();
const token = allCookies["token"];


export const getCostList = async (data: {
    page: number,
    pageSize: number,
}) => {
    if (!token) {
        throw new Error("No token found");
    }
    const returnQueryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/cost/get-list/${returnQueryString}`, {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};



export const getCostListExcel = async (data: {
    page: number,
    pageSize: number,
}) => {
    if (!token) {
        throw new Error("No token found");
    }
    const returnQueryString = `?page=${data.page + 1}&pageSize=${data.pageSize}`;
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/cost/get-list/${returnQueryString}`, {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};


export const postCost = async (formData: FormData) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/cost/`, formData,
            {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const putCost = async (id: number, data: any) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/cost/${id}`, data,
            {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const deleteCost = async (id: number) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/cost/${id}`,
            {
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


export const getDebtList = async (data: {
    page: number,
    pageSize: number,
    type: string,
}) => {
    if (!token) {
        throw new Error("No token found");
    }
    const returnQueryString = `?page=${data.page + 1}&pageSize=${data.pageSize}&type=${data.type}`;
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/debt/get-list/${returnQueryString}`, {
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


export const putPaymentDeadline = async (id: number, data: any) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/debt/${id}`, data,
            {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const postDebtPayment = async (id: number, data: any) => {
    if (!token) {
        throw new Error("No token found");
    }
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/debt/create-debt-payment/${id}`, data,
            {
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
                throw error.response.data;
            }
        }
        return { success: false, message: "Có lỗi xảy ra." };
    }
};

export const getPOCustomerList = async () => {
    if (!token) {
        throw new Error("No token found");
    }
    // const returnQueryString = `?page=${data.page + 1}&pageSize=${data.pageSize}&type=${data.type}`;
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/crm/list-po-customer`, {
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