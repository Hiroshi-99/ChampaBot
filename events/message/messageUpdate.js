const Event = require("../../structures/Events");

module.exports = class MessageUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldMessage, newMessage) {
    if(!oldMessage || !newMessage) return;
    if(!oldMessage.guild || !newMessage.guild) return;
    if(oldMessage.partial) await oldMessage.fetch();
	  if(newMessage.member?.user?.bot) return;
    if(!oldMessage.member) return;

    if(!oldMessage) return;
	  
    let oldContent = oldMessage.content || "", newContent = newMessage.content || "";
    if (oldContent.length > 1024) {
      oldContent = oldContent.slice(0, 896) + '...';
    }
    if (newContent.length > 1024) {
      newContent = newContent.slice(0, 896) + '...';
    }

    if(oldContent == newContent) return;

    this.client.utils.logs(this.client, oldMessage.guild, this.client.language.titles.logs.message_update, [{
      name: this.client.language.titles.logs.audit.channel_name,
      desc: `#${oldMessage.channel.name}`
    }, {
      name: this.client.language.titles.logs.audit.old_content,
      desc: oldContent
    }, {
      name: this.client.language.titles.logs.audit.new_content,
      desc: newContent
    }], oldMessage.member?.user, "MESSAGE_UPDATE");
	} 
};