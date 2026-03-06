import useSWR from "swr";
import { OAuth2Service } from "@/lib/services/thingsboardServices/oauth2Service";

export function useOAuth2ConfigTemplates() {
    const key = `oauth2-config-templates`;
    const { data, isLoading, error, mutate } = useSWR(
        key,
        () => OAuth2Service.getOAuth2ConfigTemplates(),
        { revalidateOnFocus: false, revalidateOnReconnect: false },
    );
    return {
        templates: data ?? [],
        isLoading,
        error,
        mutate,
    };
}
