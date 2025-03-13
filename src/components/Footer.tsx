import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
              <Link to="/about" className="hover:text-indigo-600">About</Link>
            </h3>
            <p className="mt-4 text-base text-gray-500">
              AI Chef empowers you to discover and create incredible recipes using the power of artificial intelligence
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Popular Categories</h3>
            <ul className="mt-4 space-y-2">
              {['Italian', 'Asian', 'Mexican', 'Vegetarian', 'Desserts'].map((category) => (
                <li key={category}>
                  <span className="text-base text-gray-500 hover:text-gray-900 cursor-pointer">
                    {category}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-base text-gray-500 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} AI Chef. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}