import { Hono } from "hono";
import { getConnInfo } from "hono/bun";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { type AuthEnv } from "@/lib/auth";
import "zod-openapi/extend";

export const todo = new Hono<{ Variables: AuthEnv }>().basePath("/todo");

const todoSchema = z.object({
	id: z.string().uuid().optional().openapi({ example: Bun.randomUUIDv7() }),
	status: z.enum(["pending", "done"]).default("pending").optional(),
	task: z.string().openapi({ example: "Going to the Gym" }),
	userId: z.string().cuid2().optional(),
});

type Todo = z.infer<typeof todoSchema>;

let todoBox: Todo[] = [];

todo.get(
	"/",
	describeRoute({
		description: "Say hello to the user",
		responses: {
			200: {
				description: "Successful greeting response",
				content: {
					"application/json": {
						schema: resolver(z.array(todoSchema)),
					},
				},
			},
		},
	}),
	(c) => {
		console.log("env", getConnInfo(c));
		return c.json(todoBox);
	},
);

todo.post(
	"/",
	describeRoute({
		description: "Create Todo",
		responses: {
			201: {
				description: "Successful",
				content: {
					"application/json": {
						schema: resolver(z.object({ message: z.string() })),
					},
				},
			},
		},
	}),
	zValidator("json", todoSchema),
	async (c) => {
		const user = c.get("user");
		const { task } = c.req.valid("json");
		todoBox = [
			...todoBox,
			{
				task,
				status: "pending",
				id: Bun.randomUUIDv7(),
				userId: user?.id,
			},
		];
		return c.json({ message: "todo added" }, 201);
	},
);
