import React, { useState, useEffect } from 'react';

const tocItems = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'account-responsibilities', label: 'Account Responsibilities' },
  { id: 'content-guidelines', label: 'Content Guidelines' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'user-content-license', label: 'User Content License' },
  { id: 'termination', label: 'Termination' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'limitation-liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'changes', label: 'Changes' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'contact-us', label: 'Contact Us' },
];

export default function TermsOfServiceTOC({ activeId, onNavigate }) {
  const [currentSection, setCurrentSection] = useState(activeId || 'introduction');
  
  // Observe sections when user scrolls to automatically highlight the current section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0
    };
    
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentSection(entry.target.id);
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    tocItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    
    return () => {
      // Cleanup observer on component unmount
      tocItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);
  
  return (
    <nav 
      aria-label="Table of Contents" 
      className="hidden md:block sticky top-20 w-64 mr-8 max-h-[calc(100vh-6rem)] self-start z-10 sticky-toc"
    >
      <div className="bg-secondary rounded-lg p-4 shadow overflow-y-auto max-h-[calc(100vh-6rem)] transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">On this page</h2>
        <ul className="space-y-2">
          {tocItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block px-2 py-1 rounded transition-colors text-sm font-medium ${
                  currentSection === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentSection(item.id);
                  if (onNavigate) onNavigate(item.id);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
