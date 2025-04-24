import QuizCreationForm from '../components/QuizCreationForm';

export default function CreateQuizPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Create a New Quiz</h1>
      <QuizCreationForm />
    </div>
  );
}