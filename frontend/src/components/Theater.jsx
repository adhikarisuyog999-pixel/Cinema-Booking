import { ArrowsRightLeftIcon, ArrowsUpDownIcon, InformationCircleIcon, UserIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import Loading from './Loading'
import Showtimes from './Showtimes'

const Theater = ({ theaterId, movies, selectedDate, filterMovie, setSelectedDate }) => {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		getValues,
		watch,
		formState: { errors }
	} = useForm()

	const { auth } = useContext(AuthContext)
	const [theater, setTheater] = useState({})
	const [isFetchingTheaterDone, setIsFetchingTheaterDone] = useState(false)
	const [isAddingShowtime, setIsAddingShowtime] = useState(false)
	const [selectedMovie, setSelectedMovie] = useState(null)

	const fetchTheater = async () => {
		try {
			setIsFetchingTheaterDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get(`/theater/unreleased/${theaterId}`, {
					headers: { Authorization: `Bearer ${auth.token}` }
				})
			} else {
				response = await axios.get(`/theater/${theaterId}`)
			}
			setTheater(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingTheaterDone(true)
		}
	}

	useEffect(() => {
		fetchTheater()
	}, [theaterId])

	useEffect(() => {
		setValue('autoIncrease', true)
		setValue('rounding5', true)
		setValue('gap', '00:10')
	}, [])

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64
			result = result * 26 + charCode
		}
		return result
	}

	const onAddShowtime = async (data) => {
		try {
			setIsAddingShowtime(true)
			if (!data.movie) {
				toast.error('Please select a movie', { position: 'top-center', autoClose: 2000 })
				return
			}
			let showtime = new Date(selectedDate)
			const [hours, minutes] = data.showtime.split(':')
			showtime.setHours(hours, minutes, 0)

			await axios.post(
				'/showtime',
				{ movie: data.movie, showtime, theater: theater._id, repeat: data.repeat, isRelease: data.isRelease },
				{ headers: { Authorization: `Bearer ${auth.token}` } }
			)

			fetchTheater()

			if (data.autoIncrease) {
				const movieLength = movies.find((m) => m._id === data.movie).length
				const [GapHours, GapMinutes] = data.gap.split(':').map(Number)
				const nextShowtime = new Date(showtime.getTime() + (movieLength + GapHours * 60 + GapMinutes) * 60000)

				if (data.rounding5 || data.rounding10) {
					const totalMinutes = nextShowtime.getHours() * 60 + nextShowtime.getMinutes()
					const roundedMinutes = data.rounding5
						? Math.ceil(totalMinutes / 5) * 5
						: Math.ceil(totalMinutes / 10) * 10
					let roundedHours = Math.floor(roundedMinutes / 60)
					const remainderMinutes = roundedMinutes % 60
					if (roundedHours === 24) {
						nextShowtime.setDate(nextShowtime.getDate() + 1)
						roundedHours = 0
					}
					setValue('showtime', `${String(roundedHours).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`)
				} else {
					setValue(
						'showtime',
						`${String(nextShowtime.getHours()).padStart(2, '0')}:${String(nextShowtime.getMinutes()).padStart(2, '0')}`
					)
				}

				if (data.autoIncreaseDate) {
					setSelectedDate(nextShowtime)
					sessionStorage.setItem('selectedDate', nextShowtime)
				}
			}

			toast.success('Showtime added!', { position: 'top-center', autoClose: 2000 })
		} catch (error) {
			console.error(error)
			toast.error('Error adding showtime', { position: 'top-center', autoClose: 2000 })
		} finally {
			setIsAddingShowtime(false)
		}
	}

	if (!isFetchingTheaterDone) return <Loading />

	const totalSeats = rowToNumber(theater?.seatPlan?.row || 'A') * (theater?.seatPlan?.column || 1)

	return (
		<div className="flex flex-col">
			{/* Theater Header */}
			<div className="flex items-stretch">
				{/* Theater number badge */}
				<div className="flex items-center justify-center rounded-tl-none bg-slate-700 px-5 py-3 text-white">
					<span className="text-2xl font-bold">{theater.number}</span>
				</div>

				{/* Seat info (admin) */}
				{auth.role === 'admin' && (
					<div
						className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-white text-sm font-semibold"
						style={{ background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' }}
					>
						<span className="flex items-center gap-1.5">
							<ArrowsUpDownIcon className="h-4 w-4" />
							{theater?.seatPlan?.row === 'A' ? 'Row : A' : `Row : A - ${theater?.seatPlan?.row}`}
						</span>
						<span className="flex items-center gap-1.5">
							<ArrowsRightLeftIcon className="h-4 w-4" />
							{theater?.seatPlan?.column === 1 ? 'Column : 1' : `Column : 1 - ${theater?.seatPlan?.column}`}
						</span>
						<span className="flex items-center gap-1.5">
							<UserIcon className="h-4 w-4" />
							{totalSeats.toLocaleString('en-US')} Seats
						</span>
					</div>
				)}
			</div>

			{/* Body */}
			<div className="flex flex-col gap-4 bg-slate-50/60 px-4 py-4 sm:px-6">
				{/* Admin: Add Showtime Form */}
				{auth.role === 'admin' && (
					<>
						<form onSubmit={handleSubmit(onAddShowtime)} className="flex flex-col gap-3">
							{/* Row 1: Movie select + Showtime + Add button */}
							<div className="flex flex-wrap items-end gap-3">
								{/* Movie select */}
								<div className="flex min-w-[200px] grow flex-col gap-1">
									<label className="text-xs font-semibold text-slate-600">Movie:</label>
									<Select
										value={selectedMovie}
										options={movies?.map((movie) => ({ value: movie._id, label: movie.name })) || []}
										onChange={(value) => {
											setValue('movie', value.value)
											setSelectedMovie(value)
										}}
										isSearchable={true}
										primaryColor="indigo"
										placeholder="Select..."
										classNames={{
											menuButton: () =>
												'flex w-full text-sm border border-slate-300 rounded-xl shadow-sm bg-white hover:border-[#3B4DDB] focus:border-[#3B4DDB] focus:ring focus:ring-[#3B4DDB]/20 transition-all font-medium text-slate-700',
											menu: 'absolute z-10 w-full rounded-xl bg-white shadow-xl border border-slate-200 mt-1',
											listItem: ({ isSelected }) =>
												`block px-3 py-2 text-sm cursor-pointer transition-colors ${
													isSelected ? 'bg-[#3B4DDB] text-white' : 'text-slate-700 hover:bg-slate-100'
												}`
										}}
									/>
								</div>

								{/* Showtime */}
								<div className="flex flex-col gap-1">
									<label className="text-xs font-semibold text-slate-600">Showtime:</label>
									<input
										type="time"
										required
										className="h-9 rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-800 outline-none focus:border-[#3B4DDB] shadow-sm"
										{...register('showtime', { required: true })}
									/>
								</div>

								{/* Add button */}
								<button
									type="submit"
									disabled={isAddingShowtime}
									className="h-9 flex-shrink-0 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-50"
									style={{ background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' }}
								>
									{isAddingShowtime ? 'Adding...' : 'ADD +'}
								</button>
							</div>

							{/* Row 2: Repeat, Release now, Auto increase group, Gap, Rounding */}
							<div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
								{/* Repeat */}
								<div className="flex flex-col gap-1">
									<label className="text-xs font-semibold text-slate-500">Repeat (Day):</label>
									<input
										type="number"
										min={1}
										max={31}
										defaultValue={1}
										className="h-8 w-16 rounded-lg border border-slate-300 px-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-[#3B4DDB]"
										{...register('repeat', { required: true })}
									/>
								</div>

								{/* Release now */}
								<label className="flex flex-col items-center gap-1 cursor-pointer">
									<span className="text-xs font-semibold text-slate-500">Release now:</span>
									<input
										type="checkbox"
										className="h-6 w-6 rounded accent-[#3B4DDB] cursor-pointer"
										{...register('isRelease')}
									/>
								</label>

								{/* Divider */}
								<div className="flex items-center self-stretch">
									<button
										type="button"
										className="text-xs font-semibold text-[#3B4DDB] underline underline-offset-2 whitespace-nowrap"
									>
										Auto increase
									</button>
								</div>

								{/* Auto increase showtime */}
								<label className="flex flex-col items-center gap-1 cursor-pointer">
									<span className="text-xs font-semibold text-slate-500">Showtime:</span>
									<input
										type="checkbox"
										className="h-6 w-6 rounded accent-[#3B4DDB] cursor-pointer"
										{...register('autoIncrease')}
									/>
								</label>

								{/* Auto increase date */}
								<label className="flex flex-col items-center gap-1 cursor-pointer">
									<span className="text-xs font-semibold text-slate-500">Date:</span>
									<input
										type="checkbox"
										className="h-6 w-6 rounded accent-[#3B4DDB] cursor-pointer"
										disabled={!watch('autoIncrease')}
										{...register('autoIncreaseDate')}
									/>
								</label>

								{/* Gap */}
								<div className="flex flex-col gap-1">
									<label className="text-xs font-semibold text-slate-500">Gap:</label>
									<input
										type="time"
										className="h-8 w-28 rounded-lg border border-slate-300 px-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#3B4DDB] disabled:bg-slate-100 disabled:text-slate-400"
										disabled={!watch('autoIncrease')}
										{...register('gap')}
									/>
								</div>

								{/* Rounding label */}
								<span className="text-xs font-semibold text-slate-500 self-end pb-1">Rounding</span>

								{/* 5-min rounding */}
								<label className="flex flex-col items-center gap-1 cursor-pointer">
									<span className="text-xs font-semibold text-slate-500">5-min:</span>
									<input
										type="checkbox"
										className="h-6 w-6 rounded accent-[#3B4DDB] cursor-pointer"
										disabled={!watch('autoIncrease')}
										{...register('rounding5', {
											onChange: () => setValue('rounding10', false)
										})}
									/>
								</label>

								{/* 10-min rounding */}
								<label className="flex flex-col items-center gap-1 cursor-pointer">
									<span className="text-xs font-semibold text-slate-500">10-min:</span>
									<input
										type="checkbox"
										className="h-6 w-6 rounded accent-[#3B4DDB] cursor-pointer"
										disabled={!watch('autoIncrease')}
										{...register('rounding10', {
											onChange: () => setValue('rounding5', false)
										})}
									/>
								</label>
							</div>
						</form>

						{/* Filter movie info banner */}
						{filterMovie?.name && (
							<div className="flex items-center gap-2 rounded-xl border border-[#3B4DDB]/30 bg-[#3B4DDB]/10 px-4 py-2 text-sm text-[#3B4DDB]">
								<InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
								{`Viewing showtimes of "${filterMovie?.name}"`}
							</div>
						)}
					</>
				)}

				{/* Showtimes list */}
				<Showtimes
					showtimes={theater.showtimes}
					movies={movies}
					selectedDate={selectedDate}
					filterMovie={filterMovie}
				/>
			</div>
		</div>
	)
}

export default Theater
