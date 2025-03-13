import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DraggableWindow } from '../components/DraggableWindow';
import { RecipeChat } from '../components/cost-analysis/RecipeChat';
import { CostAnalysisLayout } from '../components/cost-analysis/CostAnalysisLayout';
import { RecipeService } from '../lib/recipe/recipe.service';
import { PhotoService } from '../lib/recipe/photo.service';
import { useAuthStore } from '../lib/auth/auth.store';
import { appLogger } from '../lib/logger';
import { CostService } from '../lib/recipe/cost.service';
import type { Recipe, TableRecipeIngredient, CostSummary, RecipePhoto } from '../types';

export function CostAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [menuItemCategory, setMenuItemCategory] = useState('Lunch');
  const [menuItemName, setMenuItemName] = useState('');
  const [price, setPrice] = useState('15.00');
  const [isTaxable, setIsTaxable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [ingredients, setIngredients] = useState<TableRecipeIngredient[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [materialCostPercentage, setMaterialCostPercentage] = useState(10);
  const [overheadCostPercentage, setOverheadCostPercentage] = useState(15);
  const [grossProfitPercentage, setGrossProfitPercentage] = useState(30);
  const [costSummary, setCostSummary] = useState<CostSummary>({
    foodCost: 0,
    materialCost: 0,
    materialCostPercentage: 0,
    overheadCost: 0,
    overheadCostPercentage: 0,
    totalCost: 0,
    grossProfit: 0,
    grossProfitPercentage: 0
  });

  const isCreateMode = !id;

  useEffect(() => {
    loadRecipe();
  }, [id]);

  useEffect(() => {
    setIsChatOpen(isCreateMode);
  }, [isCreateMode]);

  useEffect(() => {
    updateCostSummary();
  }, [ingredients, price, materialCostPercentage, overheadCostPercentage, grossProfitPercentage]);

  const calculateRecommendedPrice = (): number => {
    if (ingredients.length === 0) return 0;
    
    const totalFoodCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);
    const targetGrossProfit = grossProfitPercentage / 100;
    const targetMaterialCost = materialCostPercentage / 100;
    const targetOverheadCost = overheadCostPercentage / 100;
    
    const totalCostPercentage = 1 - targetGrossProfit;
    const recommendedPrice = totalFoodCost / (totalCostPercentage - targetMaterialCost - targetOverheadCost);
    
    return isFinite(recommendedPrice) && recommendedPrice > 0 ? recommendedPrice : 0;
  };

  const updateCostSummary = () => {
    const totalPrice = parseFloat(price) || 0;
    const summary = CostService.calculateCostSummary(
      ingredients,
      totalPrice,
      materialCostPercentage,
      overheadCostPercentage
    );
    setCostSummary(summary);
  };

  const parseInstructions = (instructionsData: string | null): string[] => {
    if (!instructionsData) return [];
    
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(instructionsData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If it's a JSON object but not an array, return empty array
      return [];
    } catch (e) {
      // If JSON parsing fails, try to split by newlines
      return instructionsData.split('\n').filter(line => line.trim());
    }
  };

  const loadRecipe = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const recipeData = await RecipeService.fetchRecipeById(id);
      if (!recipeData) {
        throw new Error('Recipe not found');
      }

      setRecipe(recipeData);
      setMenuItemName(recipeData.name);
      setMenuItemCategory(recipeData.category);
      setPrice(recipeData.price?.toString() || '0');
      setIsTaxable(recipeData.is_taxable);
      setIsActive(recipeData.is_active);
      
      // Handle instructions - check both column names
      const instructionsData = recipeData.instructions || recipeData.instruction;
      setInstructions(parseInstructions(instructionsData || null));

      const recipeIngredients = await RecipeService.fetchRecipeIngredients(id);
      setIngredients(recipeIngredients);

      if (recipeData.material_cost && recipeData.price) {
        setMaterialCostPercentage((recipeData.material_cost / recipeData.food_cost) * 100);
      }
      if (recipeData.overhead_cost && recipeData.price) {
        setOverheadCostPercentage((recipeData.overhead_cost / recipeData.food_cost) * 100);
      }
      if (recipeData.gross_profit && recipeData.price) {
        setGrossProfitPercentage((recipeData.gross_profit / recipeData.price) * 100);
      }

      updateCostSummary();
      
      // Load photos
      try {
        const recipePhotos = await PhotoService.getRecipePhotos(id);
        setPhotos(recipePhotos);
      } catch (photoError) {
        appLogger.error('Failed to load recipe photos', { error: photoError, recipeId: id });
        // Don't fail the whole recipe load if photos fail to load
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load recipe';
      setError(message);
      appLogger.error('Failed to load recipe', { error, recipeId: id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) return;

    try {
      const totalPrice = parseFloat(price);
      
      const summary = CostService.calculateCostSummary(
        ingredients,
        totalPrice,
        materialCostPercentage,
        overheadCostPercentage
      );

      // Convert instructions array to string for storage
      const instructionsString = instructions.length > 0 ? JSON.stringify(instructions) : null;

      const recipeData = {
        name: menuItemName,
        category: menuItemCategory,
        is_active: isActive,
        is_taxable: isTaxable,
        price: totalPrice,
        food_cost: summary.foodCost,
        material_cost: summary.materialCost,
        overhead_cost: summary.overheadCost,
        total_cost: summary.totalCost,
        gross_profit: summary.grossProfit,
        instructions: instructionsString,
        created_by: user.id,
        updated_at: new Date().toISOString()
      };

      appLogger.info('Saving recipe with cost summary', {
        recipeId: recipe?.id,
        costs: {
          foodCost: summary.foodCost,
          materialCost: summary.materialCost,
          overheadCost: summary.overheadCost,
          totalCost: summary.totalCost,
          grossProfit: summary.grossProfit
        },
        hasInstructions: instructions.length > 0
      });

      let savedRecipe;
      if (recipe?.id) {
        savedRecipe = await RecipeService.updateRecipe(recipe.id, recipeData);
      } else {
        savedRecipe = await RecipeService.createRecipe(recipeData);
      }

      if (savedRecipe) {
        await RecipeService.saveRecipeIngredients(savedRecipe.id, ingredients);
        setRecipe(savedRecipe);
        setIsDirty(false);
        setIsChatOpen(false);
        updateCostSummary();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save recipe';
      setError(message);
      appLogger.error('Failed to save recipe', { error });
    }
  };

  const handleDeleteIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleEditIngredient = (index: number, updatedIngredient: TableRecipeIngredient) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = updatedIngredient;
    
    const totalPrice = parseFloat(price) || 0;
    const ingredientsWithCosts = CostService.calculateIngredientCosts(updatedIngredients, totalPrice);
    
    setIngredients(ingredientsWithCosts);
    setIsDirty(true);
    updateCostSummary();
  };

  const handleInstructionsChange = (newInstructions: string[]) => {
    setInstructions(newInstructions);
    setIsDirty(true);
  };

  const handlePhotoUploaded = (photo: RecipePhoto) => {
    setPhotos(prevPhotos => {
      // If this is a primary photo, update all other photos to not be primary
      if (photo.is_primary) {
        return [
          photo,
          ...prevPhotos.map(p => ({ ...p, is_primary: false }))
        ];
      }
      
      // Otherwise just add the new photo to the beginning
      return [photo, ...prevPhotos];
    });
  };

  const handlePhotoDeleted = (photoId: string) => {
    setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
  };

  const handlePrimaryPhotoChanged = (photoId: string) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(p => ({
        ...p,
        is_primary: p.id === photoId
      }))
    );
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setChatError(null);

    try {
      const parsedRecipe = await RecipeService.parseRecipeFromAI(chatInput);
      
      setMenuItemName(parsedRecipe.name);
      setMenuItemCategory(parsedRecipe.category);
      setPrice(parsedRecipe.suggestedPrice.toString());
      setIngredients(parsedRecipe.ingredients);
      
      // Set instructions if available
      if (parsedRecipe.instructions && parsedRecipe.instructions.length > 0) {
        setInstructions(parsedRecipe.instructions);
      }
      
      setIsDirty(true);
      setChatInput('');
      updateCostSummary();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process recipe';
      setChatError(message);
      appLogger.error('Recipe chat error', { error });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CostAnalysisLayout
        menuItemCategory={menuItemCategory}
        menuItemName={menuItemName}
        price={price}
        isTaxable={isTaxable}
        isActive={isActive}
        ingredients={ingredients}
        isDirty={isDirty}
        costSummary={costSummary}
        materialCostPercentage={materialCostPercentage}
        overheadCostPercentage={overheadCostPercentage}
        grossProfitPercentage={grossProfitPercentage}
        recommendedPrice={calculateRecommendedPrice()}
        instructions={instructions}
        recipeId={recipe?.id}
        photos={photos}
        onPhotoUploaded={handlePhotoUploaded}
        onPhotoDeleted={handlePhotoDeleted}
        onPrimaryPhotoChanged={handlePrimaryPhotoChanged}
        onCategoryChange={setMenuItemCategory}
        onNameChange={setMenuItemName}
        onPriceChange={(value) => {
          setPrice(value);
          setIsDirty(true);
        }}
        onTaxableChange={(value) => {
          setIsTaxable(value);
          setIsDirty(true);
        }}
        onActiveChange={(value) => {
          setIsActive(value);
          setIsDirty(true);
        }}
        onMaterialPercentageChange={(value) => {
          setMaterialCostPercentage(value);
          setIsDirty(true);
        }}
        onOverheadPercentageChange={(value) => {
          setOverheadCostPercentage(value);
          setIsDirty(true);
        }}
        onGrossProfitPercentageChange={(value) => {
          setGrossProfitPercentage(value);
          setIsDirty(true);
        }}
        onDeleteIngredient={handleDeleteIngredient}
        onEditIngredient={handleEditIngredient}
        onInstructionsChange={handleInstructionsChange}
        onSave={handleSaveRecipe}
      />

      {isCreateMode && (
        <DraggableWindow
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          title="Recipe Assistant"
        >
          <RecipeChat
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSubmit={handleChatSubmit}
            isProcessing={isProcessing}
            error={chatError}
          />
        </DraggableWindow>
      )}
    </>
  );
}