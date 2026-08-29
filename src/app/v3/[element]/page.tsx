import { notFound } from "next/navigation";
import { Suspense } from "react";

import V3Demo from "../V3Demo";
import { ELEMENTS, type ElementSlug } from "../elements";

export function generateStaticParams() {
  return Object.keys(ELEMENTS).map((element) => ({ element }));
}

export default async function V3ElementPage({
  params,
}: {
  params: Promise<{ element: string }>;
}) {
  const { element } = await params;
  if (!(element in ELEMENTS)) {
    notFound();
  }
  return (
    <Suspense>
      <V3Demo element={element as ElementSlug} />
    </Suspense>
  );
}
