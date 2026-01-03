import "./Header.css";

export default function Header() {
  return (
    <div className="navbar d-flex flex-wrap align-items-center px-3">
      <div className="d-flex flex-wrap">
        <span className="brand-text">Emory Women's Golf Points Game</span>
      </div>
      <div className="ms-auto d-flex gap-1">
        <button className="nav-btn">Login</button>
        <button className="nav-btn">Home</button>
      </div>
    </div>
  );
}
