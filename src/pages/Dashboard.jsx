import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import Navbar from '../components/Navbar'

function Dashboard() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newBatch, setNewBatch] = useState({
    title: '',
    startDate: '',
    courseCompletionDate: '',
    imgUrl: '',
    price: '',
    mrp: '',
    description: '',
    limitedTimeDeal: false
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const batchesCollection = collection(db, 'batches')
      const batchesSnapshot = await getDocs(batchesCollection)
      const batchesList = batchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBatches(batchesList)
    } catch (error) {
      console.error('Error fetching batches:', error)
      setError('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBatch = async (e) => {
    e.preventDefault()
    if (!newBatch.title.trim()) {
      setError('Batch title cannot be empty')
      return
    }
    
    try {
      const batchesCollection = collection(db, 'batches')
      const batchData = {
        title: newBatch.title.trim(),
        startDate: newBatch.startDate,
        courseCompletionDate: newBatch.courseCompletionDate,
        imgUrl: newBatch.imgUrl.trim(),
        price: parseFloat(newBatch.price) || 0,
        mrp: parseFloat(newBatch.mrp) || 0,
        description: newBatch.description,
        limitedTimeDeal: newBatch.limitedTimeDeal,
        lectures: [],
        notes: [],
        assignment: [], // Note: Using 'assignment' to match Kotlin class field
        createdAt: new Date().toISOString()
      }
      
      await addDoc(batchesCollection, batchData)
      setNewBatch({
        title: '',
        startDate: '',
        courseCompletionDate: '',
        imgUrl: '',
        price: '',
        mrp: '',
        description: '',
        limitedTimeDeal: false
      })
      setIsAddModalOpen(false)
      fetchBatches()
    } catch (error) {
      console.error('Error adding batch:', error)
      setError('Failed to add batch')
    }
  }

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await deleteDoc(doc(db, 'batches', batchId))
        fetchBatches()
      } catch (error) {
        console.error('Error deleting batch:', error)
        setError('Failed to delete batch')
      }
    }
  }

  const handleViewBatch = (batchId) => {
    navigate(`/batch/${batchId}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Batches</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn btn-primary"
          >
            Add New Batch
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No batches found. Create your first batch!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map(batch => (
              <div key={batch.id} className="bg-white shadow rounded-lg overflow-hidden">
                {batch.imgUrl && (
                  <div className="relative">
                    <img 
                      src={batch.imgUrl} 
                      alt={batch.title || batch.name} 
                      className="w-full h-48 object-cover"
                    />
                    {(batch.limitedTimeDeal || batch.isLimitedDeal) && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Limited Time Deal
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-bold text-xl mb-2">{batch.title || batch.name}</h2>
                  
                  {batch.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {batch.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col space-y-1 mb-4 text-sm text-gray-600">
                    {batch.startDate && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Start:</span> 
                        {formatDate(batch.startDate)}
                      </div>
                    )}
                    {batch.courseCompletionDate && (
                      <div className="flex items-center">
                        <span className="font-medium mr-1">End:</span> 
                        {formatDate(batch.courseCompletionDate)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-gray-900 font-bold text-lg">₹{batch.price}</span>
                    {batch.mrp > batch.price && (
                      <>
                        <span className="text-gray-500 text-sm line-through ml-2">₹{batch.mrp}</span>
                        <span className="text-green-500 text-sm ml-2">
                          {Math.round(((batch.mrp - batch.price) / batch.mrp) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => handleViewBatch(batch.id)}
                      className="btn btn-primary text-sm"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDeleteBatch(batch.id)}
                      className="btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Batch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Batch</h2>
            <form onSubmit={handleAddBatch}>
              <div className="mb-4">
                <label htmlFor="batchTitle" className="block text-gray-700 text-sm font-medium mb-2">
                  Batch Title*
                </label>
                <input
                  id="batchTitle"
                  type="text"
                  className="input w-full"
                  placeholder="Enter batch title"
                  value={newBatch.title}
                  onChange={(e) => setNewBatch({...newBatch, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-gray-700 text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="input w-full"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({...newBatch, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-gray-700 text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    className="input w-full"
                    value={newBatch.courseCompletionDate}
                    onChange={(e) => setNewBatch({...newBatch, courseCompletionDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="imgUrl" className="block text-gray-700 text-sm font-medium mb-2">
                  Image URL
                </label>
                <input
                  id="imgUrl"
                  type="url"
                  className="input w-full"
                  placeholder="Enter image URL"
                  value={newBatch.imgUrl}
                  onChange={(e) => setNewBatch({...newBatch, imgUrl: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="price" className="block text-gray-700 text-sm font-medium mb-2">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input w-full"
                    placeholder="Enter price"
                    value={newBatch.price}
                    onChange={(e) => setNewBatch({...newBatch, price: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="mrp" className="block text-gray-700 text-sm font-medium mb-2">
                    MRP (₹)
                  </label>
                  <input
                    id="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input w-full"
                    placeholder="Enter MRP"
                    value={newBatch.mrp}
                    onChange={(e) => setNewBatch({...newBatch, mrp: e.target.value})}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  className="input w-full"
                  rows="3"
                  placeholder="Enter batch description"
                  value={newBatch.description}
                  onChange={(e) => setNewBatch({...newBatch, description: e.target.value})}
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={newBatch.limitedTimeDeal}
                    onChange={(e) => setNewBatch({...newBatch, limitedTimeDeal: e.target.checked})}
                  />
                  <span className="ml-2 text-gray-700">Limited Time Deal</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard 