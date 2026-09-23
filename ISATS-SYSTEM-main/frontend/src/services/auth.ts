import api from './api'
import type { User } from '@/types'

export async function getMe(): Promise<User> {
  const res = await api.get('/api/me/')
  return res.data
}

export async function login(username: string, password: string): Promise<User> {
  await api.post('/api/auth/login/', { username, password })
  return getMe()
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout/')
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await api.post('/api/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}
