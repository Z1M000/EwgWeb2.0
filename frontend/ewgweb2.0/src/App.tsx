import BootOverlay from "./components/BootOverlay";
import Header from "./components/Header";
import Roadmap from "./components/Roadmap";
import RecentActivities from "./components/RecentActivities";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import { useState, useEffect } from "react";
import { pingBackend } from "./utils/pingBackend";
import { API_BASE } from "./config";

export type Prize = {
  _id: string;
  points: number;
  label: string;
};

export type Activity = {
  _id: string;
  activity: string;
  points: number;
  date: string; // "2025/11/16"
};

const App = () => {
  const [booting, setBooting] = useState(false);
  const [bootMsg, setBootMsg] = useState("");
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const boot = async () => {
      let delayTimer: number | undefined;

      delayTimer = window.setTimeout(() => {
        setBooting(true);
        setBootMsg("Connecting to Server…");
      }, 1000);

      try {
        await pingBackend(API_BASE);

        const [prizesData, activitiesData] = await Promise.all([
          fetch(`${API_BASE}/prizes`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch prizes");
            return res.json();
          }),
          fetch(`${API_BASE}/activities`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch activities");
            return res.json();
          }),
        ]);

        setPrizes(prizesData);
        setActivities(activitiesData);

        if (delayTimer) clearTimeout(delayTimer);

        setBooting(false);
      } catch (e) {
        if (delayTimer) clearTimeout(delayTimer);
        setBooting(true);
        setBootMsg("Server is not responding.");
        setTimeout(() => setBooting(false), 1500);
      }
    };

    boot();
  }, []);

  const curPoint = activities.reduce((sum, a) => sum + a.points, 0);

  return (
    <div>
      {booting && <BootOverlay message={bootMsg} />}
      <Header />
      <Roadmap curPoint={curPoint} prizes={prizes} setPrizes={setPrizes} />
      <RecentActivities activities={activities} setActivities={setActivities} />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default App;
