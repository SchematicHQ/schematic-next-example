import { type CheckFlagReturn } from "@schematichq/schematic-react";
import { UsageMeter } from "@schematichq/schematic-components";

export const UsageDetails = ({
  featureAllocation = 0,
  featureUsage = 0,
}: CheckFlagReturn) => {
  const percent = (featureUsage / featureAllocation) * 100;

  return (
    <UsageMeter.Root value={featureUsage} max={featureAllocation}>
      {featureUsage > 0 && featureAllocation > 0 && (
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
        {featureUsage} / {featureAllocation || "?"} used
      </UsageMeter.ValueText>
      <style>{`
        .schematic-usage-meter {
          margin-top: 0.3333rem;
        }

        .schematic-usage-meter__track {
          height: 0.5rem;
          background: oklch(95% 0 0deg);
          overflow: hidden;
        }

        .schematic-usage-meter__fill {
          height: 100%;
          transition: width 200ms ease;
        }
      `}</style>
    </UsageMeter.Root>
  );
};
