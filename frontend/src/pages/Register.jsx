import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
	const navigate = useNavigate()
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isRegistering, setIsRegistering] = useState(false)
	const [step, setStep] = useState(1) // Step 1: Form details, Step 2: 2-digit verification
	const [formData, setFormData] = useState(null)
	const [generatedCode, setGeneratedCode] = useState(null)
	const [userCode, setUserCode] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onInitiateRegister = (data) => {
		setErrorsMessage('')
		// Generate random 2-digit code (10-99)
		const code = Math.floor(10 + Math.random() * 90).toString()
		setGeneratedCode(code)
		setFormData(data)
		setStep(2)
		toast.info(`Verification code sent! Your 2-digit code is: ${code}`, {
			position: 'top-center',
			autoClose: 10000,
			pauseOnHover: true
		})
	}

	const onVerifyAndRegister = async (e) => {
		e.preventDefault()
		if (userCode.trim() !== generatedCode) {
			setErrorsMessage('Invalid 2-digit verification code. Please try again.')
			toast.error('Invalid verification code')
			return
		}

		setIsRegistering(true)
		setErrorsMessage('')
		try {
			await axios.post('/auth/register', formData)
			toast.success('Registration successful! Please login.', {
				position: 'top-center',
				autoClose: 2500
			})
			navigate('/login')
		} catch (error) {
			console.error(error.response?.data)
			const msg = typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message || 'Registration failed'
			setErrorsMessage(msg)
			toast.error(msg, {
				position: 'top-center',
				autoClose: 3000
			})
		} finally {
			setIsRegistering(false)
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
					<h2 className="text-2xl font-bold tracking-tight text-white">Create an Account</h2>
					<p className="mt-1 text-xs text-slate-400">Join CineBook to reserve and manage cinema tickets</p>
				</div>

				{step === 1 ? (
					<form className="space-y-4" onSubmit={handleSubmit(onInitiateRegister)}>
						<div>
							<label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
							<input
								name="username"
								type="text"
								autoComplete="username"
								{...register('username', { required: 'Username is required' })}
								className={getInputClass(!!errors.username)}
								placeholder="johndoe"
							/>
							{errors.username && <span className="mt-1 block text-xs text-red-400">{errors.username.message}</span>}
						</div>

						<div>
							<label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
							<input
								name="email"
								type="email"
								autoComplete="email"
								{...register('email', {
									required: 'Email is required',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Invalid email address'
									}
								})}
								className={getInputClass(!!errors.email)}
								placeholder="john@example.com"
							/>
							{errors.email && <span className="mt-1 block text-xs text-red-400">{errors.email.message}</span>}
						</div>

						<div>
							<label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
							<input
								name="password"
								type="password"
								autoComplete="new-password"
								{...register('password', {
									required: 'Password is required',
									minLength: {
										value: 6,
										message: 'Password must be at least 6 characters'
									}
								})}
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
							className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-500 transition-colors focus:outline-none"
						>
							Continue to Verification
						</button>
					</form>
				) : (
					<form className="space-y-4" onSubmit={onVerifyAndRegister}>
						<div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-center">
							<span className="text-xs font-medium uppercase tracking-wider text-red-400 block mb-1">Email Verification Code</span>
							<p className="text-xs text-slate-300 mb-2">We generated a 2-digit verification code for <strong className="text-white">{formData?.email}</strong>:</p>
							<div className="inline-block rounded-lg bg-red-600/20 border border-red-500/30 px-4 py-2 text-2xl font-mono font-bold tracking-widest text-red-400">
								{generatedCode}
							</div>
						</div>

						<div>
							<label className="block text-xs font-medium text-slate-300 mb-1 text-center">Enter 2-Digit Verification Code</label>
							<input
								type="text"
								maxLength={2}
								value={userCode}
								onChange={(e) => setUserCode(e.target.value)}
								className="block w-full text-center text-2xl tracking-widest font-mono rounded-lg border border-slate-800 bg-slate-950 py-3 text-white focus:border-red-500 focus:outline-none"
								placeholder="00"
								required
							/>
						</div>

						{errorsMessage && (
							<div className="rounded-lg bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-300 text-center">
								{errorsMessage}
							</div>
						)}

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setStep(1)}
								className="w-1/3 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
							>
								Back
							</button>
							<button
								type="submit"
								disabled={isRegistering}
								className="w-2/3 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors disabled:opacity-50"
							>
								{isRegistering ? 'Registering...' : 'Verify & Complete'}
							</button>
						</div>
					</form>
				)}

				<p className="text-center text-xs text-slate-400 pt-2">
					Already have an account?{' '}
					<Link to={'/login'} className="font-semibold text-red-400 hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	)
}

export default Register
