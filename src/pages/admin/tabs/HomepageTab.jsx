import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Layout, Eye, EyeOff, Search, X, Check } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getHomepageConfig, updateHomepageConfig, getProducts, getCategories } from "../../../services/api";

const MultiSelect = ({ label, items, selectedIds, onSelectionChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(item => 
    item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItems = items.filter(item => selectedIds.includes(item._id || item.id));

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div 
          className="min-h-[46px] p-2 bg-gray-50 border border-gray-200 rounded-xl shadow-sm cursor-pointer flex flex-wrap gap-2 items-center hover:border-action transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedItems.length > 0 ? (
            selectedItems.map(item => (
              <span key={item._id || item.id} className="bg-action text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded flex items-center gap-1 group shadow-sm">
                {item.name}
                <X 
                  size={12} 
                  className="hover:scale-125 transition-transform" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange(selectedIds.filter(id => id !== (item._id || item.id)));
                  }} 
                />
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm pl-2">{placeholder}</span>
          )}
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                <Search size={14} className="text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  className="bg-transparent border-none outline-none text-xs w-full font-bold"
                  placeholder="Filter items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredItems.map(item => {
                  const itemId = item._id || item.id;
                  const isSelected = selectedIds.includes(itemId);
                  return (
                    <div 
                      key={itemId}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-action/10 text-action' : 'hover:bg-gray-50 text-gray-600 hover:translate-x-1'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          onSelectionChange(selectedIds.filter(id => id !== itemId));
                        } else {
                          onSelectionChange([...selectedIds, itemId]);
                        }
                      }}
                    >
                      <span className="text-xs font-bold">{item.name}</span>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs italic">No items matching your search</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SectionToggle = ({ label, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-action/20 hover:bg-white transition-all group">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl transition-all ${enabled ? 'bg-action text-white shadow-lg shadow-action/30' : 'bg-gray-100 text-gray-400'}`}>
        {enabled ? <Eye size={18} /> : <EyeOff size={18} />}
      </div>
      <div>
        <h4 className="text-sm font-bold text-primary">{label}</h4>
        <p className={`text-[9px] font-black uppercase tracking-widest ${enabled ? 'text-action' : 'text-gray-400'}`}>
          {enabled ? 'Visible' : 'Hidden'}
        </p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${enabled ? 'bg-action' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

export default function HomepageTab() {
  const { showToast } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState({
    showHero: true,
    showCategories: true,
    showPopular: true,
    showFeatured: true,
    showCustomSection: false,
    popularProducts: [],
    featuredProducts: [],
    selectedCategories: [],
    customSectionTitle: "",
    customSectionProducts: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configData, productsData, categoriesData] = await Promise.all([
        getHomepageConfig(),
        getProducts({ limit: 1000 }),
        getCategories()
      ]);
      
      const extractIds = (items) => items.map(item => (typeof item === 'object' ? (item._id || item.id) : item));

      setConfig({
        ...configData,
        popularProducts: extractIds(configData.popularProducts || []),
        featuredProducts: extractIds(configData.featuredProducts || []),
        selectedCategories: extractIds(configData.selectedCategories || []),
        customSectionProducts: extractIds(configData.customSectionProducts || [])
      });
      
      setProducts(productsData.products || productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHomepageConfig(config);
      showToast("success", "Homepage layout updated successfully!");
    } catch (err) {
      showToast("error", "Failed to update homepage");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <div className="w-12 h-12 border-4 border-action/20 border-t-action rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Configuration</p>
      </div>
    );
  }

  return (
    <div className="section-gap max-w-6xl animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-8 bg-action"></span>
            <p className="text-[10px] font-black uppercase tracking-widest text-action">Dynamic CMS</p>
          </div>
          <h2 className="text-3xl font-serif text-primary">Homepage Control Center</h2>
          <p className="text-sm text-gray-500 mt-1">Design your landing page experience in real-time</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-xl shadow-action/20 hover:shadow-action/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          <span className="font-bold tracking-tight">{saving ? 'Publishing...' : 'Publish Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visibility Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Layout size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary">Layout Structure</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Enable or disable sections</p>
              </div>
            </div>
            <div className="space-y-4">
              <SectionToggle label="Hero Banner" enabled={config.showHero} onToggle={() => setConfig({...config, showHero: !config.showHero})} />
              <SectionToggle label="Featured Categories" enabled={config.showCategories} onToggle={() => setConfig({...config, showCategories: !config.showCategories})} />
              <SectionToggle label="Popular Items" enabled={config.showPopular} onToggle={() => setConfig({...config, showPopular: !config.showPopular})} />
              <SectionToggle label="Premium Collection" enabled={config.showFeatured} onToggle={() => setConfig({...config, showFeatured: !config.showFeatured})} />
              <SectionToggle label="Custom Marketing Slot" enabled={config.showCustomSection} onToggle={() => setConfig({...config, showCustomSection: !config.showCustomSection})} />
            </div>
            
            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group">
              <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                <span className="font-black">PRO TIP:</span> Hidden sections won't fetch data from the server, improving page speed for your users.
              </p>
            </div>
          </div>
        </div>

        {/* Content Controls */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-action/5 flex items-center justify-center text-action">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Section Content</h3>
                <p className="text-xs text-gray-400">Select which items appear in each visible section</p>
              </div>
            </div>

            <div className="space-y-8">
              <MultiSelect 
                label="Explore Categories"
                items={categories}
                selectedIds={config.selectedCategories}
                onSelectionChange={(ids) => setConfig({...config, selectedCategories: ids})}
                placeholder="Choose categories to display in 'Shop by Category'"
              />

              <div className="h-px bg-gray-50 w-full"></div>

              <MultiSelect 
                label="Popular Products"
                items={products}
                selectedIds={config.popularProducts}
                onSelectionChange={(ids) => setConfig({...config, popularProducts: ids})}
                placeholder="Search and select products for the Popular section"
              />

              <MultiSelect 
                label="Premium Collection"
                items={products}
                selectedIds={config.featuredProducts}
                onSelectionChange={(ids) => setConfig({...config, featuredProducts: ids})}
                placeholder="Select high-end products to showcase"
              />

              {/* Custom Section Details */}
              <div className={`mt-12 pt-12 border-t border-dashed border-gray-100 transition-all duration-500 rounded-2xl p-6 ${config.showCustomSection ? 'bg-action/5 opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                    <Save size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">Custom Marketing Section</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-action">Seasonal / Promo Slot</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Title</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-action/10 focus:border-action outline-none transition-all font-serif text-xl text-primary"
                    placeholder="e.g. Summer Breeze Collection"
                    value={config.customSectionTitle || ""}
                    onChange={(e) => setConfig({...config, customSectionTitle: e.target.value})}
                  />
                  <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter italic pl-1">This title appears at the top of the custom section</p>
                </div>

                <MultiSelect 
                  label="Featured Products for Custom Slot"
                  items={products}
                  selectedIds={config.customSectionProducts}
                  onSelectionChange={(ids) => setConfig({...config, customSectionProducts: ids})}
                  placeholder="Finalise items for your custom section"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
