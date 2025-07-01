import mongoose, { Document, Schema } from 'mongoose';
import { UserRole, UserStatus } from '../types/user.types';

// 定义用户文档接口，扩展MongoDB文档类型
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  // 可选：添加方法定义
  isActive(): boolean;
}

// 创建用户Schema
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '请输入有效的邮箱地址']
  },
  passwordHash: {
    type: String,
    required: [true, '密码哈希不能为空']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE
  },

}, {
  timestamps: true // 自动添加updatedAt字段
});

// 添加实例方法：检查用户是否活跃
UserSchema.methods.isActive = function(): boolean {
  return this.status === UserStatus.ACTIVE;
};

// 添加索引以提高查询性能
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

// 创建并导出User模型
const User = mongoose.model<IUser>('User', UserSchema);
export default User;