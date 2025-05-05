import React, { useState } from 'react';
import { Rating, Button, TextField } from '@mui/material';

interface AddReviewProps {
  onSubmit: (rating: number, comment: string) => void;
}

const AddReview: React.FC<AddReviewProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating && comment.trim()) {
      onSubmit(rating, comment);
      setRating(0);
      setComment('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      <div className="mb-4">
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          size="large"
        />
      </div>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about this product..."
        className="mb-4"
      />
      <Button
        variant="contained"
        type="submit"
        disabled={!rating || !comment.trim()}
      >
        Submit Review
      </Button>
    </form>
  );
};

export default AddReview;
