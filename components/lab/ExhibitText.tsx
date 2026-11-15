import type { Project } from "@/lib/content";

type Props = {
  project: Project;
  letter: string;
  theme?: "dark" | "light";
  className?: string;
};

/** Typographic text block for an exhibit: placard, title, facts, materials. */
export function ExhibitText({ project, letter, theme = "dark", className = "" }: Props) {
  const light = theme === "light";
  const muted = light ? "text-titanium-600" : "text-titanium-400";
  const strong = light ? "text-void" : "text-titanium-50";
  const rule = light ? "border-void/15" : "border-hairline";

  return (
    <div className={className}>
      <p className={`font-mono text-[0.68rem] uppercase tracking-[0.22em] ${muted}`}>
        <span className={light ? "text-volt-deep" : "text-volt-bright"}>Exhibit {letter}</span>
        <span className="mx-2">/</span>
        {project.index}
        {project.org && (
          <>
            <span className="mx-2">/</span>
            {project.org}
          </>
        )}
      </p>
      <h3
        data-exhibit-title
        className={`mt-5 font-display font-extrabold leading-[0.88] tracking-[-0.05em] ${strong}`}
        style={{ fontSize: "clamp(2.6rem, 5.2vw, 5.6rem)" }}
      >
        {project.title}
      </h3>
      <p className={`mt-3 font-serif text-[1.45rem] italic leading-snug ${light ? "text-titanium-600" : "text-titanium-300"}`}>
        {project.subtitle}
      </p>
      <p className={`mt-6 max-w-lg text-[0.95rem] leading-relaxed ${light ? "text-titanium-600" : "text-titanium-400"}`}>
        {project.description}
      </p>

      <dl className={`mt-8 border-t ${rule}`}>
        {project.facts.map((f, i) => (
          <div key={f} className={`flex items-baseline gap-4 border-b py-3 ${rule}`}>
            <dt className={`font-mono text-[0.62rem] ${muted}`}>{String(i + 1).padStart(2, "0")}</dt>
            <dd className={`text-[0.92rem] ${strong}`}>{f}</dd>
          </div>
        ))}
      </dl>

      <p className={`mt-6 font-mono text-[0.68rem] leading-relaxed tracking-wide ${muted}`}>
        <span className="uppercase tracking-[0.2em]">Materials — </span>
        {project.stack.join(" / ")}
      </p>
    </div>
  );
}
