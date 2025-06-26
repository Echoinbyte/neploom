// Domain Models - Application-level types for business logic
// These types represent the data as used in your application

import type {
  UserRole,
  GalaxyType,
  GalaxyVisibility,
  ContentVisibility,
  ContentType,
  SparkType,
  DevLanguage,
  DevType,
  DevApplicate,
  AccessLevel,
} from "./database.types";

// Core Domain Models
export interface User {
  id: string;

  /** 🔐 Account Info */
  email: string;
  password: string;
  verification: {
    code: string;
    expiresAt: Date;
    isVerified: boolean;
  };
  onboardingCompleted: boolean;
  role: UserRole;

  /** 🧍 Profile Info */
  loomerName: string;
  hashId: string;
  avatar: string;
  bio?: string;
  interests?: string[];
  dislikes?: string[];
  starLinks: { link: string }[];
  joinedAt: Date;

  /** 💾 User Stats & XP */
  profile: {
    sourceCode: {
      code: string;
      format: "html" | "markdown" | "raw";
    };
    stardust: number;
    stats: {
      level: number;
      xp: number;
      aura: number;
    };
    collection: {
      relics: string[];
      powers: {
        name: string;
        acquiredAt: Date;
      }[];
    };
  };

  /** 📚 Content Created */
  contents: {
    type: ContentType;
    id: string;
  }[];

  /** 🧠 Recommendations / AI Search */
  vectors: number[];

  /** 🔗 Social / Community */
  connections: {
    moons: string[]; // followers
    stars: string[]; // following
    orbits: string[]; // friends
    galaxies: string[];
    nebulas: string[];
    wormHoles: {
      initiator: string;
      travelers: string[];
      travel: {
        kind: "galaxy" | "nebula" | "orbit";
        destinationId: string;
        proposedRole: string;
      };
      status: "pending" | "accepted" | "declined";
      message?: string;
    }[];
  };
}

export interface Galaxy {
  id: string;
  type: GalaxyType;
  isVerified?: boolean;
  brandAssets?: {
    logo: string;
    accentColor?: string;
    starLinks?: string[];
    lore: string;
    banner: string;
  };
  slug: string;
  warriors: {
    id: User;
    reputation: {
      title?: string;
      score: number;
    };
    role: string;
  }[];
  rules: string;
  roleMaps: RoleMaps;
  visibility: GalaxyVisibility;
  callToAction?: {
    label: string;
    url: string;
  };
  topics: {
    name: string | "pinned" | "votings" | "quest" | "event" | "app";
    contents: {
      type: ContentType;
      id: Loom | Quick | Spark | Comet | Dev;
    }[];
  }[];
  events: {
    name: string;
    description: string;
    participants: User[];
    submissions: {
      type: ContentType;
      id: string;
    }[];
    perks: {
      stardust: number; // 1-50
      badges: string;
      reputation: {
        title?: string;
        score: number;
      };
    };
    expiresAt: Date;
  }[];
  rooms: {
    name: string | "global";
    messages: Message[];
  }[];
}

export interface RoleMaps {
  [role: string]: AccessLevel;
}

export interface Comment {
  id: string;
  commenter: User;
  commentMessage: string;
  createdAt: Date;
}

export interface Loom {
  id: string;
  creator: User;
  title: string;
  slug: string;
  mindmap?: string;
  description?: string;
  tags?: string[];
  visibility: ContentVisibility;
  images?: string[];
  views: number;
  isFeatured: boolean;
  content?: string;
  contentType: "dev" | "app";
  devContent?: Dev;
  vectors?: number[];
  aiSummary?: string;
  wordCount: number;
  readabilityScore?: number;
  grammarScore?: number;
  bounceRate?: number;
  avgTimeRatio?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quick {
  id: string;
  creator: User;
  slug: string;
  content: string;
  images?: string[];
  visibility: ContentVisibility;
  vectors?: number[];
  // Requick functionality (similar to retweets)
  isRequick: boolean;
  originalQuick?: Quick;
  requickComment?: string;
  createdAt: Date;
}

export interface Spark {
  id: string;
  creator: User;
  slug: string;
  name: string;
  type: SparkType;
  pair?: Pair;
  visibility: ContentVisibility;
  vectors?: number[];
  createdAt: Date;
}

export interface Pair {
  id: string;
  term: string;
  definition: string;
  options?: Record<string, unknown>; // Optional JSONB field for quiz options
  createdAt: Date;
}

export interface Comet {
  id: string;
  creator: User;
  slug: string;
  title: string;
  description?: string;
  options: PollOption[];
  visibility: ContentVisibility;
  expiresAt?: Date;
  vectors?: number[];
  createdAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Dev {
  id: string;
  creator: User;
  slug: string;
  title?: string;
  description?: string;
  coverImage?: string;
  code: string;
  language: DevLanguage;
  type: DevType;
  applicate: DevApplicate;
  visibility: ContentVisibility;
  vectors?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  roomId?: string;
  connectionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Union Types for Content
export type Content = Loom | Quick | Spark | Comet | Dev;

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search Types
export interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: string[];
}

export interface VectorSearchOptions {
  query: string;
  limit?: number;
  threshold?: number;
  contentTypes?: ContentType[];
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  loomerName: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  loomerName: string;
}

// Invitation Types
export interface InvitationData {
  recipientId: string;
  travelKind: "galaxy" | "orbit";
  destinationId?: string;
  proposedRole?: string;
  message?: string;
}

// Content Creation Types
export interface CreateLoomData {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  tags?: string[];
  visibility: ContentVisibility;
  contentType: "dev" | "app";
  devContentId?: string;
}

export interface CreateQuickData {
  slug: string;
  content: string;
  images?: string[];
  visibility: ContentVisibility;
  // For requicks
  isRequick?: boolean;
  originalQuickId?: string;
  requickComment?: string;
}

export interface CreateSparkData {
  slug: string;
  name: string;
  type: SparkType;
  pairId?: string;
  visibility: ContentVisibility;
}

export interface CreateCometData {
  slug: string;
  title: string;
  description?: string;
  options: Omit<PollOption, "id" | "votes">[];
  visibility: ContentVisibility;
  expiresAt?: Date;
}

export interface CreateDevData {
  slug: string;
  title?: string;
  description?: string;
  code: string;
  language: DevLanguage;
  type: DevType;
  applicate: DevApplicate;
  visibility: ContentVisibility;
}

// Galaxy Management Types
export interface CreateGalaxyData {
  slug: string;
  type: GalaxyType;
  logo?: string;
  accentColor?: string;
  lore?: string;
  banner?: string;
  rules?: string;
  visibility: GalaxyVisibility;
}

export interface UpdateGalaxyData extends Partial<CreateGalaxyData> {
  id: string;
}

// Profile Update Types
export interface UpdateProfileData {
  loomerName?: string;
  bio?: string;
  avatar?: string;
  interests?: string[];
  dislikes?: string[];
  starLinks?: { link: string }[];
}

// Analytics Types
export interface ContentAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bounceRate?: number;
  avgTimeRatio?: number;
}

export interface UserAnalytics {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
  galaxiesCount: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}
