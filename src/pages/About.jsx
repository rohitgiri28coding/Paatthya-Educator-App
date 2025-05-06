import React from 'react'

function About() {
  return (
    <div className="layout">
      <div className="container py-8">
        <h1 className="heading-primary mb-8">About Paatthya</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <h2 className="heading-secondary mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To provide quality education that empowers students to achieve their full potential
              through personalized learning experiences and exceptional teaching.
            </p>
          </div>
          
          <div className="card">
            <h2 className="heading-secondary mb-4">Our Vision</h2>
            <p className="text-gray-700">
              To be the leading educational platform that transforms the way students learn,
              making quality education accessible to all.
            </p>
          </div>
          
          <div className="card">
            <h2 className="heading-secondary mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Excellence in teaching</li>
              <li>Student-centered approach</li>
              <li>Innovation and continuous improvement</li>
              <li>Integrity and transparency</li>
              <li>Inclusivity and diversity</li>
            </ul>
          </div>
        </div>
        
        <div className="card mt-8">
          <h2 className="heading-secondary mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions or feedback, please don't hesitate to reach out to us.
          </p>
          <div className="mt-4 space-y-2">
            <p className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@paatthya.com
            </p>
            <p className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 9876543210
            </p>
            <p className="flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              123 Education Street, Learning City, India
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About 