const AVATAR_COLORS = [
  "bg-blue-600", "bg-purple-600", "bg-green-600", "bg-orange-500",
  "bg-pink-600", "bg-teal-600", "bg-indigo-600", "bg-rose-600",
];

export default function TeamDirectory({ users, currentUser, onViewProfile }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Directory</h2>
        <span className="text-sm text-gray-400 font-medium">{users.length} members</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {users.map(user => {
          const avatarColor = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
          const initial     = user.name.charAt(0).toUpperCase();
          const isMe        = user.id === currentUser.id;

          return (
            <button
              key={user.id}
              onClick={() => onViewProfile(user.id)}
              className="bg-white rounded-2xl shadow p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow group-hover:scale-105 transition-transform`}>
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 truncate leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">@{user.username}</p>
                </div>
              </div>

              {/* Department */}
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                <span>🏢</span>
                <span>{user.department}</span>
              </p>

              {/* Role + You badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {user.role === "admin" ? "👑 Admin" : "User"}
                </span>
                {isMe && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 font-semibold">
                    You
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
