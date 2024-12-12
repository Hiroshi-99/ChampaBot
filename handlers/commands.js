const fs = require('fs');
const categories = fs.readdirSync('./commands/');
const chalk = require("chalk");

module.exports.init = (client) => {
  try {
    console.log(chalk.green("[HANDLER] ") + "Loading Commands");
    categories.forEach(async (category) => {
      fs.readdir(`./commands/${category}/`, (err) => {
        if (err) return console.error(err);
        const init = async () => {
          const commands = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'));
          for (const file of commands) {
            const f = require(`../commands/${category}/${file}`);
            const command = new f(client);
            if(client.config.plugins.economy.enabled == false && command.category == "economy") continue;
            if(client.config.plugins.economy.shop.enabled == false && command.name == "shop") continue;
            if(client.config.plugins.tickets.enabled == false && command.category == "tickets") continue;
            if(command.enabled == false) continue;

            if(command.context == false) client.commands.set(command.name.toLowerCase(), command);

            if(command.slash == true || command.context == true) {
              if(command.context == true) delete command["description"];
              client.slashCommands.set(command.name.toLowerCase(), command);
              client.slashArray.push(command);
            }
            if (command.aliases && Array.isArray(command.aliases)) command.aliases.forEach(alias => client.aliases.set(alias, command.name));
          }
        };
        init();
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.set = (client, command) => {
  if(command.context == false) client.commands.set(command.name.toLowerCase(), command);
  if(command.slash == true || command.context == true) {
    if(command.context == true) delete command["description"];
    client.slashCommands.set(command.name.toLowerCase(), command);
    client.slashArray.push(command);
  }
}