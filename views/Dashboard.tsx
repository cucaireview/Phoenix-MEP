
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PROJECTS, MOCK_LOGS } from '../mockData';
import { ProjectStatus, Project } from '../types';

const Dashboard: React.FC = () => {
  // Tính toán số liệu thống kê thực tế từ dữ liệu mẫu
  const stats = useMemo(() => {
    const total = MOCK_PROJECTS.length;
    const inProgress = MOCK_PROJECTS.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const completed = MOCK_PROJECTS.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const delayed = MOCK_PROJECTS.filter(p => p.status === ProjectStatus.DELAYED).length;
    const inspection = MOCK_PROJECTS.filter(p => p.status === ProjectStatus.INSPECTION).length;
    const avgProgress = total > 0 ? Math.round(MOCK_PROJECTS.reduce((acc, p) => acc + p.progress, 0) / total) : 0;

    return { total, inProgress, completed, delayed, inspection, avgProgress };
  }, []);

  // Lọc các dự án sắp đến hạn (7 ngày tới)
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    return MOCK_PROJECTS.filter(p => {
      const endDate = new Date(p.endDate);
      // Kiểm tra nếu ngày kết thúc nằm trong khoảng 7 ngày tới hoặc đang ở trạng thái nghiệm thu
      const isSoon = endDate >= today && endDate <= next7Days;
      const isInspecting = p.status === ProjectStatus.INSPECTION;
      return (isSoon || isInspecting) && p.status !== ProjectStatus.COMPLETED;
    });
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Điều hành Phoenix</h2>
          <p className="text-slate-500 font-medium">Xin chào Kỹ sư Trưởng. Đây là tình hình thi công hôm nay.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <i className="fas fa-calendar-day text-orange-600"></i> {new Date().toLocaleDateString('vi-VN')}
          </button>
          <Link to="/projects" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20">
            <i className="fas fa-plus"></i> Khởi tạo dự án
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="fa-person-digging" 
          label="Đang thi công" 
          value={stats.inProgress} 
          trend="+2 dự án mới"
          color="bg-blue-600" 
          textColor="text-blue-600"
        />
        <StatCard 
          icon="fa-clipboard-check" 
          label="Đợi nghiệm thu" 
          value={stats.inspection} 
          trend="Hôm nay có 3 ca"
          color="bg-purple-600" 
          textColor="text-purple-600"
        />
        <StatCard 
          icon="fa-circle-check" 
          label="Hoàn thành" 
          value={stats.completed} 
          trend="Trong tháng: 4"
          color="bg-green-600" 
          textColor="text-green-600"
        />
        <StatCard 
          icon="fa-triangle-exclamation" 
          label="Chậm tiến độ" 
          value={stats.delayed} 
          trend="Cần xử lý gấp"
          color="bg-red-600" 
          textColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Projects Progress Chart (Simplified Visual) */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 overflow-hidden relative group">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Tiến độ Trọng điểm</h3>
              <Link to="/projects" className="text-orange-600 text-xs font-black uppercase tracking-widest hover:underline">Chi tiết</Link>
            </div>
            <div className="space-y-6">
              {MOCK_PROJECTS.slice(0, 3).map((p) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.client}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900">{p.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000" 
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Daily Logs Table */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Cập nhật công trường</h3>
                <Link to="/daily-logs" className="bg-slate-50 text-slate-400 p-2 rounded-lg hover:text-orange-600 transition-colors">
                  <i className="fas fa-ellipsis-h"></i>
                </Link>
             </div>
             <div className="space-y-4">
               {MOCK_LOGS.slice(0, 3).map((log) => {
                 const project = MOCK_PROJECTS.find(p => p.id === log.projectId);
                 return (
                   <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
                     <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-[8px] font-black uppercase">{log.date.split('-')[1]}</span>
                        <span className="text-lg font-black leading-none">{log.date.split('-')[2]}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{project?.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{log.activities}</p>
                     </div>
                     <div className="text-right shrink-0">
                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-400 uppercase">{log.weather}</span>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{log.manpowerCount} NC</p>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 space-y-8">
          {/* Progress Reminders Section */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-6">
                <i className="fas fa-bell text-orange-600 animate-bounce"></i>
                <h3 className="font-black text-lg text-slate-900 uppercase tracking-widest">Nhắc nhở Tiến độ</h3>
             </div>
             <div className="space-y-4">
                {upcomingReminders.length > 0 ? (
                  upcomingReminders.map(project => (
                    <ReminderItem 
                      key={project.id} 
                      project={project}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase">Không có dự án sắp hạn</p>
                  </div>
                )}
             </div>
          </div>

          {/* AI Quick Insight */}
          <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 blur-[80px] rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <i className="fas fa-microchip text-lg"></i>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Phoenix Core AI</h4>
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Giám sát thông minh</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6">
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  "Tiến độ trung bình đạt {stats.avgProgress}%. Dự án Grand Park đang vượt kế hoạch 5%. Lưu ý khu vực kho Lazada đang thiếu nhân công lắp đặt Foam."
                </p>
              </div>
              <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">
                Xem báo cáo phân tích
              </button>
            </div>
          </div>

          {/* Quick Tasks / Notifications */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
             <h3 className="font-black text-lg mb-6 text-slate-900 uppercase tracking-widest">Việc cần làm ngay</h3>
             <div className="space-y-4">
                <TaskItem icon="fa-file-contract" label="Ký duyệt bản vẽ thi công" project="Tòa Grand Park" urgency="Gấp" />
                <TaskItem icon="fa-truck-loading" label="Nhập 200 đầu báo khói" project="Logistics Lazada" urgency="Chờ" />
                <TaskItem icon="fa-user-shield" label="Kiểm tra an toàn lao động" project="Bv Đa Khoa BD" urgency="Gấp" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard: React.FC<{ icon: string, label: string, value: number, trend: string, color: string, textColor: string }> = ({ icon, label, value, trend, color, textColor }) => (
  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 group hover:border-orange-200 transition-all">
    <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center mb-4 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
      <i className={`fas ${icon} text-xl`}></i>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
    <p className={`text-[10px] font-bold mt-2 ${textColor} uppercase`}>{trend}</p>
  </div>
);

const TaskItem: React.FC<{ icon: string, label: string, project: string, urgency: 'Gấp' | 'Chờ' }> = ({ icon, label, project, urgency }) => (
  <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
      <i className={`fas ${icon} text-xs`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-900 leading-tight">{label}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase">{project}</p>
    </div>
    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${urgency === 'Gấp' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
      {urgency}
    </span>
  </div>
);

const ReminderItem: React.FC<{ project: Project }> = ({ project }) => {
  const isInspection = project.status === ProjectStatus.INSPECTION;
  
  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <div className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${isInspection ? 'bg-purple-50 border-purple-100 hover:border-purple-300' : 'bg-orange-50 border-orange-100 hover:border-orange-300'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isInspection ? 'bg-purple-600 text-white' : 'bg-orange-600 text-white'}`}>
           <i className={`fas ${isInspection ? 'fa-clipboard-check' : 'fa-hourglass-end'} text-xs`}></i>
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-sm font-black text-slate-900 truncate group-hover:text-orange-600 transition-colors">{project.name}</p>
           <div className="flex items-center gap-2 mt-1">
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${isInspection ? 'bg-purple-200 text-purple-700' : 'bg-orange-200 text-orange-700'}`}>
                {isInspection ? 'Nghiệm thu' : 'Sắp kết thúc'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{project.endDate}</span>
           </div>
        </div>
        <i className="fas fa-chevron-right text-slate-300 text-[10px] group-hover:translate-x-1 transition-transform"></i>
      </div>
    </Link>
  );
};

export default Dashboard;
