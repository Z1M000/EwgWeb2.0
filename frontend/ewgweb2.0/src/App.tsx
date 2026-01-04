import Header from "./components/Header";
import Roadmap from "./components/Roadmap";
import RecentActivities from "./components/RecentActivities";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import { useState, useEffect } from "react";
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
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/prizes`)
      .then((res) => res.json())
      .then((data) => {
        setPrizes(data);
      })
      .catch((err) => {
        console.error("Failed to fetch prizes", err);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/activities`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
      })
      .catch((err) => {
        console.error("Failed to fetch activities", err);
      });
  }, []);

  const curPoint = activities.reduce((sum, a) => sum + a.points, 0);

  return (
    <div>
      <Header />
      <Roadmap curPoint={curPoint} prizes={prizes} setPrizes={setPrizes} />
      <RecentActivities />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default App;
