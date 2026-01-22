// Sort options for user lists
export const SORT_OPTIONS = {
  REQUESTED_USERS: [
    { value: "createdAt-desc", label: "Newest First" },
    { value: "createdAt-asc", label: "Oldest First" },
    { value: "email-asc", label: "Email A-Z" },
    { value: "email-desc", label: "Email Z-A" },
  ],
  ACTIVE_USERS: [
    { value: "createdAt-desc", label: "Newest First" },
    { value: "createdAt-asc", label: "Oldest First" },
    { value: "email-asc", label: "Email A-Z" },
    { value: "email-desc", label: "Email Z-A" },
    { value: "updatedAt-desc", label: "Recently Updated" },
    { value: "updatedAt-asc", label: "Least Updated" },
  ],
  TENANTS: [
    { value: "createdTime-desc", label: "Newest First" },
    { value: "createdTime-asc", label: "Oldest First" },
    { value: "title-asc", label: "Name A-Z" },
    { value: "title-desc", label: "Name Z-A" },
  ],
  DEVICES: [
    { value: "createdTime-desc", label: "Newest First" },
    { value: "createdTime-asc", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
  ],
} as const;
