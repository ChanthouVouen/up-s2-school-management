import api from "./api";


export interface Role {
  name: String;
}

export const createRole = async (data: Role): Promise<Role> => {
  const response = await api.post("/roles", data);
  return response.data;
};