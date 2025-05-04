import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase/firebase'
import Navbar from '../components/Navbar'

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
      await addDoc(messagesCollection, {
        text: newMessage.trim(),
        sender: auth.currentUser?.email || 'Anonymous User',
        senderUid: auth.currentUser?.uid || 'anonymous',
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
        createdBy: auth.currentUser?.email || 'Anonymous User',
        creatorUid: auth.currentUser?.uid || 'anonymous',
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
                <h2 className="font-bold text-xl mb-2">{notice.title}</h2>
                
                <p className="text-gray-700 mb-4">
                  {notice.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(notice.timestamp)}</span>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Communication Hub</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'notices'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Notices
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Messages
            </button>

            {activeTab === 'notices' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Create Notice
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {renderContent()}
      </div>

      {/* Create Notice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create New Notice</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateNotice}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Notice title"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-lg"
                    rows="4"
                    placeholder="Notice description"
                    value={newNotice.description}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, description: e.target.value }))}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileUrl">
                    File URL (Optional)
                  </label>
                  <input
                    id="fileUrl"
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    placeholder="https://example.com/file.pdf"
                    value={newNotice.fileUrl}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, fileUrl: e.target.value }))}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fileType">
                    File Type (Optional)
                  </label>
                  <select
                    id="fileType"
                    className="w-full p-2 border rounded-lg"
                    value={newNotice.fileType}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, fileType: e.target.value }))}
                  >
                    <option value="">Select file type</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC/DOCX</option>
                    <option value="xls">XLS/XLSX</option>
                    <option value="ppt">PPT/PPTX</option>
                    <option value="jpg">JPG/JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 border rounded-lg"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Notice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notices 