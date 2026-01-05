import "./RecentActivities.css";
import { useState, useRef, useEffect } from "react";
import { FiMinusCircle } from "react-icons/fi";
import type { Activity } from "../App";
import type { Dispatch, SetStateAction } from "react";
import { API_BASE } from "../config";

interface Props {
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

// dropdown options
const presetActivities = [
  { name: "Team Win", points: 100 },
  { name: "Team Round Under-Par", points: 50 },
  { name: "Beat Scoring Record", points: 100 },
  { name: "Team Tournament Goal", points: 25 },
  { name: "Play day goal", points: 20 },
  { name: "Close-out Drills", points: 10 },
  { name: "Community Service", points: 50 },
  { name: "Team Top 5 in D1", points: 50 },
  { name: "Ryder Cup", points: 5 },
];

const RecentActivities = ({ activities, setActivities }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [newActivity, setNewActivity] = useState<Omit<Activity, "_id">>({
    activity: "",
    points: 0,
    date: "",
  });

  // for dropdown preset activities
  const filteredOptions = presetActivities.filter((opt) =>
    opt.name.toLowerCase().includes(newActivity.activity.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // for rendering activity tables and delete activities
  let runningTotal = 0;
  const activitiesWithTotal = [...activities]
    .reverse()
    .map((item) => {
      runningTotal += item.points;
      return {
        ...item,
        totalAfter: runningTotal,
      };
    })
    .reverse();

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("/");
    return `${month}/${day}/${year}`;
  };

  const deleteRow = async (id: string) => {
    // optimistic: update ui first
    setActivities((prev) => prev.filter((a) => a._id !== id));

    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Delete failed:", await res.text());
      // if failed still render backend real data
      const refreshed = await fetchActivities();
      setActivities(refreshed);
    }
  };

  // for add activities
  const canSave =
    newActivity.activity.trim().length > 0 &&
    newActivity.points > 0 &&
    newActivity.date;

  async function fetchActivities(): Promise<Activity[]> {
    const res = await fetch(`${API_BASE}/activities`);
    if (!res.ok) throw new Error("Failed to fetch activities");
    return res.json();
  }

  async function createActivity(
    payload: Omit<Activity, "_id">
  ): Promise<Activity> {
    const res = await fetch(`${API_BASE}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // backend returns an Activity object
  }

  const saveActivity = async () => {
    if (!canSave || savingActivity) return;

    setSavingActivity(true);

    try {
      await createActivity({
        activity: newActivity.activity.trim(),
        points: newActivity.points,
        date: newActivity.date.replaceAll("-", "/"),
      });
      const refreshed = await fetchActivities();
      setActivities(refreshed);
      setShowModal(false);
      setNewActivity({ activity: "", points: 0, date: "" });
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSavingActivity(false);
    }
  };
  // finally! return the main component!
  return (
    <div className="card my-4 mx-2">
      <div className="ra-header">
        <span className="title">Recent Activities</span>
        <button
          type="button"
          className="edit-btn"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {/* table */}
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
                    onClick={() => setShowModal(true)}
                  >
                    + Add Activity
                  </button>
                </td>
              </tr>
            )}

            {activitiesWithTotal.map((item, index) => {
              return (
                <tr
                  key={item._id}
                  className={index % 2 === 1 ? "yellow-row" : ""}
                >
                  {isEditing && (
                    <td>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteRow(item._id)}
                        aria-label={`Delete ${item.activity}`}
                        title="Delete"
                      >
                        <FiMinusCircle />
                      </button>
                    </td>
                  )}
                  <td>{item.activity}</td>
                  <td className="text-end">{item.points}</td>
                  <td className="text-end">{item.totalAfter}</td>
                  <td className="text-end">{formatDate(item.date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {showModal && (
        <>
          <div className="modal-backdrop" />
          <div className="modal-sheet">
            <div className="modal-card">
              <div className="modal-header">
                <div className="modal-title">Add an Activity</div>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-hint">
                Empty or non-positive activity cannot be added
              </div>
              <div className="modal-form m-3">
                <span className="modal-form-title mb-2">Activity Name</span>
                <div className="dropdown-wrapper" ref={dropdownRef}>
                  <input
                    className="cell-input px-3 py-2 "
                    type="text"
                    name="activity"
                    placeholder="Type activity"
                    value={newActivity.activity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewActivity((prev) => ({
                        ...prev,
                        activity: value,
                      }));
                      if (value.trim() === "") {
                        setShowOptions(false);
                      } else {
                        setShowOptions(true);
                      }
                    }}
                    onClick={() => {
                      if (newActivity.activity === "") setShowOptions(true);
                    }}
                  />
                  {showOptions && filteredOptions.length > 0 && (
                    <div className="dropdown-options">
                      {filteredOptions.map((opt, index) => (
                        <div
                          key={index}
                          className="dropdown-option"
                          onClick={() => {
                            setNewActivity((prev) => ({
                              ...prev,
                              activity: opt.name,
                              points: opt.points,
                            }));
                            setShowOptions(false);
                          }}
                        >
                          {opt.name} : {opt.points} pts
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <span className="modal-form-title mt-3 mb-2">Points</span>
                <input
                  className="cell-input px-3 py-2 mb-3"
                  type="number"
                  step="1"
                  value={newActivity.points || ""}
                  name="points"
                  placeholder="e.g., 25"
                  onChange={(e) =>
                    setNewActivity((prev) => ({
                      ...prev,
                      points: Number(e.target.value),
                    }))
                  }
                />
                <span className="modal-form-title mb-2">Date</span>
                <input
                  className="cell-input px-3 py-2 mb-2"
                  type="date"
                  name="date"
                  value={newActivity.date}
                  onChange={(e) =>
                    setNewActivity((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setNewActivity({ activity: "", points: 0, date: "" });
                  }}
                  disabled={savingActivity}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={saveActivity}
                  disabled={savingActivity || !canSave}
                >
                  {savingActivity ? "Adding..." : "Add"}
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
