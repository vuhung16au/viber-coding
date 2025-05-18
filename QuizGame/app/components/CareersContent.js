'use client';

import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function CareersContent() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Positions' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'design', label: 'Design' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'support', label: 'Customer Support' }
  ];
  
  const positions = [
    {
      id: 'frontend-dev',
      title: t?.careers?.position1?.title || "Senior Frontend Developer",
      location: t?.careers?.position1?.location || "Remote / San Francisco, CA",
      department: 'engineering',
      description: t?.careers?.position1?.description || 
        "We're looking for an experienced frontend developer with expertise in React, Next.js, and modern web technologies to help us build engaging quiz experiences.",
      responsibilities: [
        "Develop responsive and accessible user interfaces",
        "Collaborate with designers and backend engineers",
        "Optimize application for maximum speed and scalability",
        "Maintain code quality and organization"
      ],
      requirements: [
        "3+ years of experience with React and modern JavaScript",
        "Experience with Next.js and server-side rendering",
        "Strong understanding of web performance optimization",
        "Knowledge of HTML5, CSS3, and modern CSS frameworks"
      ]
    },
    {
      id: 'backend-eng',
      title: t?.careers?.position2?.title || "Backend Engineer",
      location: t?.careers?.position2?.location || "Remote / San Francisco, CA",
      department: 'engineering',
      description: t?.careers?.position2?.description || 
        "Join our backend team to develop scalable APIs and services that power our quiz platform. Experience with Node.js, Firebase, and cloud infrastructure required.",
      responsibilities: [
        "Design and implement API endpoints and services",
        "Work with database schemas and data modeling",
        "Implement authentication and authorization systems",
        "Ensure security, performance and reliability of backend systems"
      ],
      requirements: [
        "3+ years of experience with Node.js/Express",
        "Experience with Firebase or similar cloud services",
        "Knowledge of database design and optimization",
        "Understanding of RESTful API design principles"
      ]
    },
    {
      id: 'ux-designer',
      title: t?.careers?.position3?.title || "UX/UI Designer",
      location: t?.careers?.position3?.location || "Remote / San Francisco, CA",
      department: 'design',
      description: t?.careers?.position3?.description || 
        "We're seeking a talented UX/UI Designer to create intuitive and engaging user experiences for our quiz platform.",
      responsibilities: [
        "Create wireframes, mockups, and prototypes",
        "Conduct user research and usability testing",
        "Collaborate with product managers and engineers",
        "Maintain and evolve our design system"
      ],
      requirements: [
        "3+ years of experience in UX/UI design",
        "Proficiency with design tools (Figma, Adobe XD)",
        "Experience designing for mobile and web applications",
        "Portfolio demonstrating strong visual design skills"
      ]
    }
  ];
  
  const filteredPositions = selectedCategory === 'all' 
    ? positions 
    : positions.filter(pos => pos.department === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <section className="mb-12">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
            {t?.careers?.description || 
              "We're on a mission to create the world's most engaging quiz platform. Join us in building innovative solutions that help people learn and have fun!"}
          </p>
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            {t?.careers?.whyJoinTitle || "Why Join Our Team?"}
          </h2>
          <ul className="grid md:grid-cols-2 gap-4 mt-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Remote-first culture with flexible working hours</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Competitive salary and equity packages</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Comprehensive health, dental, and vision insurance</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Professional development budget</span>
            </li>
          </ul>
        </div>
      </section>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t?.careers?.openingsTitle || "Current Openings"}
      </h2>
      
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      
      <div className="space-y-8">
        {filteredPositions.map((position) => (
          <div key={position.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  {position.title}
                </h3>
                <div className="flex items-center mt-2 sm:mt-0">
                  <svg className="h-5 w-5 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{position.location}</span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {position.description}
              </p>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Key Responsibilities:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {position.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Requirements:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {position.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 w-full sm:w-auto">
                {t?.careers?.applyButton || "Apply Now"}
              </button>
            </div>
          </div>
        ))}
        
        {filteredPositions.length === 0 && (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No open positions in this category at the moment.</p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center p-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {t?.careers?.noPositionTitle || "Don't See a Position for You?"}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
          {t?.careers?.noPositionText || "We're always looking for talented individuals to join our team. Send us your resume and tell us why you'd be a great fit!"}
        </p>
        <button className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t?.careers?.sendResumeButton || "Send Us Your Resume"}
        </button>
      </div>
    </div>
  );
}