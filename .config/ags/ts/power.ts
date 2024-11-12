import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import {
    exec,
    execAsync,
    lookUpIcon,
    monitorFile,
} from "resource:///com/github/Aylur/ags/utils.js";

function PowerButton(icon, cmd, size = 18) {
    return Widget.Button({
        class_name: "hoverable",
        child: Widget.Icon({
            icon: icon,
            size: size,
        }),
        on_middle_click: () => execAsync(`bash -c "${cmd}"`),
    });
}

export default function Power() {
    const isPowerRevealed = new Variable(false);
    return Widget.EventBox({
        class_names: ["power", "module"],
        on_hover: (event) => isPowerRevealed.setValue(true),
        on_hover_lost: (event) => isPowerRevealed.setValue(false),
        child: Widget.Box({
            children: [
                Widget.Icon({
                    class_name: isPowerRevealed
                        .bind("value")
                        .transform((x) => (x ? "revealed" : "")),
                    size: 24,
                    icon: "system-shutdown-symbolic",
                }),
                Widget.Revealer({
                    transitionDuration: 100,
                    transition: "slide_right",
                    hexpand: true,
                    revealChild: isPowerRevealed.bind("value"),
                    child: Widget.Box({
                        children: [
                            PowerButton(
                                "system-shutdown-symbolic",
                                "~/.config/hypr/scripts/gracefully_close.sh && systemctl poweroff",
                                24,
                            ),
                            PowerButton(
                                "system-reboot-symbolic",
                                "~/.config/hypr/scripts/gracefully_close.sh && systemctl reboot",
                            ),
                            PowerButton(
                                "system-hibernate-symbolic",
                                "hyprctl dispatch dpms off",
                            ),
                            PowerButton(
                                "system-lock-screen-symbolic",
                                "hyprlock --immediate",
                            ),
                            PowerButton(
                                "distributor-logo-windows",
                                "~/.config/hypr/scripts/gracefully_windows.sh && systemctl reboot",
                            ),
                        ],
                    }),
                }),
            ],
        }),
    });
}

