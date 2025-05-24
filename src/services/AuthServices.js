export const CheckUserAuthRequest = async () => {
  try {
    const res = await fetch(`/api/api/auth/user`, {
      credentials: "include",
    });

    if (res.status == 200) {
      const data = await res.json();
      return data.user;
    }

    if (res.status == 500) {
      throw new Error("Terjadi kesalahan pada server, silahkan coba lagi");
    }

    if (res.status == 404) {
      throw new Error("Data tidak ditemukan, silahkan coba lagi");
    }
  } catch (error) {
    throw error;
  }
};

export const LoginRequest = async () => {};

export const LogoutRequest = async () => {};
