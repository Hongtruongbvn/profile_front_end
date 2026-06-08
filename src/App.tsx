import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  AlertTriangle,
  Mail,
  ChevronRight,
  Info,
  X,
  FileText,
  Download,
  Phone,
  MapPin,
  ExternalLink,
  Maximize2,
  Layers,
  Code,
  Globe
} from 'lucide-react';

// Import i18n
import viTranslations from './locales/vi.json';
import enTranslations from './locales/en.json';

type Language = 'vi' | 'en';

const translations = {
  vi: viTranslations,
  en: enTranslations
};

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

// Cập nhật câu hỏi gợi ý theo ngôn ngữ
const getSuggestedQuestions = (lang: Language): string[] => {
  if (lang === 'en') {
    return [
      "Who are you?",
      "Do you have any Golang or Winform projects?",
      "Show me Kindergarten project details",
      "Show images and videos of Social Network project"
    ];
  }
  return [
    "Bạn là ai?",
    "Bạn có dự án nhỏ hay dự án Golang, Winform nào không?",
    "Cho mình xem chi tiết dự án Mầm non",
    "Trình chiếu ảnh và video dự án Social Network"
  ];
};

// Hàm escape ký tự đặc biệt
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function App() {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'assistant', 
      content: language === 'vi' 
        ? 'Xin chào! 👋 Tôi là trợ lý ảo của Phạm Hồng Trưởng. Tôi đã sẵn sàng kết nối và phân tích toàn bộ CV của anh Trưởng. Bạn có thể hỏi tớ thông tin chi tiết về các dự án: Mầm non, Social Network, Bus Ticket hoặc tìm hiểu về các dự án phụ hấp dẫn như Golang, C# WinForms để tôi trình chiếu hình ảnh và video trực quan nhé!'
        : 'Hello! 👋 I am Pham Hong Truong\'s virtual assistant. I am ready to connect and analyze Truong\'s CV. You can ask me about detailed information on projects: Kindergarten, Social Network, Bus Ticket, or learn about exciting side projects like Golang, C# WinForms so I can show you images and videos!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [corsErrorOccurred, setCorsErrorOccurred] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const BACKEND_BASE = 'https://profile-back.truongbvn.online';
  const downloadCvUrl = `${BACKEND_BASE}/public/CV_PhamHongTruong.pdf`;
  const backendUrl = `${BACKEND_BASE}/chat`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Xử lý chuyển đổi ngôn ngữ
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    // Có thể thêm logic gửi lại tin nhắn welcome mới nếu cần
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    const userMsgId = Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    setCorsErrorOccurred(false);

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.reply || data.answer || "No valid response from backend.";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error: unknown) {
      console.error("Error sending message:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setCorsErrorOccurred(true);
      }

      // FIXED: Properly escape template literal with backticks in error message
      const errorContent = `❌ ${t.errors.connection} tại: ${backendUrl}.\n\n${t.chat.cors_error_message}\n\`\`\`typescript\nconst app = await NestFactory.create(AppModule);\napp.enableCors();\nawait app.listen(3000);\n\`\`\``;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeClearChat = () => {
    const welcomeMessage = language === 'vi'
      ? 'Lịch sử trò chuyện đã được xóa thành công. Tôi đã sẵn sàng nhận các câu hỏi mới từ bạn! ✨'
      : 'Chat history has been cleared successfully. I am ready to receive new questions from you! ✨';
    
    setMessages([
      { 
        id: 1, 
        role: 'assistant', 
        content: welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowClearConfirm(false);
  };

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
    const lowercaseUrl = url.toLowerCase();
    const isVideo = videoExtensions.some(ext => lowercaseUrl.endsWith(ext) || lowercaseUrl.includes('.mp4') || lowercaseUrl.includes('type=video'));
    return isVideo ? 'video' : 'image';
  };

  const parseMessageContent = (text: string) => {
    const mediaRegex = /(https?:\/\/[^\s"'<>\(\)]+\.(?:png|jpg|jpeg|gif|webp|bmp|svg|ico|mp4|webm|ogg|mov|m4v|avi|mkv)[^\s"'<>\(\)]*)/gi;
    const urls: string[] = text.match(mediaRegex) || [];
    
    const generalUrlRegex = /(https?:\/\/(?:github\.com|quan-ly-truong-mam-non|socal-media|vercel|onrender\.com)[^\s"'<>\(\)]*)/gi;
    const rawActionLinks: string[] = text.match(generalUrlRegex) || [];
    
    const actionLinks: string[] = rawActionLinks.filter((link: string) => !urls.includes(link) && !link.includes('CV_PhamHongTruong.pdf'));

    let cleanText = text;
    
    urls.forEach((url: string) => {
      const markdownRegex = new RegExp(`\\!?\\[[^\\]]*\\]\\(${escapeRegExp(url)}\\)`, 'gi');
      cleanText = cleanText.replace(markdownRegex, '');
      cleanText = cleanText.replace(new RegExp(escapeRegExp(url), 'g'), '');
    });

    actionLinks.forEach((link: string) => {
      const markdownRegex = new RegExp(`\\[[^\\]]*\\]\\(${escapeRegExp(link)}\\)`, 'gi');
      cleanText = cleanText.replace(markdownRegex, '');
      cleanText = cleanText.replace(new RegExp(escapeRegExp(link), 'g'), '');
    });

    cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

    return {
      cleanText,
      mediaUrls: Array.from(new Set(urls)),
      actionLinks: Array.from(new Set(actionLinks))
    };
  };

  const DynamicMediaBox: React.FC<{ mediaUrls: string[]; actionLinks: string[] }> = ({ mediaUrls, actionLinks }) => {
    if (mediaUrls.length === 0 && actionLinks.length === 0) return null;

    const getGridCols = (count: number) => {
      if (count === 1) return 'grid-cols-1 max-w-md mx-auto';
      if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
      if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return (
      <div className="mt-4 border border-slate-800 bg-slate-950/90 rounded-2xl overflow-hidden shadow-xl transition-all w-full flex flex-col">
        
        {mediaUrls.length > 0 && (
          <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {t.media.gallery_header}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded">
              {mediaUrls.length} {t.media.files_count}
            </span>
          </div>
        )}

        {mediaUrls.length > 0 && (
          <div className={`p-3 bg-slate-950 grid ${getGridCols(mediaUrls.length)} gap-3 border-b border-slate-900`}>
            {mediaUrls.map((url, index) => {
              const type = getMediaType(url);
              return (
                <div 
                  key={index} 
                  className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group flex items-center justify-center"
                >
                  {type === 'video' ? (
                    <video 
                      src={url}
                      controls
                      autoPlay={false}
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={url} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error(`Failed to load image: ${url}`);
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                  <button 
                    onClick={() => setLightboxMedia({ url, type })}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/75 border border-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    title={t.media.zoom}
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {actionLinks.length > 0 && (
          <div className="p-2.5 bg-slate-900/40 flex flex-wrap gap-2 justify-end">
            {actionLinks.map((link, index) => {
              const isGithub = link.includes('github.com');
              const isFrontendGit = link.includes('frontend');
              const isBackendGit = link.includes('backend');

              let buttonText = t.buttons.source_code;
              if (isFrontendGit) buttonText = t.buttons.frontend_git;
              if (isBackendGit) buttonText = t.buttons.backend_git;
              if (!isGithub) buttonText = t.buttons.run_demo;

              return (
                <a 
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isGithub 
                      ? 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30 shadow-md shadow-indigo-600/10'
                  }`}
                >
                  {isGithub ? (
                    <>
                      <GithubIcon size={13} />
                      <span>{buttonText}</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink size={13} />
                      <span>{buttonText}</span>
                    </>
                  )}
                </a>
              );
            })}
          </div>
        )}

      </div>
    );
  };

  const suggestedQuestions = getSuggestedQuestions(language);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans antialiased overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-6xl h-screen sm:h-[780px] bg-slate-900/40 backdrop-blur-xl sm:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-full md:w-[350px] bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-lg text-indigo-400">
                    PT
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Phạm Hồng Trưởng</h3>
                  <p className="text-[11px] text-slate-400 font-medium tracking-wide">{t.sidebar.student_info}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                {t.sidebar.bio}
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">{t.sidebar.skills_title}</span>
              <div className="flex flex-wrap gap-1.5">
                {['NestJS', 'Laravel', 'React', 'React Native', 'Flutter', 'MySQL', 'MongoDB', 'Docker', 'Git'].map((skill, index) => (
                  <span key={index} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{t.sidebar.attachments_title}</span>
              <a 
                href={downloadCvUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-900/20 to-indigo-900/20 hover:from-cyan-900/40 hover:to-indigo-900/40 border border-cyan-500/10 hover:border-cyan-500/30 transition-all text-cyan-300 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold block text-slate-200">{t.sidebar.cv_name}</span>
                    <span className="text-[10px] text-slate-400 block">{t.sidebar.cv_description}</span>
                  </div>
                </div>
                <Download size={14} className="text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="space-y-2.5 bg-slate-900/20 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">{t.sidebar.side_projects}</span>
              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-indigo-400 block">{t.sidebar.golang_section}</span>
                  <div className="flex flex-col gap-1 pl-2 border-l border-indigo-500/30">
                    <a href="https://github.com/Hongtruongbvn/back-devop" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={12} /> DevOps Go <ExternalLink size={10} />
                    </a>
                    <a href="https://github.com/Hongtruongbvn/goalnd_24-05_be" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={12} /> Go Base BE <ExternalLink size={10} />
                    </a>
                    <a href="https://github.com/Hongtruongbvn/goalnd_final_be" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={12} /> Go Final BE <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-emerald-400 block">{t.sidebar.winform_section}</span>
                  <div className="flex flex-col gap-1 pl-2 border-l border-emerald-500/30">
                    <a href="https://github.com/truongbvnedu/Child_MNG" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-300 flex items-center gap-1">
                      <Layers size={12} /> Child Management <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">{t.sidebar.contact_title}</span>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-slate-500" />
                  <span>0931266543</span>
                </div>
                <a 
                  href="mailto:truongtruongbvn@gmail.com" 
                  className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors group"
                >
                  <Mail size={14} className="text-slate-500 group-hover:text-indigo-400" />
                  <span className="truncate">truongtruongbvn@gmail.com</span>
                </a>
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>Ho Chi Minh City, Vietnam</span>
                </div>
                <a 
                  href="https://github.com/Hongtruongbvn" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2.5 hover:text-indigo-400 transition-colors group"
                >
                  <GithubIcon size={14} className="text-slate-500 group-hover:text-indigo-400" />
                  <span className="truncate">github.com/Hongtruongbvn</span>
                </a>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-4 border-t border-slate-900 font-sans">
            <Info size={12} />
            <span>{t.app.powered_by}</span>
          </div>
        </div>

        {/* Chat chính */}
        <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative">
          
          <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-[2px] shadow-lg shadow-indigo-500/10">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-indigo-400">
                    <Bot size={20} className="animate-pulse" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-100 text-sm">{t.app.title}</h1>
                  <span className="bg-indigo-900/40 border border-indigo-700/50 text-[10px] text-indigo-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Sparkles size={10} />
                    Gemini Active
                  </span>
                </div>
                <p className="text-xs text-emerald-400/80 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {t.app.online}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút chuyển đổi ngôn ngữ */}
              <button
                onClick={() => handleLanguageChange(language === 'vi' ? 'en' : 'vi')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-1.5"
                title={language === 'vi' ? 'English' : 'Tiếng Việt'}
              >
                <Globe size={16} />
                <span className="text-xs font-medium hidden sm:inline">
                  {language === 'vi' ? 'EN' : 'VI'}
                </span>
              </button>
              
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-all"
                title={t.buttons.clear_chat}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg) => {
              const hasDownloadLink = msg.content.includes(downloadCvUrl);
              const { cleanText, mediaUrls, actionLinks } = parseMessageContent(msg.content);
              const showMediaSection = msg.role === 'assistant' && msg.id !== 1 && !msg.isError;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 border-slate-700 text-slate-300' 
                      : msg.isError 
                        ? 'bg-red-900/30 border-red-700/50 text-red-400'
                        : 'bg-indigo-900/30 border-indigo-700/50 text-indigo-400'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className="space-y-1.5 flex-1 max-w-full font-sans">
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                        : msg.isError
                          ? 'bg-red-950/50 border border-red-900/40 text-red-200 rounded-tl-none'
                          : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      
                      {cleanText}

                      {showMediaSection && (mediaUrls.length > 0 || actionLinks.length > 0) && (
                        <DynamicMediaBox mediaUrls={mediaUrls} actionLinks={actionLinks} />
                      )}

                      {msg.role === 'assistant' && hasDownloadLink && !msg.isError && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80">
                          <a 
                            href={downloadCvUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all border border-indigo-500/30 group animate-pulse"
                          >
                            <FileText size={14} />
                            <span>{t.buttons.download_cv}</span>
                            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className={`text-[10px] text-slate-500 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto font-sans">
                <div className="w-8 h-8 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-400 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="space-y-1">
                  <div className="bg-slate-900/95 border border-slate-800 p-3.5 px-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            {corsErrorOccurred && (
              <div className="bg-amber-950/40 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3 max-w-[90%] mx-auto mt-2 font-sans">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <strong className="block text-amber-300 font-semibold mb-1">{t.chat.cors_error_title}</strong>
                  {t.chat.cors_error_message}
                  <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] mt-2 text-slate-300 font-mono">
                    {`const app = await NestFactory.create(AppModule);\napp.enableCors();\nawait app.listen(3000);`}
                  </pre>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-900 font-sans">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-indigo-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                >
                  <span>{q}</span>
                  <ChevronRight size={12} className="opacity-50" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-900 font-sans">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-2xl p-1.5 transition-all"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t.chat.placeholder}
                className="flex-1 bg-transparent border-transparent px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 p-2.5 rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-md shadow-indigo-600/15"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-[10px] text-slate-500 text-center mt-2.5">
              {t.chat.footer_note}
            </p>
          </div>
        </div>
      </div>

      {lightboxMedia && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 font-sans"
          onClick={() => setLightboxMedia(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white"
            onClick={() => setLightboxMedia(null)}
          >
            <X size={20} />
          </button>
          
          {lightboxMedia.type === 'video' ? (
            <video 
              src={lightboxMedia.url} 
              controls 
              autoPlay 
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={lightboxMedia.url} 
              alt="" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Trash2 className="text-red-400" size={20} />
                {t.chat.clear_confirm_title}
              </h3>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.chat.clear_confirm_message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                {t.chat.cancel}
              </button>
              <button 
                onClick={executeClearChat}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all"
              >
                {t.chat.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
