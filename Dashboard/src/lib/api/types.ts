// Common API response types from Swagger documentation
export interface AboutDto {
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string | null;
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
}

export interface EventDetailDto extends EventDto {
  forums: ForumSummaryDto[] | null;
  chatMessageCount: number;
}

export interface CreateEventCommand {
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isPublic: boolean;
  categoryId: string;
}

export interface UpdateEventCommand {
  eventId: string;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  startDateTime: string;
  endDateTime: string;
  isPublic: boolean;
  categoryId: string;
}

export interface LoginCommand {
  email: string ;
  password: string ;
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