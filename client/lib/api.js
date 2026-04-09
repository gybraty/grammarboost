import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  withCredentials: true,
})

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  return error?.message || "Something went wrong"
}
