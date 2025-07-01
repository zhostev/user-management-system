import axios from 'axios';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, GetUsersRequest, GetUsersResponse, UpdateUserStatusRequest, User, UserStatus } from './types';

// 创建Axios实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 认证相关API
export const authAPI = {
  /**
   * 用户注册
   * @param data 注册信息
   * @returns 注册结果
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/register', data);
    // 保存令牌
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * 用户登录
   * @param data 登录信息
   * @returns 登录结果
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    // 保存令牌
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * 用户登出
   */
  logout: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * 获取当前登录用户信息
   * @returns 用户信息
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  }
};

// 用户管理相关API
export const userAPI = {
  /**
   * 获取用户列表（管理员）
   * @param params 查询参数
   * @returns 用户列表及分页信息
   */
  getUsers: async (params: GetUsersRequest): Promise<GetUsersResponse> => {
    const response = await api.get<GetUsersResponse>('/users', { params });
    return response.data;
  },

  /**
   * 更新用户状态（管理员）
   * @param id 用户ID
   * @param data 状态信息
   * @returns 更新后的用户信息
   */
  updateUserStatus: async (id: string, data: UpdateUserStatusRequest): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/status`, data);
    return response.data;
  },

  /**
   * 删除用户（管理员）
   * @param id 用户ID
   * @returns 操作结果
   */
  deleteUser: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete<{ success: boolean; message?: string }>(`/users/${id}`);
    return response.data;
  }
};

export default api;