// product-card.tsx
import React from 'react';

interface ProductCardProps {
  product: any; // Replace 'any' with the actual product type
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      {/* Product card content here */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

export default ProductCard;


// reward-card.tsx (Example - needs actual content)
import React from 'react';

interface RewardCardProps {
  reward: any;
}

function RewardCard({ reward }: RewardCardProps) {
  return (
    <div>
      {/* Reward card content here */}
      <h2>{reward.title}</h2>
      <p>{reward.details}</p>
    </div>
  );
}

export default RewardCard;