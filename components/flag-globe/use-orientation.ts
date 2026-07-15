"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Quaternion, Vector3 } from "three";

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);
const AXIS_Z = new Vector3(0, 0, 1);

// Feel constants.
const DRAG_SPEED = 0.006; // rad per px
const INERTIA_DECAY = 0.94; // per frame
const INERTIA_EPS = 0.0004;
const IDLE_BEFORE_AUTOROTATE = 1.1; // s
const AUTOROTATE_SPEED = 0.14; // rad/s
const FOCUS_SLERP_RATE = 3.2; // higher = snappier
const FOCUS_DONE = 0.012; // rad
const HOLD_DURATION = 0.9; // s
const FLOAT_AMP = 0.025;
const FLOAT_SPEED = 0.55;

type Mode = "idle" | "drag" | "inertia" | "focus" | "hold";

interface OrientationOpts {
  autoRotate: boolean;
  reducedMotion: boolean;
  /** Local-space direction of the selected country's centroid. */
  focusDir: [number, number, number];
  /** Changes whenever a new selection should trigger the focus animation. */
  selectionKey: string;
}

/**
 * Imperative quaternion orientation for the globe (PRD §9). All state lives in
 * refs and is driven from a single useFrame — React re-renders never perturb it.
 * Drag → world-axis delta quats + inertia (FR-5); idle auto-rotate (FR-6);
 * selection slerps the centroid to face the camera then holds (FR-7);
 * reduced-motion disables float/auto-rotate and snaps the focus (FR-13).
 */
export function useOrientation(
  groupRef: RefObject<Group | null>,
  opts: OrientationOpts
) {
  const { gl } = useThree();

  // Live-updated option refs so the frame loop reads current values.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const s = useRef({
    q: new Quaternion(),
    qTarget: new Quaternion(),
    tmpA: new Quaternion(),
    tmpB: new Quaternion(),
    dir: new Vector3(),
    mode: "focus" as Mode,
    vYaw: 0,
    vPitch: 0,
    idleTime: 0,
    holdTime: 0,
    elapsed: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const applyDelta = (yaw: number, pitch: number) => {
    const st = s.current;
    st.tmpA.setFromAxisAngle(AXIS_Y, yaw);
    st.tmpB.setFromAxisAngle(AXIS_X, pitch);
    st.q.premultiply(st.tmpA); // world-frame yaw
    st.q.premultiply(st.tmpB); // world-frame pitch
  };

  // Trigger the focus animation whenever the selection changes.
  useEffect(() => {
    const st = s.current;
    st.dir.set(opts.focusDir[0], opts.focusDir[1], opts.focusDir[2]).normalize();
    st.qTarget.setFromUnitVectors(st.dir, AXIS_Z);
    if (optsRef.current.reducedMotion) {
      st.q.copy(st.qTarget);
      st.mode = "idle";
      st.idleTime = 0;
    } else {
      st.mode = "focus";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.selectionKey]);

  // Pointer / touch drag on the actual canvas element (covers the whole globe,
  // not only mesh hits). window move/up so a drag survives leaving the canvas.
  useEffect(() => {
    const el = gl.domElement;
    const st = s.current;

    const onDown = (e: PointerEvent) => {
      st.dragging = true;
      st.mode = "drag";
      st.vYaw = 0;
      st.vPitch = 0;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      const yaw = dx * DRAG_SPEED;
      const pitch = dy * DRAG_SPEED;
      applyDelta(yaw, pitch);
      st.vYaw = yaw;
      st.vPitch = pitch;
    };
    const onUp = () => {
      if (!st.dragging) return;
      st.dragging = false;
      st.mode = optsRef.current.reducedMotion ? "idle" : "inertia";
      st.idleTime = 0;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const st = s.current;
    const { autoRotate, reducedMotion } = optsRef.current;
    const dt = Math.min(delta, 0.05); // clamp long frames
    st.elapsed += dt;

    switch (st.mode) {
      case "inertia":
        applyDelta(st.vYaw, st.vPitch);
        st.vYaw *= INERTIA_DECAY;
        st.vPitch *= INERTIA_DECAY;
        if (Math.abs(st.vYaw) < INERTIA_EPS && Math.abs(st.vPitch) < INERTIA_EPS) {
          st.mode = "idle";
          st.idleTime = 0;
        }
        break;
      case "idle":
        st.idleTime += dt;
        if (autoRotate && !reducedMotion && st.idleTime > IDLE_BEFORE_AUTOROTATE) {
          applyDelta(AUTOROTATE_SPEED * dt, 0);
        }
        break;
      case "focus": {
        const t = Math.min(1, dt * FOCUS_SLERP_RATE);
        st.q.slerp(st.qTarget, t);
        if (st.q.angleTo(st.qTarget) < FOCUS_DONE) {
          st.q.copy(st.qTarget);
          st.mode = "hold";
          st.holdTime = 0;
        }
        break;
      }
      case "hold":
        st.holdTime += dt;
        if (st.holdTime > HOLD_DURATION) {
          st.mode = "idle";
          st.idleTime = 0;
        }
        break;
      // "drag" applies deltas directly in the move handler.
    }

    group.quaternion.copy(st.q);
    group.position.y = reducedMotion ? 0 : Math.sin(st.elapsed * FLOAT_SPEED) * FLOAT_AMP;
  });
}
