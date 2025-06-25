// Type Exports - Central export point for all types
// Import all types from this file for consistency

// Database Types
export * from "./database.types";

// Domain Model Types
export type {
  User,
  Galaxy,
  RoleMaps,
  Comment,
  Loom,
  Quick,
  Spark,
  Comet,
  Dev,
  Message,
  Content,
  ApiResponse,
  PaginatedResponse,
  SearchResult,
  VectorSearchOptions,
  AuthUser,
  LoginCredentials,
  RegisterData,
  InvitationData,
  CreateLoomData,
  CreateQuickData,
  CreateSparkData,
  CreateCometData,
  CreateDevData,
  CreateGalaxyData,
  UpdateGalaxyData,
  UpdateProfileData,
  ContentAnalytics,
  UserAnalytics,
  ValidationError,
  ApiError,
  PollOption,
} from "./domain.types";

// Database Utility Types
export type {
  DatabaseTable,
  InsertLoomer,
  InsertGalaxy,
  InsertLoom,
  InsertQuick,
  InsertSpark,
  InsertComet,
  InsertDev,
  InsertComment,
  UpdateLoomer,
  UpdateGalaxy,
  UpdateLoom,
  UpdateDev,
  UpdateSpark,
  UpdateComet,
  UpdateQuick,
  UpdateComment,
  LoomerFilters,
  GalaxyFilters,
  ContentFilters,
  CommentFilters,
  PaginationOptions,
  SortOptions,
  QueryOptions,
  VectorSearchQuery,
  VectorSearchResult,
  LoomerWithRelations,
  GalaxyWithRelations,
  LoomWithRelations,
  ContentWithCreator,
  DatabaseResponse,
  DatabaseSingleResponse,
  BulkInsert,
  BulkUpdate,
  BulkDelete,
  AnalyticsTimeframe,
  ContentAnalyticsQuery,
  UserAnalyticsQuery,
  ContentStats,
  UserStats,
  GalaxyStats,
  RealtimeEvent,
  RealtimeFilter,
  Migration,
  DatabaseIndex,
  AnyContent,
  AnyContentWithRelations,
} from "./database-utils.types";

// Re-export specific types for convenience
export type {
  UserRole,
  GalaxyType,
  GalaxyVisibility,
  ContentVisibility,
  ContentType,
  ConnectionType,
  InvitationStatus,
  DevLanguage,
  DevType,
  DevApplicate,
  SparkType,
  AccessLevel,
} from "./database.types";

// Type Guards
import type { Content, Loom, Quick, Spark, Comet, Dev } from "./domain.types";

export function isLoom(content: Content): content is Loom {
  return (
    content &&
    typeof content === "object" &&
    "title" in content &&
    "slug" in content
  );
}

export function isQuick(content: Content): content is Quick {
  return (
    content &&
    typeof content === "object" &&
    "content" in content &&
    !("title" in content)
  );
}

export function isSpark(content: Content): content is Spark {
  return (
    content &&
    typeof content === "object" &&
    "name" in content &&
    "type" in content
  );
}

export function isComet(content: Content): content is Comet {
  return content && typeof content === "object" && "options" in content;
}

export function isDev(content: Content): content is Dev {
  return (
    content &&
    typeof content === "object" &&
    "code" in content &&
    "language" in content
  );
}

// Content Type Helpers
export const CONTENT_TYPES = {
  LOOM: "loom" as const,
  QUICK: "quick" as const,
  SPARK: "spark" as const,
  COMET: "comet" as const,
  DEV: "dev" as const,
} as const;

export const USER_ROLES = {
  SUPREME: "supreme" as const,
  ADMIN: "admin" as const,
  MODERATOR: "moderator" as const,
  TIME: "time" as const,
  SPACE: "space" as const,
} as const;

export const GALAXY_TYPES = {
  COMMUNITY: "community" as const,
  BRAND: "brand" as const,
  OFFICIAL: "official" as const,
} as const;

export const CONTENT_VISIBILITY = {
  PUBLISHED: "published" as const,
  UNLISTED: "unlisted" as const,
  GALAXY_ONLY: "galaxyOnly" as const,
  FOLLOWERS_ONLY: "followersOnly" as const,
  GALAXY_AND_FOLLOWERS_ONLY: "galaxyAndFollowersOnly" as const,
} as const;

export const GALAXY_VISIBILITY = {
  PUBLIC: "public" as const,
  PRIVATE: "private" as const,
  INVITE_ONLY: "invite-only" as const,
} as const;

// Database Table Constants
export const TABLES = {
  LOOMERS: "loomers",
  GALAXIES: "galaxies",
  LOOMS: "looms",
  QUICKS: "quicks",
  SPARKS: "sparks",
  COMETS: "comets",
  DEVS: "devs",
  COMMENTS: "comments",
  MESSAGES: "messages",
  CONNECTIONS: "connections",
  INVITATIONS: "invitations",
  GALAXY_MEMBERSHIPS: "galaxy_memberships",
  LIKES: "likes",
  CONTENT_LISTS: "content_lists",
  GALAXY_TOPICS: "galaxy_topics",
  GALAXY_EVENTS: "galaxy_events",
} as const;
