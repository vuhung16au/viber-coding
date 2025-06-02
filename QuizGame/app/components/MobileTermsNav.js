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

export default function MobileTermsNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('introduction');
  
  // Handle scroll event to show fixed navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Track current section for active state
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50px 0px -50% 0px',
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
    
    tocItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    
    return () => {
      tocItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);
  
  return (
    <div className={`md:hidden mb-4 sticky top-0 z-20 ${scrolled ? 'bg-background/95 backdrop-blur-sm shadow py-2' : ''}`}>
      <button
        className="btn-secondary w-full flex justify-between items-center"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="mobile-toc"
      >
        <span>On this page: {tocItems.find(item => item.id === currentSection)?.label}</span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul id="mobile-toc" className="bg-secondary rounded-lg mt-2 p-2 shadow space-y-1 max-h-[70vh] overflow-y-auto absolute left-0 right-0">
          {tocItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block px-2 py-1 rounded text-sm font-medium ${
                  currentSection === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentSection(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
