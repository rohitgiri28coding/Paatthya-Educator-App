import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/firebase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      setError('Invalid email or password')
      console.error('Login error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-primary mb-2">Paatthya</h1>
          <p className="text-gray-600">Coaching Admin Panel</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="font-medium">Login Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input w-full"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input w-full"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full flex justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={handleSkip}
            className="text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-200"
          >
            Skip Login (For Demo)
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login 