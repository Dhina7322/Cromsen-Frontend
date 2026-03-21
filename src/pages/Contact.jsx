import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[0-9]{10,15}$/;

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 15);
    }
    if (name === 'email') {
      value = value.replace(/[^a-zA-Z0-9@._-]/g, '');
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!emailRegex.test(formData.email)) {
      return setError('Please enter a valid email address.');
    }
    if (!phoneRegex.test(formData.phone)) {
      return setError('Phone number must be 10-15 digits.');
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/inquiries', formData);
      setSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
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
                    No. 164, Trichy Road,<br />Opposite Ocean Restaurant,<br />Selvarajapuram, Coimbatore - 641103.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Phone size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Call Us</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    +91-98422 33645<br />99444 30314
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Mail size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Email Us</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    cscromsen@gmail.com
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <Clock size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Opening Hours</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Mon - Sat: 9:00 - 18:00<br />Sun: Closed
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
                        <div className="relative">
                          <input 
                            required
                            type="email" 
                            name="email"
                            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full bg-white border px-4 py-3 text-sm focus:outline-none transition-all pr-10 ${
                              formData.email ? (emailRegex.test(formData.email) ? 'border-green-500 focus:border-green-600' : 'border-red-500 focus:border-red-600') : 'border-gray-100 focus:border-primary'
                            }`} 
                          />
                          {formData.email && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {emailRegex.test(formData.email) ? (
                                <Check size={14} className="text-green-500" />
                              ) : (
                                <AlertCircle size={14} className="text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Your 10-digit number"
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
                      <CheckCircle size={40} />
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

      {/* Map Section */}
      <section className="h-[500px] w-full relative overflow-hidden">
        <iframe 
          src="https://maps.google.com/maps?q=164,%20Trichy%20Rd,%20opp.%20Ocean%20Restaurent,%20Selvaraja%20Puram,%20Coimbatore,%20Kannampalayam,%20Tamil%20Nadu%20641103&t=&z=13&ie=UTF8&iwloc=&output=embed" 
          className="w-full h-full border-0" 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
};

export default Contact;
