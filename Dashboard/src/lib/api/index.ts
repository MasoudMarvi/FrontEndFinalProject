// index.ts
import * as aboutApi from './about';
import * as authApi from './auth';
import * as chatMessagesApi from './chatMessages';
import * as contactMessagesApi from './contactMessages';
import * as environmentalDataApi from './environmentalData';
import * as eventCategoriesApi from './eventCategories';
import * as eventsApi from './events';
import * as usersApi from './users';

export {
  aboutApi,
  authApi,
  chatMessagesApi,
  contactMessagesApi,
  environmentalDataApi,
  eventCategoriesApi,
  eventsApi,
  usersApi
};

// Also export types
export * from './types';