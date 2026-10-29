/** A proportional floor plan fitted inside the practice diagram, in drawing pixels. */
export function exerciseFloor(lengthM: number, widthM: number) {
  const scale = Math.min(280 / lengthM, 180 / widthM);
  return { width: lengthM * scale, height: widthM * scale };
}
