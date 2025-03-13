import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CostAnalysis } from './pages/CostAnalysis';
import { Settings } from './pages/Settings';
import { About } from './pages/About';
import { RecipeList } from './pages/RecipeList';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route
            path="/recipes"
            element={
              <AuthGuard>
                <RecipeList />
              </AuthGuard>
            }
          />
          <Route
            path="/cost-analysis"
            element={
              <AuthGuard>
                <CostAnalysis />
              </AuthGuard>
            }
          />
          <Route
            path="/cost-analysis/:id"
            element={
              <AuthGuard>
                <CostAnalysis />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Navigate to="/recipes" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;