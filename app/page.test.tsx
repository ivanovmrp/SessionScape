// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Page from "./page";

afterEach(cleanup);

test("changes prototype state and opens a real recommendation", async () => {
  const user = userEvent.setup();

  render(<Page />);

  await user.selectOptions(
    screen.getByRole("combobox", { name: "Prototype state" }),
    "partial",
  );

  expect(screen.getByText("Some metrics are temporarily limited")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Review action" }));

  expect(
    screen.getByRole("dialog", { name: "14 returning clients are overdue" }),
  ).toBeDefined();
});
