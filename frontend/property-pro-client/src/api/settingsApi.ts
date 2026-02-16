import api from './axiosInstance'
import type { AppSetting } from '@/types/settings'

export const getSettings = () =>
  api.get<AppSetting[]>('/settings').then(r => r.data)

export const getSetting = (key: string) =>
  api.get<AppSetting>(`/settings/${key}`).then(r => r.data)

export const updateSetting = (key: string, value: string) =>
  api.put<AppSetting>(`/settings/${key}`, { value }).then(r => r.data)
