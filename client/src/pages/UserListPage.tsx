import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { GetUsersRequest, User, UserStatus } from '../services/types';

const UserListPage: React.FC = () => {
  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 记录正在操作的用户ID

  // 获取用户列表数据
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetUsersRequest = { page, limit };
      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      const response = await userAPI.getUsers(params);
      setUsers(response.users);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取用户列表失败，请重试');
      console.error('获取用户列表错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和依赖变化时重新加载
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, limit, keyword]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 搜索时重置到第一页
    fetchUsers();
  };

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 更新用户状态
  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      setActionLoading(userId);
      await userAPI.updateUserStatus(userId, { _id: userId, status: newStatus });
      setUsers(users.map(user =>
        user._id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || '更新用户状态失败');
      console.error('更新用户状态错误:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`确定要删除用户"${username}"吗？此操作不可恢复。`)) {
      return;
    }
    try {
      setActionLoading(userId);
      // 乐观UI更新：立即从列表中移除用户
      setUsers(users.filter(user => user._id !== userId));
      await userAPI.deleteUser(userId);
      await fetchUsers(); // 从服务器刷新最新列表
      setSuccessMessage('用户已成功删除');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || '删除用户失败');
      console.error('删除用户错误:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="user-list-container">
      <h1>User Management</h1>
    {error && <div className="error-message" style={{ color: 'red', margin: '10px 0', padding: '8px', backgroundColor: '#ffebee' }}>{error}</div>}
    {successMessage && <div className="success-message" style={{ color: 'green', margin: '10px 0', padding: '8px', backgroundColor: '#e8f5e9' }}>{successMessage}</div>}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by username..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="no-users">No users found</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className={user.status === UserStatus.INACTIVE ? 'inactive-user' : ''}>
                    <td>{user._id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user._id, e.target.value as UserStatus)}
                        disabled={actionLoading === user._id}
                        className="status-select"
                      >
                        <option value={UserStatus.ACTIVE}>Active</option>
                        <option value={UserStatus.INACTIVE}>Inactive</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        disabled={actionLoading === user._id}
                        className="delete-button"
                      >
                        {actionLoading === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page * limit >= total || loading}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserListPage;