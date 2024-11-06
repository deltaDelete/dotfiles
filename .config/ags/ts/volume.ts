import Gtk from "gi://Gtk?version=3.0";
import { Popup, PopupAbsolute } from "./popup";
import { Window } from "resource:///com/github/Aylur/ags/widgets/window.js";
import Popover from "./popover";
import Gdk from "gi://Gdk?version=3.0";

// @ts-ignore
const Audio = await Service.import("audio");

function VolumePopup() {
    const apps = Audio.bind("apps").transform((apps) => {
        // console.log(apps);
        return apps.map((app) => {
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
                tooltip_text: app
                    .bind("volume")
                    .transform((x) => (x * 100).toFixed(2)),
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
export default function Volume() {
    const isVolumeRevealed = Variable(false);
    const selectedPlayer = Variable(1);
    /** @type {Variable<any | undefined>} */
    const popup = Variable<Window<Gtk.Widget, unknown> | undefined>(undefined);
    // const popup2 = Popup(VolumePopup());
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
            // popup2.set_position(Gtk.PositionType.BOTTOM);
            // popup2.set_relative_to(self);
            // const alloc = self.get_allocation();
            // const rect = new Gdk.Rectangle();
            // rect.x = alloc.x;
            // rect.y = alloc.y;
            // rect.width = alloc.width;
            // rect.height = alloc.height;
            // popup2.set_pointing_to(rect);
            // popup2.popup();
        },
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
                // popup2,
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
                                  (threshold) =>
                                      threshold <= Audio.speaker.volume * 100
                              );

                        // @ts-ignore
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
                        on_change: ({ value }) =>
                            (Audio.speaker.volume = value),
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
