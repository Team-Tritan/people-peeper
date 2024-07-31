import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Client } from "discord.js-selfbot-v13";
import express from "express";
import path from "path";
import { config } from "../config";

dayjs.extend(relativeTime);

const server = express();
const client = new Client();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/", async (req, res) => {
  try {
    const friends = client.users.cache
      .filter((user) => {
        if (user.bot) return false;
        if (user.id === client.user?.id) return false;
        return true;
      })
      .map((user) => ({
        id: user.id,
        username: user.username,
      }));

    return res.render("index", { friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return res
      .status(500)
      .json({ error: true, message: "Error fetching friends list" });
  }
});

server.get("/:id", async (req, res) => {
  const { id } = req.params;

  // obvious
  if (id === "favicon.ico") return;

  try {
    const user = await client.users.fetch(id);

    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    const avatarUrl = user.displayAvatarURL({ format: "png", dynamic: true });
    const dmChannel = await user.createDM();
    const messages = await dmChannel.messages.fetch({ limit: 100 });
    const latestMessage = messages
      .filter((msg) => msg.author.id === user.id)
      .first();

    const latestTimestamp = latestMessage ? latestMessage.createdAt : null;
    const lastResponseTime = latestTimestamp
      ? dayjs(latestTimestamp).fromNow()
      : "No messages found";

    const data = {
      userName: user.username,
      userId: user.id,
      lastResponseTime,
      avatarUrl,
      lastResponse: latestMessage ? latestMessage.content : "No messages found",
    };

    return res.render("user", data);
  } catch (error) {
    console.error("Error fetching user details or messages:", error);
    res.status(500).json({ error: true, message: "Error fetching user data" });
  }
});

client.on("ready", (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

await client.login(config.userToken);

server.listen(config.port, () => {
  console.log(`Web is running on port ${config.port}`);
});
