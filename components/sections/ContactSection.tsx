import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Fixed import path
import { useToast } from "@/components/ui/use-toast";

const ContactSection: React.FC = () => { // Removed invalid return type
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('messages')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Thank you for your message. We'll get back to you soon!"
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <section id="contact" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="mb-2 inline-block rounded-full bg-aqua-100 px-3 py-1 text-sm font-medium text-aqua-800">
            Get In Touch
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Have questions about our aquatic friends or need expert advice? Our dedicated team is here to help you with any inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-aqua-500 focus:border-aqua-500"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-aqua-500 focus:border-aqua-500"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-aqua-500 focus:border-aqua-500"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-aqua-500 focus:border-aqua-500"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>
              <Button className="w-full py-3">Send Message</Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Information</h3>
            <p className="text-gray-600 mb-8">
              Visit our store to see our beautiful collection in person or reach out through any of the channels below.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-aqua-100 p-3 rounded-full text-aqua-700">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Our Location</h4>
                  <p className="text-gray-600">LIFE STYLE AQUARIUM, No. 269 B, KIADB, Bommasandra Industrial Area, Bengaluru - 560099</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-aqua-100 p-3 rounded-full text-aqua-700">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Phone Number</h4>
                  <p className="text-gray-600">+91-9738276569</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-aqua-100 p-3 rounded-full text-aqua-700">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email Address</h4>
                  <p className="text-gray-600">support@lifestyleaqua.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-aqua-100 p-3 rounded-full text-aqua-700">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Opening Hours</h4>
                  <p className="text-gray-600">Mon - Fri: 9AM - 6PM</p>
                  <p className="text-gray-600">Sat: 10AM - 4PM</p>
                  <p className="text-gray-600">Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replace the existing Map div with this Google Maps iframe */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-[450px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3890.4948913964326!2d77.689831!3d12.811265!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17c426dc294b%3A0x915fc3403f3d8905!2sLife%20Style%20Aqua!5e0!3m2!1sen!2sin!4v1744040447126!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Life Style Aqua Location"
            className="w-full h-full"
          />
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
