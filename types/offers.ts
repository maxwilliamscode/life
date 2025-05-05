export interface Offer {
  id: string;
  title: string;
  deadline: string;
  background_image: string;
  category: string;       // New field for product category
  target_url: string;     // New field for navigation
  created_at?: string;
  updated_at?: string;
}

// Database schema type
export interface DBOffer {
  id: number;
  title: string;
  description: string;
  bgcolor: string;
  icon: string;
  action: string;
  actiontext: string;
  period: string;
  backgroundimage: string;
  active: boolean;
}
