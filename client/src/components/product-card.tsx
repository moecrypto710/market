// product-card.tsx
import React from 'react';

interface ProductCardProps {
  product: any; // Replace 'any' with the actual product type
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

export default ProductCard;