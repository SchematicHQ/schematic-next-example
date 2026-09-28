/**
 * A feature's or credit's schematic-icons glyph in a tinted circle, as the
 * packaged elements draw it. The glyphs come from the icon font that
 * `<SchematicStyles />` loads in `src/components/ClientWrapper.tsx`; the
 * circle stays when there is no glyph, so names line up.
 */
export const FeatureIcon = ({ name }: { name: string | null }) => (
  <span
    aria-hidden="true"
    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl text-accent"
  >
    {name !== null && (
      <i className={`schematic-icon schematic-icon--${name}`} />
    )}
  </span>
);
