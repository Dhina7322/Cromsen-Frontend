import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { createInquiry } from '../services/api';

// ─── Strict email: TLD max 6 chars, nothing after it ─────────────────────────
const isValidEmail = (v) => {
  if (!v) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$/.test(v);
};
const phoneRegex = /^[0-9]{10,15}$/;
const EMAIL_DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','ymail.com'];

// ─── EmailInput ───────────────────────────────────────────────────────────────
function EmailInput({ value, onChange, required, inputClassName = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const valid   = isValidEmail(value);
  const invalid = value && !valid;

  const atIdx   = value?.indexOf('@') ?? -1;
  const local   = atIdx >= 0 ? value.slice(0, atIdx) : value;
  const afterAt = atIdx >= 0 ? value.slice(atIdx + 1) : '';
  const suggestions = atIdx >= 0
    ? EMAIL_DOMAINS.filter(d => d.startsWith(afterAt) && `${local}@${d}` !== value).map(d => `${local}@${d}`)
    : [];

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const pick = (val) => { onChange({ target: { name: 'email', value: val } }); setOpen(false); };

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\s/g, '');
    // Block typing once email is already valid (prevents .comweweq)
    if (raw.length > (value?.length || 0) && isValidEmail(value)) return;
    onChange({ target: { name: 'email', value: raw } });
    setOpen(true);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          required={required}
          type="text"
          name="email"
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          className={`${inputClassName} pr-10 ${
            value
              ? valid
                ? 'border-green-500 focus:border-green-600'
                : 'border-red-400 focus:border-red-500'
              : ''
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid
              ? <Check size={14} className="text-green-500" />
              : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {invalid && (
        <p className="text-[10px] text-red-400 mt-1 font-medium">
          {value.includes('@')
            ? 'Nothing allowed after .com / .in — check your email'
            : 'Enter a valid email — e.g. name@gmail.com'}
        </p>
      )}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl mt-1 py-1 overflow-hidden"
          >
            {suggestions.map(s => (
              <li
                key={s}
                onMouseDown={() => pick(s)}
                className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <span className="text-gray-400">{local}</span>
                <span className="font-bold text-primary">@{s.split('@')[1]}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────
function PhoneInput({ value, onChange, required, inputClassName = '' }) {
  const isValid   = value && phoneRegex.test(value);
  const isInvalid = value && !phoneRegex.test(value);

  return (
    <div>
      <div className="relative">
        <input
          required={required}
          type="tel"
          name="phone"
          value={value}
          placeholder="Your 10–15 digit number"
          onChange={e => onChange({ target: { name: 'phone', value: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) } })}
          className={`${inputClassName} pr-10 ${
            value
              ? isValid
                ? 'border-green-500 focus:border-green-600'
                : 'border-red-400 focus:border-red-500'
              : ''
          }`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid
              ? <Check size={14} className="text-green-500" />
              : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}
      </div>
      {isInvalid && (
        <p className="text-[10px] text-red-400 mt-1 font-medium">Must be 10–15 digits, numbers only</p>
      )}
    </div>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────
const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', message: ''
  });
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(formData.email))    return setError('Please enter a valid email address.');
    if (!phoneRegex.test(formData.phone)) return setError('Phone number must be 10–15 digits.');
    setLoading(true);
    setError('');
    try {
      await createInquiry(formData);
      setSubmitted(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Contact Submission Error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const baseInput = "w-full bg-white border border-gray-100 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="bg-primary/5 py-32 text-center">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <span className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Get in touch</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight">Contact Us</h1>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-serif mb-8">Feel free to reach out</h2>
                <p className="text-gray-600 font-light text-lg leading-relaxed mb-10">
                  Whether you have a question about our collections, need help with measurements, or want to schedule a consultation, our team is here to help.
                </p>
              </div>
              <div className="flex flex-col space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-accent mb-2">
                    <MapPin size={24} />
                    <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Visit Us</h3>
                  </div>
                  <div className="space-y-6 pl-9">
                    <div>
                      <h4 className="text-[11px] uppercase tracking-widest font-black text-primary mb-1">Cromsen Head Office</h4>
                      <a 
                        href="https://maps.google.com/maps?q=164,%20Trichy%20Rd,%20opp.%20Ocean%20Restaurent,%20Selvaraja%20Puram,%20Coimbatore,%20Kannampalayam,%20Tamil%20Nadu%20641103"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-base leading-relaxed hover:text-action transition-colors"
                      >
                        No. 164, Trichy Road,<br />Opposite Ocean Restaurant,<br />Selvarajapuram, Coimbatore - 641103.
                      </a>
                    </div>
                    <div>
                      <h4 className="text-[11px] uppercase tracking-widest font-black text-primary mb-1">Manufacturing Unit</h4>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=2,+Kallanthottam,+Kannampalayam,+Coimbatore,+TAMIL+NADU+641402"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-base leading-relaxed hover:text-action transition-colors"
                      >
                        2, Kallanthottam, Kannampalayam<br/>Coimbatore, TAMIL NADU, 641402
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-accent mb-2">
                      <Phone size={24} />
                      <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Call Us</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">+91-98422 33645<br />99444 30314</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-accent mb-2">
                      <Mail size={24} />
                      <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Email Us</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">cscromsen@gmail.com</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-accent mb-2">
                      <Clock size={24} />
                      <h3 className="text-sm uppercase tracking-widest font-bold text-neutral-dark">Opening Hours</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">Mon - Sat: 9:00 - 18:00<br />Sun: Closed</p>
                  </div>
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
                          <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className={baseInput} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Last Name</label>
                          <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={baseInput} />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Email Address</label>
                        <EmailInput
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          inputClassName={baseInput}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Phone Number</label>
                        <PhoneInput
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          inputClassName={baseInput}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">How can we help?</label>
                        <textarea required name="message" value={formData.message} onChange={handleInputChange} rows="5" className={baseInput}></textarea>
                      </div>

                      {error && <p className="text-red-500 text-xs">{error}</p>}

                      <button
                        disabled={loading || !isValidEmail(formData.email) || !phoneRegex.test(formData.phone)}
                        className="btn-primary w-full flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Sending...' : (
                          <><Send size={16} className="group-hover:translate-x-1 transition-transform" /> Send Message</>
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
                    <p className="text-gray-600 mb-8 max-w-sm">Thank you for reaching out. Our team will review your inquiry and get back to you shortly.</p>
                    <button onClick={() => setSubmitted(false)} className="text-primary font-bold uppercase tracking-widest text-xs hover:underline">Send another message</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="h-[500px] w-full relative overflow-hidden rounded-3xl shadow-xl border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15668.618649363845!2d77.0655474!3d11.0000000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8500!2sCromsen%20Importers!5e0!3m2!1sen!2sin!4v1711200000000"
              className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;