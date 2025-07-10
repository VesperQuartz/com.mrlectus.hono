import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: text("id").primaryKey(),
  task: text("task"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
