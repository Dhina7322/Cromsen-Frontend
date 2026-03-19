import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Search, 
  Eye, 
  Clock,
  User,
  MessageSquare,
  X,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const API = "/api";

export default function InquiriesTab() {
  const { showToast } = useOutletContext();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/inquiries`);
      const data = res.data?.inquiries || (Array.isArray(res.data) ? res.data : []);
      setInquiries(data);
    } catch (err) {
      console.error("Fetch Inquiries Error:", err);
      showToast("error", "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const searchStr = `${inq.firstName} ${inq.lastName} ${inq.email} ${inq.message}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="searchbox">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search inquiries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
           <button className="topbar-btn" onClick={fetchInquiries} disabled={loading}>
             <Clock size={14} /> Refresh
           </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Message Preview</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="empty-row">Loading inquiries...</td></tr>
            ) : filteredInquiries.map(inq => (
              <tr key={inq._id}>
                <td className="date-cell">{new Date(inq.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="cust-name">{inq.firstName} {inq.lastName}</div>
                </td>
                <td><div className="text-gray-500 text-sm">{inq.email}</div></td>
                <td>
                  <div className="text-gray-400 text-sm truncate max-w-[300px]">
                    {inq.message}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                   <div className="row-acts">
                     <button className="icon-btn" onClick={() => setSelectedInquiry(inq)} title="View Full Message"><Eye size={14}/></button>
                   </div>
                </td>
              </tr>
            ))}
            {!loading && filteredInquiries.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No inquiries found matching criteria</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }} 
              className="modal max-w-2xl"
            >
              <div className="modal-head">
                 <h2>Customer Inquiry</h2>
                 <button className="icon-btn" onClick={() => setSelectedInquiry(null)}><X size={18}/></button>
              </div>
              <div className="om-body flex-col gap-6" style={{ padding: '30px' }}>
                <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">{selectedInquiry.firstName} {selectedInquiry.lastName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={14}/> {selectedInquiry.email}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-widest flex items-center justify-end gap-2">
                       <Calendar size={12}/> {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(selectedInquiry.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-action">
                    <MessageSquare size={18} />
                    <span className="text-xs uppercase tracking-widest font-bold">Message Contents</span>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=Re: Cromsen Inquiry`}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Mail size={16} /> Reply via Email
                  </a>
                  <button className="btn-secondary flex-1" onClick={() => setSelectedInquiry(null)}>Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
