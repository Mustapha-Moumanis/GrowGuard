export interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  role: "Agronomist" | "Farmer"
  avatar?: string
  country?: string
  region?: string
  city?: string
  address?:string
  latitude?: number
  longitude?: number

  notificationPreferences?: {
    browserPush: boolean
    emailDigest: "immediate" | "daily" | "weekly" | "none"
    geographicRadius: number // in km
    severityThreshold: "low" | "medium" | "high" | "critical"
    cropSubscriptions: string[]
    quietHours: {
      enabled: boolean
      start: string // "22:00"
      end: string // "08:00"
    }
  }
}
// location?: string
// farmLocation?: {
//   lat: number
//   lng: number
//   address: string
// }
// specialization?: string
// cropTypes?: string[]

export interface Alert {
  id: string;
  title: string;
  description: string;
  crop: string;
  latitude: number;
  longitude: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  address?: string;
  date: string;
  author: number;
  category: string;
  radius: number;
  distance?: number;
}

export interface AlertFilter {
  cropTypes: string[]
  categories: string[]
  severityLevels: string[]
  timeRange: "24h" | "week" | "month" | "all"
  location?: {
    lat: number
    lng: number
    radius: number // in km
  }
  sortBy: "distance" | "date" | "severity"
  sortOrder: "asc" | "desc"
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "alert" | "weather" | "system" | "response"
  alertId?: string
  isRead: boolean
  createdAt: string
  severity?: "low" | "medium" | "high" | "critical"
  actionUrl?: string
  isNew?: boolean
}
export interface WeatherUpdate {
  id: string
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: "Sunny" | "Rainy" | "Cloudy" | "Stormy"
  date: string
}


export interface CropType {
  id: string
  name: string
  category: string
  icon?: string
  commonPests?: string[]
  commonDiseases?: string[]
}

export interface UserStats {
  totalAlertsPublished: number
  totalResponsesReceived: number
  averageResponseTime: number
  mostActiveCropTypes: Array<{
    cropType: string
    count: number
  }>
  engagementScore: number
  lastActiveDate: string
}



// {
//   "id": "80e35d48-8e02-45a8-b0ae-fdd8d4d32905",
//   "title": "asdasd asd asd asdas das dasd",
//   "description": "asd asd a sdas kdhoias idaiusduia udias iudydas",
//   "crop": "Corn",
//   "latitude": 32.2290891,
//   "longitude": -7.9477194,
//   "severity": "Critical",
//   "date": "2025-06-03",
//   "author": 1,
//   "category": "advisory",
//   "radius": 25000.0,
//   "distance": 0.0,
//   "is_within_radius": true
// },