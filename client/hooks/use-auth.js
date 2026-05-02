import useSWR from "swr"
import { api } from "@/lib/api"

const fetcher = async (url) => {
  try {
    const response = await api.get(url)
    return response.data.data
  } catch (error) {
    if (error?.response?.status === 401) {
      return null
    }
    throw error
  }
}

export const useAuth = () => {
  const shouldFetch = typeof window !== "undefined"
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? "/api/auth/me" : null,
    fetcher
  )

  return {
    user: data,
    error,
    isLoading: shouldFetch ? isLoading : true,
    mutate,
  }
}
