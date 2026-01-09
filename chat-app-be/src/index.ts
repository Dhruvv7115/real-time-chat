import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 5500 });

interface User {
	room: string;
	socket: WebSocket;
	user?: string;
}

const allSockets: User[] = [];

wss.on("connection", (socket: WebSocket) => {
	console.log("Connected to server!");

	socket.on("message", (message) => {
		console.log(typeof message);
		const parsedMessage = JSON.parse(message.toString());
		if (parsedMessage.type === "join") {
			allSockets.push({
				room: parsedMessage.room,
				socket,
				user: parsedMessage?.sender || "anonymous",
			});
			socket.send(
				JSON.stringify({
					type: "alert",
					message: "Joined Room: " + parsedMessage.room + " successfully!",
					sender: "server",
				}),
			);
			const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;
			allSockets.forEach((s) => {
				if (s.room === currentUserRoom && s.socket !== socket) {
					s.socket.send(
						JSON.stringify({
							type: "alert",
							message:
								parsedMessage?.sender + " has joined the room!" ||
								"Anonymous User" + " has joined the room!",
							sender: "server",
						}),
					);
				}
			});
			console.log("Joined room : " + parsedMessage.room + " successfully!");
		}
		if (parsedMessage.type === "chat") {
			const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;
			if (currentUserRoom) {
				allSockets.forEach((s) => {
					if (s.room === currentUserRoom && s.socket !== socket) {
						s.socket.send(
							JSON.stringify({
								type: "chat",
								message: parsedMessage.message,
								sender: parsedMessage.sender,
							}),
						);
					}
				});
			}
		}
		if (parsedMessage.type === "TYPING_STATUS") {
			const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;
			// Broadcast to all other clients
			allSockets.forEach((s) => {
				if (
					s.room === currentUserRoom &&
					s.socket !== socket &&
					s.socket.readyState === WebSocket.OPEN
				) {
					s.socket.send(
						JSON.stringify({
							type: "USER_TYPING",
							user: parsedMessage.user,
							isTyping: parsedMessage.isTyping,
						}),
					);
				}
			});
		}
	});
});
