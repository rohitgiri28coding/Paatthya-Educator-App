import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, 
  doc, deleteDoc, updateDoc, where } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'

function Notices() {
  const [notices, setNotices] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notices')
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: ''
  })
  const [adminData, setAdminData] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)

  useEffect(() => {
    if (activeTab === 'notices') {
      fetchNotices()
    } else {
      fetchMessages()
    }
  }, [activeTab])

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Fetch admin data upon component mount
    fetchAdminData()
  }, [])

  const fetchAdminData = () => {
    try {
      // Get admin data from session storage
      const adminDataString = sessionStorage.getItem('currentAdmin')
      
      if (adminDataString) {
        const admin = JSON.parse(adminDataString)
        setAdminData(admin)
        console.log('Admin data loaded from session:', admin)
      } else {
        console.log('No admin data found in session storage')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    }
  }

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const noticesCollection = collection(db, 'notices')
      const noticesQuery = query(noticesCollection, orderBy('timestamp', 'desc'))
      const noticesSnapshot = await getDocs(noticesQuery)
      
      const noticesList = noticesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setNotices(noticesList)
    } catch (error) {
      console.error('Error fetching notices:', error)
      setError('Failed to load notices')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const messagesCollection = collection(db, 'messages')
      const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'))
      const messagesSnapshot = await getDocs(messagesQuery)
      
      const messagesList = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setMessages(messagesList)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    try {
      const messagesCollection = collection(db, 'messages')
      
      // Get admin data from state (set from session storage)
      await addDoc(messagesCollection, {
        text: newMessage.trim(),
        sender: adminData?.name || 'Anonymous User',
        senderUid: adminData?.id || 'anonymous',
        timestamp: serverTimestamp()
      })
      
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    }
  }

  const handleCreateNotice = async (e) => {
    e.preventDefault()
    
    if (!newNotice.title.trim() || !newNotice.description.trim()) {
      setError('Title and description are required')
      return
    }
    
    try {
      const noticesCollection = collection(db, 'notices')
      await addDoc(noticesCollection, {
        ...newNotice,
        createdBy: adminData?.name || 'Anonymous User',
        creatorUid: adminData?.id || 'anonymous',
        timestamp: serverTimestamp()
      })
      
      setNewNotice({
        title: '',
        description: '',
        fileUrl: '',
        fileType: ''
      })
      setIsCreateModalOpen(false)
      fetchNotices()
    } catch (error) {
      console.error('Error creating notice:', error)
      setError('Failed to create notice')
    }
  }

  const handleEditModalOpen = (notice) => {
    setEditingNotice(notice)
    setIsEditModalOpen(true)
  }

  const handleUpdateNotice = async (e) => {
    e.preventDefault()
    
    if (!editingNotice || !editingNotice.title.trim() || !editingNotice.description.trim()) {
      setError('Title and description are required')
      return
    }
    
    try {
      const noticeRef = doc(db, 'notices', editingNotice.id)
      await updateDoc(noticeRef, {
        title: editingNotice.title,
        description: editingNotice.description,
        fileUrl: editingNotice.fileUrl || '',
        fileType: editingNotice.fileType || '',
        // Don't update timestamp, createdBy, or creatorUid
      })
      
      setIsEditModalOpen(false)
      setEditingNotice(null)
      fetchNotices()
    } catch (error) {
      console.error('Error updating notice:', error)
      setError('Failed to update notice')
    }
  }

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        const noticeRef = doc(db, 'notices', noticeId)
        await deleteDoc(noticeRef)
        fetchNotices()
      } catch (error) {
        console.error('Error deleting notice:', error)
        setError('Failed to delete notice')
      }
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    if (activeTab === 'notices') {
      return notices.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No notices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div key={notice.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between">
                  <h2 className="font-bold text-xl mb-2">{notice.title}</h2>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditModalOpen(notice)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      title="Edit Notice"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      title="Delete Notice"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {notice.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(notice.timestamp)}</span>
                  <span className="mx-2">•</span>
                  <span>By: {notice.createdBy}</span>
                </div>
                
                {notice.fileUrl && (
                  <div className="mt-4">
                    <a
                      href={notice.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium 
                        ${notice.isDownloaded 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                    >
                      <span className="mr-2">
                        {getFileIcon(notice.fileType)}
                      </span>
                      {notice.isDownloaded ? 'Downloaded' : 'Download'}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    } else {
      // Messages tab
      return (
        <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[70vh]">
          <div className="p-4 bg-blue-600 text-white">
            <h2 className="font-bold text-xl">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(message => {
                const isCurrentUser = message.senderUid === (auth.currentUser?.uid || 'anonymous')
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[75%] p-3 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-gray-200 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold mb-1">
                          {message.sender}
                        </p>
                      )}
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newMessage.trim()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="layout">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="heading-primary">Communication Center</h1>
          {activeTab === 'notices' && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Notice
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex -mb-px">
            <button
              className={`mr-8 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'notices'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('notices')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Notices
              </div>
            </button>
            <button
              className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Messages
              </div>
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
      
      {/* Create Notice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Create New Notice</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateNotice}>
              <div className="mb-4">
                <label htmlFor="noticeTitle" className="block text-gray-700 text-sm font-medium mb-2">
                  Title*
                </label>
                <input
                  id="noticeTitle"
                  type="text"
                  className="input w-full"
                  placeholder="Enter notice title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="noticeDescription" className="block text-gray-700 text-sm font-medium mb-2">
                  Description*
                </label>
                <textarea
                  id="noticeDescription"
                  className="input w-full"
                  rows="4"
                  placeholder="Enter notice description"
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({...newNotice, description: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="noticeFileUrl" className="block text-gray-700 text-sm font-medium mb-2">
                  File URL (optional)
                </label>
                <input
                  id="noticeFileUrl"
                  type="text"
                  className="input w-full"
                  placeholder="Enter URL for attachment"
                  value={newNotice.fileUrl}
                  onChange={(e) => setNewNotice({...newNotice, fileUrl: e.target.value})}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="noticeFileType" className="block text-gray-700 text-sm font-medium mb-2">
                  File Type (optional)
                </label>
                <select
                  id="noticeFileType"
                  className="input w-full"
                  value={newNotice.fileType}
                  onChange={(e) => setNewNotice({...newNotice, fileType: e.target.value})}
                >
                  <option value="">Select file type</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Word Document</option>
                  <option value="xls">Excel Spreadsheet</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="jpg">Image</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {isEditModalOpen && editingNotice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Edit Notice</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateNotice}>
              <div className="mb-4">
                <label htmlFor="editNoticeTitle" className="block text-gray-700 text-sm font-medium mb-2">
                  Title*
                </label>
                <input
                  id="editNoticeTitle"
                  type="text"
                  className="input w-full"
                  placeholder="Enter notice title"
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({...editingNotice, title: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="editNoticeDescription" className="block text-gray-700 text-sm font-medium mb-2">
                  Description*
                </label>
                <textarea
                  id="editNoticeDescription"
                  className="input w-full"
                  rows="4"
                  placeholder="Enter notice description"
                  value={editingNotice.description}
                  onChange={(e) => setEditingNotice({...editingNotice, description: e.target.value})}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="editNoticeFileUrl" className="block text-gray-700 text-sm font-medium mb-2">
                  File URL (optional)
                </label>
                <input
                  id="editNoticeFileUrl"
                  type="text"
                  className="input w-full"
                  placeholder="Enter URL for attachment"
                  value={editingNotice.fileUrl || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, fileUrl: e.target.value})}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="editNoticeFileType" className="block text-gray-700 text-sm font-medium mb-2">
                  File Type (optional)
                </label>
                <select
                  id="editNoticeFileType"
                  className="input w-full"
                  value={editingNotice.fileType || ''}
                  onChange={(e) => setEditingNotice({...editingNotice, fileType: e.target.value})}
                >
                  <option value="">Select file type</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Word Document</option>
                  <option value="xls">Excel Spreadsheet</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="jpg">Image</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notices 