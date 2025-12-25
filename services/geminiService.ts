
import { GoogleGenAI } from "@google/genai";
import { Project, DailyLog, AISettings } from "../types";

// Always use the API key from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_SETTINGS: AISettings = {
  riskAssessment: true,
  resourceOptimization: false,
  progressForecasting: true,
  reportTone: 'professional',
  language: 'vi'
};

function getSettings(): AISettings {
  const saved = localStorage.getItem('phoenix_ai_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

export async function summarizeProjectProgress(project: Project, logs: DailyLog[]): Promise<string> {
  const settings = getSettings();
  
  let focusInstructions = "";
  if (settings.riskAssessment) focusInstructions += "- Đánh giá rủi ro: Xác định các mối nguy về an toàn, pháp lý hoặc tiến độ.\n";
  if (settings.resourceOptimization) focusInstructions += "- Tối ưu hóa nguồn lực: Phân tích hiệu quả sử dụng nhân công và vật tư.\n";
  if (settings.progressForecasting) focusInstructions += "- Dự báo tiến độ: Dự đoán ngày hoàn thành dựa trên tốc độ thi công hiện tại.\n";
  
  const toneDesc = {
    'professional': 'Chuyên nghiệp và đầy đủ',
    'concise': 'Ngắn gọn, đi thẳng vào vấn đề',
    'technical': 'Kỹ thuật sâu, sử dụng thuật ngữ chuyên ngành'
  }[settings.reportTone];

  const prompt = `
    Phân tích tiến độ cho dự án thi công PCCC: "${project.name}".
    Thông tin dự án: ${JSON.stringify(project)}
    Nhật ký gần đây: ${JSON.stringify(logs)}
    
    Yêu cầu báo cáo:
    1. Tổng quan tình trạng hiện tại.
    ${focusInstructions}
    3. Các bước đề xuất tiếp theo cho Quản lý dự án.
    
    Phong cách trình bày: ${toneDesc}.
    Ngôn ngữ: ${settings.language === 'vi' ? 'Tiếng Việt' : 'English'}.
    Hãy trình bày dưới dạng Markdown với các tiêu đề rõ ràng.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Không có tóm tắt.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Lỗi phân tích từ AI. Vui lòng thử lại sau.";
  }
}

export async function generateChecklistItems(projectType: string): Promise<string[]> {
  const prompt = `
    Generate 5 critical PCCC compliance checklist items for a "${projectType}" project based on TCVN standards.
    Return the result as a simple list of tasks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.split('\n').filter(line => line.trim().length > 0) || [];
  } catch (error) {
    return ["Verify system design approval", "Inspect pump room layout", "Test emergency lighting"];
  }
}
