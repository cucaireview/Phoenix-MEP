
import React, { useState, useEffect } from 'react';
import { AISettings } from '../types';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AISettings>({
    riskAssessment: true,
    resourceOptimization: false,
    progressForecasting: true,
    reportTone: 'professional',
    language: 'vi'
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('phoenix_ai_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('phoenix_ai_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleSetting = (key: keyof Pick<AISettings, 'riskAssessment' | 'resourceOptimization' | 'progressForecasting'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cấu hình Hệ thống</h2>
          <p className="text-slate-500 font-medium">Tùy chỉnh trí tuệ nhân tạo và báo cáo của Phoenix MEP.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-orange-600/20 flex items-center gap-2 uppercase text-xs tracking-widest"
        >
          <i className="fas fa-save"></i> Lưu cấu hình
        </button>
      </div>

      {isSaved && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-slideDown">
          <i className="fas fa-check-circle text-xl"></i>
          <p className="font-bold text-sm">Cấu hình đã được lưu thành công vào hệ thống!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI Analysis Section */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-brain"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Phân tích AI</h3>
          </div>
          
          <div className="space-y-6">
            <SettingToggle 
              icon="fa-shield-virus"
              label="Đánh giá Rủi ro"
              description="Xác định các mối nguy tiềm ẩn về an toàn và rào cản pháp lý PCCC."
              active={settings.riskAssessment}
              onClick={() => toggleSetting('riskAssessment')}
            />
            <SettingToggle 
              icon="fa-chart-pie"
              label="Tối ưu hóa Nguồn lực"
              description="Phân tích hiệu quả sử dụng vật tư và nhân công trên công trường."
              active={settings.resourceOptimization}
              onClick={() => toggleSetting('resourceOptimization')}
            />
            <SettingToggle 
              icon="fa-forward"
              label="Dự báo Tiến độ"
              description="Sử dụng dữ liệu lịch sử để dự đoán ngày hoàn thành thực tế."
              active={settings.progressForecasting}
              onClick={() => toggleSetting('progressForecasting')}
            />
          </div>
        </div>

        {/* Reporting Preference */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-file-contract"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Định dạng Báo cáo</h3>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Ngôn ngữ báo cáo AI</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSettings({...settings, language: 'vi'})}
                  className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${settings.language === 'vi' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                >
                  Tiếng Việt
                </button>
                <button 
                  onClick={() => setSettings({...settings, language: 'en'})}
                  className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${settings.language === 'en' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Văn phong báo cáo</label>
              <div className="space-y-3">
                <ToneOption 
                  active={settings.reportTone === 'professional'} 
                  onClick={() => setSettings({...settings, reportTone: 'professional'})}
                  label="Chuyên nghiệp" 
                  desc="Cân bằng giữa chi tiết và sự trang trọng."
                />
                <ToneOption 
                  active={settings.reportTone === 'concise'} 
                  onClick={() => setSettings({...settings, reportTone: 'concise'})}
                  label="Ngắn gọn" 
                  desc="Tập trung vào các con số và hành động cần thiết."
                />
                <ToneOption 
                  active={settings.reportTone === 'technical'} 
                  onClick={() => setSettings({...settings, reportTone: 'technical'})}
                  label="Kỹ thuật" 
                  desc="Phân tích sâu các tiêu chuẩn TCVN và thông số MEP."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{ icon: string, label: string, description: string, active: boolean, onClick: () => void }> = ({ icon, label, description, active, onClick }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-slate-900">{label}</h4>
        <button onClick={onClick} className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-slate-200'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  </div>
);

const ToneOption: React.FC<{ active: boolean, onClick: () => void, label: string, desc: string }> = ({ active, onClick, label, desc }) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border text-left transition-all ${active ? 'bg-white border-orange-500 ring-4 ring-orange-50' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
  >
    <div className="flex items-center gap-3 mb-1">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-orange-600' : 'bg-slate-300'}`}></div>
      <span className="font-bold text-sm text-slate-900">{label}</span>
    </div>
    <p className="text-[10px] text-slate-500 font-medium ml-5">{desc}</p>
  </button>
);

export default SettingsPage;
