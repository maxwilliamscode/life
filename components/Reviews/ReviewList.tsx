import React from 'react';
import { Review } from '../../types/Review';
import { Rating } from '@mui/material';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 py-4">
          <div className="flex items-center">
            <p className="font-medium">{review.userName}</p>
            <Rating value={review.rating} readOnly />
          </div>
          <p className="text-gray-600 mt-2">{review.comment}</p>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
