// Native browser-based fetch client mimicking Axios behavior with JWT interceptors
const BASE_URL = ''; // Relative path, routes directly to same Express domain/port

interface FetchConfig extends RequestInit {
  data?: any;
}

async function apiRequest(endpoint: string, config: FetchConfig = {}) {
  const token = localStorage.getItem('token');
  
  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string>),
  };

  if (token) {
    headersObj['Authorization'] = `Bearer ${token}`;
  }

  const { data, ...customConfig } = config;

  const finalConfig: RequestInit = {
    method: config.method || (data ? 'POST' : 'GET'),
    headers: headersObj,
    ...customConfig,
  };

  if (data) {
    finalConfig.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, finalConfig);
    
    // Attempt parsing response
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = responseData?.message || 'Server xətası baş verdi.';
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error);
    throw new Error(error.message || 'Şəbəkə rəqəmsal xətası. Lütfən internet bağlantısını yoxlayın.');
  }
}

export const api = {
  auth: {
    login: (data: any) => apiRequest('/api/auth/login', { method: 'POST', data }),
    register: (data: any) => apiRequest('/api/auth/register', { method: 'POST', data }),
    me: () => apiRequest('/api/auth/me', { method: 'GET' })
  },
  
  tours: {
    getList: () => apiRequest('/api/tours'),
    getAdminList: () => apiRequest('/api/tours/all'),
    getDetail: (id: string) => apiRequest(`/api/tours/${id}`),
    create: (data: any) => apiRequest('/api/tours', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/tours/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/tours/${id}`, { method: 'DELETE' })
  },

  hotels: {
    getList: () => apiRequest('/api/hotels'),
    getAdminList: () => apiRequest('/api/hotels/all'),
    getDetail: (id: string) => apiRequest(`/api/hotels/${id}`),
    create: (data: any) => apiRequest('/api/hotels', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/hotels/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/hotels/${id}`, { method: 'DELETE' })
  },

  places: {
    getList: () => apiRequest('/api/places'),
    getAdminList: () => apiRequest('/api/places/all'),
    getDetail: (id: string) => apiRequest(`/api/places/${id}`),
    create: (data: any) => apiRequest('/api/places', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/places/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/places/${id}`, { method: 'DELETE' })
  },

  reservations: {
    getList: () => apiRequest('/api/reservations'),
    getAdminList: () => apiRequest('/api/reservations'),
    create: (data: any) => apiRequest('/api/reservations', { method: 'POST', data }),
    approve: (id: string) => 
      apiRequest(`/api/reservations/${id}/status`, { method: 'PUT', data: { status: 'confirmed' } }),
    cancel: (id: string) => 
      apiRequest(`/api/reservations/${id}/status`, { method: 'PUT', data: { status: 'cancelled' } }),
    updateStatus: (id: string, status: string) => 
      apiRequest(`/api/reservations/${id}/status`, { method: 'PUT', data: { status } }),
    sendWhatsApp: (id: string) => 
      apiRequest(`/api/reservations/${id}/whatsapp`, { method: 'POST' })
  },

  comments: {
    getByPlace: (placeId: string) => apiRequest(`/api/comments/place/${placeId}`),
    getAdminList: () => apiRequest('/api/comments'),
    create: (data: any) => apiRequest('/api/comments', { method: 'POST', data }),
    delete: (id: string) => apiRequest(`/api/comments/${id}`, { method: 'DELETE' })
  },

  users: {
    getList: () => apiRequest('/api/users'),
    getAdminList: () => apiRequest('/api/users'),
    updateRole: (id: string, role: string) => 
      apiRequest(`/api/users/${id}/role`, { method: 'PUT', data: { role } }),
    updateBlock: (id: string, isBlocked: boolean) => 
      apiRequest(`/api/users/${id}/block`, { method: 'PUT', data: { isBlocked } }),
    delete: (id: string) => apiRequest(`/api/users/${id}`, { method: 'DELETE' })
  },

  restaurants: {
    getList: () => apiRequest('/api/restaurants'),
    getAdminList: () => apiRequest('/api/restaurants/all'),
    getDetail: (id: string) => apiRequest(`/api/restaurants/${id}`),
    create: (data: any) => apiRequest('/api/restaurants', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/restaurants/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/restaurants/${id}`, { method: 'DELETE' })
  },

  blogs: {
    getList: () => apiRequest('/api/blogs'),
    getAdminList: () => apiRequest('/api/blogs/all'),
    getDetail: (id: string) => apiRequest(`/api/blogs/${id}`),
    create: (data: any) => apiRequest('/api/blogs', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/blogs/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/blogs/${id}`, { method: 'DELETE' })
  },

  settings: {
    get: () => apiRequest('/api/settings'),
    update: (data: any) => apiRequest('/api/settings', { method: 'PUT', data })
  },

  media: {
    getList: () => apiRequest('/api/media'),
    delete: (id: string) => apiRequest(`/api/media/${id}`, { method: 'DELETE' })
  },

  companies: {
    getList: () => apiRequest('/api/companies'),
    getAdminList: () => apiRequest('/api/companies/all'),
    getDetail: (id: string) => apiRequest(`/api/companies/${id}`),
    create: (data: any) => apiRequest('/api/companies', { method: 'POST', data }),
    update: (id: string, data: any) => apiRequest(`/api/companies/${id}`, { method: 'PUT', data }),
    delete: (id: string) => apiRequest(`/api/companies/${id}`, { method: 'DELETE' })
  },

  ai: {
    chat: (messages: any[]) => apiRequest('/api/ai/chat', { method: 'POST', data: { messages } })
  },

  uploads: {
    uploadImage: (base64Image: string) => 
      apiRequest('/api/upload', { method: 'POST', data: { fileData: base64Image, fileName: 'sekil' } }),
    uploadFile: (fileName: string, base64Data: string) =>
      apiRequest('/api/upload', { method: 'POST', data: { fileName, fileData: base64Data } })
  }
};
