export const computeMaxAmountPerPlayer = (minimumPlayerCount, bidAmountPerTeam, playerBasePrice) => {
  if (minimumPlayerCount <= 0) throw new Error('minimumPlayerCount should be > 0');

  // Budget needed to buy remaining players at base price
  const reservedForOthers = (minimumPlayerCount - 1) * playerBasePrice;

  // Maximum we can spend on one player while still affording the rest
  let max = bidAmountPerTeam - reservedForOthers;

  // Check if the total budget is even enough to buy all players at base price
  const totalNeededAtBase = minimumPlayerCount * playerBasePrice;
  const feasible = bidAmountPerTeam >= totalNeededAtBase;

  if (!feasible) {
    return {
      maxAmountPerPlayer: playerBasePrice,
      feasible: false,
      reason: 'Insufficient total budget to buy minimum players at base price',
    };
  }

  // Ensure max is at least the base price
  max = Math.max(playerBasePrice, max);

  return { maxAmountPerPlayer: max, feasible: true };
};
