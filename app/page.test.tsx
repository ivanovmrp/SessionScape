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
  expect(screen.getByText("Capacity is unavailable")).toBeDefined();
  expect(screen.queryByLabelText("Capacity by weekday")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Review action" }));

  expect(
    screen.getByRole("dialog", { name: "14 returning clients are overdue" }),
  ).toBeDefined();
});

test("reconciles the opportunity total after a recommendation is dismissed", async () => {
  const user = userEvent.setup();

  render(<Page />);

  const summary = screen.getByText("Identified opportunity").parentElement;
  expect(summary?.textContent).toContain("$1,240");
  expect(summary?.textContent).toContain("across 2 actions");

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Dismiss" }));

  expect(summary?.textContent).toContain("$880");
  expect(summary?.textContent).not.toContain("$1,240");
  expect(summary?.textContent).toContain("across 1 actions");
});
