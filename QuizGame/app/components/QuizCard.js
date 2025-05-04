import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase/config';
import { generateSlug } from '../../utils/slug';

export default function QuizCard({ quiz, isOwner = false, onDuplicate }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Default image if none provided
  const imageUrl = quiz.coverImage || '/images/default-quiz.jpg';

  // Format the date if it exists
  const formattedDate = quiz.createdAt
    ? new Date(quiz.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';

  const handleEdit = () => {
    const slug = generateSlug(quiz.title || quiz.description || 'quiz');
    router.push(`/en/edit-quiz/${quiz.id}/${slug}`);
  };

  const handleDelete = async () => {
    if (showConfirm) {
      try {
        setIsDeleting(true);
        const quizRef = ref(db, `quizzes/${quiz.id}`);
        await remove(quizRef);
        // Note: In a real app, we would also clean up questions and answers
        // But for simplicity in this demo, we're just removing the quiz
      } catch (error) {
        console.error('Error deleting quiz:', error);
      } finally {
        setIsDeleting(false);
        setShowConfirm(false);
      }
    } else {
      setShowConfirm(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/quiz/${quiz.id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={quiz.title || 'Quiz'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {isOwner && (
            <div className="absolute top-2 right-2 z-10 flex space-x-1">
              {quiz.isPublic ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                  </svg>
                  Public
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Private
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate">
            {quiz.title || 'Untitled Quiz'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2 h-10">
            {quiz.description || 'No description provided'}
          </p>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {quiz.questions?.length || 0} questions
            </div>
          </div>
        </div>
      </Link>

      {isOwner && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDuplicate}
            className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Duplicate
          </button>
          {showConfirm ? (
            <>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}