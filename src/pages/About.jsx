import React from 'react'
import Navbar from '../components/Navbar'

function About() {
  return (
    <div className="layout">
      <Navbar />
      
      <div className="container py-8">
        <div className="card overflow-hidden">
          <div className="text-center py-10">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 p-1 mb-6">
              <img
                src="/paatthya_app_logo.png"
                alt="Paatthya Logo"
                className="w-full h-full rounded-full"
              />
            </div>
            <h1 className="heading-primary mb-2">Paatthya Educator App</h1>
            <p className="text-gray-600">A comprehensive coaching institute management platform</p>
          </div>
          
          <div className="px-6 py-8 border-t border-gray-200">
            <h2 className="heading-secondary mb-4">About Paatthya</h2>
            <p className="text-gray-700 mb-6">
              Paatthya is a complete educational management solution designed to help coaching institutes 
              streamline their operations. Our platform offers a comprehensive set of tools for managing 
              batches, lectures, assignments, study materials, and communications with students.
            </p>
            
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Batch management with course details and pricing</li>
              <li>Lecture organization with video playback capabilities</li>
              <li>Assignment distribution and tracking</li>
              <li>Study notes management and distribution</li>
              <li>Notice board for important announcements</li>
              <li>Messaging system for direct communication</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">Technology Stack</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Frontend: React.js with Tailwind CSS</li>
              <li>Backend: Firebase Firestore</li>
              <li>Authentication: Firebase Authentication</li>
              <li>File Storage: Firebase Storage</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">Contact</h3>
            <p className="text-gray-700">
              For support or inquiries, please contact us at:
              <a href="mailto:support@paatthya.com" className="text-indigo-600 ml-1 hover:text-indigo-800 transition-colors duration-200">
                support@paatthya.com
              </a>
            </p>
          </div>
          
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Paatthya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

export default About 