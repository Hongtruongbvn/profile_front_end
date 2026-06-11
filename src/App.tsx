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
  Globe,
  Calendar,
  Target,
  Award,
  Briefcase,
  GraduationCap,
  MapPin as MapPinIcon,
  Clock
} from 'lucide-react';

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
  displayContent?: string;
  isTyping?: boolean;
}

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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Welcome messages theo ngôn ngữ
const getWelcomeMessage = (lang: Language): string => {
  if (lang === 'en') {
    return 'Hello! 👋 I am Pham Hong Truong\'s virtual assistant. I am ready to connect and analyze Truong\'s CV. You can ask me about detailed information on projects: Kindergarten, Social Network, Bus Ticket, or learn about exciting side projects like Golang, C# WinForms so I can show you images and videos!';
  }
  return 'Xin chào! 👋 Tôi là trợ lý ảo của Phạm Hồng Trưởng. Tôi đã sẵn sàng kết nối và phân tích toàn bộ CV của anh Trưởng. Bạn có thể hỏi tớ thông tin chi tiết về các dự án: Mầm non, Social Network, Bus Ticket hoặc tìm hiểu về các dự án phụ hấp dẫn như Golang, C# WinForms để tôi trình chiếu hình ảnh và video trực quan nhé!';
  }


// Typing animation hook
const useTypingAnimation = (text: string, isActive: boolean, speed: number = 20) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    if (!text) return;

    setDisplayText('');
    setIsComplete(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isActive, speed]);

  return { displayText, isComplete };
};

export default function App() {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'assistant', 
      content: getWelcomeMessage('vi'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      displayContent: getWelcomeMessage('vi'),
      isTyping: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [corsErrorOccurred, setCorsErrorOccurred] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);

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

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[0] && newMessages[0].id === 1 && newMessages[0].role === 'assistant') {
        newMessages[0] = {
          ...newMessages[0],
          content: getWelcomeMessage(newLang),
          displayContent: getWelcomeMessage(newLang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return newMessages;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    const userMsgId = Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      displayContent: text,
      isTyping: false
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

      const assistantMsgId = Date.now() + 1;
      
      // Add message with typing animation
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: replyContent,
        displayContent: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: true
      }]);
      
      setTypingMessageId(assistantMsgId);
      
      // Start typing animation
      let index = 0;
      const interval = setInterval(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          const msgIndex = newMessages.findIndex(m => m.id === assistantMsgId);
          if (msgIndex !== -1 && newMessages[msgIndex].isTyping) {
            if (index < replyContent.length) {
              newMessages[msgIndex].displayContent = replyContent.substring(0, index + 1);
              index++;
            } else {
              newMessages[msgIndex].isTyping = false;
              newMessages[msgIndex].displayContent = replyContent;
              clearInterval(interval);
              setTypingMessageId(null);
            }
          } else {
            clearInterval(interval);
            setTypingMessageId(null);
          }
          return newMessages;
        });
      }, 15);

    } catch (error: unknown) {
      console.error("Error sending message:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setCorsErrorOccurred(true);
      }

      const errorContent = `❌ ${t.errors.connection} tại: ${backendUrl}.\n\n${t.chat.cors_error_message}\n\`\`\`typescript\nconst app = await NestFactory.create(AppModule);\napp.enableCors();\nawait app.listen(3000);\n\`\`\``;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorContent,
        displayContent: errorContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        isTyping: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeClearChat = () => {
    setMessages([
      { 
        id: 1, 
        role: 'assistant', 
        content: getWelcomeMessage(language),
        displayContent: getWelcomeMessage(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: false
      }
    ]);
    setShowClearConfirm(false);
    setTypingMessageId(null);
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

  // Portfolio Projects Data
  const portfolioProjects = [
    {
      id: 1,
      name: "Bus Ticket Management",
      nameVi: "Bus Ticket Management - Hệ thống Quản lý Bán vé Xe khách",
      period: "12/2025 - 02/2026",
      role: "Backend Developer",
      roleVi: "Backend Developer",
      architecture: "Monorepo",
      description: "Hệ thống vận hành và quản lý xe khách liên tỉnh, đóng vai trò là một nền tảng công nghệ trung gian kết nối các doanh nghiệp vận tải xe khách đến trực tiếp khách hàng để phân phối và bán vé trực tuyến.",
      descriptionEn: "Inter-provincial bus operation and management system, acting as an intermediary technology platform connecting bus transport enterprises directly to customers for online ticket distribution and sales.",
      features: [
        "Hỗ trợ quy trình bán vé trực tuyến và chọn vị trí ghế ngồi trực quan",
        "Quản lý thông tin phương tiện, tài xế, tối ưu hóa điều phối tuyến đường và lịch chạy",
        "Kiểm soát doanh thu thời gian thực và tự động hóa hệ thống phân bổ hoa hồng"
      ],
      featuresEn: [
        "Online ticket sales process with intuitive seat selection",
        "Vehicle and driver management, route optimization and schedule coordination",
        "Real-time revenue control and automated commission distribution system"
      ],
      tech: ["NestJS", "TypeScript", "MongoDB", "React", "React Native"],
      github: "https://github.com/Hongtruongbvn/bus_ticket-.git"
    },
    {
      id: 2,
      name: "Social Network",
      nameVi: "Social Network - Mạng xã hội đa nền tảng",
      period: "05/2025 - 10/2025",
      role: "Team Leader",
      roleVi: "Team Leader",
      architecture: "Microservices",
      description: "Ứng dụng mạng xã hội tương tác thế hệ mới cho phép người dùng chia sẻ các hoạt động thường ngày, giao lưu trực tuyến và xây dựng các bang hội, nhóm cộng đồng có cùng chung sở thích. Dự án là sự kết hợp các tính năng tương tác nổi bật của Facebook và Discord.",
      descriptionEn: "Next-generation interactive social media application allowing users to share daily activities, interact online, and build guilds and community groups with shared interests. The project combines prominent interactive features of Facebook and Discord.",
      features: [
        "Thiết kế bảng tin động để đăng tải trạng thái, chia sẻ hình ảnh và tương tác",
        "Phát triển các phòng trò chuyện nhóm đa kênh hỗ trợ Voice Chat và nhắn tin realtime",
        "Triển khai hệ thống phân quyền vai trò chặt chẽ trong các bang hội cộng đồng"
      ],
      featuresEn: [
        "Dynamic newsfeed design for posting status, sharing images and interactions",
        "Multi-channel group chat rooms with Voice Chat and real-time messaging",
        "Strict role-based permission system within community guilds"
      ],
      tech: ["NestJS", "MongoDB", "React", "React Native", "WebSocket"],
      backendGit: "https://github.com/Hongtruongbvn/socal-media-backend",
      frontendGit: "https://github.com/Hongtruongbvn/socal-media-frontend",
      backendApi: "https://socal-media-backend-qh5r.onrender.com/api",
      frontendDemo: "https://socal-media-frontend.vercel.app"
    },
    {
      id: 3,
      name: "Kindergarten Management",
      nameVi: "Kindergarten Management - Hệ thống Quản lý Trường Mầm non",
      period: "11/2024 - 01/2025",
      role: "Team Leader",
      roleVi: "Team Leader",
      architecture: "MVC",
      description: "Hệ thống quản trị số trường mầm non toàn diện, số hóa các hoạt động thường nhật bao gồm quản lý thời khóa biểu, giáo viên, cơ sở vật chất và hồ sơ học sinh.",
      descriptionEn: "Comprehensive digital kindergarten management system, digitizing daily activities including schedule management, teachers, facilities and student records.",
      features: [
        "Cắt giảm hoàn toàn thủ tục giấy tờ hành chính và tối ưu hiệu suất quản lý lớp học",
        "Tăng cường tính kết nối giữa nhà trường và gia đình nhờ tích hợp camera giám sát trực tiếp",
        "Đơn giản hóa tài chính trường học với cổng thanh toán học phí online"
      ],
      featuresEn: [
        "Complete elimination of administrative paperwork and optimized classroom management",
        "Enhanced school-family connectivity through live CCTV integration",
        "Simplified school finances with online tuition payment gateway"
      ],
      tech: ["Laravel", "PHP", "MySQL", "Bootstrap"],
      github: "https://github.com/Hongtruongbvn/quan_ly_truong_mam_non",
      demo: "https://quan-ly-truong-mam-non.onrender.com",
      credentials: {
        admin: { username: "0987654321", password: "12345678" },
        teacher: { email: "teacher0@nursery.com", password: "12345678" },
        parent: { email: "parent0@gmail.com", password: "12345678" }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans antialiased overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-6xl h-screen sm:h-[780px] bg-slate-900/40 backdrop-blur-xl sm:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar - Updated with Portfolio Section */}
        <div className="w-full md:w-[380px] bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="p-5 space-y-5 flex-1">
            
            {/* Profile Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-lg shadow-indigo-500/20">
                    <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-xl text-indigo-400">
                      PT
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Phạm Hồng Trưởng</h3>
                  <p className="text-[10px] text-indigo-400 font-medium tracking-wide flex items-center gap-1">
                    <Briefcase size={10} />
                    Fullstack Web / Mobile Developer
                  </p>
                  <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <GraduationCap size={9} />
                    VTC Academy - Fullstack Development
                  </p>
                </div>
              </div>
              
              {/* Contact Info Short */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/40 rounded-xl p-2.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Phone size={10} />
                  <span>0931266543</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 truncate">
                  <Mail size={10} />
                  <span className="truncate">truongtruongbvn@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPinIcon size={10} />
                  <span>TP. Hồ Chí Minh</span>
                </div>
                <a href="https://github.com/Hongtruongbvn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors">
                  <GithubIcon size={10} />
                  <span>github/Hongtruongbvn</span>
                </a>
              </div>
            </div>

            {/* Portfolio Projects Section - NEW */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-amber-500" />
                <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                  {language === 'vi' ? 'TỔNG HỢP HỒ SƠ DỰ ÁN CÁ NHÂN' : 'PORTFOLIO PROJECTS'}
                </span>
              </div>
              
              <div className="space-y-4">
                {portfolioProjects.map((project) => (
                  <div key={project.id} className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 rounded-xl border border-slate-800 overflow-hidden hover:border-indigo-800/50 transition-all">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/40">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-indigo-400">
                            {language === 'vi' ? project.nameVi : project.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                            <Clock size={8} />
                            <span>{project.period}</span>
                            <span>•</span>
                            <span>{language === 'vi' ? project.roleVi : project.role}</span>
                          </div>
                        </div>
                        {project.architecture && (
                          <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                            {project.architecture}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {language === 'vi' ? project.description : (project.descriptionEn || project.description)}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {project.tech.map((tech, idx) => (
                          <span key={idx} className="text-[8px] bg-indigo-950/50 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-800/30">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-indigo-400 transition-colors">
                            <GithubIcon size={9} />
                            <span>Git</span>
                          </a>
                        )}
                        {project.backendGit && (
                          <a href={project.backendGit} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-indigo-400 transition-colors">
                            <Code size={9} />
                            <span>BE</span>
                          </a>
                        )}
                        {project.frontendGit && (
                          <a href={project.frontendGit} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-indigo-400 transition-colors">
                            <Layers size={9} />
                            <span>FE</span>
                          </a>
                        )}
                        {project.demo && (
                          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors">
                            <ExternalLink size={9} />
                            <span>Demo</span>
                          </a>
                        )}
                        {project.frontendDemo && (
                          <a href={project.frontendDemo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Globe size={9} />
                            <span>Web Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                <Code size={10} />
                {t.sidebar.skills_title}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['NestJS', 'Laravel', 'React', 'React Native', 'Flutter', 'MySQL', 'MongoDB', 'Docker', 'Git', 'WebSocket'].map((skill, index) => (
                  <span key={index} className="bg-slate-900 border border-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* CV Download */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{t.sidebar.attachments_title}</span>
              <a 
                href={downloadCvUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-900/20 to-indigo-900/20 hover:from-cyan-900/40 hover:to-indigo-900/40 border border-cyan-500/10 hover:border-cyan-500/30 transition-all text-cyan-300 group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileText size={14} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-semibold block text-slate-200">CV_PhamHongTruong.pdf</span>
                  </div>
                </div>
                <Download size={12} className="text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Side Projects */}
            <div className="space-y-2 bg-slate-900/20 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                <Layers size={10} />
                {t.sidebar.side_projects}
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[9px] font-semibold text-indigo-400 block">{t.sidebar.golang_section}</span>
                  <div className="flex flex-wrap gap-1.5 pl-1.5 border-l border-indigo-500/30 mt-1">
                    <a href="https://github.com/Hongtruongbvn/back-devop" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={8} /> DevOps Go
                    </a>
                    <a href="https://github.com/Hongtruongbvn/goalnd_24-05_be" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={8} /> Go Base
                    </a>
                    <a href="https://github.com/Hongtruongbvn/goalnd_final_be" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                      <Code size={8} /> Go Final
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-emerald-400 block">{t.sidebar.winform_section}</span>
                  <div className="pl-1.5 border-l border-emerald-500/30 mt-1">
                    <a href="https://github.com/truongbvnedu/Child_MNG" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-400 hover:text-emerald-300 flex items-center gap-1">
                      <Layers size={8} /> Child Management
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-900">
              <Info size={10} />
              <span>{t.app.powered_by}</span>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative">
          
          {/* Header */}
          <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-[2px] shadow-lg shadow-indigo-500/10">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-indigo-400">
                    <Bot size={18} className="animate-pulse" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-slate-100 text-sm">{t.app.title}</h1>
                  <span className="bg-indigo-900/40 border border-indigo-700/50 text-[9px] text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Sparkles size={9} />
                    Gemini
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  {t.app.online}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLanguageChange(language === 'vi' ? 'en' : 'vi')}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-1"
                title={language === 'vi' ? 'English' : 'Tiếng Việt'}
              >
                <Globe size={14} />
                <span className="text-[10px] font-medium hidden sm:inline">
                  {language === 'vi' ? 'EN' : 'VI'}
                </span>
              </button>
              
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-all"
                title={t.buttons.clear_chat}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg) => {
              const displayText = msg.displayContent !== undefined ? msg.displayContent : msg.content;
              const hasDownloadLink = msg.content.includes(downloadCvUrl);
              const { cleanText, mediaUrls, actionLinks } = parseMessageContent(displayText);
              const showMediaSection = msg.role === 'assistant' && msg.id !== 1 && !msg.isError;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    msg.role === 'user' 
                      ? 'bg-slate-800 border-slate-700 text-slate-300' 
                      : msg.isError 
                        ? 'bg-red-900/30 border-red-700/50 text-red-400'
                        : 'bg-indigo-900/30 border-indigo-700/50 text-indigo-400'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className="space-y-1 flex-1 max-w-full font-sans">
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                        : msg.isError
                          ? 'bg-red-950/50 border border-red-900/40 text-red-200 rounded-tl-none'
                          : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      
                      {cleanText}
                      
                      {msg.isTyping && (
                        <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-pulse ml-0.5 align-middle"></span>
                      )}

                      {showMediaSection && (mediaUrls.length > 0 || actionLinks.length > 0) && !msg.isTyping && (
                        <DynamicMediaBox mediaUrls={mediaUrls} actionLinks={actionLinks} />
                      )}

                      {msg.role === 'assistant' && hasDownloadLink && !msg.isError && !msg.isTyping && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80">
                          <a 
                            href={downloadCvUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-lg shadow-indigo-600/10 transition-all border border-indigo-500/30 group animate-pulse"
                          >
                            <FileText size={12} />
                            <span>{t.buttons.download_cv}</span>
                            <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className={`text-[9px] text-slate-500 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && typingMessageId === null && (
              <div className="flex gap-3 max-w-[80%] mr-auto font-sans">
                <div className="w-7 h-7 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-400 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="space-y-1">
                  <div className="bg-slate-900/95 border border-slate-800 p-3 px-5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            {corsErrorOccurred && (
              <div className="bg-amber-950/40 border border-amber-900/40 p-3 rounded-xl flex items-start gap-2 max-w-[90%] mx-auto mt-2 font-sans">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-[11px] text-amber-200 leading-relaxed">
                  <strong className="block text-amber-300 font-semibold mb-1">{t.chat.cors_error_title}</strong>
                  {t.chat.cors_error_message}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-900 font-sans">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="flex-shrink-0 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-full transition-all flex items-center gap-1"
                >
                  <span>{q}</span>
                  <ChevronRight size={10} className="opacity-50" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-950 border-t border-slate-900 font-sans">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-xl p-1 transition-all"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t.chat.placeholder}
                className="flex-1 bg-transparent border-transparent px-3 py-1.5 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 p-2 rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-md shadow-indigo-600/15"
              >
                <Send size={14} />
              </button>
            </form>
            <p className="text-[9px] text-slate-500 text-center mt-2">
              {t.chat.footer_note}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
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

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl max-w-sm w-full space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <Trash2 className="text-red-400" size={18} />
                {t.chat.clear_confirm_title}
              </h3>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.chat.clear_confirm_message}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold transition-all"
              >
                {t.chat.cancel}
              </button>
              <button 
                onClick={executeClearChat}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-semibold transition-all"
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