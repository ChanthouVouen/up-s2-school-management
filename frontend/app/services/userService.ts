import api from "./api";

export interface PermissionRecord {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions?: PermissionRecord[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryParams {
  search?: string;
  roleId?: string;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  data: AppUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserCreateParams {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UserUpdateParams {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export const fetchUsers = async (params?: UserQueryParams): Promise<UserListResponse> => {
  const response = await api.get("/users", { params });
  return response.data;
};

export const createUser = async (data: UserCreateParams): Promise<AppUser> => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (id: string, data: UserUpdateParams): Promise<AppUser> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get("/roles");
  return response.data;
};

export const fetchPermissions = async (): Promise<PermissionRecord[]> => {
  const response = await api.get("/permissions");
  return response.data;
};

export const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  const response = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
  return response.data;
};
