import { apiClient } from './apiClient';
import { User } from '../types/data'; // Tam User tipini userService'ten alıyoruz

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ==============================================================================
//  TİP TANIMLARI (TYPE DEFINITIONS)
// ==============================================================================

// API'ye gönderilecek kayıt verisinin tipi
export interface RegisterPayload {
  email: string;
  name: string;
  surname: string;
  password: string;
  companyName: string;
  address?: string | null;
  phone?: string | null;
}

// API'ye gönderilecek giriş verisinin tipi
export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
}

// Başarılı bir giriş sonrası API'den dönecek olan verinin tipi
export interface LoginResponse {
  token: string;
  user: User;
}

// ==============================================================================
//  API FONKSİYONLARI (API FUNCTIONS)
// ==============================================================================

/**
 * Yeni bir kullanıcı kaydı oluşturur.
 * @param payload - Kayıt için gerekli kullanıcı bilgileri
 */
export const register = async (payload: RegisterPayload): Promise<unknown> => {
  try {
    return await apiClient.post(`${API_BASE_URL}/auth/register`, payload);
  } catch (error) {
    throw error;
  }
};

/**
 * Kullanıcının sisteme giriş yapmasını sağlar.
 * @param payload - Giriş için email ve şifre
 * @returns {Promise<LoginResponse>} JWT token ve kullanıcı objesi
 */
export const login = async (payload: LoginCredentials): Promise<LoginResponse> => {
  try {
    return await apiClient.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload);
  } catch (error) {
    throw error;
  }
};