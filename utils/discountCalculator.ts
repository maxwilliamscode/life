export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
  if (!discountPercentage || discountPercentage <= 0 || discountPercentage > 100) {
    return originalPrice;
  }
  
  const discountAmount = originalPrice * (discountPercentage / 100);
  const discountedPrice = originalPrice - discountAmount;
  return Number(discountedPrice.toFixed(2));
};
