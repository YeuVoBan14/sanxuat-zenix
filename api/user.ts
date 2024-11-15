import { User } from '@/types/type'
import axios from 'axios'
import { getCookies } from 'cookies-next'

const allCookies = getCookies()
const token = allCookies['token']

export const getAllUser = async (data: { keySearch: string }) => {
  if (!token) {
    throw new Error('No token found')
  }
  const returnQueryString = (keySearch: string) => {
    let queryString = ``
    if (keySearch) queryString += `?keySearch=${decodeURIComponent(keySearch)}`
    return queryString
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/users-list/${returnQueryString(data?.keySearch)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.status === 200) {
      return { success: true, data: response.data.data }
    }
  } catch (error) {
    throw error
  }
}

export const postNewUser = async (data: User) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/create_account/`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const editNewUser = async (data: User, id: number) => {
  if (!token) {
    throw new Error('No token found')
  }
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const resetPassword = async ({ data, id }: { data: string; id: number }) => {
  if (!token) {
    throw new Error('No token found')
  }
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/reset-password/${id}`,
      { password: data },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (response.status === 200) {
      return response.data
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const putLockUser = async (id: number) => {
  if (!token) {
    throw new Error('No token found')
  }
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/api/profile/admin/lock-unlock/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
