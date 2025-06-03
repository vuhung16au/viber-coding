'use client';

import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableQuestionItem from './SortableQuestionItem';
import { useQuizFormContext } from '../QuizFormContext';

export default function QuestionDragDropList() {
  const {
    quizData,
    setQuizData,
    handleEditQuestion,
    removeQuestion,
    editingQuestionIndex
  } = useQuizFormContext();
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle moving a question up (decreasing its index)
  const handleMoveQuestionUp = (index) => {
    if (index <= 0) return; // Already at the top
    
    const reorderedQuestions = Array.from(quizData.questions);
    const [removed] = reorderedQuestions.splice(index, 1);
    reorderedQuestions.splice(index - 1, 0, removed);
    
    setQuizData({
      ...quizData,
      questions: reorderedQuestions
    });
  };

  // Handle moving a question down (increasing its index)
  const handleMoveQuestionDown = (index) => {
    if (index >= quizData.questions.length - 1) return; // Already at the bottom
    
    const reorderedQuestions = Array.from(quizData.questions);
    const [removed] = reorderedQuestions.splice(index, 1);
    reorderedQuestions.splice(index + 1, 0, removed);
    
    setQuizData({
      ...quizData,
      questions: reorderedQuestions
    });
  };

  // Handle drag end event from dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const activeIndex = quizData.questions.findIndex(
        (question) => question.id.toString() === active.id
      );
      const overIndex = quizData.questions.findIndex(
        (question) => question.id.toString() === over.id
      );
      
      setQuizData({
        ...quizData,
        questions: arrayMove(quizData.questions, activeIndex, overIndex)
      });
    }
  };
  
  if (quizData.questions.length === 0) {
    return (
      <div className="p-4 border rounded-lg dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">No questions added yet. Create your first question below.</p>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
        Added Questions
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          (Drag to reorder)
        </span>
      </h3>
      <div className="space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={quizData.questions.map(question => question.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {quizData.questions.map((question, index) => (
              <SortableQuestionItem
                key={question.id.toString()}
                question={question}
                index={index}
                onEdit={() => handleEditQuestion(index)}
                onRemove={removeQuestion}
                onMoveUp={handleMoveQuestionUp}
                onMoveDown={handleMoveQuestionDown}
                isFirst={index === 0}
                isLast={index === quizData.questions.length - 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
