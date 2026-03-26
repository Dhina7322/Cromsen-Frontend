import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Layers, Check, AlertCircle, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";

const API = import.meta.env.VITE_API_URL || "/api";
const adminHeaders = { headers: { 'x-user-role': 'admin' } };

export default function ServicesTab() {
  const { showToast } = useOutletContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    heading: "",
    shortDescription: "",
    longDescription: "",
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API}/services`, adminHeaders);
      setServices(res.data);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        heading: service.heading,
        shortDescription: service.shortDescription,
        longDescription: service.longDescription,
        isActive: service.isActive
      });
      setImagePreview(service.image ? getImageUrl(service.image) : "");
    } else {
      setEditingService(null);
      setFormData({
        heading: "",
        shortDescription: "",
        longDescription: "",
        isActive: true
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !editingService) {
      showToast("error", "Please select a service image.");
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append("heading", formData.heading);
    data.append("shortDescription", formData.shortDescription);
    data.append("longDescription", formData.longDescription);
    data.append("isActive", formData.isActive);
    if (imageFile) data.append("image", imageFile);

    try {
      if (editingService) {
        await axios.put(`${API}/services/${editingService._id}`, data, adminHeaders);
        showToast("success", "Service updated");
      } else {
        await axios.post(`${API}/services`, data, adminHeaders);
        showToast("success", "Service created");
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save service";
      showToast("error", msg);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await axios.delete(`${API}/services/${id}`, adminHeaders);
      showToast("success", "Service deleted");
      fetchServices();
    } catch { showToast("error", "Failed to delete service"); }
  };

  return (
    <div className="section-gap">
      <div className="toolbar">
        <div className="toolbar-left">
          <h2 className="text-xl font-bold text-gray-800">Cromsen Services</h2>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <motion.div
            key={s._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            <div className="relative h-48 bg-gray-100">
              {s.image ? (
                <img src={getImageUrl(s.image)} alt={s.heading} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={40} />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(s)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-blue-600 shadow-sm hover:bg-white">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:bg-white">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{s.heading}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{s.shortDescription}</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {s.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Layers size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-bold">No services found</h3>
            <p className="text-sm text-gray-400 mt-1">Create services to show on your landing page and services listing.</p>
          </div>
        )}
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal"
              style={{ maxWidth: 700 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-head">
                <h2>{editingService ? 'Edit Service' : 'New Service'}</h2>
                <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body space-y-6">
                  <div className="fg">
                    <label>Heading</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Professional Installation"
                      value={formData.heading}
                      onChange={e => setFormData({ ...formData, heading: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label>Service Image</label>
                    <div className="upload-wrap" style={{ width: '100%' }}>
                      <label className="upload-box" style={{ width: '100%', height: '160px' }}>
                        <input type="file" className="hidden-input" onChange={handleImageChange} />
                        {imagePreview ? (
                          <img src={imagePreview} className="upload-preview" alt="Preview" />
                        ) : (
                          <><ImageIcon size={32} /><span className="text-xs mt-2 uppercase font-black tracking-widest opacity-60">Upload Cover Image</span></>
                        )}
                      </label>
                      {imagePreview && (
                        <button type="button" className="remove-img" onClick={() => { setImagePreview(""); setImageFile(null); }}>
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="fg">
                    <label>Short Description (Listing Preview)</label>
                    <textarea
                      required
                      rows="2"
                      placeholder="Brief overview of the service..."
                      value={formData.shortDescription}
                      onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label>Long Description (Detail Page Content)</label>
                    <textarea
                      required
                      rows="8"
                      placeholder="Full details, benefits, and process..."
                      value={formData.longDescription}
                      onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="serviceActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="serviceActive" className="text-sm font-bold text-gray-700">Display Publicly</label>
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
