'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MathJaxRenderer from '../../MathJaxRenderer';

export default function SortableQuestionItem({ 
  question, 
  index, 
  onEdit, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <div 
              className="mr-2 text-gray-400 cursor-move" 
              {...attributes} 
              {...listeners}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                {index + 1}. <MathJaxRenderer content={question.question} />
              </p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                question.points === 2 
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
                  : question.points === 0 
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {question.points === 2 ? '2 pts' : question.points === 0 ? '0 pts' : '1 pt'}
              </span>
            </div>
          </div>
          <ul className="mt-2 space-y-1 ml-7">
            {question.options.map((option, optIndex) => (
              <li 
                key={optIndex} 
                className={option === question.correctAnswer ? 
                  'text-green-600 dark:text-green-400' : 
                  'text-gray-600 dark:text-gray-400'
                }
              >
                {String.fromCharCode(65 + optIndex)}. <MathJaxRenderer content={option} />
                {option === question.correctAnswer && ' ✓'}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Edit question"
            title="Edit question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(question.id)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            aria-label="Delete question"
            title="Delete question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className={`${isFirst ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
            aria-label="Move question up"
            title="Move question up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className={`${isLast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
            aria-label="Move question down"
            title="Move question down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
