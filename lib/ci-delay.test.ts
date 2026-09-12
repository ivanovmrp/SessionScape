import { test } from "vitest";

test(
  "Plan 2 CI cancellation delay",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  },
  70_000,
);
