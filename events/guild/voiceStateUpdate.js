const { ChannelType } = require("discord.js");
const Event = require("../../structures/Events");

module.exports = class VoiceStateUpdate extends Event {
  constructor(...args) {
    super(...args);
  }

  async run(oldState, newState) {
    let mkChannel = this.client.utils.findChannel(oldState.member.guild, this.client.config.channels.temporary.voice);
    if(!mkChannel) return;
    let tempChannel = await this.client.database.guildData().get(`${this.client.config.general.guild}.temporaryChannels`) || [];
    let findTempCh = tempChannel.find((c) => c == oldState.channelId);

    if (!oldState.channelId && newState.channelId) {
      if(newState.channelId != mkChannel.id) return;
      await createTemporaryVC(this.client, newState);
    }
    if (oldState.channelId && !newState.channelId) {
      if (findTempCh) {
        let vc = oldState.guild.channels.cache.get(findTempCh);
        if (vc.members.size < 1) {
          await this.client.database.guildData().pull(`${this.client.config.general.guild}.temporaryChannels`, findTempCh);
          return vc.delete(); 
        }
      }
    }
    if (oldState.channelId && newState.channelId) {
      if (oldState.channelId !== newState.channelId) {
        if(newState.channelId == mkChannel.id) 
          await createTemporaryVC(this.client, oldState);
        if (findTempCh) {
          let vc = oldState.guild.channels.cache.get(findTempCh);
          if (vc.members.size < 1) {
            await this.client.database.guildData().pull(`${this.client.config.general.guild}.temporaryChannels`, findTempCh);
            return vc.delete(); 
          }
        }
      }
    }
  }
};

async function createTemporaryVC(client, user) {
  let category = client.utils.findChannel(user.guild, client.config.channels.temporary.category);
  await user.guild.channels.create({
    name: client.language.temporary.temp_name.replace("<user>", user.member.user.username),
    type: ChannelType.GuildVoice,
    parent: category,
    userLimit: client.config.channels.temporary.limit,
  }).then(async(vc) => {
    user.setChannel(vc);
    await client.database.guildData().push(`${client.config.general.guild}.temporaryChannels`, vc.id);
    await vc.permissionOverwrites.set([
      {
        id: user.id,
        allow: ["ManageChannels", "ManageRoles"],
        deny: ["MentionEveryone"]
      },
      {
        id: user.guild.id,
        allow: ["Speak", "Connect"],
        deny: ["MentionEveryone"]
      },
    ]);
  })
}