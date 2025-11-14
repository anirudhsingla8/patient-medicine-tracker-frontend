import { axiosClient } from './axiosClient';
import type { Schedule } from '../types/api';

export type ScheduleCreateRequest = {
  timeOfDay: string; // HH:mm:ss
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';
  isActive: boolean;
};

export type ScheduleUpdateRequest = Partial<ScheduleCreateRequest>;

/**
 * Create a schedule for a medicine
 * POST /api/medicines/{medicineId}/schedules
 */
export async function createSchedule(
  medicineId: string,
  payload: ScheduleCreateRequest
): Promise<Schedule> {
  const res = await axiosClient.post<Schedule>(`/api/medicines/${medicineId}/schedules`, payload);
  return res.data;
}

/**
 * Get schedules for a specific medicine
 * GET /api/medicines/{medicineId}/schedules
 */
export async function getSchedulesForMedicine(medicineId: string): Promise<Schedule[]> {
  const res = await axiosClient.get<Schedule[]>(`/api/medicines/${medicineId}/schedules`);
  return res.data;
}

/**
 * Get schedules for a specific profile
 * GET /api/profiles/{profileId}/schedules
 */
export async function getSchedulesForProfile(profileId: string): Promise<Schedule[]> {
  const res = await axiosClient.get<Schedule[]>(`/api/profiles/${profileId}/schedules`);
  return res.data;
}

/**
 * Get all schedules for current user
 * GET /api/schedules
 */
export async function getSchedulesForUser(): Promise<Schedule[]> {
  const res = await axiosClient.get<Schedule[]>(`/api/schedules`);
  return res.data;
}

/**
 * Get schedule by id
 * GET /api/schedules/{scheduleId}
 */
export async function getScheduleById(scheduleId: string): Promise<Schedule> {
  const res = await axiosClient.get<Schedule>(`/api/schedules/${scheduleId}`);
  return res.data;
}

/**
 * Update a schedule
 * PUT /api/schedules/{scheduleId}
 */
export async function updateSchedule(
  scheduleId: string,
  payload: ScheduleUpdateRequest
): Promise<Schedule> {
  const res = await axiosClient.put<Schedule>(`/api/schedules/${scheduleId}`, payload);
  return res.data;
}

/**
 * Delete a schedule
 * DELETE /api/schedules/{scheduleId}
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await axiosClient.delete(`/api/schedules/${scheduleId}`);
}
