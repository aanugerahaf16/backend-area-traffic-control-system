// API configuration for the frontend to communicate directly with the backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Define response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Simple in-memory cache for API requests
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // Reduced to 5 seconds for more real-time feel

// Helper function to make API requests with improved error handling and caching
export async function api<T>(endpoint: string, options: RequestInit = {}, timeoutMs: number = 30000): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';
  const cacheKey = `${method}:${url}`;

  // Check cache for GET requests
  const skipCache = (options as any).skipCache || false;
  if (method === 'GET' && !skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const config: RequestInit = {
    credentials: 'include', // Include credentials for CORS requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Allow caller to override timeout
    signal: options.signal ?? AbortSignal.timeout(timeoutMs),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    
    // Cache the result for GET requests
    if (method === 'GET' && result.success) {
      apiCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
      });
    }
    
    return result.data;
  } catch (error) {
    // If request fails and we have stale cache, return it as a fallback
    if (method === 'GET') {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        console.warn('API request failed, returning stale cache data');
        return cached.data;
      }
    }

    console.error('API request error:', error);
    // Provide more detailed error information
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('API request timeout: The backend is taking too long to respond. Please ensure the Octane server is running.');
      }
      // Re-throw the error to be handled by the calling function
      throw error;
    }
    throw new Error('Unknown API request error');
  }
}

// Define TypeScript interfaces for API responses
export interface Stats {
  total_buildings: number;
  total_rooms: number;
  total_cctvs: number;
}

export interface Building {
  id: string;
  name: string;
  latitude?: string;
  longitude?: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  name: string;
  building_id: string;
  cctvs?: Cctv[];
}

export interface Cctv {
  id: string;
  name: string;
  ip_address: string;
  rtsp_url: string;
  room_id: string;
  username?: string;
  traffic_volume?: number;
  efficiency?: number;
  green_wave_efficiency?: number;
}

export interface ProductionTrend {
  label: string;
  production: number;
  traffic_volume: number;
  green_wave_efficiency: number;
  average_speed: number;
}

export interface UnitPerformance {
  unit: string;
  efficiency: number;
  traffic_density: number;
  signal_optimization: number;
  capacity: number;
}

export interface DashboardBundle {
  stats: Stats;
  production_trends: ProductionTrend[];
  unit_performance: UnitPerformance[];
  buildings: Building[];
  contacts: Contact[];
}

export interface StreamData {
  stream_url: string;
  // Add other stream properties as needed
}

export interface Contact {
  id: string;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
}

// Specific API methods with proper typing and error handling

/**
 * Fetch all dashboard data in a single request to reduce backend load
 * and prevent TimeoutErrors on single-threaded servers.
 */
export const getDashboardBundle = async (): Promise<DashboardBundle> => {
  try {
    const response = await api<DashboardBundle>('/dashboard-bundle');
    return response;
  } catch (error) {
    console.error('Error fetching dashboard bundle:', error);
    throw error;
  }
};

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api<Stats>('/stats');
    return response;
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default values to prevent app crash
    return {
      total_buildings: 0,
      total_rooms: 0,
      total_cctvs: 0
    };
  }
};

export const getBuildings = async (): Promise<Building[]> => {
  try {
    const response = await api<Building[]>('/buildings');
    return response;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getBuilding = async (id: string): Promise<Building> => {
  try {
    const response = await api<Building>(`/buildings/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching building ${id}:`, error);
    // Return empty object to prevent app crash
    return {} as Building;
  }
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const response = await api<Room[]>('/rooms');
    return response;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getRoom = async (id: string): Promise<Room> => {
  try {
    const response = await api<Room>(`/rooms/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    // Return empty object to prevent app crash
    return {} as Room;
  }
};

export const getRoomsByBuilding = async (buildingId: string): Promise<Room[]> => {
  try {
    const response = await api<Room[]>(`/rooms/building/${buildingId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching rooms for building ${buildingId}:`, error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getCctvs = async (): Promise<Cctv[]> => {
  try {
    const response = await api<Cctv[]>('/cctvs');
    return response;
  } catch (error) {
    console.error('Error fetching CCTVs:', error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getCctvsByRoom = async (roomId: string): Promise<Cctv[]> => {
  try {
    const response = await api<Cctv[]>(`/cctvs/room/${roomId}`);
    return response;
  } catch (error) {
    console.error(`Error fetching CCTVs for room ${roomId}:`, error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getCctvStreamUrl = async (cctvId: string): Promise<StreamData> => {
  // Retry a few times because the streaming server may take a moment to warm up
  const attempts = [12000, 15000, 20000]; // timeouts per attempt
  for (let i = 0; i < attempts.length; i++) {
    try {
      const response = await api<StreamData>(`/cctvs/stream/${cctvId}`, {}, attempts[i]);
      return response;
    } catch (error) {
      if (i === attempts.length - 1) {
        console.error(`Error fetching stream URL for CCTV ${cctvId}:`, error);
      } else {
        // Small delay before retry
        await new Promise((res) => setTimeout(res, 750));
      }
    }
  }
  // Return empty object to prevent app crash
  return { stream_url: '' };
};

export const getProductionTrends = async (startDate?: string, endDate?: string): Promise<ProductionTrend[]> => {
  try {
    // Build query string with optional parameters
    let url = '/production-trends';
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('start_date', startDate);
    }
    
    if (endDate) {
      queryParams.append('end_date', endDate);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api<ProductionTrend[]>(url);
    return response;
  } catch (error) {
    console.error('Error fetching production trends:', error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getUnitPerformance = async (startDate?: string, endDate?: string): Promise<UnitPerformance[]> => {
  try {
    let url = '/unit-performance';
    const queryParams = new URLSearchParams();
    
    if (startDate) {
      queryParams.append('start_date', startDate);
    }
    
    if (endDate) {
      queryParams.append('end_date', endDate);
    }
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api<UnitPerformance[]>(url);
    return response;
  } catch (error) {
    console.error('Error fetching unit performance:', error);
    // Return empty array to prevent app crash
    return [];
  }
};

export const getContacts = async (): Promise<Contact[]> => {
  try {
    const response = await api<Contact | null>('/contact');
    // Convert single contact object to array
    return response ? [response] : [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // Return empty array to prevent app crash
    return [];
  }
};