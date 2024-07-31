import express from "express";
import path from "path";
import { config } from "../config";
import { Client } from "discord.js-selfbot-v13";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

let server = express();
let client = new Client();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/", async (req, res) => {
  try {
    let friends = client.users.cache
      .filter((user) => !user.bot)
      .map((user) => ({
        id: user.id,
        username: user.username,
      }));

    return res.render("index.ejs", { friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching friends list" });
  }
});

server.get("/:id", async (req, res) => {
  let { id } = req.params;

  try {
    let user = await client.users.fetch(id);

    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    let avatarUrl = user.displayAvatarURL({ format: "png", dynamic: true });
    let dmChannel = await user.createDM();
    let messages = await dmChannel.messages.fetch({ limit: 100 });
    let latestMessage = messages
      .filter((msg) => msg.author.id === user.id)
      .first();

    let latestTimestamp = latestMessage ? latestMessage.createdAt : null;
    let lastResponseTime = latestTimestamp
      ? dayjs(latestTimestamp).fromNow()
      : "No messages found";

    let data = {
      userName: user.username,
      userId: user.id,
      lastResponseTime,
      avatarUrl,
      lastResponse: latestMessage ? latestMessage.content : "No messages found",
    };

    return res.render("user.ejs", data);
  } catch (error) {
    console.error("Error fetching user details or messages:", error);
    res.status(500).json({ error: true, message: "Error fetching user data" });
  }
});

server.listen(3000, () => {
  console.log("Web is running on port 3000");
});

client.on("ready", (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.userToken);
