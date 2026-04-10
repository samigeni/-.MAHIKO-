const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "box",
    version: "3.0",
    author: "Lonely",
    role: 1,
    countDown: 5,
    shortDescription: "Advanced Group Manager",
    category: "GROUP",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;

    if (!global.approvalData) global.approvalData = {};

    const status = global.approvalData[threadID] ? "🟢 ON" : "🔴 OFF";

    const menu = `📦 𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘𝗥

1️⃣ Change Group Name
2️⃣ Change Group Photo
3️⃣ Change Group Emoji
4️⃣ Change Your Nickname
5️⃣ Toggle Approval Mode

📌 Approval Status: ${status}

Reply with a number.`;

    return api.sendMessage(menu, threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "box",
        author: event.senderID,
        step: "menu"
      });
    }, messageID);
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, senderID, body } = event;
    if (senderID != Reply.author) return;

    if (!global.approvalData) global.approvalData = {};

    // ===== MENU =====
    if (Reply.step === "menu") {

      if (body === "1") {
        return api.sendMessage("✏️ Reply with new group name:", threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "box",
            author: senderID,
            step: "name"
          });
        });
      }

      if (body === "2") {
        return api.sendMessage("🖼️ Send the new group photo:", threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "box",
            author: senderID,
            step: "photo"
          });
        });
      }

      if (body === "3") {
        return api.sendMessage("😀 Reply with new emoji:", threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "box",
            author: senderID,
            step: "emoji"
          });
        });
      }

      if (body === "4") {
        return api.sendMessage("🏷️ Reply with new nickname:", threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "box",
            author: senderID,
            step: "nick"
          });
        });
      }

      if (body === "5") {
        const current = global.approvalData[threadID];
        global.approvalData[threadID] = !current;

        const newStatus = global.approvalData[threadID] ? "🟢 ENABLED" : "🔴 DISABLED";

        return api.sendMessage(`✅ Custom Approval Mode ${newStatus}`, threadID);
      }
    }

    // ===== CHANGE NAME =====
    if (Reply.step === "name") {
      await api.setTitle(body, threadID);
      return api.sendMessage("✅ Group name updated!", threadID);
    }

    // ===== CHANGE EMOJI =====
    if (Reply.step === "emoji") {
      await api.changeThreadEmoji(body, threadID);
      return api.sendMessage("✅ Group emoji updated!", threadID);
    }

    // ===== CHANGE NICKNAME =====
    if (Reply.step === "nick") {
      await api.changeNickname(body, threadID, senderID);
      return api.sendMessage("✅ Nickname updated!", threadID);
    }

    // ===== CHANGE PHOTO =====
    if (Reply.step === "photo") {
      if (!event.attachments || event.attachments.length === 0)
        return api.sendMessage("❌ Please send an image.", threadID);

      const imageURL = event.attachments[0].url;
      const filePath = path.join(__dirname, "cache", "group.jpg");

      fs.ensureDirSync(path.join(__dirname, "cache"));

      const response = await axios.get(imageURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, response.data);

      await api.changeGroupImage(fs.createReadStream(filePath), threadID);
      fs.unlinkSync(filePath);

      return api.sendMessage("✅ Group photo updated!", threadID);
    }
  }
};
