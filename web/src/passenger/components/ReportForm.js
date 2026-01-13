import React, { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your luggage in detail..."
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Black, Red, Blue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Samsonite, Louis Vuitton"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Report Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Date Lost *</label>
          <input
            type="date"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Location Lost</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Airport, Hotel, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Contact Number *</label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-2">Photo of Luggage</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {formData.image ? (
                <div>
                  <p className="text-green-600 font-medium">{formData.image.name}</p>
                  <p className="text-gray-500 text-sm">Click to change</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">Drag and drop your image or click to select</p>
                  <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors"
        >
          Submit Report
        </button>
        <button
          type="button"
          className="flex-1 bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium text-xs hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
