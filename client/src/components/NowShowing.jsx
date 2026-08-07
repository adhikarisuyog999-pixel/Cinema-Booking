import 'react-toastify/dist/ReactToastify.css'
import Loading from './Loading'

const NowShowing = ({ movies, selectedMovieIndex, setSelectedMovieIndex, isFetchingMoviesDone }) => {
	return (
<<<<<<< Updated upstream
		<div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl space-y-4">
			<div className="flex items-center justify-between pb-2 border-b border-slate-100">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-slate-900">Now Showing</h2>
					<p className="text-xs text-slate-500">Select a movie to view available showtimes and theaters</p>
				</div>
				<span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
=======
		<div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
			<div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-white">Now Showing</h2>
					<p className="text-xs text-slate-400">Select a movie to view available showtimes and theaters</p>
				</div>
				<span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
>>>>>>> Stashed changes
					{movies?.length || 0} Movies
				</span>
			</div>

			{isFetchingMoviesDone ? (
				movies?.length ? (
					<div className="overflow-x-auto py-2">
						<div className="flex gap-4">
							{movies.map((movie, index) => {
								const isSelected = selectedMovieIndex === index
								return (
									<div
										key={movie._id || index}
										title={movie.name}
										className={`group flex w-[130px] sm:w-[150px] flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border p-2 transition-all duration-150 ${
											isSelected
<<<<<<< Updated upstream
												? 'border-orange-500 bg-orange-50/80 shadow-md ring-2 ring-orange-500/20'
												: 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
=======
												? 'border-red-500 bg-red-950/30 shadow-lg ring-1 ring-red-500'
												: 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
>>>>>>> Stashed changes
										}`}
										onClick={() => {
											if (isSelected) {
												setSelectedMovieIndex(null)
												sessionStorage.setItem('selectedMovieIndex', null)
											} else {
												setSelectedMovieIndex(index)
												sessionStorage.setItem('selectedMovieIndex', index)
											}
										}}
									>
										<div className="relative overflow-hidden rounded-lg">
											<img
												src={movie.img}
												alt={movie.name}
												className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-105"
											/>
											{isSelected && (
<<<<<<< Updated upstream
												<div className="absolute top-1.5 right-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
=======
												<div className="absolute top-1.5 right-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
>>>>>>> Stashed changes
													Selected
												</div>
											)}
										</div>
<<<<<<< Updated upstream
										<p className="truncate pt-2 text-center text-xs font-bold text-slate-900">
=======
										<p className="truncate pt-2 text-center text-xs font-semibold text-white">
>>>>>>> Stashed changes
											{movie.name}
										</p>
									</div>
								)
							})}
						</div>
					</div>
				) : (
<<<<<<< Updated upstream
					<p className="py-8 text-center text-xs text-slate-500">There are no movies showing right now.</p>
=======
					<p className="py-8 text-center text-xs text-slate-400">There are no movies showing right now.</p>
>>>>>>> Stashed changes
				)
			) : (
				<Loading />
			)}
		</div>
	)
}

export default NowShowing
