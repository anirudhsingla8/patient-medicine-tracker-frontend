import { axiosClient } from './axiosClient';
import type { Medicine, Composition } from '../types/api';

export type MedicineCreateRequest = {
  name: string;
  imageUrl?: string;
  dosage?: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  composition?: Composition[];
  form?: string;
};

export type MedicineUpdateRequest = Partial<MedicineCreateRequest> & {
  name?: string;
  quantity?: number;
  expiryDate?: string;
};

export async function getAllMedicines(): Promise<Medicine[]> {
  const res = await axiosClient.get<Medicine[]>('/api/medicines');
  return res.data;
}

export async function getMedicinesForProfile(profileId: string): Promise<Medicine[]> {
  const res = await axiosClient.get<Medicine[]>(`/api/profiles/${profileId}/medicines`);
  return res.data;
}

export async function getMedicineById(id: string): Promise<Medicine> {
  const res = await axiosClient.get<Medicine>(`/api/medicines/${id}`);
  return res.data;
}

export async function createMedicine(profileId: string, payload: MedicineCreateRequest): Promise<Medicine> {
  // Map to API payload; backend expects snake_case for some fields
  const apiPayload: any = {
    name: payload.name,
    dosage: payload.dosage,
    quantity: payload.quantity,
    expiryDate: payload.expiryDate,
    category: payload.category,
    notes: payload.notes,
    form: payload.form,
    image_url: (payload as any).imageUrl ?? undefined,
    composition: payload.composition?.map((c) => ({
      name: c.name,
      strengthValue: (c as any).strengthValue,
      strengthUnit: (c as any).strengthUnit,
    })),
  };

  // Remove undefined keys to avoid overriding with null/undefined
  Object.keys(apiPayload).forEach((k) => {
    if (apiPayload[k] === undefined) delete apiPayload[k];
  });

  const res = await axiosClient.post<Medicine>(`/api/profiles/${profileId}/medicines`, apiPayload);
  return res.data;
}

export async function updateMedicine(profileId: string, id: string, payload: MedicineUpdateRequest): Promise<Medicine> {
  // PUT /api/profiles/{profileId}/medicines/{medicineId}
  // Backend expects snake_case fields; transform payload accordingly.
  const apiPayload: any = {
    name: payload.name,
    dosage: payload.dosage,
    quantity: payload.quantity,
    expiryDate: payload.expiryDate,
    category: payload.category,
    notes: payload.notes,
    form: payload.form,
    image_url: (payload as any).imageUrl ?? undefined,
    composition: payload.composition?.map((c) => ({
      name: c.name,
      strengthValue: (c as any).strengthValue,
      strengthUnit: (c as any).strengthUnit,
    })),
  };

  // Remove undefined keys to avoid overriding with null/undefined
  Object.keys(apiPayload).forEach((k) => {
    if (apiPayload[k] === undefined) delete apiPayload[k];
  });

  const res = await axiosClient.put<Medicine>(`/api/profiles/${profileId}/medicines/${id}`, apiPayload);
  return res.data;
}

export async function deleteMedicine(profileId: string, id: string): Promise<void> {
  await axiosClient.delete(`/api/profiles/${profileId}/medicines/${id}`);
}

export async function takeDose(profileId: string, id: string): Promise<Medicine> {
  const res = await axiosClient.post<Medicine>(`/api/profiles/${profileId}/medicines/${id}/takedose`);
  return res.data;
}

export async function uploadMedicineImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('medicineImage', file);

  const res = await axiosClient.post(`/api/medicines/upload-image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformResponse: (r) => r, // backend returns plain string
  });

  return typeof res.data === 'string' ? res.data : String(res.data);
}
