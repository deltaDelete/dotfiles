import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { exec, execAsync, lookUpIcon, monitorFile } from "resource:///com/github/Aylur/ags/utils.js";
import { Gdk } from "./types/@girs/gdk-3.0/gdk-3.0.js";
import { Binding } from "resource:///com/github/Aylur/ags/service.js";
import { Gtk } from "./types/@girs/gtk-3.0/gtk-3.0.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import { NotificationPopups } from "./notificationPopups.js";

const hyprland = await Service.import("hyprland");
// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
    return Widget.Box({
        class_names: ["workspaces", "module"],
        children: Hyprland.bind("workspaces").transform(ws => {
            return ws
                .sort((a, b) => a.id - b.id)
                .map(({ id }) =>
                    Widget.Button({
                        on_clicked: () => Hyprland.sendMessage(`dispatch workspace ${id}`),
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
            self.on_clicked = () => Hyprland.sendMessage(`dispatch workspace ${element}`);
            self.child = Widget.Label(`${element}`);
        },
    });
}

// Compare list find the difference
function WorkspacesReactive() {
    return Widget.EventBox({
        class_names: ["workspaces", "module"],
        on_scroll_up: () => Hyprland.sendMessage(`dispatch workspace +1`),
        on_scroll_down: () => Hyprland.sendMessage(`dispatch workspace -1`),
        child: Widget.Box({
            children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(element => WorkspaceButton(element)),
        }),
    });
}

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

function ClientTitle() {
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
                    self.visible = self.bind("visible", self, "icon", v => v.toString() != "");
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

// TODO OPEN CALENDAR
function Clock() {
    return Widget.Label({
        class_names: ["clock", "module", "hoverable"],
        setup: self =>
            self.poll(1000, self => execAsync(["date", "+%H:%M:%S %d.%m.%Y"]).then(date => (self.label = date))),
    });
}

function Popup(content) {
    return Widget.Menu({
        name: "media-popup",
        class_name: "fake-menu",
        children: [
            Widget.MenuItem(
                {
                    hpack: "fill",
                    can_focus: true,
                    hexpand: true,
                    vexpand: true,
                },
                content,
            ),
        ],
    });
}

function PopupAbsolute(
    /** @type {{content: Gtk.Widget, x: number, y: number}} */
    { content, x, y },
) {
    return Widget.Window({
        popup: true,
        name: "popup-layer",
        class_name: "popup-util module",
        exclusivity: "normal",
        keymode: "on-demand",
        margins: [x, y],
        anchor: ["top", "left"],
        layer: "top",
        setup: self => {
            self.child = content;
        },
    });
}

function Icon(icon, size) {
    return Widget.Icon({
        icon: icon,
        size: size,
    });
}

function MediaPopup(
    /** @type {Variable<number>} */
    selectedPlayer,
) {
    const image = Widget.Box({
        width_request: 256,
        height_request: 256,
        hpack: "fill",
        vpack: "fill",
        class_name: "image-box",
    }).hook(Mpris, self => {
        if (Mpris.players[selectedPlayer.getValue()]) {
            const cover_url = Mpris.players[selectedPlayer.getValue()].track_cover_url;
            const image_css = `background-image: url('${cover_url}');`;
            self.css = image_css;
        }
    });

    const artistLabel = Widget.Label().hook(Mpris, self => {
        if (Mpris.players[selectedPlayer.getValue()]) {
            const { track_artists } = Mpris.players[selectedPlayer.getValue()];
            self.label = track_artists.join(", ");
        } else {
            self.label = "Nothing is playing";
        }
    });

    const titleLabel = Widget.Label().hook(Mpris, self => {
        if (Mpris.players[selectedPlayer.getValue()]) {
            const { track_title } = Mpris.players[selectedPlayer.getValue()];
            self.label = track_title;
        } else {
            self.label = "Nothing is playing";
        }
    });

    const controls = Widget.Box(
        {
            hpack: "center",
            spacing: 8,
        },
        Widget.Button({
            class_name: "unmodule hoverable",
            can_focus: true,
            child: Icon("previous", 24),
            on_primary_click: () => {
                Mpris.players[selectedPlayer.value].previous();
            },
        }),
        Widget.Button({
            class_name: "unmodule hoverable",
            can_focus: true,
            child: Widget.Icon({
                size: 24,
            }).hook(selectedPlayer, self => {
                self.bind("icon", Mpris.players[selectedPlayer.value], "play_back_status", y =>
                    (y == "Playing" ? "media-playback-pause" : "media-playback-start").toString(),
                );
            }),
            on_primary_click: () => {
                Mpris.players[selectedPlayer.value].playPause();
            },
        }),
        Widget.Button({
            class_name: "unmodule hoverable",
            can_focus: true,
            child: Icon("next", 24),
            on_primary_click: () => {
                Mpris.players[selectedPlayer.value].next();
            },
        }),
    );

    const playerSelectors = Widget.Box({
        hpack: "center",
        spacing: 8,
        children: [
            Widget.Button({
                class_name: "unmodule hoverable",
                can_focus: true,
                tooltip_text: "Previous player",
                child: Icon("previous", 24),
                on_primary_click: () => {
                    selectedPlayer.value = Math.max(0, selectedPlayer.value - 1);
                },
            }),
            Widget.Button({
                class_name: "unmodule hoverable",
                can_focus: true,
                child: Widget.Label({
                    label: selectedPlayer.bind("value").transform(x => {
                        const player = Mpris.players[x];
                        console.log(player);
                        return player.identity;
                    }),
                }),
            }),
            Widget.Button({
                class_name: "unmodule hoverable",
                can_focus: true,
                tooltip_text: "Next player",
                child: Icon("next", 24),
                on_primary_click: () => {
                    selectedPlayer.value = Math.min(Mpris.players.length - 1, selectedPlayer.value + 1);
                },
            }),
        ],
    });

    return Widget.Box({
        hpack: "center",
        hexpand: true,
        vexpand: true,
        vertical: true,
        spacing: 16,
        children: [image, titleLabel, artistLabel, controls, playerSelectors],
    });
}

// TODO SHOW MORE AND
function Media() {
    const selectedPlayer = new Variable(1);
    /** @type {Variable<any | undefined>} */
    const popup = new Variable(undefined);
    return Widget.Button({
        class_names: ["media", "module", "hoverable"],
        on_primary_click: () => Mpris.players[selectedPlayer.value]?.playPause(),
        on_middle_click: (self, event) => {
            // popup.popup_at_widget(self, Gdk.Gravity.NORTH, Gdk.Gravity.SOUTH, event);
            if (popup.value == undefined) {
                const [found, x, y] = self.translate_coordinates(self.get_toplevel(), 0, 0);
                popup.value = PopupAbsolute({ content: MediaPopup(selectedPlayer), x: y, y: x });
            } else {
                popup.value.visible ? popup.value.hide() : popup.value.show();
            }
        },
        on_scroll_up: () => Mpris.players[selectedPlayer.value]?.next(),
        on_scroll_down: () => Mpris.players[selectedPlayer.value]?.previous(),
        child: Widget.Label({
            label: "-",
            max_width_chars: 50,
            truncate: "end",
        }).hook(
            Mpris,
            self => {
                if (Mpris.players[selectedPlayer.getValue()]) {
                    const { track_artists, track_title } = Mpris.players[selectedPlayer.getValue()];
                    self.label = `${track_artists.join(", ")} - ${track_title}`;
                } else {
                    self.label = "Nothing is playing";
                }
            },
            "player-changed",
        ),
    });
}

function VolumePopup() {
    const apps = Audio.bind("apps").transform(apps => {
        console.log(apps);
        return apps.map(app => {
            const label = !!app.icon_name
                ? app.icon_name != "audio"
                    ? Widget.Icon({
                          icon: app.icon_name,
                          size: 24,
                          tooltip_text: app.name,
                      })
                    : Widget.Label({ label: app.name, height_request: 24 })
                : Widget.Label({ label: app.name });
            const slider = Widget.Slider({
                hexpand: true,
                height_request: 128,
                draw_value: false,
                max: 1,
                min: 0,
                orientation: 1,
                inverted: true,
                vpack: "start",
                on_change: ({ value }) => (app.volume = value),
                tooltip_text: app.bind("volume").transform(x => (x * 100).toFixed(2)),
                value: app.bind("volume"),
            });
            return Widget.Box({
                spacing: 8,
                vertical: true,
                children: [label, slider],
            });
        });
    });

    return Widget.Box({
        vertical: false,
        spacing: 8,
        children: apps,
    });
}

// TODO PER APP VOLUME
function Volume() {
    const isVolumeRevealed = new Variable(false);
    const selectedPlayer = new Variable(1);
    /** @type {Variable<any | undefined>} */
    const popup = new Variable(undefined);
    return Widget.EventBox({
        on_middle_click: (self, event) => {
            if (popup.value == undefined) {
                const [found, x, y] = self.translate_coordinates(self.get_toplevel(), 0, 0);
                popup.value = PopupAbsolute({
                    content: VolumePopup(),
                    x: y,
                    y: x,
                });
            } else {
                popup.value.visible ? popup.value.hide() : popup.value.show();
            }
        },
        class_names: ["volume", "module"],
        css: "padding-left: 1rem; padding-right: 1rem;",
        tooltip_text: Audio.speaker.bind("volume").transform(v => (v * 100).toString()),
        "on-hover": _ => {
            isVolumeRevealed.setValue(true);
            return true;
        },
        "on-hover-lost": _ => {
            isVolumeRevealed.setValue(false);
            return true;
        },
        child: Widget.Box({
            children: [
                Widget.Icon({
                    size: 18,
                }).hook(
                    Audio,
                    self => {
                        if (!Audio.speaker) return;

                        const category = {
                            101: "overamplified",
                            67: "high",
                            34: "medium",
                            1: "low",
                            0: "muted",
                        };

                        const icon = Audio.speaker.is_muted
                            ? 0
                            : [101, 67, 34, 1, 0].find(threshold => threshold <= Audio.speaker.volume * 100);

                        self.icon = `audio-volume-${category[icon]}-symbolic`;
                    },
                    "speaker-changed",
                ),
                Widget.Revealer({
                    transitionDuration: 100,
                    transition: "slide_right",
                    hexpand: true,
                    revealChild: isVolumeRevealed.bind("value"),
                    child: Widget.Slider({
                        hexpand: true,
                        width_request: 128,
                        draw_value: false,
                        vpack: "center",
                        on_change: ({ value }) => (Audio.speaker.volume = value),
                        setup: self =>
                            self.hook(
                                Audio,
                                () => {
                                    self.value = Audio.speaker?.volume || 0;
                                },
                                "speaker-changed",
                            ),
                    }),
                }),
            ],
        }),
    });
}

function SysTray() {
    return Widget.Box({
        class_names: ["module", "systray"],
        children: SystemTray.bind("items").transform(items => {
            return items.map(item =>
                Widget.Button({
                    class_name: "hoverable",
                    child: Widget.Icon({
                        size: 16,
                        icon: item.bind("icon"),
                    }),
                    tooltip_markup: item.bind("title"),
                    setup: self => {
                        self.on_primary_click = (_, event) => item.activate(event);
                        self.on_secondary_click = (_, event) => {
                            console.log(item.menu);
                            item.menu?.popup_at_widget(self, Gdk.Gravity.NORTH, Gdk.Gravity.SOUTH, event);
                        };
                    },
                }),
            );
        }),
    });
}

function PowerButton(icon, cmd, size = 18) {
    return Widget.Button({
        class_name: "hoverable",
        child: Widget.Icon({
            icon: icon,
            size: size,
        }),
        on_middle_click: () => execAsync(cmd),
    });
}

function Power() {
    const isPowerRevealed = new Variable(false);
    return Widget.EventBox({
        class_names: ["power", "module"],
        on_hover: event => isPowerRevealed.setValue(true),
        on_hover_lost: event => isPowerRevealed.setValue(false),
        child: Widget.Box({
            children: [
                Widget.Icon({
                    class_name: isPowerRevealed.bind("value").transform(x => (x ? "revealed" : "")),
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
                                "shutdowner -b ~/.config/hypr/gracefully_close.sh shutdown",
                                24,
                            ),
                            PowerButton(
                                "system-reboot-symbolic",
                                "shutdowner -b ~/.config/hypr/gracefully_close.sh reboot",
                            ),
                            PowerButton("system-hibernate-symbolic", "hyprctl dispatch dpms off"),
                            PowerButton("system-lock-screen-symbolic", "gtklock -d -i"),
                            PowerButton(
                                "distributor-logo-windows",
                                "shutdowner -b ~/.config/hypr/gracefully_windows.sh reboot",
                            ),
                        ],
                    }),
                }),
            ],
        }),
    });
}

function Language() {
    return Widget.Button({
        class_names: ["module", "hoverable", "language"],
        on_primary_click: _ => {
            execAsync("hyprctl devices -j")
                .then(s => JSON.parse(s))
                .then(s => s.keyboards)
                .then(s => s[0].name)
                .then(s => execAsync(`hyprctl switchxkblayout ${s} next`))
                .catch(s => console.log(s));
        },
        child: Widget.Label({
            label: "🇬🇧",
            setup: self => {
                hyprland.connect("keyboard-layout", (_, keyboardname, layoutname) => {
                    self.label = layoutname == "Russian" ? "🇷🇺" : "🇬🇧";
                    self.tooltip_text = layoutname;
                });
            },
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

export default {
    style: App.configDir + "/style.css",
    windows: [Bar(1), NotificationPopups()],
};
