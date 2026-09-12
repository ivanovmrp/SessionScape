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
  await user.click(
    screen.getByRole("button", { name: "Dismiss recommendation" }),
  );

  expect(summary?.textContent).toContain("$880");
  expect(summary?.textContent).not.toContain("$1,240");
  expect(summary?.textContent).toContain("across 1 actions");
});

test("edits a draft and audience before approving a frozen snapshot", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  expect(screen.getByText("Nothing has been sent.")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  const draft = screen.getByRole("textbox", { name: "Message draft" });
  await user.clear(draft);
  await user.type(draft, "A carefully edited owner message.");
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Audience" }),
    "recent",
  );

  await user.click(screen.getByRole("button", { name: "Review approval" }));
  expect(screen.getByText("Audience snapshot · 7 eligible clients")).toBeDefined();
  expect(screen.getByText("A carefully edited owner message.")).toBeDefined();
  expect(
    screen.getByText("Approval does not send a message or create a booking."),
  ).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Approve draft" }));
  expect(
    screen.getByRole("status").textContent,
  ).toContain("Draft approved");
  expect(screen.getByRole("status").textContent).toContain("No message has been sent");
});

test("prevents approval when an audience preset has no recipients", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Audience" }),
    "none",
  );

  expect(screen.getByText("No eligible recipients match this preset.")).toBeDefined();
  expect(
    (screen.getByRole("button", { name: "Review approval" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

test("dismisses a recommendation during draft review", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  await user.click(screen.getByRole("button", { name: "Dismiss recommendation" }));

  expect(screen.queryByText("Thursday afternoon has 3 open hours")).toBeNull();
  expect(
    screen.getByText("Identified opportunity").parentElement?.textContent,
  ).toContain("across 1 actions");
});

test("hands an approved draft to the representative provider without advancing value", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  await user.click(screen.getByRole("button", { name: "Review approval" }));
  await user.click(screen.getByRole("button", { name: "Approve draft" }));

  expect(
    screen.getByRole("dialog", { name: "Continue in Square" }),
  ).toBeDefined();
  expect(screen.getByText("No live availability is connected.")).toBeDefined();
  expect(
    screen.getByText(
      "Square remains the system of record for availability, booking, and payment.",
    ),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: "Open representative Square page" }),
  ).toBeDefined();

  expect(screen.getByText("Estimated opportunity").parentElement?.textContent).toContain(
    "Current · $360",
  );
  for (const label of [
    "Attributed booking",
    "Completed appointment",
    "Realized revenue",
  ]) {
    expect(screen.getByText(label).parentElement?.textContent).toContain("Not observed");
  }
  expect(screen.queryByText(/booking confirmed/i)).toBeNull();
  expect(screen.queryByText(/payment collected/i)).toBeNull();
});
