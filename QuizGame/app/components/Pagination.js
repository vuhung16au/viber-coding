'use client';

import { useEffect, useState } from 'react';

export default function Pagination({
  totalItems,
  itemsPerPage = 20,
  currentPage = 1,
  onPageChange,
  onItemsPerPageChange
}) {
  const [pageCount, setPageCount] = useState(1);
  
  // Calculate the total number of pages
  useEffect(() => {
    setPageCount(Math.max(1, Math.ceil(totalItems / itemsPerPage)));
  }, [totalItems, itemsPerPage]);
  
  // Options for items per page
  const itemsPerPageOptions = [10, 20, 50, 100];

  // Generate page number buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Max number of page buttons to show
    
    if (pageCount <= maxVisiblePages) {
      // If we have fewer pages than the max visible, show all pages
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(pageCount - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(pageCount - 1, 4);
      }
      
      // Adjust if we're near the end
      if (currentPage >= pageCount - 2) {
        startPage = Math.max(2, pageCount - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < pageCount - 1) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(pageCount);
    }
    
    return pages;
  };
  
  // Handle page change
  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= pageCount) {
      onPageChange(page);
    }
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    onItemsPerPageChange(newValue);
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 mt-6">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}-
        {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} items
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-sm mr-2 text-gray-600 dark:text-gray-400">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label="Previous page"
          >
            &lt;
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageClick(page) : null}
              disabled={page === '...'}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'bg-transparent text-gray-500 dark:text-gray-400 cursor-default'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === pageCount}
            className={`px-2 py-1 rounded ${
              currentPage === pageCount
                ? 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label="Next page"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}