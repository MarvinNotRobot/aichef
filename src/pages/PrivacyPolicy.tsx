import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600">
            AI Chef Recipe Cost Analysis ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li><strong>Email Address:</strong> Required for account creation and authentication.</li>
              <li><strong>Recipe Data:</strong> Information about your recipes, ingredients, and costs.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our application.</li>
              <li><strong>Photos:</strong> Images you upload or generate for your recipes.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600">
            <li>To provide and maintain our service</li>
            <li>To authenticate your account and protect your data</li>
            <li>To improve our application and user experience</li>
            <li>To communicate with you about service updates</li>
            <li>To generate AI-powered recipe suggestions and cost analysis</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
          <p className="text-gray-600">
            We use Supabase, a secure cloud platform, to store your data. All data is encrypted in transit and at rest. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-600">
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Supabase:</strong> For user authentication and data storage</li>
            <li><strong>OpenAI:</strong> For AI-powered recipe suggestions and image generation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-600">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-600">
            We retain your data for as long as your account is active or as needed to provide you services. If you delete your account, we will delete or anonymize your data within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at privacy@aichef.example.com.
          </p>
        </section>

        <div className="mt-8 text-sm text-gray-500">
          Last Updated: March 1, 2025
        </div>
      </div>
    </div>
  );
}