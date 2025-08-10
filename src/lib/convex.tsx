import type { ConvexClient } from "convex/browser";
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server";
import {
	type Accessor,
	type Component,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	type ParentProps,
	useContext,
} from "solid-js";

const ConvexContext = createContext<ConvexClient>();

export const ConvexProvider: Component<
	ParentProps<{ client: ConvexClient }>
> = (props) => {
	return (
		<ConvexContext.Provider value={props.client}>
			{props.children}
		</ConvexContext.Provider>
	);
};

export function useConvex(): ConvexClient {
	const client = useContext(ConvexContext);
	if (!client) {
		throw new Error(
			"useConvex must be used within a <ConvexProvider> component.",
		);
	}
	return client;
}

type ArgsOrSkip<Query extends FunctionReference<"query">> =
	keyof FunctionArgs<Query> extends never
		? Record<string, never> | "skip"
		: FunctionArgs<Query> | "skip";

export function createQuery<Query extends FunctionReference<"query">>(
	query: Query,
	argsAccessor: Accessor<ArgsOrSkip<Query>> = () => ({}),
): Accessor<FunctionReturnType<Query> | undefined> {
	const client = useConvex();

	const [data, setData] = createSignal<FunctionReturnType<Query> | undefined>(
		undefined,
	);
	const [error, setError] = createSignal<Error | undefined>(undefined);

	createEffect(() => {
		const unsubscribe = client.onUpdate(
			query,
			argsAccessor(),
			(result) => {
				setData(result);
				setError(undefined);
			},
			(error) => {
				setError(error);
			},
		);

		onCleanup(() => {
			unsubscribe();
		});
	});

	return createMemo(() => {
		const err = error();
		if (err) {
			throw err;
		}

		return data();
	});
}

export function createMutation<Mutation extends FunctionReference<"mutation">>(
	mutation: Mutation,
) {
	const client = useConvex();

	return (
		args: FunctionArgs<Mutation>,
	): Promise<FunctionReturnType<Mutation>> => {
		return client.mutation(mutation, args);
	};
}

export function createAction<Action extends FunctionReference<"action">>(
	action: Action,
) {
	const client = useConvex();

	return (
		args: FunctionArgs<Action>,
	): Promise<FunctionReturnType<Action>> => {
		return client.action(action, args);
	};
}
