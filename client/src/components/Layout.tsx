import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const links = [
  { to: '/review', label: '今日复习' },
  { to: '/words', label: '单词' },
  { to: '/wordbooks', label: '词书' },
  { to: '/import', label: '导入' },
  { to: '/stats', label: '统计' },
  { to: '/settings', label: '设置' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6 h-full">
            <span className="font-bold text-indigo-600">背单词</span>
            <nav className="flex gap-1 h-full">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 text-sm border-b-2 ${
                      isActive
                        ? 'text-indigo-600 font-medium border-indigo-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{user?.name ?? user?.email}</span>
            <button onClick={onLogout} className="text-gray-400 hover:text-gray-600">
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
