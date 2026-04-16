module.exports = {
  config: {
    name: "resend",
    version: "Rômeo",
    countDown: 5,
    role: 1,
    shortDescription: {
      en: "Enable/Disable Anti unsend mode"
    },
    longDescription: {
      en: "Anti unsend mode. Works with text and images only. When enabled, unsent messages will be resent to the chat."
    },
    category: "box chat",
    guide: {
      en: "{pn} on | off\nExample: {pn} on"
    }
  },

  onStart: async function ({ api, message, event, threadsData, args }) {
    const threadID = event.threadID;
    const command = args[0]?.toLowerCase();

    if (!global.reSend) {
      global.reSend = {};
    }

    if (command === "on") {
      await threadsData.set(threadID, true, "settings.reSend");
      
      if (!global.reSend.hasOwnProperty(threadID)) {
        global.reSend[threadID] = [];
      }
      
      try {
        global.reSend[threadID] = await api.getThreadHistory(threadID, 100, null);
        return message.reply("✅ Anti-unsend mode has been enabled! (Text and images only)");
      } catch (err) {
        console.error("Error loading thread history:", err);
        return message.reply("✅ Anti-unsend mode enabled, but there was an error loading message history.");
      }
    } 
    else if (command === "off") {
      await threadsData.set(threadID, false, "settings.reSend");
      return message.reply("❌ Anti-unsend mode has been disabled!");
    } 
    else {
      const status = await threadsData.get(threadID, "settings.reSend");
      return message.reply(`Anti-unsend mode is currently ${status ? "enabled" : "disabled"}.

Usage:
- ${this.config.name} on
- ${this.config.name} off`);
    }
  },

  onChat: async function ({ api, threadsData, usersData, event, message }) {
    const threadID = event.threadID;
    
    if (event.type === "message_unsend") {
      const resendEnabled = await threadsData.get(threadID, "settings.reSend");
      
      if (!resendEnabled || !global.reSend || !global.reSend[threadID]) {
        return;
      }
      
      const unsentMessage = global.reSend[threadID].find(msg => msg.messageID === event.messageID);
      
      if (!unsentMessage) {
        return;
      }
      
      let senderName = "Unknown";
      try {
        const userInfo = await api.getUserInfo(unsentMessage.senderID);
        senderName = userInfo[unsentMessage.senderID]?.name || "Unknown";
      } catch (err) {
        console.error("Error getting user info:", err);
      }
      
      if (unsentMessage.body) {
        await message.reply({
          body: `━━━━━━━━━━━━━━━━━━\n` +
                `⚠️ RECOVERED MESSAGE ⚠️\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `👤 User: ${senderName}\n` +
                `📥 Recovered content:\n` +
                `${unsentMessage.body}\n` +
                `━━━━━━━━━━━━━━━━━━`
        });
      }
      
      if (unsentMessage.attachments && unsentMessage.attachments.length > 0) {
        for (const attachment of unsentMessage.attachments) {
          if (attachment.type === "photo") {
            try {
              await message.reply({
                body: `━━━━━━━━━━━━━━━━━━\n` +
                      `⚠️ RECOVERED IMAGE ⚠️\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `👤 User: ${senderName}\n` +
                      `📥 Image recovered:\n` +
                      `━━━━━━━━━━━━━━━━━━`,
                attachment: await global.utils.getStreamFromURL(attachment.url)
              });
            } catch (err) {
              console.error("Error resending photo:", err);
              await message.reply(`━━━━━━━━━━━━━━━━━━\n` +
                                  `⚠️ RECOVERED IMAGE ⚠️\n` +
                                  `━━━━━━━━━━━━━━━━━━\n` +
                                  `👤 User: ${senderName}\n` +
                                  `📥 Image: (Error retrieving image)\n` +
                                  `━━━━━━━━━━━━━━━━━━`);
            }
          }
        }
      }
    } 
    else {
      const resendEnabled = await threadsData.get(threadID, "settings.reSend");
      
      if (!resendEnabled) {
        return;
      }
      
      if (!global.reSend) {
        global.reSend = {};
      }
      
      if (!global.reSend.hasOwnProperty(threadID)) {
        global.reSend[threadID] = [];
      }
      
      global.reSend[threadID].push(event);
      
      if (global.reSend[threadID].length > 100) {
        global.reSend[threadID].shift();
      }
    }
  }
}
