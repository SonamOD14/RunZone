function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        {icon && (
          <span className="text-2xl">{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && (
          <span className="text-gray-400 text-sm mb-1">{unit}</span>
        )}
      </div>
    </div>
  )
}

export default StatCard