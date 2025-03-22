
import { User, Product, Reward } from "@shared/schema";

export async function getUser(): Promise<User> {
  const res = await fetch("/api/user");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function redeemReward(rewardId: number): Promise<User> {
  const res = await fetch(`/api/rewards/${rewardId}/redeem`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to redeem reward");
  return res.json();
}

export async function getRewards(): Promise<Reward[]> {
  const res = await fetch("/api/rewards");
  if (!res.ok) throw new Error("Failed to fetch rewards");
  return res.json();
}
