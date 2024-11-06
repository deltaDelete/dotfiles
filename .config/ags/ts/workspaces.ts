// @ts-ignore
const Hyprland = await Service.import("hyprland");

export function Workspaces() {
    return Widget.Box({
        class_names: ["workspaces", "module"],
        children: Hyprland.bind("workspaces").transform(ws => {
            return ws
                .sort((a, b) => a.id - b.id)
                .map(({ id }) =>
                    Widget.Button({
                        on_clicked: async () => await Hyprland.messageAsync(`dispatch workspace ${id}`),
                        child: Widget.Label(`${id}`),
                        class_name: Hyprland.active.workspace
                            .bind("id")
                            .transform(i => `${i === id ? "workspace focused" : "workspace"}`),
                    }),
                );
        }),
    });
}

function WorkspaceButton(
    /** @type {number} */
    element,
) {
    return Widget.Button({
        class_names: Hyprland.bind("active").transform(a => {
            if (a.workspace.id == element) {
                return ["workspace", "focused"];
            } else {
                return ["workspace"];
            }
        }),
        visible: Hyprland.bind("workspaces").transform(ws => ws.some(x => x.id == element)),
        setup: self => {
            self.name = `workspace-${element}`;
            self.on_clicked = async () => await Hyprland.messageAsync(`dispatch workspace ${element}`);
            self.child = Widget.Label(`${element}`);
        },
    });
}

// Compare list find the difference
export function WorkspacesReactive() {
    return Widget.EventBox({
        class_names: ["workspaces", "module"],
        on_scroll_up: async () => Hyprland.messageAsync(`dispatch workspace +1`),
        on_scroll_down: async () => Hyprland.messageAsync(`dispatch workspace -1`),
        child: Widget.Box({
            children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(element => WorkspaceButton(element)),
        }),
    });
}