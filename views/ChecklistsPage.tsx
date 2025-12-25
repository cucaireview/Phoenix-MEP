
import React, { useState, useMemo } from 'react';
import { MOCK_CHECKLISTS, MOCK_PROJECTS } from '../mockData';
import { ChecklistItem, Checklist } from '../types';

type FilterStatus = 'all' | 'pending' | 'completed';

const ChecklistsPage: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>(MOCK_CHECKLISTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeChecklistId, setActiveChecklistId] = useState<string>(checklists[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [editingItem, setEditingItem] = useState<{checklistId: string, item: ChecklistItem} | null>(null);

  // Phân loại và lọc danh sách checklist
  const filteredChecklists = useMemo(() => {
    return checklists.filter(cl => {
      const matchProject = selectedProjectId === 'all' || cl.projectId === selectedProjectId;
      
      const isCompleted = cl.items.every(i => i.isCompleted);
      const matchStatus = filterStatus === 'all' 
        || (filterStatus === 'completed' && isCompleted)
        || (filterStatus === 'pending' && !isCompleted);

      return matchProject && matchStatus;
    });
  }, [checklists, selectedProjectId, filterStatus]);

  // Checklist đang hoạt động
  const activeChecklist = useMemo(() => {
    return checklists.find(cl => cl.id === activeChecklistId) || filteredChecklists[0] || checklists[0];
  }, [activeChecklistId, checklists, filteredChecklists]);

  // Handlers cho Checklist
  const handleDeleteChecklist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ phiếu kiểm tra này?')) {
      const newChecklists = checklists.filter(cl => cl.id !== id);
      setChecklists(newChecklists);
      if (activeChecklistId === id && newChecklists.length > 0) {
        setActiveChecklistId(newChecklists[0].id);
      }
    }
  };

  // Handlers cho Checklist Item
  const toggleItemCompletion = (checklistId: string, itemId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map(item => 
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
          )
        };
      }
      return cl;
    }));
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    if (window.confirm('Xóa mục kiểm tra này?')) {
      setChecklists(prev => prev.map(cl => {
        if (cl.id === checklistId) {
          return { ...cl, items: cl.items.filter(i => i.id !== itemId) };
        }
        return cl;
      }));
    }
  };

  const progress = useMemo(() => {
    if (!activeChecklist || !activeChecklist.items.length) return 0;
    const total = activeChecklist.items.length;
    const completed = activeChecklist.items.filter(i => i.isCompleted).length;
    return Math.round((completed / total) * 100);
  }, [activeChecklist]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Kiểm soát Chất lượng (QC)</h2>
          <p className="text-slate-500">Quản lý phiếu kiểm tra Phoenix MEP theo dự án và trạng thái.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
            <i className="fas fa-file-export"></i> Xuất Báo cáo
          </button>
          <button 
            onClick={() => { setEditingChecklist(null); setIsModalOpen(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i> Tạo Phiếu Mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Bộ lọc và Danh sách Phiếu */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dự án</label>
                <select 
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm appearance-none"
                >
                  <option value="all">Tất cả dự án</option>
                  {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Trạng thái Phiếu</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['all', 'pending', 'completed'] as FilterStatus[]).map(s => (
                    <button 
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                        filterStatus === s ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {s === 'all' ? 'Tất cả' : s === 'pending' ? 'Đang chạy' : 'Xong'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Phiếu phù hợp ({filteredChecklists.length})</label>
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin">
                {filteredChecklists.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-sm">Không có phiếu nào.</div>
                ) : (
                  filteredChecklists.map(cl => {
                    const project = MOCK_PROJECTS.find(p => p.id === cl.projectId);
                    const isActive = cl.id === activeChecklistId;
                    const isDone = cl.items.every(i => i.isCompleted);
                    return (
                      <div 
                        key={cl.id}
                        onClick={() => setActiveChecklistId(cl.id)}
                        className={`group cursor-pointer p-4 rounded-2xl transition-all border relative overflow-hidden ${
                          isActive 
                          ? 'bg-orange-600 text-white border-orange-500 shadow-lg' 
                          : 'bg-white border-slate-100 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate leading-tight mb-1">{cl.title}</p>
                            <p className={`text-[10px] font-medium truncate ${isActive ? 'text-orange-100' : 'text-slate-400'}`}>
                              {project?.name || 'MEP Project'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {isDone ? (
                              <span className="bg-green-500/20 text-white px-1.5 py-0.5 rounded text-[8px] font-bold">XONG</span>
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>PENDING</span>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); setEditingChecklist(cl); setIsModalOpen(true); }} className="text-[10px] hover:scale-110"><i className="fas fa-edit"></i></button>
                              <button onClick={(e) => handleDeleteChecklist(cl.id, e)} className="text-[10px] hover:scale-110"><i className="fas fa-trash"></i></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết Checklist */}
        <div className="lg:col-span-8">
          {!activeChecklist ? (
            <div className="bg-white h-[600px] rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <i className="fas fa-clipboard-list text-6xl mb-4 opacity-20"></i>
              <p className="font-bold">Chọn một phiếu kiểm tra để bắt đầu</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
              {/* Checklist Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                        {MOCK_PROJECTS.find(p => p.id === activeChecklist.projectId)?.name}
                      </span>
                      <span className="text-slate-400 text-xs font-bold">ID: {activeChecklist.id.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{activeChecklist.title}</h3>
                      <button onClick={() => { setEditingChecklist(activeChecklist); setIsModalOpen(true); }} className="text-slate-300 hover:text-orange-600 transition-colors"><i className="fas fa-edit"></i></button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-black text-slate-900">{progress}% hoàn thành</span>
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600 transition-all duration-700" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Ngày khởi tạo: 20/03/2024</p>
                  </div>
                </div>
              </div>

              {/* Checklist Items List */}
              <div className="flex-1 p-8 space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh mục đầu việc ({activeChecklist.items.length})</h4>
                  <button className="text-xs font-bold text-orange-600 hover:underline">+ Thêm việc</button>
                </div>
                {activeChecklist.items.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 italic">Phiếu này chưa có nội dung kiểm tra.</div>
                ) : (
                  activeChecklist.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                        item.isCompleted 
                        ? 'bg-green-50/30 border-green-100' 
                        : 'bg-white border-slate-100 hover:border-orange-200'
                      }`}
                    >
                      <button 
                        onClick={() => toggleItemCompletion(activeChecklist.id, item.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all ${
                          item.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white scale-110 shadow-sm' 
                          : 'border-slate-300 hover:border-orange-400 bg-white'
                        }`}
                      >
                        {item.isCompleted && <i className="fas fa-check text-[10px]"></i>}
                      </button>
                      <div className="flex-1">
                        <p className={`font-bold text-sm transition-all ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {item.task}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">{item.category}</span>
                          {item.standardRef && (
                            <span className="text-[9px] font-black text-orange-600 flex items-center gap-1">
                              <i className="fas fa-shield-alt text-[8px]"></i> {item.standardRef}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => handleDeleteItem(activeChecklist.id, item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><i className="fas fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* AI Assistant Section */}
              <div className="p-6 bg-slate-900 text-white rounded-t-[32px] shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center animate-pulse">
                    <i className="fas fa-robot text-sm"></i>
                  </div>
                  <h4 className="font-bold text-sm tracking-wide">Phoenix AI QC Assistant</h4>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <AIActionSuggestion label="Đề xuất TCVN liên quan" />
                  <AIActionSuggestion label="Dự báo rủi ro lắp đặt" />
                  <AIActionSuggestion label="Gợi ý vật tư thay thế" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD Phiếu (Giả lập) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
              <i className={`fas ${editingChecklist ? 'fa-edit' : 'fa-plus-circle'} text-orange-600`}></i>
              {editingChecklist ? 'Chỉnh sửa Phiếu' : 'Tạo Phiếu Kiểm tra Mới'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const projectId = formData.get('projectId') as string;

              if (editingChecklist) {
                setChecklists(prev => prev.map(cl => cl.id === editingChecklist.id ? { ...cl, title, projectId } : cl));
              } else {
                const newCl: Checklist = {
                  id: `cl-${Date.now()}`,
                  title,
                  projectId,
                  items: []
                };
                setChecklists(prev => [...prev, newCl]);
                setActiveChecklistId(newCl.id);
              }
              setIsModalOpen(false);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tên phiếu kiểm tra</label>
                <input name="title" defaultValue={editingChecklist?.title} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="Nhập tên phiếu..." />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Dự án áp dụng</label>
                <select name="projectId" defaultValue={editingChecklist?.projectId || MOCK_PROJECTS[0].id} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold">
                  {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const AIActionSuggestion: React.FC<{ label: string }> = ({ label }) => (
  <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold text-slate-300 hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all flex items-center gap-2">
    <i className="fas fa-magic text-[8px] text-orange-500"></i> {label}
  </button>
);

export default ChecklistsPage;
