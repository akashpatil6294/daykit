/** AD ACTIVATION CONFIGURATION — the only publisher/slot configuration.
 * Keep disabled until account approval, a certified CMP and launch review.
 * Set real IDs from your AdSense account; never publish invented IDs. */
export const ads = {
  enabled: false,
  publisherId: '',
  slots: { leaderboard: '', 'in-content': '', sidebar: '', 'sticky-mobile': '' },
} as const;
