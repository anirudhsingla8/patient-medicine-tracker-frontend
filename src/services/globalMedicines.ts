import { axiosClient } from './axiosClient';
import type { GlobalMedicine } from '../types/api';

export type GlobalMedicineCreateRequest = {
  name: string;
  brandName?: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  description?: string;
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  warnings?: string[];
  interactions?: string[];
  storageInstructions?: string;
  category?: string;
  atcCode?: string;
  fdaApprovalDate?: string; // YYYY-MM-DD
};

export type GlobalMedicineUpdateRequest = Partial<GlobalMedicineCreateRequest>;

/**
 * Get all global medicines
 * GET /api/global-medicines
 */
export async function getAllGlobalMedicines(): Promise<GlobalMedicine[]> {
  const res = await axiosClient.get<GlobalMedicine[]>('/api/global-medicines');
  return res.data;
}

/**
 * Get a specific global medicine
 * GET /api/global-medicines/{id}
 */
export async function getGlobalMedicineById(id: string): Promise<GlobalMedicine> {
  const res = await axiosClient.get<GlobalMedicine>(`/api/global-medicines/${id}`);
  return res.data;
}

/**
 * Search global medicines by name
 * GET /api/global-medicines/search?name=...
 */
export async function searchGlobalMedicinesByName(name: string): Promise<GlobalMedicine[]> {
  const res = await axiosClient.get<GlobalMedicine[]>('/api/global-medicines/search', {
    params: { name },
  });
  return res.data;
}

/**
 * Get global medicines by category
 * GET /api/global-medicines/category/{category}
 */
export async function getGlobalMedicinesByCategory(category: string): Promise<GlobalMedicine[]> {
  const res = await axiosClient.get<GlobalMedicine[]>(
    `/api/global-medicines/category/${encodeURIComponent(category)}`
  );
  return res.data;
}

/**
 * Create a new global medicine (likely admin only)
 * POST /api/global-medicines
 */
export async function createGlobalMedicine(
  payload: GlobalMedicineCreateRequest
): Promise<GlobalMedicine> {
  const res = await axiosClient.post<GlobalMedicine>('/api/global-medicines', payload);
  return res.data;
}

/**
 * Update a global medicine (likely admin only)
 * PUT /api/global-medicines/{id}
 */
export async function updateGlobalMedicine(
  id: string,
  payload: GlobalMedicineUpdateRequest
): Promise<GlobalMedicine> {
  const res = await axiosClient.put<GlobalMedicine>(`/api/global-medicines/${id}`, payload);
  return res.data;
}

/**
 * Delete a global medicine (likely admin only)
 * DELETE /api/global-medicines/{id}
 */
export async function deleteGlobalMedicine(id: string): Promise<void> {
  await axiosClient.delete(`/api/global-medicines/${id}`);
}
