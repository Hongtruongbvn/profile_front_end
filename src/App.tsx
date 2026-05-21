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
  ChevronLeft,
  Maximize2,
  Eye,
  Layers,
  Code
} from 'lucide-react';

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

interface ProjectImage {
  url: string;
  title: string;
  fallbackSvg: React.ReactNode;
}

interface ProjectDetail {
  id: string;
  name: string;
  githubUrl: string;
  deployUrl?: string;
  githubBackendUrl?: string;
  githubFrontendUrl?: string;
  images: ProjectImage[];
}

const SUGGESTED_QUESTIONS: string[] = [
  "Bạn là ai?",
  "Cho mình xem chi tiết dự án Mầm non",
  "Trình chiếu ảnh dự án Social Network",
  "Dự án Bus Ticket có giao diện như thế nào?"
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      role: 'assistant', 
      content: 'Xin chào! 👋 Tôi là trợ lý ảo của Phạm Hồng Trưởng. Tôi đã sẵn sàng kết nối và phân tích toàn bộ CV của anh Trưởng. Bạn có thể hỏi tớ thông tin chi tiết về 3 dự án lớn: Mầm non, Social Network, Bus Ticket hoặc gõ "bạn là ai" để tôi trình chiếu ảnh giao diện và chân dung thực tế cho bạn xem nhé!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [corsErrorOccurred, setCorsErrorOccurred] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  
  // Trạng thái Lightbox phóng to ảnh
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Cấu hình URL cơ sở kết nối Backend trên Render mới của bạn
  const BACKEND_BASE = 'https://profile-back-end.onrender.com';
  const downloadCvUrl = `${BACKEND_BASE}/public/CV_PhamHongTruong.pdf`;
  const backendUrl = `${BACKEND_BASE}/chat`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        throw new Error(`Lỗi kết nối HTTP! Trạng thái: ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.reply || data.answer || "Không nhận được phản hồi phù hợp từ Backend.";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error: unknown) {
      console.error("Lỗi gửi tin nhắn:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        setCorsErrorOccurred(true);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Không thể kết nối với máy chủ Backend tại: ${backendUrl}.\n\nHãy đảm bảo máy chủ NestJS đã được triển khai hoạt động ổn định và được kích hoạt CORS (app.enableCors()).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
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
        content: 'Lịch sử trò chuyện đã được xóa thành công. Hãy đặt câu hỏi tiếp theo cho tôi nhé! ✨',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setShowClearConfirm(false);
  };

  // Cấu trúc quản lý danh sách ảnh động không giới hạn số lượng ảnh
  const PROJECTS_DATA: Record<string, ProjectDetail> = {
    project1: {
      id: 'project1',
      name: 'Kindergarten Management (Quản lý trường mầm non)',
      githubUrl: 'https://github.com/Hongtruongbvn/quan_ly_truong_mam_non',
      deployUrl: 'https://quan-ly-truong-mam-non.onrender.com/',
      images: [
        {
          url: `${BACKEND_BASE}/public/project1/1.png`,
          title: 'Bảng Điều Khiển Quản Trị (Admin Dashboard)',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-pink-900/40 to-rose-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Layers className="w-10 h-10 text-rose-400 mb-3 animate-pulse" />
              <span className="text-xs font-bold text-rose-200">Kindergarten Admin Dashboard</span>
              <span className="text-[10px] text-rose-400/80 mt-1.5 leading-relaxed">Hệ thống quản lý thời khóa biểu, tài chính, giáo viên và học sinh trực quan</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project1/2.png`,
          title: 'Hồ Sơ Chi Tiết Học Sinh & Giáo Viên',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-orange-900/40 to-amber-900/40 flex flex-col items-center justify-center p-6 text-center">
              <User className="w-10 h-10 text-amber-400 mb-3" />
              <span className="text-xs font-bold text-amber-200">Student & Teacher Profiles</span>
              <span className="text-[10px] text-amber-400/80 mt-1.5 leading-relaxed">Giám sát điểm danh, sức khỏe học sinh và phân chia lớp học</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project1/3.png`,
          title: 'Cổng Live Camera & Thanh Toán Học Phí Trực Tuyến',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-red-900/40 to-pink-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Eye className="w-10 h-10 text-pink-400 mb-3" />
              <span className="text-xs font-bold text-pink-200">Live Camera Monitor</span>
              <span className="text-[10px] text-pink-400/80 mt-1.5 leading-relaxed">Tích hợp camera giám sát trực tiếp dành cho phụ huynh và cổng học phí</span>
            </div>
          )
        }
      ]
    },
    project2: {
      id: 'project2',
      name: 'Social Network (Mạng xã hội đa nền tảng)',
      githubUrl: 'https://github.com/Hongtruongbvn/socal-media-backend',
      githubBackendUrl: 'https://github.com/Hongtruongbvn/socal-media-backend',
      githubFrontendUrl: 'https://github.com/Hongtruongbvn/socal-media-frontend',
      deployUrl: 'https://socal-media-frontend.vercel.app/',
      images: [
        {
          url: `${BACKEND_BASE}/public/project2/1.png`,
          title: 'Giao Diện Bảng Tin Hoạt Động (Social Newsfeed)',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-blue-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-10 h-10 text-indigo-400 mb-3" />
              <span className="text-xs font-bold text-indigo-200">Interactive Newsfeed</span>
              <span className="text-[10px] text-indigo-400/80 mt-1.5 leading-relaxed">Chia sẻ bài viết, thả cảm xúc, bình luận cập nhật thời gian thực</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project2/2.png`,
          title: 'Hệ Thống Phòng Chat Nhóm Đa Kênh (Discord Style)',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Bot className="w-10 h-10 text-purple-400 mb-3" />
              <span className="text-xs font-bold text-purple-200">Bilingual Group Chat channels</span>
              <span className="text-[10px] text-purple-400/80 mt-1.5 leading-relaxed">Xử lý phòng chat voice và chat văn bản theo thời gian thực (Websocket)</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project2/3.png`,
          title: 'Giao Diện Thiết Bị Di Động (React Native Client)',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-cyan-900/40 to-blue-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Phone className="w-10 h-10 text-cyan-400 mb-3" />
              <span className="text-xs font-bold text-cyan-200">Native Mobile Client UX</span>
              <span className="text-[10px] text-cyan-400/80 mt-1.5 leading-relaxed">Khả năng hoạt động tối ưu đa nền tảng với hiệu năng bản xứ mượt mà</span>
            </div>
          )
        }
      ]
    },
    project3: {
      id: 'project3',
      name: 'Bus Ticket Management (Hệ thống bán vé xe khách)',
      githubUrl: 'https://github.com/Hongtruongbvn/bus_ticket-.git',
      images: [
        {
          url: `${BACKEND_BASE}/public/project3/1.png`,
          title: 'Giao Diện Đặt Vé & Bản Đồ Sơ Đồ Chọn Ghế Trực Quan',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-emerald-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Layers className="w-10 h-10 text-teal-400 mb-3" />
              <span className="text-xs font-bold text-teal-200">Interactive Seat Selection</span>
              <span className="text-[10px] text-teal-400/80 mt-1.5 leading-relaxed">Chọn chỗ ngồi trực quan, áp dụng mã giảm giá và tính toán biểu phí</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project3/2.png`,
          title: 'Hệ Thống Phân Lộ Trình & Điều Phối Tài Xế',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 to-green-900/40 flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="w-10 h-10 text-emerald-400 mb-3" />
              <span className="text-xs font-bold text-emerald-200">Route Scheduling & Dispatch</span>
              <span className="text-[10px] text-emerald-400/80 mt-1.5 leading-relaxed">Vận hành xe khách liên tỉnh, định vị vị trí xe và phân chia lịch trực tài xế</span>
            </div>
          )
        },
        {
          url: `${BACKEND_BASE}/public/project3/3.png`,
          title: 'Biểu Đồ Doanh Thu & Hệ Thống Tự Động Chia Hoa Hồng',
          fallbackSvg: (
            <div className="w-full h-full bg-gradient-to-br from-cyan-900/40 to-emerald-900/40 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-10 h-10 text-cyan-400 mb-3" />
              <span className="text-xs font-bold text-cyan-200">Revenue Analytics Report</span>
              <span className="text-[10px] text-cyan-400/80 mt-1.5 leading-relaxed">Báo cáo doanh số bán vé, dòng tiền hoa hồng tự động phân phối nhà xe</span>
            </div>
          )
        }
      ]
    }
  };

  // Component Live Box nâng cấp: Trình chiếu ảnh động, margin chuẩn, nút chuyển trang trực tiếp
  const LiveBox: React.FC<{ projectId: string }> = ({ projectId }) => {
    const project = PROJECTS_DATA[projectId];
    if (!project || !project.images || project.images.length === 0) return null;

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [imageStates, setImageStates] = useState<Record<number, 'success' | 'error'>>({});

    const handleImageLoad = (index: number) => {
      setImageStates(prev => ({ ...prev, [index]: 'success' }));
    };

    const handleImageError = (index: number) => {
      setImageStates(prev => ({ ...prev, [index]: 'error' }));
    };

    const nextSlide = () => {
      setActiveIndex((prev) => (prev + 1) % project.images.length);
    };

    const prevSlide = () => {
      setActiveIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    const currentImage = project.images[activeIndex];
    const isError = imageStates[activeIndex] === 'error';

    return (
      <div className="my-4 border border-slate-800 bg-slate-950/80 rounded-2xl overflow-hidden shadow-xl transition-all max-w-lg w-full flex flex-col">
        {/* Header Live Box */}
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Demo: {project.name}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded">
            {activeIndex + 1} / {project.images.length}
          </span>
        </div>

        {/* Khung chứa ảnh / Fallback */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden group border-b border-slate-900">
          <button 
            onClick={prevSlide}
            className="absolute left-3 z-10 p-2 rounded-full bg-black/75 border border-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronLeft size={16} />
          </button>

          {isError ? (
            currentImage.fallbackSvg
          ) : (
            <>
              <img 
                src={currentImage.url} 
                alt={currentImage.title}
                onLoad={() => handleImageLoad(activeIndex)}
                onError={() => handleImageError(activeIndex)}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <button 
                onClick={() => {
                  setLightboxImage(currentImage.url);
                  setLightboxTitle(currentImage.title);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/75 border border-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                title="Phóng to ảnh"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}

          <button 
            onClick={nextSlide}
            className="absolute right-3 z-10 p-2 rounded-full bg-black/75 border border-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Mô tả chi tiết */}
        <div className="p-3.5 bg-slate-950/40 flex items-start gap-2.5 border-b border-slate-900/50">
          <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {currentImage.title}
          </p>
        </div>

        {/* HÀNH ĐỘNG GẮN LINK TRỰC TIẾP (ẤN LÀ CHUYỂN TRANG NGAY) */}
        <div className="p-3 bg-slate-900/40 flex flex-wrap gap-2 justify-end">
          {project.githubBackendUrl && project.githubFrontendUrl ? (
            <>
              <a 
                href={project.githubBackendUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <Code size={13} className="text-indigo-400" />
                <span>Backend Git</span>
              </a>
              <a 
                href={project.githubFrontendUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                <Layers className="text-cyan-400" size={13} />
                <span>Frontend Git</span>
              </a>
            </>
          ) : (
            <a 
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              <GithubIcon size={13} className="text-slate-400" />
              <span>GitHub Repository</span>
            </a>
          )}

          {project.deployUrl && (
            <a 
              href={project.deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/10"
            >
              <ExternalLink size={13} />
              <span>Chạy Bản Demo</span>
            </a>
          )}
        </div>
      </div>
    );
  };

  // Component hiển thị chân dung của Trưởng khi gọi thông tin giới thiệu bản thân
  const UserPhotoBox: React.FC = () => {
    const imageUrl = `${BACKEND_BASE}/public/user/avatar.png`;
    const [imageState, setImageState] = useState<'success' | 'error'>('success');

    return (
      <div className="my-4 border border-slate-800 bg-slate-950/80 rounded-2xl overflow-hidden shadow-xl transition-all max-w-xs w-full flex flex-col">
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Ảnh Chân Dung</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        </div>

        <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
          {imageState === 'error' ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 to-purple-900/30 flex flex-col items-center justify-center p-6 text-center">
              <User className="w-16 h-16 text-indigo-400 mb-3" />
              <span className="text-xs font-bold text-indigo-200">Phạm Hồng Trưởng</span>
              <span className="text-[10px] text-indigo-400/80 mt-1 leading-relaxed">Fullstack Engineer</span>
            </div>
          ) : (
            <>
              <img 
                src={imageUrl} 
                alt="Phạm Hồng Trưởng"
                onError={() => setImageState('error')}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <button 
                onClick={() => {
                  setLightboxImage(imageUrl);
                  setLightboxTitle("Ảnh chân dung Phạm Hồng Trưởng");
                }}
                className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-black/75 border border-slate-800 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                title="Phóng to ảnh"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans antialiased overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Khung Chatbox chính */}
      <div className="relative w-full max-w-6xl h-screen sm:h-[780px] bg-slate-900/40 backdrop-blur-xl sm:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar bên trái */}
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
                  <p className="text-[11px] text-slate-400 font-medium tracking-wide">VTC Academy Student | Fullstack Engineer</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                Mình là sinh viên Học viện Công nghệ VTC (VTC Academy), được đào tạo chuyên sâu về <strong>Fullstack Development</strong>. Mình đam mê xây dựng các sản phẩm Web/Mobile tối ưu hiện đại.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block">Hồ sơ kỹ năng</span>
              <div className="flex flex-wrap gap-1.5">
                {['NestJS', 'Laravel', 'React', 'React Native', 'Flutter', 'MySQL', 'MongoDB', 'Docker', 'Git'].map((skill, index) => (
                  <span key={index} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Tài liệu đính kèm</span>
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
                    <span className="text-xs font-semibold block text-slate-200">CV_PhamHongTruong.pdf</span>
                    <span className="text-[10px] text-slate-400 block">Tải trực tiếp về máy</span>
                  </div>
                </div>
                <Download size={14} className="text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Thông tin kết nối</span>
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

          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-4 border-t border-slate-900">
            <Info size={12} />
            <span>Xây dựng bằng NestJS, Mongoose, Gemini</span>
          </div>
        </div>

        {/* Khung Chat chính */}
        <div className="flex-1 flex flex-col h-full bg-slate-950/20 relative">
          
          {/* Header */}
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
                  <h1 className="font-bold text-slate-100 text-sm">Trợ lý Profile của Trưởng</h1>
                  <span className="bg-indigo-900/40 border border-indigo-700/50 text-[10px] text-indigo-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Sparkles size={10} />
                    Gemini Active
                  </span>
                </div>
                <p className="text-xs text-emerald-400/80 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Đang trực tuyến (Thời gian thực)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-all"
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg) => {
              const hasDownloadLink = msg.content.includes(downloadCvUrl);
              const lowerContent = msg.content.toLowerCase();

              // CHỈ KÍCH HOẠT BOX KHI AI ĐANG TRẢ LỜI VÀ KHÔNG PHẢI LÀ LỜI CHÀO MỞ ĐẦU (id !== 1)
              const showMediaBox = msg.role === 'assistant' && msg.id !== 1 && !msg.isError;

              // 🎯 GIẢI PHÁP QUÉT THÔNG MINH: Quét từ khóa tiếng Việt kết hợp tên tệp/thư mục hệ thống từ Backend
              const isProject1 = showMediaBox && (
                lowerContent.includes('project1') || 
                lowerContent.includes('mầm non') || 
                lowerContent.includes('mam non') ||
                lowerContent.includes('kindergarten')
              );

              const isProject2 = showMediaBox && (
                lowerContent.includes('project2') || 
                lowerContent.includes('social') || 
                lowerContent.includes('socal') || 
                lowerContent.includes('mạng xã hội')
              );

              const isProject3 = showMediaBox && (
                lowerContent.includes('project3') || 
                lowerContent.includes('bus') || 
                lowerContent.includes('vé xe') || 
                lowerContent.includes('ticket')
              );
              
              const isSelfIntro = showMediaBox && (
                lowerContent.includes('user/avatar') ||
                lowerContent.includes('bạn là ai') || 
                lowerContent.includes('giới thiệu') || 
                lowerContent.includes('phạm hồng trưởng')
              );

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

                  <div className="space-y-1.5 flex-1 max-w-full">
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                        : msg.isError
                          ? 'bg-red-950/50 border border-red-900/40 text-red-200 rounded-tl-none'
                          : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.content}

                      {/* Hiển thị LiveBox tương ứng nếu thỏa mãn điều kiện quét */}
                      {isProject1 && <LiveBox projectId="project1" />}
                      {isProject2 && <LiveBox projectId="project2" />}
                      {isProject3 && <LiveBox projectId="project3" />}
                      {isSelfIntro && !isProject1 && !isProject2 && !isProject3 && <UserPhotoBox />}

                      {/* Nút tải tệp CV đính kèm */}
                      {msg.role === 'assistant' && hasDownloadLink && !msg.isError && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-800/80">
                          <a 
                            href={downloadCvUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all border border-indigo-500/30 group animate-pulse"
                          >
                            <FileText size={14} />
                            <span>Tải xuống CV của Trưởng (PDF)</span>
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
              <div className="flex gap-3 max-w-[80%] mr-auto">
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
              <div className="bg-amber-950/40 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3 max-w-[90%] mx-auto mt-2">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-200 leading-relaxed">
                  <strong className="block text-amber-300 font-semibold mb-1">Mẹo xử lý kết nối (CORS):</strong>
                  Đảm bảo tệp <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400">main.ts</code> ở Backend NestJS đã bật CORS:
                  <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] mt-2 text-slate-300 font-mono">
                    {`const app = await NestFactory.create(AppModule);\napp.enableCors();\nawait app.listen(3000);`}
                  </pre>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-900">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
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

          {/* Form gửi câu hỏi */}
          <div className="p-4 bg-slate-950 border-t border-slate-900">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="flex gap-2 bg-slate-900/60 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 rounded-2xl p-1.5 transition-all"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi về dự án mầm non, mạng xã hội, bus ticket hoặc gõ 'tải CV'..."
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
              Hệ thống kết nối trực tiếp cơ sở dữ liệu MongoDB và phân tích CV thực tế của Phạm Hồng Trưởng thông qua NestJS & Gemini.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL PHÓNG TO ẢNH (LIGHTBOX) */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/85 border border-slate-800 text-slate-300 hover:text-white"
            onClick={() => setLightboxImage(null)}
          >
            <X size={20} />
          </button>
          
          <img 
            src={lightboxImage} 
            alt={lightboxTitle} 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
          
          <p className="mt-4 text-sm font-semibold text-slate-300 tracking-wide text-center max-w-2xl bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            {lightboxTitle}
          </p>
        </div>
      )}

      {/* Modal xác nhận xóa lịch sử */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Trash2 className="text-red-400" size={20} />
                Xác nhận xóa lịch sử
              </h3>
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bạn có chắc chắn muốn xóa lịch sử trò chuyện hiện tại không? Hành động này sẽ dọn sạch màn hình để bạn hỏi cuộc trò chuyện mới.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeClearChat}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-all"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}