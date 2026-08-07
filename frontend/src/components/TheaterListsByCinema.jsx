import {
	ArrowsRightLeftIcon,
	ArrowsUpDownIcon,
	CheckIcon,
	PencilSquareIcon,
	TrashIcon,
	UserGroupIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DateSelector from './DateSelector'
import Theater from './Theater'

const TheaterListsByCinema = ({ cinemas, selectedCinemaIndex, setSelectedCinemaIndex, fetchCinemas, auth }) => {
	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const {
		register: registerName,
		handleSubmit: handleSubmitName,
		setValue: setValueName,
		formState: { errors: errorsName }
	} = useForm()

	const [movies, setMovies] = useState()
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [isIncreasing, setIsIncreasing] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isDecreasing, setIsDecreasing] = useState(false)
	const [isEditing, setIsEditing] = useState(false)

	const fetchMovies = async () => {
		try {
			const response = await axios.get('/movie')
			setMovies(response.data.data)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	useEffect(() => {
		setIsEditing(false)
		setValueName('name', cinemas[selectedCinemaIndex].name)
	}, [cinemas[selectedCinemaIndex].name])

	function rowToNumber(column) {
		let result = 0
		for (let i = 0; i < column.length; i++) {
			const charCode = column.charCodeAt(i) - 64
			result = result * 26 + charCode
		}
		return result
	}

	const handleDelete = (cinema) => {
		const confirmed = window.confirm(
			`Do you want to delete cinema ${cinema.name}, including its theaters, showtimes and tickets?`
		)
		if (confirmed) onDeleteCinema(cinema._id)
	}

	const onDeleteCinema = async (id) => {
		try {
			setIsDeleting(true)
			await axios.delete(`/cinema/${id}`, {
				headers: { Authorization: `Bearer ${auth.token}` }
			})
			setSelectedCinemaIndex(null)
			fetchCinemas()
			toast.success('Delete cinema successful!')
		} catch (error) {
			console.error(error)
			toast.error('Error deleting cinema')
		} finally {
			setIsDeleting(false)
		}
	}

	const onIncreaseTheater = async (data) => {
		try {
			setIsIncreasing(true)
			await axios.post(
				'/theater',
				{
					cinema: cinemas[selectedCinemaIndex]._id,
					number: cinemas[selectedCinemaIndex].theaters.length + 1,
					row: data.row.toUpperCase(),
					column: data.column
				},
				{ headers: { Authorization: `Bearer ${auth.token}` } }
			)
			fetchCinemas()
			toast.success('Add theater successful!')
		} catch (error) {
			console.error(error)
			toast.error('Error adding theater')
		} finally {
			setIsIncreasing(false)
		}
	}

	const handleDecreaseTheater = () => {
		const confirmed = window.confirm(
			`Do you want to delete theater ${cinemas[selectedCinemaIndex].theaters.length}, including its showtimes and tickets?`
		)
		if (confirmed) onDecreaseTheater()
	}

	const onDecreaseTheater = async () => {
		try {
			setIsDecreasing(true)
			await axios.delete(`/theater/${cinemas[selectedCinemaIndex].theaters.slice(-1)[0]._id}`, {
				headers: { Authorization: `Bearer ${auth.token}` }
			})
			fetchCinemas()
			toast.success('Decrease theater successful!')
		} catch (error) {
			console.error(error)
			toast.error('Error')
		} finally {
			setIsDecreasing(false)
		}
	}

	const onEditCinema = async (data) => {
		try {
			await axios.put(
				`/cinema/${cinemas[selectedCinemaIndex]._id}`,
				{ name: data.name },
				{ headers: { Authorization: `Bearer ${auth.token}` } }
			)
			fetchCinemas(data.name)
			toast.success('Edit cinema name successful!')
		} catch (error) {
			console.error(error)
			toast.error('Error')
		}
	}

	const cinema = cinemas[selectedCinemaIndex]
	const theaterCount = cinema?.theaters?.length || 0

	return (
		<div className="space-y-5">
			{/* Date Selector — full width, glassy */}
			<div className="rounded-2xl overflow-hidden shadow-md">
				<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
			</div>

			{/* Cinema Header Bar */}
			<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white shadow-md px-5 py-4">
				<div className="flex items-center gap-3">
					{isEditing ? (
						<form onSubmit={handleSubmitName(onEditCinema)} className="flex items-center gap-2">
							<input
								type="text"
								required
								autoFocus
								className={`rounded-xl border px-3 py-1.5 text-lg font-bold text-slate-800 outline-none focus:border-[#3B4DDB] ${
									errorsName.name ? 'border-red-500' : 'border-slate-300'
								}`}
								{...registerName('name', { required: true })}
							/>
							<button
								type="submit"
								onClick={() => setIsEditing(false)}
								className="flex items-center gap-1 rounded-xl bg-[#3B4DDB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2C3CC8] transition-colors"
							>
								SAVE <CheckIcon className="h-4 w-4" />
							</button>
						</form>
					) : (
						<h2 className="text-xl font-bold text-slate-800">{cinema?.name}</h2>
					)}
				</div>

				{auth.role === 'admin' && (
					<div className="flex items-center gap-2">
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="flex items-center gap-1 rounded-xl border border-[#3B4DDB] px-3 py-1.5 text-xs font-semibold text-[#3B4DDB] hover:bg-[#3B4DDB] hover:text-white transition-colors"
							>
								EDIT <PencilSquareIcon className="h-4 w-4" />
							</button>
						)}
						<button
							onClick={() => handleDelete(cinema)}
							disabled={isDeleting}
							className="flex items-center gap-1 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
						>
							{isDeleting ? 'Deleting...' : 'DELETE'} <TrashIcon className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>

			{/* Theaters Section */}
			<div className="rounded-2xl bg-white shadow-md overflow-hidden">
				{/* Section Header */}
				<div className="px-6 py-4 border-b border-slate-100">
					<h3 className="text-2xl font-bold text-slate-800">Theaters</h3>
				</div>

				{/* Add Theater Panel (Admin Only) */}
				{auth.role === 'admin' && (
					<form onSubmit={handleSubmit(onIncreaseTheater)} className="px-6 py-4 border-b border-slate-100">
						<div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
							{/* Label */}
							<h4 className="text-sm font-bold text-slate-700 mr-2">Add Theater</h4>

							{/* Last Row */}
							<div className="flex items-center gap-2">
								<ArrowsUpDownIcon className="h-4 w-4 text-slate-500" />
								<div className="flex flex-col items-end">
									<span className="text-[11px] font-semibold text-slate-500 leading-none">Last Row :</span>
									<span className="text-[10px] text-slate-400">(A-DZ)</span>
								</div>
								<input
									type="text"
									maxLength="2"
									required
									placeholder="J"
									className={`w-14 rounded-lg border px-2 py-1.5 text-center text-sm font-bold text-slate-800 outline-none focus:border-[#3B4DDB] ${
										errors.row ? 'border-red-500' : 'border-slate-300'
									}`}
									{...register('row', {
										required: true,
										pattern: { value: /^([A-Da-d][A-Za-z]|[A-Za-z])$/, message: 'Invalid row' }
									})}
								/>
							</div>

							{/* Last Column */}
							<div className="flex items-center gap-2">
								<ArrowsRightLeftIcon className="h-4 w-4 text-slate-500" />
								<div className="flex flex-col items-end">
									<span className="text-[11px] font-semibold text-slate-500 leading-none">Last Column :</span>
									<span className="text-[10px] text-slate-400">(1-120)</span>
								</div>
								<input
									type="number"
									min="1"
									max="120"
									required
									placeholder="15"
									className={`w-20 rounded-lg border px-2 py-1.5 text-center text-sm font-bold text-slate-800 outline-none focus:border-[#3B4DDB] ${
										errors.column ? 'border-red-500' : 'border-slate-300'
									}`}
									{...register('column', { required: true })}
								/>
							</div>

							{/* Theater number badge + Add button */}
							<div className="flex items-stretch rounded-xl overflow-hidden shadow-sm ml-auto">
								<div className="flex flex-col items-center justify-center bg-slate-700 px-3 py-1">
									<span className="text-[10px] text-slate-300 leading-none">Number</span>
									<span className="text-lg font-bold text-white leading-tight">{theaterCount + 1}</span>
								</div>
								<button
									type="submit"
									disabled={isIncreasing}
									className="flex items-center gap-1 whitespace-nowrap px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50"
									style={{ background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' }}
								>
									{isIncreasing ? 'Adding...' : 'ADD +'}
								</button>
							</div>
						</div>
					</form>
				)}

				{/* Theater List */}
				<div className="flex flex-col divide-y divide-slate-100">
					{cinema?.theaters?.map((theater, index) => (
						<Theater
							key={index}
							theaterId={theater._id}
							movies={movies}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
						/>
					))}

					{theaterCount === 0 && (
						<div className="px-6 py-10 text-center text-slate-400 text-sm">
							No theaters yet. Add one above.
						</div>
					)}
				</div>

				{/* Delete last theater */}
				{auth.role === 'admin' && theaterCount > 0 && (
					<div className="px-6 py-4 border-t border-slate-100 flex justify-center">
						<button
							onClick={handleDecreaseTheater}
							disabled={isDecreasing}
							className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
						>
							<TrashIcon className="h-4 w-4" />
							{isDecreasing ? 'Deleting...' : 'DELETE LAST THEATER'}
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default TheaterListsByCinema
