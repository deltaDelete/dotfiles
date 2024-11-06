import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Gdk from "types/@girs/gdk-3.0/gdk-3.0";

export default function SysTray() {
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
                            item.menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.SOUTH, event);
                        };
                    },
                }),
            );
        }),
    });
}
