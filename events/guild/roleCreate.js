const Event = require("../../structures/Events");
const { AuditLogEvent } = require("discord.js");

module.exports = class RoleCreate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(role) {
	  if(!role.guild.members.me.permissions.has("ManageGuild")) return;
   	const fetchedLogs = await role.guild.fetchAuditLogs({
    	limit: 1,
    	type: AuditLogEvent.RoleCreate,
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;
    
    this.client.utils.logs(this.client, role.guild, this.client.language.titles.logs.role_create, [{
      name: this.client.language.titles.logs.fields.user,
      desc: executor.username
    }, {
      name: this.client.language.titles.logs.audit.role_name,
      desc: role.name
    }, {
      name: this.client.language.titles.logs.audit.role_id,
      desc: role.id
    }], executor, "ROLE_CREATE");
	} 
};