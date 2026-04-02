export default function Navbar({ currentUser, onLogout, setPage }) {
  return (
    <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setPage(currentUser?.role === "admin" ? "admin" : "dashboard")}
          className="font-bold text-lg tracking-tight hover:opacity-80 transition"
        >
          📋 MemoApp
        </button>
        <button
          onClick={() => setPage("dashboard")}
          className="text-sm text-blue-200 hover:text-white transition"
        >
          Dashboard
        </button>
        {currentUser?.role === "admin" && (
          <button
            onClick={() => setPage("admin")}
            className="text-sm text-blue-200 hover:text-white transition"
          >
            Admin Panel
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <div className="font-semibold">{currentUser?.name}</div>
          <div className="text-blue-300 text-xs">
            {currentUser?.department} · {currentUser?.role}
          </div>
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
