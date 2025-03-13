import React from 'react';

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About AI Chef Recipe Cost Analysis</h1>
      
      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600">
            The Recipe Cost Analysis Application is designed for restaurant owners, chefs, and food service professionals who want to gain control over their recipe costs, optimize ingredient management, and maximize profitability. We provide a powerful yet intuitive platform that simplifies the complexities of cost analysis, helping businesses make data-driven pricing decisions with confidence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600">
            Our mission is to empower culinary professionals with smart, data-driven solutions that enhance their recipe profitability, streamline ingredient management, and drive operational efficiency. Whether you're managing a small bistro, a cloud kitchen, or a multi-location restaurant, our platform ensures that every dish on your menu is priced for success.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>Built for Restaurants</strong> – Designed specifically for chefs, restaurant owners, and kitchen managers.</li>
            <li><strong>Comprehensive Cost Analysis</strong> – From ingredient tracking to profit margin optimization, we give you complete financial visibility.</li>
            <li><strong>AI-Driven Insights</strong> – Leverage AI-powered recipe suggestions, automated cost calculations, and intelligent pricing recommendations.</li>
            <li><strong>User-Friendly & Scalable</strong> – Whether you're running a single café or a franchise network, our application scales with your needs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✔ Recipe Management – Organize, store, and modify recipes effortlessly.</li>
            <li>✔ Ingredient Tracking – Keep up with fluctuating ingredient costs and supplier details.</li>
            <li>✔ Profitability Insights – Analyze cost structures, track profit margins, and optimize menu pricing.</li>
            <li>✔ AI-Powered Assistance – Get smart recipe suggestions, AI-generated food photos, and automatic cost breakdowns.</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">
            At Recipe Cost Analysis Application, we believe that data is the key to better decisions. With our platform, you can focus on creating exceptional dishes while ensuring a profitable menu.
          </p>
          <p className="text-lg font-semibold text-indigo-600">
            🔗 Join us today and start optimizing your recipe costs! 🚀
          </p>
        </section>
      </div>
    </div>
  );
}