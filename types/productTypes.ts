export interface ProductType {
  id: string;
  name: string;
  image: string;
  searchTerm: string;
  description?: string;
}

export interface ProductTypePageProps {
  types: ProductType[];
  title: string;
  description: string;
  bannerImage: string;
}
