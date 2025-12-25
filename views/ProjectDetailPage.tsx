
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PROJECTS, MOCK_LOGS, MOCK_CHECKLISTS } from '../mockData';
import { summarizeProjectProgress } from '../services/geminiService';
import { Project, ProjectStatus, Material, DailyLog, Checklist } from '../types';

type TabType = 'overview' | 'schedule' | 'finance' | 'documents' | 'materials';
type MaterialFilter = 'Tất cả' | 'Đủ hàng' | 'Đang đặt' | 'Hết hàng' | 'Đã sử dụng';

interface Milestone {
  id: string;
  label: string;
  date: string;
  progress: number;
  status: 'completed' | 'active' | 'pending';
  description?: string;
}

interface Transaction {
  id: string;
  label: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
}

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | undefined>(MOCK_PROJECTS.find(p => p.id === id));
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [aiSummary, setAiSummary] = useState<string>('Đang phân tích dữ liệu dự án...');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelUploadRef = useRef<HTMLInputElement>(null);

  const [materialFilter, setMaterialFilter] = useState<MaterialFilter>('Tất cả');

  // Dynamic States
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm1', label: 'Khảo sát & Lập thiết kế', date: '2023-10-15', progress: 100, status: 'completed', description: 'Hoàn thành hồ sơ kỹ thuật và trình duyệt PCCC.' },
    { id: 'm2', label: 'Thi công trục ống đứng', date: '2023-12-20', progress: 100, status: 'completed', description: 'Lắp đặt hệ thống ống thép chữa cháy DN150.' },
    { id: 'm3', label: 'Lắp đặt thiết bị báo cháy', date: '2024-05-15', progress: 45, status: 'active', description: 'Đang triển khai kéo cáp tín hiệu và gắn đầu báo khói.' },
    { id: 'm4', label: 'Thử áp & Nghiệm thu nội bộ', date: '2024-06-10', progress: 0, status: 'pending', description: 'Kiểm tra độ kín khít và áp lực vận hành hệ thống.' },
    { id: 'm5', label: 'Bàn giao & Nghiệm thu Nhà nước', date: '2024-07-20', progress: 0, status: 'pending', description: 'Cảnh sát PCCC kiểm tra và cấp chứng nhận.' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', label: 'Thanh toán đợt 1: Tạm ứng vật tư', amount: '800,000,000', date: '2023-10-20', type: 'expense' },
    { id: 't2', label: 'Giải ngân đợt 2: Hoàn thành phần thô', amount: '1,200,000,000', date: '2023-12-15', type: 'income' },
  ]);

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { id: 'd1', name: 'Giấy phép phê duyệt thiết kế', type: 'PDF', status: 'Approved', size: '2.4MB' },
    { id: 'd2', name: 'Bản vẽ thi công tầng hầm', type: 'DWG', status: 'Approved', size: '15.8MB' },
  ]);

  const [materials, setMaterials] = useState<Material[]>([
    { id: 'mt1', name: 'Đầu phun Sprinkler 68°C', unit: 'Cái', plannedQuantity: 500, actualQuantity: 320, status: 'Đang đặt' },
    { id: 'mt2', name: 'Ống thép PCCC DN100', unit: 'Mét', plannedQuantity: 1200, actualQuantity: 1200, status: 'Đủ hàng' },
    { id: 'mt3', name: 'Đầu báo khói địa chỉ', unit: 'Cái', plannedQuantity: 150, actualQuantity: 50, status: 'Hết hàng' },
    { id: 'mt4', name: 'Tủ trung tâm báo cháy 4 Loop', unit: 'Bộ', plannedQuantity: 2, actualQuantity: 2, status: 'Đã sử dụng' },
  ]);

  const [modalType, setModalType] = useState<'milestone' | 'finance' | 'document' | 'editProject' | 'material' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (project) {
      handleAnalyze();
    }
  }, [id]);

  const handleAnalyze = async () => {
    if (!project) return;
    setIsLoadingSummary(true);
    const logs = MOCK_LOGS.filter(l => l.projectId === project.id);
    const summary = await summarizeProjectProgress(project, logs);
    setAiSummary(summary);
    setIsLoadingSummary(false);
  };

  const filteredMaterials = useMemo(() => {
    if (materialFilter === 'Tất cả') return materials;
    return materials.filter(m => m.status === materialFilter);
  }, [materials, materialFilter]);

  const materialStats = useMemo(() => {
    const total = materials.length;
    const completed = materials.filter(m => m.status === 'Đủ hàng' || m.status === 'Đã sử dụng').length;
    const pending = materials.filter(m => m.status === 'Đang đặt').length;
    const alert = materials.filter(m => m.status === 'Hết hàng').length;
    return { total, completed, pending, alert };
  }, [materials]);

  const updateMaterialQuantity = (id: string, field: 'plannedQuantity' | 'actualQuantity', value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: Math.max(0, numValue) };
        if (updated.actualQuantity >= updated.plannedQuantity && updated.status === 'Đang đặt') {
          updated.status = 'Đủ hàng';
        }
        return updated;
      }
      return m;
    }));
  };

  const handleExportExcel = () => {
    if (!project) return;
    let csvContent = "\uFEFF"; 
    
    csvContent += "=== TỔNG QUAN DỰ ÁN ===\n";
    csvContent += `Tên dự án,${project.name}\n`;
    csvContent += `Địa điểm,${project.location}\n`;
    csvContent += `Chủ đầu tư,${project.client}\n`;
    csvContent += `Loại hình,${project.pcccType}\n`;
    csvContent += `Trạng thái,${project.status}\n`;
    csvContent += `Tiến độ hiện tại,${project.progress}%\n`;
    csvContent += `Ngày bắt đầu,${project.startDate}\n`;
    csvContent += `Ngày kết thúc,${project.endDate}\n\n`;

    csvContent += "=== DANH MỤC VẬT TƯ ===\n";
    csvContent += "Tên vật tư,Đơn vị,Dự toán,Thực tế,Tiến độ,Trạng thái\n";
    materials.forEach(mt => {
      const ratio = Math.round((mt.actualQuantity / mt.plannedQuantity) * 100) || 0;
      csvContent += `"${mt.name}",${mt.unit},${mt.plannedQuantity},${mt.actualQuantity},${ratio}%,${mt.status}\n`;
    });
    csvContent += "\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bao_cao_du_an_${project.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteItem = (type: TabType | 'all', id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    if (type === 'schedule') setMilestones(prev => prev.filter(m => m.id !== id));
    if (type === 'finance') setTransactions(prev => prev.filter(t => t.id !== id));
    if (type === 'documents') setDocuments(prev => prev.filter(d => d.id !== id));
    if (type === 'materials') setMaterials(prev => prev.filter(m => m.id !== id));
  };

  if (!project) return <div className="p-20 text-center font-black text-slate-300 text-3xl">404 PROJECT NOT FOUND</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
          <i className="fas fa-arrow-left text-slate-600"></i>
        </button>
        <nav className="text-sm text-slate-500 font-medium">
          Dự án / <span className="text-slate-900 font-bold">{project.name}</span>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{project.name}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{project.pcccType}</span>
            <span className="text-slate-500 text-sm font-bold flex items-center gap-2"><i className="fas fa-map-marker-alt text-orange-500"></i>{project.location}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalType('editProject')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-xs shadow-sm">
            <i className="fas fa-edit"></i> Chỉnh sửa thông tin
          </button>
          <button onClick={handleExportExcel} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2 text-xs">
            <i className="fas fa-file-export"></i> Xuất Báo cáo Excel
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Tổng quan" icon="fa-th-large" />
        <TabButton active={activeTab === 'materials'} onClick={() => setActiveTab('materials')} label="Vật tư & Cung ứng" icon="fa-toolbox" />
        <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} label="Tiến độ & Milestones" icon="fa-stream" />
        <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="Tài chính" icon="fa-wallet" />
        <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} label="Hồ sơ pháp lý" icon="fa-folder-open" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-slideUp">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <i className="fas fa-info-circle text-orange-600"></i> Thông tin dự án
                </h3>
                <div className="grid grid-cols-2 gap-y-6 mb-8">
                  <DetailItem label="Chủ đầu tư" value={project.client} />
                  <DetailItem label="Trạng thái" value={project.status} />
                  <DetailItem label="Tiến độ thực hiện" value={`${project.progress}%`} />
                  <DetailItem label="Thời gian thực hiện" value={`${project.startDate} đến ${project.endDate}`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryStat label="Hoàn thành" value={`${project.progress}%`} color="text-orange-600" />
                  <SummaryStat label="Hạng mục vật tư" value={materialStats.total.toString()} color="text-slate-900" />
                  <SummaryStat label="Vật tư đủ hàng" value={`${Math.round((materialStats.completed / materialStats.total) * 100) || 0}%`} color="text-green-600" />
                  <SummaryStat label="Chất lượng QC" value="100%" color="text-blue-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6 animate-slideUp">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MaterialSummaryCard label="Tổng hạng mục" value={materialStats.total} icon="fa-boxes-stacked" color="bg-slate-100 text-slate-600" />
                <MaterialSummaryCard label="Đã hoàn tất" value={materialStats.completed} icon="fa-check-circle" color="bg-green-100 text-green-600" />
                <MaterialSummaryCard label="Đang cung ứng" value={materialStats.pending} icon="fa-shipping-fast" color="bg-orange-100 text-orange-600" />
                <MaterialSummaryCard label="Thiếu hụt" value={materialStats.alert} icon="fa-triangle-exclamation" color="bg-red-100 text-red-600" />
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Chi tiết Vật tư</h3>
                  </div>
                  <button onClick={() => setModalType('material')} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                    + Thêm mới
                  </button>
                </div>

                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {['Tất cả', 'Đủ hàng', 'Đang đặt', 'Hết hàng', 'Đã sử dụng'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setMaterialFilter(f as MaterialFilter)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        materialFilter === f 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên vật tư</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Số lượng</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</th>
                        <th className="pb-4 text-right pr-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredMaterials.map(m => {
                        const ratio = Math.min(100, Math.round((m.actualQuantity / m.plannedQuantity) * 100)) || 0;
                        return (
                          <tr key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5">
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <span className={`text-[9px] font-black uppercase ${
                                m.status === 'Đủ hàng' ? 'text-green-600' :
                                m.status === 'Đang đặt' ? 'text-orange-600' :
                                m.status === 'Đã sử dụng' ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="py-5">
                              <div className="flex items-center justify-center gap-4">
                                <input 
                                  type="number" 
                                  value={m.actualQuantity}
                                  onChange={(e) => updateMaterialQuantity(m.id, 'actualQuantity', e.target.value)}
                                  className="w-16 text-center font-black text-sm bg-orange-50 border border-orange-200 text-orange-700 rounded-lg p-1 outline-none"
                                />
                                <span className="text-slate-300 font-bold">/</span>
                                <span className="font-black text-slate-500">{m.plannedQuantity}</span>
                              </div>
                            </td>
                            <td className="py-5">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-700 ${ratio >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${ratio}%` }}></div>
                              </div>
                            </td>
                            <td className="py-5 text-right pr-4">
                               <button onClick={() => deleteItem('materials', m.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i className="fas fa-trash"></i></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-12 animate-slideUp">
              <div className="flex justify-between items-center px-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lộ trình triển khai PCCC</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sơ đồ ống dẫn & cột mốc quan trọng</p>
                </div>
                <button onClick={() => setModalType('milestone')} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10">
                  + Thêm giai đoạn
                </button>
              </div>

              {/* ARCHITECTURAL HORIZONTAL TIMELINE */}
              <div className="relative overflow-x-auto pb-24 pt-20 scrollbar-hide px-8">
                {/* Background Connection Path (The Pipeline) */}
                <div className="absolute top-[136px] left-0 right-0 h-4 bg-slate-100 rounded-full z-0 overflow-hidden mx-16">
                   <div 
                    className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-slate-300 transition-all duration-1000"
                    style={{ 
                      width: `${(milestones.filter(m => m.status !== 'pending').length / milestones.length) * 100}%` 
                    }}
                   ></div>
                </div>

                <div className="relative flex justify-between items-start gap-12 min-w-max">
                  {milestones.map((m, index) => {
                    const isActive = m.status === 'active';
                    const isCompleted = m.status === 'completed';
                    
                    return (
                      <div key={m.id} className="relative w-72 flex flex-col items-center group">
                        
                        {/* Milestone Card (Floats Above) */}
                        <div className={`mb-16 w-full p-5 rounded-[32px] border-2 transition-all duration-500 relative transform group-hover:-translate-y-2 ${
                          isActive 
                            ? 'bg-orange-600 border-orange-500 text-white shadow-2xl shadow-orange-600/30 scale-105 z-20' 
                            : isCompleted 
                              ? 'bg-white border-green-500 text-slate-900 shadow-lg' 
                              : 'bg-white border-slate-100 text-slate-400'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                             <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                               isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50'
                             }`}>
                               Giai đoạn {index + 1}
                             </span>
                             <span className={`text-[10px] font-black ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{m.date}</span>
                          </div>
                          <h4 className="font-black text-base leading-tight mb-2 truncate">{m.label}</h4>
                          <p className={`text-xs leading-relaxed line-clamp-2 font-medium ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                            {m.description || 'Chưa có mô tả chi tiết cho giai đoạn này.'}
                          </p>

                          {isActive && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase">Tiến độ</span>
                               <span className="text-sm font-black">{m.progress}%</span>
                            </div>
                          )}
                          
                          {/* Card Anchor Pin */}
                          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r-2 border-b-2 ${
                             isActive ? 'bg-orange-600 border-orange-500' : isCompleted ? 'bg-white border-green-500' : 'bg-white border-slate-100'
                          }`}></div>
                        </div>

                        {/* Connection Node */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div 
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-green-500 border-green-100 text-white shadow-lg' 
                                : isActive 
                                  ? 'bg-white border-orange-600 text-orange-600 shadow-2xl scale-125' 
                                  : 'bg-white border-slate-200 text-slate-300'
                            }`}
                          >
                            {isCompleted ? <i className="fas fa-check text-sm"></i> : <span className="font-black text-sm">{index + 1}</span>}
                          </div>
                          
                          {/* Pulsing Ring for Active Node */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-2xl bg-orange-600 animate-ping opacity-20"></div>
                          )}
                        </div>

                        {/* Quick Controls Below */}
                        <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingItem(m); setModalType('milestone'); }} className="text-[10px] font-black uppercase text-blue-600 hover:underline">Cập nhật</button>
                           <button onClick={() => deleteItem('schedule', m.id)} className="text-[10px] font-black uppercase text-red-600 hover:underline">Xóa</button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600">
                       <i className="fas fa-history text-xl"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian đã qua</p>
                       <p className="text-xl font-black text-slate-900">145 Ngày</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-600">
                       <i className="fas fa-flag-checkered text-xl"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mốc hoàn thành</p>
                       <p className="text-xl font-black text-slate-900">2 / 5</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                       <i className="fas fa-hourglass-end text-xl"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dự kiến kết thúc</p>
                       <p className="text-xl font-black text-slate-900">12.08.2024</p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
             <div className="space-y-6 animate-slideUp">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FinanceCard label="Dự toán gói thầu" value="4.2B VNĐ" icon="fa-coins" color="bg-blue-600" />
                 <FinanceCard label="Giải ngân thực tế" value="2.8B VNĐ" icon="fa-check-double" color="bg-green-600" />
                 <FinanceCard label="Số dư kế hoạch" value="1.4B VNĐ" icon="fa-hourglass-half" color="bg-orange-600" />
               </div>
               <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold mb-6">Lịch sử thanh toán</h3>
                 <div className="space-y-4">
                   {transactions.map(t => (
                     <TransactionItem key={t.id} {...t} />
                   ))}
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 animate-slideUp">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Hồ sơ & Pháp lý PCCC</h3>
                <button onClick={() => fileInputRef.current?.click()} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-upload"></i> Tải hồ sơ
                </button>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(d => (
                  <FileItem key={d.id} {...d} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-3xl rounded-full"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-orange-600/40">
                <i className="fas fa-robot text-lg"></i>
              </div>
              <div>
                <h4 className="font-black text-sm tracking-widest uppercase">Phoenix Insight</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phân tích Báo cáo AI</p>
              </div>
            </div>
            <div className="space-y-4">
              {isLoadingSummary ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="text-xs text-slate-300 leading-relaxed font-medium italic bg-white/5 p-4 rounded-2xl border border-white/10">
                  {aiSummary}
                </div>
              )}
              <button onClick={handleAnalyze} className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all">
                Cập nhật phân tích
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
              <i className="fas fa-edit text-orange-600"></i>
              {editingItem ? 'Cập nhật nội dung' : 'Thêm nội dung mới'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: any = Object.fromEntries(formData.entries());
              if (modalType === 'material') {
                if (editingItem) {
                  setMaterials(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...data, plannedQuantity: parseInt(data.plannedQuantity), actualQuantity: parseInt(data.actualQuantity) } : m));
                } else {
                  setMaterials(prev => [{ id: `mt${Date.now()}`, ...data, plannedQuantity: parseInt(data.plannedQuantity), actualQuantity: parseInt(data.actualQuantity) }, ...prev]);
                }
              } else if (modalType === 'milestone') {
                if (editingItem) {
                  setMilestones(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...data, progress: parseInt(data.progress) } : m));
                } else {
                  setMilestones(prev => [...prev, { id: `m${Date.now()}`, ...data, progress: parseInt(data.progress || '0'), status: 'pending' }]);
                }
              }
              setModalType(null);
              setEditingItem(null);
            }} className="space-y-6">
              {modalType === 'material' && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên vật tư</label>
                    <input name="name" defaultValue={editingItem?.name} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thiết kế</label>
                      <input name="plannedQuantity" type="number" defaultValue={editingItem?.plannedQuantity || 0} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Thực tế</label>
                      <input name="actualQuantity" type="number" defaultValue={editingItem?.actualQuantity || 0} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                    </div>
                  </div>
                </>
              )}
              {modalType === 'milestone' && (
                 <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên mốc quan trọng</label>
                    <input name="label" defaultValue={editingItem?.label} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mô tả chi tiết</label>
                    <textarea name="description" defaultValue={editingItem?.description} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="Nhập các hạng mục con cần thực hiện..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ngày dự kiến</label>
                      <input name="date" type="date" defaultValue={editingItem?.date} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tiến độ (%)</label>
                      <input name="progress" type="number" defaultValue={editingItem?.progress || 0} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Trạng thái</label>
                    <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                      <option value="pending">Chờ thực hiện (Pending)</option>
                      <option value="active">Đang triển khai (Active)</option>
                      <option value="completed">Đã hoàn thành (Completed)</option>
                    </select>
                  </div>
                </>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setModalType(null); setEditingItem(null); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600 uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Đóng</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-all">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Polished Sub-Components ---
const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: string }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-1 py-5 border-b-2 transition-all font-bold text-sm whitespace-nowrap tracking-tight ${active ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
    <i className={`fas ${icon}`}></i> {label}
  </button>
);

const DetailItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="font-black text-slate-900">{value}</p>
  </div>
);

const SummaryStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-widest">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const MaterialSummaryCard: React.FC<{ label: string, value: number, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="p-5 rounded-3xl border border-slate-200 shadow-sm bg-white">
    <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-3 shadow-sm`}>
      <i className={`fas ${icon} text-sm`}></i>
    </div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const TransactionItem: React.FC<Transaction> = ({ label, amount, date, type }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        <i className={`fas ${type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
      </div>
      <div>
        <p className="font-bold text-sm text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
      </div>
    </div>
    <p className={`font-black text-base ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{amount}</p>
  </div>
);

const FinanceCard: React.FC<{ label: string, value: string, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-xl shadow-current/30`}><i className={`fas ${icon} text-xl`}></i></div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const FileItem: React.FC<DocumentFile> = ({ name, type, status, size }) => (
  <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl group cursor-pointer bg-white hover:border-orange-500 transition-all shadow-sm">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md ${type === 'PDF' ? 'bg-red-500' : 'bg-blue-500'}`}>{type}</div>
    <div className="flex-1 overflow-hidden">
      <p className="font-bold text-sm text-slate-900 truncate">{name}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{size} • {status}</p>
    </div>
    <i className="fas fa-chevron-right text-slate-200 group-hover:text-orange-600 transition-all"></i>
  </div>
);

export default ProjectDetailPage;
