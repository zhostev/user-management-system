import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/user.types';

// JWT认证中间件
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }

    // 提取并验证令牌
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      role: UserRole;
    };

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    if ((error as Error).name === 'TokenExpiredError') {
      res.status(401).json({ message: '令牌已过期' });
    } else {
      res.status(401).json({ message: '无效的令牌' });
    }
  }
};

// 管理员权限检查中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 检查用户角色是否为管理员
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: '没有管理员权限，无法执行此操作' });
      return;
    }
    next();
  } catch (error) {
    console.error('权限检查错误:', error);
    res.status(500).json({ message: '权限验证失败' });
  }
};