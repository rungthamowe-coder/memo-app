import { useState } from "react";

const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-500",
  "bg-pink-600", "bg-teal-600", "bg-indigo-600", "bg-rose-600",
];

export default function AccountSettings({
  currentUser, users, onChangePassword, onUpdateProfile, onBack,
}) {
  const [activeTab, setActiveTab] = useState("password");

  // ── Password tab ──────────────────────────────
  const [pwForm,    setPwForm]    = useState({ current: "", newPw: "", confirm: "" });
  const [pwErrors,  setPwErrors]  = useState({});
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Profile tab ───────────────────────────────
  const [profileForm,    setProfileForm]    = useState({ name: currentUser.name, username: currentUser.username });
  const [profileErrors,  setProfileErrors]  = useState({});
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ── Validation ────────────────────────────────
  const validatePassword = () => {
    const e = {};
    if (!pwForm.current)                             e.current = "Required";
    else if (pwForm.current !== currentUser.password) e.current = "Incorrect current password";
    if (!pwForm.newPw)                               e.newPw   = "Required";
    else if (pwForm.newPw.length < 6)                e.newPw   = "Must be at least 6 characters";
    if (!pwForm.confirm)                             e.confirm = "Required";
    else if (pwForm.newPw !== pwForm.confirm)        e.confirm = "Passwords do not match";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateProfile = () => {
    const e = {};
    if (!profileForm.name.trim()) e.name = "Required";
    if (!profileForm.username.trim()) e.username = "Required";
    else if (users.find(u => u.username === profileForm.username.trim() && u.id !== currentUser.id))
      e.username = "Username already taken";
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit handlers ───────────────────────────
  const handlePasswordChange = () => {
    if (!validatePassword()) return;
    onChangePassword(currentUser.id, pwForm.newPw);
    setPwForm({ current: "", newPw: "", confirm: "" });
    setPwErrors({});
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 3500);
  };

  const handleProfileUpdate = () => {
    if (!validateProfile()) return;
    onUpdateProfile(currentUser.id, {
      name:     profileForm.name.trim(),
      username: profileForm.username.trim(),
    });
    setProfileErrors({});
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  // ── Helpers ───────────────────────────────────
  const inputCls = (key, errs) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errs[key] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  const avatarColor = AVATAR_COLORS[currentUser.id % AVATAR_COLORS.length];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-700 text-sm font-medium transition"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
      </div>

      <div className="max-w-lg">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-5 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg leading-tight">{currentUser.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">@{currentUser.username} · {currentUser.department}</p>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1.5 ${
              currentUser.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
            }`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: "password", label: "🔑 Change Password" },
            { key: "profile",  label: "✏ Edit Profile"    },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-white text-blue-800 shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Change Password ── */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5">Change Password</h3>

            {pwSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-4">
                ✓ Password changed successfully!
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Current Password",     key: "current" },
                { label: "New Password",          key: "newPw"   },
                { label: "Confirm New Password",  key: "confirm" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="password"
                    className={inputCls(f.key, pwErrors)}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === "Enter" && handlePasswordChange()}
                  />
                  {pwErrors[f.key] && (
                    <p className="text-red-500 text-xs mt-1">{pwErrors[f.key]}</p>
                  )}
                </div>
              ))}

              <button
                onClick={handlePasswordChange}
                className="w-full bg-blue-700 text-white py-2.5 rounded-xl font-bold hover:bg-blue-800 transition text-sm mt-2"
              >
                Update Password
              </button>
            </div>
          </div>
        )}

        {/* ── Edit Profile ── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-5">Edit Profile</h3>

            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-4">
                ✓ Profile updated successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Display Name</label>
                <input
                  type="text"
                  className={inputCls("name", profileErrors)}
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your full name"
                />
                {profileErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    className={`pl-7 ${inputCls("username", profileErrors)}`}
                    value={profileForm.username}
                    onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                    placeholder="username"
                  />
                </div>
                {profileErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{profileErrors.username}</p>
                )}
              </div>

              {/* Read-only fields */}
              {[
                { label: "Department", value: currentUser.department },
                { label: "Email",      value: currentUser.email || "—" },
              ].map(f => (
                <div key={f.label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-xs font-semibold uppercase text-gray-400 block mb-0.5">{f.label}</span>
                  <span className="font-semibold text-gray-700 text-sm">{f.value}</span>
                  <span className="text-xs text-gray-400 ml-2">(contact admin to change)</span>
                </div>
              ))}

              <button
                onClick={handleProfileUpdate}
                className="w-full bg-blue-700 text-white py-2.5 rounded-xl font-bold hover:bg-blue-800 transition text-sm mt-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
