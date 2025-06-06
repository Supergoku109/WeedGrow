// firestoreModels.ts

// ================================
// 📁 Top-level: /plants/{plantId}
// ================================
export interface Plant {
    name: string;
    strain: string;
    owners: string[];
    growthStage: 'germination' | 'seedling' | 'vegetative' | 'flowering';
    status: 'active' | 'archived' | 'harvested' | 'dead';
    environment: 'outdoor' | 'greenhouse' | 'indoor';
    plantedIn: 'pot' | 'ground';
  
    potSize?: string;
    sunlightExposure?: string;
    wateringFrequency?: string;
    fertilizer?: string;
    pests?: string[];
    trainingTags?: string[];
    notes?: string;
    imageUri?: string;
    waterLevel?: number; // 0-1 representing current watering level
  
    location?: {
      lat: number;
      lng: number;
    };
    locationNickname?: string;
  
    reminderSchedule?: {
      type: 'interval' | 'custom' | 'none';
      intervalDays?: number;
      customDays?: string[];
      timeOfDay?: string;
    };
  
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
  }
  
  // ================================
  // 📁 Subcollection: /plants/{plantId}/logs/{logId}
  // ================================
  export interface PlantLog {
    timestamp: FirebaseFirestore.Timestamp;
    type: 'watering' | 'fertilizing' | 'note' | 'photo' | 'training' | 'stage_change' | 'harvest';
    description?: string;
    photoUri?: string;
    updatedBy: string; // UID
  }
  
  // ================================
  // 📁 Subcollection: /plants/{plantId}/weatherCache/{YYYY-MM-DD}
  // ================================
  export interface WeatherCacheEntry {
    date: string; // 'YYYY-MM-DD'
    temperature: string;
    humidity: string;
    uvIndex: number;
    windSpeed: string;
    summary: string;
    fetchedAt: FirebaseFirestore.Timestamp;
  }
  
  // ================================
  // 📁 /users/{userId}/settings
  // ================================
  export interface UserSettings {
    defaultEnvironment: 'indoor' | 'outdoor' | 'greenhouse';
    preferredUnits: 'metric' | 'imperial';
    darkMode: boolean;
    defaultReminderTime: string;
    notificationPreferences: {
      wateringReminders: boolean;
      newLogActivity: boolean;
      tips: boolean;
    };
  }
  
  // ================================
  // 📁 /notifications/{userId}
  // ================================
  export interface NotificationProfile {
    deviceTokens: string[];
    subscribedTopics: string[];
    lastUpdated: FirebaseFirestore.Timestamp;
  }
  
  // ================================
  // 📁 /analytics/{userId}_year_{year}
  // ================================
  export interface UserAnalytics {
    year: number;
    totalWaterings: number;
    totalFertilizations: number;
    completedStages: {
      germination: number;
      seedling: number;
      vegetative: number;
      flowering: number;
    };
    pestsEncountered: string[];
    mostUsedTrainingTags: string[];
    totalPlantsCreated: number;
    totalPlantsArchived: number;
  }
  
  // ================================
  // 📁 /invites/{inviteId}
  // ================================
  export interface Invite {
    invitedBy: string; // userId
    invitedUserEmail: string;
    plantId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: FirebaseFirestore.Timestamp;
  }
  