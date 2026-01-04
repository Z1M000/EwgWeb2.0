import { useState } from "react";
import "./Roadmap.css";
import { IoMdCheckbox } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { CgAddR } from "react-icons/cg";
import type { Prize } from "../App";
import type { Dispatch, SetStateAction } from "react";
import { API_BASE } from "../config";

interface Props {
  curPoint: number;
  prizes: Prize[];
  setPrizes: Dispatch<SetStateAction<Prize[]>>;
}

const tempId = () => `tmp_${crypto.randomUUID()}`;

const Roadmap = ({ curPoint, prizes, setPrizes }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const goal = prizes.length > 0 ? prizes[prizes.length - 1].points : 0;
  const pct = Math.min((curPoint / goal) * 100, 100);
  const cartLeft = Math.min(Math.max(pct, 2), 98);
  const [draftPrizes, setDraftPrizes] = useState<Prize[]>([]);
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setDraftPrizes(prizes.map((p) => ({ ...p })));
    setShowModal(true);
  };

  const cancelEdit = () => {
    setShowModal(false);
    setDraftPrizes([]);
  };

  const addRow = () => {
    setDraftPrizes((prev) => [
      ...prev,
      { _id: tempId(), points: 0, label: "" } as Prize,
    ]);
  };

  const deleteRow = (id: string) => {
    setDraftPrizes((prev) => prev.filter((p) => p._id !== id));
  };

  const editPoints = (id: string, points: number) => {
    setDraftPrizes((prev) =>
      prev.map((p) => (p._id === id ? { ...p, points } : p))
    );
  };

  const editLabel = (id: string, label: string) => {
    setDraftPrizes((prev) =>
      prev.map((p) => (p._id === id ? { ...p, label } : p))
    );
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      // 1) clean and sort draft prize
      const cleaned = draftPrizes
        .map((p) => ({
          ...p,
          points: Number(p.points),
          label: (p.label ?? "").trim(),
        }))
        .filter((p) => p.label.length > 0 || p.points <= 0); // 不要空 label 的行（你也可以改成允许）

      cleaned.sort((a, b) => a.points - b.points);

      // 2) old prizes vs current cleaned draft prizes
      const oldMap = new Map(prizes.map((p) => [p._id, p]));
      const newMap = new Map(cleaned.map((p) => [p._id, p]));

      const toDelete = prizes.filter((p) => !newMap.has(p._id));
      const toCreate = cleaned.filter((p) => p._id.startsWith("tmp_")); // 新增行
      const toUpdate = cleaned.filter((p) => {
        if (p._id.startsWith("tmp_")) return false;
        const old = oldMap.get(p._id);
        return !!old && (old.points !== p.points || old.label !== p.label);
      });

      // 3) sync to backend
      const reqs: Promise<any>[] = [];

      // delete
      for (const p of toDelete) {
        reqs.push(fetch(`${API_BASE}/prizes/${p._id}`, { method: "DELETE" }));
      }

      // create
      for (const p of toCreate) {
        reqs.push(
          fetch(`${API_BASE}/prizes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: p.points, label: p.label }),
          })
        );
      }

      // update
      for (const p of toUpdate) {
        reqs.push(
          fetch(`${API_BASE}/prizes/${p._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: p.points, label: p.label }),
          })
        );
      }

      const responses = await Promise.all(reqs);
      const bad = responses.find((r) => !r.ok);
      if (bad) throw new Error("One of the save requests failed");

      // 4) rerender updated prizes
      const latest = await fetch(`${API_BASE}/prizes`).then((r) => r.json());
      setPrizes(latest);

      setShowModal(false);
      setDraftPrizes([]);
    } catch (e) {
      console.error(e);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card my-4 mx-2">
      <div className="d-flex align-items-center">
        <div>
          <span className="title score-current">{curPoint}</span>
          <span className="score-label body"> / {goal} pts</span>
        </div>
        <button className="ms-auto edit-btn" onClick={openEdit}>
          Edit
        </button>
      </div>

      <div className="pb-track">
        <div className="goal-flag" style={{ left: "98%" }}>
          ⛳
        </div>
        <div className="cart-marker" style={{ left: `${cartLeft}%` }}>
          🛺
        </div>

        <div className="pb-track-bg">
          <div className="pb-fill" style={{ width: `${pct}%` }}></div>
        </div>

        {prizes.map((prize) => {
          const ratio = prize.points / goal;
          const leftPct = Math.min(ratio * 100, 97.8);

          const achieved = curPoint >= prize.points;

          return (
            <div
              key={prize.points}
              className={`prize-dot ${achieved ? "achieved" : ""}`}
              style={{ left: `${leftPct}%` }}
            >
              <span className="dot-text">{prize.points}</span>
            </div>
          );
        })}
      </div>

      <div className="prize-list mt-3 mx-1">
        <span className="prize-title">Prizes Details</span>
        {prizes.map((prize) => {
          const achieved = curPoint >= prize.points;
          return (
            <div
              key={prize.points}
              className={`prize-item ${achieved ? "achieved" : ""}`}
            >
              <span>
                - {prize.points} pts, {prize.label}
              </span>

              {achieved && <IoMdCheckbox className="prize-check" />}
            </div>
          );
        })}
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop" />
          <div className="modal-sheet">
            <div className="modal-card">
              <div className="modal-header">
                <div className="modal-title">Edit Goal and Prizes</div>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-hint">
                The goal is the highest-point prize. Non-positive or empty
                prizes are removed on save.
              </div>

              {/* table */}
              <div className="table-responsive small-text mt-2 mx-2">
                <table className="table table-borderless align-middle ra-table mb-1">
                  <thead>
                    <tr>
                      <th className="th-delete"></th>
                      <th className="th-pts">PTS</th>
                      <th>PRIZE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {draftPrizes.map((item) => (
                      <tr key={item._id}>
                        <td className="text-end">
                          <button
                            className="delete-btn"
                            onClick={() => deleteRow(item._id)}
                          >
                            <FiMinusCircle />
                          </button>
                        </td>

                        <td>
                          <input
                            className="cell-input px-1"
                            type="number"
                            step="1"
                            value={item.points}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const newPoints = raw === "" ? 0 : Number(raw);
                              editPoints(item._id, newPoints);
                            }}
                          />
                        </td>

                        <td>
                          <input
                            className="cell-input px-1"
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              editLabel(item._id, e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* add prize */}
              <div className="add-prize-row mb-3">
                <CgAddR className="add-prize-btn" onClick={addRow} />
              </div>
              {/* footer */}
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Roadmap;
