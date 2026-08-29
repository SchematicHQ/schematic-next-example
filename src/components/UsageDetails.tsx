import { UsageMeter } from "@schematichq/schematic-components";

interface UsageDetailsProps {
  value?: number;
  max?: number;
}

export const UsageDetails = ({ value = 0, max = 0 }: UsageDetailsProps) => {
  const percent = (value / max) * 100;

  return (
    <UsageMeter.Root value={value} max={max}>
      {value > 0 && max > 0 && (
        <UsageMeter.Track>
          <UsageMeter.Fill
            style={{
              width: `${percent}%`,
              background: `color-mix(in hsl, green, red ${percent}%)`,
            }}
          />
        </UsageMeter.Track>
      )}

      <UsageMeter.ValueText>
        {value} / {max || "?"} used
      </UsageMeter.ValueText>

      <style>{`
        .schematic-usage-meter__label {
          font-size: 14px;
          font-weight: 500;
        }

        .schematic-usage-meter__track {
          height: 0.5rem;
          margin-top: ${1 / 3}rem;
          background: oklch(60% 0 0deg);
          border-radius: 2px;
          overflow: hidden;
        }

        .schematic-usage-meter__fill {
          height: 100%;
          transition: width 200ms ease;
          border-right: 1px solid oklch(50% 0 0deg);
        }
      `}</style>
    </UsageMeter.Root>
  );
};
