// Screen-space dimensions shared by the symbol, its connection leaders and camera.
export const rearBodyHeight = 68;
export const outletSpacing = 14;

export function rearTruckHeight(count: number) {
  return Math.max(rearBodyHeight, 16 + count * outletSpacing);
}

export function rearOutletY(index: number) {
  return 15 + index * outletSpacing;
}
