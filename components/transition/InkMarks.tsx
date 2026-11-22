"use client";
import { ViewTransition, type CSSProperties, type ViewTransitionInstance } from "react";
import { transitionMs } from "@/lib/ink-bleed";
import {
  PEEL_EASING,
  REVEAL_END,
  animateRoot,
  bleedKeyframes,
  dropStyle,
  haloStyle,
  peelKeyframes,
  revealRoot,
  shadowStyle,
  type InkEffect,
  type InkOrigin,
} from "./inkViewTransition";

/**
 * The rim, drop and peel shadow of the ink transition. They mount in the same
 * commit as the destination page, so React starts a view transition and each
 * becomes its own layer above the page. Their onEnter callbacks run the
 * choreography: each animates its own layer, and the mark that defines the
 * effect (the drop, the shadow) also animates the page snapshot.
 */
export default function InkMarks({
  effect,
  origin,
  onDoneAction,
}: {
  effect: InkEffect;
  origin: InkOrigin;
  onDoneAction: () => void;
}) {
  const duration = transitionMs(effect, origin.vw);
  const timing = { duration, fill: "both" } as const;
  // The reveal finishes a little early; marks that follow its edge keep pace.
  const revealMs = duration * REVEAL_END;
  const revealTiming = { ...timing, duration: revealMs };

  // Ends the transition once every animation has finished, and cancels them if
  // React tears the view transition down early.
  const track = (animations: Animation[]) => {
    Promise.all(animations.map((a) => a.finished)).then(onDoneAction, onDoneAction);
    return () => {
      for (const a of animations) a.cancel();
    };
  };

  if (effect === "bleed") {
    const frames = bleedKeyframes(origin);
    return (
      <>
        <Mark
          name="ink-halo"
          style={haloStyle(origin)}
          onEnter={(vt) => track([vt.group.animate(frames.halo, revealTiming), vt.new.animate(frames.haloHole, revealTiming)])}
        />
        <Mark
          name="ink-drop"
          style={dropStyle(origin)}
          onEnter={(vt) =>
            track([vt.new.animate(frames.drop, timing), revealRoot(frames.holes, revealMs)])
          }
        />
      </>
    );
  }

  const frames = peelKeyframes(origin);
  const peelTiming = { ...revealTiming, easing: PEEL_EASING };
  return (
    <Mark
      name="ink-shadow"
      style={shadowStyle(origin)}
      onEnter={(vt) =>
        track([
          vt.group.animate(frames.band, peelTiming),
          vt.new.animate(frames.bandOpacity, peelTiming),
          revealRoot(frames.reveal, revealMs, PEEL_EASING),
          animateRoot("old", frames.dim, duration, PEEL_EASING),
        ])
      }
    />
  );
}

function Mark({
  name,
  style,
  onEnter,
}: {
  name: string;
  style: CSSProperties;
  onEnter: (instance: ViewTransitionInstance) => () => void;
}) {
  return (
    <ViewTransition name={name} enter="ink-mark" exit="none" update="none" default="none" onEnter={onEnter}>
      <div className="ink-mark" aria-hidden="true" style={style} />
    </ViewTransition>
  );
}
