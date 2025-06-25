// Database Types - Auto-generated from PostgreSQL Schema
// This file contains all the database table types and enums

// Database Enums
export type UserRole = "supreme" | "admin" | "moderator" | "time" | "space";
export type GalaxyType = "community" | "brand" | "official";
export type GalaxyVisibility = "public" | "private" | "invite-only";
export type ContentVisibility =
  | "published"
  | "unlisted"
  | "galaxyOnly"
  | "followersOnly"
  | "galaxyAndFollowersOnly";
export type ContentType = "loom" | "quick" | "spark" | "comet" | "dev";
export type ConnectionType = "orbit" | "moon" | "star" | "reverse";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";
export type DevLanguage = "html-css-js" | "markdown";
export type DevType = "profile" | "game" | "loom";
export type DevApplicate = "general" | "strict";
export type SparkType = "quiz" | "blast" | "match" | "flashcard";
export type AccessLevel =
  | "creator"
  | "admin"
  | "moderator"
  | "starGeneral"
  | "member"
  | "guest";

// Core Database Tables
export interface Loomer {
  id: string;
  loomer_name: string;
  hash_id: string;
  email: string;
  password_hash: string;
  bio?: string;
  dob?: Date;
  location?: string;
  avatar: string;
  role: UserRole;
  onboarding_completed: boolean;
  is_verified: boolean;
  verification_code?: string;
  verification_expires_at?: Date;
  stardust: number;
  level: number;
  xp: number;
  aura: number;
  interests?: string[]; // Array of user interests
  dislikes?: string[]; // Array of user dislikes
  vectors?: number[]; // pgvector(384)
  created_at: Date;
  updated_at: Date;
}

export interface UserSocialLink {
  id: string;
  user_id: string;
  url: string;
  created_at: Date;
}

export interface UserPower {
  id: string;
  user_id: string;
  name: string;
  acquired_at: Date;
}

export interface UserRelic {
  id: string;
  user_id: string;
  asset_id: string;
  name?: string;
  acquired_at: Date;
}

export interface Galaxy {
  id: string;
  slug: string;
  type: GalaxyType;
  is_verified: boolean;
  logo?: string;
  accent_color?: string;
  lore?: string;
  banner?: string;
  rules?: string;
  visibility: GalaxyVisibility;
  call_to_action_label?: string;
  call_to_action_url?: string;
  vectors?: number[]; // pgvector(384)
  created_at: Date;
  updated_at: Date;
}

export interface GalaxyStarLink {
  id: string;
  galaxy_id: string;
  url: string;
}

export interface RoleMap {
  id: string;
  galaxy_id: string;
  role: string;
  access_level: AccessLevel;
}

export interface GalaxyMembership {
  id: string;
  user_id: string;
  galaxy_id: string;
  role: string;
  reputation_title?: string;
  reputation_score: number;
  joined_at: Date;
}

export interface Connection {
  id: string;
  user_id: string;
  peer_id: string;
  connection_type: ConnectionType;
  created_at: Date;
}

export interface Invitation {
  id: string;
  initiator_id: string;
  recipient_id: string;
  travel_kind: string; // 'galaxy' | 'orbit'
  destination_id?: string;
  proposed_role?: string;
  status: InvitationStatus;
  message?: string;
  created_at: Date;
  expires_at: Date;
}

export interface Dev {
  id: string;
  creator_id: string;
  slug: string;
  title?: string;
  description?: string;
  cover_image?: string;
  code: string;
  language: DevLanguage;
  type: DevType;
  applicate: DevApplicate;
  visibility: ContentVisibility;
  vectors?: number[]; // pgvector(384)
  created_at: Date;
  updated_at: Date;
}

export interface Pair {
  id: string;
  term: string;
  definition: string;
}

export interface Spark {
  id: string;
  creator_id: string;
  slug: string;
  name: string;
  type: SparkType;
  pair_id?: string;
  visibility: ContentVisibility;
  vectors?: number[]; // pgvector(384)
  created_at: Date;
}

export interface Loom {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  mindmap?: string;
  description?: string;
  tags?: string[];
  visibility: ContentVisibility;
  images?: string[];
  views: number;
  is_featured: boolean;
  content?: string;
  content_type: string; // 'dev' | 'app'
  dev_content_id?: string;
  vectors?: number[]; // pgvector(384)
  ai_summary?: string;
  word_count: number;
  readability_score?: number;
  grammar_score?: number;
  bounce_rate?: number;
  avg_time_ratio?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Quick {
  id: string;
  creator_id: string;
  slug: string;
  content: string;
  images?: string[];
  visibility: ContentVisibility;
  vectors?: number[]; // pgvector(384)
  // Requick functionality (similar to retweets)
  is_requick: boolean;
  original_quick_id?: string;
  requick_comment?: string;
  created_at: Date;
}

export interface Comet {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  description?: string;
  options: Record<string, unknown>; // JSONB - poll options stored as JSON
  visibility: ContentVisibility;
  expires_at?: Date;
  vectors?: number[]; // pgvector(384)
  created_at: Date;
}

export interface Comment {
  id: string;
  commenter_id: string;
  content_type: ContentType;
  content_id: string;
  message: string;
  parent_comment_id?: string;
  vectors?: number[]; // pgvector(384)
  created_at: Date;
  updated_at: Date;
}

export interface Like {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  created_at: Date;
}

export interface ContentList {
  id: string;
  user_id: string;
  name: string;
  is_system: boolean;
  created_at: Date;
}

export interface ContentListItem {
  id: string;
  list_id: string;
  content_type: ContentType;
  content_id: string;
  position?: number;
  added_at: Date;
}

export interface GalaxyTopic {
  id: string;
  galaxy_id: string;
  name: string;
  is_system: boolean;
  created_at: Date;
}

export interface GalaxyTopicContent {
  id: string;
  topic_id: string;
  content_type: ContentType;
  content_id: string;
  position?: number;
  added_at: Date;
}

export interface GalaxyEvent {
  id: string;
  galaxy_id: string;
  name: string;
  description?: string;
  stardust_reward?: number;
  badges?: string;
  reputation_title?: string;
  reputation_score: number;
  expires_at: Date;
  created_at: Date;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: Date;
}

export interface EventSubmission {
  id: string;
  event_id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  submitted_at: Date;
}

export interface GalaxyRoom {
  id: string;
  galaxy_id: string;
  name: string;
  is_global: boolean;
  created_at: Date;
}

export interface Message {
  id: string;
  sender_id: string;
  room_id?: string;
  connection_id?: string;
  message: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: string;
  reported_at: Date;
}

export interface AffiliateLink {
  id: string;
  loom_id: string;
  url: string;
  added_at: Date;
}

export interface ContentAssociation {
  id: string;
  source_type: ContentType;
  source_id: string;
  target_type: ContentType;
  target_id: string;
  created_at: Date;
}

// Database Table Names (useful for dynamic queries)
export const TABLE_NAMES = {
  LOOMERS: "loomers",
  USER_SOCIAL_LINKS: "user_social_links",
  USER_POWERS: "user_powers",
  USER_RELICS: "user_relics",
  GALAXIES: "galaxies",
  GALAXY_STAR_LINKS: "galaxy_star_links",
  ROLE_MAPS: "role_maps",
  GALAXY_MEMBERSHIPS: "galaxy_memberships",
  CONNECTIONS: "connections",
  INVITATIONS: "invitations",
  DEVS: "devs",
  PAIRS: "pairs",
  SPARKS: "sparks",
  LOOMS: "looms",
  QUICKS: "quicks",
  COMETS: "comets",
  COMMENTS: "comments",
  LIKES: "likes",
  CONTENT_LISTS: "content_lists",
  CONTENT_LIST_ITEMS: "content_list_items",
  GALAXY_TOPICS: "galaxy_topics",
  GALAXY_TOPIC_CONTENTS: "galaxy_topic_contents",
  GALAXY_EVENTS: "galaxy_events",
  EVENT_PARTICIPANTS: "event_participants",
  EVENT_SUBMISSIONS: "event_submissions",
  GALAXY_ROOMS: "galaxy_rooms",
  MESSAGES: "messages",
  CONTENT_REPORTS: "content_reports",
  AFFILIATE_LINKS: "affiliate_links",
  CONTENT_ASSOCIATIONS: "content_associations",
} as const;
