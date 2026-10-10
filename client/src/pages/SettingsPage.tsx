import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api';

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const saveName = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage('');
    try {
      await authApi.updateMe({ name: name.trim() || undefined });
      await refresh();
      setMessage('昵称已更新');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '出错了');
    }
  };

  const savePassword = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage('');
    try {
      await authApi.updateMe({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setMessage('密码已修改');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '出错了');
    }
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-medium mb-4">账号</h2>
        <p className="text-sm text-gray-500 mb-4">邮箱：{user?.email}</p>
        <form onSubmit={saveName} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="昵称"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">保存昵称</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-medium mb-4">修改密码</h2>
        <form onSubmit={savePassword} className="space-y-3">
          <input
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            type="password"
            placeholder="原密码"
            required
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            placeholder="新密码（至少 6 位）"
            required
            minLength={6}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">修改密码</button>
        </form>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
