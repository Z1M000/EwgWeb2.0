import "./Roadmap.css";
import { IoMdCheckbox } from "react-icons/io";

const Roadmap = () => {
  // <TbGolfFilled />

  const prizes = [
    { points: 150, label: "Sticker Pack" },
    // { points: 200, label: "Team Keychain" },
    // { points: 250, label: "Water Bottle Sticker" },
    // { points: 300, label: "Team Water Bottle" },
    // { points: 350, label: "Team T-Shirt" },

    { points: 425, label: "Team Hat" }, // special midpoint

    // { points: 500, label: "Long Sleeve Tee" },
    // { points: 550, label: "Training Hoodie" },
    // { points: 600, label: "Team Sweatshirt" },
    // { points: 650, label: "Performance Jacket" },
    // { points: 700, label: "Team Beanie" },
    // { points: 750, label: "Team Jacket" },
    // { points: 800, label: "Elite Hoodie" },
    { points: 1150, label: "Team Hoodie" },
  ];

  const currentPoints = 219;
  const goal = 1150;

  const pct = Math.min((currentPoints / goal) * 100, 100);
  const cartLeft = Math.min(Math.max(pct, 2), 98);

  return (
    <div className="card my-4 mx-2">
      <div>
        <span className="title score-current">{currentPoints}</span>
        <span className="score-label body"> / {goal} pts</span>
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

          const achieved = currentPoints >= prize.points;

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
          const achieved = currentPoints >= prize.points;
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
    </div>
  );
};

export default Roadmap;
