import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, where, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'

function AdminManagement() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    superAdmin: false
  })
  const [currentUser, setCurrentUser] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    checkCurrentUserRole()
  }, [])

  // Function to hash passwords the same way as in Login.jsx
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

  const checkCurrentUserRole = () => {
    setLoading(true)
    try {
      // Get admin data from session storage instead of querying Firestore
      const adminDataString = sessionStorage.getItem('currentAdmin')
      console.log("Admin data from session:", adminDataString)
      
      if (adminDataString) {
        const adminData = JSON.parse(adminDataString)
        console.log("Admin data parsed:", adminData)
        
        setCurrentUser(adminData)
        
        // Check if user is a superAdmin
        const isSuper = adminData.superAdmin === true
        console.log("Is super admin:", isSuper)
        setIsSuperAdmin(isSuper)
        
        // If user is a superAdmin, fetch all admins
        if (isSuper) {
          fetchAdmins()
        } else {
          setLoading(false)
        }
      } else {
        console.log("No admin data found in session storage")
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setError('Failed to verify your permissions')
      setLoading(false)
    }
  }

  const fetchAdmins = async () => {
    try {
      const adminsRef = collection(db, 'admin')
      const querySnapshot = await getDocs(adminsRef)
      
      const adminsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Don't include actual password hash in the UI
        password: '••••••••'
      }))
      
      setAdmins(adminsList)
    } catch (error) {
      console.error('Error fetching admins:', error)
      setError('Failed to load admin list')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      setError('All fields are required')
      return
    }
    
    try {
      // Hash the password
      const hashedPassword = hashPassword(newAdmin.password)
      
      // Add the new admin to Firestore
      const adminsRef = collection(db, 'admin')
      await addDoc(adminsRef, {
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim(),
        password: hashedPassword,
        superAdmin: newAdmin.superAdmin,
        createdAt: serverTimestamp()
      })
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        superAdmin: false
      })
      
      setIsAddModalOpen(false)
      // Refresh admin list
      fetchAdmins()
      
    } catch (error) {
      console.error('Error adding admin:', error)
      setError('Failed to add admin')
    }
  }

  // Render content based on user's role
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }
    
    if (!isSuperAdmin) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-8 rounded-md">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p>You don't have permission to access the admin management section. This area is only available to super administrators.</p>
        </div>
      )
    }
    
    return (
      <>
        {admins.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No admins found. Add your first admin!</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.superAdmin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Super Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="layout">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="heading-primary">Admin Management</h1>
          {isSuperAdmin && (
            <button
              type="button"
              className="btn btn-primary flex items-center"
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Admin
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {renderContent()}
        
        {/* Add Admin Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Add New Admin</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddAdmin}>
                <div className="mb-4">
                  <label htmlFor="adminName" className="block text-gray-700 text-sm font-medium mb-2">
                    Name*
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    className="input w-full"
                    placeholder="Enter admin name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="adminEmail" className="block text-gray-700 text-sm font-medium mb-2">
                    Email*
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    className="input w-full"
                    placeholder="Enter admin email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="adminPassword" className="block text-gray-700 text-sm font-medium mb-2">
                    Password*
                  </label>
                  <input
                    id="adminPassword"
                    type="password"
                    className="input w-full"
                    placeholder="Enter admin password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={newAdmin.superAdmin}
                      onChange={(e) => setNewAdmin({...newAdmin, superAdmin: e.target.checked})}
                    />
                    <span className="ml-2 text-gray-700">Super Admin</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminManagement 