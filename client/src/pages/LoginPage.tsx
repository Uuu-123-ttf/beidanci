import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRememberedEmail } from '../api/client';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(getRememberedEmail());
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password, remember);
      } else {
        await register(email, password, name.trim() || undefined, remember);
      }
      navigate('/review');
    } catch (err) {
      setError(err instanceof Error ? err.message : '出错了');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">背单词</h1>

        <div className="flex mb-6 border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm ${mode === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
          >
            注册
          </button>
        </div>

        {mode === 'register' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="昵称（可选）"
            className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          type="email"
          required
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码（至少 6 位）"
          type="password"
          required
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
        />

        <label className="flex items-center gap-2 text-sm text-gray-600 mb-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          记住我（30 天免登录）
        </label>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {submitting ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>
    </div>
  );
}
