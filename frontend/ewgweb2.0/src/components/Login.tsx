// acknowledege claude ai use
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Display message helper
  const showMessage = (msg: string, error: boolean = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => {
      setMessage("");
      setIsError(false);
    }, 5000);
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage("Signed in successfully!");
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
          ? "Invalid username or password"
          : error.message;
      showMessage(errorMessage, true);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showMessage("Please enter your email address", true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("Password reset email sent! Check your inbox.");
      setEmail("");
      setIsForgotPassword(false);
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  // Show login
  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHeader">
          <button className="nav-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        <div className="loginBody">
          {isForgotPassword ? (
            <>
              <h2 className="loginTitle">Reset Password</h2>

              <div className="formCard">
                <form onSubmit={handlePasswordReset}>
                  <div className="formRow">
                    <label className="formLabel" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="cell-input"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button className="primaryBtn" type="submit">
                    Send Reset Email
                  </button>
                </form>

                <div className="linkRow">
                  <button
                    className="linkBtn"
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    Remember your password? Sign In
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="title">Hi Coach 👋</p>

              <div className="formCard">
                <form onSubmit={handleSignIn}>
                  <div className="formRow">
                    <label className="formLabel" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="cell-input"
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="formRow">
                    <label className="formLabel" htmlFor="password">
                      Password
                    </label>
                    <input
                      className="cell-input"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button className="primaryBtn" type="submit">
                    Sign In
                  </button>
                </form>

                <div className="linkRow">
                  <button
                    className="linkBtn"
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </>
          )}

          {message && (
            <div
              className={[
                "message",
                isError ? "messageError" : "messageSuccess",
              ].join(" ")}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
