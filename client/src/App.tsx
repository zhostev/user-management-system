import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, UserRole } from './services/user-api';

// 导入页面组件
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserListPage from './pages/UserListPage';

// 页面组件
const HomePage = () => <div>Welcome to User Management System</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;

// 私有路由组件（需要登录）
const PrivateRoute: React.FC<{ element: React.ReactNode; requiredRole?: UserRole }> = ({
  element,
  requiredRole
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的令牌并获取用户信息
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  // 未登录用户重定向到登录页
  if (!user) return <Navigate to="/login" replace />;

  // 检查角色权限
  if (requiredRole && user.role !== requiredRole) {
    return <div>Access denied: Insufficient permissions</div>;
  }

  return <>{element}</>;
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          {isLoggedIn ? (
            <>              <Link to="/users" className="nav-link">User List</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route
            path="/users"
            element={
              <PrivateRoute requiredRole={UserRole.ADMIN} element={<UserListPage />} />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>User Management System © {new Date().getFullYear()}</p>
      </footer>

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .app-header {
          background-color: #282c34;
          padding: 1rem;
        }
        .nav-link {
          color: white;
          margin-right: 1rem;
          text-decoration: none;
        }
        .nav-link:hover {
          text-decoration: underline;
        }
        .logout-btn {
          background: none;
          color: white;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
        .app-main {
          flex: 1;
          padding: 2rem;
        }
        .app-footer {
          background-color: #282c34;
          color: white;
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default App;