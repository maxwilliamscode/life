export const PRODUCT_CATEGORIES = {
  FISH: ['Arowana', 'Discus', 'Silver Dollar'],
  ACCESSORIES: ['Filter', 'Heater', 'Lighting', 'Decoration'],
  FOOD: ['Pellets', 'Flakes', 'Frozen Food', 'Live Food']
} as const;

export const getCategoryByType = (type: string) => {
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
