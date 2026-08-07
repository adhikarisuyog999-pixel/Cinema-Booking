import { TrashIcon } from '@heroicons/react/24/outline'

const MovieLists = ({ movies, search, handleDelete }) => {
  const moviesList = movies?.filter((movie) =>
    movie.name.toLowerCase().includes(search?.toLowerCase() || '')
  ) || []

  return moviesList.length ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {moviesList.map((movie) => (
        <div
          key={movie._id}
          className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md p-3 gap-3"
        >
          <img
            src={movie.img}
            alt={movie.name}
            className="h-32 w-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
          />
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{movie.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Duration: {movie.length || 120} min</p>
              {movie.price > 0 && (
                <p className="text-xs font-semibold text-orange-600 mt-0.5">
                  NPR {movie.price.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                className="flex items-center gap-1 rounded border border-red-300 bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-200 transition-colors"
                onClick={() => handleDelete(movie._id || movie)}
              >
                <TrashIcon className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
      No movies found.
    </div>
  )
}

export default MovieLists
