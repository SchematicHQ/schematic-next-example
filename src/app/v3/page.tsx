import Link from "next/link";

import { ELEMENTS } from "./elements";

export default function V3Index() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">v3 elements</h1>
      <p className="text-sm text-gray-600">
        Each element rendered from fixture scenarios (no API). Pick an element,
        then switch scenarios on its page.
      </p>
      <ul className="list-disc pl-6">
        {Object.entries(ELEMENTS).map(([slug, name]) => (
          <li key={slug}>
            <Link className="underline" href={`/v3/${slug}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
