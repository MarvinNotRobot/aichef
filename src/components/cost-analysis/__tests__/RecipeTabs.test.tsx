recipeName="Test Recipe"
        ingredients={mockIngredients}
        instructions={mockInstructions}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
        editable={true}
      />
    );
    
    // Click on the photos tab
    fireEvent.click(screen.getByTestId('photos-tab'));
    
    await waitFor(() => {
      expect(screen.getByTestId('photos-tab-content')).toBeInTheDocument();
    });
    
    // Trigger primary photo changed event
    fireEvent.click(screen.getByTestId('mock-primary-changed'));
    
    // Check that the primary photo was updated
    expect(screen.getByText('Photos Count: 2')).toBeInTheDocument();
  });

  it('displays error message when loading photos fails', async () => {
    (PhotoService.getRecipePhotos as any).mockRejectedValue(new Error('Failed to load photos'));
    
    render(
      <RecipeTabs
        recipeId="recipe-1"
        recipeName="Test Recipe"
        ingredients={mockIngredients}
        instructions={mockInstructions}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
      />
    );
    
    // Click on the photos tab
    fireEvent.click(screen.getByTestId('photos-tab'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load photos')).toBeInTheDocument();
    });
  });

  it('does not load photos when recipeId is empty', async () => {
    render(
      <RecipeTabs
        recipeId=""
        recipeName="Test Recipe"
        ingredients={mockIngredients}
        instructions={mockInstructions}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
      />
    );
    
    // Click on the photos tab
    fireEvent.click(screen.getByTestId('photos-tab'));
    
    await waitFor(() => {
      expect(screen.getByTestId('photos-tab-content')).toBeInTheDocument();
    });
    
    expect(PhotoService.getRecipePhotos).not.toHaveBeenCalled();
  });

  it('passes editable prop correctly to RecipePhotosTab', async () => {
    render(
      <RecipeTabs
        recipeId="recipe-1"
        recipeName="Test Recipe"
        ingredients={mockIngredients}
        instructions={mockInstructions}
        onDeleteIngredient={mockHandlers.onDeleteIngredient}
        onEditIngredient={mockHandlers.onEditIngredient}
        editable={true}
      />
    );
    
    // Click on the photos tab
    fireEvent.click(screen.getByTestId('photos-tab'));
    
    await waitFor(() => {
      expect(screen.getByTestId('photos-tab-content')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Is Editable: true')).toBeInTheDocument();
  });
});