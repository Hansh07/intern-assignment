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

**How to reproduce:**

**What is wrong:**

**What I changed:**

---
