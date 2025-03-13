# CostService Documentation

## Overview

The `CostService` class provides functionality for calculating and managing costs in recipe management. It handles ingredient costs, material costs, overhead costs, and profit calculations.

## Methods

### calculateIngredientCosts

Calculates costs and percentages for a list of ingredients.

```typescript
static calculateIngredientCosts(
  ingredients: TableRecipeIngredient[],
  totalPrice: number
): TableRecipeIngredient[]
```

**Parameters:**
- `ingredients`: Array of ingredients with their quantities and unit costs
- `totalPrice`: Total selling price of the recipe

**Returns:**
- Updated array of ingredients with calculated total costs and cost percentages

**Example:**
```typescript
const ingredients = [
  {
    ingredient: { name: 'Pasta' },
    quantity: 2,
    unitCost: 5,
    // ... other properties
  }
];
const totalPrice = 50;
const result = CostService.calculateIngredientCosts(ingredients, totalPrice);
// result[0].totalCost = 10 (2 * 5)
// result[0].costPercentage = 20 ((10 / 50) * 100)
```

### updateIngredientCosts

Updates costs and percentages when a single ingredient value changes.

```typescript
static updateIngredientCosts(
  ingredients: TableRecipeIngredient[],
  totalPrice: number,
  index: number,
  updates: Partial<TableRecipeIngredient>
): TableRecipeIngredient[]
```

**Parameters:**
- `ingredients`: Current array of ingredients
- `totalPrice`: Total selling price of the recipe
- `index`: Index of the ingredient to update
- `updates`: Partial ingredient object with updated values

**Returns:**
- Updated array of ingredients with recalculated costs

### calculateCostSummary

Calculates complete cost summary for a recipe.

```typescript
static calculateCostSummary(
  ingredients: TableRecipeIngredient[],
  totalPrice: number,
  materialCostPercentage: number = 10,
  overheadCostPercentage: number = 15
): CostSummary
```

**Parameters:**
- `ingredients`: Array of recipe ingredients
- `totalPrice`: Total selling price of the recipe
- `materialCostPercentage`: Material cost percentage (default: 10%)
- `overheadCostPercentage`: Overhead cost percentage (default: 15%)

**Returns:**
A `CostSummary` object containing:
- `foodCost`: Total cost of ingredients
- `materialCost`: Material cost based on food cost
- `overheadCost`: Overhead cost based on food cost
- `totalCost`: Sum of all costs
- `grossProfit`: Profit after all costs
- `grossProfitPercentage`: Profit percentage of total price

**Business Logic:**
- Material and overhead costs are calculated as percentages of the food cost
- Gross profit is calculated as total price minus total cost
- Percentages are relative to the total price

### calculateIngredientCost

Calculates cost details for a single recipe ingredient.

```typescript
static calculateIngredientCost(
  ingredient: RecipeIngredient
): {
  unitCost: number;
  totalCost: number;
  costPercentage: number;
}
```

**Parameters:**
- `ingredient`: Recipe ingredient with price history

**Returns:**
Object containing:
- `unitCost`: Latest unit cost
- `totalCost`: Total cost (quantity * unit cost)
- `costPercentage`: Percentage of recipe price

### validateCostCalculations

Validates the correctness of ingredient cost calculations.

```typescript
static validateCostCalculations(
  ingredients: TableRecipeIngredient[]
): string[]
```

**Parameters:**
- `ingredients`: Array of ingredients to validate

**Returns:**
- Array of error messages, empty if all calculations are valid

**Validation Rules:**
1. Unit cost cannot be negative
2. Quantity must be greater than 0
3. Total cost must equal quantity * unit cost
4. Cost percentage must be between 0 and 100

## Error Handling

The service uses the `appLogger` for error logging and includes comprehensive error handling:
- Input validation
- Calculation error detection
- Detailed error messages
- Error context logging

## Testing

The service includes comprehensive unit tests in `__tests__/cost.service.test.ts` covering:
- Basic calculations
- Edge cases
- Error scenarios
- Business logic validation

## Usage Example

```typescript
// Calculate recipe costs
const ingredients = [/* ingredient array */];
const totalPrice = 25.00;
const materialCostPercentage = 10;
const overheadCostPercentage = 15;

const costSummary = CostService.calculateCostSummary(
  ingredients,
  totalPrice,
  materialCostPercentage,
  overheadCostPercentage
);

// Update an ingredient
const updates = { quantity: 3, unitCost: 5 };
const updatedIngredients = CostService.updateIngredientCosts(
  ingredients,
  totalPrice,
  0,
  updates
);

// Validate calculations
const errors = CostService.validateCostCalculations(updatedIngredients);
if (errors.length > 0) {
  console.error('Cost calculation errors:', errors);
}
```

## Dependencies

- `appLogger`: For error and operation logging
- `TableRecipeIngredient`: Type for ingredient data
- `CostSummary`: Type for cost calculation results
- `RecipeIngredient`: Type for recipe ingredient data

## Best Practices

1. Always validate input data before calculations
2. Use the validation methods to ensure calculation accuracy
3. Handle edge cases (zero prices, missing data)
4. Log errors and important operations
5. Keep calculations consistent with business rules