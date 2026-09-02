const CATEGORIES = ["All", "Food", "Travel", "Fun", "Stay"];

export default function Filters({
  members,
  query,
  category,
  paidBy,
  onQuery,
  onCategory,
  onPaidBy,
}) {
  const hasActiveFilters = query.trim() !== "" || category !== "All" || paidBy !== "";

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Filter</h2>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn ghost"
            style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={() => {
              onQuery("");
              onCategory("All");
              onPaidBy("");
            }}
          >
            Reset filters
          </button>
        )}
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Description…"
          />
        </div>
        <div className="field">
          <label htmlFor="paidBy">Paid by</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => onPaidBy(e.target.value)}
          >
            <option value="">Anyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? "on" : ""}`}
            onClick={() => onCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}
