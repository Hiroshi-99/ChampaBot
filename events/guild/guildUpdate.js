const Event = require("../../structures/Events");

module.exports = class GuildUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldGuild, newGuild) {
	  if(!oldGuild.members.me.permissions.has("ManageGuild")) return;

    if(oldGuild.name !== newGuild.name) {
      this.client.utils.logs(this.client, oldGuild, this.client.language.titles.logs.guild_update, [{
        name: this.client.language.titles.logs.audit.old_guild,
        desc: oldGuild.name
      }, {
        name: this.client.language.titles.logs.audit.new_guild,
        desc: newGuild.name
      }], this.client.user, "GUILD_UPDATE");
    }
    if(oldGuild.ownerId != newGuild.ownerId) {
      this.client.utils.logs(this.client, oldGuild, this.client.language.titles.logs.guild_update, [{
        name: this.client.language.titles.logs.audit.old_owner,
        desc: oldGuild.ownerId
      }, {
        name: this.client.language.titles.logs.audit.new_owner,
        desc: newGuild.ownerId
      }], this.client.user, "GUILD_UPDATE");
    }
	} 
};