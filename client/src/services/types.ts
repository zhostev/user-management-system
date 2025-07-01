export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface GetUsersRequest {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
}

export interface UpdateUserStatusRequest {
  _id: string;
  status: UserStatus;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface User {
  _id: string;
  username: string;
  email: string;
  status: UserStatus;
  role?: string;
  createdAt?: string;
}