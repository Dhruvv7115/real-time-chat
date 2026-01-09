import { Loader2, MessageCircle } from "lucide-react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useRef, useState } from "react";

function App() {
	const navigate = useNavigate();
	const [room, setRoom] = useState("");
	const nameRef = useRef<HTMLInputElement>(null);

	const createRoom = () => {
		if (!nameRef.current?.value)
			return toast.error("Please enter your name", {
				style: {
					borderRadius: "10px",
					background: "#333",
					color: "#fff",
				},
			});

		localStorage.setItem("name", nameRef.current.value);
		const roomCode = Math.floor(
			Math.random() * (999999 - 100000 + 1) + 100000,
		).toString();
		console.log(roomCode);
		toast("Creating a room...", {
			icon: <Loader2 className="animate-spin" />,
			style: {
				borderRadius: "10px",
				background: "#333",
				color: "#fff",
			},
		});
		setTimeout(() => {
			navigate(`/room/${roomCode}`);
		}, 1500);
		return roomCode;
	};

	const joinRoom = (room: string) => {
		if (!nameRef.current?.value)
			return toast.error("Please enter your name", {
				style: {
					borderRadius: "10px",
					background: "#333",
					color: "#fff",
				},
			});

		localStorage.setItem("name", nameRef.current.value);
		navigate(`/room/${room}`);
	};

	return (
		<main className="flex items-center justify-center h-screen bg-neutral-800 flex-col gap-8">
			<Toaster />
			<div className="flex flex-col gap-8 p-8 border border-neutral-500 shadow-xl max-w-3xl w-full">
				<div className="flex items-center gap-2 justify-start text-white text-3xl">
					<MessageCircle size={32} />
					<h1 className="font-bold">Real Time Chat</h1>
				</div>
				<div className="flex items-center gap-4 justify-center flex-col">
					<input
						type="text"
						className="bg-neutral-900 text-white font-semibold px-4 py-2 cursor-pointer hover:bg-neutral-800 transition-colors duration-200 outline-1 outline-neutral-500 focus:ring-2 focus:ring-neutral-500 w-full"
						placeholder="Enter Your Name..."
						ref={nameRef}
						minLength={3}
						required
					/>
					<button
						className="bg-neutral-300 text-black font-semibold px-32 py-2 cursor-pointer hover:bg-neutral-400 transition-colors duration-200 w-full"
						onClick={createRoom}
					>
						Create Room
					</button>
					<div className="w-full flex justify-center items-center gap-4">
						<input
							type="text"
							className="bg-neutral-900 text-white font-semibold px-4 py-2 cursor-pointer hover:bg-neutral-800 transition-colors duration-200 outline-1 outline-neutral-500 focus:ring-2 focus:ring-neutral-500 w-full"
							placeholder="Enter Room Code"
							value={room}
							onChange={(e) => setRoom(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									if (!nameRef.current?.value)
										return toast.error("Please enter your name", {
											style: {
												borderRadius: "10px",
												background: "#333",
												color: "#fff",
											},
										});
									joinRoom(room);
								}
							}}
							minLength={6}
						/>
						<button
							className="bg-neutral-300 text-black font-semibold px-4 py-2 cursor-pointer hover:bg-neutral-400 transition-colors duration-200 text-nowrap"
							onClick={() => joinRoom(room)}
						>
							Join Room
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}

export default App;
