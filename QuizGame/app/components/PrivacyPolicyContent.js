'use client';

import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollY = window.scrollY;
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });
      
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle smooth scrolling for anchor links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        behavior: 'smooth',
        top: element.offsetTop - 80
      });
      setIsMenuOpen(false); // Close mobile menu after click
    }
  };

  // Define sections for reusability
  const sections = [
    { id: 'information-we-collect', title: t?.privacyPolicy?.section1?.title || "Information We Collect" },
    { id: 'how-we-use-information', title: t?.privacyPolicy?.section2?.title || "How We Use Your Information" },
    { id: 'sharing-information', title: t?.privacyPolicy?.section3?.title || "Sharing Your Information" },
    { id: 'your-choices', title: t?.privacyPolicy?.section4?.title || "Your Choices" },
    { id: 'data-security', title: t?.privacyPolicy?.section5?.title || "Data Security" },
    { id: 'policy-changes', title: t?.privacyPolicy?.section6?.title || "Changes to This Policy" },
    { id: 'contact-us', title: t?.privacyPolicy?.section7?.title || "Contact Us" }
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 relative">
      {/* Structured data for SEO */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Privacy policy for our quiz platform",
            "publisher": {
              "@type": "Organization",
              "name": "GetItRight Quiz"
            },
            "dateModified": "2025-04-15"
          })
        }} 
      />
      
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-bold tracking-wider mb-1">LEGAL</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t?.privacyPolicy?.lastUpdated || "Last Updated: April 15, 2025"}
          </p>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          aria-label="Toggle table of contents"
          className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 flex items-center transition-all duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span>Table of Contents</span>
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> : 
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            }
          </svg>
        </button>
      </div>
      
      {/* Mobile Table of Contents */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 animate-fade-in-down shadow-lg">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white text-base border-b pb-2 border-gray-200 dark:border-gray-600">Table of Contents</h3>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button 
                  onClick={() => scrollToSection(section.id)} 
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                    activeSection === section.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <main id="main-content" aria-label="Privacy Policy content">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-3/4 space-y-10 text-gray-700 dark:text-gray-300">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">
                {t?.privacyPolicy?.intro || 
                  "This Privacy Policy describes how we collect, use, and share your personal information when you use our quiz platform."}
              </p>
            </div>
        
          <section id="information-we-collect" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
                  {t?.privacyPolicy?.section1?.title || "Information We Collect"}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="leading-relaxed">
                    {t?.privacyPolicy?.section1?.content || 
                      "We collect information you provide directly to us when you create an account, complete a quiz, create content, or communicate with us. This may include your name, email address, profile information, and quiz results."}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section id="how-we-use-information" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
                  {t?.privacyPolicy?.section2?.title || "How We Use Your Information"}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="leading-relaxed mb-4">
                    {t?.privacyPolicy?.section2?.content || 
                      "We use the information we collect to:"}
                  </p>
                  <ul className="list-disc space-y-2 ml-6">
                    <li className="leading-relaxed">{t?.privacyPolicy?.section2?.item1 || "Provide, maintain, and improve our services"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section2?.item2 || "Process and complete quiz-taking and creation"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section2?.item3 || "Send you technical notices, updates, and administrative messages"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section2?.item4 || "Respond to your comments, questions, and requests"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section2?.item5 || "Provide personalized content and recommendations"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          <section id="sharing-information" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
                  {t?.privacyPolicy?.section3?.title || "Sharing Your Information"}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="leading-relaxed mb-4">
                    {t?.privacyPolicy?.section3?.content || 
                      "We may share your information with:"}
                  </p>
                  <ul className="list-disc space-y-2 ml-6">
                    <li className="leading-relaxed">{t?.privacyPolicy?.section3?.item1 || "Service providers who perform services on our behalf"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section3?.item2 || "Other users, when you share public quizzes or results"}</li>
                    <li className="leading-relaxed">{t?.privacyPolicy?.section3?.item3 || "Law enforcement or other parties when required by law"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
          
          <section id="your-choices" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
                  {t?.privacyPolicy?.section4?.title || "Your Choices"}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="leading-relaxed">
                    {t?.privacyPolicy?.section4?.content || 
                      "You can access and update certain information through your account settings. You may also set your browser to block cookies, although doing so may affect certain features of our service."}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section id="data-security" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
              {t?.privacyPolicy?.section5?.title || "Data Security"}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="leading-relaxed">
                {t?.privacyPolicy?.section5?.content || 
                  "We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access."}
              </p>
            </div>
          </section>
          
          <section id="policy-changes" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
              {t?.privacyPolicy?.section6?.title || "Changes to This Policy"}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="leading-relaxed">
                {t?.privacyPolicy?.section6?.content || 
                  "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page."}
              </p>
            </div>
          </section>
          
          <section id="contact-us" className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-2">
              {t?.privacyPolicy?.section7?.title || "Contact Us"}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="leading-relaxed">
                {t?.privacyPolicy?.section7?.content || 
                  "If you have any questions about this Privacy Policy, please contact us at privacy@getitright.quiz."}
              </p>
            </div>
          </section>
          
          {/* Back to Top Button */}
          <div className="flex justify-center mt-8 md:hidden">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
              aria-label="Back to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Table of contents - desktop */}
        <div className="hidden lg:block sticky top-32 self-start ml-8 w-1/4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">On this page</h3>
            </div>
            <div className="relative pl-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500">
              <ul className="space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a 
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(section.id);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 ${
                        activeSection === section.id 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${
                        activeSection === section.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Print Version Link */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => window.print()} 
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print version
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>
      
      {/* Print and Animation Styles */}
      <style jsx global>{`
        @media print {
          body { 
            font-size: 12pt;
            background: white;
            color: black;
          }
          nav, header, footer, button, .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          h1, h2 {
            page-break-after: avoid;
          }
          p, li {
            page-break-inside: avoid;
          }
          section {
            page-break-inside: avoid;
            margin-bottom: 1cm;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}