const fs = require("fs-extra");

const spamTracker = {};

module.exports = {
  config: {
    name: "spamleave",
    version: "1.0",
    author: "Aesther",
    role: 0,
    shortDescription: "Quitte si un membre spam",
    longDescription: "Le bot quitte le groupe automatiquement si quelqu'un spam (10 messages en moins de 3s)",
    category: "automatique",
    guide: {
      fr: "Cette commande est active en permanence, pas besoin de l'appeler."
    }
  },

  // Ajout obligatoire pour éviter l'erreur
  onStart: async function () {
    // Ne fait rien
  },

  onChat: async function ({ event, api }) {
    const { threadID, senderID } = event;
    const now = Date.now();

    if (!spamTracker[threadID]) spamTracker[threadID] = {};
    if (!spamTracker[threadID][senderID]) spamTracker[threadID][senderID] = [];

    spamTracker[threadID][senderID].push(now);

    // Garde les timestamps récents (3 secondes)
    spamTracker[threadID][senderID] = spamTracker[threadID][senderID].filter(ts => now - ts < 3000);

    // Détection de spam : 10 messages en < 3 secondes
    if (spamTracker[threadID][senderID].length >= 10) {
      try {
        // Envoie image
        await api.sendMessage({
          attachment: await global.utils.getStreamFromURL("https://i.postimg.cc/rstS6Npb/20250318-202804.png")
        }, threadID);

        // Message stylisé
        await api.sendMessage("🚨 | 𝘚𝘱𝘢𝘮 𝘥𝘦́𝘵𝘦𝘤𝘵𝘦́ !\nJe quitte ce groupe pour préserver la paix. ✌️", threadID);

        // Quitte le groupe
        await api.removeUserFromGroup(global.GoatBot.botID, threadID);

        // Nettoyage
        delete spamTracker[threadID];
      } catch (err) {
        console.error("❌ Erreur spamleave :", err);
      }
    }
  }
};
