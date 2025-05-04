import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white bg-opacity-90 backdrop-blur-sm shadow-md sticky top-0 z-10">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/paatthya_app_logo.png" 
                alt="Paatthya" 
                className="h-9 w-9 mr-2"
              />
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Paatthya</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  isActive('/dashboard') 
                    ? 'border-indigo-500 text-indigo-700 font-semibold' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Dashboard
              </Link>
              <Link
                to="/notices"
                className={`${
                  isActive('/notices')
                    ? 'border-indigo-500 text-indigo-700 font-semibold' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                Notices
              </Link>
              <Link
                to="/about"
                className={`${
                  isActive('/about')
                    ? 'border-indigo-500 text-indigo-700 font-semibold' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                About
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={`${
              isActive('/dashboard') 
                ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 font-medium' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/notices"
            className={`${
              isActive('/notices') 
                ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 font-medium' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMenuOpen(false)}
          >
            Notices
          </Link>
          <Link
            to="/about"
            className={`${
              isActive('/about') 
                ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-500 text-indigo-700 font-medium' 
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="mt-3 space-y-1">
            <button
              onClick={() => {
                handleLogout()
                setIsMenuOpen(false)
              }}
              className="flex items-center w-full pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 