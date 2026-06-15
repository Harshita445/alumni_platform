export interface Alumni {
  id: string;

  name: string;
  profileImage: string;

  graduationYear: number;

  company: string;
  role: string;

  bio: string;

  sessionTypes: string[];

  hourlyRate: number;

  rating: number;

  totalReviews: number;

  availableForOneOnOne: boolean;

  availableForGroupSessions: boolean;
}