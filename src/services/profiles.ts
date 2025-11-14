import { axiosClient } from './axiosClient';
import type { Profile } from '../types/api';

export async function getProfiles(): Promise<Profile[]> {
  const res = await axiosClient.get<Profile[]>('/api/profiles');
  return res.data;
}

export async function getProfileById(profileId: string): Promise<Profile> {
  const res = await axiosClient.get<Profile>(`/api/profiles/${profileId}`);
  return res.data;
}

export async function createProfile(payload: { name: string }): Promise<Profile> {
  const res = await axiosClient.post<Profile>('/api/profiles', payload);
  return res.data;
}

export async function updateProfile(profileId: string, payload: { name: string }): Promise<Profile> {
  const res = await axiosClient.put<Profile>(`/api/profiles/${profileId}`, payload);
  return res.data;
}

export async function deleteProfile(profileId: string): Promise<void> {
  await axiosClient.delete(`/api/profiles/${profileId}`);
}
