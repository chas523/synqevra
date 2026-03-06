import useSWR from "swr";
import { OAuth2Service } from "@/lib/services/thingsboardServices/oauth2Service";

export function useDomainInfos(page: number, pageSize: number, sortProperty: string, sortOrder: "ASC" | "DESC") {
    const key = `domains-${page}-${pageSize}-${sortProperty}-${sortOrder}`;
    const { data, isLoading, error, mutate } = useSWR(
        key,
        () => OAuth2Service.getDomainInfos(page, pageSize, sortProperty, sortOrder),
        { revalidateOnFocus: false },
    );
    return {
        domains: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        isLoading,
        error,
        mutate,
    };
}
