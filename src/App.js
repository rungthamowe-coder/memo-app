import { useState } from "react";

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────
const DEPARTMENTS = ["Finance", "HR", "Operations", "Management", "IT", "Legal", "Marketing"];

const INITIAL_USERS = [
  { id: 1, name: "Admin User",   username: "admin", password: "admin123", department: "IT",         role: "admin" },
  { id: 2, name: "John Smith",   username: "john",  password: "john123",  department: "Finance",    role: "user"  },
  { id: 3, name: "Sarah Lee",    username: "sarah", password: "sarah123", department: "HR",         role: "user"  },
  { id: 4, name: "Mike Chen",    username: "mike",  password: "mike123",  department: "Operations", role: "user"  },
  { id: 5, name: "Diana Wong",   username: "diana", password: "diana123", department: "Management", role: "user"  },
];

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [users, setUsers]               = useState(INITIAL_USERS);
  const [memos, setMemos]               = useState([]);
  const [currentUser, setCurrentUser]   = useState(null);
  const [page, setPage]                 = useState("login");
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [loginForm, setLoginForm]       = useState({ username: "", password: "" });
  const [loginError, setLoginError]     = useState("");

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  // ── AUTH ──────────────────────────────────
  const handleLogin = () => {
    const user = users.find(
      u => u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      setLoginError("");
      setPage(user.role === "admin" ? "admin" : "dashboard");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage("login");
    setLoginForm({ username: "", password: "" });
    setSelectedMemoId(null);
  };

  // ── MEMO ACTIONS ──────────────────────────
  const handleCreateMemo = (data) => {
    const newMemo = {
      id: Date.now(),
      ...data,
      createdBy: currentUser.id,
      status: "pending",
      createdAt: new Date().toLocaleString(),
      logs: [{ action: "Created & Sent", by: currentUser.name, at: new Date().toLocaleString(), note: "" }],
    };
    setMemos(prev => [...prev, newMemo]);
    setPage("dashboard");
  };

  const updateMemoStatus = (memoId, status, action, note = "") => {
    setMemos(prev => prev.map(m =>
      m.id === memoId
        ? { ...m, status, logs: [...m.logs, { action, by: currentUser.name, at: new Date().toLocaleString(), note }] }
        : m
    ));
  };

  const handleApprove     = (id) => updateMemoStatus(id, "approved",      "Approved",     "");
  const handleReject      = (id, note) => updateMemoStatus(id, "rejected", "Rejected",     note);
  const handleAcknowledge = (id) => updateMemoStatus(id, "acknowledged",  "Acknowledged", "");

  const handleResend = (id, updatedData) => {
    setMemos(prev => prev.map(m =>
      m.id === id
        ? { ...m, ...updatedData, status: "pending",
            logs: [...m.logs, { action: "Edited & Resent", by: currentUser.name, at: new Date().toLocaleString(), note: "" }] }
        : m
    ));
    setPage("view");
  };

  // ── RENDER ────────────────────────────────
  if (page === "login") {
    return <LoginPage form={loginForm} setForm={setLoginForm} onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar currentUser={currentUser} onLogout={handleLogout} setPage={setPage} />
      <div className="max-w-5xl mx-auto px-4 py-6">

        {page === "dashboard" && (
          <Dashboard
            memos={memos} currentUser={currentUser} users={users}
            onView={id => { setSelectedMemoId(id); setPage("view"); }}
            onCreate={() => setPage("create")}
          />
        )}

        {page === "create" && (
          <MemoForm
            users={users} currentUser={currentUser}
            onSubmit={handleCreateMemo}
            onCancel={() => setPage("dashboard")}
          />
        )}

        {page === "view" && selectedMemo && (
          <ViewMemo
            memo={memos.find(m => m.id === selectedMemoId)}
            currentUser={currentUser} users={users}
            onApprove={() => handleApprove(selectedMemoId)}
            onReject={note => handleReject(selectedMemoId, note)}
            onAcknowledge={() => handleAcknowledge(selectedMemoId)}
            onEdit={() => setPage("edit")}
            onBack={() => setPage("dashboard")}
          />
        )}

        {page === "edit" && selectedMemo && (
          <MemoForm
            memo={memos.find(m => m.id === selectedMemoId)}
            users={users} currentUser={currentUser} isEdit
            onSubmit={data => handleResend(selectedMemoId, data)}
            onCancel={() => setPage("view")}
          />
        )}

        {page === "admin" && currentUser?.role === "admin" && (
          <AdminPanel
            users={users}
            onCreateUser={u => setUsers(prev => [...prev, { ...u, id: Date.now() }])}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
function LoginPage({ form, setForm, onLogin, error }) {
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

        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-xs text-gray-500">
          <p className="font-bold text-gray-600 mb-2">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              ["admin", "admin123", "Admin (IT)"],
              ["john",  "john123",  "Finance"],
              ["sarah", "sarah123", "HR"],
              ["mike",  "mike123",  "Operations"],
              ["diana", "diana123", "Management"],
            ].map(([u, p, dept]) => (
              <div key={u} className="bg-white rounded-lg p-1.5 border">
                <span className="font-semibold text-blue-700">{u}</span> / {p}
                <div className="text-gray-400">{dept}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function Navbar({ currentUser, onLogout, setPage }) {
  return (
    <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setPage(currentUser?.role === "admin" ? "admin" : "dashboard")}
          className="font-bold text-lg tracking-tight hover:opacity-80 transition"
        >
          📋 MemoApp
        </button>
        {currentUser?.role !== "admin" && (
          <button onClick={() => setPage("dashboard")} className="text-sm text-blue-200 hover:text-white transition">
            Dashboard
          </button>
        )}
        {currentUser?.role === "admin" && (
          <>
            <button onClick={() => setPage("dashboard")} className="text-sm text-blue-200 hover:text-white transition">
              Dashboard
            </button>
            <button onClick={() => setPage("admin")} className="text-sm text-blue-200 hover:text-white transition">
              Admin Panel
            </button>
          </>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <div className="font-semibold">{currentUser?.name}</div>
          <div className="text-blue-300 text-xs">{currentUser?.department} · {currentUser?.role}</div>
        </div>
        <button
          onClick={onLogout}
          className="bg-white text-blue-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:      "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved:     "bg-green-100  text-green-800  border-green-200",
    rejected:     "bg-red-100    text-red-800    border-red-200",
    acknowledged: "bg-blue-100   text-blue-800   border-blue-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status?.toUpperCase()}
    </span>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function Dashboard({ memos, currentUser, users, onView, onCreate }) {
  const [activeTab, setActiveTab] = useState("active");

  const uid = currentUser.id;
  const myMemos       = memos.filter(m => m.createdBy === uid);
  const toApprove     = memos.filter(m => m.authorizerId === uid   && m.status === "pending");
  const toAcknowledge = memos.filter(m => m.acknowledgerId === uid && m.status === "approved");

  const historyMemos = memos
    .filter(m => m.createdBy === uid || m.issuerId === uid || m.authorizerId === uid || m.acknowledgerId === uid)
    .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
    .sort((a, b) => b.id - a.id);

  const getRoles = (m) => {
    const roles = [];
    if (m.createdBy      === uid) roles.push("Creator");
    if (m.issuerId       === uid && m.issuerId !== m.createdBy) roles.push("Issuer");
    if (m.authorizerId   === uid) roles.push("Authorizer");
    if (m.acknowledgerId === uid) roles.push("Acknowledger");
    return roles.length ? roles : ["Involved"];
  };

  const roleBadge = (role) => {
    const map = {
      Creator:      "bg-blue-100   text-blue-700",
      Issuer:       "bg-indigo-100 text-indigo-700",
      Authorizer:   "bg-yellow-100 text-yellow-700",
      Acknowledger: "bg-green-100  text-green-700",
      Involved:     "bg-gray-100   text-gray-600",
    };
    return (
      <span key={role} className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-1 ${map[role] || "bg-gray-100 text-gray-600"}`}>
        {role}
      </span>
    );
  };

  const Card = ({ label, count, color, icon }) => (
    <div className={`rounded-2xl p-5 ${color}`}>
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm font-medium mt-1 opacity-80">{icon} {label}</div>
    </div>
  );

  const Table = ({ items, title, emptyMsg, showRole = false }) => (
    <div className="mb-8">
      <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">{title}</h3>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm italic py-3">{emptyMsg}</p>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">To Dept</th>
                {showRole && <th className="text-left px-5 py-3">My Role</th>}
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id} className="border-t hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-semibold text-gray-800">{m.title}</td>
                  <td className="px-5 py-3 text-gray-500">{m.toDepartment}</td>
                  {showRole && (
                    <td className="px-5 py-3">{getRoles(m).map(r => roleBadge(r))}</td>
                  )}
                  <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{m.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => onView(m.id)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={onCreate}
          className="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition shadow"
        >
          + New Memo
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card label="Total Involved"       count={historyMemos.length}  color="bg-slate-100  text-slate-700"  icon="🗂" />
        <Card label="My Memos"             count={myMemos.length}       color="bg-blue-50    text-blue-800"   icon="📄" />
        <Card label="Pending My Approval"  count={toApprove.length}     color="bg-yellow-50  text-yellow-800" icon="⏳" />
        <Card label="Needs Acknowledgment" count={toAcknowledge.length} color="bg-green-50   text-green-800"  icon="✅" />
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "active",  label: "Active",      badge: toApprove.length + toAcknowledge.length },
          { key: "history", label: "Memo History", badge: historyMemos.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === tab.key ? "bg-white text-blue-800 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
            }`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "active" && (
        <>
          <Table items={toApprove}     title="⚡ Pending My Approval"     emptyMsg="No memos waiting for your approval." />
          <Table items={toAcknowledge} title="✅ Needs My Acknowledgment" emptyMsg="No memos waiting for your acknowledgment." />
          <Table items={myMemos}       title="📄 My Memos"                emptyMsg="You haven't created any memos yet. Click '+ New Memo' to start." />
        </>
      )}

      {activeTab === "history" && (
        <Table
          items={historyMemos}
          title="🗂 All Memos I've Been Involved With"
          emptyMsg="No memo history yet. Your activity will appear here once you create or engage with memos."
          showRole
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MEMO FORM  (Create & Edit)
// ─────────────────────────────────────────────
function MemoForm({ memo, users, currentUser, onSubmit, onCancel, isEdit = false }) {
  const [form, setForm] = useState({
    title:          memo?.title          || "",
    header:         memo?.header         || "",
    toDepartment:   memo?.toDepartment   || "",
    content:        memo?.content        || "",
    issuerId:       memo?.issuerId       || currentUser.id,
    authorizerId:   memo?.authorizerId   || "",
    acknowledgerId: memo?.acknowledgerId || "",
  });
  const [errors, setErrors] = useState({});

  const nonAdminUsers = users.filter(u => u.role !== "admin");
  const get = id => users.find(u => u.id === Number(id));

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title          = "Required";
    if (!form.header.trim())       e.header         = "Required";
    if (!form.toDepartment)        e.toDepartment   = "Required";
    if (!form.content.trim())      e.content        = "Required";
    if (!form.authorizerId)        e.authorizerId   = "Required";
    if (!form.acknowledgerId)      e.acknowledgerId = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, authorizerId: Number(form.authorizerId), acknowledgerId: Number(form.acknowledgerId) });
  };

  const inputCls = (key) =>
    `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[key] ? "border-red-400" : "border-gray-200"}`;

  const Err = ({ k }) => errors[k] ? <p className="text-red-500 text-xs mt-1">{errors[k]}</p> : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit & Resend Memo" : "Create New Memo"}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-7 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Memo Title <span className="text-red-400">*</span></label>
            <input className={inputCls("title")} value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Budget Approval Q2 2026" />
            <Err k="title" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Header / Subject <span className="text-red-400">*</span></label>
            <input className={inputCls("header")} value={form.header}
              onChange={e => setForm({ ...form, header: e.target.value })} placeholder="e.g. Re: Annual Budget Review" />
            <Err k="header" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">To Department <span className="text-red-400">*</span></label>
          <select className={inputCls("toDepartment")} value={form.toDepartment}
            onChange={e => setForm({ ...form, toDepartment: e.target.value })}>
            <option value="">Select department…</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Err k="toDepartment" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Content <span className="text-red-400">*</span></label>
          <textarea className={`${inputCls("content")} h-36 resize-none`} value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="Write the memo content here…" />
          <Err k="content" />
        </div>

        <div className="border-t pt-5">
          <p className="text-sm font-bold text-gray-700 mb-4">Signers</p>
          <div className="grid grid-cols-3 gap-4">

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">4.1 Issuer</p>
              <p className="font-semibold text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{currentUser.department}</p>
              <div className="mt-2 inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Auto-assigned</div>
            </div>

            <div className={`border rounded-2xl p-4 ${errors.authorizerId ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">4.2 Authorizer <span className="text-red-400">*</span></p>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.authorizerId}
                onChange={e => setForm({ ...form, authorizerId: e.target.value })}>
                <option value="">Select…</option>
                {nonAdminUsers.filter(u => u.id !== currentUser.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {form.authorizerId && get(form.authorizerId) && (
                <p className="text-xs text-gray-500 mt-1">{get(form.authorizerId).department}</p>
              )}
              <Err k="authorizerId" />
            </div>

            <div className={`border rounded-2xl p-4 ${errors.acknowledgerId ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">4.3 Acknowledger <span className="text-red-400">*</span></p>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.acknowledgerId}
                onChange={e => setForm({ ...form, acknowledgerId: e.target.value })}>
                <option value="">Select…</option>
                {nonAdminUsers.filter(u => u.id !== currentUser.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {form.acknowledgerId && get(form.acknowledgerId) && (
                <p className="text-xs text-gray-500 mt-1">{get(form.acknowledgerId).department}</p>
              )}
              <Err k="acknowledgerId" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSubmit}
            className="bg-blue-700 text-white px-7 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow text-sm">
            {isEdit ? "💾 Save & Resend" : "📤 Submit Memo"}
          </button>
          <button onClick={onCancel}
            className="border border-gray-200 px-7 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIEW MEMO
// ─────────────────────────────────────────────
function ViewMemo({ memo, currentUser, users, onApprove, onReject, onAcknowledge, onEdit, onBack }) {
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectNote, setRejectNote]       = useState("");

  const get     = id => users.find(u => u.id === id);
  const issuer  = get(memo.issuerId);
  const auth    = get(memo.authorizerId);
  const ack     = get(memo.acknowledgerId);
  const creator = get(memo.createdBy);

  const canApprove     = currentUser.id === memo.authorizerId   && memo.status === "pending";
  const canAcknowledge = currentUser.id === memo.acknowledgerId && memo.status === "approved";
  const canEdit        = currentUser.id === memo.createdBy      && memo.status === "rejected";

  const statusBg = {
    pending:      "bg-yellow-50 border-yellow-200",
    approved:     "bg-green-50  border-green-200",
    rejected:     "bg-red-50    border-red-200",
    acknowledged: "bg-blue-50   border-blue-200",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">← Back</button>
        <h2 className="text-2xl font-bold text-gray-800">View Memo</h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-7 space-y-6">

        <div className={`border rounded-2xl p-4 ${statusBg[memo.status] || "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{memo.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{memo.header}</p>
            </div>
            <StatusBadge status={memo.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["To Department", memo.toDepartment],
            ["From",          `${creator?.name} (${creator?.department})`],
            ["Date Created",  memo.createdAt],
            ["Status",        memo.status],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">{label}</span>
              <span className="font-semibold text-gray-800 capitalize">{value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</p>
          <div className="bg-slate-50 rounded-2xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {memo.content}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Signers</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "4.1 Issuer",       user: issuer, color: "bg-blue-50   border-blue-100"   },
              { label: "4.2 Authorizer",   user: auth,   color: "bg-yellow-50 border-yellow-100" },
              { label: "4.3 Acknowledger", user: ack,    color: "bg-green-50  border-green-100"  },
            ].map(({ label, user, color }) => (
              <div key={label} className={`border rounded-2xl p-4 ${color}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
                <p className="font-semibold text-gray-800">{user?.name || "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user?.department || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {(canApprove || canAcknowledge || canEdit) && (
          <div className="border-t pt-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Actions</p>
            <div className="flex flex-wrap gap-3">
              {canApprove && (
                <>
                  <button onClick={onApprove}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm text-sm">
                    ✓ Approve
                  </button>
                  <button onClick={() => setShowRejectBox(v => !v)}
                    className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 transition shadow-sm text-sm">
                    ✗ Reject
                  </button>
                </>
              )}
              {canAcknowledge && (
                <button onClick={onAcknowledge}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm text-sm">
                  ✓ Acknowledge
                </button>
              )}
              {canEdit && (
                <button onClick={onEdit}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition shadow-sm text-sm">
                  ✏ Edit & Resend
                </button>
              )}
            </div>

            {showRejectBox && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-red-700 mb-2">Reason for Rejection</p>
                <textarea
                  className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="Describe why this memo is being rejected…"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => { onReject(rejectNote); setShowRejectBox(false); setRejectNote(""); }}
                    className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition">
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => { setShowRejectBox(false); setRejectNote(""); }}
                    className="border px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {memo.logs?.length > 0 && (
          <div className="border-t pt-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Activity Log</p>
            <div className="space-y-3">
              {memo.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0 ring-4 ring-blue-50" />
                  <div>
                    <span className="font-semibold text-gray-800">{log.action}</span>
                    <span className="text-gray-500"> by {log.by}</span>
                    <span className="text-gray-400 text-xs ml-2">— {log.at}</span>
                    {log.note && <p className="text-red-600 text-xs mt-0.5 italic">"{log.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────
function AdminPanel({ users, onCreateUser }) {
  const [form, setForm] = useState({ name: "", username: "", password: "", department: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name       = "Required";
    if (!form.username.trim()) e.username   = "Required";
    if (!form.password.trim()) e.password   = "Required";
    if (!form.department)      e.department = "Required";
    if (users.find(u => u.username === form.username)) e.username = "Username already taken";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    onCreateUser(form);
    setForm({ name: "", username: "", password: "", department: "", role: "user" });
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputCls = (k) =>
    `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[k] ? "border-red-400" : "border-gray-200"}`;

  const roleColors = { admin: "bg-purple-100 text-purple-700", user: "bg-gray-100 text-gray-600" };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h2>
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-5 text-base">Create New User</h3>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl mb-4">
              ✓ User created successfully!
            </div>
          )}
          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name",     placeholder: "e.g. Jane Doe",  type: "text"     },
              { label: "Username",  key: "username",  placeholder: "e.g. jane",      type: "text"     },
              { label: "Password",  key: "password",  placeholder: "Set a password", type: "password" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  {f.label} <span className="text-red-400">*</span>
                </label>
                <input type={f.type} className={inputCls(f.key)}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder} />
                {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Department <span className="text-red-400">*</span></label>
              <select className={inputCls("department")} value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
              <div className="flex gap-3">
                {["user", "admin"].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="role" value={r}
                      checked={form.role === r} onChange={() => setForm({ ...form, role: r })} />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[r]}`}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleCreate}
              className="w-full bg-blue-700 text-white py-2.5 rounded-xl font-bold hover:bg-blue-800 transition text-sm mt-2">
              Create User
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-700 mb-5 text-base">All Users ({users.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">@{u.username} · {u.department}</p>
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
