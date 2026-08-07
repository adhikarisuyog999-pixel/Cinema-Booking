import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import CinemaLists from '../components/CinemaLists'
import Navbar from '../components/Navbar'
import TheaterListsByCinema from '../components/TheaterListsByCinema'
import { AuthContext } from '../context/AuthContext'

const Cinema = () => {
	const { auth } = useContext(AuthContext)
	const [selectedCinemaIndex, setSelectedCinemaIndex] = useState(
		parseInt(sessionStorage.getItem('selectedCinemaIndex')) || 0
	)
	const [cinemas, setCinemas] = useState([])
	const [isFetchingCinemas, setIsFetchingCinemas] = useState(true)

	const fetchCinemas = async (newSelectedCinema) => {
		try {
			setIsFetchingCinemas(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/cinema/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/cinema')
			}

			setCinemas(response.data?.data || [])
			if (newSelectedCinema && response.data?.data) {
				response.data.data.forEach((cinema, index) => {
					if (cinema.name === newSelectedCinema) {
						setSelectedCinemaIndex(index)
						sessionStorage.setItem('selectedCinemaIndex', index)
					}
				})
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingCinemas(false)
		}
	}

	useEffect(() => {
		fetchCinemas()
	}, [])

	const props = {
		cinemas,
		selectedCinemaIndex,
		setSelectedCinemaIndex,
		fetchCinemas,
		auth,
		isFetchingCinemas
	}

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			<Navbar />
			<main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
				<CinemaLists {...props} />
				{cinemas[selectedCinemaIndex]?.name && <TheaterListsByCinema {...props} />}
			</main>
		</div>
	)
}

export default Cinema
