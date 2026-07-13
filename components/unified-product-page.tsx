'use client';

import ProductPage from '@/components/product-page';

interface UnifiedProductPageProps {
  category: string;
  subcategory: string;
  title: string;
  description?: string;
  features?: string[];
  applications?: string[];
  specifications?: { [key: string]: string };
  productId: string;
}

export default function UnifiedProductPage({
  category,
  subcategory,
  title,
  description,
  features = [],
  applications = [],
  specifications = {},
  productId,
}: UnifiedProductPageProps) {
  return (
    <ProductPage
      category={category}
      subcategory={subcategory}
      title={title}
      description={description}
      features={features}
      applications={applications}
      specifications={specifications}
      productId={productId}
    />
  );
}
