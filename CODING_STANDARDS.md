# Coding Standards

## Table of Contents
1. [General Guidelines](#general-guidelines)
2. [TypeScript Standards](#typescript-standards)
3. [React Components](#react-components)
4. [State Management](#state-management)
5. [Testing Standards](#testing-standards)
6. [File Organization](#file-organization)
7. [Naming Conventions](#naming-conventions)
8. [Documentation](#documentation)
9. [Error Handling](#error-handling)
10. [Performance](#performance)

## General Guidelines

### Code Formatting
- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use semicolons at the end of statements
- Use single quotes for strings
- Add trailing commas in multiline objects/arrays

```typescript
const example = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
};
```

### Code Organization
- One component/class per file
- Related utilities should be grouped in a single file
- Keep files under 400 lines of code
- Use meaningful file names that describe the content

## TypeScript Standards

### Type Definitions
- Use explicit type annotations for function parameters
- Prefer interfaces over type aliases for object definitions
- Use generics when creating reusable components/functions
- Export types and interfaces from dedicated type files

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): Promise<User> {
  // Implementation
}
```

### Type Safety
- Avoid using `any` type
- Use union types for variables that can have multiple types
- Enable strict TypeScript compiler options
- Use type guards for runtime type checking

```typescript
type Status = 'pending' | 'success' | 'error';

function isError(status: Status): status is 'error' {
  return status === 'error';
}
```

## React Components

### Component Structure
- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks
- Use proper prop types with TypeScript interfaces

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
    >
      {label}
    </button>
  );
}
```

### Component Organization
- Group related components in feature folders
- Use index files for exporting components
- Keep presentation and container components separate
- Use composition over inheritance

### Props
- Use destructuring for props
- Provide default values when appropriate
- Document required vs optional props
- Validate prop types in development

## State Management

### Zustand Store
- Create separate stores for different domains
- Use TypeScript for store definitions
- Implement proper error handling
- Document store interfaces

```typescript
interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
}
```

### State Updates
- Use immutable state updates
- Implement proper error handling
- Keep state normalized
- Document state shape and update patterns

## Testing Standards

### Test Organization
- Group tests by feature/component
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Maintain high test coverage

```typescript
describe('RecipeCard', () => {
  it('should render recipe details correctly', () => {
    // Arrange
    const recipe = { /* ... */ };
    
    // Act
    render(<RecipeCard recipe={recipe} />);
    
    // Assert
    expect(screen.getByText(recipe.name)).toBeInTheDocument();
  });
});
```

### Test Coverage
- Minimum 80% code coverage
- Test all user interactions
- Test error scenarios
- Test edge cases

## File Organization

### Project Structure
```
src/
├── components/
│   ├── common/
│   └── feature/
├── hooks/
├── lib/
│   ├── api/
│   ├── utils/
│   └── types/
├── pages/
└── tests/
```

### Import Order
1. External dependencies
2. Internal modules
3. Type imports
4. Style imports

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RecipeCard } from '../components';
import { useRecipeStore } from '../stores';
import type { Recipe } from '../types';

import './styles.css';
```

## Naming Conventions

### Files and Folders
- React components: PascalCase (e.g., `RecipeCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Test files: `*.test.tsx` or `*.test.ts`
- Style files: `*.module.css` or component name match

### Variables and Functions
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Component names: PascalCase
- Boolean variables: isXxx, hasXxx
- Event handlers: handleXxx

```typescript
const MAX_ITEMS = 10;
const isLoading = false;
function handleClick() { /* ... */ }
```

## Documentation

### Code Comments
- Use JSDoc for function documentation
- Document complex algorithms
- Explain business logic
- Add TODO comments for future improvements

```typescript
/**
 * Calculates the total cost of a recipe
 * @param ingredients - List of ingredients with quantities
 * @param overhead - Overhead percentage
 * @returns Total cost including overhead
 */
function calculateTotalCost(ingredients: Ingredient[], overhead: number): number {
  // Implementation
}
```

### Component Documentation
- Document component props
- Explain component behavior
- Provide usage examples
- Document side effects

## Error Handling

### Error Patterns
- Use try/catch blocks for async operations
- Implement error boundaries for React components
- Log errors appropriately
- Provide user-friendly error messages

```typescript
try {
  await saveRecipe(recipe);
} catch (error) {
  appLogger.error('Failed to save recipe', { error });
  throw new Error('Unable to save recipe. Please try again.');
}
```

### Error Logging
- Use structured logging
- Include relevant context
- Log appropriate error levels
- Handle sensitive information

## Performance

### Optimization Techniques
- Use React.memo for pure components
- Implement proper dependency arrays in hooks
- Lazy load components and routes
- Optimize re-renders

```typescript
const MemoizedComponent = React.memo(function Component({ prop }: Props) {
  return <div>{prop}</div>;
});
```

### Code Splitting
- Split code by routes
- Use dynamic imports
- Implement proper loading states
- Monitor bundle sizes

```typescript
const LazyComponent = React.lazy(() => import('./Component'));
```

### Resource Loading
- Optimize image loading
- Implement proper caching
- Use appropriate loading strategies
- Monitor performance metrics