# Recipe Cost Analysis Application

A professional web application for restaurant owners and chefs to analyze and optimize recipe costs, manage ingredients, and track profitability.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Key Features Implementation](#key-features-implementation)
- [Security](#security)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact Information](#contact-information)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Usage Examples
To use the Recipe Cost Analysis Application, follow these examples:

1. **Creating a Recipe**:
   - Navigate to the "Recipes" section in the application.
   - Click on "Add New Recipe" and fill in the required fields such as ingredients, cooking instructions, and upload a photo.

2. **Analyzing Costs**:
   - After creating a recipe, go to the "Cost Analysis" tab.
   - Input the current prices of ingredients to see the calculated food costs and recommended selling prices.

3. **Viewing Profit Margins**:
   - Access the "Profitability" section to view detailed reports on profit margins based on your recipes.

## Troubleshooting
If you encounter issues while using the application, consider the following solutions:

- **Error: Unable to connect to Supabase**:
  - Ensure your Supabase URL and Anon Key in the `.env` file are correct.
  - Check your internet connection.

- **Error: Tests are failing**:
  - Make sure all dependencies are installed correctly by running `npm install`.
  - Review the test logs for specific error messages and address them accordingly.

## Contact Information
For support or questions, please reach out to:
- Email: support@example.com
- GitHub Issues: [Link to Issues](https://github.com/your-repo/issues)

## Visuals
Consider adding screenshots or diagrams to illustrate the application's interface or workflow. This can help users better understand how to navigate and utilize the features effectively.

## Features

- **Recipe Management**
  - Create and manage recipes with detailed ingredients
  - Track recipe versions and modifications
  - Upload and manage recipe photos (including AI-generated images)
  - Store cooking instructions and notes

- **Cost Analysis**
  - Calculate food costs, material costs, and overhead
  - Track ingredient prices and supplier information
  - Analyze profit margins and cost percentages
  - Generate recommended selling prices

- **Ingredient Management**
  - Maintain ingredient database with prices
  - Track price history and supplier information
  - Support multiple units of measurement
  - Automatic unit conversions

- **AI Integration**
  - AI-powered recipe suggestions
  - Automatic cost calculations
  - AI-generated recipe photos
  - Natural language recipe input

## Technology Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Zustand (State Management)
  - Vite (Build Tool)

- **Backend**
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security (RLS)
  - Storage for Recipe Photos

- **Testing**
  - Vitest
  - React Testing Library
  - Coverage Reports

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase Account
- OpenAI API Key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd recipe-cost-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
VITE_OPENAI_API_KEY=your-openai-key
```

4. Start the development server:
```bash
npm run dev
```

### Database Setup

1. Run Supabase migrations:
```bash
npm run supabase:migration
```

2. (Optional) Reset database schema:
```bash
npm run supabase:schema:refresh
```

## Testing

Run tests:
```bash
npm run test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── assets/         # Static assets and global styles
├── components/     # Reusable React components
├── lib/           # Core functionality and services
│   ├── ai/        # AI service integration
│   ├── auth/      # Authentication logic
│   ├── recipe/    # Recipe management
│   ├── storage/   # File storage handling
│   └── ui/        # UI state management
├── pages/         # Application pages/routes
├── types/         # TypeScript type definitions
└── tests/         # Test configuration
```

## Key Features Implementation

### Cost Analysis

The application provides detailed cost analysis:
- Food Cost Calculation
- Material Cost Tracking
- Overhead Cost Management
- Profit Margin Analysis
- Price Recommendations

### Recipe Management

Comprehensive recipe handling:
- Version Control
- Ingredient Management
- Photo Management
- Cooking Instructions
- Cost Tracking

### Security

- Row Level Security (RLS)
- User Authentication
- Data Access Control
- Secure File Storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Supabase for database and authentication
- OpenAI for AI features
- Unsplash for stock photos
- React and Vite teams