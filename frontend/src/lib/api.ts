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

export const recovery = {
  getQuestions: (email: string) =>
    request<{ question1: string; question2: string; question3: string }>(
      `/auth/recover/${encodeURIComponent(email)}/questions`
    ),
  resetPassword: (email: string, answers: [string, string, string], newPassword: string) =>
    request('/auth/recover/' + encodeURIComponent(email), {
      method: 'POST',
      body: JSON.stringify({ answers, newPassword }),
    }),
};

export const bookings = {
  create: (data: { userId: string; carId: string; startDate: string; endDate: string }) =>
    request<import('../types').Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getForUser: (userId: string) =>
    request<import('../types').BookingWithCar[]>(`/bookings/user/${userId}`),
  getForOwner: (ownerId: string) =>
    request<import('../types').BookingWithCar[]>(`/bookings/owner/${ownerId}`),
  getForCar: (carId: string) =>
    request<import('../types').Booking[]>(`/bookings/car/${carId}`),
  cancel: (id: string, userId: string) =>
    request(`/bookings/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ userId }) }),
  review: (id: string, userId: string, rating: number, comment: string) =>
    request(`/bookings/${id}/review`, { method: 'PATCH', body: JSON.stringify({ userId, rating, comment }) }),
};

export const reviews = {
  create: (data: {
    reviewerId: string; revieweeId: string; bookingId: string;
    rating: number; comment: string; role: string;
  }) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (userId: string) =>
    request<import('../types').UserProfile>(`/reviews/profile/${userId}`),
  updateBio: (userId: string, bio: string) =>
    request(`/reviews/profile/${userId}/bio`, { method: 'PATCH', body: JSON.stringify({ bio }) }),
  getGiven: (userId: string) =>
    request<import('../types').ReviewGiven[]>(`/reviews/given/${userId}`),
};

export const payment = {
  process: (userId: string, bookingId: string, amount: number) =>
    request<{ success: boolean; transactionId: string; message: string }>('/payment', {
      method: 'POST',
      body: JSON.stringify({ userId, bookingId, amount }),
    }),
};

export const chat = {
  send: (senderId: string, receiverId: string, content: string) =>
    request('/chat/send', { method: 'POST', body: JSON.stringify({ senderId, receiverId, content }) }),
  getConversation: (userId: string, otherId: string) =>
    request<import('../types').Message[]>(`/chat/conversation/${userId}/${otherId}`),
  getContacts: (userId: string) =>
    request<import('../types').User[]>(`/chat/contacts/${userId}`),
};
