// Importing necessary helpers from drizzle-orm and drizzle-zod
import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
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

// ==============================
// USERS TABLE AND RELATIONSHIPS
// ==============================

// Defines the users table schema
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(), // Unique ID for user (UUID)
    clerkId: text("clerk_id").notNull().unique(), // Clerk user ID (external auth)
    name: text("name").notNull(), // User's display name
    imageUrl: text("image_url").notNull(), // Profile image URL
    createdAt: timestamp("created_at").notNull().defaultNow(), // When user was created
    updatedAt: timestamp("updated_at").notNull().defaultNow(), // When user info was last updated
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)] // Unique index on clerkId
);

// Defines the relationships for users: one-to-many to their videos and video views
export const userRelations = relations(usersTable, ({ many }) => ({
  videos: many(videoTable), // User can have many videos
  videoViews: many(videoViewsTable), // User can have many video views
  videoReactions: many(videoReactionTable), // Add comment for new line: user can have many video reactions (like/dislike)
}));

// ==============================
// CATEGORIES TABLE AND RELATIONS
// ==============================

// Defines the categories table schema
export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(), // Unique category ID (UUID)
    name: text("name").notNull().unique(), // Name of the category
    description: text("description"), // Optional description
    createdAt: timestamp("created_at").notNull().defaultNow(), // When category was created
    updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last update timestamp
  },
  (t) => [uniqueIndex("name_idx").on(t.name)] // Unique index on name
);

// Defines the relationships for categories: one-to-many to videos
export const categoryRelations = relations(categoriesTable, ({ many }) => ({
  videos: many(videoTable), // Category can have multiple videos
}));

// ==============================
// ENUM FOR VIDEO VISIBILITY
// ==============================

// Defines possible visibility levels for videos
export const VideoVisibility = pgEnum("video_visibility", [
  "public",
  "private",
]);

// ==============================
// VIDEOS TABLE AND RELATIONS
// ==============================

// Defines the videos table schema
export const videoTable = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique video ID (UUID)
  title: text("title").notNull(), // Video title
  description: text("description").default(""), // Video description
  muxStatus: text("mux_status"), // Video encoding status from Mux
  muxAssetId: text("mux_asset_id").unique(), // Mux asset reference (unique)
  muxPlaybackId: text("mux_playback_id").unique(), // Mux playback reference (unique)
  muxUploadId: text("mux_upload_id").unique(), // Mux upload session (unique)
  muxTrackId: text("mux_track_id").unique(), // Mux track ID (unique)
  muxTrackState: text("mux_track_state"), // Mux track state info
  thumbnailUrl: text("thumbnail_url"), // Video thumbnail URL
  thumbnailKey: text("thumbnail_key"), // Storage key for thumbnail
  previewUrl: text("preview_url"), // Preview video URL
  previewKey: text("preview_key"), // Storage key for preview video
  // videoUrl:text('video_url').notNull(),                         // (optional) deprecated or pending

  duration: integer("duration").default(0).notNull(), // Duration of video in seconds
  visibility: VideoVisibility("visibility").default("private").notNull(), // public/private
  // -- Foreign Keys and Relations --
  uploaderId: uuid("uploader_id") // Reference to the user who uploaded
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),

  // -- Metadata: possible future columns --
  // viewsCount:integer('views_count').default(0),
  // likesCount:integer('likes_count').default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(), // Creation timestamp
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // Last update timestamp
});

// Defines relationships for videos: uploader, category, views, reactions
export const videoRelations = relations(videoTable, ({ one, many }) => ({
  uploader: one(usersTable, {
    fields: [videoTable.uploaderId], // Video's uploader (user)
    references: [usersTable.id],
  }),
  category: one(categoriesTable, {
    fields: [videoTable.categoryId], // Video's category
    references: [categoriesTable.id],
  }),
  views: many(videoViewsTable), // A video can have many views
  reactions: many(videoReactionTable), // Add comment for new line: a video can have many reactions (like/dislike)
}));

// ==============================
// VIDEO VIEWS TABLE AND RELATION
// ==============================

// Defines the video views table schema (who viewed what videos)
export const videoViewsTable = pgTable(
  "video-views",
  {
    videoId: uuid("video_id") // Video being viewed
      .notNull()
      .references(() => videoTable.id, { onDelete: "cascade" }),
    viewerId: uuid("viewer_id") // User who viewed the video
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(), // When the view occurred
    updatedAt: timestamp("updated").notNull().defaultNow(), // When the view was last updated
  },
  (t) => [
    primaryKey({
      name: "video_views_pk",
      columns: [t.videoId, t.viewerId], // Composite primary key (video + viewer)
    }),
  ]
);

// Defines relationships for video views: each is linked to both user and video
export const videoViewsRelations = relations(videoViewsTable, ({ one }) => ({
  users: one(usersTable, {
    fields: [videoViewsTable.viewerId], // The viewer/user for this view entry
    references: [usersTable.id],
  }),
  videos: one(videoTable, {
    fields: [videoViewsTable.videoId], // The video that was viewed
    references: [videoTable.id],
  }),
}));

export const reactionTypeEnum = pgEnum("reaction_type", ["like", "dislike"]); // Add comment for new line: Enum for "like" and "dislike" reaction types

export const videoReactionTable = pgTable(
  "video_reactions",
  {
    videoId: uuid("video_id")
      .notNull()
      .references(() => videoTable.id, { onDelete: "cascade" }), // Foreign key to video
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }), // Foreign key to user
    type: reactionTypeEnum("type").notNull(), // Reaction type must be "like" or "dislike"
    createdAt: timestamp("created_at").notNull().defaultNow(), // When reaction was created
    updatedAt: timestamp("updated_at").notNull().defaultNow(), // When reaction was last updated
  },
  (t) => [
    primaryKey({
      name: "video_reactions_pk",
      columns: [t.userId, t.videoId], // Composite primary key: user + video
    }),
  ]
);

export const videoReactionsRelations = relations(
  videoReactionTable,
  ({ one }) => ({
    users: one(usersTable, {
      fields: [videoReactionTable.userId],
      references: [usersTable.id],
    }), // Add comment for new line: reaction belongs to a user
    videos: one(videoTable, {
      fields: [videoReactionTable.videoId],
      references: [videoTable.id],
    }), // Add comment for new line: reaction belongs to a video
  })
);

// ==============================
// ZOD SCHEMAS FOR CRUD VALIDATION
// ==============================

// Schemas for insert, update, select operations on videos
export const videoInsertSchema = createInsertSchema(videoTable);
export const videoUpdateSchema = createUpdateSchema(videoTable);
export const videoSelectSchema = createSelectSchema(videoTable);

// Schemas for insert, update, select operations on video views
export const videoViewsInsertSchema = createInsertSchema(videoViewsTable);
export const videoViewsUpdateSchema = createUpdateSchema(videoViewsTable);
export const videoViewsSelectSchema = createSelectSchema(videoViewsTable);

export const videoReactionsInsertSchema =
  createInsertSchema(videoReactionTable); // Add comment for new line: Insert schema for video reactions
export const videoReactionsUpdateSchema =
  createUpdateSchema(videoReactionTable); // Add comment for new line: Update schema for video reactions
export const videoReactionsSelectSchema =
  createSelectSchema(videoReactionTable); // Add comment for new line: Select schema for video reactions
