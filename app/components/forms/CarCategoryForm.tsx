// components/Forms/CarCategoryForm.tsx
"use client";

import Image from "next/image";
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiX, FiSave, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

interface CarCategoryFormProps {
  type: "create" | "update";
  categoryData?: {
    title: string;
    description: string;
    image: string;
    priceFrom: string;
    features: string[];
    popular: boolean;
  };
  categoryId?: string;
  onSuccess?: () => void;
}

const CarCategoryForm: React.FC<CarCategoryFormProps> = ({
  type = "create",
  categoryData,
  categoryId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceFrom: "",
    features: [] as string[],
    popular: false,
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === "update" && categoryData) {
      setFormData({
        title: categoryData.title,
        description: categoryData.description,
        priceFrom: categoryData.priceFrom,
        features: categoryData.features,
        popular: categoryData.popular,
      });
      setExistingImage(categoryData.image || "");
    }
  }, [type, categoryData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    
    if (inputType === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(null);
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = () => {
    setExistingImage("");
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((feature) => feature !== featureToRemove),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!image && !existingImage) {
      setError("Category image is required");
      return;
    }

    if (formData.features.length === 0) {
      setError("At least one feature is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priceFrom", formData.priceFrom);
      formDataToSend.append("popular", formData.popular.toString());
      
      formData.features.forEach((feature) => formDataToSend.append("features", feature));

      if (image) {
        formDataToSend.append("image", image);
      }
      if (existingImage) {
        formDataToSend.append("existingImage", existingImage);
      }

      const url = type === "create" 
        ? "/api/category" 
        : `/api/category/${categoryId}`;
      const method = type === "create" ? "post" : "put";

      await axios[method](url, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Car category ${type === "create" ? "added" : "updated"} successfully`);
      onSuccess?.();
      if (type === "create") resetForm();
    } catch (err) {
      setError(axios.isAxiosError(err)
        ? err.response?.data?.error || err.message 
        : "An error occurred");
      toast.error("Failed to save car category");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priceFrom: "",
      features: [],
      popular: false,
    });
    setImage(null);
    setExistingImage("");
    setNewFeature("");
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-dark mb-6">
        {type === "create" ? "Add New Car Category" : "Edit Car Category"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Economy Cars, Luxury Vehicles"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price From (KES) *
            </label>
            <input
              type="number"
              name="priceFrom"
              value={formData.priceFrom}
              onChange={handleChange}
              required
              placeholder="e.g., KES 2,500/day"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe this car category and what makes it special..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Features *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature (e.g., Air Conditioning, GPS)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              <FiPlus className="h-4 w-4" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Image *
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <FiUpload /> Upload Category Image
          </button>
          
          <div className="mt-4">
            {existingImage && !preview && (
              <div className="relative inline-block">
                <Image
                  src={existingImage}
                  alt="Current category image"
                  width={200}
                  height={150}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={removeExistingImage}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1">Current image</p>
              </div>
            )}

            {preview && (
              <div className="relative inline-block">
                <Image
                  src={preview}
                  alt="Category preview"
                  width={200}
                  height={150}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1">New image preview</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="popular"
              checked={formData.popular}
              onChange={handleChange}
              className="rounded focus:ring-primary"
              disabled={loading}
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as Popular Category
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Popular categories will be highlighted and shown prominently
          </p>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-dark hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <FiSave />
            {loading ? "Processing..." : type === "create" ? "Add Category" : "Update Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CarCategoryForm;