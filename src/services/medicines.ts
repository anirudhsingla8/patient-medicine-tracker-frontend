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
  const res = await axiosClient.get<Medicine[]>(`/api/medicines/profiles/${profileId}/medicines`);
  return res.data;
}

export async function getMedicineById(id: string): Promise<Medicine> {
  const res = await axiosClient.get<Medicine>(`/api/medicines/${id}`);
  return res.data;
}

export async function createMedicine(profileId: string, payload: MedicineCreateRequest): Promise<Medicine> {
  const res = await axiosClient.post<Medicine>(`/api/medicines/profiles/${profileId}/medicines`, payload);
  return res.data;
}

export async function updateMedicine(id: string, payload: MedicineUpdateRequest): Promise<Medicine> {
  const res = await axiosClient.put<Medicine>(`/api/medicines/${id}`, payload);
  return res.data;
}

export async function deleteMedicine(id: string): Promise<void> {
  await axiosClient.delete(`/api/medicines/${id}`);
}

export async function takeDose(id: string): Promise<Medicine> {
  const res = await axiosClient.post<Medicine>(`/api/medicines/${id}/takedose`);
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
