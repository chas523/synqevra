// Version Control types

export interface RepoSettingsInfo {
  configured: boolean;
  readOnly: boolean | null;
}

export interface RepoSettings {
  repositoryUri: string;
  defaultBranch: string;
  readOnly: boolean;
  showMergeCommits: boolean;
  authMethod: "USERNAME_PASSWORD" | "PRIVATE_KEY";
  username: string | null;
  password: string | null;
  privateKey?: string | null;
  privateKeyPassword?: string | null;
}

export interface VersionEntry {
  timestamp: number;
  id: string;
  name: string;
  author: string;
}

export interface VersionsPageResponse {
  data: VersionEntry[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface BranchInfo {
  name: string;
  default: boolean;
}
