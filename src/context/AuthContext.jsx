import { createContext, useContext, useReducer } from "react";
import { AuthReducer } from "./reducer/AuthReducer";
import { sendEmail } from "../helper/SendEmail";

// const checkLogin = async () => {
//   try {
//     const res = await fetch("/api/Api/Main/GetCurData?cnlNums=101", {
//       credentials: "include", // penting! biar kirim cookie-nya
//     });

//     if (res.status === 200) {
//       return true;
//     } else {
//       return false;
//     }
//   } catch (err) {
//     console.error("Login Error");
//     return false;
//   }
// };

const initialState = {
  isLoggedIn: await checkLogin(),
};

const AuthContext = createContext(initialState);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initialState);

  async function setLoggedIn(username, password) {
    const res = await fetch("/api/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.ok) {
      console.log("Login berhasil");
      sendEmail();
    } else {
      throw new Error("Login gagal");
    }

    setTimeout(() => {
      setLoggedOut();
      alert("Sesi anda telah habis, silahkan login kembali");
    }, 1800000);

    dispatch({
      type: "LOGGED_IN",
      payload: {
        isLoggedIn: true,
      },
    });
  }

  async function setLoggedOut() {
    const res = await fetch("/api/Api/Auth/Logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok) {
      console.log("Logout berhasil");
      window.location.reload();
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
