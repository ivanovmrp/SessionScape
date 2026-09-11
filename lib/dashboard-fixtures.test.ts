/// <reference types="vitest/globals" />

import { test } from "vitest";
import { DASHBOARD_FIXTURES } from "./dashboard-fixtures";

test("partial data excludes capacity recommendations", () => {
  expect(
    DASHBOARD_FIXTURES.partial.opportunities.every(
      (opportunity) => opportunity.type !== "capacity",
    ),
  ).toBe(true);
});
