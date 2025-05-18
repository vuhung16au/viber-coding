import React, { useState } from 'react';

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
  return (
    <div className="md:hidden mb-4">
      <button
        className="btn-secondary w-full flex justify-between items-center"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="mobile-toc"
      >
        <span>On this page</span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul id="mobile-toc" className="bg-secondary rounded-lg mt-2 p-2 shadow space-y-1">
          {tocItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block px-2 py-1 rounded text-sm font-medium hover:bg-muted"
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
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
