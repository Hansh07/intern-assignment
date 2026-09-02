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

**How to reproduce:**

**What is wrong:**

**What I changed:**

---
