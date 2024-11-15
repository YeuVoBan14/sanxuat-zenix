import { create } from "zustand"

interface SidebarToggle {
    toggleCollapse: boolean,
    invokeToggleCollapse: () => void,
    setToggleCollapse: (value: boolean) => void,
}

export const useSideBarToggle = create<SidebarToggle>((set, get) => ({
    toggleCollapse: false,
    invokeToggleCollapse: () => set({ toggleCollapse: !get().toggleCollapse }),
    setToggleCollapse: (value: boolean) => set({ toggleCollapse: value })
}))