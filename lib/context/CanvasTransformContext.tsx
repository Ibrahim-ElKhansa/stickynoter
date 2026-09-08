"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CANVAS_MAX_SCALE, CANVAS_MIN_SCALE } from "@/lib/constants/stickyNotes";

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * The stable half of the context: setters and ref reads whose identities never
 * change. Notes subscribe only to this, so a pan frame re-renders the canvas
 * wrapper and nothing else.
 *
 * This replaces a window CustomEvent channel that was subscribed to once per
 * note, which meant N notes produced N+1 duplicate transform states, N+1
 * window listeners and N+1 setState calls per pan frame.
 */
interface CanvasTransformApi {
  /** The element that clips the canvas. Gesture math is relative to its rect. */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /** Live transform, for gesture math. Reading it never causes a render. */
  getTransform: () => CanvasTransform;
  setTransform: (
    next: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform),
  ) => void;
  panBy: (dx: number, dy: number) => void;
  /** Zoom by a multiplicative factor, keeping the given client point fixed. */
  zoomBy: (factor: number, clientX: number, clientY: number) => void;
  resetTransform: () => void;
  /** Client (screen) coordinates to canvas coordinates. */
  toCanvasPoint: (clientX: number, clientY: number) => CanvasPoint;
  /** Canvas coordinates of the centre of the visible viewport. */
  getViewportCenter: () => CanvasPoint;
}

const IDENTITY: CanvasTransform = { x: 0, y: 0, scale: 1 };

const CanvasTransformApiContext = createContext<CanvasTransformApi | undefined>(undefined);
const CanvasTransformValueContext = createContext<CanvasTransform>(IDENTITY);

function clampScale(scale: number): number {
  return Math.max(CANVAS_MIN_SCALE, Math.min(CANVAS_MAX_SCALE, scale));
}

export function CanvasTransformProvider({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const transformRef = useRef<CanvasTransform>(IDENTITY);
  const [transform, setTransformState] = useState<CanvasTransform>(IDENTITY);
  const frameRef = useRef<number | null>(null);

  const getTransform = useCallback(() => transformRef.current, []);

  const setTransform = useCallback(
    (next: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform)) => {
      const value = typeof next === "function" ? next(transformRef.current) : next;
      transformRef.current = value;
      // Coalesce to one render per frame. The ref is already current, so
      // gesture math stays exact even though the paint lags by a frame.
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null;
          setTransformState(transformRef.current);
        });
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    },
    [setTransform],
  );

  const zoomBy = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = clientX - rect.left;
      const originY = clientY - rect.top;

      setTransform((prev) => {
        const scale = clampScale(prev.scale * factor);
        if (scale === prev.scale) return prev;
        const ratio = scale / prev.scale;
        return {
          scale,
          x: originX - (originX - prev.x) * ratio,
          y: originY - (originY - prev.y) * ratio,
        };
      });
    },
    [setTransform],
  );

  const resetTransform = useCallback(() => setTransform(IDENTITY), [setTransform]);

  const toCanvasPoint = useCallback((clientX: number, clientY: number): CanvasPoint => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const { x, y, scale } = transformRef.current;
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    return {
      x: (clientX - left - x) / scale,
      y: (clientY - top - y) / scale,
    };
  }, []);

  const getViewportCenter = useCallback((): CanvasPoint => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    // Measured from the live rect, so it needs no hardcoded navbar height and
    // cannot drift when the navbar wraps or the viewport resizes.
    return toCanvasPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [toCanvasPoint]);

  const api = useMemo<CanvasTransformApi>(
    () => ({
      viewportRef,
      getTransform,
      setTransform,
      panBy,
      zoomBy,
      resetTransform,
      toCanvasPoint,
      getViewportCenter,
    }),
    [
      getTransform,
      setTransform,
      panBy,
      zoomBy,
      resetTransform,
      toCanvasPoint,
      getViewportCenter,
    ],
  );

  return (
    <CanvasTransformApiContext.Provider value={api}>
      <CanvasTransformValueContext.Provider value={transform}>
        {children}
      </CanvasTransformValueContext.Provider>
    </CanvasTransformApiContext.Provider>
  );
}

/** Stable API. Subscribing to this never re-renders on a pan or zoom. */
export function useCanvasTransformApi(): CanvasTransformApi {
  const context = useContext(CanvasTransformApiContext);
  if (context === undefined) {
    throw new Error(
      "useCanvasTransformApi must be used within a CanvasTransformProvider",
    );
  }
  return context;
}

/** Reactive transform. Only use it where the value has to be rendered. */
export function useCanvasTransform(): CanvasTransform {
  return useContext(CanvasTransformValueContext);
}
