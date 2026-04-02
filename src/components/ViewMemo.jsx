import { useState } from "react";
import StatusBadge from "./StatusBadge";

// ── Export memo as a downloadable HTML file ─────────────────
function buildMemoHTML(memo, users) {
  const get     = id => users.find(u => u.id === id);
  const issuer  = get(memo.issuerId);
  const auth    = get(memo.authorizerId);
  const ack     = get(memo.acknowledgerId);
  const creator = get(memo.createdBy);

  const statusColor = {
    pending:      "#92400e",
    approved:     "#065f46",
    rejected:     "#991b1b",
    acknowledged: "#1e40af",
  };
  const statusBg = {
    pending:      "#fef3c7",
    approved:     "#d1fae5",
    rejected:     "#fee2e2",
    acknowledged: "#dbeafe",
  };

  const logsHTML = (memo.logs || []).map(log => `
    <div class="log-item">
      <div class="log-dot"></div>
      <div>
        <strong>${log.action}</strong>
        <span style="color:#555"> by ${log.by}</span>
        <span style="color:#999;font-size:11px;margin-left:8px">— ${log.at}</span>
        ${log.note ? `<p style="color:#dc2626;font-size:12px;margin:4px 0 0;font-style:italic">"${log.note}"</p>` : ""}
      </div>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Memo – ${memo.title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #1f2937; }
    .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
    h1 { font-size: 22px; color: #1e3a8a; margin: 0 0 4px; }
    .subtitle { color: #6b7280; font-size: 14px; margin: 0; }
    .status-badge { padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .meta-item { background: #f9fafb; padding: 10px 14px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 3px; }
    .meta-value { font-weight: 700; font-size: 14px; color: #111827; text-transform: capitalize; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin: 20px 0 8px; }
    .content-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
    .signers { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .signer { border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px; }
    .signer-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 6px; }
    .signer-name { font-weight: 700; font-size: 14px; }
    .signer-dept { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .log-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .log-dot { width: 10px; height: 10px; min-width: 10px; border-radius: 50%; background: #3b82f6; margin-top: 3px; }
    .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h1>${memo.title}</h1>
      <p class="subtitle">${memo.header}</p>
    </div>
    <span class="status-badge" style="background:${statusBg[memo.status] || "#f3f4f6"};color:${statusColor[memo.status] || "#374151"}">
      ${memo.status}
    </span>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">To Department</div><div class="meta-value">${memo.toDepartment}</div></div>
    <div class="meta-item"><div class="meta-label">From</div><div class="meta-value">${creator?.name || "—"} (${creator?.department || "—"})</div></div>
    <div class="meta-item"><div class="meta-label">Date Created</div><div class="meta-value" style="text-transform:none">${memo.createdAt}</div></div>
    <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${memo.status}</div></div>
  </div>

  <h2>Content</h2>
  <div class="content-box">${memo.content}</div>

  <h2>Signers</h2>
  <div class="signers">
    <div class="signer" style="background:#eff6ff">
      <div class="signer-label">4.1 Issuer</div>
      <div class="signer-name">${issuer?.name || "—"}</div>
      <div class="signer-dept">${issuer?.department || "—"}</div>
    </div>
    <div class="signer" style="background:#fefce8">
      <div class="signer-label">4.2 Authorizer</div>
      <div class="signer-name">${auth?.name || "—"}</div>
      <div class="signer-dept">${auth?.department || "—"}</div>
    </div>
    <div class="signer" style="background:#f0fdf4">
      <div class="signer-label">4.3 Acknowledger</div>
      <div class="signer-name">${ack?.name || "—"}</div>
      <div class="signer-dept">${ack?.department || "—"}</div>
    </div>
  </div>

  <h2>Activity Log</h2>
  <div>${logsHTML}</div>

  <div class="footer">Generated by MemoApp &nbsp;·&nbsp; ${new Date().toLocaleString()}</div>
</body>
</html>`;
}

function downloadMemo(memo, users) {
  const html     = buildMemoHTML(memo, users);
  const blob     = new Blob([html], { type: "text/html;charset=utf-8" });
  const url      = URL.createObjectURL(blob);
  const anchor   = document.createElement("a");
  const safeName = memo.title.replace(/[^a-z0-9]/gi, "_").replace(/_+/g, "_");
  anchor.href     = url;
  anchor.download = `Memo_${safeName}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ── ViewMemo component ──────────────────────────────────────
export default function ViewMemo({
  memo, currentUser, users,
  onApprove, onReject, onAcknowledge, onEdit, onBack,
}) {
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">View Memo</h2>
        </div>

        {/* Export / Print buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => downloadMemo(memo, users)}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            title="Download as HTML file"
          >
            ⬇ Download
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            title="Print this memo"
          >
            🖨 Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-7 space-y-6">

        {/* Title & status */}
        <div className={`border rounded-2xl p-4 ${statusBg[memo.status] || "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{memo.title}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{memo.header}</p>
            </div>
            <StatusBadge status={memo.status} />
          </div>
        </div>

        {/* Meta info */}
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

        {/* Content */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Content</p>
          <div className="bg-slate-50 rounded-2xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {memo.content}
          </div>
        </div>

        {/* Signers */}
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
                {user?.email && (
                  <p className="text-xs text-blue-500 mt-0.5">{user.email}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {(canApprove || canAcknowledge || canEdit) && (
          <div className="border-t pt-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Actions</p>
            <div className="flex flex-wrap gap-3">
              {canApprove && (
                <>
                  <button
                    onClick={onApprove}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm text-sm"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setShowRejectBox(v => !v)}
                    className="bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 transition shadow-sm text-sm"
                  >
                    ✗ Reject
                  </button>
                </>
              )}
              {canAcknowledge && (
                <button
                  onClick={onAcknowledge}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm text-sm"
                >
                  ✓ Acknowledge
                </button>
              )}
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition shadow-sm text-sm"
                >
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
                    onClick={() => {
                      onReject(rejectNote);
                      setShowRejectBox(false);
                      setRejectNote("");
                    }}
                    className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => { setShowRejectBox(false); setRejectNote(""); }}
                    className="border px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Log */}
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
                    {log.note && (
                      <p className="text-red-600 text-xs mt-0.5 italic">"{log.note}"</p>
                    )}
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
