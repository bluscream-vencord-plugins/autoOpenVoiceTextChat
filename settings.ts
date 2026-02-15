import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    enabled: {
        type: OptionType.BOOLEAN,
        description: "Enable automatically opening voice text chat",
        default: true,
    },
    delay: {
        type: OptionType.SLIDER,
        description: "Delay before opening text chat in milliseconds",
        default: 500,
        min: 0,
        max: 5000,
        markers: [0, 250, 500, 1000, 2000, 5000],
    },
});
