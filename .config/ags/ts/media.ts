import Window from "types/widgets/window";
import { PopupAbsolute } from "./popup";
import Gtk from "gi://Gtk?version=3.0";
import Icon from "./icon";

// @ts-ignore
const Mpris = await Service.import("mpris");

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
export default function Media() {
    const selectedPlayer = Variable(1);
    /** @type {Variable<any | undefined>} */
    const popup = Variable<Window<Gtk.Widget, unknown> | undefined>(undefined);
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
