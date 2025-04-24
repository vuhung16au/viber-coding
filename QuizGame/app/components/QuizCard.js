import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function QuizCard({ quiz, showActions = false, onEdit, onDelete, onStart }) {
  // Handle possible missing fields gracefully
  const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
  const coverImage = quiz.coverImage || quiz.image || '/images/default-quiz.jpg';
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || 'en';
  
  // Process tags to handle both array and object formats from Firebase
  const tags = quiz.tags ? 
    (Array.isArray(quiz.tags) ? quiz.tags : Object.values(quiz.tags)) : 
    [];
  
  // Default handler if onStart isn't provided
  const defaultStartHandler = () => {
    router.push(`/${lang}/quiz/${quiz.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative w-full h-48" style={{ position: 'relative', height: '12rem' }}>
        <Image 
          src={coverImage} 
          alt={quiz.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{quiz.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
        
        {/* Quiz tags */}
        {quiz.tags && quiz.tags.trim !== undefined && quiz.tags.trim() !== '' && (
          <div className="flex flex-wrap gap-1 mt-2">
            {quiz.tags.split(', ').map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{questionCount} questions</p>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onStart || defaultStartHandler}
            className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Quiz
          </button>
          
          {showActions && (
            <>
              <button 
                onClick={onEdit}
                className="inline-block px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={onDelete}
                className="inline-block px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
        
        {quiz.createdAt && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Created: {typeof quiz.createdAt === 'object' ? 'Recently' : new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}