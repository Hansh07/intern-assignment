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

**How to reproduce:**

**What is wrong:**

**What I changed:**

---
