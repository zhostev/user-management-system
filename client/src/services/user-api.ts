// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

// 用户基本信息类型（不包含敏感信息）
export interface User {
  id: string; // 用户唯一标识
  username: string; // 用户名
  email: string; // 用户邮箱
  role: UserRole; // 用户角色
  status: UserStatus; // 用户状态
  createdAt: Date; // 注册时间
}

// 用户完整信息类型（包含敏感信息，仅内部使用）
export interface UserWithPassword extends User {
  passwordHash: string; // 密码哈希
}

// 注册请求参数
export interface RegisterRequest {
  username: string; // 用户名，用于登录和显示
  email: string; // 用户邮箱，用于登录和找回密码
  password: string; // 用户密码，将被加密存储
}

// 注册响应
export interface RegisterResponse {
  user: User; // 注册成功的用户信息（不含密码）
  token: string; // 注册成功后生成的JWT令牌
}

// 登录请求参数
export interface LoginRequest {
  email: string; // 用户邮箱
  password: string; // 用户密码
}

// 登录响应
export interface LoginResponse {
  user: User; // 登录用户信息（不含密码）
  token: string; // 登录成功后生成的JWT令牌
}

// 获取用户列表请求参数
export interface GetUsersRequest {
  page: number; // 页码，从1开始
  limit: number; // 每页条数
  keyword?: string; // 搜索关键词，可选
}

// 获取用户列表响应
export interface GetUsersResponse {
  users: User[]; // 用户列表
  total: number; // 总用户数
  page: number; // 当前页码
  limit: number; // 每页条数
}

// 禁用/启用用户请求参数
export interface UpdateUserStatusRequest {
  status: UserStatus; // 目标状态
}

// 接口路径和方法定义
/**
 * 用户注册接口
 * @method POST
 * @path /api/register
 * @request RegisterRequest
 * @response RegisterResponse
 */

/**
 * 用户登录接口
 * @method POST
 * @path /api/login
 * @request LoginRequest
 * @response LoginResponse
 */

/**
 * 获取用户列表接口（管理员）
 * @method GET
 * @path /api/users
 * @request GetUsersRequest (query参数)
 * @response GetUsersResponse
 */

/**
 * 更新用户状态接口（管理员）
 * @method PATCH
 * @path /api/users/:id/status
 * @request UpdateUserStatusRequest
 * @response User
 */

/**
 * 删除用户接口（管理员）
 * @method DELETE
 * @path /api/users/:id
 * @response { success: boolean }
 */