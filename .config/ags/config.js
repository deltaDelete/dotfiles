import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { exec, execAsync, lookUpIcon } from "resource:///com/github/Aylur/ags/utils.js";
import Gdk from "./types/@girs/gdk-3.0/gdk-3.0.js";
import { Binding } from "resource:///com/github/Aylur/ags/service.js";

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
    return Widget.Box({
      class_names: ["workspaces", "module"],
      children: Hyprland.bind("workspaces").transform((ws) => {
        return ws
          .sort((a, b) => a.id - b.id)
          .map(({ id }) =>
            Widget.Button({
              on_clicked: () =>
                Hyprland.sendMessage(`dispatch workspace ${id}`),
              child: Widget.Label(`${id}`),
              class_name: Hyprland.active.workspace
                .bind("id")
                .transform(
                  (i) => `${i === id ? "workspace focused" : "workspace"}`
                ),
            })
          );
      }),
    });
}

function WorkspaceButton(
  /** @type {number} */ 
  element
) {
  return Widget.Button({
    class_names: Hyprland.bind("active").transform(a => {
        if (a.workspace.id == element) {
            return ["workspace", "focused"];
        } else {
            return ["workspace"]
        }
    }),
    visible: Hyprland.bind("workspaces").transform(ws => ws.some((x) => x.id == element)),
    setup: (self) => {
      self.name = `workspace-${element}`;
      self.on_clicked = () =>
        Hyprland.sendMessage(`dispatch workspace ${element}`);
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
      children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((element) =>
        WorkspaceButton(element)
      ),
    }),
  });

};

// TODO: group windows and show in menu
function Clients() {
    return Widget.Box({
    class_names: ["clients", "module"],
    hpack: "start",
    children: Hyprland.bind("clients").transform((clients) => {
      return clients
        .filter((x) => !x.hidden)
        .map((client) =>
          Widget.Button({
            child: Widget.Icon({
              class_name: "appicon",
              size: 16,
              icon: client.initialClass,
            }),
          })
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
          icon: Hyprland.active.client
            .bind("class")
            .transform((x) => (lookUpIcon(x, 24) ? x : "")),
          setup: (self) => {
            // @ts-ignore
            self.visible = self.bind(
              "visible",
              self,
              "icon",
              (v) => v.toString() != ""
            );
          },
        }),
        Widget.Label({
          label: Hyprland.active.client.bind("title"),
        }),
      ],
    });
}

// TODO OPEN CALENDAR
function Clock() {
    return Widget.Label({
      class_names: ["clock", "module", "hoverable"],
      setup: (self) =>
        self.poll(1000, (self) =>
          execAsync(["date", "+%H:%M:%S %d.%m.%Y"]).then(
            (date) => (self.label = date)
          )
        ),
    });
}

// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification() {
  return Widget.Box({
    class_names: ["notification", "module"],
    visible: Notifications.bind("popups").transform((p) => p.length > 0),
    children: [
      Widget.Icon({
        size: 24,
        icon: "preferences-system-notifications-symbolic",
      }),
      Widget.Label({
        label: Notifications.bind("popups").transform(
          (p) => p[0]?.summary || ""
        ),
      }),
    ],
  });
}

// TODO SHOW MORE AND
function Media() {
  return Widget.Button({
    class_names: ["media", "module", "hoverable"],
    on_primary_click: () => Mpris.getPlayer("")?.playPause(),
    on_scroll_up: () => Mpris.getPlayer("")?.next(),
    on_scroll_down: () => Mpris.getPlayer("")?.previous(),
    child: Widget.Label("-").hook(
      Mpris,
      (self) => {
        if (Mpris.players[0]) {
          const { track_artists, track_title } = Mpris.players[0];
          self.label = `${track_artists.join(", ")} - ${track_title}`;
        } else {
          self.label = "Nothing is playing";
        }
      },
      "player-changed"
    ),
  });
}

  // TODO PER APP VOLUME
function Volume() {
    const isVolumeRevealed = Variable(false);
    return Widget.EventBox({
      class_names: ["volume", "module"],
      css: "padding-left: 1rem; padding-right: 1rem;",
      tooltip_text: Audio.speaker
        .bind("volume")
        .transform((v) => (v * 100).toString()),
      "on-hover": (_) => {
        isVolumeRevealed.setValue(true);
        return true;
      },
      "on-hover-lost": (_) => {
        isVolumeRevealed.setValue(false);
        return true;
      },
      child: Widget.Box({
        children: [
          Widget.Icon({
            size: 18,
          }).hook(
            Audio,
            (self) => {
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
                : [101, 67, 34, 1, 0].find(
                    (threshold) => threshold <= Audio.speaker.volume * 100
                  );

              self.icon = `audio-volume-${category[icon]}-symbolic`;
            },
            "speaker-changed"
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
              setup: (self) =>
                self.hook(
                  Audio,
                  () => {
                    self.value = Audio.speaker?.volume || 0;
                  },
                  "speaker-changed"
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
      children: SystemTray.bind("items").transform((items) => {
        return items.map((item) =>
          Widget.Button({
            class_name: "hoverable",
            child: Widget.Icon({
              size: 16,
              icon: item.bind("icon"),
            }),
            tooltip_markup: item.bind("title"),
            setup: (self) => {
              self.on_primary_click = (_, event) => item.activate(event);
              self.on_secondary_click = (_, event) =>
                item.menu?.popup_at_widget(
                  self,
                  Gdk.Gravity.NORTH,
                  Gdk.Gravity.SOUTH,
                  event
                );
            },
          })
        );
      }),
    });
}

function PowerButton(icon, cmd, size = 18) {
    return Widget.Button({
        class_name: "hoverable",
        child: Widget.Icon({
            icon: icon,
            size: size
        }),
        on_middle_click: () => execAsync(cmd),
    })
}

function Power() {
    const isPowerRevealed = Variable(false);
    return Widget.EventBox({
      class_names: ["power", "module"],
      on_hover: (event) => isPowerRevealed.setValue(true),
      on_hover_lost: (event) => isPowerRevealed.setValue(false),
      child: Widget.Box({
        children: [
          Widget.Icon({
            class_name: isPowerRevealed.bind("value").transform(x => x ? "revealed" : ""),
            size: 24, 
            icon: "system-shutdown-symbolic" 
        }),
          Widget.Revealer({
            transitionDuration: 100,
            transition: "slide_right",
            hexpand: true,
            revealChild: isPowerRevealed.bind("value"),
            child: Widget.Box({
              children: [
                PowerButton("system-shutdown-symbolic", "shutdown now", 24),
                PowerButton("system-reboot-symbolic", "systemctl reboot"),
                PowerButton(
                  "system-lock-screen-symbolic",
                  "gtklock -d -i"
                ),
                PowerButton(
                  "distributor-logo-windows",
                  "systemctl reboot --boot-loader-entry=windows11.conf"
                ),
              ],
            }),
          }),
        ],
      }),
    });
}



// layout of the bar
const Left = () =>
  Widget.Box({
    spacing: 8,
    children: [
      ClientTitle(),
    ],
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
      Notification(),
      SysTray(),
      Clock(),
      Power(),
    ],
  });

function Bar(
  /** @type {Binding<any, any, number>} */ 
  monitor
  ) {
  return Widget.Window({
    name: "bar",
    class_name: "bar",
    monitor: monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
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
  });
}

import { monitorFile } from "resource:///com/github/Aylur/ags/utils.js";

monitorFile(`${App.configDir}/style.css`, function () {
  App.resetCss();
  App.applyCss(`${App.configDir}/style.css`);
});

export default {
  style: App.configDir + "/style.css",
  windows: [Bar(Hyprland.bind("monitors").transform(x => x[1].id))],
};
