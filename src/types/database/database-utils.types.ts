// Database Utility Types
// Helper types for database operations, queries, and transformations

import type {
  Loomer,
  Galaxy,
  Loom,
  Quick,
  Spark,
  Comet,
  Dev,
  Comment,
  ContentType,
  UserRole,
  GalaxyVisibility,
  ContentVisibility,
} from "./database.types";

// Generic Database Operation Types
export type DatabaseTable =
  | "loomers"
  | "galaxies"
  | "looms"
  | "quicks"
  | "sparks"
  | "comets"
  | "devs"
  | "comments"
  | "messages"
  | "connections"
  | "invitations"
  | "galaxy_memberships";

// Insert Types (omit auto-generated fields)
export type InsertLoomer = Omit<Loomer, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type InsertGalaxy = Omit<Galaxy, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type InsertLoom = Omit<
  Loom,
  "id" | "created_at" | "updated_at" | "views" | "word_count"
> & {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  views?: number;
  word_count?: number;
};

export type InsertQuick = Omit<Quick, "id" | "created_at"> & {
  id?: string;
  created_at?: Date;
};

export type InsertSpark = Omit<Spark, "id" | "created_at"> & {
  id?: string;
  created_at?: Date;
};

export type InsertComet = Omit<Comet, "id" | "created_at"> & {
  id?: string;
  created_at?: Date;
};

export type InsertDev = Omit<Dev, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type InsertComment = Omit<
  Comment,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
};

// Update Types (all fields optional except id)
export type UpdateLoomer = Partial<
  Omit<Loomer, "id" | "created_at" | "updated_at">
> & {
  id: string;
  updated_at?: Date;
};

export type UpdateGalaxy = Partial<
  Omit<Galaxy, "id" | "created_at" | "updated_at">
> & {
  id: string;
  updated_at?: Date;
};

export type UpdateLoom = Partial<
  Omit<Loom, "id" | "created_at" | "updated_at">
> & {
  id: string;
  updated_at?: Date;
};

export type UpdateDev = Partial<
  Omit<Dev, "id" | "created_at" | "updated_at">
> & {
  id: string;
  updated_at?: Date;
};

export type UpdateSpark = Partial<Omit<Spark, "id" | "created_at">> & {
  id: string;
};

export type UpdateComet = Partial<Omit<Comet, "id" | "created_at">> & {
  id: string;
};

export type UpdateQuick = Partial<Omit<Quick, "id" | "created_at">> & {
  id: string;
};

export type UpdateComment = Partial<
  Omit<Comment, "id" | "created_at" | "updated_at">
> & {
  id: string;
  updated_at?: Date;
};

// Query Filter Types
export interface LoomerFilters {
  role?: UserRole | UserRole[];
  is_verified?: boolean;
  onboarding_completed?: boolean;
  interests?: string[]; // Filter by interests
  dislikes?: string[]; // Filter by dislikes
  created_after?: Date;
  created_before?: Date;
  search?: string; // for full-text search
}

export interface GalaxyFilters {
  type?: "community" | "brand" | "official";
  visibility?: GalaxyVisibility | GalaxyVisibility[];
  is_verified?: boolean;
  created_after?: Date;
  created_before?: Date;
  search?: string;
}

export interface ContentFilters {
  creator_id?: string;
  visibility?: ContentVisibility | ContentVisibility[];
  content_type?: ContentType | ContentType[];
  created_after?: Date;
  created_before?: Date;
  tags?: string[]; // for looms
  search?: string;
  is_featured?: boolean; // for looms
}

export interface CommentFilters {
  content_type?: ContentType;
  content_id?: string;
  commenter_id?: string;
  parent_comment_id?: string;
  created_after?: Date;
  created_before?: Date;
}

// Pagination Types
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions[];
  include?: string[]; // Relations to include
}

// Vector Search Types
export interface VectorSearchQuery {
  vector: number[];
  limit?: number;
  threshold?: number;
}

export interface VectorSearchResult<T> {
  item: T;
  similarity: number;
  distance: number;
}

// Join Types (for complex queries with relations)
export interface LoomerWithRelations extends Loomer {
  star_links?: Array<{
    id: string;
    url: string;
    label?: string;
    created_at: Date;
  }>;
  powers?: Array<{ name: string; acquired_at: Date }>;
  relics?: Array<{ asset_id: string; name?: string }>;
  galaxy_memberships?: Array<{
    galaxy: Galaxy;
    role: string;
    reputation_score: number;
  }>;
  connections_count?: {
    followers: number;
    following: number;
    friends: number;
  };
}

// Database Galaxy with relations (database table focused)
export interface GalaxyWithRelations extends Galaxy {
  star_links?: Array<{ url: string }>;
  role_maps?: Array<{ role: string; access_level: string }>;
  members_count?: number;
  // Database-focused topic stats (not full domain objects)
  topic_stats?: Array<{
    name: string;
    is_system: boolean;
    content_count: number;
  }>;
  // Database-focused event stats (not full domain objects)
  event_stats?: Array<{
    name: string;
    description?: string;
    expires_at: Date;
    participants_count: number;
  }>;
}

export interface LoomWithRelations extends Loom {
  creator?: Pick<Loomer, "id" | "loomer_name" | "avatar" | "is_verified">;
  dev_content?: Dev;
  likes_count?: number;
  comments_count?: number;
  star_links?: Array<{
    id: string;
    url: string;
    label?: string;
    created_at: Date;
  }>;
}

export interface ContentWithCreator {
  id: string;
  type: ContentType;
  title?: string;
  content?: string;
  visibility: ContentVisibility;
  created_at: Date;
  creator: Pick<Loomer, "id" | "loomer_name" | "avatar" | "is_verified">;
  engagement: {
    likes: number;
    comments: number;
    views?: number;
  };
}

// Database Response Types
export interface DatabaseResponse<T> {
  data: T[];
  count: number;
  error?: string;
}

export interface DatabaseSingleResponse<T> {
  data: T | null;
  error?: string;
}

// Bulk Operation Types
export interface BulkInsert<T> {
  items: T[];
  on_conflict?: "ignore" | "update";
  return_data?: boolean;
}

export interface BulkUpdate<T> {
  updates: Array<{
    where: Partial<T>;
    data: Partial<T>;
  }>;
  return_data?: boolean;
}

export interface BulkDelete {
  where: Record<string, unknown>;
  return_data?: boolean;
}

// Analytics Query Types
export interface AnalyticsTimeframe {
  start_date: Date;
  end_date: Date;
  granularity: "hour" | "day" | "week" | "month";
}

export interface ContentAnalyticsQuery {
  content_ids?: string[];
  content_types?: ContentType[];
  creator_ids?: string[];
  timeframe: AnalyticsTimeframe;
}

export interface UserAnalyticsQuery {
  user_ids?: string[];
  timeframe: AnalyticsTimeframe;
  include_social?: boolean;
  include_content?: boolean;
}

// Aggregation Types
export interface ContentStats {
  total_content: number;
  by_type: Record<ContentType, number>;
  by_visibility: Record<ContentVisibility, number>;
  most_viewed: Array<{ id: string; title?: string; views: number }>;
  most_liked: Array<{ id: string; title?: string; likes: number }>;
}

export interface UserStats {
  total_users: number;
  by_role: Record<UserRole, number>;
  verified_users: number;
  active_users: number; // logged in within last 30 days
  top_creators: Array<{
    id: string;
    loomer_name: string;
    content_count: number;
    total_views: number;
  }>;
}

export interface GalaxyStats {
  total_galaxies: number;
  by_type: Record<"community" | "brand" | "official", number>;
  by_visibility: Record<GalaxyVisibility, number>;
  most_active: Array<{
    id: string;
    slug: string;
    members_count: number;
    content_count: number;
  }>;
}

// Real-time Types (for subscriptions)
export interface RealtimeEvent<T> {
  event_type: "INSERT" | "UPDATE" | "DELETE";
  table: DatabaseTable;
  old_record?: T;
  new_record?: T;
  timestamp: Date;
}

export interface RealtimeFilter {
  table: DatabaseTable;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string; // SQL WHERE condition
}

// Migration Types
export interface Migration {
  version: string;
  name: string;
  up_sql: string;
  down_sql: string;
  applied_at?: Date;
}

// Index Types
export interface DatabaseIndex {
  name: string;
  table: string;
  columns: string[];
  type: "btree" | "gin" | "gist" | "ivfflat";
  unique?: boolean;
  where?: string; // partial index condition
}

// Export all content types for easy access
export type AnyContent = Loom | Quick | Spark | Comet | Dev;
export type AnyContentWithRelations =
  | LoomWithRelations
  | Quick
  | Spark
  | Comet
  | Dev;
