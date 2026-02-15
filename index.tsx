import definePlugin from "@utils/types";
import { isVoiceChannel } from "./utils/channels";
import {
    ChannelStore,
    UserStore,
    NavigationRouter,
    SelectedChannelStore,
} from "@webpack/common";
import { settings } from "./settings";

import { Logger } from "@utils/Logger";

const pluginId = "autoOpenVoiceTextChat";
const pluginName = "Auto Open Voice Text Chat";
const logger = new Logger(pluginName, "#7289da");

let lastChannelId: string | null = null;

export default definePlugin({
    name: pluginName,
    authors: [
        { name: "Bluscream", id: 1205616252488519723n }
    ],
    description: "Automatically opens the text chat of a voice channel when joining it.",
    settings,
    onStart() {
        lastChannelId = SelectedChannelStore.getVoiceChannelId() ?? null;
        logger.log(`Plugin started. Initial voice channel: ${lastChannelId}`);
    },
    flux: {
        VOICE_STATE_UPDATES({ voiceStates }) {
            if (!settings.store.enabled) return;
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
