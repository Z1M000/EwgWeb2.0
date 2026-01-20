import "./Header.css";
import { useNavigate } from "react-router-dom";
import { signOut, type User } from "firebase/auth";
import { auth } from "../firebase";

export default function Header({ user }: { user: User | null }) {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    if (user) {
      //log out
      try {
        await signOut(auth);
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="navbar d-flex flex-wrap align-items-center px-3">
      <div className="d-flex flex-wrap">
        <span className="brand-text">Emory Women's Golf Points Game</span>
      </div>
      <div className="ms-auto d-flex gap-1">
        <button className="nav-btn" onClick={handleAuthClick}>
          {user ? "Logout" : "Coach Login"}
        </button>
      </div>
    </div>
  );
}
