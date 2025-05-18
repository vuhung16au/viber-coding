import React from 'react';

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
  return (
    <nav aria-label="Table of Contents" className="hidden md:block sticky top-24 w-64 mr-8">
      <div className="bg-secondary rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">On this page</h2>
        <ul className="space-y-2">
          {tocItems.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block px-2 py-1 rounded transition-colors text-sm font-medium ${activeId === item.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
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
