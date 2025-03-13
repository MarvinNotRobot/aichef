import { describe, it, expect } from 'vitest';
import { CostService } from '../cost.service';
import type { TableRecipeIngredient, RecipeIngredient } from '../../../types';

describe('CostService', () => {
  // Sample test data
  const sampleTableIngredients: TableRecipeIngredient[] = [
    {
      ingredient: {
        id: '1',
        name: 'Pasta',
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      quantity: 2,
      unit: {
        id: '1',
        name: 'pound',
        abbreviation: 'lb',
        conversion_factor: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      unitCost: 5,
      totalCost: 10,
      costPercentage: 20
    },
    {
      ingredient: {
        id: '2',
        name: 'Sauce',
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      quantity: 1,
      unit: {
        id: '2',
        name: 'cup',
        abbreviation: 'cup',
        conversion_factor: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      unitCost: 3,
      totalCost: 3,
      costPercentage: 6
    }
  ];

  describe('calculateIngredientCosts', () => {
    it('should calculate costs and percentages correctly', () => {
      const totalPrice = 50;
      const result = CostService.calculateIngredientCosts(sampleTableIngredients, totalPrice);

      expect(result).toHaveLength(2);
      
      // Check first ingredient
      expect(result[0].totalCost).toBe(10); // 2 * 5
      expect(result[0].costPercentage).toBe(20); // (10 / 50) * 100

      // Check second ingredient
      expect(result[1].totalCost).toBe(3); // 1 * 3
      expect(result[1].costPercentage).toBe(6); // (3 / 50) * 100
    });

    it('should handle zero total price', () => {
      const result = CostService.calculateIngredientCosts(sampleTableIngredients, 0);

      expect(result[0].costPercentage).toBe(0);
      expect(result[1].costPercentage).toBe(0);
    });

    it('should handle empty ingredients list', () => {
      const result = CostService.calculateIngredientCosts([], 100);
      expect(result).toHaveLength(0);
    });

    it('should throw error on invalid input', () => {
      expect(() => {
        CostService.calculateIngredientCosts(null as any, 100);
      }).toThrow();
    });
  });

  describe('updateIngredientCosts', () => {
    it('should update single ingredient costs correctly', () => {
      const totalPrice = 50;
      const updates = {
        quantity: 3,
        unitCost: 6
      };

      const result = CostService.updateIngredientCosts(
        sampleTableIngredients,
        totalPrice,
        0,
        updates
      );

      // Check updated ingredient
      expect(result[0].quantity).toBe(3);
      expect(result[0].unitCost).toBe(6);
      expect(result[0].totalCost).toBe(18); // 3 * 6
      expect(result[0].costPercentage).toBe(36); // (18 / 50) * 100

      // Check that other ingredient remained unchanged
      expect(result[1]).toEqual(sampleTableIngredients[1]);
    });

    it('should handle zero price when updating', () => {
      const updates = {
        quantity: 3,
        unitCost: 6
      };

      const result = CostService.updateIngredientCosts(
        sampleTableIngredients,
        0,
        0,
        updates
      );

      expect(result[0].costPercentage).toBe(0);
    });

    it('should handle invalid index', () => {
      const updates = { quantity: 3 };
      const result = CostService.updateIngredientCosts(
        sampleTableIngredients,
        100,
        999,
        updates
      );
      expect(result).toEqual(sampleTableIngredients);
    });
  });

  describe('calculateCostSummary', () => {
    it('should calculate complete cost summary correctly', () => {
      const totalPrice = 50;
      const materialCost = 5;
      const overheadCost = 2;

      const result = CostService.calculateCostSummary(
        sampleTableIngredients,
        totalPrice,
        materialCost,
        overheadCost
      );

      // Total food cost should be sum of ingredient costs (10 + 3 = 13)
      expect(result.foodCost).toBe(13);
      expect(result.foodCostPercentage).toBe(26); // (13 / 50) * 100

      // Material cost checks
      expect(result.materialCost).toBe(5);
      expect(result.materialCostPercentage).toBe(10); // (5 / 50) * 100

      // Overhead cost checks
      expect(result.overheadCost).toBe(2);
      expect(result.overheadCostPercentage).toBe(4); // (2 / 50) * 100

      // Total cost should be sum of all costs (13 + 5 + 2 = 20)
      expect(result.totalCost).toBe(20);
      expect(result.totalCostPercentage).toBe(40); // (20 / 50) * 100

      // Gross profit should be price minus total cost (50 - 20 = 30)
      expect(result.grossProfit).toBe(30);
      expect(result.grossProfitPercentage).toBe(60); // (30 / 50) * 100
    });

    it('should handle zero price', () => {
      const result = CostService.calculateCostSummary(
        sampleTableIngredients,
        0,
        5,
        2
      );

      expect(result.foodCostPercentage).toBe(0);
      expect(result.materialCostPercentage).toBe(0);
      expect(result.overheadCostPercentage).toBe(0);
      expect(result.totalCostPercentage).toBe(0);
      expect(result.grossProfitPercentage).toBe(0);
    });

    it('should handle empty ingredients', () => {
      const result = CostService.calculateCostSummary(
        [],
        100,
        5,
        2
      );

      expect(result.foodCost).toBe(0);
      expect(result.totalCost).toBe(7); // Just material + overhead
      expect(result.grossProfit).toBe(93); // 100 - 7
    });

    it('should handle negative costs', () => {
      const result = CostService.calculateCostSummary(
        sampleTableIngredients,
        100,
        -5, // Negative material cost
        -2  // Negative overhead cost
      );

      expect(result.materialCost).toBe(-5);
      expect(result.overheadCost).toBe(-2);
      expect(result.totalCost).toBe(6); // 13 + (-5) + (-2)
      expect(result.grossProfit).toBe(94); // 100 - 6
    });

    it('should handle very small numbers', () => {
      const result = CostService.calculateCostSummary(
        [
          {
            ...sampleTableIngredients[0],
            quantity: 0.0001,
            unitCost: 0.0001
          }
        ],
        1,
        0.0001,
        0.0001
      );

      expect(result.foodCost).toBeCloseTo(0.00000001);
      expect(result.materialCost).toBeCloseTo(0.0001);
      expect(result.overheadCost).toBeCloseTo(0.0001);
    });
  });

  describe('calculateIngredientCost', () => {
    const sampleRecipeIngredient: RecipeIngredient = {
      id: '1',
      recipe_id: '1',
      ingredient_id: '1',
      quantity: 2,
      unit_id: '1',
      created_by: 'user1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ingredient: {
        id: '1',
        name: 'Test Ingredient',
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ingredient_prices: [
          {
            id: '1',
            ingredient_id: '1',
            unit_id: '1',
            price: 10,
            effective_date: new Date().toISOString(),
            created_by: 'user1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      },
      recipe: {
        id: '1',
        name: 'Test Recipe',
        category: 'Test',
        version: 1,
        is_active: true,
        is_taxable: false,
        price: 100,
        created_by: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    it('should calculate ingredient cost correctly', () => {
      const result = CostService.calculateIngredientCost(sampleRecipeIngredient);

      expect(result.unitCost).toBe(10);
      expect(result.totalCost).toBe(20); // 2 * 10
      expect(result.costPercentage).toBe(20); // (20 / 100) * 100
    });

    it('should handle missing prices', () => {
      const ingredientWithoutPrices = {
        ...sampleRecipeIngredient,
        ingredient: {
          ...sampleRecipeIngredient.ingredient,
          ingredient_prices: []
        }
      };

      const result = CostService.calculateIngredientCost(ingredientWithoutPrices);

      expect(result.unitCost).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.costPercentage).toBe(0);
    });

    it('should handle missing recipe price', () => {
      const ingredientWithoutRecipePrice = {
        ...sampleRecipeIngredient,
        recipe: {
          ...sampleRecipeIngredient.recipe,
          price: undefined
        }
      };

      const result = CostService.calculateIngredientCost(ingredientWithoutRecipePrice);

      expect(result.costPercentage).toBe(0);
    });
  });

  describe('validateCostCalculations', () => {
    it('should validate correct calculations', () => {
      const validIngredients = sampleTableIngredients.map(ing => ({
        ...ing,
        totalCost: ing.quantity * ing.unitCost,
        costPercentage: 20 // Valid percentage
      }));

      const errors = CostService.validateCostCalculations(validIngredients);
      expect(errors).toHaveLength(0);
    });

    it('should detect negative unit cost', () => {
      const invalidIngredients = [
        {
          ...sampleTableIngredients[0],
          unitCost: -5
        }
      ];

      const errors = CostService.validateCostCalculations(invalidIngredients);
      expect(errors).toContain('Ingredient 1: Unit cost cannot be negative');
    });

    it('should detect zero quantity', () => {
      const invalidIngredients = [
        {
          ...sampleTableIngredients[0],
          quantity: 0
        }
      ];

      const errors = CostService.validateCostCalculations(invalidIngredients);
      expect(errors).toContain('Ingredient 1: Quantity must be greater than 0');
    });

    it('should detect incorrect total cost calculation', () => {
      const invalidIngredients = [
        {
          ...sampleTableIngredients[0],
          quantity: 2,
          unitCost: 5,
          totalCost: 15 // Should be 10 (2 * 5)
        }
      ];

      const errors = CostService.validateCostCalculations(invalidIngredients);
      expect(errors).toContain('Ingredient 1: Total cost calculation is incorrect');
    });

    it('should detect invalid cost percentage', () => {
      const invalidIngredients = [
        {
          ...sampleTableIngredients[0],
          costPercentage: 150 // Over 100%
        }
      ];

      const errors = CostService.validateCostCalculations(invalidIngredients);
      expect(errors).toContain('Ingredient 1: Cost percentage must be between 0 and 100');
    });

    it('should handle empty ingredients list', () => {
      const errors = CostService.validateCostCalculations([]);
      expect(errors).toHaveLength(0);
    });
  });
});