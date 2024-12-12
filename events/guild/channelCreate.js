const Event = require("../../structures/Events");
const { AuditLogEvent } = require("discord.js");

module.exports = class ChannelCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(channel) {
	  if(!channel.guild.members.me.permissions.has("ManageGuild")) return;
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
     	type: AuditLogEvent.ChannelCreate,
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    let channelType = "Text";
    if(channel.type == 2) channelType = "Voice";
    else if(channel.type == 4) channelType = "Category";
    else if(channel.type == 13) channelType = "Stage";
    else if(channel.type == 15) channelType = "Forum";

    this.client.utils.logs(this.client, channel.guild, this.client.language.titles.logs.channel_create, [{
      name: this.client.language.titles.logs.fields.user,
      desc: executor.username
    }, {
      name: this.client.language.titles.logs.audit.channel_name,
      desc: `#${channel.name}`
    }, {
      name: this.client.language.titles.logs.audit.channel_id,
      desc: channel.id
    }, {
      name: this.client.language.titles.logs.audit.channel_type,
      desc: channelType
    }], executor, "CHANNEL_CREATE");
	}
};
