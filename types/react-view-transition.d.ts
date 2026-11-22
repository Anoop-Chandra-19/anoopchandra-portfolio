// React 19.3's ViewTransition callbacks receive an instance carrying one handle
// per view-transition pseudo-element (react-dom's createViewTransitionInstance),
// but @types/react 19.3 only declares `name`. Remove this once the types catch up.
import "react";

declare module "react" {
  interface ViewTransitionPseudoElement {
    animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation;
    getAnimations(): Animation[];
    getComputedStyle(): CSSStyleDeclaration;
  }

  interface ViewTransitionInstance {
    group: ViewTransitionPseudoElement;
    imagePair: ViewTransitionPseudoElement;
    old: ViewTransitionPseudoElement;
    new: ViewTransitionPseudoElement;
  }
}
