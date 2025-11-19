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
  varchar,
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
  videoReactions: many(videoReactionTable), // user can have many video reactions (like/dislike)
  subscriptionsAsSubscriber: many(subscriptionTable, {
    relationName: "subscriber",
  }),
  subscriptionsAsChannel: many(subscriptionTable, { relationName: "channel" }),
  comments: many(commentsTable),
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
  reactions: many(videoReactionTable), // a video can have many reactions (like/dislike)
  comments: many(commentsTable),
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

// ==============================
// Reaction TABLE AND RELATIONS
// ==============================
export const reactionTypeEnum = pgEnum("reaction_type", ["like", "dislike"]); // Enum for "like" and "dislike" reaction types

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

// Defines the relationships for video reactions: each reaction belongs to a user and a video
export const videoReactionsRelations = relations(
  videoReactionTable,
  ({ one }) => ({
    users: one(usersTable, {
      fields: [videoReactionTable.userId],
      references: [usersTable.id],
    }), // reaction belongs to a user
    videos: one(videoTable, {
      fields: [videoReactionTable.videoId],
      references: [videoTable.id],
    }), // reaction belongs to a video
  })
);
// ==============================
// Subscriptions TABLE AND RELATIONS
// ==============================

// Defines the subscriptions table schema.
// Each row means that subscriberId (a User) is following channelId (another User).
export const subscriptionTable = pgTable(
  "subscriptions",
  {
    // User who is subscribing
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // User who is being subscribed to (the channel/user)
    channelId: uuid("channel_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // Timestamp of when the subscription was created
    createdAt: timestamp("created_at").notNull().defaultNow(),
    // Timestamp of when the subscription was last updated
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // Composite primary key: ensures uniqueness of each (channelId, subscriberId) pair
    primaryKey({
      name: "subscription_pk",
      columns: [t.channelId, t.subscriberId],
    }),
  ]
);

// Defines the relationships for the subscriptions table:
// Each subscription row models a user (subscriber) following another user (channel).
export const subscriptionRelations = relations(
  subscriptionTable,
  ({ one }) => ({
    // The user who does the subscribing ("subscriber")
    subscriber: one(usersTable, {
      fields: [subscriptionTable.subscriberId], // Field on subscriptionTable that links to user
      references: [usersTable.id], // References the 'id' field in usersTable
      relationName: "subscriber", // Unique relation name for this direction
    }),
    // The user who is being subscribed to ("channel")
    channel: one(usersTable, {
      fields: [subscriptionTable.channelId], // Field on subscriptionTable that links to user (the "channel")
      references: [usersTable.id], // References the 'id' field in usersTable
      relationName: "channel", // Unique relation name for this direction
    }),
  })
);

// ==============================
// Comments TABLE AND RELATIONS
// ==============================

// Define the 'comments' table schema for storing comments on videos.
export const commentsTable = pgTable(
  "comments",
  {
    // Unique identifier for each comment (UUID, auto-generated if not provided)
    id: uuid("id").primaryKey().defaultRandom(),

    // The text content of the comment, limited to 1000 characters
    content: varchar("content", { length: 1000 }).notNull(),

    // The ID of the video that this comment belongs to (foreign key)
    videoId: uuid("video_id")
      .notNull()
      .references(() => videoTable.id, { onDelete: "cascade" }),

    // The ID of the user who wrote the comment (foreign key)
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Uncomment the following line to support nested comments (replies)
    // parentId: integer("parent_id"),

    // Timestamp for when the comment was created (auto-filled)
    createdAt: timestamp("created_at").notNull().defaultNow(),

    // Timestamp for when the comment was last updated (auto-filled)
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // Unique index on the videoId (for efficient lookups of comments for a video)
    uniqueIndex("comments_video_id_idx").on(t.videoId),

    // Foreign key reference for parent comments (for threaded replies), if needed
    // foreignKey({
    //   columns: [t.parentId],
    //   foreignColumns: [t.id],
    // }),
  ]
);

// Define relationships for the 'comments' table
export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  // Each comment belongs to one video
  video: one(videoTable, {
    fields: [commentsTable.videoId],
    references: [videoTable.id],
  }),
  // Each comment belongs to one user (the author)
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
  // parent: one(commentsTable, {
  //   fields: [commentsTable.parentId],
  //   references: [commentsTable.id],
  //   relationName: "parentComment", // parent Comment
  // }),
  // replies: many(commentsTable, { relationName: "parentComment" }), //child comment (reply)
  // reactions:
}));

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

// Schemas for insert, update, select operations on video reactions
export const videoReactionsInsertSchema =
  createInsertSchema(videoReactionTable); // Insert schema for video reactions
export const videoReactionsUpdateSchema =
  createUpdateSchema(videoReactionTable); // Update schema for video reactions
export const videoReactionsSelectSchema =
  createSelectSchema(videoReactionTable); // Select schema for video reactions

// Schemas for insert, update, select operations on subscriptions
export const subscriptionInsertSchema = createInsertSchema(subscriptionTable);
export const subscriptionUpdateSchema = createUpdateSchema(subscriptionTable);
export const subscriptionSelectSchema = createSelectSchema(subscriptionTable);

// Schemas for insert, update, select operations on comments
export const commentsInsertSchema = createInsertSchema(commentsTable);
export const commentsUpdateSchema = createUpdateSchema(commentsTable);
export const commentsSelectSchema = createSelectSchema(commentsTable);
