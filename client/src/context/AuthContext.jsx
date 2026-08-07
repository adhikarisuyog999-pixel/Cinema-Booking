import axios from 'axios'
import { createContext, useEffect, useState } from 'react'

const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
	const [auth, setAuth] = useState(
		JSON.parse(localStorage.getItem('auth')) || {
			username: null,
			email: null,
			role: null,
			token: null
		}
	) //{username, email, role, token}

	const getUser = async (currentToken) => {
		try {
			const tokenToUse = currentToken || auth.token
			if (!tokenToUse) return
			const response = await axios.get('/auth/me', {
				headers: {
					Authorization: `Bearer ${tokenToUse}`
				}
			})

			setAuth((prev) => {
				const updated = {
					...prev,
					username: response.data.data.username,
					email: response.data.data.email,
					role: response.data.data.role
				}
				localStorage.setItem('auth', JSON.stringify(updated))
				return updated
			})
		} catch (error) {
			console.error('Auth verification error:', error)
		}
	}

	useEffect(() => {
		if (auth.token) {
			getUser(auth.token)
		}
	}, [auth.token])

	const updateAuth = (newAuth) => {
		setAuth(newAuth)
		if (newAuth) {
			localStorage.setItem('auth', JSON.stringify(newAuth))
		} else {
			localStorage.removeItem('auth')
		}
	}

	return <AuthContext.Provider value={{ auth, setAuth: updateAuth }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthContextProvider }
