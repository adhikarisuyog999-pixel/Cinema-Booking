import { CheckIcon } from '@heroicons/react/24/outline'
import { memo, useState } from 'react'

const Seat = ({ seat, setSelectedSeats, selectable, isAvailable }) => {
	const [isSelected, setIsSelected] = useState(false)
	const seatId = `${seat.row}${seat.number}`

	if (!isAvailable) {
		return (
			<button
				title={`${seatId} - Booked / Unavailable`}
				disabled
				className="flex h-7 w-7 items-center justify-center p-0.5 cursor-not-allowed opacity-70"
			>
				<div className="h-5 w-5 rounded-md bg-slate-300 border border-slate-400"></div>
			</button>
		)
	}

	if (isSelected) {
		return (
			<button
				title={`${seatId} - Selected`}
				className="flex h-7 w-7 items-center justify-center p-0.5"
				onClick={() => {
					setIsSelected(false)
					setSelectedSeats((prev) => prev.filter((e) => e !== seatId))
				}}
			>
				<div className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-500 border border-orange-600 shadow-md text-white">
					<CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
				</div>
			</button>
		)
	}

	return (
		<button
			title={`${seatId} - Click to select`}
			disabled={!selectable}
			className={`flex h-7 w-7 items-center justify-center p-0.5 ${!selectable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
			onClick={() => {
				if (selectable) {
					setIsSelected(true)
					setSelectedSeats((prev) => [...prev, seatId])
				}
			}}
		>
			<div className="h-5 w-5 rounded-md border border-slate-300 bg-white hover:border-orange-500 hover:bg-orange-50 transition-colors shadow-sm"></div>
		</button>
	)
}

export default memo(Seat)
