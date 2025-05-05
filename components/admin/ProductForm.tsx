import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ProductFormProps {
  onSubmit: (formData: any) => void;
}

const PRODUCT_CATEGORIES = {
  FISH: ['Arowana', 'Discus', 'Silver Dollar'],
  ACCESSORIES: ['Filters', 'Heaters', 'Decorations'],
  FOOD: ['Pellets', 'Flakes', 'Frozen']
};

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    name: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    video_url: '' // Add this field
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getCategoryOptions = (type: string) => {
    switch (type) {
      case 'fish':
        return PRODUCT_CATEGORIES.FISH;
      case 'accessories':
        return PRODUCT_CATEGORIES.ACCESSORIES;
      case 'food':
        return PRODUCT_CATEGORIES.FOOD;
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            setFormData(prev => ({
              ...prev,
              type: value,
              category: getCategoryOptions(value)[0] // Set default category based on type
            }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fish">Fish</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="food">Food</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {getCategoryOptions(formData.type).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="border rounded p-2"
        />
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          className="border rounded p-2"
        />
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Stock Quantity</label>
        <input
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
          className="border rounded p-2"
        />
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Image URL</label>
        <input
          type="text"
          value={formData.image_url}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          className="border rounded p-2"
        />
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">Video URL (Optional)</label>
        <input
          type="text"
          value={formData.video_url}
          onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
          className="border rounded p-2"
          placeholder="Enter video URL (MP4 format recommended)"
        />
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default ProductForm;