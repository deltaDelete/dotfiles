import { lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js";
import { Hyprland } from "./services";


export default function ClientTitle() {
    return Widget.Box({
        spacing: 8,
        class_names: ["client-title", "module"],
        children: [
            Widget.Icon({
                class_name: "appicon",
                size: 24,
                icon: Hyprland.active.client.bind("class").transform(x => (lookUpIcon(x, 24) ? x : "")),
                setup: self => {
                    // @ts-ignore
                    self.visible = self.bind("visible", self, "icon", (v: string | Gdk.Pixbuf | undefined) => v);
                },
            }),
            Widget.Label({
                label: Hyprland.active.client.bind("title"),
                max_width_chars: 50,
                truncate: "end",
            }),
        ],
    });
}