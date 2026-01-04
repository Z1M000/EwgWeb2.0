import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoMdCheckbox } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { CgAddR } from "react-icons/cg";
import "./Roadmap.css";

// Zod 验证规则
const PrizeRowSchema = z.object({
  id: z.string(),
  points: z.number().int().positive("Points must be > 0"),
  label: z.string().min(1, "Prize name is required"),
});

const FormSchema = z.object({
  prizes: z.array(PrizeRowSchema),
});

type FormData = z.infer<typeof FormSchema>;

const Roadmap = () => {
  const [showModal, setShowModal] = useState(false);

  // 表单初始化
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prizes: [
        { id: crypto.randomUUID(), points: 150, label: "Sticker Pack" },
        { id: crypto.randomUUID(), points: 425, label: "Team Hat" },
        { id: crypto.randomUUID(), points: 1150, label: "Team Hoodie" },
      ],
    },
  });

  // 动态数组管理
  const { fields, append, remove } = useFieldArray({
    control,
    name: "prizes",
  });

  const currentPoints = 219;
  const goal = 1150;

  const pct = Math.min((currentPoints / goal) * 100, 100);
  const cartLeft = Math.min(Math.max(pct, 2), 98);

  // 添加新行
  const addRow = () => {
    append({
      id: crypto.randomUUID(),
      points: 0,
      label: "",
    });
  };

  // 保存（带验证）
  const onSubmit = (data: FormData) => {
    console.log("✅ 验证通过！保存的数据：", data);
    setShowModal(false);
  };

  const handleSave = handleSubmit(onSubmit);

  return (
    <div className="card my-4 mx-2">
      <div className="d-flex align-items-center">
        <div>
          <span className="title score-current">{currentPoints}</span>
          <span className="score-label body"> / {goal} pts</span>
        </div>
        <button className="ms-auto edit-btn" onClick={() => setShowModal(true)}>
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

        {fields.map((prize) => {
          const ratio = prize.points / goal;
          const leftPct = Math.min(ratio * 100, 97.8);

          const achieved = currentPoints >= prize.points;

          return (
            <div
              key={prize.id}
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
        {fields.map((prize) => {
          const achieved = currentPoints >= prize.points;
          return (
            <div
              key={prize.id}
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
                    {fields.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-end">
                          <button
                            className="delete-btn"
                            onClick={() => remove(index)}
                          >
                            <FiMinusCircle />
                          </button>
                        </td>

                        <td>
                          <Controller
                            control={control}
                            name={`prizes.${index}.points`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className="cell-input px-1"
                                type="number"
                                placeholder="Enter points"
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            )}
                          />
                          {errors.prizes?.[index]?.points && (
                            <div className="text-danger small">
                              {errors.prizes[index]?.points?.message}
                            </div>
                          )}
                        </td>

                        <td>
                          <Controller
                            control={control}
                            name={`prizes.${index}.label`}
                            render={({ field }) => (
                              <input
                                {...field}
                                className="cell-input px-1"
                                type="text"
                                placeholder="Enter prize"
                              />
                            )}
                          />
                          {errors.prizes?.[index]?.label && (
                            <div className="text-danger small">
                              {errors.prizes[index]?.label?.message}
                            </div>
                          )}
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
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave}>
                  Save
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
