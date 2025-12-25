
import React, { useState } from 'react';
import { MOCK_LOGS, MOCK_PROJECTS } from '../mockData';
import { DailyLog } from '../types';

const DailyLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>(MOCK_LOGS);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  
  const initialFormState: Partial<DailyLog> = {
    date: new Date().toISOString().split('T')[0],
    weather: 'Nắng',
    manpowerCount: 0,
    activities: '',
    issues: '',
    projectId: MOCK_PROJECTS[0]?.id || ''
  };

  const [formData, setFormData] = useState<Partial<DailyLog>>(initialFormState);

  const handleOpenCreate = () => {
    setEditingLog(null);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const handleOpenEdit = (log: DailyLog) => {
    setEditingLog(log);
    setFormData(log);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhật ký này không?')) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLog) {
      // Cập nhật log hiện có
      setLogs(prev => prev.map(log => 
        log.id === editingLog.id ? { ...log, ...formData } as DailyLog : log
      ));
    } else {
      // Thêm log mới
      const logToAdd: DailyLog = {
        ...formData as DailyLog,
        id: `l${Date.now()}`,
      };
      setLogs([logToAdd, ...logs]);
    }
    
    setShowForm(false);
    setEditingLog(null);
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nhật ký Công trường</h2>
          <p className="text-slate-500 font-medium">Ghi nhận và quản lý tiến độ thi công hàng ngày.</p>
        </div>
        <button 
          onClick={showForm ? () => setShowForm(false) : handleOpenCreate}
          className={`${showForm ? 'bg-slate-100 text-slate-600' : 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'} px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-widest`}
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i> 
          {showForm ? 'Đóng Form' : 'Viết Nhật ký mới'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-200 animate-slideDown overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-600"></div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <i className={`fas ${editingLog ? 'fa-edit' : 'fa-pen-nib'} text-orange-600`}></i>
            {editingLog ? `Chỉnh sửa Nhật ký: ${editingLog.date}` : 'Ghi nhận Nhật ký mới'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dự án thi công</label>
              <select 
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-900 appearance-none"
              >
                {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày ghi nhận</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời tiết</label>
              <input 
                type="text" 
                value={formData.weather}
                onChange={e => setFormData({...formData, weather: e.target.value})}
                placeholder="Ví dụ: Nắng gắt, Mưa nhẹ, Có dông..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng nhân công (NC)</label>
              <input 
                type="number" 
                value={formData.manpowerCount}
                onChange={e => setFormData({...formData, manpowerCount: parseInt(e.target.value) || 0})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Công việc thực hiện chính</label>
              <textarea 
                rows={3}
                value={formData.activities}
                onChange={e => setFormData({...formData, activities: e.target.value})}
                required
                placeholder="Mô tả chi tiết các hạng mục đã triển khai..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
              ></textarea>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-red-500">Vấn đề / Trở ngại / Đề xuất</label>
              <textarea 
                rows={2}
                value={formData.issues}
                onChange={e => setFormData({...formData, issues: e.target.value})}
                placeholder="Ghi nhận các sự cố, thiếu hụt vật tư hoặc rủi ro..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" 
              ></textarea>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-4">
               <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingLog(null); }}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
               >
                 Hủy bỏ
               </button>
               <button 
                type="submit"
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20 hover:bg-orange-600 transition-all"
               >
                {editingLog ? 'Cập nhật Nhật ký' : 'Lưu Nhật ký'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {logs.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200 text-slate-400">
            <i className="fas fa-calendar-times text-6xl mb-4 opacity-10"></i>
            <p className="font-bold text-lg">Chưa có nhật ký nào được ghi nhận.</p>
          </div>
        ) : (
          logs.map(log => {
            const project = MOCK_PROJECTS.find(p => p.id === log.projectId);
            return (
              <div key={log.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start gap-8 hover:shadow-md hover:border-orange-200 transition-all group relative">
                {/* Date Side */}
                <div className="w-full lg:w-24 text-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-8 flex lg:flex-col items-center justify-between lg:justify-center shrink-0">
                  <div className="lg:mb-1">
                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{log.date.split('-')[2]}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tháng {log.date.split('-')[1]}</p>
                  </div>
                  <div className="lg:mt-4">
                    <p className="text-[10px] font-bold text-slate-300 uppercase">{log.date.split('-')[0]}</p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div>
                      <h4 className="font-black text-xl text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{project?.name || 'Dự án không xác định'}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {log.id.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-100">
                        <i className="fas fa-sun mr-1.5"></i> {log.weather}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <i className="fas fa-users mr-1.5"></i> {log.manpowerCount} NC
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6 group-hover:bg-white transition-colors">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{log.activities}</p>
                  </div>

                  {log.issues && (
                    <div className="flex items-start gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-2xl border border-red-100 mb-6">
                      <div className="mt-0.5"><i className="fas fa-exclamation-circle text-base"></i></div>
                      <p className="font-medium"><strong>Vấn đề tồn đọng:</strong> {log.issues}</p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(log)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <i className="fas fa-edit"></i> Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                      <i className="fas fa-trash"></i> Xóa bỏ
                    </button>
                  </div>
                </div>

                {/* Image Placeholder */}
                <div className="hidden xl:block shrink-0">
                  <div className="relative group/img overflow-hidden rounded-[24px] shadow-sm">
                    <img src={`https://picsum.photos/seed/${log.id}/200/150`} alt="Progress" className="w-44 h-32 object-cover transition-transform duration-700 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <i className="fas fa-expand text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyLogsPage;
