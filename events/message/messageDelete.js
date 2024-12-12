const Event = require("../../structures/Events");
const { ChannelType } = require("discord.js");

module.exports = class MessageDelete extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(message) {
	  if (message.channel.type == ChannelType.DM) return;
    if (!message.author) return;
	  if (message.author.bot) return;
    if (message.partial) await message.fetch();
    
    let guild = this.client.guilds.cache.get(message.guildId);
	  
    let content = message.content;
    if (content.length > 1024) {
      content = content.slice(0, 896) + '...';
    }
    
    let attachments = '';
    if (message.attachments.size > 0) {
      for (const attachment of message.attachments) {
        attachments += '\n' + attachment[1].url + '\n';
      }
    }
    
    this.client.utils.logs(this.client, guild, this.client.language.titles.logs.message_delete, [{
      name: this.client.language.titles.logs.fields.user,
      desc: `${message.author.username}`
    }, {
      name: this.client.language.titles.logs.audit.channel_name,
      desc: `#${message.channel.name}`
    }, {
      name: this.client.language.titles.logs.audit.msg_content,
      desc: (message.content.length > 0 ? content : 'N/A') + (message.attachments.size > 0 ? attachments : '')
    }], message.author, "MESSAGE_DELETE");
	} 
};