import axios from 'axios';

// Ensure we're using the correct backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

console.log('API Configuration:', {
  API_BASE,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE
});

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include NextAuth cookies
api.interceptors.request.use(async (request) => {
  // In client-side requests, cookies are automatically included with withCredentials: true
  // The NextAuth JWT token is in the cookies and will be sent to the backend
  
  // For server-side requests, we'd need to manually forward cookies
  if (typeof window === 'undefined') {
    // Server-side - would need to get cookies from request headers
    // For now, we'll handle this in client-side only
  }
  
  return request;
});

// Add request interceptor to log requests
api.interceptors.request.use(request => {
  console.log('API Request:', {
    method: request.method?.toUpperCase(),
    url: `${request.baseURL}${request.url}`,
    data: request.data,
  });
  return request;
});

// Add response interceptor to log responses
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export async function getConversations() {
  const res = await api.get('/conversation/list');
  return res.data;
}

export async function getConversationMessages(conversationId: string) {
  const res = await api.get(`/chat/${conversationId}`);
  return res.data;
}

export async function deleteConversation(conversationId: string) {
  return api.delete(`/conversation/${conversationId}`);
}

export const renameConversation = async (conversationId: string, newTitle: string) => {
  const response = await api.patch(`/conversation/${conversationId}/rename`, { newTitle });
  return response.data;
};

// User profile API calls
export const updateUsername = async (name: string) => {
  const response = await api.patch('/user/profile', { name });
  return response.data;
};

export const updateUserAvatar = async (avatar: string) => {
  const response = await api.patch('/user/avatar', { avatar });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export async function getConversationPDF(conversationId: string) {
  return api.get(`/conversation/${conversationId}/pdf`, { responseType: 'blob' });
}

export async function getConversationDetails(conversationId: string) {
  const { data } = await api.get(`/conversation/${conversationId}/details`);
  return data;
}

export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function sendChatMessage(conversationId: string, question: string) {
  const res = await api.post(`/chat/${conversationId}`, { question });
  return res.data;
}

export async function getConversationSummary(conversationId: string) {
  const res = await api.get(`/conversation/${conversationId}/summary`);
  return res.data;
}

export async function generateConversationSummary(conversationId: string) {
  const res = await api.post(`/conversation/${conversationId}/summary/generate`);
  return res.data;
}

export async function processPendingMessages(conversationId: string) {
  const res = await api.post(`/chat/${conversationId}/process-pending`);
  return res.data;
}

export async function getConversationStatus(conversationId: string) {
  const res = await api.get(`/conversation/${conversationId}/details`);
  return res.data;
} 