import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: any) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshToken();
            const newToken = response.data.access_token;

            this.setAccessToken(newToken);

            this.failedQueue.forEach(({ resolve }) => {
              resolve(newToken);
            });
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];

            window.location.href = '/';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
  }

  private async refreshToken() {
    return this.api.post(
      '/auth/refresh',
      {},
      {
        withCredentials: true,
      },
    );
  }

  async signUp(data: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  }) {
    const response = await this.api.post('/auth/sign-up', data, {
      withCredentials: true,
    });
    if (response.data.access_token) {
      this.setAccessToken(response.data.access_token);
    }
    return response;
  }

  async signIn(data: { email: string; password: string }) {
    const response = await this.api.post('/auth/sign-in', data, {
      withCredentials: true,
    });
    if (response.data.access_token) {
      this.setAccessToken(response.data.access_token);
    }
    return response;
  }

  async signOut(forceClear = false) {
    const token = this.getAccessToken();

    if (!forceClear && token) {
      try {
        await this.api.post(
          '/auth/sign-out',
          {},
          {
            withCredentials: true,
          },
        );
      } catch (error) {
        console.log('Помилка при виході через API, але продовжуємо очистку');
      }
    }

    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getCurrentUserId(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      // Декодируем JWT токен (без проверки подписи, только для получения payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch (error) {
      console.error('Помилка декодування токена:', error);
      return null;
    }
  }

  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = new ApiService();
export default apiService;

if (typeof window !== 'undefined') {
  (window as any).devUtils = {
    clearTokens: async () => {
      localStorage.removeItem('access_token');
    },
    forceSignOut: async () => {
      localStorage.removeItem('access_token');
      document.cookie =
        'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      console.log('Примусовий вихід виконано');
    },
    forceClearCookies: () => {},
    getToken: () => {
      const token = apiService.getToken();
      console.log('Поточний токен:', token);
      return token;
    },
    isAuthenticated: () => {
      const auth = apiService.isAuthenticated();
      console.log('Авторизований:', auth);
      return auth;
    },
    showAllTokens: () => {
      console.log(' === ПЕРЕГЛЯД ВСІХ ТОКЕНІВ ===');

      const accessToken = localStorage.getItem('access_token');
      console.log(
        ' Access Token (localStorage):',
        accessToken ? ' Є' : ' Немає',
      );
      if (accessToken) {
        console.log('   Довжина:', accessToken.length);
        console.log('   Початок:', accessToken.substring(0, 20) + '...');
      }

      const cookies = document.cookie.split(';');
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('refresh_token='),
      );
      console.log(
        ' Refresh Token (cookie):',
        refreshTokenCookie ? ' Є' : ' Немає',
      );
      if (refreshTokenCookie) {
        const tokenValue = refreshTokenCookie.split('=')[1];
        console.log('   Довжина:', tokenValue.length);
        console.log('   Початок:', tokenValue.substring(0, 20) + '...');
      }

      console.log(' Всі cookies:', document.cookie || 'Немає cookies');

      console.log(
        ' Статус авторизації:',
        apiService.isAuthenticated() ? ' Авторизований' : ' Не авторизований',
      );

      console.log(' === КІНЕЦЬ ПЕРЕГЛЯДУ ===');
    },
  };

  console.log(' Dev Utils доступні в консолі:');
  console.log(
    '- devUtils.clearTokens() - очистити токени (включаючи refresh token)',
  );
  console.log('- devUtils.forceSignOut() - примусовий вихід без API');
  console.log(
    '- devUtils.forceClearCookies() - примусово очистити всі cookies',
  );
  console.log('- devUtils.getToken() - показати поточний токен');
  console.log('- devUtils.isAuthenticated() - перевірити авторизацію');
  console.log('- devUtils.showAllTokens() - показати всі токени та cookies');
}
