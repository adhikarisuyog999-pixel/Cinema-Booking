import {
	ClockIcon,
	FilmIcon,
	HomeModernIcon,
	MagnifyingGlassIcon,
	TicketIcon,
	UsersIcon,
	VideoCameraIcon
} from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
	const { auth, setAuth } = useContext(AuthContext)
	const [menuOpen, setMenuOpen] = useState(false)
	const [isLoggingOut, SetLoggingOut] = useState(false)

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}

	const navigate = useNavigate()

	const onLogout = async () => {
		try {
			SetLoggingOut(true)
			await axios.get('/auth/logout')
			setAuth({ username: null, email: null, role: null, token: null })
			sessionStorage.clear()
			navigate('/')
			toast.success('Logout successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} catch (error) {
			console.error(error)
			toast.error('Error logging out')
		} finally {
			SetLoggingOut(false)
		}
	}

	const getLinkClass = (path) => {
		const isActive = window.location.pathname === path
		return `flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
			isActive
				? 'bg-orange-500 text-white shadow-md'
				: 'text-slate-200 hover:bg-blue-800/60 hover:text-white'
		}`
	}

	const menuLists = () => {
		return (
			<>
				<div className="flex flex-col gap-1.5 lg:flex-row lg:items-center">
					<Link to={'/cinema'} className={getLinkClass('/cinema')}>
						<HomeModernIcon className="h-5 w-5" />
						<span>Cinemas</span>
					</Link>
					<Link to={'/schedule'} className={getLinkClass('/schedule')}>
						<ClockIcon className="h-5 w-5" />
						<span>Schedule</span>
					</Link>
					{auth.role && (
						<Link to={'/ticket'} className={getLinkClass('/ticket')}>
							<TicketIcon className="h-5 w-5" />
							<span>My Tickets</span>
						</Link>
					)}
					{auth.role === 'admin' && (
						<>
							<Link to={'/movie'} className={getLinkClass('/movie')}>
								<VideoCameraIcon className="h-5 w-5" />
								<span>Movies</span>
							</Link>
							<Link to={'/search'} className={getLinkClass('/search')}>
								<MagnifyingGlassIcon className="h-5 w-5" />
								<span>Search</span>
							</Link>
							<Link to={'/user'} className={getLinkClass('/user')}>
								<UsersIcon className="h-5 w-5" />
								<span>Users</span>
							</Link>
						</>
					)}
				</div>
				<div className="flex grow items-center justify-center gap-3 pt-2 lg:justify-end lg:pt-0">
					{auth.username && (
						<div className="flex items-center gap-2 rounded-full bg-blue-950/80 px-3 py-1 text-xs font-medium text-slate-200 border border-blue-700/50">
							<span className="h-2 w-2 rounded-full bg-emerald-400"></span>
							<span>{auth.username}</span>
							{auth.role === 'admin' && <span className="rounded bg-orange-950 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-orange-400 font-semibold border border-orange-800">Admin</span>}
						</div>
					)}
					{auth.token ? (
						<button
							className="rounded-lg bg-blue-900/80 border border-blue-700/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
							onClick={() => onLogout()}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? 'Logging out...' : 'Logout'}
						</button>
					) : (
						<Link
							to={'/login'}
							className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-orange-600 transition-all"
						>
							Login
						</Link>
					)}
				</div>
			</>
		)
	}

	return (
		<nav className="sticky top-0 z-50 flex flex-col items-center justify-between border-b border-blue-800/40 bg-slate-900/90 backdrop-blur-md px-4 py-3 sm:px-8 lg:flex-row shadow-lg">
			<div className="flex w-full items-center justify-between lg:w-auto lg:mr-8">
				<button className="flex items-center gap-2.5 group" onClick={() => navigate('/')}>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md group-hover:bg-orange-600 transition-colors">
						<FilmIcon className="h-5 w-5" />
					</div>
					<div className="text-left">
						<h1 className="text-lg font-bold tracking-tight text-white leading-none">CINEBOOK</h1>
						<span className="text-[10px] font-medium tracking-wider text-slate-300 uppercase">Cinema Tickets</span>
					</div>
				</button>
				<button
					className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-800 bg-blue-950 text-slate-200 hover:bg-blue-900 lg:hidden"
					onClick={() => toggleMenu()}
				>
					<Bars3Icon className="h-5 w-5" />
				</button>
			</div>
			<div className="hidden grow justify-between gap-4 lg:flex">{menuLists()}</div>
			{menuOpen && <div className="mt-3 flex w-full grow flex-col gap-3 rounded-xl bg-slate-900 p-4 border border-blue-800/40 lg:hidden">{menuLists()}</div>}
		</nav>
	)
}

export default Navbar
