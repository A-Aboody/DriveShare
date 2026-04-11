const BASE = 'http://localhost:3000';

async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const auth = {
  register: (data: Record<string, string>) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ message: string; sessionToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  session: () =>
    request<{ user: { id: string; email: string; createdAt: string } | null; token: string | null; isActive: boolean }>(
      '/auth/session',
    ),
};

export const cars = {
  list: (location?: string) =>
    request<import('../types').Car[]>(
      `/cars${location ? `?location=${encodeURIComponent(location)}` : ''}`,
    ),
  get: (id: string) => request<import('../types').Car>(`/cars/${id}`),
  mine: (ownerId: string) => request<import('../types').Car[]>(`/cars/owner/${ownerId}`),
  create: (data: Record<string, unknown>) =>
    request('/cars', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/cars/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/cars/${id}`, { method: 'DELETE' }),
};

export const notifications = {
  list: (userId: string) =>
    request<import('../types').Notification[]>(`/notifications/${userId}`),
  unreadCount: (userId: string) =>
    request<{ count: number }>(`/notifications/${userId}/unread-count`),
  markRead: (userId: string, id: string) =>
    request(`/notifications/${userId}/${id}/read`, { method: 'PATCH' }),
  markAllRead: (userId: string) =>
    request(`/notifications/${userId}/read-all`, { method: 'PATCH' }),
};

export const watchlist = {
  get: (userId: string) =>
    request<import('../types').WatchlistEntry[]>(`/watchlist/${userId}`),
  add: (userId: string, carId: string) =>
    request('/watchlist', { method: 'POST', body: JSON.stringify({ userId, carId }) }),
  remove: (userId: string, carId: string) =>
    request(`/watchlist/${userId}/${carId}`, { method: 'DELETE' }),
  status: (userId: string, carId: string) =>
    request<{ watching: boolean }>(`/watchlist/${userId}/${carId}/status`),
};
