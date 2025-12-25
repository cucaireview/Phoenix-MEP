
import { Project, ProjectStatus, DailyLog, Checklist } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Vinhomes Grand Park - Tòa A1',
    location: 'Quận 9, TP.HCM',
    client: 'Vingroup',
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    startDate: '2023-10-01',
    endDate: '2024-08-30',
    description: 'Lắp đặt hệ thống chữa cháy tự động Sprinkler và mạng lưới báo cháy cho 35 tầng.',
    pcccType: 'Căn hộ cao tầng'
  },
  {
    id: 'p2',
    name: 'Trung tâm Logistics Lazada',
    location: 'KCN Long Hậu, Long An',
    client: 'Lazada Việt Nam',
    status: ProjectStatus.PLANNING,
    progress: 10,
    startDate: '2024-02-15',
    endDate: '2024-12-20',
    description: 'Thiết kế và lắp đặt hệ thống chữa cháy bằng bọt Foam cho khu vực lưu trữ hóa chất.',
    pcccType: 'Nhà xưởng công nghiệp'
  },
  {
    id: 'p3',
    name: 'Bệnh viện Đa khoa Bình Dương',
    location: 'Thủ Dầu Một, Bình Dương',
    client: 'Bộ Y tế',
    status: ProjectStatus.INSPECTION,
    progress: 95,
    startDate: '2022-05-10',
    endDate: '2024-03-15',
    description: 'Thử nghiệm cuối cùng hệ thống họng nước chữa cháy và thông gió kiểm soát khói.',
    pcccType: 'Y tế & Bệnh viện'
  }
];

export const MOCK_LOGS: DailyLog[] = [
  {
    id: 'l1',
    projectId: 'p1',
    date: '2024-03-20',
    weather: 'Nắng',
    manpowerCount: 15,
    activities: 'Lắp đặt đầu báo khói tầng 12-14. Thử áp lực đường ống chính Sprinkler.',
    issues: 'Chậm giao hàng 100 đầu báo khói do vấn đề vận chuyển.',
  },
  {
    id: 'l2',
    projectId: 'p1',
    date: '2024-03-21',
    weather: 'Mưa',
    manpowerCount: 12,
    activities: 'Sơn ký hiệu đường ống PCCC. Kéo cáp tủ điều khiển trung tâm tại tầng hầm.',
    issues: 'Tiến độ ngoài trời bị chậm do mưa lớn ảnh hưởng lắp đặt trụ tiếp nước.',
  }
];

export const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: 'c1',
    projectId: 'p1',
    title: 'Nghiệm thu nội bộ: Hệ thống báo cháy',
    items: [
      { id: 'i1', category: 'Cảm biến', task: 'Kiểm tra trạng thái LED xanh của tất cả đầu báo khói', isCompleted: true, standardRef: 'TCVN 5738:2021' },
      { id: 'i2', category: 'Tủ điều khiển', task: 'Xác nhận dung lượng pin dự phòng (duy trì 24h)', isCompleted: false, standardRef: 'TCVN 3890' },
      { id: 'i3', category: 'Âm thanh', task: 'Đo cường độ âm thanh còi hú (tối thiểu 75dB)', isCompleted: false },
    ]
  }
];
