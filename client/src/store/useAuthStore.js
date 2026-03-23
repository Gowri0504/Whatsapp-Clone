import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("userInfo")) || null,
  setUser: (user) => {
    if (user && user.token) {
      localStorage.setItem("token", user.token);
    }
    localStorage.setItem("userInfo", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    set({ user: null });
  },
}));

export default useAuthStore;
