import React from 'react';
import { Reward } from '@shared/schema';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
}

function RewardCard({ reward, userPoints }: RewardCardProps) {
  return (
    <div>
      <h2>{reward.title}</h2>
      <p>{reward.details}</p>
    </div>
  );
}

export default RewardCard;