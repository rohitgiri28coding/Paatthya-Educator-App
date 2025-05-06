import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebase'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BatchDetails from './pages/BatchDetails'
import Notices from './pages/Notices'
import About from './pages/About'
import AdminManagement from './pages/AdminManagement'

// Components
import Navbar from './components/Navbar'

function App() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in via session storage
    const checkAuth = () => {
      try {
        const adminData = sessionStorage.getItem('currentAdmin')
        console.log("App.jsx - Session data:", adminData ? "Found" : "Not found")
        
        if (adminData) {
          // Validate the data to make sure it's properly formatted
          const admin = JSON.parse(adminData)
          if (admin && admin.id && admin.email) {
            setIsAuthenticated(true)
            console.log("App.jsx - User is authenticated via session storage")
          } else {
            console.log("App.jsx - Invalid admin data in session storage")
            sessionStorage.removeItem('currentAdmin')
            setIsAuthenticated(false)
          }
        } else {
          console.log("App.jsx - No admin data in session storage")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("App.jsx - Error checking auth:", error)
        sessionStorage.removeItem('currentAdmin')
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    // Listen for auth state changes from Firebase (if applicable)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("App.jsx - Firebase auth state changed:", currentUser ? "Logged in" : "Logged out")
      // We still primarily rely on session storage, but this is a backup
      if (currentUser) {
        setIsAuthenticated(true)
      }
      checkAuth()
    })

    // Add event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'currentAdmin') {
        console.log("App.jsx - Session storage changed")
        checkAuth()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Initial check
    checkAuth()

    return () => {
      unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    console.log("App.jsx - Logging out")
    sessionStorage.removeItem('currentAdmin')
    setIsAuthenticated(false)
    navigate('/login')
  }

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      console.log("App.jsx - Access denied, redirecting to login")
      return <Navigate to="/login" replace state={{ from: location }} />
    }
    
    console.log("App.jsx - Access granted to protected route")
    return (
      <>
        <Navbar onLogout={handleLogout} />
        {children}
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
        } 
      />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/batch/:batchId" element={<ProtectedRoute><BatchDetails /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminManagement /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App 