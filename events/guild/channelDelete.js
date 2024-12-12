const { AuditLogEvent } = require("discord.js");
const Event = require("../../structures/Events");

module.exports = class ChannelDelete extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(channel) {
    if(!channel.guild.members.me.permissions.has("ManageChannels")) return;
    const ticketData = await this.client.database.ticketsData().get(channel.id);
    if(ticketData) {
      let memberTickets = await this.client.database.ticketsData().get(`${ticketData?.owner}.tickets`) || [];

      memberTickets = memberTickets.filter((x) => x.channel != channel.id);
      await this.client.database.ticketsData().set(`${ticketData?.owner}.tickets`, memberTickets)
      await this.client.database.ticketsData().delete(channel.id);
    }

	  if(!channel.guild.members.me.permissions.has("ManageGuild")) return;
    if(!channel.guild) return;
    
		let dataRemove = await this.client.database.guildData().get(`${this.client.config.general.guild}.temporaryChannels`) || [];
    if(dataRemove.find((x) => x == channel.id)) {
      dataRemove = dataRemove.filter((x) => x != channel.id);
      await this.client.database.guildData().set(`${this.client.config.general.guild}.temporaryChannels`, dataRemove);
    }

		const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
     	type: AuditLogEvent.ChannelDelete,
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    let channelType = "Text";
    if(channel.type == 2) channelType = "Voice";
    else if(channel.type == 4) channelType = "Category";
    else if(channel.type == 13) channelType = "Stage";
    else if(channel.type == 15) channelType = "Forum";

    this.client.utils.logs(this.client, channel.guild, this.client.language.titles.logs.channel_delete, [{
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
    }], executor, "CHANNEL_DELETE");
	} 
};
