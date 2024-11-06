import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";

// TODO OPEN CALENDAR
export default function Clock() {
    return Widget.Button(
        {
            class_names: ["clock", "module", "hoverable"],
            onClicked: () => execAsync("swaync-client -t")
        },
        Widget.Label({
            setup: (self) => {
                self.poll(1000, (self) =>
                    execAsync(["date", "+%H:%M:%S %d.%m.%Y"]).then(
                        (date) => (self.label = date)
                    )
                );
            },
        })
    );
}