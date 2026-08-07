import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '../components/Navbar'
import NowShowing from '../components/NowShowing'
import TheaterListsByMovie from '../components/TheaterListsByMovie'
import { AuthContext } from '../context/AuthContext'

const Home = () => {
	const { auth } = useContext(AuthContext)
	const [selectedMovieIndex, setSelectedMovieIndex] = useState(
		parseInt(sessionStorage.getItem('selectedMovieIndex')) || 0
	)
	const [movies, setMovies] = useState([])
	const [isFetchingMoviesDone, setIsFetchingMoviesDone] = useState(false)

	const fetchMovies = async () => {
		try {
			setIsFetchingMoviesDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/movie/unreleased/showing', {
					headers: { Authorization: `Bearer ${auth.token}` }
				})
			} else {
				response = await axios.get('/movie/showing')
			}
			setMovies(response.data?.data || [])
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingMoviesDone(true)
		}
	}

	useEffect(() => {
		fetchMovies()
	}, [])

	const props = {
		movies,
		selectedMovieIndex,
		setSelectedMovieIndex,
		auth,
		isFetchingMoviesDone
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			<Navbar />
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
				<NowShowing {...props} />
				{movies[selectedMovieIndex]?.name && <TheaterListsByMovie {...props} />}
			</main>
		</div>
	)
}

export default Home
