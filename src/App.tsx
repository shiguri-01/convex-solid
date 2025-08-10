import { faker } from "@faker-js/faker";
import {
	type Component,
	createEffect,
	createSignal,
	Index,
	on,
} from "solid-js";
import { api } from "../convex/_generated/api";
import { createMutation, createQuery } from "./lib/convex";

// デモのために、適当な名前をセッションストレージに保存
const NAME = getOrSetFakeName();

const App: Component = () => {
	const messages = createQuery(api.chat.getMessages);
	const sendMessage = createMutation(api.chat.sendMessage);

	const [newMessageText, setNewMessageText] = createSignal("");

	createEffect(
		on(
			() => messages(),
			() => {
				setTimeout(() => {
					window.scrollTo({
						top: document.body.scrollHeight,
						behavior: "smooth",
					});
				}, 0);
			},
		),
	);

	return (
		<main class="chat">
			<header>
				<h1>Convex Chat</h1>
				<p>
					Connected as <strong>{NAME}</strong>
				</p>
			</header>
			<Index each={messages()}>
				{(message) => (
					<article class={message().user === NAME ? "message-mine" : ""}>
						<div>{message().user}</div>

						<p>{message().body}</p>
					</article>
				)}
			</Index>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					await sendMessage({ user: NAME, body: newMessageText() });
					setNewMessageText("");
				}}
			>
				<input
					type="text"
					value={newMessageText()}
					onChange={async (e) => {
						{
							const text = e.currentTarget.value;
							setNewMessageText(text);
							console.log(newMessageText());
						}
					}}
					placeholder="Write a message..."
					autofocus
				/>
				<button type="submit" disabled={!newMessageText()}>
					Send
				</button>
			</form>
		</main>
	);
};

export default App;

function getOrSetFakeName() {
	const NAME_KEY = "tutorial_name";
	const name = sessionStorage.getItem(NAME_KEY);
	if (!name) {
		const newName = faker.person.firstName();
		sessionStorage.setItem(NAME_KEY, newName);
		return newName;
	}
	return name;
}
