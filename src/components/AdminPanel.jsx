import { useState } from "react";
import { DEPARTMENTS } from "../constants";

export default function AdminPanel({ users, onCreateUser }) {
  const [form, setForm] = useState({
    name: "", username: "", password: "", email: "", department: "", role: "user",
  });
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name       = "Required";
    if (!form.username.trim()) e.username   = "Required";
    if (!form.password.trim()) e.password   = "Required";
    if (!form.email.trim())    e.email      = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (!form.department)      e.department = "Required";
    if (users.find(u => u.username === form.username)) e.username = "Username already taken";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    onCreateUser(form);
    setForm({ name: "", username: "", password: "", email: "", department: "", role: "user" });
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputCls = (k) =>
    `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[k] ? "border-red-400" : "border-gray-200"
    }`;

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    user:  "bg-gray-100   text-gray-600",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <div className="grid grid-cols-2 gap-6">

        {/* Create User Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-5 text-base">Create New User</h3>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-4">
              ✓ User created successfully!
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name",     placeholder: "e.g. Jane Doe",         type: "text"     },
              { label: "Username",  key: "username",  placeholder: "e.g. jane",             type: "text"     },
              { label: "Password",  key: "password",  placeholder: "Set a password",        type: "password" },
              { label: "Email",     key: "email",     placeholder: "jane@company.com",      type: "email"    },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  {f.label} <span className="text-red-400">*</span>
                </label>
                <input
                  type={f.type}
                  className={inputCls(f.key)}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                />
                {errors[f.key] && (
                  <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                className={inputCls("department")}
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              >
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
              <div className="flex gap-3">
                {["user", "admin"].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={() => setForm({ ...form, role: r })}
                    />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[r]}`}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-blue-700 text-white py-2.5 rounded-xl font-bold hover:bg-blue-800 transition text-sm mt-2"
            >
              Create User
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-5 text-base">
            All Users ({users.length})
          </h3>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {users.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">@{u.username} · {u.department}</p>
                  {u.email && (
                    <p className="text-xs text-blue-400 mt-0.5">{u.email}</p>
                  )}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
