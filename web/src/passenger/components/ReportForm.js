import React, { useState } from 'react';
import '../animations.css';

export default function ReportForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    description: '',
    color: '',
    brand: '',
    image: null,
    reportDate: new Date().toISOString().split('T')[0],
    location: '',
    contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description */}
        <div className="md:col-span-2 card-animated">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Description <span className="text-red-400">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your luggage in detail (scratches, stickers, etc.)"
            required
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
            rows="3"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Black, Red, Blue"
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Samsonite"
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
          />
        </div>

        {/* Report Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Date Lost <span className="text-red-400">*</span></label>
          <input
            type="date"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            required
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-medium [color-scheme:dark] focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Location Lost</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Airport, Hotel, etc."
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
          />
        </div>

        {/* Contact */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Contact Number <span className="text-red-400">*</span></label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required
            className="form-input-animated w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
          />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Photo of Luggage</label>
          <div className="border border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 hover:border-white/40 transition-all cursor-pointer group">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer w-full h-full block">
              {formData.image ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-white font-medium mb-1">{formData.image.name}</p>
                  <p className="text-gray-500 text-xs">Click to change</p>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10 group-hover:scale-110 transition-transform">
                  </div>
                  <p className="text-gray-300 font-medium mb-1">Upload Image</p>
                  <p className="text-gray-500 text-xs">JPG, PNG up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          className="order-2 sm:order-1 flex-1 px-6 py-3.5 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="order-1 sm:order-2 flex-1 px-6 py-3.5 bg-white text-black font-medium rounded-xl shadow-lg shadow-white/10 hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}
