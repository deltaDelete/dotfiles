import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { monitorFile } from "resource:///com/github/Aylur/ags/utils.js";
import ClientTitle from "./clientTitle";
import { WorkspacesReactive } from "./workspaces";
import Media from "./media";
import Volume from "./volume";
import Language from "./language";
import SysTray from "./systray";
import Clock from "./clock";
import Power from "./power";

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

// TODO: group windows and show in menu
function Clients() {
    return Widget.Box({
        class_names: ["clients", "module"],
        hpack: "start",
        children: Hyprland.bind("clients").transform(clients => {
            return clients
                .filter(x => !x.hidden)
                .map(client =>
                    Widget.Button({
                        child: Widget.Icon({
                            class_name: "appicon",
                            size: 16,
                            icon: client.initialClass,
                        }),
                    }),
                );
        }),
    });
}

// layout of the bar
const Left = () =>
    Widget.Box({
        spacing: 8,
        children: [ClientTitle()],
    });

const Center = () =>
    Widget.Box({
        spacing: 8,
        children: [
            //   Workspaces(),
            WorkspacesReactive(),
        ],
    });

const Right = () =>
    Widget.Box({
        hpack: "end",
        spacing: 8,
        children: [
            Media(),
            Volume(),
            // Notification(),
            Language(),
            SysTray(),
            Clock(),
            Power(),
        ],
    });

function Bar(
    /** @type {number} */
    monitor,
) {
    return Widget.Window({
        name: "bar",
        class_name: "bar",
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        monitor: Hyprland.bind("monitors").transform(mons => {
            console.info("\tMonitors changed\n", mons);
            return mons[monitor].id;
        }),
        height_request: 74,
        child: Widget.CenterBox({
            margin_top: 12,
            margin_bottom: 12,
            margin_left: 20,
            margin_right: 20,
            start_widget: Left(),
            center_widget: Center(),
            end_widget: Right(),
        }),
        setup: self => {
            self.on("destroy", x => {
                console.info("Bar destroying");
                App.removeWindow(self);
                App.addWindow(Bar(monitor));
                console.info(`Bar respawned on monitor ${Hyprland.monitors[monitor]}`);
            });
        },
    });
}

monitorFile(`${App.configDir}/style.css`, function () {
    App.resetCss();
    App.applyCss(`${App.configDir}/style.css`);
});

App.config({
    style: `${App.configDir}/style.css`,
    windows: [Bar(1)],
})
console.log(App.configDir);