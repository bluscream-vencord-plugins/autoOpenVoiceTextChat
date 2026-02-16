//// Plugin originally written for Equicord at 2026-02-16 by https://github.com/Bluscream, https://antigravity.google
// region Imports
import {
    ChannelStore,
    NavigationRouter,
    SelectedChannelStore,
    UserStore,
} from "@webpack/common";

import definePlugin from "@utils/types";
import { Logger } from "@utils/Logger";

import { settings } from "./settings";
import { isVoiceChannel } from "./utils/channels";
// endregion Imports

// region PluginInfo
export const pluginInfo = {
    id: "autoOpenVoiceTextChat",
    name: "Auto Open Voice Text Chat",
    description: "Automatically opens the text chat of a voice channel when joining it.",
    color: "#7289da",
    authors: [
        { name: "Bluscream", id: 1205616252488519723n },
        { name: "Assistant", id: 0n }
    ],
};
// endregion PluginInfo

// region Variables
const logger = new Logger(pluginInfo.id, pluginInfo.color);
let lastChannelId: string | null = null;
// endregion Variables

// region Definition
export default definePlugin({
    name: pluginInfo.id,
    description: pluginInfo.description,
    authors: pluginInfo.authors,
    settings,

    onStart() {
        lastChannelId = SelectedChannelStore.getVoiceChannelId() ?? null;
        logger.log(`Plugin started. Initial voice channel: ${lastChannelId}`);
    },

    flux: {
        VOICE_STATE_UPDATES({ voiceStates }) {
            const me = UserStore.getCurrentUser();
            if (!me) return;

            for (const s of voiceStates) {
                if (s.userId === me.id) {
                    const newChannelId = s.channelId ?? null;
                    if (newChannelId && newChannelId !== lastChannelId) {
                        const channel = ChannelStore.getChannel(newChannelId);
                        // Only open if it's a voice channel or stage channel
                        if (isVoiceChannel(channel)) {
                            logger.log(`Joined voice channel ${newChannelId}, opening text chat...`);

                            setTimeout(() => {
                                // Double check we are still in that channel
                                if (SelectedChannelStore.getVoiceChannelId() === newChannelId) {
                                    NavigationRouter.transitionTo(`/channels/${channel.guild_id ?? "@me"}/${newChannelId}`);
                                }
                            }, settings.store.delay);
                        }
                    }
                    lastChannelId = newChannelId;
                }
            }
        }
    }
});
// endregion Definition
