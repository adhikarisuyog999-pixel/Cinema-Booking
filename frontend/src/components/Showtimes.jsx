import { EyeSlashIcon } from '@heroicons/react/24/outline'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Showtimes = ({ showtimes, movies, selectedDate, filterMovie, showMovieDetail = true }) => {
	const { auth } = useContext(AuthContext)
	const navigate = useNavigate()

	const isPast = (date) => new Date(date) < new Date()

	const sortedShowtimes = showtimes?.reduce((result, showtime) => {
		const { movie, showtime: showDateTime, seats, _id, isRelease } = showtime

		if (filterMovie && filterMovie._id !== movie) return result

		if (
			new Date(showDateTime).getDate() === selectedDate.getDate() &&
			new Date(showDateTime).getMonth() === selectedDate.getMonth() &&
			new Date(showDateTime).getFullYear() === selectedDate.getFullYear()
		) {
			if (!result[movie]) result[movie] = []
			result[movie].push({ showtime: showDateTime, seats, _id, isRelease })
		}
		return result
	}, {})

	sortedShowtimes &&
		Object.values(sortedShowtimes).forEach((movie) => {
			movie.sort((a, b) => new Date(a.showtime) - new Date(b.showtime))
		})

	if (!sortedShowtimes || Object.keys(sortedShowtimes).length === 0) {
		return (
			<p className="py-4 text-center text-sm text-slate-400">No showtimes available for this day.</p>
		)
	}

	const formatTime = (dateStr) => {
		const d = new Date(dateStr)
		return `${String(d.getHours()).padStart(2, '0')} : ${String(d.getMinutes()).padStart(2, '0')}`
	}

	return (
		<div className="flex flex-col divide-y divide-slate-100">
			{movies?.map((movie, index) => {
				if (!sortedShowtimes?.[movie._id]) return null

				const times = sortedShowtimes[movie._id]
				const nextFuture = times.find((s) => !isPast(s.showtime))

				return (
					<div key={index} className="flex items-start gap-4 py-4">
						{/* Movie poster */}
						{showMovieDetail && (
							<img
								src={movie.img}
								alt={movie.name}
								className="h-20 w-14 flex-shrink-0 rounded-xl object-cover shadow-md"
							/>
						)}

						{/* Movie info + time buttons */}
						<div className="flex flex-col gap-2 flex-1 min-w-0">
							{showMovieDetail && (
								<div>
									<h4 className="text-base font-bold text-slate-800 leading-tight">{movie.name}</h4>
									<p className="text-xs text-slate-500 mt-0.5">length : {movie.length || '-'} min</p>
								</div>
							)}

							<div className="flex flex-wrap gap-2">
								{times.map((showtime, i) => {
									const past = isPast(showtime.showtime)
									const isNext =
										nextFuture && new Date(showtime.showtime).getTime() === new Date(nextFuture.showtime).getTime()

									let btnStyle = ''
									let inlineStyle = {}

									if (past) {
										btnStyle = `border border-slate-200 bg-white text-slate-400 ${
											auth.role !== 'admin' ? 'cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
										}`
									} else if (isNext) {
										btnStyle = 'text-white shadow-md'
										inlineStyle = { background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' }
									} else {
										btnStyle = 'bg-slate-600 text-white hover:bg-slate-700 shadow-sm'
									}

									return (
										<button
											key={i}
											title={formatTime(showtime.showtime)}
											className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${btnStyle}`}
											style={inlineStyle}
											onClick={() => {
												if (!past || auth.role === 'admin') navigate(`/showtime/${showtime._id}`)
											}}
										>
											{!showtime.isRelease && (
												<EyeSlashIcon className="h-4 w-4" title="Unreleased" />
											)}
											{formatTime(showtime.showtime)}
										</button>
									)
								})}
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default Showtimes
