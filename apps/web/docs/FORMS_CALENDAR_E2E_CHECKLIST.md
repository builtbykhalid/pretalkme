# Forms + Calendar E2E Checklist

## Scope
- Public form flow with optional booking information fields.
- Calendar booking, cancellation, and rescheduling UX.
- Feedback consistency (no blocking browser alerts in these flows).

## Preconditions
- A published form with `calendar_enabled=true`.
- Two variants of `booking_config`:
  - Variant A: `ask_guest_phone=false`, `ask_guest_company=false`, `ask_notes=false`
  - Variant B: `ask_guest_phone=true`, `ask_guest_company=true`, `ask_notes=true`
- At least one available slot in calendar.

## Test Cases

### 1. Booking Info Fields Respect Config
1. Open public form with Variant A.
2. Select a slot and continue to booking info step.
3. Verify only Name + Email are visible.
4. Open same form with Variant B.
5. Select a slot and continue.
6. Verify Name + Email + Phone + Company + Notes are visible.

Expected:
- Field rendering matches booking configuration exactly.

### 2. Required Validation Feedback
1. On booking info step, leave Name empty.
2. Try to submit.
3. On static form step, leave a required visible field empty.
4. Try to continue.

Expected:
- User receives inline/browser required validation and/or app feedback.
- No blocking `alert()` popup appears.

### 3. Share Action Feedback
1. On public form page, trigger share action on browser without native share support.
2. Repeat on browser with native share support and cancel share.

Expected:
- Link copy success/error feedback appears through app feedback system.
- No native `alert()` popup appears.

### 4. Meetings Hub Cancellation
1. Open Calendar settings > Meetings Hub.
2. Cancel an upcoming meeting from modal.
3. Simulate API failure (network fail or mocked false response).

Expected:
- Success state appears when cancellation succeeds.
- Error toast appears on failure.
- No native `alert()` popup appears.

### 5. Meetings Hub Rescheduling
1. Open reschedule modal for an upcoming meeting.
2. Pick a new slot.
3. Simulate API failure.

Expected:
- Success screen appears when reschedule succeeds.
- Error toast appears on failure.
- No native `alert()` popup appears.

### 6. Forms List Perceived Performance
1. Open Forms page with many forms.
2. Type in search box quickly.
3. Switch pages in pagination.

Expected:
- No forced skeleton delay on page/search change.
- Results update immediately with smooth interaction.

### 7. Accessibility Spot Check
1. On public form, inspect first textarea/select/input in DevTools.
2. Verify label uses `htmlFor` and control has matching `id`.
3. Navigate booking-info step with keyboard only.

Expected:
- Label-control relationships are present.
- Keyboard navigation is functional and predictable.

## Regression Notes
- Verify `CalendarBooking` (production component) is still used for real scheduling.
- Ensure no imports reference removed mock component `components/booking/BookingCalendar.tsx`.
