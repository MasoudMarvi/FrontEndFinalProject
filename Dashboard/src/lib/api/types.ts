// types.ts
// Common API response types from Swagger documentation
export interface AboutDto {
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Define the EventStatus enum to match backend
export enum EventStatus {
  Pending = 0,
  Active = 1,
  Cancelled = 2
}

export interface ChatMessageDto {
  messageId: string;
  eventId: string;
  eventTitle: string | null;
  userId: string | null;
  userName: string | null;
  messageText: string | null;
  timestamp: string;
}

export interface CreateChatMessageCommand {
  eventId: string;
  messageText: string | null;
}

export interface UpdateChatMessageCommand {
  messageId: string;
  messageText: string | null;
}

export interface CreateContactMessageCommand {
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
}

// New EnvironmentalData types
export interface EnvironmentalDataDto {
  dataId: string;
  latitude: number;
  longitude: number;
  airQualityIndex: number;
  pollutionLevel: number;
  temperature: number;
  timestamp: string;
  eventId: string;
}

export interface CreateEnvironmentalDataDto {
  latitude: number;
  longitude: number;
  airQualityIndex: number;
  pollutionLevel: number;
  temperature: number;
  timestamp: string;
  eventId: string;
}

export interface UpdateEnvironmentalDataDto {
  latitude: number;
  longitude: number;
  airQualityIndex: number;
  pollutionLevel: number;
  temperature: number;
  timestamp: string;
  eventId: string;
}

export interface CreateEnvironmentalDataCommand {
  data: CreateEnvironmentalDataDto;
}

export interface UpdateEnvironmentalDataCommand {
  dataId: string;
  data: UpdateEnvironmentalDataDto;
}

export interface EventCategoryDto {
  categoryId: string;
  categoryName: string | null;
  description: string | null;
}

export interface CreateEventCategoryCommand {
  categoryName: string | null;
  description: string | null;
}

export interface UpdateEventCategoryCommand {
  categoryId: string;
  categoryName: string | null;
  description: string | null;
}

export interface ForumSummaryDto {
  forumId: string;
  topic: string | null;
  createdAt: string;
  messageCount: number;
}

// Updated EventDto with new fields
export interface EventDto {
  eventId: string;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isPublic: boolean;
  categoryId: string;
  categoryName: string | null;
  creatorUserId: string | null;
  creatorName: string | null;
  picture1: string | null;
  picture2: string | null;
  picture3: string | null;
  status: EventStatus;
}

export interface EventDetailDto extends EventDto {
  forums: ForumSummaryDto[] | null;
  chatMessageCount: number;
}

// Form data for multipart/form-data requests
export interface EventFormData {
  eventId?: string; // Added eventId for updates
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isPublic: boolean;
  categoryId: string;
  picture1?: File;
  picture2?: File;
  picture3?: File;
  status?: EventStatus;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string | null;
  userId: string | null;
}

export interface CreateUserCommand {
  email: string | null;
  password: string | null;
  fullName: string | null;
  role: string | null;
}

export interface UpdateUserCommand {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface RegisterResponse {
  userId: string;
}