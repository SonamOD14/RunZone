function LeaderboardCard({ rank, username, total_tiles, total_distance_km, isCurrentUser }) {
  const getRankStyle = () => {
    if (rank === 1) return 'bg-yellow-400 text-black'
    if (rank === 2) return 'bg-gray-300 text-black'
    if (rank === 3) return 'bg-amber-600 text-white'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isCurrentUser ? 'border-[#AAEE00] bg-[#f9ffe0]' : 'border-gray-100 bg-white'} shadow-sm`}>
      
      {/* Rank badge */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle()}`}>
        {rank}
      </div>

      {/* User info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{username}</span>
          {isCurrentUser && (
            <span className="text-xs bg-[#AAEE00] text-black px-2 py-0.5 rounded-full font-medium">You</span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{total_distance_km} km run</span>
      </div>

      {/* Territory count */}
      <div className="text-right">
        <div className="font-bold text-gray-900">{total_tiles}</div>
        <div className="text-gray-400 text-xs">tiles</div>
      </div>

    </div>
  )
}

export default LeaderboardCard