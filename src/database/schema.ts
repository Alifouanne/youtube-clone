import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]
);
export const userRelations = relations(usersTable, ({ many }) => ({
  videos: many(videoTable),
}));

export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)]
);
export const categoryRelations = relations(categoriesTable, ({ many }) => ({
  videos: many(videoTable),
}));
export const VideoVisibility = pgEnum("video_visibility", [
  "public",
  "private",
]);
export const videoTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").default(""),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxPlaybackId: text("mux_playback_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackState: text("mux_track_state"),
  thumbnailUrl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  // videoUrl:text('video_url').notNull(),

  duration: integer("duration").default(0).notNull(), //seconds
  visibility: VideoVisibility("visibility").default("private").notNull(), //public, private
  //relations
  uploaderId: uuid("uploader_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),

  //metadata
  // viewsCount:integer('views_count').default(0),
  // likesCount:integer('likes_count').default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const videoRelations = relations(videoTable, ({ one }) => ({
  uploader: one(usersTable, {
    fields: [videoTable.uploaderId],
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [videoTable.categoryId],
    references: [categoriesTable.id],
  }),
}));

export const videoInsertSchema = createInsertSchema(videoTable);
export const videoUpdateSchema = createUpdateSchema(videoTable);
export const videoSelectSchema = createSelectSchema(videoTable);
