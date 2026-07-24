import { TrialPill, useTrialPill } from "@schematichq/schematic-components";
import { useSchematicPlan } from "@schematichq/schematic-react";

export const TrialDetails = () => {
  const plan = useSchematicPlan();
  const trial = useTrialPill({
    trialEndDate: plan?.trialEndDate,
    trialStatus: plan?.trialStatus,
  });

  return (
    <TrialPill.Root
      trialEndDate={plan?.trialEndDate}
      trialStatus={plan?.trialStatus}
    >
      <TrialPill.Label>{plan?.name}</TrialPill.Label>

      {plan?.trialEndDate && (
        <TrialPill.TimeRemaining>
          Trial ends in {trial.endDateLabel}
        </TrialPill.TimeRemaining>
      )}

      <style>{`
        .schematic-trial-pill {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.25;
        }

        .schematic-trial-pill__label {
          display: block;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </TrialPill.Root>
  );
};
