const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-400",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
];

export default function Navbar({ currentUser, onLogout, setPage, onSettings, onTeam }) {
  const avatarColor = AVATAR_COLORS[(currentUser?.id || 0) % AVATAR_COLORS.length];

  return (
    <nav className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      {/* ── Left: Brand + nav links ── */}
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

        <button
          onClick={onTeam}
          className="text-sm text-blue-200 hover:text-white transition"
        >
          👥 Team
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

      {/* ── Right: User info + actions ── */}
      <div className="flex items-center gap-3 text-sm">

        {/* Settings icon */}
        <button
          onClick={onSettings}
          title="Account Settings"
          className="text-blue-300 hover:text-white transition text-lg leading-none px-1"
        >
          ⚙
        </button>

        {/* Avatar + name (click to go to own profile) */}
        <button
          onClick={onSettings}
          className="flex items-center gap-2 hover:opacity-80 transition"
          title="Account Settings"
        >
          <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-sm leading-tight">{currentUser?.name}</div>
            <div className="text-blue-300 text-xs">
              {currentUser?.department} · {currentUser?.role}
            </div>
          </div>
        </button>

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
