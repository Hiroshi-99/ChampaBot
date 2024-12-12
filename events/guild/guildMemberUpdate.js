const Event = require("../../structures/Events");

module.exports = class GuildMemberUpdate extends Event {
	constructor(...args) {
		super(...args);
	}

	async run(oldMember, newMember) {
	  if(!oldMember.guild.members.me.permissions.has("ManageGuild")) return;

    if(oldMember.nickname !== newMember.nickname) {
      let oldName, newName;
      if(oldMember.nickname === null) oldName = "N/A";
      else oldName = oldMember.nickname;

      if(newMember.nickname === null) newName = "N/A"; 
      else newName = newMember.nickname;

      this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
        name: this.client.language.titles.logs.fields.user,
        desc: oldMember.user.username
      }, {
        name: this.client.language.titles.logs.audit.old_nick,
        desc: oldName
      }, {
        name: this.client.language.titles.logs.audit.new_nick,
        desc: newName
      }, {
        name: this.client.language.titles.logs.fields.user_id,
        desc: newMember.id
      }], newMember.user, "GUILD_MEMBER_UPDATE");
    }
    if(oldMember.roles.cache.size < newMember.roles.cache.size) {
      var gainrole = newMember.roles.cache
        .map((r) => `${r}`)
        .filter((x) => !oldMember.roles.cache.map((r) => `${r}`).includes(x));
  
        this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
          name: this.client.language.titles.logs.fields.user,
          desc: oldMember.user.username
        }, {
          name: this.client.language.titles.logs.audit.role_added,
          desc: gainrole
        }], oldMember.user, "GUILD_MEMBER_UPDATE");
    }
    if(oldMember.roles.cache.size > newMember.roles.cache.size) {
      var lostrole = oldMember.roles.cache
        .map((r) => `${r}`)
        .filter((x) => !newMember.roles.cache.map((r) => `${r}`).includes(x));

        this.client.utils.logs(this.client, oldMember.guild, this.client.language.titles.logs.member_update, [{
          name: this.client.language.titles.logs.fields.user,
          desc: oldMember.user.username
        }, {
          name: this.client.language.titles.logs.audit.role_removed,
          desc: lostrole
        }], oldMember.user, "GUILD_MEMBER_UPDATE");
    }

    if(this.client.config.plugins.role_nicknames.enabled == true && (oldMember.roles.cache.size < newMember.roles.cache.size || oldMember.roles.cache.size > newMember.roles.cache.size)) {
      const listOfRoles = newMember.roles.cache.map((r) => r).sort((a, b) => b.rawPosition - a.rawPosition);
      const nicknameRoles = Object.keys(this.client.config.plugins.role_nicknames.list);
      const rolesCombine = listOfRoles.map((r) => {
        return nicknameRoles.includes(r.id) || nicknameRoles.includes(r.name) ? r : null;
      }).filter(Boolean);

      if(rolesCombine.length == 0 || nicknameRoles.length == 0)
        return;

      const findNickname = this.client.config.plugins.role_nicknames.list[nicknameRoles.find((nr) => nr == rolesCombine[0].id || nr == rolesCombine[0].id)]

      if(findNickname) {
        const changeToNickname = findNickname.replace("<username>", newMember.user.username);
        if(oldMember.nickname == changeToNickname)
          return;
        
        newMember.setNickname(changeToNickname);
      }
    }
	} 
};