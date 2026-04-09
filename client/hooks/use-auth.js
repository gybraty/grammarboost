import useSWR from "swr"
import { api } from "@/lib/api"

const fetcher = (url) => api.get(url).then((res) => res.data.data)

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
