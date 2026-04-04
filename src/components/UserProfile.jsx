const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-500",
  "bg-pink-600", "bg-teal-600", "bg-indigo-600", "bg-rose-600",
];

export default function UserProfile({ profileUser, currentUser, memos, onBack }) {
  if (!profileUser) return null;

  const avatarColor = AVATAR_COLORS[profileUser.id % AVATAR_COLORS.length];
  const initial     = profileUser.name.charAt(0).toUpperCase();

  // Memo involvement stats
  const created      = memos.filter(m => m.createdBy      === profileUser.id).length;
  const authorized   = memos.filter(m => m.authorizerId   === profileUser.id).length;
  const acknowledged = memos.filter(m => m.acknowledgerId === profileUser.id).length;

  const isMe = profileUser.id === currentUser.id;

  const stats = [
    { label: "Memos Created",  count: created,      color: "text-blue-700",   bg: "bg-blue-50"   },
    { label: "Authorized",     count: authorized,   color: "text-yellow-700", bg: "bg-yellow-50" },
    { label: "Acknowledged",   count: acknowledged, color: "text-green-700",  bg: "bg-green-50"  },
  ];

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
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
      </div>

      <div className="max-w-lg">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-4">

          {/* Gradient cover */}
          <div className="h-28 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-4">
              <div className={`w-24 h-24 rounded-2xl ${avatarColor} flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white shadow-lg flex-shrink-0`}>
                {initial}
              </div>
              <div className="pb-2">
                {isMe && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold mb-1.5 inline-block">
                    You
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{profileUser.name}</h3>
                <p className="text-gray-400 text-sm mt-0.5">@{profileUser.username}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                profileUser.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {profileUser.role === "admin" ? "👑 Admin" : "👤 User"}
              </span>
            </div>

            {/* Details */}
            <div className="mt-5 space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-32 flex-shrink-0 font-medium">🏢 Department</span>
                <span className="font-semibold text-gray-700">{profileUser.department}</span>
              </div>
              {profileUser.email && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 w-32 flex-shrink-0 font-medium">✉ Email</span>
                  <a
                    href={`mailto:${profileUser.email}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {profileUser.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Memo stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center shadow-sm`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
