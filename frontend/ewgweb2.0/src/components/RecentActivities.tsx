import "./RecentActivities.css";
import { useState } from "react";
import { FiMinusCircle } from "react-icons/fi";
import type { Activity } from "../App";
import type { Dispatch, SetStateAction } from "react";
import { tempId } from "./Roadmap";
import { API_BASE } from "../config";

interface Props {
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
}

// ============ Constants ============
// const ACTIVITY_LIBRARY = [
//   { name: "Team Win", points: 100 },
//   { name: "Team Round Under-Par", points: 50 },
//   { name: "Beat Scoring Record", points: 100 },
//   { name: "Team Tournament Goal", points: 25 },
//   { name: "Play day goal", points: 20 },
//   { name: "Community Service", points: 50 },
//   { name: "Close-out Drills", points: 10 },
// ];

const RecentActivities = ({ activities, setActivities }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Omit<Activity, "_id">>({
    activity: "",
    points: 0,
    date: "",
  });
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

  const saveActivity = async () => {
    if (!canSave) return;

    setSavingActivity(true);

    // ui update first
    const optimistic: Activity = {
      _id: tempId(),
      activity: newActivity.activity.trim(),
      points: newActivity.points,
      date: newActivity.date.replaceAll("-", "/"),
    };
    setActivities((prev) => [optimistic, ...prev]);

    try {
      const created = await createActivity({
        activity: optimistic.activity,
        points: optimistic.points,
        date: optimistic.date,
      });

      // then show the real data
      setActivities((prev) =>
        prev.map((a) => (a._id === optimistic._id ? created : a))
      );
    } catch (e) {
      console.error("Save failed:", e);
      // if failed, remove the temp activity and rerender
      setActivities((prev) => prev.filter((a) => a._id !== optimistic._id));
      const refreshed = await fetchActivities();
      setActivities(refreshed);
    } finally {
      setShowModal(false);
      setSavingActivity(false);
      setNewActivity({ activity: "", points: 0, date: "" });
    }
  };

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
                    <td className="text-center">
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
                  Empty or non-positive activity can't be added
                </div>
                <div className="modal-form m-3">
                  <span className="modal-form-title mb-2">Activity Name</span>
                  <input
                    className="cell-input px-3 py-2 mb-3 "
                    type="text"
                    name="activity"
                    placeholder="Type activity"
                    value={newActivity.activity}
                    onChange={(e) =>
                      setNewActivity((prev) => ({
                        ...prev,
                        activity: e.target.value,
                      }))
                    }
                  />
                  <span className="modal-form-title mb-2">Points</span>
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
    </div>
  );
};

export default RecentActivities;
