import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import Navbar from '../components/Navbar'

function BatchDetails() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const [batch, setBatch] = useState(null)
  const [activeTab, setActiveTab] = useState('lectures')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeVideoUrl, setActiveVideoUrl] = useState(null)
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    url: '',
    fileType: ''
  })
  const [editMaterial, setEditMaterial] = useState({
    id: '',
    title: '',
    description: '',
    url: '',
    fileType: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBatchDetails()
  }, [batchId])

  useEffect(() => {
    if (batch) {
      // Get materials from the current batch object based on active tab
      const tabKey = activeTab === 'assignments' ? 'assignment' : activeTab
      let materialsArray = batch[tabKey] || []
      
      // Transform the data to match the expected format for rendering
      if (tabKey === 'lectures') {
        materialsArray = materialsArray.map(lecture => ({
          id: lecture.id || `lecture-${Date.now()}-${Math.random()}`,
          title: lecture.lectureName,
          description: lecture.lectureDetail,
          url: lecture.isYTVideo ? `https://www.youtube.com/embed/${lecture.lectureLink}` : lecture.lectureLink,
          createdAt: lecture.dateTimeStamp,
          fileType: 'video',
          isYTVideo: lecture.isYTVideo
        }));
      } else if (tabKey === 'notes') {
        materialsArray = materialsArray.map(note => ({
          id: note.id || `note-${Date.now()}-${Math.random()}`,
          title: note.notesName,
          description: '',
          url: note.notesLink,
          createdAt: note.dateTimeStamp,
          fileType: 'pdf' // Assuming notes are PDFs
        }));
      } else if (tabKey === 'assignment') {
        materialsArray = materialsArray.map(assignment => ({
          id: assignment.id || `assignment-${Date.now()}-${Math.random()}`,
          title: assignment.assignmentName,
          description: '',
          url: assignment.assignmentLink,
          createdAt: assignment.dateTimeStamp,
          fileType: 'pdf' // Assuming assignments are PDFs
        }));
      }
      
      setMaterials(materialsArray)
      setLoading(false)
      // Reset active video when changing tabs
      setActiveVideoUrl(null)
    }
  }, [batch, activeTab])

  const fetchBatchDetails = async () => {
    setLoading(true)
    try {
      const batchDocRef = doc(db, 'batches', batchId)
      const batchSnapshot = await getDoc(batchDocRef)
      
      if (batchSnapshot.exists()) {
        const batchData = {
          id: batchSnapshot.id,
          ...batchSnapshot.data()
        }
        // Ensure all arrays exist
        batchData.lectures = batchData.lectures || []
        batchData.notes = batchData.notes || []
        batchData.assignment = batchData.assignment || []
        
        // For compatibility, map batch.title to batch.name if name is missing
        if (!batchData.name && batchData.title) {
          batchData.name = batchData.title
        }
        
        setBatch(batchData)
      } else {
        setError('Batch not found')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching batch details:', error)
      setError('Failed to load batch details')
    }
  }

  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!newMaterial.title.trim()) {
      setError('Title cannot be empty')
      return
    }
    
    try {
      // Get the appropriate field name for the current tab
      const fieldName = activeTab === 'assignments' ? 'assignment' : activeTab
      
      // Create a new material in the format expected by Firestore
      let newItem = {}
      
      // Format differs per material type
      if (fieldName === 'lectures') {
        // Check if it's a YouTube video
        const isYTVideo = newMaterial.url.includes('youtube.com') || newMaterial.url.includes('youtu.be')
        
        // Extract YouTube video ID if needed
        let videoId = newMaterial.url
        if (isYTVideo) {
          // Extract video ID from various YouTube URL formats
          if (newMaterial.url.includes('youtube.com/watch?v=')) {
            videoId = newMaterial.url.split('v=')[1].split('&')[0]
          } else if (newMaterial.url.includes('youtu.be/')) {
            videoId = newMaterial.url.split('youtu.be/')[1].split('?')[0]
          } else if (newMaterial.url.includes('youtube.com/embed/')) {
            videoId = newMaterial.url.split('embed/')[1].split('?')[0]
          }
        }
        
        newItem = {
          lectureName: newMaterial.title,
          lectureDetail: newMaterial.description,
          lectureLink: isYTVideo ? videoId : newMaterial.url,
          dateTimeStamp: new Date().toISOString().split('T')[0],
          isYTVideo: isYTVideo
        }
      } else if (fieldName === 'notes') {
        newItem = {
          notesName: newMaterial.title,
          notesLink: newMaterial.url,
          dateTimeStamp: new Date().toISOString().split('T')[0]
        }
      } else if (fieldName === 'assignment') {
        newItem = {
          assignmentName: newMaterial.title,
          assignmentLink: newMaterial.url,
          dateTimeStamp: new Date().toISOString().split('T')[0]
        }
      }
      
      // Get current array
      const currentArray = [...(batch[fieldName] || [])]
      
      // Add new item
      currentArray.push(newItem)
      
      // Update Firestore
      const batchRef = doc(db, 'batches', batchId)
      await updateDoc(batchRef, {
        [fieldName]: currentArray
      })
      
      // Update local state
      const updatedBatch = {
        ...batch,
        [fieldName]: currentArray
      }
      setBatch(updatedBatch)
      
      // Reset form
      setNewMaterial({ title: '', description: '', url: '', fileType: '' })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error(`Error adding ${activeTab}:`, error)
      setError(`Failed to add ${activeTab}`)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        // Get the appropriate field name for the current tab
        const fieldName = activeTab === 'assignments' ? 'assignment' : activeTab
        
        // Find the index of the material to delete
        const materialIndex = materials.findIndex(item => item.id === materialId)
        if (materialIndex === -1) {
          setError('Material not found')
          return
        }
        
        // Get the original array from the batch
        const originalArray = [...(batch[fieldName] || [])]
        
        // Remove the item at the same index
        originalArray.splice(materialIndex, 1)
        
        // Update Firestore
        const batchRef = doc(db, 'batches', batchId)
        await updateDoc(batchRef, {
          [fieldName]: originalArray
        })
        
        // Update local state
        const updatedBatch = {
          ...batch,
          [fieldName]: originalArray
        }
        setBatch(updatedBatch)
      } catch (error) {
        console.error(`Error deleting ${activeTab}:`, error)
        setError(`Failed to delete ${activeTab}`)
      }
    }
  }

  const handleEditModalOpen = (material) => {
    setEditMaterial({
      id: material.id,
      title: material.title,
      description: material.description || '',
      url: material.url || '',
      fileType: material.fileType || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateMaterial = async (e) => {
    e.preventDefault()
    if (!editMaterial.title.trim()) {
      setError('Title cannot be empty')
      return
    }
    
    try {
      // Get the appropriate field name for the current tab
      const fieldName = activeTab === 'assignments' ? 'assignment' : activeTab
      
      // Get the current material being edited
      const currentMaterial = materials.find(item => item.id === editMaterial.id)
      if (!currentMaterial) {
        setError('Material not found')
        return
      }
      
      // Find the original index in the array
      const originalIndex = materials.findIndex(item => item.id === editMaterial.id)
      if (originalIndex === -1) {
        setError('Material index not found')
        return
      }
      
      // Get the original material from the batch (before our transformation)
      const originalArray = [...(batch[fieldName] || [])]
      
      // Create updated item in the format expected by Firestore
      let updatedItem = {}
      
      // Format differs per material type
      if (fieldName === 'lectures') {
        // Check if it's a YouTube video
        const isYTVideo = editMaterial.url.includes('youtube.com') || editMaterial.url.includes('youtu.be')
        
        // Extract YouTube video ID if needed
        let videoId = editMaterial.url
        if (isYTVideo) {
          // Extract video ID from various YouTube URL formats
          if (editMaterial.url.includes('youtube.com/watch?v=')) {
            videoId = editMaterial.url.split('v=')[1].split('&')[0]
          } else if (editMaterial.url.includes('youtu.be/')) {
            videoId = editMaterial.url.split('youtu.be/')[1].split('?')[0]
          } else if (editMaterial.url.includes('youtube.com/embed/')) {
            videoId = editMaterial.url.split('embed/')[1].split('?')[0]
          }
        }
        
        updatedItem = {
          ...originalArray[originalIndex],
          lectureName: editMaterial.title,
          lectureDetail: editMaterial.description,
          lectureLink: isYTVideo ? videoId : editMaterial.url,
          isYTVideo: isYTVideo
        }
      } else if (fieldName === 'notes') {
        updatedItem = {
          ...originalArray[originalIndex],
          notesName: editMaterial.title,
          notesLink: editMaterial.url
        }
      } else if (fieldName === 'assignment') {
        updatedItem = {
          ...originalArray[originalIndex],
          assignmentName: editMaterial.title,
          assignmentLink: editMaterial.url
        }
      }
      
      // Create updated array
      const updatedArray = [...originalArray]
      updatedArray[originalIndex] = updatedItem
      
      // Update Firestore
      const batchRef = doc(db, 'batches', batchId)
      await updateDoc(batchRef, {
        [fieldName]: updatedArray
      })
      
      // Update local state
      const updatedBatch = {
        ...batch,
        [fieldName]: updatedArray
      }
      setBatch(updatedBatch)
      
      setIsEditModalOpen(false)
    } catch (error) {
      console.error(`Error updating ${activeTab}:`, error)
      setError(`Failed to update ${activeTab}`)
    }
  }

  const handlePlayVideo = (url, isYTVideo) => {
    // If it's already a YouTube embed URL, use it directly
    if (url.includes('youtube.com/embed/')) {
      setActiveVideoUrl(url)
    } 
    // If it's a YouTube video ID, convert to embed URL
    else if (isYTVideo) {
      setActiveVideoUrl(`https://www.youtube.com/embed/${url}`)
    } 
    // For direct video URLs, use as is
    else {
      setActiveVideoUrl(url)
    }
  }

  const handleDownload = async (material) => {
    try {
      // Open the URL in a new tab
      window.open(material.url, '_blank')
    } catch (error) {
      console.error('Error opening URL:', error)
    }
  }

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'doc':
      case 'docx':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'ppt':
      case 'pptx':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        )
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    try {
      const date = timestamp instanceof Date 
        ? timestamp 
        : new Date(typeof timestamp === 'object' && timestamp.seconds ? timestamp.seconds * 1000 : timestamp)
        
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const tabs = [
    { id: 'lectures', label: 'Lectures' },
    { id: 'notes', label: 'Notes' },
    { id: 'assignments', label: 'Assignments' }
  ]

  const renderMaterialsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }
    
    if (materials.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No {activeTab} found. Add your first one!</p>
        </div>
      )
    }

    if (activeTab === 'lectures') {
      return (
        <div className="space-y-4">
          {activeVideoUrl && (
            <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                <iframe 
                  src={activeVideoUrl} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
              <div className="bg-gray-900 text-white p-3">
                <h3 className="text-lg font-medium">
                  {materials.find(m => m.url === activeVideoUrl)?.title || 'Video Player'}
                </h3>
              </div>
            </div>
          )}
          
          {materials.map(material => (
            <div key={material.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-4">
                    <h3 className="font-bold text-lg text-gray-900">{material.title}</h3>
                    {material.description && (
                      <p className="text-gray-600 mt-2">{material.description}</p>
                    )}
                    {material.createdAt && (
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(material.createdAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handlePlayVideo(material.url, material.isYTVideo)}
                      className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Play Video"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditModalOpen(material)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    } else {
      // Notes and Assignments (show files with download buttons)
      return (
        <div className="space-y-4">
          {materials.map(material => (
            <div key={material.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-4">
                    <h3 className="font-bold text-lg text-gray-900">{material.title}</h3>
                    {material.description && (
                      <p className="text-gray-600 mt-2">{material.description}</p>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(material.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {material.url && (
                      <button
                        onClick={() => handleDownload(material)}
                        className="flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        title="Download File"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleEditModalOpen(material)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {material.fileType && (
                  <div className="mt-4 flex items-center">
                    <span className="text-xs uppercase tracking-wide font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                      {getFileIcon(material.fileType)}
                      <span className="ml-1">{material.fileType}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        
        {batch && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 flex items-center">
                {batch.imgUrl && (
                  <img 
                    src={batch.imgUrl} 
                    alt={batch.name} 
                    className="w-24 h-24 object-cover rounded-lg mr-6 shadow-sm"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{batch.name || batch.title}</h1>
                  <p className="text-gray-600 mt-2">{batch.description}</p>
                  <div className="flex flex-wrap items-center mt-3">
                    <div className="flex items-center mr-6 mb-2">
                      <span className="text-gray-900 font-bold text-xl">₹{batch.price}</span>
                      {batch.mrp > batch.price && (
                        <>
                          <span className="text-gray-500 text-sm line-through ml-2">₹{batch.mrp}</span>
                          <span className="text-green-500 text-sm font-bold ml-2 bg-green-100 px-2 py-0.5 rounded">
                            {Math.round(((batch.mrp - batch.price) / batch.mrp) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      {batch.startDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Starts: {formatDate(batch.startDate)}</span>
                        </div>
                      )}
                      
                      {batch.courseCompletionDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Ends: {formatDate(batch.courseCompletionDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } flex-1 py-4 px-6 font-medium text-sm transition-colors duration-200`}
              >
                {tab.id === 'lectures' && (
                  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {tab.id === 'notes' && (
                  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {tab.id === 'assignments' && (
                  <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                  {batch ? batch[tab.id === 'assignments' ? 'assignment' : tab.id]?.length || 0 : 0}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">
              {materials.length} {materials.length === 1 ? 'item' : 'items'}
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="btn-primary flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
          </button>
        </div>
        
        {renderMaterialsList()}
      </div>
      
      {/* Add Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
            </h2>
            <form onSubmit={handleAddMaterial}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="input w-full"
                  placeholder="Enter title"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  className="input w-full"
                  placeholder="Enter description"
                  rows="3"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="url" className="block text-gray-700 text-sm font-medium mb-2">
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  className="input w-full"
                  placeholder={activeTab === 'lectures' ? "Enter video URL" : "Enter file URL"}
                  value={newMaterial.url}
                  onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                />
              </div>

              {activeTab !== 'lectures' && (
                <div className="mb-6">
                  <label htmlFor="fileType" className="block text-gray-700 text-sm font-medium mb-2">
                    File Type
                  </label>
                  <select
                    id="fileType"
                    className="input w-full"
                    value={newMaterial.fileType}
                    onChange={(e) => setNewMaterial({...newMaterial, fileType: e.target.value})}
                  >
                    <option value="">Select File Type</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC/DOCX</option>
                    <option value="xls">XLS/XLSX</option>
                    <option value="ppt">PPT/PPTX</option>
                    <option value="jpg">Image (JPG/PNG)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
              
              {activeTab === 'lectures' && (
                <input 
                  type="hidden" 
                  name="fileType" 
                  value="video" 
                  onChange={() => setNewMaterial({...newMaterial, fileType: 'video'})}
                />
              )}
              
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Material Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Edit {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
            </h2>
            <form onSubmit={handleUpdateMaterial}>
              <div className="mb-4">
                <label htmlFor="edit-title" className="block text-gray-700 text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className="input w-full"
                  placeholder="Enter title"
                  value={editMaterial.title}
                  onChange={(e) => setEditMaterial({...editMaterial, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-description" className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  className="input w-full"
                  placeholder="Enter description"
                  rows="3"
                  value={editMaterial.description}
                  onChange={(e) => setEditMaterial({...editMaterial, description: e.target.value})}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-url" className="block text-gray-700 text-sm font-medium mb-2">
                  URL
                </label>
                <input
                  id="edit-url"
                  type="url"
                  className="input w-full"
                  placeholder={activeTab === 'lectures' ? "Enter video URL" : "Enter file URL"}
                  value={editMaterial.url}
                  onChange={(e) => setEditMaterial({...editMaterial, url: e.target.value})}
                />
              </div>

              {activeTab !== 'lectures' && (
                <div className="mb-6">
                  <label htmlFor="edit-fileType" className="block text-gray-700 text-sm font-medium mb-2">
                    File Type
                  </label>
                  <select
                    id="edit-fileType"
                    className="input w-full"
                    value={editMaterial.fileType}
                    onChange={(e) => setEditMaterial({...editMaterial, fileType: e.target.value})}
                  >
                    <option value="">Select File Type</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC/DOCX</option>
                    <option value="xls">XLS/XLSX</option>
                    <option value="ppt">PPT/PPTX</option>
                    <option value="jpg">Image (JPG/PNG)</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchDetails 