# MathJax Implementation in QuizGame

## Overview

QuizGame implements MathJax to render mathematical expressions and formulas throughout the application. MathJax transforms LaTeX mathematical notations into readable, properly formatted expressions in the browser.

## Implementation Details

### Core Components

1. **MathJaxRenderer Component**

The core of our MathJax implementation is the `MathJaxRenderer` component located at:
`/app/components/MathJaxRenderer.js`

This component handles:
- Loading MathJax dynamically when needed
- Processing LaTeX expressions
- Rendering properly formatted mathematical content

### How It Works

1. **MathJax Configuration**

MathJax is configured to recognize the following syntax:
- Inline math: `$...$` or `\(...\)`
- Display math (centered, larger equations): `$$...$$` or `\[...\]`

```javascript
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    packages: ['base', 'ams', 'noerrors', 'noundefined']
  },
  options: {
    enableMenu: false
  }
};
```

2. **Usage in Components**

Mathematical expressions are rendered by wrapping text content in the MathJaxRenderer component:

```jsx
import MathJaxRenderer from '../components/MathJaxRenderer';

// Example usage
<MathJaxRenderer content="The formula $E=mc^2$ explains the relationship between energy and mass." />
```

### Integration Points

MathJax is integrated throughout the application at various key points:

1. **Quiz Creation Flow**

- **QuestionEditor Component**: Provides live preview of math formulas during question creation and editing
  - Location: `/app/components/quiz-creation/ui/QuestionEditor.js`
  - Features:
    - Live rendering of math formulas as users type
    - Help text explaining LaTeX syntax
    - Preview of both inline and display math

- **BasicInfoStep Component**: Includes a Math Formula Guide section
  - Location: `/app/components/quiz-creation/steps/BasicInfoStep.js`
  - Features:
    - Examples of mathematical syntax
    - Instructions for using LaTeX

2. **Quiz Review and Display**

- **SortableQuestionItem Component**: Renders math in questions list
  - Location: `/app/components/quiz-creation/ui/SortableQuestionItem.js`
  - Features:
    - Displays mathematical expressions in draggable question items
    - Renders math in both questions and options

- **ReviewStep Component**: Renders math in quiz review
  - Location: `/app/components/quiz-creation/steps/ReviewStep.js`
  - Features:
    - Previews quiz with fully rendered math expressions

3. **Quiz Taking and Results**

- **Question Component**: Displays math in quiz questions
  - Features:
    - Renders math expressions in quiz questions and options

- **QuizResults Component**: Renders math in quiz results
  - Location: `/app/components/QuizResults.js`
  - Features: 
    - Displays mathematical expressions in questions and answers review
    - Properly formats math in explanations

## User Guidance

Users are guided on how to use mathematical expressions through:

1. **Help Text**: The QuestionEditor component displays help text explaining how to format math expressions.
2. **Math Formula Guide**: BasicInfoStep includes a dedicated section with examples.
3. **Placeholders**: Input fields have placeholder text demonstrating math syntax.

## Syntax Examples

| Type | Syntax | Example | Renders As |
|------|--------|---------|-----------|
| Inline Math | `$...$` | `$x^2 + y^2 = z^2$` | x² + y² = z² |
| Display Math | `$$...$$` | `$$\int_{a}^{b} f(x) dx = F(b) - F(a)$$` | Centered equation with integral |
| Fractions | `$\frac{a}{b}$` | `$\frac{1}{2}$` | ½ |
| Greek Letters | `$\alpha$` | `$\alpha, \beta, \gamma$` | α, β, γ |
| Summation | `$\sum_{i=0}^n$` | `$\sum_{i=0}^n i$` | Summation with limits |

## PDF Export Integration

The MathJax implementation also works seamlessly with PDF exports. See the PDF-Export.md documentation for more details on how mathematical expressions are rendered in exported PDFs.

## Debugging Tips

1. **Issues with Math Rendering**
   - Check that the text is wrapped in the MathJaxRenderer component
   - Verify that LaTeX syntax is correct
   - Ensure MathJax has loaded properly

2. **Common Syntax Errors**
   - Mismatched delimiters (opening `$` without closing `$`)
   - Invalid LaTeX commands
   - Special characters that need escaping

## Performance Considerations

- MathJax is loaded dynamically only when needed
- Typesetting occurs after component changes to ensure proper rendering
- Complex formulas might cause slight performance impact on low-end devices
