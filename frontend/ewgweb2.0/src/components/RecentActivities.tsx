import "./RecentActivities.css";
import { useMemo, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";

// ============ Types ============
type Activity = {
  activity: string;
  points: number;
  date: string;
};

type ActivityWithId = Activity & { id: string };
type ActivityWithTotal = ActivityWithId & { totalAfter: number };

type FormErrors = {
  activity?: string;
  points?: string;
  date?: string;
};

// ============ Constants ============
const ACTIVITY_LIBRARY = [
  { name: "Team Win", points: 100 },
  { name: "Team Round Under-Par", points: 50 },
  { name: "Beat Scoring Record", points: 100 },
  { name: "Team Tournament Goal", points: 25 },
  { name: "Play day goal", points: 20 },
  { name: "Community Service", points: 50 },
  { name: "Close-out Drills", points: 10 },
  { name: "Flamingo Drill", points: 31 },
  { name: "World champion", points: 400 },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { activity: "World champion", points: 400, date: "2025-11-16" },
  { activity: "Team Win", points: 100, date: "2025-11-15" },
  { activity: "Play day goal", points: 20, date: "2025-11-04" },
  { activity: "Team Tournament Goal", points: 25, date: "2025-11-04" },
  { activity: "Close-out Drills", points: 10, date: "2025-11-03" },
  { activity: "Community Service", points: 50, date: "2025-11-01" },
  { activity: "Close-out Drills", points: 10, date: "2025-10-25" },
  { activity: "Team Round Under-Par", points: 50, date: "2025-10-19" },
  { activity: "Drills at Practice", points: 57, date: "2025-10-14" },
  { activity: "Close-out Drills", points: 10, date: "2025-10-08" },
  { activity: "Flamingo Drill", points: 31, date: "2025-10-07" },
  { activity: "Team Tournament Goal", points: 25, date: "2025-10-01" },
  { activity: "Cards for veterans", points: 31, date: "2025-09-28" },
  { activity: "Team Win", points: 100, date: "2025-09-18" },
];

// ============ Utility Functions ============
const makeId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const computeActivitiesWithTotal = (
  activities: ActivityWithId[]
): ActivityWithTotal[] => {
  const sorted = [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningTotal = 0;
  return sorted
    .map((item) => {
      runningTotal += item.points;
      return { ...item, totalAfter: runningTotal };
    })
    .reverse();
};

const isValidISODate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === s;
};

const formatISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US");
};

const getTodayISO = () => new Date().toISOString().slice(0, 10);

// ============ Main Component ============
const RecentActivities = () => {
  const [activitiesState, setActivitiesState] = useState<ActivityWithId[]>(
    INITIAL_ACTIVITIES.map((a) => ({ ...a, id: makeId() }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ activity: "", points: "", date: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");

  const activities = useMemo(
    () => computeActivitiesWithTotal(activitiesState),
    [activitiesState]
  );

  const filteredLibrary = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === ""
      ? ACTIVITY_LIBRARY
      : ACTIVITY_LIBRARY.filter((a) => a.name.toLowerCase().includes(q));
  }, [query]);

  const shouldShowDropdown = showDropdown && filteredLibrary.length > 0;

  // ============ Handlers ============
  const handleDelete = (id: string) => {
    setActivitiesState((prev) => prev.filter((a) => a.id !== id));
  };

  const openAddModal = () => {
    setForm({ activity: "", points: "", date: getTodayISO() });
    setErrors({});
    setQuery("");
    setShowDropdown(true);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setErrors({});
    setShowDropdown(false);
    setQuery("");
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.activity.trim()) {
      nextErrors.activity = "Activity is required.";
    }

    const pts = Number(form.points);
    if (form.points.trim() === "" || Number.isNaN(pts)) {
      nextErrors.points = "Points must be a number.";
    } else if (!Number.isFinite(pts)) {
      nextErrors.points = "Points must be finite.";
    } else if (!Number.isInteger(pts)) {
      nextErrors.points = "Points must be an integer.";
    } else if (pts <= 0) {
      nextErrors.points = "Points must be > 0.";
    }

    if (!isValidISODate(form.date)) {
      nextErrors.date = "Date must be valid (YYYY-MM-DD).";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddSubmit = () => {
    if (!validateForm()) return;

    const newItem: ActivityWithId = {
      id: makeId(),
      activity: form.activity.trim(),
      points: Number(form.points),
      date: form.date,
    };

    setActivitiesState((prev) => [...prev, newItem]);
    closeAddModal();
  };

  const selectActivityFromLibrary = (item: (typeof ACTIVITY_LIBRARY)[0]) => {
    setQuery(item.name);
    setForm((p) => ({
      ...p,
      activity: item.name,
      points: String(item.points),
    }));
    setShowDropdown(false);
  };

  const updateFormField = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  // ============ Render ============
  return (
    <div className="card my-4 mx-2">
      <div className="ra-header">
        <span className="title">Recent Activities</span>
        <button
          type="button"
          className="ra-edit-btn"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="table-responsive small-text mt-2">
        <table className="table table-borderless align-middle ra-table">
          <thead className="border-bottom ra-th-text">
            <tr>
              {isEditing && <th></th>}
              <th>ACTIVITY</th>
              <th className="text-end text-nowrap">POINTS</th>
              <th className="text-end text-nowrap">TOTAL</th>
              <th className="text-end text-nowrap">DATE</th>
            </tr>
          </thead>

          <tbody>
            {isEditing && (
              <tr className="ra-add-row">
                <td colSpan={5}>
                  <button
                    type="button"
                    className="ra-add-btn"
                    onClick={openAddModal}
                  >
                    + Add Activity
                  </button>
                </td>
              </tr>
            )}

            {activities.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 1 ? "yellow-row" : ""}>
                {isEditing && (
                  <td className="text-center">
                    <button
                      type="button"
                      className="ra-delete-btn"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Delete ${item.activity}`}
                      title="Delete"
                    >
                      <MdOutlineDelete />
                    </button>
                  </td>
                )}
                <td>{item.activity}</td>
                <td className="text-end">{item.points}</td>
                <td className="text-end">{item.totalAfter}</td>
                <td className="text-end">{formatISODate(item.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <>
          <div className="ra-sheet-backdrop" onClick={closeAddModal} />

          <div className="ra-sheet" role="dialog" aria-modal="true">
            <div
              className="ra-sheet-card"
              onClick={() => setShowDropdown(false)}
            >
              <div className="ra-sheet-header">
                <div className="ra-sheet-title">Add Activity</div>
                <button
                  type="button"
                  className="ra-sheet-x"
                  onClick={closeAddModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="ra-sheet-body">
                {/* Activity Name Field */}
                <div className="mb-3 ra-field">
                  <label className="form-label ra-label">Activity Name</label>
                  <div
                    className="ra-combo"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      className={`form-control ra-input ${
                        errors.activity ? "is-invalid" : ""
                      }`}
                      value={query}
                      placeholder="Type or choose activity"
                      onFocus={() => setShowDropdown(true)}
                      onClick={() => setShowDropdown(true)}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                        updateFormField("activity", e.target.value);
                      }}
                    />

                    {shouldShowDropdown && (
                      <div className="ra-dropdown">
                        {filteredLibrary.map((item) => (
                          <button
                            type="button"
                            key={item.name}
                            className="ra-dropdown-item"
                            onClick={() => selectActivityFromLibrary(item)}
                          >
                            <span className="ra-dd-name">{item.name}</span>
                            <span className="ra-dd-pts">{item.points} pts</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.activity && (
                    <div className="invalid-feedback d-block">
                      {errors.activity}
                    </div>
                  )}
                </div>

                {/* Points Field */}
                <div className="mb-3">
                  <label className="form-label ra-label">Points</label>
                  <input
                    className={`form-control ra-input ${
                      errors.points ? "is-invalid" : ""
                    }`}
                    value={form.points}
                    onChange={(e) => updateFormField("points", e.target.value)}
                    placeholder="e.g., 25"
                    inputMode="numeric"
                  />
                  {errors.points && (
                    <div className="invalid-feedback">{errors.points}</div>
                  )}
                </div>

                {/* Date Field */}
                <div className="mb-2">
                  <label className="form-label ra-label">Date</label>
                  <input
                    type="date"
                    className={`form-control ra-input ${
                      errors.date ? "is-invalid" : ""
                    }`}
                    value={form.date}
                    onChange={(e) => updateFormField("date", e.target.value)}
                  />
                  {errors.date && (
                    <div className="invalid-feedback">{errors.date}</div>
                  )}
                </div>
              </div>

              <div className="ra-sheet-footer">
                <button
                  type="button"
                  className="ra-btn ra-btn-ghost"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ra-btn ra-btn-primary"
                  onClick={handleAddSubmit}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentActivities;
