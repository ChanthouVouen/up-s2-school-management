import api from "./api";

export interface OrganizationSettings {
  id: number;
  orgName: string;
  slogan?: string | null;
  logoUrl?: string | null;
  primaryEmail?: string | null;
  supportPhone?: string | null;
  websiteUrl?: string | null;
  supportPortal?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  updatedAt: string;
}

export type OrganizationSettingsInput = Omit<OrganizationSettings, "id" | "updatedAt">;

export const fetchSettings = async (): Promise<OrganizationSettings> => {
  const response = await api.get("/settings");
  return response.data;
};

export const updateSettings = async (data: OrganizationSettingsInput): Promise<OrganizationSettings> => {
  const response = await api.put("/settings", data);
  return response.data;
};
