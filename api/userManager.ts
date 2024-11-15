
import axios from "axios"
import { getCookies } from "cookies-next"


const allCookies = getCookies()
const token = allCookies["token"]


export const getAllUser = async ({ token }: { token: string }) => {
  
  if (!token) {
    throw new Error("No token found")
  }

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/users-list/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 200) {
      return { success: true, data: response.data }
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

export const postNewUser = async (data: {
  email: string
  userName: string
  fullName: string
  password: string
  phoneNumber: string
  department: string
  role: string
}) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/create_account/`,
       data ,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
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

