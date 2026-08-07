import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

const DateSelector = ({ selectedDate, setSelectedDate }) => {
	const { auth } = useContext(AuthContext)
	const wrapperRef = useRef(null)
	const scrollRef = useRef(null)
	const [isEditing, setIsEditing] = useState(false)

	const handlePrevDay = () => {
		const prevDay = new Date(selectedDate)
		prevDay.setDate(prevDay.getDate() - 1)
		setSelectedDate(prevDay)
		sessionStorage.setItem('selectedDate', prevDay)
	}

	const handleNextDay = () => {
		const nextDay = new Date(selectedDate)
		nextDay.setDate(nextDay.getDate() + 1)
		setSelectedDate(nextDay)
		sessionStorage.setItem('selectedDate', nextDay)
	}

	const handleToday = () => {
		const today = new Date()
		setSelectedDate(today)
		sessionStorage.setItem('selectedDate', today)
	}

	const formatDate = (date) => {
		const weekday = date.toLocaleString('default', { weekday: 'long' })
		const day = date.getDate()
		const month = date.toLocaleString('default', { month: 'long' })
		const year = date.getFullYear()
		return `${weekday} ${day} ${month} ${year}`
	}

	const isPast = (date) => {
		return new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
	}

	const isToday = (date) => {
		return new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
	}

	const isSelected = (date) => {
		return (
			selectedDate.getDate() === date.getDate() &&
			selectedDate.getMonth() === date.getMonth() &&
			selectedDate.getFullYear() === date.getFullYear()
		)
	}

	const handleChange = (event) => {
		setSelectedDate(new Date(event.target.value))
	}

	function generateDateRange(startDate, endDate) {
		const dates = []
		const currentDate = new Date(startDate)
		while (currentDate <= endDate) {
			dates.push(new Date(currentDate.getTime()))
			currentDate.setDate(currentDate.getDate() + 1)
		}
		return dates
	}

	function getPastAndNextDateRange() {
		const today = new Date()
		const pastDays = new Date(today)
		if (auth.role === 'admin') {
			pastDays.setDate(today.getDate() - 7)
		}
		const nextDays = new Date(today)
		nextDays.setDate(today.getDate() + 14)
		return generateDateRange(pastDays, nextDays)
	}

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsEditing(false)
			}
		}
		document.addEventListener('click', handleClickOutside, false)
		return () => document.removeEventListener('click', handleClickOutside, false)
	}, [])

	// Scroll selected date into view
	useEffect(() => {
		if (scrollRef.current) {
			const activeBtn = scrollRef.current.querySelector('[data-active="true"]')
			if (activeBtn) {
				activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
			}
		}
	}, [selectedDate])

	const dates = getPastAndNextDateRange()

	return (
		<div className="flex flex-col gap-0">
			{/* Header bar with date title + nav */}
			<div
				className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-2xl"
				style={{ background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' }}
			>
				<button
					title="Go to yesterday"
					onClick={handlePrevDay}
					className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20 transition-colors"
				>
					<ChevronLeftIcon className="h-5 w-5" />
				</button>

				{isEditing ? (
					<div className="flex-1" ref={wrapperRef}>
						<input
							title="Select date"
							type="date"
							min={auth.role !== 'admin' && new Date().toLocaleDateString('en-CA')}
							required
							autoFocus
							className="w-full bg-transparent text-center text-lg font-bold text-white outline-none"
							value={selectedDate.toLocaleDateString('en-CA')}
							onChange={handleChange}
							style={{ colorScheme: 'dark' }}
						/>
					</div>
				) : (
					<button
						onClick={() => setIsEditing(true)}
						className="flex-1 text-center text-base font-bold text-white hover:bg-white/10 rounded-lg py-1 transition-colors"
					>
						{formatDate(selectedDate)}
					</button>
				)}

				<div className="flex items-center gap-1">
					<button
						title="Go to tomorrow"
						onClick={handleNextDay}
						className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20 transition-colors"
					>
						<ChevronRightIcon className="h-5 w-5" />
					</button>
					<button
						title="Go to today"
						onClick={handleToday}
						className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20 transition-colors"
					>
						<ArrowPathIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Scrollable date strip */}
			<div
				ref={scrollRef}
				className="flex gap-1.5 overflow-x-auto rounded-b-2xl px-2 py-2 scrollbar-hide"
				style={{ background: 'rgba(59,77,219,0.08)', backdropFilter: 'blur(4px)' }}
			>
				{dates.map((date, index) => {
					const selected = isSelected(date)
					const today = isToday(date)
					const past = isPast(date)

					return (
						<button
							key={index}
							data-active={selected ? 'true' : 'false'}
							title={formatDate(date)}
							onClick={() => {
								setSelectedDate(date)
								sessionStorage.setItem('selectedDate', date)
							}}
							className={`flex min-w-[52px] flex-col items-center justify-center rounded-xl py-1.5 px-1 text-xs font-semibold transition-all flex-shrink-0 ${
								selected
									? 'text-white shadow-lg ring-2 ring-white/30'
									: today
									? 'bg-white text-[#3B4DDB] ring-2 ring-[#3B4DDB] hover:bg-blue-50'
									: past
									? 'bg-white/40 text-slate-500 hover:bg-white/60'
									: 'bg-white/70 text-slate-700 hover:bg-white'
							}`}
							style={selected ? { background: 'linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)' } : {}}
						>
							<span className="text-[10px] leading-tight">
								{date.toLocaleString('default', { weekday: 'short' })}
							</span>
							<span className="text-lg leading-tight font-bold">{date.getDate()}</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default DateSelector
