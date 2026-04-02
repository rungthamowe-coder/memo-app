import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function Dashboard({ memos, currentUser, users, onView, onCreate }) {
  const [activeTab, setActiveTab] = useState("active");

  const uid           = currentUser.id;
  const myMemos       = memos.filter(m => m.createdBy === uid);
  const toApprove     = memos.filter(m => m.authorizerId   === uid && m.status === "pending");
  const toAcknowledge = memos.filter(m => m.acknowledgerId === uid && m.status === "approved");

  const historyMemos = memos
    .filter(m =>
      m.createdBy === uid ||
      m.issuerId === uid ||
      m.authorizerId === uid ||
      m.acknowledgerId === uid
    )
    .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
    .sort((a, b) => b.id - a.id);

  const getRoles = (m) => {
    const roles = [];
    if (m.createdBy      === uid)                         roles.push("Creator");
    if (m.issuerId       === uid && m.issuerId !== m.createdBy) roles.push("Issuer");
    if (m.authorizerId   === uid)                         roles.push("Authorizer");
    if (m.acknowledgerId === uid)                         roles.push("Acknowledger");
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
                    <button
                      onClick={() => onView(m.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                    >
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
          { key: "active",  label: "Active",       badge: toApprove.length + toAcknowledge.length },
          { key: "history", label: "Memo History",  badge: historyMemos.length },
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
          <Table items={toApprove}     title="⚡ Pending My Approval"      emptyMsg="No memos waiting for your approval." />
          <Table items={toAcknowledge} title="✅ Needs My Acknowledgment"  emptyMsg="No memos waiting for your acknowledgment." />
          <Table items={myMemos}       title="📄 My Memos"                 emptyMsg="You haven't created any memos yet. Click '+ New Memo' to start." />
        </>
      )}

      {activeTab === "history" && (
        <Table
          items={historyMemos}
          title="🗂 All Memos I've Been Involved With"
          emptyMsg="No memo history yet."
          showRole
        />
      )}
    </div>
  );
}
