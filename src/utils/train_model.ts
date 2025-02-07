import { line_intersection } from './geometry_utils';
import type { Line } from './geometry_utils';

interface TrainData {
  gravity: number
  rho: number
  vel_max: number
  vel_1v: number
  pow_max: number
  torq_max: number
  mass: number
  mass_rotating: number
  wheel_diam: number
  wheel_diam_old: number
  cr: number
  cc: number
  cx: number
  surface: number
  axles: number
  slope?: number
  ar: number
}

export function getPowerSpeedCurve(pow_max: number, vel_1v: number, vel_arr: number[]): { vel: number; pow: number; }[] {
  if (vel_1v <= 0 || pow_max <= 0) {
    throw new Error("Power and 1/v velocity point must be positive values.");
  }
  if (vel_arr.length === 0) {
    return [];
  }
  const slope_p_max = pow_max / vel_1v; // [kW/km/h]
  return vel_arr.map(v => ({
      vel: v,
      pow: (v <= vel_1v ? v * slope_p_max : pow_max)
    }));
}

export function getTorqueSpeedCurve(torq_max: number, pow_curve: { vel: number; pow: number; }[], vel_1v: number): { vel: number; torq: number; }[] {
  if (vel_1v <= 0 || torq_max <= 0) {
    throw new Error("Torque and 1/v velocity point must be positive values.");
  }
  if (pow_curve.length === 0) {
    return [];
  }
  return pow_curve.map(({vel, pow}) => ({
    vel: vel,
    torq: (vel <= vel_1v ? torq_max : (pow * 36 / vel /10))
  }));
}

export function getResistance(data: TrainData, vel_arr: number[],
  add_curve: boolean = false, add_inertia: boolean = false, add_slope: boolean = false,
  add_aerodinamic: boolean = false) {
  let r_static = 0 // [N]
  r_static = data.mass * data.gravity * data.cr; // Resistance due to running
  if (add_curve)
    r_static += data.mass * data.gravity * data.cc; // Resistance due to the curve
  if (add_inertia)
    r_static += data.mass * data.ar; // Inertia
  if (add_slope)
    r_static += data.mass * data.gravity * (data.slope / 1000); // Resistance due to the slope

  const r_total = vel_arr.map(v => {
    let r_dinamic = 0 // [N]
    if (add_aerodinamic)
      r_dinamic += 0.5 * (v / 3.6) ** 2 * data.rho * data.cx * data.surface; // Aerodynamic resistance
    // const marrus = (0.2 * (8 + 0.1 * v) / (8 + 0.2 * v) * data.mass * data.gravity * 0.25);
    return {
      vel: v,
      resis: (r_static + r_dinamic) / 1000 // [kN]
    }
  });

  // Apply a 5% margin to be able to maintain maximum speed
  const r_5 = r_total.map(({vel, resis}) => ({
    vel: vel,
    resis: resis * 1.05
  }));

  return {r_total, r_5}
}

export function getVmax(torq, resis) {
  // Requirement:
  // Power curve and resistance curve must have the same length and velocity values
  let pre_vel: number = 0
  let pre_i: number = 0
  for (let i = 0; i < torq.length; i++) {
    if (i == 0) {
      pre_i = i
      pre_vel = torq[i].vel
      continue; // Skip the first iteration
    }
    const torq_line: Line = {
      point1: {x: pre_vel, y: torq[pre_i].torq},
      point2: {x: torq[i].vel, y: torq[i].torq},
    }
    const resis_line: Line = {
      point1: {x: pre_vel, y: resis[pre_i].resis},
      point2: {x: resis[i].vel, y: resis[i].resis},
    }
    const intersection = line_intersection(torq_line, resis_line)
    if (intersection) return intersection
    pre_i = i
    pre_vel = torq[i].vel
  }
  return null
}
