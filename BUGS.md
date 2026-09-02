# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top.

**What I changed:** Updated `dateValue()` in `src/lib/format.js` to reliably convert `Date` objects and ISO date strings into numeric timestamps (`new Date(date).getTime()`), and updated the sorting comparator in `src/components/ExpenseList.jsx` to `dateValue(b.date) - dateValue(a.date)` so expenses are sorted descending (newest first).

---

## Bug 2

**How to reproduce:** Filter expenses by selecting category "Travel" or searching "Uber". Click "Delete" on "Uber to airport" (or edit its amount). Instead of modifying "Uber to airport" (`id: e2`), the first item in the unfiltered array ("Groceries", `id: e1`) gets deleted or edited.

**What is wrong:** `DELETE_EXPENSE` and `UPDATE_EXPENSE` were operating by array index (`action.index`). Because the displayed list is filtered and sorted, the array index in the view did not correspond to the index in `state.expenses`, causing data corruption by mutating the wrong item.

**What I changed:** Changed `DELETE_EXPENSE` and `UPDATE_EXPENSE` in `src/state/store.js` to target items by unique `action.id` (`filter(e => e.id !== action.id)` and `map(e => e.id === action.id ? ... : e)`). Updated `ExpenseList.jsx` to pass `expense.id` to `onDelete` and `onUpdate`, used `key={expense.id}`, and updated `App.jsx` dispatch calls.

---

## Bug 3

**How to reproduce:** Inspect member balances with the demo data. Diya Patel (`id: 4`) paid $60 for "Uber to airport" (`id: e2`) which was split between Aisha (`id: 1`) and Ben (`id: 2`). Diya was not in the split (`splitWith: [1, 2]`), but Diya's balance was erroneously deducted $30 ($60 / 2).

**What is wrong:** `computeBalances()` in `src/lib/balances.js` contained logic that subtracted `amount / splitWith.length` from `bal[exp.paidBy]` whenever the payer was not in `shares`. This directly violates the README specification ("Someone can put a cab on their card even if they did not ride. They should get that fare back in full. Only the people who used it should owe a share.").

**What I changed:** Removed the invalid payer deduction check from `computeBalances()` in `src/lib/balances.js` so that the payer receives full credit for the payment, and only participants in the split are debited their calculated shares.

---

## Bug 4

**How to reproduce:** Open the app and observe the Balances panel. Members who have paid more than their share and are in credit (e.g., Aisha Khan) are labeled in red as "owes $...", while members who owe the group are labeled in green as "is owed $...".

**What is wrong:** In `src/components/BalancesPanel.jsx`, the logic for labeling balances was reversed. A positive balance (`bal > 0`) indicates money owed to the member (credit), and a negative balance (`bal < 0`) indicates debt owed by the member to the group.

**What I changed:** Updated the condition in `src/components/BalancesPanel.jsx` so that `bal > 0.005` displays `"is owed $..."` with the `"owed"` class (green), and `bal < -0.005` displays `"owes $..."` with the `"owe"` class (red).

---

## Bug 5

**How to reproduce:** In a scenario where a debtor owes the exact same amount that a creditor is owed (or when equal amounts are matched during settlement), check the "Settle up" panel. The transfer between them is omitted completely and does not appear in the suggested payments list.

**What is wrong:** In `src/lib/settle.js`, the `while` loop had an `else` branch for when `d.amount === c.amount` that simply incremented the indices `i += 1; j += 1` without creating and pushing a transfer object into `transfers`.

**What I changed:** Refactored the settlement loop in `src/lib/settle.js` to compute `payment = Math.min(d.amount, c.amount)`, record the transfer whenever `payment > 0`, decrement remaining amounts with clean 2-decimal precision, and advance each pointer when their balance reaches `<= 0.005`.

---

## Bug 6

**How to reproduce:** In the Filters panel, select any member from the "Paid by" dropdown (e.g. "Aisha Khan" or "Ben Okonkwo"). The expense list becomes completely empty and states "No expenses match these filters", even though matching expenses exist.

**What is wrong:** In `src/App.jsx`, the filtering condition `if (paidBy !== "" && e.paidBy !== paidBy) return false;` used strict inequality (`!==`) between `e.paidBy` (a `number` like `1`) and `paidBy` (a `string` from the `<select>` element like `"1"`). Because `1 !== "1"` is always `true`, all expenses were incorrectly filtered out.

**What I changed:** Updated the comparison in `src/App.jsx` to `String(e.paidBy) !== String(paidBy)` to correctly compare IDs regardless of whether they are formatted as strings or numbers.

---

## Bug 7

**How to reproduce:** In the Summary panel, add a new member (e.g., "Eve"). The Members count increases from 4 to 5, but the "Paid so far" breakdown list does not show "Eve ($0.00)" and remains showing only the initial 4 members.

**What is wrong:** In `src/components/SummaryCards.jsx`, the `perPerson` calculation was memoized with `useMemo(..., [expenses])`, omitting `members` from the dependency array. When `members` changed, `perPerson` did not recompute.

**What I changed:** Added `members` to the `useMemo` dependency array (`[members, expenses]`) and used type-safe comparison `String(e.paidBy) === String(m.id)` in `src/components/SummaryCards.jsx`.

---

## Bug 8

**How to reproduce:** Add new expenses and refresh the browser page. The dates in the expense list fallback to raw string slicing instead of formatted locale dates (`toLocaleDateString("en-IN")`).

**What is wrong:** In `src/state/store.js`, `loadState()` returned `JSON.parse(raw)` directly when retrieving cached state from `localStorage`. Because `JSON.stringify` converts `Date` instances into ISO string primitives, the retrieved expenses contained strings for `date` instead of JavaScript `Date` objects, failing `date instanceof Date` checks.

**What I changed:** Updated `loadState()` in `src/state/store.js` to pass `JSON.parse(raw)` through `hydrate()`, ensuring all expense dates are restored as valid `Date` objects upon page reloads.

---

## Bug 9

**How to reproduce:** 
1. Log an expense of $100 split equally among 3 people. Each person was assigned $33.33, totaling $99.99, losing $0.01 from the group total.
2. Enter custom percentage splits such as `33.33%`, `33.33%`, and `33.34%`. The form rejects submission with *"Percentages must add to 100"* due to IEEE 754 float representation `100.00000000000001`.

**What is wrong:** 
1. `splitEqual()` in `src/lib/money.js` performed simple division and fixed-point rounding without distributing remainder cents across participants.
2. `percentsSumTo100()` in `src/lib/money.js` used strict equality `=== 100` rather than floating-point tolerance check.

**What I changed:** 
1. Refactored `splitEqual()` and `splitByPercent()` in `src/lib/money.js` to allocate exact cent-level shares and distribute any remainder cents so the sum of individual shares always precisely equals the full bill amount.
2. Updated `percentsSumTo100()` to use `Math.abs(sum - 100) < 0.01` to safely accommodate floating-point variations.

## Bug 10

**How to reproduce:** 
1. Fill in Description and Amount, then click "Save expense". The input values remain populated in the form fields instead of clearing.
2. In non-UTC timezones, selecting a date like `2026-03-16` can shift to `15 Mar 2026` due to UTC midnight parsing.

**What is wrong:** `submit()` in `src/components/AddExpenseForm.jsx` did not reset input state fields (`description`, `amount`) upon submission and parsed dates via `new Date(date)` which defaults to UTC.

**What I changed:** Updated `submit()` in `src/components/AddExpenseForm.jsx` to clear `description` and `amount` on successful submission, and normalized the date parsing to local midnight (`${date}T00:00:00`) to prevent timezone date shifts.

## Bug 11

**How to reproduce:** In the Expenses list, click on the editable amount input of an expense, enter an invalid value (such as a negative number or non-numeric characters), and click outside (blur). The input remains displaying the invalid value rather than reverting to the saved amount. Also, pressing the "Enter" key does not commit the edit.

**What is wrong:** `ExpenseRow` in `src/components/ExpenseList.jsx` only initialized `draft` on first render without syncing to `expense.amount`, lacked an `Enter` key trigger, and failed to reset `draft` when blur validation did not pass.

**What I changed:** Added `useEffect` in `ExpenseRow` to synchronize `draft` with `expense.amount`, added `onKeyDown` to blur/save on Enter key press, and reset `draft` to `String(expense.amount)` when blur validation fails.

## Bug 12

**How to reproduce:** If a member object has an `id` represented as a string (such as `"4"`), adding a new member generates an `id` of `"41"` rather than `5`.

**What is wrong:** `nextMemberId()` in `src/state/store.js` did not cast `x.id` to `Number` during the reduce comparison, which sets `max` to a string and leads to string concatenation (`"4" + 1 = "41"`).

**What I changed:** Updated `nextMemberId()` in `src/state/store.js` to cast `x.id` to `Number(x.id)` so the maximum ID is always numeric and increments correctly.

## Bug 13

**How to reproduce:** When date strings (e.g., `"2026-03-12"`) are passed to `formatDate()`, they are displayed in raw unformatted ISO format (`"2026-03-12"`) rather than the application's standard formatted date string (`"12 Mar 2026"`).

**What is wrong:** `formatDate()` in `src/lib/format.js` checked `if (typeof date === "string") return date.slice(0, 10);`, bypassing locale date formatting for string inputs.

**What I changed:** Updated `formatDate()` in `src/lib/format.js` to parse string date inputs into `Date` instances and format them consistently using `toLocaleDateString("en-IN")`.

## Bug 14

**How to reproduce:** Add a member with multiple spaces in their name (e.g., `"  Aisha   Khan  "`). The avatar in the Balances panel renders with a missing initial or blank.

**What is wrong:** `initials()` in `src/components/BalancesPanel.jsx` used plain `name.split(" ")` without trimming, producing empty elements for leading or consecutive whitespace.

**What I changed:** Updated `initials()` in `src/components/BalancesPanel.jsx` to use `(name || "").trim().split(/\s+/)`, guaranteeing clean 2-letter uppercase initials regardless of whitespace variations.

---
