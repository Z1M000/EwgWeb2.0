import "./BootOverlay.css";

const BootOverlay = ({ message }: { message: string }) => {
  return (
    <div className="boot-overlay">
      <div className="boot-card">
        <div className="boot-spinner" />
        <div className="boot-text">{message}</div>
        <div className="boot-subtext">it may take a few seconds</div>
      </div>
    </div>
  );
};

export default BootOverlay;
