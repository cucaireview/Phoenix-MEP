
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PROJECTS } from '../mockData';
import { Project, ProjectStatus } from '../types';

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const styles: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNING]: 'bg-blue-100 text-blue-700',
    [ProjectStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700',
    [ProjectStatus.INSPECTION]: 'bg-purple-100 text-purple-700',
    [ProjectStatus.COMPLETED]: 'bg-green-100 text-green-700',
    [ProjectStatus.DELAYED]: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const projectData: Project = {
      id: editingProject?.id || `p${Date.now()}`,
      name: data.name as string,
      location: data.location as string,
      client: data.client as string,
      status: data.status as ProjectStatus,
      progress: parseInt(data.progress as string) || 0,
      startDate: data.startDate as string,
      endDate: data.endDate as string,
      description: data.description as string,
      pcccType: data.pcccType as string,
    };

    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? projectData : p));
    } else {
      setProjects(prev => [projectData, ...prev]);
    }

    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Danh sách Dự án Phoenix</h2>
          <p className="text-slate-500">Quản lý và theo dõi {projects.length} công trình MEP & PCCC.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <i className="fas fa-filter"></i> Bộ lọc
          </button>
          <button 
            onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Thêm dự án mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <i className="fas fa-folder-open text-6xl mb-4 opacity-20"></i>
            <p className="font-bold">Chưa có dự án nào được tạo.</p>
          </div>
        ) : (
          projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group relative">
              <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
                <div className="h-52 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/${project.id}/400/250`} alt={project.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-5 left-5">
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => handleEdit(project, e)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(project.id, e)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm text-red-600 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <p className="text-[10px] text-orange-600 font-black uppercase mb-2 tracking-widest">{project.pcccType}</p>
                  <h3 className="text-2xl font-black mb-3 text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">{project.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{project.description}</p>
                  
                  <div className="space-y-4 pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-orange-500"></i> {project.location}
                      </span>
                      <span className="font-black text-slate-900">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-600 transition-all duration-1000" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                <i className={`fas ${editingProject ? 'fa-edit' : 'fa-plus-circle'} text-orange-600`}></i>
                {editingProject ? 'Chỉnh sửa dự án' : 'Tạo dự án Phoenix mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tên dự án</label>
                <input name="name" defaultValue={editingProject?.name} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Ví dụ: Tòa nhà Phoenix Center..." />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Địa điểm</label>
                <input name="location" defaultValue={editingProject?.location} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Thành phố, Quận..." />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Chủ đầu tư</label>
                <input name="client" defaultValue={editingProject?.client} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Tên công ty khách hàng..." />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Trạng thái</label>
                <select name="status" defaultValue={editingProject?.status || ProjectStatus.PLANNING} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 appearance-none">
                  {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Loại công trình</label>
                <input name="pcccType" defaultValue={editingProject?.pcccType} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Ví dụ: Căn hộ cao tầng, Nhà xưởng..." />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ngày bắt đầu</label>
                <input name="startDate" type="date" defaultValue={editingProject?.startDate} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ngày kết thúc (Dự kiến)</label>
                <input name="endDate" type="date" defaultValue={editingProject?.endDate} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tiến độ (%)</label>
                <input name="progress" type="number" min="0" max="100" defaultValue={editingProject?.progress || 0} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mô tả dự án</label>
                <textarea name="description" defaultValue={editingProject?.description} rows={3} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-900" placeholder="Chi tiết về các hạng mục thi công..." />
              </div>

              <div className="md:col-span-2 flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-600 hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-600/30 hover:bg-orange-700 transition-all uppercase tracking-widest text-xs">Lưu dự án</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
