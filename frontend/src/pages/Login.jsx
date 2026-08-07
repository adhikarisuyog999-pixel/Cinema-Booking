import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
	const navigate = useNavigate()
	const { setAuth } = useContext(AuthContext)
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isLoggingIn, setIsLoggingIn] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		setIsLoggingIn(true)
		setErrorsMessage('')
		try {
			const response = await axios.post('/auth/login', data)
			toast.success('Login successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
			setAuth({ token: response.data.token })
			navigate('/')
		} catch (error) {
			console.error(error.response?.data)
			const msg = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message || 'Login failed'
			setErrorsMessage(msg)
			toast.error(msg, {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			setIsLoggingIn(false)
		}
	}

	const getInputClass = (hasError) => {
		return `block w-full rounded-lg border bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
			hasError
				? 'border-red-500 focus:border-red-500'
				: 'border-slate-800 focus:border-red-500'
		}`
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
			<div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
				<div className="text-center">
					<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-xl mb-3 shadow-lg">
						C
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
					<p className="mt-1 text-xs text-slate-400">Sign in to your CineBook account to manage tickets</p>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
						<input
							name="username"
							type="text"
							autoComplete="username"
							{...register('username', { required: 'Username is required' })}
							className={getInputClass(!!errors.username)}
							placeholder="Enter your username"
						/>
						{errors.username && <span className="mt-1 block text-xs text-red-400">{errors.username.message}</span>}
					</div>

					<div>
						<label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
						<input
							name="password"
							type="password"
							autoComplete="current-password"
							{...register('password', { required: 'Password is required' })}
							className={getInputClass(!!errors.password)}
							placeholder="••••••••"
						/>
						{errors.password && <span className="mt-1 block text-xs text-red-400">{errors.password.message}</span>}
					</div>

					{errorsMessage && (
						<div className="rounded-lg bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300">
							{errorsMessage}
						</div>
					)}

					<button
						type="submit"
						className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-colors focus:outline-none disabled:opacity-50"
						disabled={isLoggingIn}
					>
						{isLoggingIn ? 'Logging in...' : 'Sign In'}
					</button>

					<p className="text-center text-xs text-slate-400 pt-2">
						Don’t have an account?{' '}
						<Link to={'/register'} className="font-semibold text-red-400 hover:underline">
							Register here
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Login
