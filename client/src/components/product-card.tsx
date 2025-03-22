
import React from 'react';

interface ProductCardProps {
  product: {
    name: string;
    description: string;
  };
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
