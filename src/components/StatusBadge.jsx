export default function StatusBadge({ status }) {
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
