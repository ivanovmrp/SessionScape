# Manual prototype smoke test

Use synthetic data only. Start with an empty owner workspace and connected insights. Repeat the journey at each exact viewport: **1440×900**, **768×600**, and **360×640**.

## Guided first setup

1. Open **Practice data**. Confirm the four steps appear in this order: Practitioner, Service, Availability, Appointment. Practitioner is current; later steps are disabled and explain what is missing. The regular tabs, ledger, and catalog controls remain available.
2. Activate **Set up practitioner** with the keyboard. Confirm focus moves to Practitioner label. Enter `Maya Test`. Confirm **Cancel** and **Save practitioner and continue** stay visible at the bottom of the viewport without covering the field, validation message, or browser controls.
3. Submit a blank label first. Confirm the draft and Practitioner step remain and no record appears. Then save `Maya Test`; confirm Service opens and its label has focus.
4. Submit the blank Service form. Confirm it remains open and no service appears. Enter `Synthetic massage`, `60` minutes, and `10000` cents; save. Confirm Availability opens for the first active practitioner and first date in the selected week without a record.
5. Enter an end time earlier than the start time and save. Confirm the form, draft, and Availability step remain. Correct it to `09:00`–`17:00` and save. Confirm Appointments opens and Appointment date has focus.
6. Submit the blank Appointment form. Confirm it remains open and no appointment appears. Enter a date in the selected week and a time inside the saved availability; save. Confirm setup reports **4 of 4** and does not leave Practice data automatically.

## Persistence and authority

1. Reload after any successful step. Confirm the checklist resumes from saved records and does not duplicate earlier records.
2. During an unsaved guided edit, try changing week and source. Cancel the discard prompt once, then accept it. Confirm the first attempt preserves the draft and the accepted attempt discards it.
3. On completion while connected insights are active, confirm the choices are **Use owner data for insights** and **Keep connected insights**. Cancel the disconnect confirmation once; the page and connected authority must remain unchanged. Accept it; Overview must identify owner-entered data and must not merge sample or connected records.
4. Repeat completion in an editable sample copy. Confirm the action says **Use sample-derived data for insights**, never owner data.
5. Simulate blocked or quota-exceeded browser storage. Attempt a guided save. Confirm the warning says the change was not persisted and the same editor, draft, and current step remain with no new record.

## Existing workspace regression

1. Load a complete synthetic workspace, move to a week without records, and confirm setup stays complete because progress is global rather than week-specific.
2. Confirm **Add/Edit/Deactivate practitioner**, **Add/Edit/Deactivate service**, availability editing, appointment editing, source controls, and week controls still work outside the guide.
3. Confirm a closed day alone does not complete Availability. With every selected-week date closed, activating Availability opens the earliest closed date for correction.
