import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/inquiries', formData);
      setSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Page Header */}
      <section className="bg-primary/5 py-32 text-center">
        <div className="container mx-auto max-w-[1200px] px-5">
          <span className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Get in touch</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">Contact Us</h1>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-serif mb-8">Feel free to reach out</h2>
                <p className="text-gray-600 font-light text-lg leading-relaxed mb-10">
                  Whether you have a question about our collections, need help with measurements, or want to schedule a consultation, our team is here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <MapPin size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Visit Us</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    123 Design District<br />Luxury Way, NY 10001
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Phone size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Call Us</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    +1 (234) 567-890<br />+1 (234) 890-123
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Mail size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Email Us</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    info@cromsen.com<br />support@cromsen.com
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Clock size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Opening Hours</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Mon - Fri: 9:00 - 18:00<br />Sat: 10:00 - 15:00
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-secondary p-8 md:p-12">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h2 className="text-2xl font-serif mb-8">Send a message</h2>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">First Name</label>
                          <input 
                            required
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Last Name</label>
                          <input 
                            required
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Email Address</label>
                        <input 
                          required
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">How can we help?</label>
                        <textarea 
                          required
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows="5" 
                          className="w-full bg-white border border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        ></textarea>
                      </div>
                      {error && <p className="text-red-500 text-xs">{error}</p>}
                      <button 
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 group"
                      >
                        {loading ? 'Sending...' : (
                          <>
                            Send Message <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-serif mb-4">Message Sent!</h2>
                    <p className="text-gray-600 mb-8 max-w-sm">
                      Thank you for reaching out. Our team will review your inquiry and get back to you shortly.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-primary font-bold uppercase tracking-widest text-xs hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[500px] w-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop" 
          alt="Map" 
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Find us in the Design District</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
