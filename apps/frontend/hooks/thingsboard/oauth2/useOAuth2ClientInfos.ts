import useSWR from "swr";
import { OAuth2Service } from "@/lib/services/thingsboardServices/oauth2Service";

export function useOAuth2ClientInfos(
  page: number,
  pageSize: number,
  sortProperty: string,
  sortOrder: "ASC" | "DESC",
) {
  const key = `oauth2-clients-${page}-${pageSize}-${sortProperty}-${sortOrder}`;
  const { data, isLoading, error, mutate } = useSWR(
    key,
    () =>
      OAuth2Service.getOAuth2ClientInfos(
        page,
        pageSize,
        sortProperty,
        sortOrder,
      ),
    { revalidateOnFocus: false },
  );
  return {
    clients: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    isLoading,
    error,
    mutate,
  };
}
