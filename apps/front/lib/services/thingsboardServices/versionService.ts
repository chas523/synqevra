import { proxyApi } from "@/lib/api/api";

export class DashboardVersionService {
  public static async getThingsboardVersion() {
    const { data } = await proxyApi.get("thingsboard/admin/updates");
    return data;
  }
}
