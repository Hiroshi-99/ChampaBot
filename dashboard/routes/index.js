const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const yaml = require("yaml");
const { authMiddleware } = require("../middlewares/auth.js");

const standardResponse = (err, html, res) => {
  if (err) {
    console.log(err);
    return res.status(500).render(`dashboard.ejs`, { page : '500', error: err }, (err, html) => standardResponse(null, html, res));
  } else {
    return res.status(200).send(html);
  }
}

router.get("/", async (req, res) => {
	const tokenCookie = req.cookies["token"];
  const decoded = await jwt.decode(tokenCookie);

  const user = req.client.users.cache.get(decoded);

	if(user) return res.redirect("/dashboard");
	await res.render("index", {
		bot: req.client,
		guild: req.client,
	})
});

router.get("/403", async(req, res) => {
	await res.render("403", {
		bot: req.client,
		guild: req.client
	})
});

router.get("/404", async(req, res) => {
	await res.render("404", {
		bot: req.client,
		guild: req.client
	})
});

router.get("/dashboard", authMiddleware, async(req, res) => {
	await res.render("dashboard", {
		bot: req.client,
		user: req.user,
		guild: req.guild,
	}, (err, html) => standardResponse(err, html, res));
});

router.get("/plugins", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.plugins.enabled == false)
		return res.redirect("/dashboard");

	const member = req.guild.members.cache.get(req.user.id);
	if(req.user.id != req.guild.ownerId && !req.client.config.server.dashboard.users.plugins.includes(member.id) && (req.client.config.roles.dashboard.plugins.length == 0 || !req.client.utils.hasRole(req.client, req.guild, member, req.client.config.roles.dashboard.plugins)))
		return res.redirect("/dashboard");

	await res.render("plugins", {
		bot: req.client,
		user: req.user,
		guild: req.guild,
	}, (err, html) => standardResponse(err, html, res));
});

router.get("/settings", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.settings.enabled == false)
		return res.redirect("/dashboard");

	const commandList = Object.keys(req.client.cmdConfig);
	await res.render("settings", {
		bot: req.client,
		user: req.user,
		guild: req.guild,
		commands: commandList.sort(),
	}, (err, html) => standardResponse(err, html, res));
});

router.patch("/settings/config/:option", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.settings.enabled == false)
		return res.redirect("/dashboard");

	const { option } = req.params;
	let { value, section, boolean } = JSON.parse(req.body.configData);
	const client = req.client;

	let path = `${section}.${option}`
	if(!section) path = `${option}`;

	await client.utils.dashboardLogs(client, {
    date: new Date().toLocaleString("en-GB"),
    author_id: req.user.id,
    author: req.user.username,
    user_id: null,
    user: null,
    channel_id: null,
    channel_name: null,
    option: `${path}`,
		value: null,
    message: `dash_edit_cfg`
  });

	if(typeof path.split(".").reduce((o, key) => o && o[key] ? o[key] : null, client.config) == "number")
		value = Number(value);

	let doc = yaml.parseDocument(fs.readFileSync('./configs/config.yml', 'utf8'));
	if(value) {
		if(path.split(".").reduce((o, key) => o && o[key] ? o[key] : null, client.config) == value)
			return res.status(200).json({ code: 444 });

		doc.setIn(`${path}`.split("."), value);
	} else if(!value && boolean == true) {
		doc.setIn(`${path}`.split("."), !path.split(".").reduce((o, key) => o && o[key] ? o[key] : null, client.config));
	} else {
		if(path.split(".").reduce((o, key) => o && o[key] ? o[key] : null, client.config) == "")
			return res.status(200).json({ code: 444 });

		doc.setIn(`${path}`.split("."), "");
	}

	const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true, singleQuote: false, defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN" })
		.replaceAll(/(\[ )/gm, "[")
		.replaceAll(/( ])$/gm, "]");

	fs.writeFileSync('./configs/config.yml', documentToString, 'utf-8');
	req.client.config = doc.toJSON();

	res.status(200).json({ code: 200 });
});

router.patch("/settings/commands/:name", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.settings.enabled == false)
		return res.redirect("/dashboard");

	const { name } = req.params;
	const client = req.client;

	await client.utils.dashboardLogs(client, {
    date: new Date().toLocaleString("en-GB"),
    author_id: req.user.id,
    author: req.user.username,
    user_id: null,
    user: null,
    channel_id: null,
    channel_name: null,
    option: `${name}`,
    value: client.cmdConfig[name].enabled ? "off" : "on",
    message: `dash_toggle_cmd`
  });

	let doc = yaml.parseDocument(fs.readFileSync('./configs/commands.yml', 'utf8'));
	doc.setIn(`${name}.enabled`.split("."), !client.cmdConfig[name].enabled);

	const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true })
		.replaceAll(/(\[ )/gm, "[")
		.replaceAll(/( ])$/gm, "]");
	
	fs.writeFileSync('./configs/commands.yml', documentToString, 'utf-8');
	req.client.cmdConfig = doc.toJSON();

	res.status(200).json({ code: 200 });
});

router.post("/settings/users/:option", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.settings.enabled == false)
		return res.redirect("/dashboard");

	const data = req.body;
	const { option } = req.params;
	const userId = Object.values(data)[0];
	const client = req.client;
	const user = client.users.cache.get(userId);

	if(!user)
		return res.status(404).redirect("/settings");

	let doc = yaml.parseDocument(fs.readFileSync('./configs/config.yml', 'utf8'));
	if(client.config.server.dashboard.users[option].includes(userId)) {
		doc.setIn(`server.dashboard.users.${option}`.split("."), client.config.server.dashboard.users[option].filter((v) => v != userId));
		await client.utils.dashboardLogs(client, {
      date: new Date().toLocaleString("en-GB"),
			author_id: req.user.id,
      author: `${req.user.username}`,
			user_id: user.id,
      user: user.username,
      channel_id: null,
      channel_name: null,
      ticketId: null,
      message: `dash_removed`
    });
	} else {
		doc.addIn(`server.dashboard.users.${option}`.split("."), userId);
		await client.utils.dashboardLogs(client, {
      date: new Date().toLocaleString("en-GB"),
			author_id: req.user.id,
      author: `${req.user.username}`,
			user_id: user.id,
      user: user.username,
      channel_id: null,
      channel_name: null,
      ticketId: null,
      message: `dash_added`
    });
	}

	const documentToString = doc.toString({ lineWidth: 100000, doubleQuotedAsJSON: true })
		.replaceAll(/(\[ )/gm, "[")
		.replaceAll(/( ])$/gm, "]");
	
	fs.writeFileSync('./configs/config.yml', documentToString, 'utf-8');
	req.client.config = doc.toJSON();

	res.status(200).redirect("/settings");
});

router.get("/logs", authMiddleware, async(req, res) => {
	if(req.client.config.server.dashboard.modules.logs == false)
		return res.redirect("/dashboard");

	await res.render("logs", {
		bot: req.client,
		user: req.user,
		guild: req.guild,
	}, (err, html) => standardResponse(err, html, res));
});

router.get("/profile", authMiddleware, async(req, res) => {
	await res.render("profile", {
		bot: req.client,
		user: req.user,
		guild: req.guild,
	}, (err, html) => standardResponse(err, html, res));
});

router.get("/logout", authMiddleware, async(req, res) => {
	const client = req.client;
	await client.utils.dashboardLogs(client, {
		date: new Date().toLocaleString("en-GB"),
		author_id: req.user.id,
		author: `${req.user.username}`,
		user_id: null,
		user: null,
		channel_id: null,
		channel_name: null,
		option: null,
		value: null,
		message: `dash_logout`
	});
	
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/callback", async(req, res) => {
  if (req.user) return res.redirect("/dashboard");
  
  const accessCode = req.query.code;
  if (!accessCode) return res.redirect("/");

  const client = req.client;

  const data = new FormData();
  data.append("client_id", client.config.server.dashboard.client_id);
  data.append("client_secret", client.config.server.dashboard.client_secret);
  data.append("grant_type", "authorization_code");
  data.append("redirect_uri", client.config.server.url + "/callback");
  data.append("scope", "identify guilds");
  data.append("code", accessCode);
  
  let response = await fetch("https://discordapp.com/api/oauth2/token", {
    method: "POST",
    body: data
  })

  const bearerTokens = await response.json();

  response = await fetch("https://discordapp.com/api/users/@me", {
    method: "GET",
    headers: { Authorization: `Bearer ${bearerTokens.access_token}` }
  });

  let json = await response.json();
	
  const member = req.guild.members.cache.get(json.id);
	if(!member)
		return res.redirect("/403");
	
	const dashboardAccess = client.config.server.dashboard.users.access || [];
	if(member.id != req.guild.ownerId && !client.config.roles.dashboard.access.some((r) => member.roles.cache.has(r)) && !dashboardAccess.includes(json.id))
    return res.redirect("/403");

  const token = await jwt.sign(`${json.id}`, client.config.server.dashboard.jwt);

  res.cookie("token", token, {
    expires: new Date(Date.now()+2.592e+8)
  });

  req.user = client.users.cache.get(json.id);

  await client.utils.dashboardLogs(client, {
		date: new Date().toLocaleString("en-GB"),
		author_id: json.id,
		author: `${json.username}`,
		user: null,
		user: null,
		channel_id: null,
		channel_name: null,
		option: null,
		value: null,
		message: `dash_login`
	});

  res.redirect("/dashboard");
});

module.exports = router;