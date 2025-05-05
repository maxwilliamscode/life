import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cookie } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 -z-10" />

      <div className="min-h-screen">
        {/* Add a spacer div for the fixed header */}
        <div className="h-20" />
        
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <Lock className="h-8 w-8 text-aqua-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-gray-600 mb-8">
                This privacy policy sets out how Life Style Aqua uses and protects any information that you give Life Style Aqua when you use this website. Policy effective from 28Feb2024.
              </p>

              {/* Information Collection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-aqua-600" />
                  Information We Collect
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Name and contact information</li>
                  <li>Email address</li>
                  <li>Demographic information</li>
                  <li>Preferences and interests</li>
                </ul>
              </div>

              {/* Information Usage */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Internal record keeping</li>
                  <li>Improving our products and services</li>
                  <li>Sending promotional emails</li>
                  <li>Market research purposes</li>
                </ul>
              </div>

              {/* Cookies Section */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cookie className="h-6 w-6 text-aqua-600" />
                  How We Use Cookies
                </h2>
                <p className="text-gray-600">
                  A cookie is a small file which asks permission to be placed on your computer's hard drive. We use traffic log cookies to identify which pages are being used and improve our website.
                </p>
              </div>

              {/* Security */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security</h2>
                <p className="text-gray-600">
                  We are committed to ensuring that your information is secure. We have put in place suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-aqua-50 p-6 rounded-lg mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-aqua-700 font-medium mt-2">www.lifestyleaqua.com</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
