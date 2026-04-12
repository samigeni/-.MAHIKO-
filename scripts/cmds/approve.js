const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "approve",
    aliases: ["approval"],
    version: "2.0",
    author: "Aesther",
    role: 2,
    shortDescription: "✅ Approuver les groupes autorisés",
    longDescription: "Approuve ou rejette des groupes via config.json",
    category: "admin",
    guide: {
      fr: `⚙️ Utilisation :
{pn}                  → Approuve ce groupe
{pn} <groupID>        → Approuve un groupe par ID
{pn} list             → Liste des groupes approuvés
{pn} pending          → Liste des groupes en attente
{pn} reject <groupID> → Rejette un groupe
{pn} help             → Affiche cette aide`
    }
  },

  onStart: async function ({ api, event, args }) {
    const CONFIG_PATH = path.join(__dirname, "../../config.json");
    const { threadID, senderID, messageID } = event;
    const DEFAULT_OWNER = "61568791604271";
    const OWNER_ID = global.GoatBot?.config?.ADMIN?.[0] || DEFAULT_OWNER;

    // 🔐 Restriction Owner
    if (senderID !== OWNER_ID) {
      return api.sendMessage("⛔ | Seul l'OWNER peut utiliser cette commande !", threadID, messageID);
    }

    // 📦 Chargement ou création du fichier config
    function loadConfig() {
      try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      } catch {
        const def = {
          AUTO_APPROVE: {
            enabled: true,
            approvedGroups: [],
            autoApproveMessage: false
          },
          APPROVAL: {
            approvedGroups: [],
            pendingGroups: [],
            rejectedGroups: []
          }
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(def, null, 2));
        return def;
      }
    }

    function saveConfig(config) {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    }

    const config = loadConfig();
    const subCommand = (args[0] || "").toLowerCase();

    // 🆘 Aide
    if (subCommand === "help") {
      return api.sendMessage(this.config.guide.fr.replace(/{pn}/g, global.GoatBot.config.prefix + this.config.name), threadID, messageID);
    }

    // 📜 Liste approuvés
    if (subCommand === "list") {
      const approved = config.APPROVAL.approvedGroups || [];
      if (!approved.length) return api.sendMessage("📭 Aucun groupe approuvé.", threadID, messageID);
      return api.sendMessage(`✅ Groupes approuvés (${approved.length}) :\n\n` +
        approved.map((id, i) => `${i + 1}. 🆔 ${id}`).join("\n"), threadID, messageID);
    }

    // ⏳ Liste en attente
    if (subCommand === "pending") {
      const pending = config.APPROVAL.pendingGroups || [];
      if (!pending.length) return api.sendMessage("⏳ Aucun groupe en attente.", threadID, messageID);
      return api.sendMessage(`🕒 Groupes en attente (${pending.length}) :\n\n` +
        pending.map((id, i) => `${i + 1}. 🆔 ${id}`).join("\n"), threadID, messageID);
    }

    // ❌ Rejeter un groupe
    if (subCommand === "reject") {
      const groupId = args[1];
      if (!groupId) return api.sendMessage("❌ | Fournis l’ID du groupe à rejeter.", threadID, messageID);

      ["approvedGroups", "pendingGroups"].forEach(key => {
        const idx = config.APPROVAL[key].indexOf(groupId);
        if (idx !== -1) config.APPROVAL[key].splice(idx, 1);
      });

      if (!config.APPROVAL.rejectedGroups.includes(groupId)) {
        config.APPROVAL.rejectedGroups.push(groupId);
      }

      saveConfig(config);
      api.sendMessage(`🚫 Groupe ${groupId} rejeté avec succès.`, threadID, messageID);
      try {
        api.sendMessage("❌ Ce groupe a été rejeté par l'admin. Le bot ne fonctionnera plus ici.", groupId);
      } catch {}
      return;
    }

    // ✅ Approuver un groupe
    let targetID = (!isNaN(args[0])) ? args[0] : threadID;

    if (config.APPROVAL.approvedGroups.includes(targetID)) {
      return api.sendMessage(`✅ Ce groupe est déjà approuvé.\n🆔 ${targetID}`, threadID, messageID);
    }

    if (config.APPROVAL.rejectedGroups.includes(targetID)) {
      return api.sendMessage(`❌ Ce groupe a été rejeté précédemment.\n🆔 ${targetID}`, threadID, messageID);
    }

    // 💾 Mise à jour
    config.APPROVAL.pendingGroups = config.APPROVAL.pendingGroups.filter(id => id !== targetID);
    config.APPROVAL.approvedGroups.push(targetID);

    // 🌟 Ajout au système auto
    if (config.AUTO_APPROVE?.enabled && !config.AUTO_APPROVE.approvedGroups.includes(targetID)) {
      config.AUTO_APPROVE.approvedGroups.push(targetID);
    }

    saveConfig(config);
    return api.sendMessage(
      `🎉 Groupe approuvé avec succès !\n\n🆔 Thread ID: ${targetID}\n✨ Le bot est maintenant actif ici.`,
      threadID, messageID
    );
  }
};
