// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Page from "./page";
import { DASHBOARD_FIXTURES } from "../lib/dashboard-fixtures";
import {
  PRACTICE_WORKSPACE_STORAGE_KEYS,
  RAW_SAMPLE_WORKSPACE,
} from "../lib/practice-workspace";

const currentReturnHistory = DASHBOARD_FIXTURES.current.returnHistory;
const currentReturnTrendLabel = DASHBOARD_FIXTURES.current.returnTrendLabel;
const currentDays = DASHBOARD_FIXTURES.current.days;

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-09-07T12:00:00.000Z"));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
  DASHBOARD_FIXTURES.current.returnHistory = currentReturnHistory;
  DASHBOARD_FIXTURES.current.returnTrendLabel = currentReturnTrendLabel;
  DASHBOARD_FIXTURES.current.days = currentDays;
});

test("changes prototype state and opens a real recommendation", async () => {
  const user = userEvent.setup();

  render(<Page />);

  expect(
    screen.getByRole("img", {
      name: "Client return rate rose from 54% to 62% over six months",
    }),
  ).toBeDefined();

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

test("does not draw a trend from incomplete return history", () => {
  DASHBOARD_FIXTURES.current.returnHistory = [
    { label: "Sep", rate: 62 },
  ];
  DASHBOARD_FIXTURES.current.returnTrendLabel =
    "Client return trend is unavailable because history is incomplete";

  const { container } = render(<Page />);

  expect(screen.getByText("Trend unavailable")).toBeDefined();
  expect(
    screen.getByRole("img", {
      name: "Client return trend is unavailable because history is incomplete",
    }),
  ).toBeDefined();
  expect(container.querySelector(".chart-line")).toBeNull();
});

test("labels a zero-total weekday as unavailable instead of drawing a zero bar", () => {
  DASHBOARD_FIXTURES.current.days = [
    { label: "Mon", booked: null, open: null },
  ];

  const { container } = render(<Page />);

  expect(
    screen.getByLabelText("Mon capacity unavailable"),
  ).toBeDefined();
  expect(container.querySelector(".bar-track")).toBeNull();
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

test("records an identifiable dismissed recommendation in Activity", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(
    screen.getByRole("button", { name: "Dismiss recommendation" }),
  );

  const activity = screen.getByRole("region", { name: "Activity" });
  expect(
    within(activity).getByText("Thursday afternoon has 3 open hours"),
  ).toBeDefined();
  expect(within(activity).getByText("Capacity opportunity")).toBeDefined();
  expect(within(activity).getByText("$360")).toBeDefined();
});

test("restores one of several dismissed recommendations without duplicates", async () => {
  const user = userEvent.setup();
  render(<Page />);

  for (let index = 0; index < 2; index += 1) {
    await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
    await user.click(
      screen.getByRole("button", { name: "Dismiss recommendation" }),
    );
  }

  const activity = screen.getByRole("region", { name: "Activity" });
  const capacityRecord = within(activity)
    .getByText("Thursday afternoon has 3 open hours")
    .closest("article");
  expect(capacityRecord).not.toBeNull();
  await user.click(
    within(capacityRecord as HTMLElement).getByRole("button", {
      name: "Restore recommendation",
    }),
  );

  const summary = screen.getByText("Identified opportunity").parentElement;
  expect(summary?.textContent).toContain("$360");
  expect(summary?.textContent).toContain("across 1 actions");
  expect(screen.getAllByRole("button", { name: "Review action" })).toHaveLength(1);
  expect(
    within(activity).queryByText("Thursday afternoon has 3 open hours"),
  ).toBeNull();
  expect(within(activity).getByText("14 returning clients are overdue")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Review action" }));
  await user.click(
    screen.getByRole("button", { name: "Dismiss recommendation" }),
  );
  const repeatedRecord = within(activity)
    .getByText("Thursday afternoon has 3 open hours")
    .closest("article");
  await user.click(
    within(repeatedRecord as HTMLElement).getByRole("button", {
      name: "Restore recommendation",
    }),
  );

  expect(screen.getAllByRole("button", { name: "Review action" })).toHaveLength(1);
  expect(summary?.textContent).toContain("$360");
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
  expect(
    screen.getByText("Audience snapshot · Recently active · 7 eligible clients"),
  ).toBeDefined();
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

  expect(screen.getAllByText("Thursday afternoon has 3 open hours")).toHaveLength(1);
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
  expect(
    screen.getByText(
      "No live availability is connected. Square remains the system of record for availability, booking, and payment.",
    ),
  ).toBeDefined();
  expect(screen.getByText("Square booking page")).toBeDefined();
  expect(
    screen.getByRole("link", { name: "Open representative Square booking page" }),
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

test.each([
  {
    scenario: "current",
    freshness: "Current data · synced today at 8:42 AM",
    coverage: "100% source coverage",
    limitation: "Synthetic prototype data; confirm availability in Square.",
  },
  {
    scenario: "partial",
    freshness: "Appointments current · availability incomplete",
    coverage: "Appointments 100% · practitioner availability 58%",
    limitation:
      "Capacity actions are unavailable; supported retention actions may continue.",
  },
  {
    scenario: "stale",
    freshness: "Last successful sync Sep 5 at 6:14 PM",
    coverage: "Changes after the last sync are not included",
    limitation: "Recheck Square before approving; the estimate may have changed.",
  },
])("keeps $scenario data context visible throughout the action", async ({
  scenario,
  freshness,
  coverage,
  limitation,
}) => {
  const user = userEvent.setup();
  render(<Page />);
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Prototype state" }),
    scenario,
  );

  if (scenario === "partial") {
    expect(screen.queryByText("Thursday afternoon has 3 open hours")).toBeNull();
  }

  const expectContext = () => {
    expect(screen.getByText(freshness)).toBeDefined();
    expect(screen.getByText(coverage)).toBeDefined();
    expect(screen.getByText(limitation)).toBeDefined();
  };

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  expectContext();
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  expectContext();
  await user.click(screen.getByRole("button", { name: "Review approval" }));
  expectContext();
  await user.click(screen.getByRole("button", { name: "Approve draft" }));
  expectContext();
});

test("closes and resets an action when the data scenario changes", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  const draft = screen.getByRole("textbox", { name: "Message draft" });
  await user.clear(draft);
  await user.type(draft, "Unsaved scenario-specific edit");

  await user.selectOptions(
    screen.getByRole("combobox", { name: "Prototype state" }),
    "stale",
  );
  expect(screen.queryByRole("dialog")).toBeNull();

  await user.selectOptions(
    screen.getByRole("combobox", { name: "Prototype state" }),
    "current",
  );
  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Continue to draft" }));
  expect(
    (screen.getByRole("textbox", { name: "Message draft" }) as HTMLTextAreaElement)
      .value,
  ).not.toContain("Unsaved scenario-specific edit");
});

test("moves focus into the metric drawer and wraps its single control", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("button", { name: /Booked capacity/ }));
  const dialog = screen.getByRole("dialog", { name: "Booked capacity" });
  const close = within(dialog).getByRole("button", { name: "Close" });

  expect(document.activeElement).toBe(close);
  await user.tab();
  expect(document.activeElement).toBe(close);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(close);
});

test("contains recommendation drawer focus and advances it with each stage", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  let dialog = screen.getByRole("dialog", {
    name: "Thursday afternoon has 3 open hours",
  });
  const close = within(dialog).getByRole("button", { name: "Close" });
  const continueButton = within(dialog).getByRole("button", {
    name: "Continue to draft",
  });

  expect(document.activeElement).toBe(close);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(continueButton);
  await user.tab();
  expect(document.activeElement).toBe(close);

  await user.click(continueButton);
  dialog = screen.getByRole("dialog", { name: "Prepare a representative draft" });
  const draftInput = within(dialog).getByRole("textbox", { name: "Message draft" });
  expect(document.activeElement).toBe(draftInput);
  await user.selectOptions(
    within(dialog).getByRole("combobox", { name: "Audience" }),
    "none",
  );
  within(dialog).getByRole("button", { name: "Close" }).focus();
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Dismiss recommendation" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close" }),
  );
  await user.selectOptions(
    within(dialog).getByRole("combobox", { name: "Audience" }),
    "eligible",
  );

  await user.click(within(dialog).getByRole("button", { name: "Review approval" }));
  dialog = screen.getByRole("dialog", { name: "Approve this action draft?" });
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Edit" }),
  );
  within(dialog).getByRole("button", { name: "Close" }).focus();
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Approve draft" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close" }),
  );

  await user.click(within(dialog).getByRole("button", { name: "Approve draft" }));
  dialog = screen.getByRole("dialog", { name: "Continue in Square" });
  const handoff = within(dialog).getByRole("link", {
    name: "Open representative Square booking page",
  });
  expect(document.activeElement).toBe(handoff);
  await user.tab();
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Close" }),
  );
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(handoff);
});

test("opening either drawer replaces the other modal", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("button", { name: /Booked capacity/ }));
  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(
    screen.getByRole("dialog", { name: "Thursday afternoon has 3 open hours" }),
  ).toBeDefined();

  await user.click(screen.getByRole("button", { name: /Booked capacity/ }));
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  expect(screen.getByRole("dialog", { name: "Booked capacity" })).toBeDefined();
});

test("closes both drawer types with Escape and restores their openers", async () => {
  const user = userEvent.setup();
  render(<Page />);

  const metricOpener = screen.getByRole("button", { name: /Booked capacity/ });
  await user.click(metricOpener);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(metricOpener);

  const opportunityOpener = screen.getAllByRole("button", {
    name: "Review action",
  })[0];
  await user.click(opportunityOpener);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(opportunityOpener);
});

test("returns focus from both labeled drawer close controls", async () => {
  const user = userEvent.setup();
  render(<Page />);

  const metricOpener = screen.getByRole("button", { name: /Booked capacity/ });
  await user.click(metricOpener);
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
  );
  expect(document.activeElement).toBe(metricOpener);

  const opportunityOpener = screen.getAllByRole("button", {
    name: "Review action",
  })[0];
  await user.click(opportunityOpener);
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
  );
  expect(document.activeElement).toBe(opportunityOpener);
});

test("returns focus when either drawer backdrop is clicked", async () => {
  const user = userEvent.setup();
  const { container } = render(<Page />);

  const metricOpener = screen.getByRole("button", { name: /Booked capacity/ });
  await user.click(metricOpener);
  await user.click(container.querySelector(".modal-backdrop") as HTMLElement);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(metricOpener);

  const opportunityOpener = screen.getAllByRole("button", {
    name: "Review action",
  })[0];
  await user.click(opportunityOpener);
  await user.click(container.querySelector(".modal-backdrop") as HTMLElement);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(opportunityOpener);
});

test("scenario changes close either drawer and keep focus on the scenario control", async () => {
  const user = userEvent.setup();
  render(<Page />);
  const scenario = screen.getByRole("combobox", { name: "Prototype state" });

  await user.click(screen.getByRole("button", { name: /Booked capacity/ }));
  await user.selectOptions(scenario, "partial");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(scenario);

  await user.selectOptions(scenario, "current");
  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.selectOptions(scenario, "stale");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(scenario);
});

test("dismissal does not focus an opener removed with its recommendation", async () => {
  const user = userEvent.setup();
  render(<Page />);
  const opener = screen.getAllByRole("button", { name: "Review action" })[0];

  await user.click(opener);
  await user.click(
    screen.getByRole("button", { name: "Dismiss recommendation" }),
  );

  expect(opener.isConnected).toBe(false);
  expect(document.activeElement).not.toBe(opener);
});

test("changing scenarios clears dismissed recommendations", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(
    screen.getByRole("button", { name: "Dismiss recommendation" }),
  );
  expect(
    within(screen.getByRole("region", { name: "Activity" })).getByText(
      "Thursday afternoon has 3 open hours",
    ),
  ).toBeDefined();

  await user.selectOptions(
    screen.getByRole("combobox", { name: "Prototype state" }),
    "stale",
  );

  expect(
    within(screen.getByRole("region", { name: "Activity" })).getByText(
      "No dismissed recommendations",
    ),
  ).toBeDefined();
  expect(screen.getAllByRole("button", { name: "Review action" })).toHaveLength(2);
});

test("opens a separate empty owner practice workspace with a truthful source label", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));

  expect(screen.getByRole("heading", { name: "Practice data" })).toBeDefined();
  expect(screen.getByText("Owner-entered data")).toBeDefined();
  expect(screen.getByText("No owner-entered records yet")).toBeDefined();
  expect(screen.getByText("Stored only in this browser")).toBeDefined();
  expect(
    screen.getByText(/No names, contact details, notes, health information/),
  ).toBeDefined();
  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();
});

test("explores canonical sample records without mutating the owner workspace", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));

  expect(screen.getByText("Sample data · read only")).toBeDefined();
  expect(screen.getByText("1 appointment record")).toBeDefined();
  expect(screen.getByText("1 practitioner · 1 service")).toBeDefined();
  expect(window.localStorage.length).toBe(0);

  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  expect(screen.getByText("Owner-entered data")).toBeDefined();
  expect(screen.getByText("No owner-entered records yet")).toBeDefined();
});

test("copies sample records into a separately labelled editable workspace", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );

  expect(screen.getByText("Sample-derived data")).toBeDefined();
  expect(screen.getByText("1 appointment record")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  expect(screen.getByText("Owner-entered data")).toBeDefined();
  expect(screen.getByText("No owner-entered records yet")).toBeDefined();
});

test("offers the prototype scenario selector only for read-only sample data", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  expect(screen.getByRole("combobox", { name: "Prototype state" })).toBeDefined();

  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();
});

test("confirms before replacing an existing editable sample copy", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm");
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  expect(confirm).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  confirm.mockReturnValueOnce(false);
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  expect(screen.getByText("Sample data · read only")).toBeDefined();

  confirm.mockReturnValueOnce(true);
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  expect(screen.getByText("Sample-derived data")).toBeDefined();
});

test("confirms and clears only the active editable sample workspace", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm");
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );

  confirm.mockReturnValueOnce(false);
  await user.click(
    screen.getByRole("button", { name: "Clear sample-derived data" }),
  );
  expect(screen.getByText("1 appointment record")).toBeDefined();

  confirm.mockReturnValueOnce(true);
  await user.click(
    screen.getByRole("button", { name: "Clear sample-derived data" }),
  );
  expect(screen.getByText("0 appointment records")).toBeDefined();
  expect(screen.queryByText("1 appointment record")).toBeNull();
});

test("closes stale detail and resets dismissed recommendations on a source change", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  await user.click(screen.getByRole("button", { name: "Dismiss recommendation" }));
  expect(screen.getAllByRole("button", { name: "Review action" })).toHaveLength(1);

  await user.click(screen.getByRole("button", { name: /Booked capacity/ }));
  expect(screen.getByRole("dialog")).toBeDefined();
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(screen.queryByRole("dialog")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getAllByRole("button", { name: "Review action" })).toHaveLength(2);
});

test("reloads the owner and sample-derived workspaces from separate browser slots", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  const firstRender = render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(await screen.findByText("1 appointment record")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  await waitFor(() => expect(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"]),
  ).not.toBeNull());

  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  expect(screen.getByText("1 appointment record")).toBeDefined();
  expect(JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  )).toEqual(ownerWorkspace);

  firstRender.unmount();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(
    await screen.findByRole("button", { name: "Open editable sample copy" }),
  );
  expect(screen.getByText("Sample-derived data")).toBeDefined();
  expect(screen.getByText("1 appointment record")).toBeDefined();
});

test("removes cleared sample-derived data from browser storage", async () => {
  const user = userEvent.setup();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const firstRender = render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Clear sample-derived data" }),
  );
  expect(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"]),
  ).toBeNull();

  firstRender.unmount();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(
    screen.queryByRole("button", { name: "Open editable sample copy" }),
  ).toBeNull();
});

test("confirms before clearing the owner slot and leaves sample-derived storage alone", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm");
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"],
    JSON.stringify(RAW_SAMPLE_WORKSPACE),
  );
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(await screen.findByText("1 appointment record")).toBeDefined();
  confirm.mockReturnValueOnce(false);
  await user.click(screen.getByRole("button", { name: "Clear owner data" }));
  expect(screen.getByText("1 appointment record")).toBeDefined();

  confirm.mockReturnValueOnce(true);
  await user.click(screen.getByRole("button", { name: "Clear owner data" }));
  expect(screen.getByText("No owner-entered records yet")).toBeDefined();
  expect(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner)).toBeNull();
  expect(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"]),
  ).not.toBeNull();
});

test("leaves invalid stored data untouched and shows recovery guidance", async () => {
  const raw = '{"version":99,"clientName":"unsafe"}';
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, raw);
  render(<Page />);

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Stored owner data could not be loaded",
  );
  expect(screen.getByRole("alert").textContent).toContain("left unchanged");
  expect(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner)).toBe(raw);
});

test("blocks edits from overwriting an invalid stored workspace before deliberate recovery", async () => {
  const user = userEvent.setup();
  const raw = '{"version":99,"clientName":"unsafe"}';
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, raw);
  render(<Page />);
  expect((await screen.findByRole("alert")).textContent).toContain("could not be loaded");
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Add practitioner" }));
  await user.type(screen.getByRole("textbox", { name: "Practitioner label" }), "Maya");
  await user.click(screen.getByRole("button", { name: "Save practitioner" }));

  expect(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner)).toBe(raw);
  expect(screen.getByRole("alert").textContent).toContain("must be cleared before editing");
});

test("protects an invalid sample-derived workspace until it is deliberately cleared", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  const raw = '{"version":99,"clientName":"unsafe"}';
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"], raw);
  render(<Page />);
  expect((await screen.findByRole("alert")).textContent).toContain("Stored sample-derived data could not be loaded");

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("button", { name: "Create editable sample copy" }));
  expect(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"])).toBe(raw);
  expect(screen.getByRole("alert").textContent).toContain("must be cleared before editing");

  await user.click(screen.getByRole("button", { name: "Clear sample-derived data" }));
  expect(confirm).toHaveBeenCalled();
  expect(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"])).toBeNull();
});

test("shows when browser storage is unavailable", async () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
    throw new Error("blocked");
  });
  render(<Page />);

  expect((await screen.findByRole("alert")).textContent).toContain(
    "Browser storage is unavailable",
  );
  expect(screen.getByRole("alert").textContent).toContain("will not be saved");
});

test("does not claim persistence when saving an editable copy exceeds quota", async () => {
  const user = userEvent.setup();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota exceeded");
  });
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(
    screen.getByRole("button", { name: "Create editable sample copy" }),
  );

  expect(screen.getByText("Sample-derived data")).toBeDefined();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "could not be saved",
  );
  expect(screen.getByRole("alert").textContent).toContain("not persisted");
  expect(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"]),
  ).toBeNull();
});

test("moves the practice ledger by whole local weeks and returns to today", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    appointments: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.appointments),
      {
        ...structuredClone(RAW_SAMPLE_WORKSPACE.appointments[0]),
        id: "appointment_nextweek001",
        startAt: "2026-09-14T13:00:00.000Z",
        createdAt: "2026-09-08T12:00:00.000Z",
        statusChangedAt: "2026-09-14T14:30:00.000Z",
      },
    ],
  };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(screen.getByText("Sep 7–13, 2026")).toBeDefined();
  expect(screen.getByRole("button", { name: /Edit appointment Mon Sep 7/ })).toBeDefined();
  expect(screen.queryByRole("button", { name: /Edit appointment Mon Sep 14/ })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Next week" }));
  expect(screen.getByText("Sep 14–20, 2026")).toBeDefined();
  expect(screen.getByRole("button", { name: /Edit appointment Mon Sep 14/ })).toBeDefined();
  expect(screen.queryByRole("button", { name: /Edit appointment Mon Sep 7/ })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Previous week" }));
  await user.click(screen.getByRole("button", { name: "Previous week" }));
  expect(screen.getByText("Aug 31–Sep 6, 2026")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Today" }));
  expect(screen.getByText("Sep 7–13, 2026")).toBeDefined();
  expect(screen.getByRole("button", { name: /Edit appointment Mon Sep 7/ })).toBeDefined();
  expect(screen.queryByRole("button", { name: /Edit appointment Mon Sep 14/ })).toBeNull();
});

test("selects the current local week after client hydration", async () => {
  vi.mocked(Date.now).mockReturnValue(Date.parse("2026-09-15T12:00:00.000Z"));
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(await screen.findByText("Sep 14–20, 2026")).toBeDefined();
});

test("returns the fixed sample ledger to the sample fixture week", async () => {
  vi.mocked(Date.now).mockReturnValue(Date.parse("2026-09-15T12:00:00.000Z"));
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  expect(await screen.findByText("Sep 14–20, 2026")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  expect(screen.getByText("Sep 7–13, 2026")).toBeDefined();
});

test("keeps the dashboard date control connected to the selected ledger week", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Next week" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));

  const selectedWeek = screen.getByRole("button", { name: /Sep 14–20/ });
  expect(selectedWeek).toBeDefined();
  await user.click(selectedWeek);
  expect(screen.getByRole("heading", { name: "Practice data" })).toBeDefined();
  expect(screen.getByText("Sep 14–20, 2026")).toBeDefined();
});

test("creates, renames, and deactivates a practitioner in the owner catalog", async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));

  await user.click(screen.getByRole("button", { name: "Add practitioner" }));
  await user.type(screen.getByRole("textbox", { name: "Practitioner label" }), "Maya");
  await user.click(screen.getByRole("button", { name: "Save practitioner" }));
  expect(screen.getByText("Maya")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Edit practitioner Maya" }));
  const label = screen.getByRole("textbox", { name: "Practitioner label" });
  await user.clear(label);
  await user.type(label, "Morgan");
  await user.click(screen.getByRole("button", { name: "Save practitioner" }));
  expect(screen.getByText("Morgan")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Deactivate practitioner Morgan" }));
  expect(screen.getByText("Inactive practitioner")).toBeDefined();
  expect(screen.getByText("No active practitioners")).toBeDefined();
});

test("creates, edits, and deactivates a service with integer-cent defaults", async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));

  await user.click(screen.getByRole("button", { name: "Add service" }));
  await user.type(screen.getByRole("textbox", { name: "Service label" }), "Relaxation");
  await user.type(screen.getByRole("spinbutton", { name: "Default duration in minutes" }), "60");
  await user.type(screen.getByRole("spinbutton", { name: "Default value in cents" }), "11000");
  await user.click(screen.getByRole("button", { name: "Save service" }));
  expect(screen.getByText("Relaxation")).toBeDefined();
  expect(screen.getByText("60 minutes · $110.00")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Edit service Relaxation" }));
  const value = screen.getByRole("spinbutton", { name: "Default value in cents" });
  await user.clear(value);
  await user.type(value, "12000");
  await user.click(screen.getByRole("button", { name: "Save service" }));
  expect(screen.getByText("60 minutes · $120.00")).toBeDefined();

  await user.click(screen.getByRole("button", { name: "Deactivate service Relaxation" }));
  expect(screen.getByText("Inactive service")).toBeDefined();
});

test("preserves historical catalog labels and excludes inactive practitioners from coverage", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));

  expect(await screen.findByText("Availability coverage: 1 of 7 days")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Deactivate practitioner Maya" }));
  await user.click(screen.getByRole("button", { name: "Deactivate service Deep tissue" }));

  expect(screen.getByText("Maya")).toBeDefined();
  expect(screen.getByText("Deep tissue")).toBeDefined();
  expect(screen.getByText("No active practitioners")).toBeDefined();
  const stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.appointments).toEqual(ownerWorkspace.appointments);
  expect(stored.practitioners[0]).toMatchObject({ label: "Maya", active: false });
  expect(stored.services[0]).toMatchObject({ label: "Deep tissue", active: false });
});

test("keeps catalog editing controls out of read-only sample data", async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));

  expect(screen.queryByRole("button", { name: "Add practitioner" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Add service" })).toBeNull();
});

test("closes an owner catalog editor when switching to read-only sample data", async () => {
  const user = userEvent.setup();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Add practitioner" }));
  expect(screen.getByRole("textbox", { name: "Practitioner label" })).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  expect(screen.queryByRole("textbox", { name: "Practitioner label" })).toBeNull();
});

test("offers existing generated anonymous IDs when creating another appointment", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = { ...structuredClone(RAW_SAMPLE_WORKSPACE), provenance: "owner-entered" as const };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(await screen.findByRole("button", { name: "Add appointment" }));

  expect(screen.getByRole("option", { name: RAW_SAMPLE_WORKSPACE.appointments[0].anonymousClientId as string })).toBeDefined();
});

test("creates a persisted weekly appointment with generated identity and UTC time", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    appointments: [],
    availability: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.availability),
      {
        id: "availability_sep08000001",
        practitionerId: RAW_SAMPLE_WORKSPACE.practitioners[0].id,
        localDate: "2026-09-08",
        closed: false as const,
        startMinute: 540,
        endMinute: 1020,
      },
    ],
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(await screen.findByRole("button", { name: "Add appointment" }));

  await user.type(screen.getByLabelText("Appointment date"), "2026-09-08");
  await user.type(screen.getByLabelText("Start time"), "10:30");
  await user.click(screen.getByRole("button", { name: "Generate anonymous client ID" }));
  const client = screen.getByRole("combobox", { name: "Anonymous client ID" }) as HTMLSelectElement;
  expect(client.value).toMatch(/^anon_[a-z0-9]{12}$/);
  await user.click(screen.getByRole("button", { name: "Save appointment" }));

  expect(screen.getByText("Tue Sep 8 · 10:30 AM")).toBeDefined();
  expect(screen.getByText("Scheduled")).toBeDefined();
  const stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.appointments).toHaveLength(1);
  expect(stored.appointments[0]).toMatchObject({
    practitionerId: RAW_SAMPLE_WORKSPACE.practitioners[0].id,
    serviceId: RAW_SAMPLE_WORKSPACE.services[0].id,
    startAt: "2026-09-08T14:30:00.000Z",
    durationMinutes: 90,
    valueCents: 14500,
    status: "scheduled",
    anonymousClientId: client.value,
  });
  expect(stored.appointments[0].id).toMatch(/^appointment_[a-z0-9]{8,32}$/);
});

test("keeps appointment identity stable through status changes and confirms deletion", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm");
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    practitioners: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.practitioners),
      { id: "practitioner_aria00000001", label: "Aria", active: true },
    ],
    services: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.services),
      { id: "service_relaxation01", label: "Relaxation", defaultDurationMinutes: 60, defaultValueCents: 11_000, active: true },
    ],
    availability: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.availability),
      { id: "availability_ariasep080001", practitionerId: "practitioner_aria00000001", localDate: "2026-09-08", closed: false as const, startMinute: 540, endMinute: 1020 },
    ],
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(await screen.findByRole("button", { name: /Edit appointment/ }));

  await user.clear(screen.getByLabelText("Appointment date"));
  await user.type(screen.getByLabelText("Appointment date"), "2026-09-08");
  await user.clear(screen.getByLabelText("Start time"));
  await user.type(screen.getByLabelText("Start time"), "10:00");
  await user.selectOptions(screen.getByRole("combobox", { name: "Appointment practitioner" }), "practitioner_aria00000001");
  await user.selectOptions(screen.getByRole("combobox", { name: "Appointment service" }), "service_relaxation01");
  await user.clear(screen.getByLabelText("Appointment duration in minutes"));
  await user.type(screen.getByLabelText("Appointment duration in minutes"), "75");
  await user.clear(screen.getByLabelText("Appointment value in cents"));
  await user.type(screen.getByLabelText("Appointment value in cents"), "12345");
  await user.selectOptions(screen.getByRole("combobox", { name: "Appointment status" }), "no-show");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  let stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.appointments[0].id).toBe(ownerWorkspace.appointments[0].id);
  expect(stored.appointments[0]).toMatchObject({
    practitionerId: "practitioner_aria00000001",
    serviceId: "service_relaxation01",
    startAt: "2026-09-08T14:00:00.000Z",
    durationMinutes: 75,
    valueCents: 12345,
    status: "no-show",
  });

  await user.click(screen.getByRole("button", { name: /Edit appointment/ }));
  await user.selectOptions(screen.getByRole("combobox", { name: "Appointment status" }), "cancelled");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.appointments[0].status).toBe("cancelled");
  expect(stored.appointments[0].cancelledAt).toBe(stored.appointments[0].statusChangedAt);

  await user.click(screen.getByRole("button", { name: /Edit appointment/ }));
  await user.selectOptions(screen.getByRole("combobox", { name: "Appointment status" }), "scheduled");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.appointments[0].id).toBe(ownerWorkspace.appointments[0].id);
  expect(stored.appointments[0].cancelledAt).toBeUndefined();

  await user.click(screen.getByRole("button", { name: /Edit appointment/ }));
  confirm.mockReturnValueOnce(false);
  await user.click(screen.getByRole("button", { name: "Delete appointment" }));
  expect(screen.getByRole("button", { name: /Edit appointment/ })).toBeDefined();
  confirm.mockReturnValueOnce(true);
  await user.click(screen.getByRole("button", { name: "Delete appointment" }));
  expect(screen.queryByRole("button", { name: /Edit appointment/ })).toBeNull();
  expect(screen.getByText("0 appointment records")).toBeDefined();
});

test("keeps inactive historical assignments visible but out of new appointment choices", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    practitioners: [
      { ...RAW_SAMPLE_WORKSPACE.practitioners[0], active: false },
      { id: "practitioner_aria00000001", label: "Aria", active: true },
    ],
    services: [
      { ...RAW_SAMPLE_WORKSPACE.services[0], active: false },
      {
        id: "service_relaxation01",
        label: "Relaxation",
        defaultDurationMinutes: 60,
        defaultValueCents: 11000,
        active: true,
      },
    ],
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));

  expect(await screen.findByText("Maya")).toBeDefined();
  expect(screen.getByText("Deep tissue")).toBeDefined();
  await user.click(screen.getByRole("button", { name: /Edit appointment/ }));
  expect((screen.getByRole("option", { name: "Maya · inactive historical assignment" }) as HTMLOptionElement).disabled).toBe(true);
  expect((screen.getByRole("option", { name: "Deep tissue · inactive historical assignment" }) as HTMLOptionElement).disabled).toBe(true);
  await user.click(screen.getByRole("button", { name: "Cancel appointment editing" }));

  await user.click(screen.getByRole("button", { name: "Add appointment" }));
  expect(screen.queryByRole("option", { name: /Maya/ })).toBeNull();
  expect(screen.queryByRole("option", { name: /Deep tissue/ })).toBeNull();
  expect(screen.getByRole("option", { name: "Aria" })).toBeDefined();
  expect(screen.getByRole("option", { name: "Relaxation" })).toBeDefined();
});

test("persists weekly availability and explicit closed days for active practitioners", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  const { unmount } = render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("tab", { name: "Availability" }));

  await user.click(screen.getByRole("button", { name: "Edit availability Tue Sep 8 for Maya" }));
  await user.type(screen.getByLabelText("Availability start time"), "09:30");
  await user.type(screen.getByLabelText("Availability end time"), "17:15");
  await user.click(screen.getByRole("button", { name: "Save availability" }));

  await user.click(screen.getByRole("button", { name: "Edit availability Tue Sep 8 for Maya" }));
  await user.clear(screen.getByLabelText("Availability start time"));
  await user.type(screen.getByLabelText("Availability start time"), "10:00");
  await user.clear(screen.getByLabelText("Availability end time"));
  await user.type(screen.getByLabelText("Availability end time"), "16:00");
  await user.click(screen.getByRole("button", { name: "Save availability" }));

  await user.click(screen.getByRole("button", { name: "Edit availability Wed Sep 9 for Maya" }));
  await user.click(screen.getByRole("checkbox", { name: "Closed all day" }));
  await user.click(screen.getByRole("button", { name: "Save availability" }));

  expect(screen.getByText("Availability coverage: 3 of 7 days")).toBeDefined();
  let stored = JSON.parse(
    window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null",
  );
  expect(stored.availability).toEqual(expect.arrayContaining([
    expect.objectContaining({
      practitionerId: RAW_SAMPLE_WORKSPACE.practitioners[0].id,
      localDate: "2026-09-08",
      closed: false,
      startMinute: 600,
      endMinute: 960,
    }),
    expect.objectContaining({
      practitionerId: RAW_SAMPLE_WORKSPACE.practitioners[0].id,
      localDate: "2026-09-09",
      closed: true,
    }),
  ]));

  unmount();
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("tab", { name: "Availability" }));
  expect(await screen.findByText("10:00 AM–4:00 PM")).toBeDefined();
  expect(screen.getByText("Closed", { selector: ".availability-value" })).toBeDefined();
  stored = JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null");
  expect(stored.availability).toHaveLength(3);
});

test("keeps inactive practitioners out of current availability editing", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    practitioners: [
      { ...RAW_SAMPLE_WORKSPACE.practitioners[0], active: false },
      { id: "practitioner_aria00000001", label: "Aria", active: true },
    ],
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("tab", { name: "Availability" }));

  expect(screen.queryByRole("button", { name: /for Maya/ })).toBeNull();
  expect(screen.getAllByRole("button", { name: /for Aria/ })).toHaveLength(7);
});

test("blocks overlapping appointments and requires an outside-hours override", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Add appointment" }));
  await user.type(screen.getByLabelText("Appointment date"), "2026-09-07");
  await user.type(screen.getByLabelText("Start time"), "09:30");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  expect(screen.getByRole("alert").textContent).toMatch(/overlaps/i);
  expect(JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null").appointments).toHaveLength(1);

  await user.clear(screen.getByLabelText("Start time"));
  await user.type(screen.getByLabelText("Start time"), "18:00");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  expect(screen.getByRole("alert").textContent).toMatch(/outside regular availability/i);
  await user.click(screen.getByRole("button", { name: "Save outside hours" }));

  const stored = JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null");
  expect(stored.appointments).toHaveLength(2);
  expect(stored.appointments[1].startAt).toBe("2026-09-07T22:00:00.000Z");
});

test("blocks invalid appointment duration and value before persistence", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Add appointment" }));
  await user.type(screen.getByLabelText("Appointment date"), "2026-09-07");
  await user.type(screen.getByLabelText("Start time"), "11:00");

  const duration = screen.getByLabelText("Appointment duration in minutes");
  await user.clear(duration);
  await user.type(duration, "0");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  expect(JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null").appointments).toHaveLength(1);

  await user.clear(duration);
  await user.type(duration, "60");
  const value = screen.getByLabelText("Appointment value in cents");
  await user.clear(value);
  await user.type(value, "1.5");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  expect(JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null").appointments).toHaveLength(1);
});

test("requires an explicit offset choice for a repeated daylight-saving hour", async () => {
  const user = userEvent.setup();
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS.owner,
    JSON.stringify(ownerWorkspace),
  );
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  for (let week = 0; week < 7; week += 1) {
    await user.click(screen.getByRole("button", { name: "Next week" }));
  }
  await user.click(screen.getByRole("button", { name: "Add appointment" }));
  await user.type(screen.getByLabelText("Appointment date"), "2026-11-01");
  await user.type(screen.getByLabelText("Start time"), "01:30");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));

  expect(screen.getByRole("combobox", { name: "Repeated hour choice" })).toBeDefined();
  await user.selectOptions(screen.getByRole("combobox", { name: "Repeated hour choice" }), "later");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  await user.click(screen.getByRole("button", { name: "Save outside hours" }));

  const stored = JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null");
  expect(stored.appointments.at(-1).startAt).toBe("2026-11-01T06:30:00.000Z");
});

test("binds the active owner source to evidence-only dashboard actions", async () => {
  const user = userEvent.setup();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const practitionerId = RAW_SAMPLE_WORKSPACE.practitioners[0].id;
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    availability: ["07", "08", "09", "10", "11", "12", "13"].map((day) => ({
      id: `availability_sep${day}000001`,
      practitionerId,
      localDate: `2026-09-${day}`,
      closed: false as const,
      startMinute: 540,
      endMinute: 1020,
    })),
    appointments: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.appointments),
      ...[1, 2, 3].map((day) => ({
        id: `appointment_history000${day}`,
        practitionerId,
        serviceId: RAW_SAMPLE_WORKSPACE.services[0].id,
        startAt: `2026-08-0${day}T14:00:00.000Z`,
        durationMinutes: 60,
        valueCents: 12_000,
        status: "completed" as const,
        createdAt: "2026-07-01T12:00:00.000Z",
        statusChangedAt: `2026-08-0${day}T15:00:00.000Z`,
      })),
    ],
  };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  expect(screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" })).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));

  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();
  expect(screen.getByText(/Owner-entered records in this browser/)).toBeDefined();
  expect(screen.getByText("Retention recommendations require at least three completed visits linked to one anonymous client ID.")).toBeDefined();
  const appointmentsMetric = within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Appointments 1/ });
  expect(appointmentsMetric).toBeDefined();
  await user.click(appointmentsMetric);
  const metricDetails = screen.getByRole("dialog", { name: "Appointments" });
  expect(within(metricDetails).getByText(/Sep 7.*13, 2026/)).toBeDefined();
  expect(within(metricDetails).getByText("Availability 7 of 7 days")).toBeDefined();
  expect(within(metricDetails).getByText(/outside-availability/)).toBeDefined();
  await user.click(within(metricDetails).getByRole("button", { name: "Close" }));
  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  const opportunityDetails = screen.getByRole("dialog");
  expect(within(opportunityDetails).getByText("Period Sep 7–13, 2026")).toBeDefined();
  expect(within(opportunityDetails).getByText("Excluded records: 0 cancelled, 0 no-show, 0 outside availability, 0 duplicate IDs.")).toBeDefined();
  expect(screen.getByRole("button", { name: "Mark reviewed" })).toBeDefined();
  expect(screen.queryByRole("button", { name: /Continue to draft/ })).toBeNull();
  expect(screen.queryByText("Eligible audience")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Mark reviewed" }));
  expect(screen.queryByRole("dialog")).toBeNull();

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getByRole("combobox", { name: "Prototype state" })).toBeDefined();
  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  expect(screen.getByRole("button", { name: /Continue to draft/ })).toBeDefined();
});

test("keeps connected insights authoritative until the owner explicitly switches sources", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
  };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Explore sample data" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getByRole("combobox", { name: "Prototype state" })).toBeDefined();

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Return to owner data" }));
  const disconnect = screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" });
  await user.click(disconnect);
  expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/disconnect/i));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getByRole("combobox", { name: "Prototype state" })).toBeDefined();

  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Use connected data for insights" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getByRole("combobox", { name: "Prototype state" })).toBeDefined();
});

test("keeps sample-derived insights on the owner-only evidence path", async () => {
  const user = userEvent.setup();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  const practitionerId = RAW_SAMPLE_WORKSPACE.practitioners[0].id;
  const sampleDerivedWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "sample-derived" as const,
    availability: ["07", "08", "09", "10", "11", "12", "13"].map((day) => ({
      id: `availability_derived${day}`,
      practitionerId,
      localDate: `2026-09-${day}`,
      closed: false as const,
      startMinute: 540,
      endMinute: 1020,
    })),
    appointments: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.appointments),
      ...[1, 2, 3].map((day) => ({
        id: `appointment_derivedhist${day}`,
        practitionerId,
        serviceId: RAW_SAMPLE_WORKSPACE.services[0].id,
        startAt: `2026-08-0${day}T14:00:00.000Z`,
        durationMinutes: 60,
        valueCents: 12_000,
        status: "completed" as const,
        createdAt: "2026-07-01T12:00:00.000Z",
        statusChangedAt: `2026-08-0${day}T15:00:00.000Z`,
      })),
    ],
  };
  window.localStorage.setItem(
    PRACTICE_WORKSPACE_STORAGE_KEYS["sample-derived"],
    JSON.stringify(sampleDerivedWorkspace),
  );
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(await screen.findByRole("button", { name: "Open editable sample copy" }));
  await user.click(screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(screen.getByText("Editable sample-derived practice data")).toBeDefined();
  expect(screen.queryByRole("combobox", { name: "Prototype state" })).toBeNull();
  expect(screen.queryByRole("link", { name: /Square booking page/ })).toBeNull();

  await user.click(screen.getAllByRole("button", { name: "Review action" })[0]);
  expect(screen.getByRole("button", { name: "Mark reviewed" })).toBeDefined();
  expect(screen.getByText("Sample-derived records in this browser")).toBeDefined();
  expect(screen.queryByRole("button", { name: /Continue to draft/ })).toBeNull();
  expect(screen.queryByText("Eligible audience")).toBeNull();
});

test("reconciles appointment, capacity, cancellation, and value evidence through owner mutations", async () => {
  const user = userEvent.setup();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
  const practitionerId = RAW_SAMPLE_WORKSPACE.practitioners[0].id;
  const ownerWorkspace = {
    ...structuredClone(RAW_SAMPLE_WORKSPACE),
    provenance: "owner-entered" as const,
    availability: ["07", "08", "09", "10", "11", "12", "13"].map((day) => ({
      id: `availability_journey${day}`,
      practitionerId,
      localDate: `2026-09-${day}`,
      closed: false as const,
      startMinute: 540,
      endMinute: 1020,
    })),
    appointments: [
      ...structuredClone(RAW_SAMPLE_WORKSPACE.appointments),
      ...[1, 2, 3].map((day) => ({
        id: `appointment_journeyhist${day}`,
        practitionerId,
        serviceId: RAW_SAMPLE_WORKSPACE.services[0].id,
        startAt: `2026-08-0${day}T14:00:00.000Z`,
        durationMinutes: 60,
        valueCents: 12_000,
        status: "completed" as const,
        createdAt: "2026-07-01T12:00:00.000Z",
        statusChangedAt: `2026-08-0${day}T15:00:00.000Z`,
      })),
    ],
  };
  window.localStorage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, JSON.stringify(ownerWorkspace));
  render(<Page />);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getByRole("button", { name: "Disconnect connected data and use browser-only insights" }));
  await user.click(screen.getByRole("button", { name: "Add appointment" }));
  await user.type(screen.getByLabelText("Appointment date"), "2026-09-10");
  await user.type(screen.getByLabelText("Start time"), "11:00");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));

  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Appointments 2/ })).toBeDefined();
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Booked capacity 5%/ })).toBeDefined();
  const valueAfterAdd = screen.getByText("Identified opportunity").parentElement?.textContent;

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getAllByRole("button", { name: /Edit appointment/ })[1]);
  await user.selectOptions(screen.getByLabelText("Appointment status"), "completed");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Appointments 2/ })).toBeDefined();

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getAllByRole("button", { name: /Edit appointment/ })[1]);
  await user.selectOptions(screen.getByLabelText("Appointment status"), "cancelled");
  await user.click(screen.getByRole("button", { name: "Save appointment" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Appointments 1/ })).toBeDefined();
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Booked capacity 3%/ })).toBeDefined();
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Cancellations 1/ })).toBeDefined();
  expect(screen.getByText("Identified opportunity").parentElement?.textContent).not.toBe(valueAfterAdd);

  await user.click(screen.getByRole("link", { name: "Practice data" }));
  await user.click(screen.getAllByRole("button", { name: /Edit appointment/ })[1]);
  await user.click(screen.getByRole("button", { name: "Delete appointment" }));
  await user.click(screen.getByRole("link", { name: "Overview" }));
  expect(confirm).toHaveBeenCalled();
  expect(within(screen.getByRole("region", { name: "Weekly metrics" })).getByRole("button", { name: /Cancellations 0/ })).toBeDefined();
  expect(JSON.parse(window.localStorage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner) ?? "null").appointments).toHaveLength(4);
});
