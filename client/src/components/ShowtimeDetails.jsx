import { EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const ShowtimeDetails = ({ showDeleteBtn, showtime, fetchShowtime }) => {
	const { auth } = useContext(AuthContext)
	const navigate = useNavigate()
	const [isDeleting, setIsDeleting] = useState(false)
	const [isTogglingRelease, setIsTogglingRelease] = useState(false)

	const handleDelete = async () => {
		if (!window.confirm(`Are you sure you want to delete this showtime?`)) return
		try {
			setIsDeleting(true)
			await axios.delete(`/showtime/${showtime._id}`, {
				headers: { Authorization: `Bearer ${auth.token}` }
			})
			toast.success('Showtime deleted successfully')
			navigate('/cinema')
		} catch (error) {
			console.error(error)
			toast.error('Failed to delete showtime')
		} finally {
			setIsDeleting(false)
		}
	}

	const handleToggleRelease = async (targetStatus) => {
		try {
			setIsTogglingRelease(true)
			await axios.put(
				`/showtime/${showtime._id}`,
				{ isRelease: targetStatus },
				{ headers: { Authorization: `Bearer ${auth.token}` } }
			)
			if (fetchShowtime) await fetchShowtime()
			toast.success(`Showtime ${targetStatus ? 'released' : 'unreleased'} successfully`)
		} catch (error) {
			console.error(error)
			toast.error('Failed to update release status')
		} finally {
			setIsTogglingRelease(false)
		}
	}

	const dt = showtime?.showtime ? new Date(showtime.showtime) : null
	const weekday = dt ? dt.toLocaleDateString('en-US', { weekday: 'long' }) : ''
	const fullDate = dt ? dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''
	const formattedTime = dt ? dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''

	return (
		<div className="space-y-4">
			{showDeleteBtn && auth.role === 'admin' && (
				<div className="flex justify-end gap-2">
					<button
						onClick={() => handleToggleRelease(!showtime.isRelease)}
						disabled={isTogglingRelease}
						className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
					>
						{showtime.isRelease ? (
							<>
								<EyeSlashIcon className="h-4 w-4 text-amber-600" />
								<span>Unrelease</span>
							</>
						) : (
							<>
								<EyeIcon className="h-4 w-4 text-emerald-600" />
								<span>Release Showtime</span>
							</>
						)}
					</button>
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
					>
						<TrashIcon className="h-4 w-4" />
						<span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
					</button>
				</div>
			)}

			<div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
				{/* Top Header Banner */}
				<div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
					<div className="flex items-center gap-3">
						<span className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
							Theater #{showtime?.theater?.number || '1'}
						</span>
						<h3 className="text-base font-bold text-slate-900 tracking-tight">
							{showtime?.theater?.cinema?.name || 'Cinema Hall'}
						</h3>
					</div>
					{!showtime?.isRelease && (
						<span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
							<EyeSlashIcon className="h-3.5 w-3.5" /> Unreleased
						</span>
					)}
				</div>

				{/* Body info */}
				<div className="flex flex-col md:flex-row items-center p-6 gap-6">
					<div className="flex-shrink-0">
						{showtime?.movie?.img ? (
							<img
								src={showtime.movie.img}
								alt={showtime.movie?.name}
								className="h-36 w-24 object-cover rounded-xl border border-slate-200 shadow-md"
							/>
						) : (
							<div className="h-36 w-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
								No Poster
							</div>
						)}
					</div>

					<div className="flex-1 text-center md:text-left space-y-1">
						<h2 className="text-2xl font-bold text-slate-900 tracking-tight">{showtime?.movie?.name}</h2>
						<p className="text-xs text-slate-500">
							Duration: <span className="text-slate-800 font-semibold">{showtime?.movie?.length || 120} mins</span>
						</p>
					</div>

					<div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center min-w-[200px]">
						<p className="text-xs font-bold uppercase tracking-wider text-orange-600">{weekday}</p>
						<p className="text-xs text-slate-500 mt-0.5">{fullDate}</p>
						<p className="text-2xl font-extrabold text-blue-950 mt-1">{formattedTime}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ShowtimeDetails
