// ─── LOGIN PAGE ──────────────────────────────────────────────
// Passwords are NOT displayed here for security.
// Use credentials assigned by your system administrator.
export default function LoginPage({ form, setForm, onLogin, error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold text-blue-900">MemoApp</h1>
          <p className="text-gray-400 text-sm mt-1">Internal Memo Management System</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
              onKeyDown={e => e.key === "Enter" && onLogin()}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              onKeyDown={e => e.key === "Enter" && onLogin()}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            onClick={onLogin}
            className="w-full bg-blue-700 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition text-sm"
          >
            Log In
          </button>
        </div>

        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-xs text-gray-500 text-center">
          <p className="text-gray-400">Contact your administrator for credentials.</p>
        </div>
      </div>
    </div>
  );
}
