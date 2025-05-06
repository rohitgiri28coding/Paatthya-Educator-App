import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase/firebase'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasAdmins, setHasAdmins] = useState(true)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    superAdmin: true
  })

  const navigate = useNavigate()

  useEffect(() => {
    // Check if there are any admins in the database
    checkForAdmins()
  }, [])

  const checkForAdmins = async () => {
    try {
      const adminRef = collection(db, "admin")
      const adminSnapshot = await getDocs(adminRef)
      
      if (adminSnapshot.empty) {
        console.log("No admins found in database")
        setHasAdmins(false)
      } else {
        console.log(`Found ${adminSnapshot.size} admins in database`)
        setHasAdmins(true)
      }
    } catch (error) {
      console.error("Error checking for admins:", error)
      setError("Error connecting to database: " + error.message)
    }
  }

  // Hashing function - same as used in admin setup
  function hashPassword(password) {
    var hash = 0, i, chr;
    if (password.length === 0) return hash;
    for (i = 0; i < password.length; i++) {
      chr = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setDebugInfo('')
    setSuccessMessage('')
    setLoading(true)
    
    try {
      // Hash the password for comparison
      const hashedPassword = hashPassword(password)
      
      // Query Firestore for the admin with matching email
      const adminRef = collection(db, "admin")
      const q = query(adminRef, where("email", "==", email))
      
      setDebugInfo(prev => prev + "Querying Firestore for email: " + email + "\n")
      
      const querySnapshot = await getDocs(q)
      
      setDebugInfo(prev => prev + "Query complete. Found documents: " + querySnapshot.size + "\n")
      
      // Check if we found a matching admin
      if (querySnapshot.empty) {
        throw new Error("Invalid email or password")
      }
      
      // Check password
      let validCredentials = false
      let adminData = null
      let adminId = null
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        setDebugInfo(prev => prev + "Found admin: " + doc.id + "\n")
        
        // Compare stored password hash with computed hash
        setDebugInfo(prev => prev + "Stored hash: " + data.password + "\n")
        setDebugInfo(prev => prev + "Computed hash: " + hashedPassword + "\n")
        
        if (data.password === hashedPassword) {
          validCredentials = true
          adminData = data
          adminId = doc.id
          setDebugInfo(prev => prev + "Password matched!\n")
        } else {
          setDebugInfo(prev => prev + "Password did not match\n")
        }
      })
      
      if (!validCredentials) {
        throw new Error("Invalid email or password")
      }
      
      // Store admin data in session storage for use throughout the app
      const adminToStore = {
        id: adminId,
        name: adminData.name,
        email: adminData.email,
        superAdmin: adminData.superAdmin === true
      }
      
      setDebugInfo(prev => prev + "Storing admin data: " + JSON.stringify(adminToStore) + "\n")
      
      sessionStorage.setItem('currentAdmin', JSON.stringify(adminToStore))
      
      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        setDebugInfo(prev => prev + "Calling onLoginSuccess callback\n")
        onLoginSuccess()
      }
      
      // Login successful
      setDebugInfo(prev => prev + "Login successful! Redirecting to dashboard...\n")
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError('Login failed: ' + error.message)
      console.error('Login error:', error)
      setDebugInfo(prev => prev + "Error: " + error.message + "\n")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)
    
    try {
      // Validate input
      if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
        throw new Error("All fields are required")
      }
      
      // Hash the password for storage
      const hashedPassword = hashPassword(newAdminData.password)
      
      // Create new admin document
      const adminRef = collection(db, "admin")
      const docRef = await addDoc(adminRef, {
        name: newAdminData.name,
        email: newAdminData.email,
        password: hashedPassword,
        superAdmin: newAdminData.superAdmin
      })
      
      console.log("Admin created with ID:", docRef.id)
      setSuccessMessage(`Admin account created for ${newAdminData.email}. You can now login.`)
      
      // Reset form
      setNewAdminData({
        name: '',
        email: '',
        password: '',
        superAdmin: true
      })
      
      // Update has admins state
      setHasAdmins(true)
      setShowCreateAccount(false)
    } catch (error) {
      setError('Failed to create admin: ' + error.message)
      console.error('Create admin error:', error)
    } finally {
      setLoading(false)
    }
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
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
            <p className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        )}
        
        {!hasAdmins && !showCreateAccount && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
            <p className="font-medium">No Admin Accounts Found</p>
            <p>There are no admin accounts in the database. You need to create one to continue.</p>
            <button 
              onClick={() => setShowCreateAccount(true)}
              className="mt-2 btn btn-primary text-sm"
            >
              Create Admin Account
            </button>
          </div>
        )}
        
        {showCreateAccount ? (
          <form onSubmit={handleCreateAdmin} className="space-y-6">
            <div>
              <label htmlFor="adminName" className="block text-gray-700 text-sm font-medium mb-2">
                Name
              </label>
              <input
                id="adminName"
                type="text"
                className="input w-full"
                placeholder="Enter admin name"
                value={newAdminData.name}
                onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label htmlFor="adminEmail" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="adminEmail"
                type="email"
                className="input w-full"
                placeholder="Enter admin email"
                value={newAdminData.email}
                onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label htmlFor="adminPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="adminPassword"
                type="password"
                className="input w-full"
                placeholder="Enter admin password"
                value={newAdminData.password}
                onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="superAdmin"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={newAdminData.superAdmin}
                onChange={(e) => setNewAdminData({...newAdminData, superAdmin: e.target.checked})}
              />
              <label htmlFor="superAdmin" className="ml-2 block text-sm text-gray-700">
                Super Admin (Can manage other admins)
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="btn btn-primary flex-1 justify-center"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                className="btn btn-secondary flex-1 justify-center"
                onClick={() => setShowCreateAccount(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
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
        )}
        
        {debugInfo && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto max-h-60">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login 