import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { User } from "lucide-react";
import { useParams } from "react-router-dom";
interface Message {
	type: "alert" | "chat";
	message: string;
	sender: string;
}

export default function Room() {
	const roomCode = useParams().roomCode;
	const user = localStorage.getItem("name");
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const [isTyping, setIsTyping] = useState(false);
	const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

	const [messages, setMessages] = useState<Message[]>([
		{ type: "chat", message: "Welcome to the room!", sender: "server" },
	]);
	const messageRef = useRef<HTMLInputElement>(null);
	const messageEndRef = useRef<HTMLDivElement>(null);
	const wssRef = useRef<WebSocket | null>(null);
	useEffect(() => {
		toast.success("Joined room : " + roomCode + " successfully!");
		const wss = new WebSocket(import.meta.env.WS_BACKEND!);
		wssRef.current = wss;
		wss.onopen = () => {
			wss.send(
				JSON.stringify({
					room: roomCode,
					type: "join",
					sender: user || "anonymous",
				}),
			);
		};
		wss.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "USER_TYPING") {
				setTypingUsers((prev) => ({
					...prev,
					[data.user]: data.isTyping,
				}));
				return;
			}
			setMessages((messages) => [...messages, JSON.parse(event.data)]);
			console.log([...messages, JSON.parse(event.data)]);
		};
		return () => {
			wss.close();
		};
	}, []);
	const sendTypingStatus = (isTyping: boolean) => {
		if (wssRef.current && wssRef.current.readyState === WebSocket.OPEN) {
			wssRef.current.send(
				JSON.stringify({
					type: "TYPING_STATUS",
					user: user || "Anonymous", // Replace with dynamic user info
					isTyping: isTyping,
				}),
			);
		}
	};
	const handleKeyDown = () => {
		// Start typing
		if (!typingTimeoutRef.current) {
			sendTypingStatus(true);
		}

		// Clear previous timeout and set a new one
		clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => {
			sendTypingStatus(false);
			typingTimeoutRef.current = undefined;
		}, 1500);
	};
	const scrollToBottom = () => {
		const messagesContainer = messageEndRef.current;
		if (messagesContainer) {
			messagesContainer.scrollIntoView({ behavior: "smooth" });
		}
	};
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessage = () => {
		let input = messageRef?.current;
		if (!input || !input.value.trim()) return; // handles undefined and empty
		wssRef.current?.send(
			JSON.stringify({
				type: "chat",
				message: input.value,
				sender: user || "anonymous",
			}),
		);
		const newMessage: Message = {
			type: "chat",
			message: input.value,
			sender: user || "anonymous",
		};

		setMessages((messages) => [...messages, newMessage]);
		input.value = "";
	};
	const usersTypingList = Object.keys(typingUsers).filter(
		(user) => typingUsers[user],
	);
	const typingStatusMessage =
		usersTypingList.length === 1
			? `${usersTypingList[0]} is typing ` // if only one user is typing
			: usersTypingList.length > 1
			? `${usersTypingList.join(" and ")} are typing `
			: "";

	console.log(typingStatusMessage + "A");
	console.log(typingStatusMessage.trim() + "B");
	if (!roomCode || roomCode.length !== 6) {
		return (
			<div className="bg-neutral-700 flex h-screen justify-center items-center text-white">
				<h1 className="text-4xl font-bold">Room not found!</h1>
			</div>
		);
	}
	return (
		<div className="flex justify-center items-center w-full h-screen bg-neutral-800 text-white">
			<div className="flex flex-col justify-between items-center h-screen max-w-4xl w-full p-4 border gap-2">
				<h1 className="text-center font-medium">
					Room Code: <span className="font-semibold">{roomCode}</span>
				</h1>
				<div className="flex-1 border w-full p-2 flex flex-col gap-2 overflow-y-auto">
					{messages.map((m) =>
						m.type === "alert" ? (
							<div className="flex items-center justify-center my-2">
								<span className="rounded-full bg-neutral-700 px-2 py-1">
									{m.message}
								</span>
							</div>
						) : m.type === "chat" && m.sender !== user ? (
							<div className="flex items-start justify-start gap-2">
								<div className="rounded-full border w-10 h-10 border-neutral-500 order-1 flex justify-center items-center">
									{m.sender?.charAt(0).toUpperCase() || <User size={24} />}
								</div>
								<div
									key={m.sender + m.message + m.type}
									className="border border-neutral-500 rounded-xl px-4 py-2 w-auto order-2 overflow-hidden max-w-xl"
								>
									{m.message}
								</div>
							</div>
						) : (
							<div className="flex items-center justify-end gap-2">
								<div
									key={m.sender + m.message + m.type}
									className="border border-neutral-500 rounded-xl px-4 py-2 w-auto overflow-hidden text-left max-w-xl"
								>
									{m.message}
								</div>
								<div className="rounded-full border w-10 h-10 border-neutral-500 flex justify-center items-center">
									{m.sender?.charAt(0).toUpperCase() || <User size={24} />}
								</div>
							</div>
						),
					)}
					{typingStatusMessage && (
						<div className="typing-indicator flex items-center justify-center gap-0.5 my-2">
							<span className="mr-1">{typingStatusMessage}</span>
							<span className="animate-bounce1">&bull;</span>
							<span className="animate-bounce2">&bull;</span>
							<span className="animate-bounce3">&bull;</span>
						</div>
					)}
					<div ref={messageEndRef} />
				</div>
				<div className="flex justify-center items-center w-full gap-4">
					<input
						type="text"
						className="border px-4 py-2 flex-1 outline-0"
						placeholder="Enter a message..."
						ref={messageRef}
						onChange={(e) => {
							messageRef.current = e.target;
							setIsTyping(true);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								sendMessage();
								return;
							}
							handleKeyDown();
						}}
						onBlur={() => {
							sendTypingStatus(false); // ← ADD THIS
							setIsTyping(false);
						}}
						autoFocus
					/>
					<button
						className="border px-4 py-2"
						onClick={() => sendMessage()}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
