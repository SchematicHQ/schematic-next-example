import { TrialPill } from "@schematichq/schematic-components";
import { useSchematicPlan } from "@schematichq/schematic-react";

export const TrialDetails = () => {
  const plan = useSchematicPlan();

  return (
    <TrialPill.Root
      trialEndDate={plan?.trialEndDate}
      trialStatus={plan?.trialStatus}
    >
      Trial ends <TrialPill.EndDate />
      <style>{`
        .schematic-trial-pill {
          font-size: 14px;
        }
      `}</style>
    </TrialPill.Root>
  );
};
