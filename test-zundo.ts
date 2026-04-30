import { create } from "zustand";
import { temporal } from "zundo";

const useStore = create<{ count: number }>()(
  temporal((set) => ({ count: 0 }))
);
console.log(useStore.temporal.getState());
