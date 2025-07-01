/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { RegisterRequest, LoginRequest, GetUsersRequest, UpdateUserStatusRequest, User as UserType, UserRole, UserStatus } from '../types/user.types';

// 生成JWT令牌
export const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// 用户注册

// 管理员注册（需严格限制访问）
export const registerAdmin = async (req: Request<{}, {}, RegisterRequest & { secretKey: string }>, res: Response): Promise<void> => {
  try {
    // 验证管理员密钥
    if (req.body.secretKey !== process.env.ADMIN_SECRET_KEY) {
      res.status(403).json({ message: '管理员密钥不正确' });
      return;
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: '用户名或邮箱已被使用' });
      return;
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 创建管理员用户
    const user = await new User({
      username,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }).save() as IUser;

    // 生成令牌
    const token = generateToken(user._id, user.role);

    // 构建响应用户对象
    const userResponse: UserType = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('管理员注册错误:', error);
    res.status(500).json({ message: '管理员注册失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 用户注册
export const registerUser = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: '用户名或邮箱已被使用' });
      return;
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = await new User({
      username,
      email,
      passwordHash,
      role: UserRole.USER,
      status: UserStatus.ACTIVE
    }).save() as IUser;

    // 生成令牌
    const token = generateToken(user._id, user.role);

    // 构建响应用户对象（不含密码）
    const userResponse: UserType = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 用户登录
export const loginUser = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email }) as IUser;
    if (!user) {
      res.status(401).json({ message: '邮箱或密码不正确' });
      return;
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      res.status(403).json({ message: '账号已被禁用，请联系管理员' });
      return;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: '邮箱或密码不正确' });
      return;
    }

    // 生成令牌
    const token = generateToken(user._id, user.role);

    // 构建响应用户对象（不含密码）
    const userResponse: UserType = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '登录失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 获取用户列表（管理员）
export const getUsers = async (req: Request<{}, {}, {}, any>, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const keyword = req.query.keyword as string;
    
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 构建查询条件
    const query: any = {};
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 查询用户列表和总数
    const users = await User.find(query)
      .select('-passwordHash') // 排除密码字段
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '获取用户列表失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 更新用户状态（管理员）
export const updateUserStatus = async (req: Request<{ id: string }, {}, UpdateUserStatusRequest>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    if (!Object.values(UserStatus).includes(status)) {
      res.status(400).json({ message: '无效的用户状态' });
      return;
    }

    // 更新用户状态
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({ message: '更新用户状态失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 删除用户（管理员）
export const deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: '用户ID不能为空' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: '无效的用户ID格式' });
      return;
    }

    // 查找并删除用户
    const user = await User.findByIdAndDelete(id).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.status(200).json({ success: true, message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '删除用户失败', error: error instanceof Error ? error.message : String(error) });
  }
};

// 获取当前登录用户信息
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash') as IUser;
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('获取当前用户信息错误:', error);
    res.status(500).json({ message: '获取用户信息失败', error: error instanceof Error ? error.message : String(error) });
  }
};