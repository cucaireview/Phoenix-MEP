
export enum ProjectStatus {
  PLANNING = 'Chuẩn bị',
  IN_PROGRESS = 'Đang thi công',
  INSPECTION = 'Nghiệm thu',
  COMPLETED = 'Hoàn thành',
  DELAYED = 'Chậm tiến độ'
}

export interface Project {
  id: string;
  name: string;
  location: string;
  client: string;
  status: ProjectStatus;
  progress: number; // 0-100
  startDate: string;
  endDate: string;
  description: string;
  pcccType: string; // e.g., "Căn hộ cao tầng", "Nhà xưởng công nghiệp"
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  plannedQuantity: number;
  actualQuantity: number;
  status: 'Đủ hàng' | 'Đang đặt' | 'Hết hàng' | 'Đã sử dụng';
}

export interface DailyLog {
  id: string;
  projectId: string;
  date: string;
  weather: string;
  manpowerCount: number;
  activities: string;
  issues: string;
  images?: string[];
}

export interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  isCompleted: boolean;
  notes?: string;
  standardRef?: string; // TCVN references
}

export interface Checklist {
  id: string;
  projectId: string;
  title: string;
  items: ChecklistItem[];
}

export interface AISettings {
  riskAssessment: boolean;
  resourceOptimization: boolean;
  progressForecasting: boolean;
  reportTone: 'professional' | 'concise' | 'technical';
  language: 'vi' | 'en';
}
