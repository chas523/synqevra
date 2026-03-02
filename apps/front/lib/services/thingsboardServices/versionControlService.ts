import { proxyApi } from "@/lib/api/api";
import { RepoSettingsInfo, RepoSettings, VersionsPageResponse, BranchInfo } from "@/types/versionControlTypes";

export class VersionControlService {
    public static async getRepoSettingsInfo(): Promise<RepoSettingsInfo> {
        const { data } = await proxyApi.get("thingsboard/repositorySettings/info");
        return data;
    }

    public static async getRepoSettings(): Promise<RepoSettings> {
        const { data } = await proxyApi.get("thingsboard/repositorySettings");
        return data;
    }

    public static async checkRepoAccess(payload: RepoSettings): Promise<any> {
        const { data } = await proxyApi.post("thingsboard/repositorySettings/checkAccess", payload);
        return data;
    }

    public static async saveRepoSettings(payload: RepoSettings): Promise<any> {
        const { data } = await proxyApi.post("thingsboard/repositorySettings", payload);
        return data;
    }

    public static async deleteRepoSettings(): Promise<any> {
        const { data } = await proxyApi.delete("thingsboard/repositorySettings");
        return data;
    }

    public static async getBranches(): Promise<BranchInfo[]> {
        const { data } = await proxyApi.get("thingsboard/entities/vc/branches");
        return data;
    }

    public static async getVersions(
        page: number = 0,
        pageSize: number = 10,
        sortProperty: string = 'timestamp',
        sortOrder: string = 'DESC',
        branch: string = 'main',
    ): Promise<VersionsPageResponse> {
        const url = `thingsboard/entities/vc/versions?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&branch=${branch}`;
        const { data } = await proxyApi.get(url);
        return data;
    }

    public static async getEntityVersions(
        entityType: string,
        id: string,
        page: number = 0,
        pageSize: number = 10,
        sortProperty: string = 'timestamp',
        sortOrder: string = 'DESC',
        branch: string = 'main',
    ): Promise<VersionsPageResponse> {
        const url = `thingsboard/entities/vc/versions/${entityType}/${id}?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&branch=${branch}`;
        const { data } = await proxyApi.get(url);
        return data;
    }
}
