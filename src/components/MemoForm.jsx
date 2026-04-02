import { useState } from "react";
import { DEPARTMENTS } from "../constants";

export default function MemoForm({ memo, users, currentUser, onSubmit, onCancel, isEdit = false }) {
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
    onSubmit({
      ...form,
      authorizerId:   Number(form.authorizerId),
      acknowledgerId: Number(form.acknowledgerId),
    });
  };

  const inputCls = (key) =>
    `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[key] ? "border-red-400" : "border-gray-200"
    }`;

  const Err = ({ k }) =>
    errors[k] ? <p className="text-red-500 text-xs mt-1">{errors[k]}</p> : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit & Resend Memo" : "Create New Memo"}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-7 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Memo Title <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls("title")}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Budget Approval Q2 2026"
            />
            <Err k="title" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Header / Subject <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls("header")}
              value={form.header}
              onChange={e => setForm({ ...form, header: e.target.value })}
              placeholder="e.g. Re: Annual Budget Review"
            />
            <Err k="header" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            To Department <span className="text-red-400">*</span>
          </label>
          <select
            className={inputCls("toDepartment")}
            value={form.toDepartment}
            onChange={e => setForm({ ...form, toDepartment: e.target.value })}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Err k="toDepartment" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            className={`${inputCls("content")} h-36 resize-none`}
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            placeholder="Write the memo content here…"
          />
          <Err k="content" />
        </div>

        <div className="border-t pt-5">
          <p className="text-sm font-bold text-gray-700 mb-4">Signers</p>
          <div className="grid grid-cols-3 gap-4">

            {/* Issuer (auto) */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">4.1 Issuer</p>
              <p className="font-semibold text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{currentUser.department}</p>
              <div className="mt-2 inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                Auto-assigned
              </div>
            </div>

            {/* Authorizer */}
            <div className={`border rounded-2xl p-4 ${errors.authorizerId ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                4.2 Authorizer <span className="text-red-400">*</span>
              </p>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.authorizerId}
                onChange={e => setForm({ ...form, authorizerId: e.target.value })}
              >
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

            {/* Acknowledger */}
            <div className={`border rounded-2xl p-4 ${errors.acknowledgerId ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}>
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                4.3 Acknowledger <span className="text-red-400">*</span>
              </p>
              <select
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.acknowledgerId}
                onChange={e => setForm({ ...form, acknowledgerId: e.target.value })}
              >
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
          <button
            onClick={handleSubmit}
            className="bg-blue-700 text-white px-7 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow text-sm"
          >
            {isEdit ? "💾 Save & Resend" : "📤 Submit Memo"}
          </button>
          <button
            onClick={onCancel}
            className="border border-gray-200 px-7 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
