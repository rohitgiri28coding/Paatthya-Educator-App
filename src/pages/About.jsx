import React from 'react'
import Navbar from '../components/Navbar'

function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="text-center py-10">
            <img
              src="/paatthya_app_logo.png"
              alt="Paatthya Logo"
              className="mx-auto h-24 w-24 mb-6"
            />
            <h1 className="text-3xl font-bold text-gray-900">Paatthya Educator App</h1>
            <p className="mt-2 text-gray-600">A comprehensive coaching institute management platform</p>
          </div>
          
          <div className="px-6 py-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Paatthya</h2>
            <p className="text-gray-700 mb-6">
              Paatthya is a complete educational management solution designed to help coaching institutes 
              streamline their operations. Our platform offers a comprehensive set of tools for managing 
              batches, lectures, assignments, study materials, and communications with students.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Batch management with course details and pricing</li>
              <li>Lecture organization with video playback capabilities</li>
              <li>Assignment distribution and tracking</li>
              <li>Study notes management and distribution</li>
              <li>Notice board for important announcements</li>
              <li>Messaging system for direct communication</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Technology Stack</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
              <li>Frontend: React.js with Tailwind CSS</li>
              <li>Backend: Firebase Firestore</li>
              <li>Authentication: Firebase Authentication</li>
              <li>File Storage: Firebase Storage</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contact</h3>
            <p className="text-gray-700">
              For support or inquiries, please contact us at:
              <a href="mailto:support@paatthya.com" className="text-blue-600 ml-1 hover:underline">
                support@paatthya.com
              </a>
            </p>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Paatthya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

export default About 