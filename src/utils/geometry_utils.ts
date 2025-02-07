import { inRange } from './utils';

export interface Point {
  x: number
  y: number
  }

  export interface Line{
  point1: Point
  point2: Point
}

export function line_intersection(line1: Line, line2: Line): Point | null {
  const denominator = (
    (line1.point1.x - line1.point2.x) * (line2.point1.y - line2.point2.y))
    - ((line1.point1.y - line1.point2.y) * (line2.point1.x - line2.point2.x));
  if (denominator === 0) {
    return null; // There is no intersection. Lines are parallel or coincident
  }
  const aux1 = (line1.point1.x * line1.point2.y - line1.point1.y * line1.point2.x)
  const aux2 = (line2.point1.x * line2.point2.y - line2.point1.y * line2.point2.x)
  const intersection_point: Point = {
    x: (aux1 * (line2.point1.x - line2.point2.x) - (line1.point1.x - line1.point2.x) * aux2) / denominator,
    y: (aux1 * (line2.point1.y - line2.point2.y) - (line1.point1.y - line1.point2.y) * aux2) / denominator
  }

  if (!isPointOnLine(intersection_point, line1)
    || !isPointOnLine(intersection_point, line2))
    return null
  return intersection_point
}

function isPointOnLine(point: Point, line: Line): boolean {
// Because of float number precision, sometimes the max/min limits doesn`t catch
// point and line intersection, so if the point is on a very close range it is
// take as a valid point.
  if (Math.min(line.point1.x, line.point2.x) <= point.x
    && point.x <= Math.max(line.point1.x, line.point2.x)
    && (Math.min(line.point1.y, line.point2.y) <= point.y
      && point.y <= Math.max(line.point1.y, line.point2.y)
      || inRange(line.point1.y, point.y)
      && inRange(line.point2.y, point.y)))
    return true
  return false}

