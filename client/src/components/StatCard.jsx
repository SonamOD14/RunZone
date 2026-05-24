function StatCard({ label, value, unit, icon }) {
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: '#111', border: '1px solid #1f1f1f' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="label-upper">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span
          className="text-3xl font-black"
          style={{ color: '#CCFF00', fontFamily: 'Space Grotesk' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm font-bold mb-1" style={{ color: '#444' }}>
            {unit}
          </span>
        )}
      </div>

      {/* Bottom glow line */}
      
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #CCFF00, transparent)', opacity: 0.3 }}
      />
    </div>
  )
}

export default StatCard