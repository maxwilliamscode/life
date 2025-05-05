import React from 'react';
import { motion } from 'framer-motion';

const TermsConditions = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Terms and Conditions
            </h1>

            <div className="prose prose-slate max-w-none">
              <p className="text-gray-600 mb-6">
                Welcome to our website. If you continue to browse and use this website you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern Life Style Aqua with you in relation to this website.
              </p>

              {/* Company Information */}
              <div className="mb-8">
                <p className="text-gray-600">
                  The term Life Style Aqua or 'us' or 'we' refers to the owner company of the website whose registered office is Life Style Aqua, Bangalore 560094 Karnataka, India. The term 'you' refers to the user or viewer of our website.
                </p>
              </div>

              {/* Terms of Use */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Terms of Use</h2>
              <ul className="list-disc list-inside space-y-4 text-gray-600 mb-8">
                <li>The content of the pages of this website is for your general information and use only. It is subject to change without notice.</li>
                <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose.</li>
                <li>Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable.</li>
                {/* ...more terms... */}
              </ul>

              {/* Health Information */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Health Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <p className="mb-4">The undersigned, certify that:</p>
                <ol className="list-decimal list-inside space-y-3 text-gray-600">
                  <li>The consignment was inspected 72 hours prior to shipment.</li>
                  <li>The live fish came from an officially recognized country, zone, farm or establishment unaffected by the WOAH listed diseases.</li>
                  {/* ...more health points... */}
                </ol>
              </div>

              {/* Live Arrival Guarantee */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Live Arrival Guarantee</h2>
              <div className="bg-aqua-50 p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-3">For all arowana shipments:</h3>
                <ul className="list-disc list-inside space-y-3 text-gray-600">
                  <li>Box opening video to be made. Video must be taken in one shot; no cut or edited video will be accepted.</li>
                  <li>In case of death on arrival, the video must be in our same package.</li>
                  {/* ...more guarantee terms... */}
                </ul>
              </div>

              {/* Shipping Policy */}
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping / Delivery Policy</h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 mb-8">
                <li>We guarantee live on arrival. In case of mortality, we claim and replace the fish for free in the same price but, shipping will be chargeable.</li>
                <li>Once we receive your order on live fishes, we may take 5-6 working days to deliver the product.</li>
                {/* ...more shipping terms... */}
              </ol>

              {/* Jurisdiction */}
              <div className="bg-gray-800 text-white p-6 rounded-lg mt-8">
                <p className="font-semibold">All disputes are subject to Bangalore jurisdiction only</p>
                <p className="text-sm mt-2 text-gray-300">* The above terms and conditions may change anytime with or without prior notice.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
