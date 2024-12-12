const Event = require("../../structures/Events");
const { AuditLogEvent } = require("discord.js");

module.exports = class RoleUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldRole, newRole) {
	  if(!oldRole.guild.members.me.permissions.has("ManageGuild")) return;
   	const fetchedLogs = await oldRole.guild.fetchAuditLogs({
    	limit: 1,
    	type: AuditLogEvent.RoleUpdate,
    });
    	
    const log = fetchedLogs.entries.first();
    
    if (!log) return;
    	
    const { executor, target } = log;

    if(oldRole.name !== newRole.name) {
      this.client.utils.logs(this.client, oldRole.guild, this.client.language.titles.logs.role_update, [{
        name: this.client.language.titles.logs.fields.user,
        desc: executor.username
      }, {
        name: this.client.language.titles.logs.audit.old_role,
        desc: oldRole.name
      }, {
        name: this.client.language.titles.logs.audit.new_role,
        desc: newRole.name
      }, {
        name: this.client.language.titles.logs.audit.role_id,
        desc: newRole.id
      }], executor, "ROLE_UPDATE");
    }
    
    if (oldRole.hexColor !== newRole.hexColor && oldRole.name === newRole.name) {
      let newColor, oldColor;
      if(oldRole.hexColor === '#000000') oldColor = '`Default`';  
      else oldColor = oldRole.hexColor;

      if(newRole.hexColor === '#000000') newColor = '`Default`';  
      else newColor = newRole.hexColor;  

      this.client.utils.logs(this.client, oldRole.guild, this.client.language.titles.logs.role_update, [{
        name: this.client.language.titles.logs.fields.user,
        desc: executor.username
      }, {
        name: this.client.language.titles.logs.audit.old_color,
        desc: oldColor
      }, {
        name: this.client.language.titles.logs.audit.new_color,
        desc: newColor
      }, {
        name: this.client.language.titles.logs.audit.role_id,
        desc: newRole.id
      }], executor, "ROLE_UPDATE");
    } 
  }
};