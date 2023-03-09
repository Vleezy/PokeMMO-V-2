import Friend from "../models/friends.js";
import Message from "../models/message.js";
import GeneralMessage from "../models/GeneralMessage.js";

export default async function friendsAndMessagesSocket(data) {
  const { io, socket } = data;

  socket.on("userConnected", async (userId) => {
    try {
      const friends = await Friend.find({ userId }).populate("friendId");

      friends.forEach((friend) => {
        if (friend.isOnline) {
          io.to(friend.friendId._id.toString()).emit("friendOnline", {
            userId,
          });
        }
      });

      await Friend.updateMany(
        { userId },
        { $set: { isOnline: true } },
        { multi: true }
      );

      console.log(`Utilisateur connecté : ${userId}`);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("userDisconnected", async (userId) => {
    try {
      const friends = await Friend.find({ userId }).populate("friendId");

      friends.forEach((friend) => {
        if (friend.isOnline) {
          io.to(friend.friendId._id.toString()).emit("friendOffline", {
            userId,
          });
        }
      });

      await Friend.updateMany(
        { userId },
        { $set: { isOnline: false } },
        { multi: true }
      );

      console.log(`Utilisateur déconnecté : ${userId}`);
    } catch (error) {
      console.log(error);
    }
  });

  // Écoute des messages dans le chat général
  socket.on("generalChatMessage", async ({ from, message }) => {
    try {
      const newMessage = new GeneralMessage({
        sender: from,
        message,
        createdAt: new Date(Date.now() + 3600 * 1000),
      });
      await newMessage.save();

      console.log(`Message reçu de ${from} : ${message}`);
      io.emit("generalChatMessageReceived", { from, message });
    } catch (error) {
      console.log(error);
    }
  });

  // Récupération des derniers messages du chat général lorsqu'un utilisateur se connecte
  try {
    const messages = await GeneralMessage.find()
      .sort({ createdAt: "desc" }) // Trier les messages par date de création (du plus récent au plus ancien) pour afficher les 10 derniers messages
      .limit(9);

    const formattedMessages = messages.map((message) => ({
      from: message.sender,
      message: message.message,
      createdAt: message.createdAt,
    }));

    formattedMessages.push({
      from: "System",
      message:
        "Pour vous déplacer normalement, utilisez les touches Z, Q, S et D.",
      createdAt: new Date(Date.now() + 3600 * 1000),
    });

    formattedMessages.push({
      from: "System",
      message:
        "[Nouveau] Vous pouvez désormais vous déplacer en sprintant en restant appuyé sur la touche SHIFT, et en vélo en appuyant sur la touche R.",
      createdAt: new Date(Date.now() + 3600 * 1000),
    });

    io.emit("generalChatHistory", formattedMessages);
  } catch (error) {
    console.log(error);
  }

  socket.on("getMessages", async ({ from, to }) => {
    try {
      const messages = await Message.find({
        $or: [
          { from: from, to: to },
          { from: to, to: from },
        ],
      });

      const formattedMessages = messages.map((message) => ({
        from: message.from,
        text: message.text,
        createdAt: message.createdAt,
      }));

      socket.to(from).emit("messagesReceived", formattedMessages);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("sendMessage", async ({ from, to, text }) => {
    try {
      const message = new Message({ from, to, text });
      await message.save();

      socket.to(to).emit("messageReceived", {
        from,
        text,
        createdAt: message.createdAt,
      });

      console.log(`Message envoyé de ${from} à ${to} : ${text}`);
    } catch (error) {
      console.log(error);
    }
  });

  // Déconnexion d'un utilisateur
  socket.on("disconnect", async () => {
    console.log(`io déconnecté : ${socket.id}`);

    try {
      const friend = await Friend.findOne({ "friendId._id": socket.id });

      if (friend) {
        const userId = friend.userId;
        const isOnline = false;

        await Friend.findOneAndUpdate(
          { userId, "friendId._id": socket.id },
          { $set: { isOnline } },
          { new: true }
        );

        socket.to(userId).emit("friendOffline", {
          userId: friend.friendId._id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
}
