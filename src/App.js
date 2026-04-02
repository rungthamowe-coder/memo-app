import { useState, useEffect } from "react";
import { INITIAL_USERS } from "./constants";
import LoginPage   from "./components/LoginPage";
import Navbar      from "./components/Navbar";
import Dashboard   from "./components/Dashboard";
import MemoForm    from "./components/MemoForm";
import ViewMemo    from "./components/ViewMemo";
import AdminPanel  from "./components/AdminPanel";

// ─────────────────────────────────────────────
// TOAST NOTIFICATION SYSTEM
// ─────────────────────────────────────────────
function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 text-sm text-white pointer-events-auto transition-all ${
            t.type === "success"
              ? "bg-green-600"
              : t.type === "error"
              ? "bg-red-600"
              : "bg-blue-700"
          }`}
        >
          <span className="text-base mt-0.5">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "📧"}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="opacity-60 hover:opacity-100 leading-none ml-1 text-lg"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {

  // ── State (initialised from localStorage) ─
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("memo-app-users");
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [memos, setMemos] = useState(() => {
    try {
      const saved = localStorage.getItem("memo-app-memos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser,    setCurrentUser]    = useState(null);
  const [page,           setPage]           = useState("login");
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  const [loginForm,      setLoginForm]      = useState({ username: "", password: "" });
  const [loginError,     setLoginError]     = useState("");
  const [toasts,         setToasts]         = useState([]);

  // ── Persist to localStorage ────────────────
  useEffect(() => {
    localStorage.setItem("memo-app-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("memo-app-memos", JSON.stringify(memos));
  }, [memos]);

  // ── Toast helpers ──────────────────────────
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const dismissToast = (id) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  // ── Email notification (via mailto) ───────
  const notifyByEmail = (toUser, subject, body) => {
    if (!toUser?.email) return;
    const mailto =
      `mailto:${encodeURIComponent(toUser.email)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
    addToast(`📧 Email notification sent to ${toUser.name} (${toUser.email})`, "info");
  };

  // ── Auth ───────────────────────────────────
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

  // ── Memo actions ───────────────────────────
  const handleCreateMemo = (data) => {
    const newMemo = {
      id: Date.now(),
      ...data,
      createdBy: currentUser.id,
      status:    "pending",
      createdAt: new Date().toLocaleString(),
      logs: [{
        action: "Created & Sent",
        by:     currentUser.name,
        at:     new Date().toLocaleString(),
        note:   "",
      }],
    };
    setMemos(prev => [...prev, newMemo]);

    // Notify the Authorizer
    const authorizer = users.find(u => u.id === Number(data.authorizerId));
    if (authorizer) {
      notifyByEmail(
        authorizer,
        `[MemoApp] New Memo Awaiting Your Approval: ${data.title}`,
        `Dear ${authorizer.name},\n\nA new memo requires your approval.\n\n` +
        `Title:   ${data.title}\n` +
        `Subject: ${data.header}\n` +
        `From:    ${currentUser.name} (${currentUser.department})\n\n` +
        `Please log in to MemoApp to approve or reject this memo.\n\nRegards,\nMemoApp System`
      );
    }

    setPage("dashboard");
    addToast("Memo submitted successfully!", "success");
  };

  const updateMemoStatus = (memoId, status, action, note = "") => {
    setMemos(prev => prev.map(m =>
      m.id === memoId
        ? {
            ...m, status,
            logs: [...m.logs, {
              action, note,
              by: currentUser.name,
              at: new Date().toLocaleString(),
            }],
          }
        : m
    ));
  };

  const handleApprove = (id) => {
    const memo = memos.find(m => m.id === id);
    updateMemoStatus(id, "approved", "Approved");

    // Notify the Acknowledger
    const acknowledger = memo && users.find(u => u.id === memo.acknowledgerId);
    if (acknowledger) {
      notifyByEmail(
        acknowledger,
        `[MemoApp] Memo Approved – Acknowledgment Required: ${memo.title}`,
        `Dear ${acknowledger.name},\n\nA memo has been approved and requires your acknowledgment.\n\n` +
        `Title:       ${memo.title}\n` +
        `Approved by: ${currentUser.name}\n\n` +
        `Please log in to MemoApp to acknowledge this memo.\n\nRegards,\nMemoApp System`
      );
    }
    addToast("Memo approved successfully!", "success");
  };

  const handleReject = (id, note) => {
    const memo = memos.find(m => m.id === id);
    updateMemoStatus(id, "rejected", "Rejected", note);

    // Notify the Creator
    const creator = memo && users.find(u => u.id === memo.createdBy);
    if (creator && creator.id !== currentUser.id) {
      notifyByEmail(
        creator,
        `[MemoApp] Memo Rejected: ${memo.title}`,
        `Dear ${creator.name},\n\nYour memo has been rejected.\n\n` +
        `Title:       ${memo.title}\n` +
        `Rejected by: ${currentUser.name}\n` +
        `Reason:      ${note || "No reason provided"}\n\n` +
        `Please log in to MemoApp to edit and resend your memo.\n\nRegards,\nMemoApp System`
      );
    }
    addToast("Memo rejected.", "info");
  };

  const handleAcknowledge = (id) => {
    const memo = memos.find(m => m.id === id);
    updateMemoStatus(id, "acknowledged", "Acknowledged");

    // Notify the Creator
    const creator = memo && users.find(u => u.id === memo.createdBy);
    if (creator && creator.id !== currentUser.id) {
      notifyByEmail(
        creator,
        `[MemoApp] Memo Acknowledged: ${memo.title}`,
        `Dear ${creator.name},\n\nYour memo has been fully processed and acknowledged.\n\n` +
        `Title:            ${memo.title}\n` +
        `Acknowledged by:  ${currentUser.name}\n\n` +
        `Regards,\nMemoApp System`
      );
    }
    addToast("Memo acknowledged successfully!", "success");
  };

  const handleResend = (id, updatedData) => {
    setMemos(prev => prev.map(m =>
      m.id === id
        ? {
            ...m, ...updatedData, status: "pending",
            logs: [...m.logs, {
              action: "Edited & Resent",
              by:     currentUser.name,
              at:     new Date().toLocaleString(),
              note:   "",
            }],
          }
        : m
    ));

    // Re-notify the Authorizer
    const authorizer = users.find(u => u.id === Number(updatedData.authorizerId));
    if (authorizer) {
      notifyByEmail(
        authorizer,
        `[MemoApp] Revised Memo Awaiting Your Approval: ${updatedData.title}`,
        `Dear ${authorizer.name},\n\nA revised memo has been resubmitted for your approval.\n\n` +
        `Title: ${updatedData.title}\n` +
        `From:  ${currentUser.name}\n\n` +
        `Please log in to MemoApp to review this memo.\n\nRegards,\nMemoApp System`
      );
    }

    setPage("view");
    addToast("Memo updated and resent!", "success");
  };

  const selectedMemo = memos.find(m => m.id === selectedMemoId);

  // ── Render ─────────────────────────────────
  if (page === "login") {
    return (
      <LoginPage
        form={loginForm}
        setForm={setLoginForm}
        onLogin={handleLogin}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <Navbar currentUser={currentUser} onLogout={handleLogout} setPage={setPage} />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {page === "dashboard" && (
          <Dashboard
            memos={memos}
            currentUser={currentUser}
            users={users}
            onView={id => { setSelectedMemoId(id); setPage("view"); }}
            onCreate={() => setPage("create")}
          />
        )}

        {page === "create" && (
          <MemoForm
            users={users}
            currentUser={currentUser}
            onSubmit={handleCreateMemo}
            onCancel={() => setPage("dashboard")}
          />
        )}

        {page === "view" && selectedMemo && (
          <ViewMemo
            memo={memos.find(m => m.id === selectedMemoId)}
            currentUser={currentUser}
            users={users}
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
            users={users}
            currentUser={currentUser}
            isEdit
            onSubmit={data => handleResend(selectedMemoId, data)}
            onCancel={() => setPage("view")}
          />
        )}

        {page === "admin" && currentUser?.role === "admin" && (
          <AdminPanel
            users={users}
            onCreateUser={u => {
              setUsers(prev => [...prev, { ...u, id: Date.now() }]);
              addToast(`User "${u.name}" created successfully!`, "success");
            }}
          />
        )}
      </div>
    </div>
  );
}
