import { Fragment } from "react";

/** Renders text as masked per-character spans for GSAP reveals. */
export function SplitChars({ text, charClass = "" }: { text: string; charClass?: string }) {
  return (
    <span className="split-line" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <Fragment key={i}>
          <span aria-hidden className={`split-inner ${charClass}`} data-char>
            {ch === " " ? " " : ch}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
