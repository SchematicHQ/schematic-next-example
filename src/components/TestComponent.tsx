import React from "react";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import useSSR from 'use-ssr'

const TestComponent: React.FC = () => {
  console.log("useSSR", useSSR().isServer);

  const {
    featureAllocation: weatherSearchAllocation,
    featureUsageExceeded: weatherSearchUsageExceeded,
    value: weatherSearchFlag,
    featureUsage: weatherSearchUsage,
  } = useSchematicEntitlement("weather-search");

  return (
    <div>
      <h1>Test Component</h1>
      <p>Weather Search Allocation: {weatherSearchAllocation}</p>
      <p>Weather Search Usage Exceeded: {weatherSearchUsageExceeded}</p>
      <p>Weather Search Flag: {weatherSearchFlag}</p>
      <p>Weather Search Usage: {weatherSearchUsage}</p>
    </div>
  );
};

export default TestComponent;
