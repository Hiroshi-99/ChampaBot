const Event = require("../../structures/Events");
const { generateInvitesCache } = require("../../utils/utils.js");

module.exports = class InviteCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(invite) {
    if(!invite.guild.members.me.permissions.has("ManageGuild")) return;
    await invite.guild.invites.fetch().catch(() => {});
		const guildInvites = generateInvitesCache(invite.guild.invites.cache);
    
    this.client.invites.set(invite.guild.id, guildInvites);
  }
};