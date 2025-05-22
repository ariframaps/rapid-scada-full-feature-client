import { createContext, useContext, useReducer } from "react";
import { AuthReducer } from "./reducer/AuthReducer";
import { sendEmail } from "../helper/SendEmail";
import { useNavigate } from "react-router";

const checkLogin = async () => {
  try {
    const res = await fetch("/api/api/auth/user", {
      credentials: "include", // penting! biar kirim cookie-nya
    });

    if (res.status === 200) {
      const data = await res.json();
      return data.user;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Login Error");
    return false;
  }
};

const initialState = {
  isLoggedIn: await checkLogin(),
};

const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  let navigate = useNavigate();
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  async function setLoggedIn(username, password) {
    const res = await fetch("/api/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (res.status == 200) {
      console.log("Login berhasil");
      // sendEmail();
    } else if (res.status == 500) {
      throw new Error("Silahkan coba lagi");
    } else {
      throw new Error("Username atau password salah");
    }

    const data = await res.json();

    setTimeout(() => {
      setLoggedOut();
      alert("Sesi anda telah habis, silahkan login kembali");
    }, 30 * 60 * 1000);

    dispatch({
      type: "LOGGED_IN",
      payload: {
        isLoggedIn: data,
      },
    });
  }

  async function setLoggedOut() {
    const res = await fetch("/api/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (res.status == 200) {
      console.log("Logout berhasil");
      navigate("/login");
    } else {
      throw new Error("logout gagal");
    }

    dispatch({
      type: "LOGGED_OUT",
      payload: {
        isLoggedIn: false,
      },
    });
  }

  const value = {
    isLoggedIn: state.isLoggedIn,
    setLoggedIn,
    setLoggedOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
