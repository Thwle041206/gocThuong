import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Briefcase,
  Layout,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  Eye,
  ArrowLeft,
  Save,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  ExternalLink,
  Search,
  Tag,
  Layers,
  X,
  ShieldAlert,
  AlertTriangle,
  Image as ImageIcon,
  User,
  Copy,
  ArrowUp,
  ArrowDown,
  Columns,
  Quote,
  Smartphone,
  Monitor,
  BookOpen,
  Filter,
  Check,
  Palette,
  Globe,
  Share2,
  Sliders,
  EyeOff,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
  Dribbble,
  Type,
} from 'lucide-react';
import { ArticleContentBlock, getArticleBlocks, syncBlocksToLegacyContent } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { useAuth } from '../context/AuthContext';
import {
  CMSPost,
  CMSProject,
  CMSServiceItem,
  CMSSiteSettings,
  CMSCategory,
  CMSEditorialTag,
  CMSTrashItem,
  TrashItemType,
  CMSFooterColumn,
  CMSFooterLinkItem,
  CMSFooterSocial,
  CMSFooterCtaButton,
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  AVAILABLE_FONTS,
  CMSTypographySettings,
  getBadgeColorClasses,
} from '../services/cmsService';
import { processImageUpload } from '../utils/imageUpload';
import { HirokiLogo } from './HirokiLogo';
import { FooterStudio } from './admin/FooterStudio';

const SAMPLE_IMAGES = [
  { label: 'Work Kista', url: '/src/assets/images/work_kista_agency_1790135945749.jpg' },
  { label: 'Work Akito', url: '/src/assets/images/work_akito_portfolio_1790135960377.jpg' },
  { label: 'Work Kraft', url: '/src/assets/images/work_kraft_business_1790135978247.jpg' },
  { label: 'Work Nilsson', url: '/src/assets/images/work_nilsson_architect_1790135992309.jpg' },
  { label: 'Work Larsson', url: '/src/assets/images/work_larsson_agency_1790136007494.jpg' },
  { label: 'Work Kjell', url: '/src/assets/images/work_kjell_films_1790136022089.jpg' },
  { label: 'Studio Discussion', url: '/src/assets/images/blog_coworking_discussion_1790133957592.jpg' },
  { label: 'Studio Collab', url: '/src/assets/images/team_hero_collab_1790135062529.jpg' },
  { label: 'Creative Notebook', url: '/src/assets/images/creative_man_notebook_1790135085678.jpg' },
  { label: 'Speaker Stage', url: '/src/assets/images/blog_speaker_stage_1790133941051.jpg' },
];

export function AdminCMS({ onClose }: { onClose: () => void }) {
  const {
    posts,
    projects,
    services,
    categories,
    editorialTags,
    siteSettings,
    trashItems,
    savePost,
    deletePost,
    setPostStatus,
    saveProject,
    deleteProject,
    setProjectStatus,
    saveService,
    deleteService,
    setServiceStatus,
    saveCategory,
    deleteCategory,
    saveEditorialTag,
    deleteEditorialTag,
    saveSiteSettings,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
    resetToDefaults,
  } = useCMS();
  const { isAdmin, setIsAuthModalOpen } = useAuth();

  // Navigation tab inside CMS: 'posts' | 'projects' | 'services' | 'taxonomies' | 'footer' | 'settings' | 'backup' | 'trash'
  const [activeTab, setActiveTab] = useState<
    'posts' | 'projects' | 'services' | 'taxonomies' | 'footer' | 'settings' | 'backup' | 'trash'
  >('posts');

  // Delete Confirmation Popup Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: TrashItemType;
    item: any;
    name: string;
  } | null>(null);

  // Trash filter
  const [trashFilter, setTrashFilter] = useState<'all' | 'project' | 'service' | 'tag' | 'category' | 'post' | 'footer_link' | 'footer_column'>('all');

  // If user is not admin, deny access immediately
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-zinc-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-lg font-serif font-bold text-zinc-900 mb-2">Quyền truy cập bị từ chối</h3>
          <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
            Khu vực QUẢN TRỊ CMS chỉ dành riêng cho Quản trị viên (Admin). Bạn cần đăng nhập với tài khoản có quyền quản trị để tiếp tục.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
            >
              Đăng nhập Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Taxonomy Subtab: 'badges' | 'filters' | 'matrix'
  const [taxonomyTab, setTaxonomyTab] = useState<'badges' | 'filters' | 'matrix'>('badges');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [matrixFilterType, setMatrixFilterType] = useState<'all' | 'posts' | 'projects'>('all');
  const [matrixSearch, setMatrixSearch] = useState('');

  // Category (Main Filters) Management State
  const [editingCategory, setEditingCategory] = useState<CMSCategory | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    name: string;
    target: 'blog' | 'work' | 'both';
    label_vi: string;
    label_en: string;
    description: string;
    showInHero: boolean;
  }>({
    id: '',
    name: '',
    target: 'both',
    label_vi: '',
    label_en: '',
    description: '',
    showInHero: true,
  });

  // Editorial Tag (BADGE) Management State
  const [editingEditorialTag, setEditingEditorialTag] = useState<CMSEditorialTag | null>(null);
  const [isCreatingEditorialTag, setIsCreatingEditorialTag] = useState(false);
  const [editorialTagForm, setEditorialTagForm] = useState<{
    id: string;
    name: string;
    badgeType: 'article' | 'project' | 'both';
    color: string;
    label_vi: string;
    label_en: string;
    description: string;
  }>({
    id: '',
    name: '',
    badgeType: 'both',
    color: 'dark',
    label_vi: '',
    label_en: '',
    description: '',
  });

  // Post Editor State
  const [editingPost, setEditingPost] = useState<CMSPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'article' | 'card' | 'mobile'>('article');
  const [previewLang, setPreviewLang] = useState<'vi' | 'en'>('vi');
  const [mobileEditorTab, setMobileEditorTab] = useState<'edit' | 'preview'>('edit');

  // Project Editor State
  const [editingProject, setEditingProject] = useState<CMSProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Service Management State
  const [editingService, setEditingService] = useState<CMSServiceItem | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [serviceForm, setServiceForm] = useState<{
    id: string;
    number: string;
    title_vi: string;
    title_en: string;
    description_vi: string;
    description_en: string;
    features_vi: string[];
    features_en: string[];
    linkText_vi: string;
    linkText_en: string;
    status: 'draft' | 'published';
  }>({
    id: '',
    number: '01',
    title_vi: '',
    title_en: '',
    description_vi: '',
    description_en: '',
    features_vi: ['Chiến lược định vị', 'Phát triển thương hiệu', 'Ngôn ngữ hình ảnh'],
    features_en: ['Positioning Strategy', 'Brand Development', 'Visual Language'],
    linkText_vi: 'Bắt đầu hợp tác',
    linkText_en: 'Start Collaboration',
    status: 'published',
  });

  // Site Settings Form State
  const [settingsForm, setSettingsForm] = useState<CMSSiteSettings>(siteSettings);
  const [settingsSubTab, setSettingsSubTab] = useState<'home' | 'work' | 'services' | 'blog' | 'connect' | 'typography'>('home');
  const [notification, setNotification] = useState<string | null>(null);

  // Footer Studio State
  const [footerSubTab, setFooterSubTab] = useState<'columns' | 'socials' | 'brand' | 'preview'>('columns');
  const [footerPreviewLang, setFooterPreviewLang] = useState<'vi' | 'en'>('vi');
  const [selectedFooterColumnId, setSelectedFooterColumnId] = useState<string>('col-pages');
  const [editingFooterLink, setEditingFooterLink] = useState<{ columnId: string; link: CMSFooterLinkItem } | null>(null);
  const [isCreatingFooterLink, setIsCreatingFooterLink] = useState(false);
  const [footerLinkForm, setFooterLinkForm] = useState<{
    id: string;
    columnId: string;
    label_vi: string;
    label_en: string;
    type: 'tab' | 'utility' | 'external' | 'admin';
    target: string;
    utilityTitle_vi: string;
    utilityTitle_en: string;
    utilityDesc_vi: string;
    utilityDesc_en: string;
    highlight: boolean;
    isVisible: boolean;
  }>({
    id: '',
    columnId: 'col-pages',
    label_vi: '',
    label_en: '',
    type: 'tab',
    target: 'home',
    utilityTitle_vi: '',
    utilityTitle_en: '',
    utilityDesc_vi: '',
    utilityDesc_en: '',
    highlight: false,
    isVisible: true,
  });

  const [editingFooterColumn, setEditingFooterColumn] = useState<CMSFooterColumn | null>(null);
  const [isCreatingFooterColumn, setIsCreatingFooterColumn] = useState(false);
  const [footerColumnForm, setFooterColumnForm] = useState<{
    id: string;
    title_vi: string;
    title_en: string;
    isVisible: boolean;
  }>({
    id: '',
    title_vi: '',
    title_en: '',
    isVisible: true,
  });

  const [editingFooterSocial, setEditingFooterSocial] = useState<CMSFooterSocial | null>(null);
  const [isCreatingFooterSocial, setIsCreatingFooterSocial] = useState(false);
  const [footerSocialForm, setFooterSocialForm] = useState<{
    id: string;
    platform: 'instagram' | 'twitter' | 'behance' | 'pinterest' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'dribbble' | 'custom';
    label: string;
    url: string;
    isVisible: boolean;
  }>({
    id: '',
    platform: 'instagram',
    label: 'Instagram',
    url: 'https://instagram.com',
    isVisible: true,
  });

  useEffect(() => {
    if (siteSettings) {
      setSettingsForm(siteSettings);
    }
  }, [siteSettings]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Image Upload State & Handlers
  const postFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const authorAvatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAuthorAvatarUpload = async (file: File) => {
    try {
      const result = await processImageUpload(file, 400);
      if (editingPost) {
        setEditingPost({
          ...editingPost,
          author: {
            ...editingPost.author,
            avatar: result.dataUrl,
          },
        });
      }
      showNotification(`Đã tải ảnh đại diện tác giả (${result.fileSizeKB}KB)!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xử lý ảnh đại diện này.';
      showNotification(msg);
    }
  };

  const handlePostImageFileUpload = async (file: File) => {
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const result = await processImageUpload(file);
      if (editingPost) {
        setEditingPost({ ...editingPost, image: result.dataUrl });
      }
      showNotification(`Đã tải ảnh "${result.fileName}" thành công (${result.fileSizeKB}KB)!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xử lý hình ảnh này.';
      setUploadError(msg);
      showNotification(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProjectImageFileUpload = async (file: File) => {
    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const result = await processImageUpload(file);
      if (editingProject) {
        setEditingProject({ ...editingProject, image: result.dataUrl });
      }
      showNotification(`Đã tải ảnh "${result.fileName}" thành công (${result.fileSizeKB}KB)!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xử lý hình ảnh này.';
      setUploadError(msg);
      showNotification(msg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --------------------------------------------------------------------------
  // POSTS HANDLERS
  // --------------------------------------------------------------------------
  const startCreatePost = () => {
    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newPost: CMSPost = {
      id: `post-${Date.now()}`,
      category: 'BRANDING',
      tag: 'EDITORIAL',
      image: SAMPLE_IMAGES[0].url,
      title: {
        en: 'New Article Title',
        vi: 'Tiêu đề bài viết mới',
      },
      excerpt: {
        en: 'A concise summary of the article exploring creative direction.',
        vi: 'Tóm tắt súc tích bài viết chia sẻ về định hướng sáng tạo.',
      },
      readTime: '5 min read',
      date: now.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' }),
      publishTime: currentHourMin,
      author: {
        name: 'Hiroki Tanaka',
        role: { en: 'Editorial Director', vi: 'Giám đốc Biên tập' },
        avatar: '/src/assets/images/team_sarah_lee_1790135127741.jpg',
      },
      status: 'draft',
      content: {
        en: {
          intro: 'Introduction paragraph explaining the core theme of the publication...',
          section1Title: '1. Strategic Narrative',
          section1Body: 'Detailed insights on how to build brand equity through digital design...',
          quote: 'Design is intelligence made visible and meaningful.',
          quoteAuthor: 'góc Thương Editorial',
          section2Title: '2. Precision Craftsmanship',
          section2Body: 'Exploring aesthetic discipline and human-centered ergonomics...',
          conclusion: 'The lasting value of thoughtful editorial communication.',
          keyPoints: ['Focus on clarity over decoration', 'Invest in long-term brand equity'],
        },
        vi: {
          intro: 'Đoạn giới thiệu ngắn gọn giải thích chủ đề cốt lõi của bài viết...',
          section1Title: '1. Chiến lược Kể chuyện',
          section1Body: 'Những góc nhìn chuyên sâu về cách xây dựng giá trị thương hiệu thông qua thiết kế...',
          quote: 'Thiết kế là trí tuệ được hiển hiện rõ nét và giàu ý nghĩa.',
          quoteAuthor: 'Ban biên tập góc Thương',
          section2Title: '2. Tinh hoa Thủ công',
          section2Body: 'Khám phá kỷ luật thẩm mỹ và trải nghiệm thân thiện với con người...',
          conclusion: 'Giá trị trường tồn của truyền thông số giàu cảm xúc.',
          keyPoints: ['Tập trung vào sự rõ ràng thay vì trang trí rườm rà', 'Đầu tư vào tài sản thương hiệu dài hạn'],
        },
      },
    };
    const initialBlocks = getArticleBlocks(newPost);
    newPost.blocks = initialBlocks;
    setEditingPost(newPost);
    setIsCreatingPost(true);
  };

  // Block management helpers for Article detailed content
  const postBlocks: ArticleContentBlock[] = editingPost
    ? (editingPost.blocks && editingPost.blocks.length > 0
        ? editingPost.blocks
        : getArticleBlocks(editingPost))
    : [];

  const updatePostBlocks = (newBlocks: ArticleContentBlock[]) => {
    if (!editingPost) return;
    const synced = syncBlocksToLegacyContent(newBlocks);
    setEditingPost({
      ...editingPost,
      blocks: newBlocks,
      content: synced,
    });
  };

  const handleDuplicateBlock = (index: number) => {
    const blockToClone = postBlocks[index];
    const cloned: ArticleContentBlock = {
      ...JSON.parse(JSON.stringify(blockToClone)),
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (cloned.title) {
      cloned.title.vi = cloned.title.vi ? `${cloned.title.vi} (Bản sao)` : '(Bản sao)';
      cloned.title.en = cloned.title.en ? `${cloned.title.en} (Copy)` : '(Copy)';
    }
    const nextBlocks = [...postBlocks];
    nextBlocks.splice(index + 1, 0, cloned);
    updatePostBlocks(nextBlocks);
    showNotification('Đã nhân bản (duplicate) thành phần thành công!');
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === postBlocks.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const nextBlocks = [...postBlocks];
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIdx];
    nextBlocks[targetIdx] = temp;
    updatePostBlocks(nextBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (postBlocks.length <= 1) {
      showNotification('Bài viết cần có ít nhất 1 thành phần nội dung.');
      return;
    }
    const nextBlocks = postBlocks.filter((_, i) => i !== index);
    updatePostBlocks(nextBlocks);
    showNotification('Đã xóa thành phần khỏi nội dung bài viết!');
  };

  const handleAddBlock = (type: ArticleContentBlock['type']) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let newBlock: ArticleContentBlock;
    switch (type) {
      case 'section':
        newBlock = {
          id,
          type: 'section',
          title: { vi: `Mục ${postBlocks.filter(b => b.type === 'section').length + 1}: Tiêu đề mới`, en: 'New Section Title' },
          body: { vi: 'Nội dung chi tiết của phần này...', en: 'Detailed content for this section...' },
          imagePosition: 'none',
          layoutMode: 'stacked',
        };
        break;
      case 'intro':
        newBlock = {
          id,
          type: 'intro',
          body: { vi: 'Đoạn giới thiệu hoặc mở đầu...', en: 'Introductory statement...' },
          imagePosition: 'none',
          layoutMode: 'stacked',
        };
        break;
      case 'quote':
        newBlock = {
          id,
          type: 'quote',
          quote: { vi: 'Trích dẫn nổi bật cần nhấn mạnh...', en: 'Highlight pull quote...' },
          quoteAuthor: editingPost?.author?.name || 'Hiroki Tanaka',
          layoutMode: 'stacked',
        };
        break;
      case 'image':
        newBlock = {
          id,
          type: 'image',
          image: SAMPLE_IMAGES[0].url,
          imageCaption: { vi: 'Chú thích hình ảnh', en: 'Image caption' },
          imagePosition: 'below',
          layoutMode: 'stacked',
        };
        break;
      case 'keyPoints':
        newBlock = {
          id,
          type: 'keyPoints',
          title: { vi: 'Điểm chính cần ghi nhớ', en: 'Key Takeaways' },
          items: [
            { vi: 'Điểm ghi nhớ thứ nhất', en: 'First key takeaway point' },
            { vi: 'Điểm ghi nhớ thứ hai', en: 'Second key takeaway point' },
          ],
          layoutMode: 'stacked',
        };
        break;
      case 'conclusion':
        newBlock = {
          id,
          type: 'conclusion',
          title: { vi: 'Kết luận', en: 'Conclusion' },
          body: { vi: 'Tổng kết và định hướng tiếp theo...', en: 'Concluding thoughts and takeaways...' },
          imagePosition: 'none',
          layoutMode: 'stacked',
        };
        break;
    }
    updatePostBlocks([...postBlocks, newBlock]);
    showNotification('Đã thêm thành phần mới vào bài viết!');
  };

  const triggerBlockImageUpload = (blockIndex: number, isSecondary = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const res = await processImageUpload(file);
          const currentBlocks = editingPost?.blocks && editingPost.blocks.length > 0
            ? editingPost.blocks
            : getArticleBlocks(editingPost!);
          const updated = [...currentBlocks];
          if (isSecondary) {
            updated[blockIndex] = { ...updated[blockIndex], secondaryImage: res.dataUrl };
          } else {
            updated[blockIndex] = { ...updated[blockIndex], image: res.dataUrl };
          }
          updatePostBlocks(updated);
          showNotification(`Đã tải ảnh lên thành công (${res.fileSizeKB}KB)!`);
        } catch (err) {
          showNotification(err instanceof Error ? err.message : 'Lỗi tải ảnh');
        }
      }
    };
    input.click();
  };

  const handleSavePost = async (publishNow = false) => {
    if (!editingPost) return;
    const finalBlocks = editingPost.blocks && editingPost.blocks.length > 0
      ? editingPost.blocks
      : getArticleBlocks(editingPost);
    const syncedContent = syncBlocksToLegacyContent(finalBlocks);
    const postToSave: CMSPost = {
      ...editingPost,
      blocks: finalBlocks,
      content: syncedContent,
      status: publishNow ? 'published' : editingPost.status || 'draft',
      updatedAt: new Date().toISOString(),
    };
    await savePost(postToSave);
    setEditingPost(null);
    setIsCreatingPost(false);
    showNotification(
      publishNow ? 'Đã xuất bản bài viết thành công!' : 'Đã lưu bản nháp bài viết!'
    );
  };

  // --------------------------------------------------------------------------
  // PROJECTS HANDLERS
  // --------------------------------------------------------------------------
  const startCreateProject = () => {
    const newProject: CMSProject = {
      id: `project-${Date.now()}`,
      name: 'Dự án mới',
      title: { en: 'New Case Study', vi: 'Dự án Tiêu biểu' },
      category: { en: 'Brand & Digital Architecture', vi: 'Thương hiệu & Kiến trúc Số' },
      categoryBadge: 'AGENCY',
      filterTag: 'BRANDING',
      year: new Date().getFullYear().toString(),
      description: {
        en: 'A high-concept digital platform highlighting contemporary design.',
        vi: 'Nền tảng kỹ thuật số tôn vinh ngôn ngữ thiết kế đương đại.',
      },
      image: SAMPLE_IMAGES[0].url,
      deliverables: ['Brand Identity', 'Art Direction', 'Web Design'],
      status: 'draft',
    };
    setEditingProject(newProject);
    setIsCreatingProject(true);
  };

  const handleSaveProject = async (publishNow = false) => {
    if (!editingProject) return;
    const projToSave: CMSProject = {
      ...editingProject,
      status: publishNow ? 'published' : editingProject.status || 'draft',
      updatedAt: new Date().toISOString(),
    };
    await saveProject(projToSave);
    setEditingProject(null);
    setIsCreatingProject(false);
    showNotification(
      publishNow ? 'Đã xuất bản dự án thành công!' : 'Đã lưu bản nháp dự án!'
    );
  };

  // --------------------------------------------------------------------------
  // SETTINGS HANDLER
  // --------------------------------------------------------------------------
  const handleSaveSettings = async () => {
    await saveSiteSettings(settingsForm);
    showNotification('Đã lưu nội dung các header & trang thành công!');
  };

  // --------------------------------------------------------------------------
  // FOOTER STUDIO HANDLERS (Links, Columns, Socials, Brand & CTA)
  // --------------------------------------------------------------------------
  const currentFooter = settingsForm?.footer || DEFAULT_FOOTER_SETTINGS;

  const startCreateFooterLink = (columnId?: string) => {
    const colId = columnId || selectedFooterColumnId || currentFooter.columns[0]?.id || 'col-pages';
    setSelectedFooterColumnId(colId);
    setFooterLinkForm({
      id: `lnk-${Date.now()}`,
      columnId: colId,
      label_vi: '',
      label_en: '',
      type: 'tab',
      target: 'home',
      utilityTitle_vi: '',
      utilityTitle_en: '',
      utilityDesc_vi: '',
      utilityDesc_en: '',
      highlight: false,
      isVisible: true,
    });
    setIsCreatingFooterLink(true);
    setEditingFooterLink(null);
  };

  const startEditFooterLink = (columnId: string, link: CMSFooterLinkItem) => {
    setSelectedFooterColumnId(columnId);
    setFooterLinkForm({
      id: link.id,
      columnId,
      label_vi: link.label?.vi || '',
      label_en: link.label?.en || '',
      type: link.type || 'tab',
      target: link.target || '',
      utilityTitle_vi: link.utilityContent?.title?.vi || '',
      utilityTitle_en: link.utilityContent?.title?.en || '',
      utilityDesc_vi: link.utilityContent?.desc?.vi || '',
      utilityDesc_en: link.utilityContent?.desc?.en || '',
      highlight: !!link.highlight,
      isVisible: link.isVisible !== false,
    });
    setEditingFooterLink({ columnId, link });
    setIsCreatingFooterLink(false);
  };

  const handleSaveFooterLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerLinkForm.label_vi.trim() && !footerLinkForm.label_en.trim()) {
      alert('Vui lòng nhập tên hiển thị cho liên kết');
      return;
    }

    const linkId = footerLinkForm.id || `lnk-${Date.now()}`;
    const newLink: CMSFooterLinkItem = {
      id: linkId,
      label: {
        vi: footerLinkForm.label_vi.trim() || footerLinkForm.label_en.trim(),
        en: footerLinkForm.label_en.trim() || footerLinkForm.label_vi.trim(),
      },
      type: footerLinkForm.type,
      target: footerLinkForm.target.trim(),
      highlight: footerLinkForm.highlight,
      isVisible: footerLinkForm.isVisible,
      utilityContent:
        footerLinkForm.type === 'utility'
          ? {
              title: {
                vi: footerLinkForm.utilityTitle_vi.trim() || footerLinkForm.label_vi.trim(),
                en: footerLinkForm.utilityTitle_en.trim() || footerLinkForm.label_en.trim(),
              },
              desc: {
                vi: footerLinkForm.utilityDesc_vi.trim(),
                en: footerLinkForm.utilityDesc_en.trim(),
              },
            }
          : undefined,
    };

    const targetColId = footerLinkForm.columnId;
    const oldColId = editingFooterLink ? editingFooterLink.columnId : targetColId;

    const updatedCols = (currentFooter.columns || DEFAULT_FOOTER_SETTINGS.columns).map((col) => {
      if (col.id === targetColId) {
        const existingIdx = col.links.findIndex((l) => l.id === linkId);
        let updatedLinks = [...col.links];
        if (existingIdx >= 0) {
          updatedLinks[existingIdx] = newLink;
        } else {
          updatedLinks.push(newLink);
        }
        return { ...col, links: updatedLinks };
      }
      if (oldColId !== targetColId && col.id === oldColId) {
        return {
          ...col,
          links: col.links.filter((l) => l.id !== linkId),
        };
      }
      return col;
    });

    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        columns: updatedCols,
      },
    };

    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    setIsCreatingFooterLink(false);
    setEditingFooterLink(null);
    showNotification(`Đã lưu liên kết chân trang "${newLink.label.vi || newLink.label.en}"!`);
  };

  const handleDeleteFooterLink = (columnId: string, link: CMSFooterLinkItem) => {
    setDeleteModalState({
      isOpen: true,
      type: 'footer_link',
      item: { columnId, link },
      name: link.label?.vi || link.label?.en || 'Liên kết chân trang',
    });
  };

  const handleMoveFooterLink = async (columnId: string, linkIndex: number, direction: 'up' | 'down') => {
    const col = (currentFooter.columns || []).find((c) => c.id === columnId);
    if (!col) return;
    const newIdx = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    if (newIdx < 0 || newIdx >= col.links.length) return;

    const newLinks = [...col.links];
    const [moved] = newLinks.splice(linkIndex, 1);
    newLinks.splice(newIdx, 0, moved);

    const updatedCols = (currentFooter.columns || []).map((c) =>
      c.id === columnId ? { ...c, links: newLinks } : c
    );

    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        columns: updatedCols,
      },
    };

    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
  };

  const handleToggleFooterLinkVisibility = async (columnId: string, linkId: string) => {
    const updatedCols = (currentFooter.columns || []).map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        links: col.links.map((l) =>
          l.id === linkId ? { ...l, isVisible: l.isVisible === false ? true : false } : l
        ),
      };
    });

    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        columns: updatedCols,
      },
    };

    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    showNotification('Đã cập nhật trạng thái hiển thị của liên kết.');
  };

  const startCreateFooterColumn = () => {
    setFooterColumnForm({
      id: `col-${Date.now()}`,
      title_vi: '',
      title_en: '',
      isVisible: true,
    });
    setIsCreatingFooterColumn(true);
    setEditingFooterColumn(null);
  };

  const startEditFooterColumn = (col: CMSFooterColumn) => {
    setFooterColumnForm({
      id: col.id,
      title_vi: col.title?.vi || '',
      title_en: col.title?.en || '',
      isVisible: col.isVisible !== false,
    });
    setEditingFooterColumn(col);
    setIsCreatingFooterColumn(false);
  };

  const handleSaveFooterColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerColumnForm.title_vi.trim() && !footerColumnForm.title_en.trim()) {
      alert('Vui lòng nhập tiêu đề cột');
      return;
    }

    const colId = footerColumnForm.id || `col-${Date.now()}`;
    const newCol: CMSFooterColumn = {
      id: colId,
      title: {
        vi: footerColumnForm.title_vi.trim() || footerColumnForm.title_en.trim(),
        en: footerColumnForm.title_en.trim() || footerColumnForm.title_vi.trim(),
      },
      isVisible: footerColumnForm.isVisible,
      links: editingFooterColumn ? editingFooterColumn.links : [],
    };

    const existingIdx = (currentFooter.columns || []).findIndex((c) => c.id === colId);
    let updatedCols = [...(currentFooter.columns || [])];
    if (existingIdx >= 0) {
      updatedCols[existingIdx] = {
        ...updatedCols[existingIdx],
        title: newCol.title,
        isVisible: newCol.isVisible,
      };
    } else {
      updatedCols.push(newCol);
    }

    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        columns: updatedCols,
      },
    };

    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    setIsCreatingFooterColumn(false);
    setEditingFooterColumn(null);
    showNotification(`Đã lưu cột "${newCol.title.vi}"!`);
  };

  const handleDeleteFooterColumn = (col: CMSFooterColumn) => {
    setDeleteModalState({
      isOpen: true,
      type: 'footer_column',
      item: col,
      name: col.title?.vi || col.title?.en || 'Cột chân trang',
    });
  };

  const startCreateFooterSocial = () => {
    setFooterSocialForm({
      id: `soc-${Date.now()}`,
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com',
      isVisible: true,
    });
    setIsCreatingFooterSocial(true);
    setEditingFooterSocial(null);
  };

  const startEditFooterSocial = (soc: CMSFooterSocial) => {
    setFooterSocialForm({
      id: soc.id,
      platform: soc.platform || 'custom',
      label: soc.label || '',
      url: soc.url || '',
      isVisible: soc.isVisible !== false,
    });
    setEditingFooterSocial(soc);
    setIsCreatingFooterSocial(false);
  };

  const handleSaveFooterSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const socId = footerSocialForm.id || `soc-${Date.now()}`;
    const newSocial: CMSFooterSocial = {
      id: socId,
      platform: footerSocialForm.platform,
      label: footerSocialForm.label.trim() || footerSocialForm.platform,
      url: footerSocialForm.url.trim(),
      isVisible: footerSocialForm.isVisible,
    };

    const existingIdx = (currentFooter.socials || []).findIndex((s) => s.id === socId);
    let updatedSocials = [...(currentFooter.socials || [])];
    if (existingIdx >= 0) {
      updatedSocials[existingIdx] = newSocial;
    } else {
      updatedSocials.push(newSocial);
    }

    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        socials: updatedSocials,
      },
    };

    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    setIsCreatingFooterSocial(false);
    setEditingFooterSocial(null);
    showNotification(`Đã lưu kênh mạng xã hội "${newSocial.label}"!`);
  };

  const handleDeleteFooterSocial = async (socId: string, label: string) => {
    if (!confirm(`Bạn có chắc muốn xóa kênh mạng xã hội "${label}"?`)) return;
    const updatedSocials = (currentFooter.socials || []).filter((s) => s.id !== socId);
    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        socials: updatedSocials,
      },
    };
    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    showNotification(`Đã xóa kênh "${label}".`);
  };

  const handleToggleFooterSocialVisibility = async (socId: string) => {
    const updatedSocials = (currentFooter.socials || []).map((s) =>
      s.id === socId ? { ...s, isVisible: s.isVisible === false ? true : false } : s
    );
    const updatedSettings: CMSSiteSettings = {
      ...settingsForm,
      footer: {
        ...currentFooter,
        socials: updatedSocials,
      },
    };
    setSettingsForm(updatedSettings);
    await saveSiteSettings(updatedSettings);
    showNotification('Đã cập nhật trạng thái hiển thị kênh mạng xã hội.');
  };

  const handleSaveFooterBrandAndCTA = async () => {
    await saveSiteSettings(settingsForm);
    showNotification('Đã lưu thông tin thương hiệu, CTA & bản quyền chân trang thành công!');
  };

  const handleResetFooterToDefault = async () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ Footer về mặc định ban đầu? Các liên kết tự tạo sẽ bị thay thế.')) {
      const updatedSettings: CMSSiteSettings = {
        ...settingsForm,
        footer: DEFAULT_FOOTER_SETTINGS,
      };
      setSettingsForm(updatedSettings);
      await saveSiteSettings(updatedSettings);
      showNotification('Đã khôi phục Footer về cấu hình mặc định!');
    }
  };

  // --------------------------------------------------------------------------
  // CATEGORIES / MAIN FILTERS HANDLERS (Create, Edit, Delete)
  // --------------------------------------------------------------------------
  const startCreateCategory = () => {
    setCategoryForm({
      id: `cat-${Date.now()}`,
      name: '',
      target: 'both',
      label_vi: '',
      label_en: '',
      description: '',
      showInHero: true,
    });
    setIsCreatingCategory(true);
    setEditingCategory(null);
  };

  const startEditCategory = (cat: CMSCategory) => {
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      target: cat.target || 'both',
      label_vi: cat.label_vi || '',
      label_en: cat.label_en || '',
      description: cat.description || '',
      showInHero: cat.showInHero !== false,
    });
    setEditingCategory(cat);
    setIsCreatingCategory(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('Vui lòng nhập tên bộ lọc / chuyên mục (VD: BRANDING, STUDIO, WEB DESIGN...)');
      return;
    }
    const catToSave: CMSCategory = {
      id: categoryForm.id || `cat-${Date.now()}`,
      name: categoryForm.name.trim().toUpperCase(),
      target: categoryForm.target || 'both',
      label_vi: categoryForm.label_vi.trim(),
      label_en: categoryForm.label_en.trim(),
      description: categoryForm.description.trim(),
      showInHero: categoryForm.showInHero,
    };
    await saveCategory(catToSave);
    setIsCreatingCategory(false);
    setEditingCategory(null);
    showNotification(`Đã lưu bộ lọc chính "${catToSave.name}" thành công!`);
  };

  const handleDeleteCategory = (cat: CMSCategory) => {
    setDeleteModalState({
      isOpen: true,
      type: 'category',
      item: cat,
      name: cat.name,
    });
  };

  // --------------------------------------------------------------------------
  // EDITORIAL TAGS / BADGE HANDLERS (Create, Edit, Delete)
  // --------------------------------------------------------------------------
  const startCreateEditorialTag = () => {
    setEditorialTagForm({
      id: `tag-${Date.now()}`,
      name: '',
      badgeType: 'both',
      color: 'dark',
      label_vi: '',
      label_en: '',
      description: '',
    });
    setIsCreatingEditorialTag(true);
    setEditingEditorialTag(null);
  };

  const startEditEditorialTag = (tag: CMSEditorialTag) => {
    setEditorialTagForm({
      id: tag.id,
      name: tag.name,
      badgeType: tag.badgeType || 'both',
      color: tag.color || 'dark',
      label_vi: tag.label_vi || '',
      label_en: tag.label_en || '',
      description: tag.description || '',
    });
    setEditingEditorialTag(tag);
    setIsCreatingEditorialTag(false);
  };

  const handleSaveEditorialTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorialTagForm.name.trim()) {
      alert('Vui lòng nhập tên thẻ BADGE (VD: EDITORIAL, WEB DESIGN, AGENCY...)');
      return;
    }
    const tagToSave: CMSEditorialTag = {
      id: editorialTagForm.id || `tag-${Date.now()}`,
      name: editorialTagForm.name.trim().toUpperCase(),
      badgeType: editorialTagForm.badgeType || 'both',
      color: editorialTagForm.color || 'dark',
      label_vi: editorialTagForm.label_vi.trim(),
      label_en: editorialTagForm.label_en.trim(),
      description: editorialTagForm.description.trim(),
    };
    await saveEditorialTag(tagToSave);
    setIsCreatingEditorialTag(false);
    setEditingEditorialTag(null);
    showNotification(`Đã lưu thẻ BADGE "${tagToSave.name}" thành công!`);
  };

  const handleDeleteEditorialTag = (tag: CMSEditorialTag) => {
    setDeleteModalState({
      isOpen: true,
      type: 'tag',
      item: tag,
      name: tag.name,
    });
  };

  // --------------------------------------------------------------------------
  // SERVICES HANDLERS (Create, Edit, Toggle Draft/Publish, Delete to 30-day trash)
  // --------------------------------------------------------------------------
  const startCreateService = () => {
    const nextNum = String(services.length + 1).padStart(2, '0');
    setServiceForm({
      id: `srv-${Date.now()}`,
      number: nextNum,
      title_vi: '',
      title_en: '',
      description_vi: '',
      description_en: '',
      features_vi: ['Chiến lược định vị', 'Thiết kế nhận diện thương hiệu', 'Tối ưu hóa chuyển đổi'],
      features_en: ['Positioning Strategy', 'Brand Identity Design', 'Conversion Optimization'],
      linkText_vi: 'Bắt đầu hợp tác',
      linkText_en: 'Start Collaboration',
      status: 'published',
    });
    setEditingService(null);
    setIsCreatingService(true);
  };

  const startEditService = (srv: CMSServiceItem) => {
    const srvTitleVi = srv.title?.vi || (typeof srv.title === 'string' ? srv.title : '');
    const srvTitleEn = srv.title?.en || (typeof srv.title === 'string' ? srv.title : '');
    const srvDescVi = srv.description?.vi || (typeof srv.description === 'string' ? srv.description : '');
    const srvDescEn = srv.description?.en || (typeof srv.description === 'string' ? srv.description : '');

    let featVi: string[] = [];
    if (srv.features && Array.isArray((srv.features as any).vi)) {
      featVi = [...(srv.features as any).vi];
    } else if (Array.isArray(srv.features)) {
      featVi = [...srv.features];
    } else {
      featVi = ['Năng lực chuyên sâu'];
    }

    let featEn: string[] = [];
    if (srv.features && Array.isArray((srv.features as any).en)) {
      featEn = [...(srv.features as any).en];
    } else if (Array.isArray(srv.features)) {
      featEn = [...srv.features];
    } else {
      featEn = ['Core Capability'];
    }

    setServiceForm({
      id: srv.id,
      number: srv.number || '01',
      title_vi: srvTitleVi,
      title_en: srvTitleEn,
      description_vi: srvDescVi,
      description_en: srvDescEn,
      features_vi: featVi,
      features_en: featEn,
      linkText_vi: srv.linkText?.vi || 'Bắt đầu hợp tác',
      linkText_en: srv.linkText?.en || 'Start Collaboration',
      status: srv.status || 'published',
    });
    setEditingService(srv);
    setIsCreatingService(false);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title_vi.trim() && !serviceForm.title_en.trim()) {
      alert('Vui lòng nhập tiêu đề dịch vụ (Tiếng Việt hoặc Tiếng Anh)');
      return;
    }

    const payload: CMSServiceItem = {
      id: serviceForm.id || `srv-${Date.now()}`,
      number: serviceForm.number.trim() || '01',
      title: {
        vi: serviceForm.title_vi.trim() || serviceForm.title_en.trim(),
        en: serviceForm.title_en.trim() || serviceForm.title_vi.trim(),
      },
      description: {
        vi: serviceForm.description_vi.trim() || serviceForm.description_en.trim(),
        en: serviceForm.description_en.trim() || serviceForm.description_vi.trim(),
      },
      features: {
        vi: serviceForm.features_vi.map((f) => f.trim()).filter((f) => f.length > 0),
        en: serviceForm.features_en.map((f) => f.trim()).filter((f) => f.length > 0),
      },
      linkText: {
        vi: serviceForm.linkText_vi.trim() || 'Bắt đầu hợp tác',
        en: serviceForm.linkText_en.trim() || 'Start Collaboration',
      },
      status: serviceForm.status,
    };

    await saveService(payload);
    setIsCreatingService(false);
    setEditingService(null);
    showNotification(
      editingService
        ? `Đã cập nhật dịch vụ "${payload.title.vi}" thành công!`
        : `Đã tạo dịch vụ mới "${payload.title.vi}" thành công!`
    );
  };

  const handleToggleServiceStatus = async (srv: CMSServiceItem) => {
    const nextStatus = (srv.status || 'published') === 'published' ? 'draft' : 'published';
    await setServiceStatus(srv.id, nextStatus);
    showNotification(
      nextStatus === 'published'
        ? `Đã xuất bản dịch vụ "${srv.title?.vi || srv.title?.en}"!`
        : `Đã chuyển dịch vụ "${srv.title?.vi || srv.title?.en}" sang Bản Nháp (Draft)!`
    );
  };

  const handleDeleteService = (srv: CMSServiceItem) => {
    setDeleteModalState({
      isOpen: true,
      type: 'service',
      item: srv,
      name: srv.title?.vi || srv.title?.en || `Dịch vụ #${srv.number}`,
    });
  };

  // Quick Matrix Inline Assigners
  const handleQuickAssignPostCategory = async (post: CMSPost, newCat: string) => {
    const updated: CMSPost = { ...post, category: newCat };
    await savePost(updated);
    showNotification(`Đã đổi chuyên mục "${post.title.vi.slice(0, 24)}..." sang "${newCat}"!`);
  };

  const handleQuickAssignPostBadge = async (post: CMSPost, newBadge: string) => {
    const updated: CMSPost = { ...post, tag: newBadge };
    await savePost(updated);
    showNotification(`Đã gắn BADGE "${newBadge}" cho bài viết!`);
  };

  const handleQuickAssignProjectFilter = async (proj: CMSProject, newFilter: string) => {
    const updated: CMSProject = { ...proj, filterTag: newFilter };
    await saveProject(updated);
    showNotification(`Đã đổi bộ lọc "${proj.name}" sang "${newFilter}"!`);
  };

  const handleQuickAssignProjectBadge = async (proj: CMSProject, newBadge: string) => {
    const updated: CMSProject = { ...proj, categoryBadge: newBadge };
    await saveProject(updated);
    showNotification(`Đã gắn BADGE "${newBadge}" cho dự án "${proj.name}"!`);
  };

  // Filtered lists
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? p.status === 'published'
        : p.status === 'draft';
    return matchesSearch && matchesStatus;
  });

  const filteredProjects = projects.filter((pr) => {
    const matchesSearch =
      pr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.title.vi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? pr.status === 'published'
        : pr.status === 'draft';
    return matchesSearch && matchesStatus;
  });

  const filteredServices = services.filter((srv) => {
    const srvTitleVi = srv.title?.vi || (typeof srv.title === 'string' ? srv.title : '');
    const srvTitleEn = srv.title?.en || (typeof srv.title === 'string' ? srv.title : '');
    const srvNumber = srv.number || '';
    const matchesSearch =
      srvTitleVi.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      srvTitleEn.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      srvNumber.toLowerCase().includes(serviceSearchTerm.toLowerCase());
    const matchesStatus =
      serviceStatusFilter === 'all'
        ? true
        : serviceStatusFilter === 'published'
        ? (srv.status || 'published') === 'published'
        : srv.status === 'draft';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200 text-zinc-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-[70] bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main CMS Container */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden m-2 sm:m-4 rounded-2xl shadow-2xl border border-zinc-200">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between bg-zinc-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <HirokiLogo size={32} showDomain={false} />
            <div className="h-5 w-px bg-zinc-300" />
            <span className="font-semibold text-xs sm:text-sm tracking-wider uppercase text-zinc-700 bg-zinc-200/80 px-2.5 py-1 rounded">
              CMS Studio Mini
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firestore Cloud Synced
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="bg-black text-white hover:bg-zinc-800 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>Xem Website</span>
            </button>
          </div>
        </header>

        {/* Content Body: Sidebar + Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside className="w-56 sm:w-64 border-r border-zinc-200 bg-zinc-50/60 p-4 flex flex-col justify-between flex-shrink-0">
            <div className="space-y-1">
              <div className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase px-3 py-2">
                Quản lý nội dung
              </div>

              <button
                onClick={() => {
                  setActiveTab('posts');
                  setEditingPost(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} />
                  <span>Bài viết (Posts)</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    activeTab === 'posts' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {posts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('projects');
                  setEditingProject(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase size={16} />
                  <span>Dự án (Projects)</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    activeTab === 'projects' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {projects.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('services');
                  setEditingService(null);
                  setIsCreatingService(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} />
                  <span>Dịch vụ (Services)</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === 'services' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {services.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('taxonomies');
                  setEditingCategory(null);
                  setIsCreatingCategory(false);
                  setEditingEditorialTag(null);
                  setIsCreatingEditorialTag(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'taxonomies'
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag size={16} />
                  <span>Bộ Lọc & BADGE</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === 'taxonomies' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {categories.length + editorialTags.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('footer');
                  setEditingFooterLink(null);
                  setIsCreatingFooterLink(false);
                  setEditingFooterColumn(null);
                  setIsCreatingFooterColumn(false);
                  setEditingFooterSocial(null);
                  setIsCreatingFooterSocial(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'footer'
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Columns size={16} />
                  <span>Quản lý Footer (Chân trang)</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                    activeTab === 'footer' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {(currentFooter.columns || []).reduce((acc, col) => acc + (col.links?.length || 0), 0) + (currentFooter.socials?.length || 0)}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <Layout size={16} />
                <span>Nội dung Trang & Header</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <RotateCcw size={16} />
                <span>Dữ liệu & Khôi phục</span>
              </button>

              <button
                onClick={() => setActiveTab('trash')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'trash'
                    ? 'bg-rose-700 text-white font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 size={16} />
                  <span>Thùng rác (30 ngày)</span>
                </div>
                {trashItems.length > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === 'trash' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {trashItems.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Helper */}
            <div className="bg-zinc-100 rounded-xl p-3 text-[11px] text-zinc-500 leading-relaxed border border-zinc-200">
              <span className="font-semibold text-zinc-800 block mb-1">
                Tự động lưu & Không cần sửa code
              </span>
              Mọi bài viết và dự án mới bạn tạo hoặc sửa ở đây sẽ lưu trực tiếp vào database Firestore và hiển thị ngay trên website.
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <main className="flex-1 bg-white overflow-y-auto p-4 sm:p-8">
            {/* ======================================================== */}
            {/* TAB 1: POSTS MANAGEMENT                                  */}
            {/* ======================================================== */}
            {activeTab === 'posts' && !editingPost && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                      Quản lý Bài viết (Posts)
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                      Thêm mới, sửa nội dung, lưu bản nháp hoặc xuất bản bài viết lên mục BÀI VIẾT.
                    </p>
                  </div>

                  <button
                    onClick={startCreatePost}
                    className="bg-black text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Viết bài mới</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="text"
                      placeholder="Tìm bài viết..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-100 p-1 rounded-lg">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-white text-zinc-900 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Tất cả ({posts.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('published')}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'published'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đã xuất bản ({posts.filter((p) => (p.status || 'published') === 'published').length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('draft')}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === 'draft'
                          ? 'bg-white text-amber-700 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Bản nháp ({posts.filter((p) => p.status === 'draft').length})
                    </button>
                  </div>
                </div>

                {/* Posts List Cards */}
                <div className="space-y-3">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                      <FileText size={32} className="mx-auto text-zinc-400 mb-2" />
                      <p className="text-zinc-600 text-sm font-medium">Không tìm thấy bài viết nào.</p>
                      <button
                        onClick={startCreatePost}
                        className="mt-3 text-xs text-black font-semibold underline underline-offset-4"
                      >
                        Tạo bài viết đầu tiên ngay
                      </button>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-xs"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={post.image}
                            alt={post.title.vi}
                            className="w-16 h-16 rounded-lg object-cover bg-zinc-100 flex-shrink-0 border border-zinc-100"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                                {post.category}
                              </span>
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  (post.status || 'published') === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    (post.status || 'published') === 'published'
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                {(post.status || 'published') === 'published'
                                  ? 'Đã xuất bản (Publish)'
                                  : 'Bản nháp (Draft)'}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-medium">
                                {post.date || 'Gần đây'}
                                {post.publishTime ? ` • ${post.publishTime}` : ''}
                              </span>
                              {post.author?.name && (
                                <span className="text-[11px] text-zinc-400">
                                  · <span className="text-zinc-700 font-medium">{post.author.name}</span>
                                </span>
                              )}
                            </div>

                            <h3 className="font-semibold text-sm sm:text-base text-zinc-900 line-clamp-1">
                              {post.title.vi}
                            </h3>
                            <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">
                              {post.title.en}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Toggle Draft / Publish */}
                          <button
                            onClick={() =>
                              setPostStatus(
                                post.id,
                                (post.status || 'published') === 'published' ? 'draft' : 'published'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              (post.status || 'published') === 'published'
                                ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                            title="Chuyển trạng thái Xuất bản / Bản nháp"
                          >
                            {(post.status || 'published') === 'published'
                              ? 'Chuyển thành Nháp'
                              : 'Xuất bản ngay'}
                          </button>

                          <button
                            onClick={() => {
                              const now = new Date();
                              const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                              setEditingPost({
                                ...post,
                                publishTime: post.publishTime || currentHourMin,
                                author: post.author || {
                                  name: 'Hiroki Tanaka',
                                  role: { en: 'Creative Director', vi: 'Giám đốc sáng tạo' },
                                  avatar: post.image || SAMPLE_IMAGES[0].url,
                                },
                              });
                              setIsCreatingPost(false);
                            }}
                            className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteModalState({
                                isOpen: true,
                                type: 'post',
                                item: post,
                                name: post.title.vi || post.title.en,
                              });
                            }}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa bài viết (Chuyển vào thùng rác 30 ngày)"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* POST EDITOR FORM (CREATE / EDIT)                         */}
            {/* ======================================================== */}
            {editingPost && (
              <div className="space-y-6 max-w-[1740px] mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingPost(null)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-zinc-50 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Quay lại danh sách</span>
                    </button>
                    <span className="hidden sm:inline-block text-xs font-medium text-zinc-300">|</span>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-800 truncate max-w-[260px]">
                        {editingPost.title.vi || editingPost.title.en || 'Bài viết mới'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          editingPost.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {editingPost.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Live Preview Column on Desktop */}
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        showLivePreview
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                      }`}
                      title="Bật / Tắt cột xem trước trực tiếp bên phải"
                    >
                      <Columns size={14} />
                      <span>{showLivePreview ? 'Ẩn Cột Xem Trước' : 'Mở Cột Xem Trước'}</span>
                    </button>

                    <button
                      onClick={() => handleSavePost(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      Lưu Bản Nháp (Draft)
                    </button>
                    <button
                      onClick={() => handleSavePost(true)}
                      className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Save size={14} />
                      <span>Xuất Bản (Publish)</span>
                    </button>
                  </div>
                </div>

                {/* Mobile / Tablet Screen Mode Toggle (Edit vs Preview) */}
                <div className="flex xl:hidden items-center justify-between bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setMobileEditorTab('edit')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobileEditorTab === 'edit'
                        ? 'bg-white text-black shadow-xs'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Edit3 size={14} />
                    <span>Soạn thảo nội dung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileEditorTab('preview')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobileEditorTab === 'preview'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    <Eye size={14} />
                    <span>Xem trước (Preview)</span>
                  </button>
                </div>

                {/* 2-Column Responsive Layout: Left = Editor Form, Right = Live Real-time Preview */}
                <div className={`grid grid-cols-1 ${showLivePreview ? 'xl:grid-cols-12 gap-8 items-start' : ''}`}>
                  {/* LEFT COLUMN: EDITOR FORM */}
                  <div
                    className={`${
                      showLivePreview ? 'xl:col-span-7 2xl:col-span-6' : 'max-w-4xl mx-auto w-full'
                    } ${mobileEditorTab === 'edit' ? 'block' : 'hidden xl:block'}`}
                  >
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-6">
                  {/* Category & Tag */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Chuyên mục / Bộ lọc chính
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('taxonomies');
                            setTaxonomyTab('filters');
                          }}
                          className="text-[11px] text-zinc-500 hover:text-black font-semibold flex items-center gap-0.5 cursor-pointer underline underline-offset-2"
                          title="Quản lý Bộ lọc chính (Thêm, sửa, xóa)"
                        >
                          <Filter size={11} />
                          <span>Quản lý Bộ Lọc</span>
                        </button>
                      </div>
                      <select
                        value={editingPost.category}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            category: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name} {cat.label_vi ? `(${cat.label_vi})` : ''}
                          </option>
                        ))}
                        {!categories.some((c) => c.name === editingPost.category) && (
                          <option value={editingPost.category}>{editingPost.category}</option>
                        )}
                      </select>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Tự động đồng bộ với danh mục đã tạo trong CMS
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Thẻ BADGE Góc Ảnh
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('taxonomies');
                            setTaxonomyTab('badges');
                          }}
                          className="text-[11px] text-zinc-500 hover:text-black font-semibold flex items-center gap-0.5 cursor-pointer underline underline-offset-2"
                          title="Quản lý BADGE & Bảng phối màu"
                        >
                          <Palette size={11} />
                          <span>Quản lý BADGE</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingPost.tag}
                        onChange={(e) => setEditingPost({ ...editingPost, tag: e.target.value })}
                        placeholder="VD: EDITORIAL, WEB DESIGN..."
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                      />
                      {/* Editorial tag quick select pills */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {editorialTags.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setEditingPost({ ...editingPost, tag: t.name })}
                            className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                              (editingPost.tag || '').toUpperCase() === t.name.toUpperCase()
                                ? 'bg-black text-white font-semibold'
                                : 'bg-zinc-200/70 hover:bg-zinc-300 text-zinc-700'
                            }`}
                            title={t.label_vi || t.name}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Thời gian đọc (Read time)
                      </label>
                      <input
                        type="text"
                        value={editingPost.readTime}
                        onChange={(e) =>
                          setEditingPost({ ...editingPost, readTime: e.target.value })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Author Details & Publication Time (Date & Hour:Minute) */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-black text-white rounded-lg">
                          <User size={15} />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                            Thông tin Tác giả & Thời gian đăng bài
                          </h4>
                          <p className="text-[11px] text-zinc-500">
                            Chỉnh sửa tên người viết, chức danh, ngày đăng và giờ:phút hiển thị bên cạnh ngày
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Author Info */}
                      <div className="space-y-3 bg-white p-3.5 rounded-lg border border-zinc-200">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                              Tên người viết (Author Name)
                            </label>
                            <span className="text-[10px] text-zinc-400">Hiển thị ở đầu bài đọc & thẻ bài</span>
                          </div>
                          <input
                            type="text"
                            value={editingPost.author?.name || ''}
                            onChange={(e) =>
                              setEditingPost({
                                ...editingPost,
                                author: {
                                  name: e.target.value,
                                  role: editingPost.author?.role || { vi: '', en: '' },
                                  avatar: editingPost.author?.avatar || SAMPLE_IMAGES[0].url,
                                },
                              })
                            }
                            placeholder="VD: Hiroki Tanaka, Ban biên tập..."
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                              Chức danh (Tiếng Việt)
                            </label>
                            <input
                              type="text"
                              value={editingPost.author?.role?.vi || ''}
                              onChange={(e) =>
                                setEditingPost({
                                  ...editingPost,
                                  author: {
                                    ...editingPost.author,
                                    name: editingPost.author?.name || 'Tác giả',
                                    avatar: editingPost.author?.avatar || SAMPLE_IMAGES[0].url,
                                    role: {
                                      en: editingPost.author?.role?.en || '',
                                      vi: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="VD: Giám đốc sáng tạo..."
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                              Chức danh (English)
                            </label>
                            <input
                              type="text"
                              value={editingPost.author?.role?.en || ''}
                              onChange={(e) =>
                                setEditingPost({
                                  ...editingPost,
                                  author: {
                                    ...editingPost.author,
                                    name: editingPost.author?.name || 'Author',
                                    avatar: editingPost.author?.avatar || SAMPLE_IMAGES[0].url,
                                    role: {
                                      vi: editingPost.author?.role?.vi || '',
                                      en: e.target.value,
                                    },
                                  },
                                })
                              }
                              placeholder="VD: Creative Director..."
                              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>

                        {/* Author Avatar Upload & Link */}
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                            Ảnh đại diện tác giả (Avatar)
                          </label>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={editingPost.author?.avatar || SAMPLE_IMAGES[0].url}
                              alt={editingPost.author?.name || 'Avatar'}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-300 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0].url;
                              }}
                            />
                            <input
                              type="text"
                              value={editingPost.author?.avatar || ''}
                              onChange={(e) =>
                                setEditingPost({
                                  ...editingPost,
                                  author: {
                                    ...editingPost.author,
                                    name: editingPost.author?.name || 'Tác giả',
                                    role: editingPost.author?.role || { vi: '', en: '' },
                                    avatar: e.target.value,
                                  },
                                })
                              }
                              placeholder="URL ảnh đại diện..."
                              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono focus:bg-white focus:ring-2 focus:ring-black"
                            />
                            <input
                              ref={authorAvatarInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAuthorAvatarUpload(file);
                                e.target.value = '';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => authorAvatarInputRef.current?.click()}
                              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer flex-shrink-0 border border-zinc-300 transition-colors"
                              title="Tải ảnh avatar trực tiếp từ máy tính"
                            >
                              <Upload size={12} />
                              <span>Tải từ máy</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Publication Date & Hour:Minute */}
                      <div className="space-y-3 bg-white p-3.5 rounded-lg border border-zinc-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                              Ngày đăng bài (Publication Date)
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const dateStr = now.toLocaleDateString('vi-VN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                });
                                setEditingPost({ ...editingPost, date: dateStr });
                              }}
                              className="text-[11px] text-zinc-600 hover:text-black font-semibold underline underline-offset-2 cursor-pointer"
                            >
                              Lấy hôm nay
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editingPost.date || ''}
                            onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                            placeholder="VD: 24 Th10, 2024 hoặc 24 Tháng 10, 2024..."
                            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1">
                              <Clock size={13} className="text-zinc-500" />
                              <span>Giờ : Phút bên cạnh ngày đăng (Publish Time)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                setEditingPost({ ...editingPost, publishTime: timeStr });
                              }}
                              className="text-[11px] text-zinc-600 hover:text-black font-semibold underline underline-offset-2 cursor-pointer"
                            >
                              Lấy giờ hiện tại
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={editingPost.publishTime || '09:00'}
                              onChange={(e) =>
                                setEditingPost({ ...editingPost, publishTime: e.target.value })
                              }
                              className="w-32 bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editingPost.publishTime || ''}
                              onChange={(e) =>
                                setEditingPost({ ...editingPost, publishTime: e.target.value })
                              }
                              placeholder="VD: 14:30 hoặc 09:15"
                              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-black"
                            />
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Giờ và phút này sẽ hiển thị trực tiếp bên cạnh ngày đăng ở tiêu đề bài đọc.
                          </p>
                        </div>

                        {/* Live preview banner */}
                        <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 text-xs flex items-center gap-2">
                          <span className="font-semibold text-zinc-800 text-[11px] whitespace-nowrap">
                            Xem trước hiển thị:
                          </span>
                          <span className="text-zinc-600 text-[11px] truncate">
                            <strong className="text-zinc-900 font-semibold">{editingPost.author?.name || 'Tác giả'}</strong> · {editingPost.date || 'Hôm nay'}
                            {editingPost.publishTime && (
                              <span className="ml-1 text-black font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                                • {editingPost.publishTime}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bilingual Titles */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Tiêu đề Tiếng Việt (Bắt buộc)
                      </label>
                      <input
                        type="text"
                        value={editingPost.title.vi}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            title: { ...editingPost.title, vi: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-black"
                        placeholder="Nhập tiêu đề tiếng Việt..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Tiêu đề Tiếng Anh (English Title)
                      </label>
                      <input
                        type="text"
                        value={editingPost.title.en}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            title: { ...editingPost.title, en: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-black"
                        placeholder="Enter English title..."
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Tóm tắt ngắn (Tiếng Việt)
                      </label>
                      <textarea
                        rows={3}
                        value={editingPost.excerpt.vi}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            excerpt: { ...editingPost.excerpt, vi: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Tóm tắt ngắn (English)
                      </label>
                      <textarea
                        rows={3}
                        value={editingPost.excerpt.en}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            excerpt: { ...editingPost.excerpt, en: e.target.value },
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Image Picker with Computer Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                        Ảnh bìa bài viết (Cover Image)
                      </label>
                      {editingPost.image && (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle size={12} />
                          {editingPost.image.startsWith('data:') ? 'Ảnh tải từ máy tính' : 'Ảnh từ URL / Thư viện'}
                        </span>
                      )}
                    </div>

                    {/* Hidden file input for post image upload */}
                    <input
                      ref={postFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePostImageFileUpload(file);
                        e.target.value = '';
                      }}
                    />

                    {/* Upload Drop Zone / Button */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePostImageFileUpload(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        isUploadingImage
                          ? 'border-black bg-zinc-100 opacity-80'
                          : 'border-zinc-300 hover:border-black bg-white hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 flex-shrink-0">
                          <Upload size={20} className={isUploadingImage ? 'animate-bounce' : ''} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            {isUploadingImage ? 'Đang nén và xử lý ảnh...' : 'Tải ảnh trực tiếp từ máy tính lên'}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Hỗ trợ JPG, PNG, WebP, GIF, SVG. Kéo thả file ảnh vào đây hoặc bấm nút để chọn tệp.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          onClick={() => postFileInputRef.current?.click()}
                          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <Upload size={14} />
                          <span>{isUploadingImage ? 'Đang xử lý...' : 'Chọn ảnh từ máy tính'}</span>
                        </button>
                      </div>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                        {uploadError}
                      </p>
                    )}

                    {/* Image Preview & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-white p-3.5 border border-zinc-200 rounded-xl">
                      <div className="sm:col-span-1">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 relative group">
                          {editingPost.image ? (
                            <>
                              <img
                                src={editingPost.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0].url;
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setEditingPost({ ...editingPost, image: '' })}
                                className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Xóa ảnh bìa này"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-[10px]">
                              <ImageIcon size={22} className="mb-1 text-zinc-400" />
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-3 space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                            Hoặc dán đường dẫn ảnh (URL):
                          </label>
                          <input
                            type="text"
                            value={editingPost.image}
                            onChange={(e) => setEditingPost({ ...editingPost, image: e.target.value })}
                            placeholder="https://... hoặc data:image/..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black font-mono text-[11px]"
                          />
                        </div>

                        {/* Quick preset images */}
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium block mb-1">
                            Hoặc chọn nhanh ảnh mẫu có sẵn:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {SAMPLE_IMAGES.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setEditingPost({ ...editingPost, image: img.url })}
                                className={`flex-shrink-0 w-8 h-8 rounded border overflow-hidden transition-all ${
                                  editingPost.image === img.url
                                    ? 'border-black ring-2 ring-black'
                                    : 'border-zinc-200 opacity-60 hover:opacity-100'
                                }`}
                                title={img.label}
                              >
                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Body Content: Dynamic Blocks & Layout Editor */}
                  <div className="space-y-6 pt-6 border-t border-zinc-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                          <Layers size={16} className="text-zinc-700" />
                          <span>Nội dung chi tiết bài viết (Content Blocks & Grid Layout)</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Tùy biến linh hoạt từng phần: nhân bản (duplicate), xếp ảnh bên dưới/trái/phải, chia ô Grid 2 cột hoặc dạng List.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-700 shadow-2xs">
                          {postBlocks.length} thành phần
                        </span>
                      </div>
                    </div>

                    {/* Block List */}
                    <div className="space-y-4">
                      {postBlocks.map((block, index) => {
                        const blockTypeLabel = {
                          intro: 'Mở đầu bài viết (Intro)',
                          section: 'Mục nội dung (Section)',
                          quote: 'Câu trích dẫn nổi bật (Quote)',
                          image: 'Khối ảnh / Thư viện ảnh (Media Grid)',
                          keyPoints: 'Điểm chính cần ghi nhớ (Key Takeaways)',
                          conclusion: 'Kết luận (Conclusion)',
                        }[block.type] || 'Thành phần';

                        const blockTypeColor = {
                          intro: 'bg-blue-50 text-blue-700 border-blue-200',
                          section: 'bg-zinc-100 text-zinc-800 border-zinc-200',
                          quote: 'bg-amber-50 text-amber-800 border-amber-200',
                          image: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                          keyPoints: 'bg-purple-50 text-purple-800 border-purple-200',
                          conclusion: 'bg-slate-100 text-slate-800 border-slate-200',
                        }[block.type] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

                        const pos = block.imagePosition || (block.image ? 'below' : 'none');
                        const layout = block.layoutMode || 'stacked';

                        return (
                          <div
                            key={block.id || index}
                            className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs transition-all"
                          >
                            {/* Block Header & Action Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-100 w-5 h-5 rounded-full flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${blockTypeColor}`}>
                                  {blockTypeLabel}
                                </span>
                              </div>

                              {/* Action Buttons: Duplicate, Up, Down, Delete */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateBlock(index)}
                                  className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white rounded-md text-[11px] font-semibold text-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Nhân bản thành phần này (Duplicate)"
                                >
                                  <Copy size={12} />
                                  <span>Duplicate</span>
                                </button>

                                <div className="h-3.5 w-px bg-zinc-200 mx-1" />

                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveBlock(index, 'up')}
                                  className="p-1 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded text-zinc-600 transition-colors cursor-pointer"
                                  title="Di chuyển lên trên"
                                >
                                  <ArrowUp size={13} />
                                </button>

                                <button
                                  type="button"
                                  disabled={index === postBlocks.length - 1}
                                  onClick={() => handleMoveBlock(index, 'down')}
                                  className="p-1 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded text-zinc-600 transition-colors cursor-pointer"
                                  title="Di chuyển xuống dưới"
                                >
                                  <ArrowDown size={13} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBlock(index)}
                                  className="p-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded transition-colors cursor-pointer ml-1"
                                  title="Xóa thành phần này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Block Content Inputs */}
                            {block.type === 'section' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Tiêu đề mục (Tiếng Việt)
                                    </label>
                                    <input
                                      type="text"
                                      value={block.title?.vi || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          title: { vi: e.target.value, en: block.title?.en || '' },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="VD: 1. Định hình Phong cách Thiết kế"
                                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Tiêu đề mục (English)
                                    </label>
                                    <input
                                      type="text"
                                      value={block.title?.en || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          title: { vi: block.title?.vi || '', en: e.target.value },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="e.g. 1. Establishing Design Direction"
                                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-black"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Nội dung mục (Tiếng Việt)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={block.body?.vi || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          body: { vi: e.target.value, en: block.body?.en || '' },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="Nhập nội dung chi tiết cho mục này..."
                                      className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Nội dung mục (English)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={block.body?.en || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          body: { vi: block.body?.vi || '', en: e.target.value },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="Enter section body in English..."
                                      className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {block.type === 'intro' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Đoạn mở đầu (Tiếng Việt)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={block.body?.vi || ''}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = {
                                        ...next[index],
                                        body: { vi: e.target.value, en: block.body?.en || '' },
                                      };
                                      updatePostBlocks(next);
                                    }}
                                    placeholder="Đoạn văn mở đầu định hướng chủ đề bài viết..."
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed italic"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Đoạn mở đầu (English)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={block.body?.en || ''}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = {
                                        ...next[index],
                                        body: { vi: block.body?.vi || '', en: e.target.value },
                                      };
                                      updatePostBlocks(next);
                                    }}
                                    placeholder="Introduction opening paragraph in English..."
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed italic"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'quote' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Câu trích dẫn nổi bật (Tiếng Việt)
                                    </label>
                                    <input
                                      type="text"
                                      value={block.quote?.vi || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          quote: { vi: e.target.value, en: block.quote?.en || '' },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="VD: Thiết kế là trí tuệ được hiển hiện rõ nét."
                                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs italic font-serif"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                      Câu trích dẫn nổi bật (English)
                                    </label>
                                    <input
                                      type="text"
                                      value={block.quote?.en || ''}
                                      onChange={(e) => {
                                        const next = [...postBlocks];
                                        next[index] = {
                                          ...next[index],
                                          quote: { vi: block.quote?.vi || '', en: e.target.value },
                                        };
                                        updatePostBlocks(next);
                                      }}
                                      placeholder="e.g. Design is intelligence made visible."
                                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs italic font-serif"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Tác giả trích dẫn
                                  </label>
                                  <input
                                    type="text"
                                    value={block.quoteAuthor || ''}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = { ...next[index], quoteAuthor: e.target.value };
                                      updatePostBlocks(next);
                                    }}
                                    placeholder="VD: Hiroki Tanaka, Giám đốc Nghệ thuật"
                                    className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs"
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'keyPoints' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Tiêu đề danh sách điểm chính
                                  </label>
                                  <input
                                    type="text"
                                    value={block.title?.vi || 'Điểm chính cần ghi nhớ'}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = {
                                        ...next[index],
                                        title: { vi: e.target.value, en: block.title?.en || 'Key Takeaways' },
                                      };
                                      updatePostBlocks(next);
                                    }}
                                    className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold text-zinc-700">
                                    Các mục gạch đầu dòng ({block.items?.length || 0})
                                  </label>
                                  {(block.items || []).map((it, itIdx) => (
                                    <div key={itIdx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={it.vi || ''}
                                        onChange={(e) => {
                                          const next = [...postBlocks];
                                          const nextItems = [...(next[index].items || [])];
                                          nextItems[itIdx] = { ...nextItems[itIdx], vi: e.target.value };
                                          next[index] = { ...next[index], items: nextItems };
                                          updatePostBlocks(next);
                                        }}
                                        placeholder={`Điểm #${itIdx + 1} (Tiếng Việt)...`}
                                        className="flex-1 bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={it.en || ''}
                                        onChange={(e) => {
                                          const next = [...postBlocks];
                                          const nextItems = [...(next[index].items || [])];
                                          nextItems[itIdx] = { ...nextItems[itIdx], en: e.target.value };
                                          next[index] = { ...next[index], items: nextItems };
                                          updatePostBlocks(next);
                                        }}
                                        placeholder={`Point #${itIdx + 1} (English)...`}
                                        className="flex-1 bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...postBlocks];
                                          const nextItems = (next[index].items || []).filter((_, i) => i !== itIdx);
                                          next[index] = { ...next[index], items: nextItems };
                                          updatePostBlocks(next);
                                        }}
                                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                        title="Xóa dòng này"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...postBlocks];
                                      const nextItems = [...(next[index].items || [])];
                                      nextItems.push({ vi: 'Điểm ghi nhớ mới', en: 'New takeaway point' });
                                      next[index] = { ...next[index], items: nextItems };
                                      updatePostBlocks(next);
                                    }}
                                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                                  >
                                    <Plus size={13} />
                                    <span>Thêm điểm gạch đầu dòng mới</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {block.type === 'conclusion' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Nội dung kết luận (Tiếng Việt)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={block.body?.vi || ''}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = {
                                        ...next[index],
                                        body: { vi: e.target.value, en: block.body?.en || '' },
                                      };
                                      updatePostBlocks(next);
                                    }}
                                    placeholder="Nội dung tổng kết và thông điệp gửi gắm..."
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                                    Nội dung kết luận (English)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={block.body?.en || ''}
                                    onChange={(e) => {
                                      const next = [...postBlocks];
                                      next[index] = {
                                        ...next[index],
                                        body: { vi: block.body?.vi || '', en: e.target.value },
                                      };
                                      updatePostBlocks(next);
                                    }}
                                    placeholder="Concluding thoughts in English..."
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Image Placement & Layout Controls */}
                            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                {/* Image position options */}
                                <div>
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                                    Vị trí đặt ảnh cho phần này:
                                  </span>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {[
                                      { id: 'none', label: '🚫 Không ảnh' },
                                      { id: 'below', label: '⬇️ Dưới chữ' },
                                      { id: 'left', label: '⬅️ Bên trái (Grid)' },
                                      { id: 'right', label: '➡️ Bên phải (Grid)' },
                                      { id: 'banner', label: '🖼️ Banner ngang' },
                                    ].map((opt) => (
                                      <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          const next = [...postBlocks];
                                          next[index] = {
                                            ...next[index],
                                            imagePosition: opt.id as any,
                                          };
                                          updatePostBlocks(next);
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                          pos === opt.id
                                            ? 'bg-black text-white shadow-2xs font-semibold'
                                            : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Layout Mode: Stacked vs Grid vs Card */}
                                <div>
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                                    Kiểu bố cục (Layout):
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {[
                                      { id: 'stacked', label: '📄 Danh sách dọc (List)' },
                                      { id: 'grid-2', label: '⊞ Lưới 2 cột (Grid)' },
                                      { id: 'card', label: '🃏 Thẻ Card' },
                                    ].map((lOpt) => (
                                      <button
                                        key={lOpt.id}
                                        type="button"
                                        onClick={() => {
                                          const next = [...postBlocks];
                                          next[index] = {
                                            ...next[index],
                                            layoutMode: lOpt.id as any,
                                          };
                                          updatePostBlocks(next);
                                        }}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                          layout === lOpt.id
                                            ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                                            : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                      >
                                        {lOpt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Image upload and preview if image is active */}
                              {pos !== 'none' && (
                                <div className="pt-3 border-t border-zinc-200/80 space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Primary Image */}
                                    <div className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-zinc-700">
                                          Ảnh chính của phần (Primary Image)
                                        </span>
                                        {block.image && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = [...postBlocks];
                                              next[index] = { ...next[index], image: '' };
                                              updatePostBlocks(next);
                                            }}
                                            className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                                          >
                                            Gỡ ảnh
                                          </button>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <div className="w-16 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                                          {block.image ? (
                                            <img src={block.image} alt="Media" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                              <ImageIcon size={16} />
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex-1 space-y-1.5">
                                          <button
                                            type="button"
                                            onClick={() => triggerBlockImageUpload(index, false)}
                                            className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                          >
                                            <Upload size={12} />
                                            <span>Tải ảnh từ máy tính</span>
                                          </button>
                                          <input
                                            type="text"
                                            value={block.image || ''}
                                            onChange={(e) => {
                                              const next = [...postBlocks];
                                              next[index] = { ...next[index], image: e.target.value };
                                              updatePostBlocks(next);
                                            }}
                                            placeholder="Hoặc dán URL ảnh..."
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-[11px] font-mono"
                                          />
                                        </div>
                                      </div>

                                      <input
                                        type="text"
                                        value={block.imageCaption?.vi || ''}
                                        onChange={(e) => {
                                          const next = [...postBlocks];
                                          next[index] = {
                                            ...next[index],
                                            imageCaption: {
                                              vi: e.target.value,
                                              en: block.imageCaption?.en || e.target.value,
                                            },
                                          };
                                          updatePostBlocks(next);
                                        }}
                                        placeholder="Chú thích ảnh (Caption)..."
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1 text-xs"
                                      />
                                    </div>

                                    {/* Secondary Image for Dual Image Grid */}
                                    <div className="bg-white p-3 rounded-lg border border-zinc-200 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-zinc-700">
                                          Ảnh thứ 2 (Lưới đôi Grid / So sánh)
                                        </span>
                                        {block.secondaryImage && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const next = [...postBlocks];
                                              next[index] = { ...next[index], secondaryImage: '' };
                                              updatePostBlocks(next);
                                            }}
                                            className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                                          >
                                            Gỡ ảnh phụ
                                          </button>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <div className="w-16 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                                          {block.secondaryImage ? (
                                            <img src={block.secondaryImage} alt="Media 2" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                              <ImageIcon size={16} />
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex-1 space-y-1.5">
                                          <button
                                            type="button"
                                            onClick={() => triggerBlockImageUpload(index, true)}
                                            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-300"
                                          >
                                            <Upload size={12} />
                                            <span>Tải ảnh phụ từ máy</span>
                                          </button>
                                          <input
                                            type="text"
                                            value={block.secondaryImage || ''}
                                            onChange={(e) => {
                                              const next = [...postBlocks];
                                              next[index] = { ...next[index], secondaryImage: e.target.value };
                                              updatePostBlocks(next);
                                            }}
                                            placeholder="Hoặc dán URL ảnh thứ 2..."
                                            className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-[11px] font-mono"
                                          />
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-zinc-400">
                                        Khi có cả 2 ảnh, phần này sẽ hiển thị thành Lưới 2 ảnh (Dual Image Grid) song song.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add New Block Toolbar */}
                    <div className="bg-zinc-50 border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl p-4 space-y-2.5 transition-all text-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                        + Thêm thành phần nội dung mới vào bài viết
                      </span>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleAddBlock('section')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Mục nội dung (Section)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('intro')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Đoạn mở đầu (Intro)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('quote')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Câu trích dẫn (Quote)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('image')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Khối ảnh / Lưới ảnh (Grid)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('keyPoints')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Điểm chính (Key Points)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlock('conclusion')}
                          className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Kết luận (Conclusion)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: REAL-TIME LIVE POST PREVIEW */}
              {(showLivePreview || mobileEditorTab === 'preview') && (
                <div
                  className={`${
                    showLivePreview ? 'xl:col-span-5 2xl:col-span-6' : 'w-full'
                  } ${mobileEditorTab === 'preview' ? 'block' : 'hidden xl:block'}`}
                >
                  <div className="sticky top-6 rounded-2xl border border-zinc-200/90 bg-white shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-3.5rem)]">
                    {/* Preview Top Header Bar */}
                    <div className="bg-zinc-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-800 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                          <Eye size={13} className="text-zinc-400" />
                          <span>Cột Xem Trước (Live Preview)</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Language Switcher */}
                        <div className="bg-zinc-800 p-0.5 rounded-lg flex items-center border border-zinc-700">
                          <button
                            type="button"
                            onClick={() => setPreviewLang('vi')}
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                              previewLang === 'vi'
                                ? 'bg-white text-zinc-950 shadow-2xs'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            VI
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewLang('en')}
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                              previewLang === 'en'
                                ? 'bg-white text-zinc-950 shadow-2xs'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            EN
                          </button>
                        </div>

                        {/* Preview View Mode Switcher */}
                        <div className="bg-zinc-800 p-0.5 rounded-lg flex items-center border border-zinc-700">
                          <button
                            type="button"
                            onClick={() => setPreviewMode('article')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer transition-colors ${
                              previewMode === 'article'
                                ? 'bg-zinc-700 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Xem giao diện bài đọc chi tiết (Article View)"
                          >
                            <BookOpen size={12} />
                            <span className="hidden sm:inline">Bài đọc</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode('card')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer transition-colors ${
                              previewMode === 'card'
                                ? 'bg-zinc-700 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Xem giao diện Thẻ bài viết (Card Grid View)"
                          >
                            <Layout size={12} />
                            <span className="hidden sm:inline">Thẻ Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode('mobile')}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer transition-colors ${
                              previewMode === 'mobile'
                                ? 'bg-zinc-700 text-white font-semibold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Mô phỏng hiển thị trên Smartphone"
                          >
                            <Smartphone size={12} />
                            <span className="hidden sm:inline">Mobile</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview Scrollable Canvas */}
                    <div className="overflow-y-auto p-4 sm:p-6 bg-zinc-100/60 flex-1">
                      {/* MODE 1: CARD VIEW */}
                      {previewMode === 'card' && (
                        <div className="max-w-md mx-auto py-4 space-y-4">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center">
                            Hiển thị trên Trang chủ & Danh sách Bài viết
                          </div>
                          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                              <img
                                src={editingPost.image || SAMPLE_IMAGES[0].url}
                                alt={editingPost.title[previewLang] || editingPost.title.vi}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-black/85 text-white backdrop-blur-xs">
                                  {editingPost.category}
                                </span>
                                {editingPost.tag && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/95 text-zinc-800 backdrop-blur-xs shadow-2xs">
                                    {editingPost.tag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-5 space-y-2.5">
                              <h3 className="font-serif text-xl font-bold text-zinc-900 line-clamp-2 leading-snug">
                                {editingPost.title[previewLang] || editingPost.title.vi || 'Tiêu đề bài viết'}
                              </h3>
                              <p className="text-zinc-600 text-xs line-clamp-3 leading-relaxed">
                                {editingPost.excerpt[previewLang] || editingPost.excerpt.vi || 'Đoạn trích dẫn tóm tắt bài viết...'}
                              </p>
                              <div className="pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-xs text-zinc-500 font-sans flex-wrap">
                                <span className="text-zinc-800 font-semibold">{editingPost.author?.name || 'Hiroki Tanaka'}</span>
                                <span aria-hidden="true" className="text-zinc-300">·</span>
                                <span>{editingPost.date}</span>
                                {editingPost.publishTime && (
                                  <>
                                    <span aria-hidden="true" className="text-zinc-300">•</span>
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                      <Clock size={11} className="text-zinc-500" />
                                      <span>{editingPost.publishTime}</span>
                                    </span>
                                  </>
                                )}
                                <span aria-hidden="true" className="text-zinc-300">·</span>
                                <span>{editingPost.readTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MODE 2: ARTICLE VIEW & MOBILE VIEW */}
                      {(previewMode === 'article' || previewMode === 'mobile') && (
                        <div className={previewMode === 'mobile' ? 'max-w-[360px] mx-auto py-2' : 'max-w-2xl mx-auto'}>
                          <div
                            className={`${
                              previewMode === 'mobile'
                                ? 'border-[7px] border-zinc-850 rounded-[38px] bg-white p-4 shadow-2xl overflow-hidden relative'
                                : 'bg-white rounded-2xl border border-zinc-200/90 p-5 sm:p-7 shadow-xs'
                            }`}
                          >
                            {previewMode === 'mobile' && (
                              <div className="w-20 h-4 bg-zinc-900 rounded-full mx-auto mb-4" />
                            )}

                            <article className="space-y-6 text-zinc-800 font-sans">
                              {/* Category & Tag Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                  {editingPost.category}
                                </span>
                                {editingPost.tag && (
                                  <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-900 bg-zinc-200/70 px-2 py-0.5 rounded">
                                    {editingPost.tag}
                                  </span>
                                )}
                              </div>

                              {/* Main Title */}
                              <h1
                                className={`font-serif text-zinc-900 font-bold leading-tight ${
                                  previewMode === 'mobile' ? 'text-xl' : 'text-2xl sm:text-3xl'
                                }`}
                              >
                                {editingPost.title[previewLang] || editingPost.title.vi || 'Tiêu đề bài viết'}
                              </h1>

                              {/* Excerpt */}
                              {(editingPost.excerpt[previewLang] || editingPost.excerpt.vi) && (
                                <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed border-l-2 border-zinc-400 pl-3.5 italic bg-zinc-50/50 py-1 rounded-r">
                                  {editingPost.excerpt[previewLang] || editingPost.excerpt.vi}
                                </p>
                              )}

                              {/* Author & Time Row */}
                              <div className="flex items-center gap-3 pt-3 pb-4 border-y border-zinc-200">
                                <img
                                  src={editingPost.author?.avatar || SAMPLE_IMAGES[0].url}
                                  alt={editingPost.author?.name || 'Author'}
                                  className="w-10 h-10 rounded-full object-cover border border-zinc-300 shadow-2xs shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-zinc-900 leading-tight">
                                    {editingPost.author?.name || 'Hiroki Tanaka'}
                                  </p>
                                  <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                    <span>
                                      {editingPost.author?.role?.[previewLang] ||
                                        editingPost.author?.role?.vi ||
                                        'Tác giả'}
                                    </span>
                                    <span className="text-zinc-300">·</span>
                                    <span>{editingPost.date}</span>
                                    {editingPost.publishTime && (
                                      <>
                                        <span className="text-zinc-300">•</span>
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                                          <Clock size={10} className="text-zinc-500" />
                                          <span>{editingPost.publishTime}</span>
                                        </span>
                                      </>
                                    )}
                                    <span className="text-zinc-300">·</span>
                                    <span>{editingPost.readTime}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Featured Cover Image */}
                              {editingPost.image && (
                                <div className="space-y-1.5">
                                  <div className="rounded-xl overflow-hidden border border-zinc-200 aspect-[16/10] bg-zinc-100">
                                    <img
                                      src={editingPost.image}
                                      alt={editingPost.title[previewLang] || 'Cover'}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <p className="text-[10px] text-zinc-400 text-center italic">
                                    Ảnh bìa bài viết (Featured Cover)
                                  </p>
                                </div>
                              )}

                              {/* Dynamic Content Blocks Render */}
                              <div className="space-y-6 pt-1">
                                {postBlocks.map((block, bIdx) => {
                                  const blockTitle =
                                    block.title?.[previewLang] || block.title?.vi || block.title?.en;
                                  const blockBody =
                                    block.body?.[previewLang] || block.body?.vi || block.body?.en;
                                  const blockQuote =
                                    block.quote?.[previewLang] || block.quote?.vi || block.quote?.en;
                                  const blockCaption =
                                    block.imageCaption?.[previewLang] ||
                                    block.imageCaption?.vi ||
                                    block.imageCaption?.en;
                                  const hasImage = !!block.image;
                                  const hasSecondaryImage = !!block.secondaryImage;
                                  const pos = block.imagePosition || (hasImage ? 'below' : 'none');
                                  const layout = block.layoutMode || 'stacked';

                                  const renderBlockMedia = () => {
                                    if (!hasImage && !hasSecondaryImage) return null;
                                    if (hasImage && hasSecondaryImage) {
                                      return (
                                        <div className="my-3 space-y-1.5">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-100">
                                              <img
                                                src={block.image}
                                                alt="Media 1"
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="rounded-lg overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-100">
                                              <img
                                                src={block.secondaryImage}
                                                alt="Media 2"
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                          </div>
                                          {blockCaption && (
                                            <p className="text-[10px] text-zinc-500 italic text-center">
                                              {blockCaption}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="my-3 space-y-1.5">
                                        <div className="rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 max-h-64">
                                          <img
                                            src={block.image}
                                            alt="Media"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        {blockCaption && (
                                          <p className="text-[10px] text-zinc-500 italic text-center">
                                            {blockCaption}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  };

                                  if (block.type === 'intro') {
                                    return (
                                      <div key={block.id || bIdx} className="space-y-3">
                                        {pos === 'banner' && renderBlockMedia()}
                                        <div className="font-serif text-sm sm:text-base leading-relaxed text-zinc-850 italic border-l-2 border-black pl-4">
                                          {blockBody || 'Đoạn văn mở đầu bài viết...'}
                                        </div>
                                        {pos === 'below' && renderBlockMedia()}
                                      </div>
                                    );
                                  }

                                  if (block.type === 'keyPoints') {
                                    const items = block.items || [];
                                    return (
                                      <div
                                        key={block.id || bIdx}
                                        className="bg-zinc-100/70 border border-zinc-200 rounded-xl p-4 space-y-3"
                                      >
                                        <h4 className="text-[11px] font-bold tracking-widest uppercase text-zinc-900">
                                          {blockTitle || 'Điểm chính cần ghi nhớ'}
                                        </h4>
                                        {layout === 'grid-2' ? (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700">
                                            {items.map((it, idx) => (
                                              <div
                                                key={idx}
                                                className="bg-white p-2.5 rounded-lg border border-zinc-200 flex items-start gap-2 shadow-2xs"
                                              >
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                                                <span className="leading-snug">
                                                  {it[previewLang] || it.vi || it.en}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <ul className="space-y-2 text-xs text-zinc-700">
                                            {items.map((it, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                                                <span>{it[previewLang] || it.vi || it.en}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                        {pos === 'below' && renderBlockMedia()}
                                      </div>
                                    );
                                  }

                                  if (block.type === 'quote') {
                                    return (
                                      <div key={block.id || bIdx} className="my-4">
                                        <blockquote className="py-4 border-y border-zinc-200 text-center">
                                          <p className="font-serif text-base sm:text-lg italic text-zinc-900 leading-snug">
                                            "{blockQuote || 'Câu trích dẫn nổi bật...'}"
                                          </p>
                                          {block.quoteAuthor && (
                                            <cite className="block mt-2 text-[10px] tracking-wider uppercase text-zinc-500 not-italic font-sans">
                                              — {block.quoteAuthor}
                                            </cite>
                                          )}
                                        </blockquote>
                                        {pos === 'below' && renderBlockMedia()}
                                      </div>
                                    );
                                  }

                                  if (block.type === 'conclusion') {
                                    return (
                                      <div key={block.id || bIdx} className="pt-4 border-t border-zinc-200 space-y-2">
                                        {blockTitle && (
                                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            {blockTitle}
                                          </h4>
                                        )}
                                        <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-medium">
                                          {blockBody || 'Nội dung kết luận bài viết...'}
                                        </p>
                                        {renderBlockMedia()}
                                      </div>
                                    );
                                  }

                                  // Default: Section
                                  const isCard = layout === 'card';
                                  const isSplitLeft = pos === 'left';
                                  const isSplitRight = pos === 'right';

                                  return (
                                    <div
                                      key={block.id || bIdx}
                                      className={`space-y-2.5 ${
                                        isCard ? 'bg-zinc-50 border border-zinc-200 rounded-xl p-4' : 'pt-2'
                                      }`}
                                    >
                                      {pos === 'banner' && renderBlockMedia()}
                                      {isSplitLeft ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                          <div>{renderBlockMedia()}</div>
                                          <div className="space-y-1.5">
                                            {blockTitle && (
                                              <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-bold">
                                                {blockTitle}
                                              </h3>
                                            )}
                                            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                              {blockBody}
                                            </p>
                                          </div>
                                        </div>
                                      ) : isSplitRight ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                          <div className="space-y-1.5">
                                            {blockTitle && (
                                              <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-bold">
                                                {blockTitle}
                                              </h3>
                                            )}
                                            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                              {blockBody}
                                            </p>
                                          </div>
                                          <div>{renderBlockMedia()}</div>
                                        </div>
                                      ) : (
                                        <>
                                          {blockTitle && (
                                            <h3 className="font-serif text-base sm:text-lg text-zinc-900 font-bold">
                                              {blockTitle}
                                            </h3>
                                          )}
                                          <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                            {blockBody}
                                          </p>
                                          {(pos === 'below' || (hasImage && pos !== 'banner')) && renderBlockMedia()}
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </article>

                            {previewMode === 'mobile' && (
                              <div className="w-24 h-1 bg-zinc-300 rounded-full mx-auto mt-6" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

            {/* ======================================================== */}
            {/* TAB 2: PROJECTS MANAGEMENT                               */}
            {/* ======================================================== */}
            {activeTab === 'projects' && !editingProject && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                      Quản lý Dự án (Projects)
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                      Thêm dự án portfolio mới, cập nhật hình ảnh, chuyển đổi trạng thái hiển thị trên TRANG CHỦ & DỰ ÁN.
                    </p>
                  </div>

                  <button
                    onClick={startCreateProject}
                    className="bg-black text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Thêm dự án mới</span>
                  </button>
                </div>

                {/* Projects Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-xs group"
                    >
                      <div className="aspect-[16/10] bg-zinc-100 overflow-hidden relative">
                        <img
                          src={proj.image}
                          alt={proj.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${
                              (proj.status || 'published') === 'published'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {(proj.status || 'published') === 'published' ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-lg font-bold text-zinc-900">
                            {proj.name}
                          </span>
                          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase bg-zinc-100 px-2 py-0.5 rounded">
                            {proj.categoryBadge}
                          </span>
                        </div>

                        <p className="text-zinc-600 text-xs line-clamp-2 leading-relaxed">
                          {proj.description.vi || proj.description.en}
                        </p>

                        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                          <button
                            onClick={() =>
                              setProjectStatus(
                                proj.id,
                                (proj.status || 'published') === 'published' ? 'draft' : 'published'
                              )
                            }
                            className="text-[11px] font-semibold text-zinc-600 hover:text-black underline underline-offset-4 cursor-pointer"
                          >
                            {(proj.status || 'published') === 'published' ? 'Chuyển Nháp' : 'Xuất bản'}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingProject(proj)}
                              className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded cursor-pointer"
                              title="Sửa dự án"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModalState({
                                  isOpen: true,
                                  type: 'project',
                                  item: proj,
                                  name: proj.name,
                                });
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Xóa dự án (Chuyển vào thùng rác 30 ngày)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECT EDITOR FORM */}
            {editingProject && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                  <button
                    onClick={() => setEditingProject(null)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách dự án</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveProject(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-300 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                    >
                      Lưu Nháp (Draft)
                    </button>
                    <button
                      onClick={() => handleSaveProject(true)}
                      className="bg-black text-white px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Save size={14} />
                      <span>Xuất Bản (Publish)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Tên dự án (Name)
                      </label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, name: e.target.value })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold"
                        placeholder="VD: Kista, Akito..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Phân loại Badge
                      </label>
                      <input
                        type="text"
                        value={editingProject.categoryBadge}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, categoryBadge: e.target.value })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs uppercase"
                        placeholder="AGENCY / PORTFOLIO / BUSINESS"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                        Bộ lọc chính
                      </label>
                      <select
                        value={editingProject.filterTag}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            filterTag: e.target.value as any,
                          })
                        }
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs"
                      >
                        <option value="BRANDING">BRANDING</option>
                        <option value="WEB DESIGN">WEB DESIGN</option>
                        <option value="WEB DEVELOPMENT">WEB DEVELOPMENT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                      Mô tả dự án (Tiếng Việt)
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.description.vi}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          description: { ...editingProject.description, vi: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Project Image Picker with Computer Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                        Ảnh đại diện dự án (Project Image)
                      </label>
                      {editingProject.image && (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle size={12} />
                          {editingProject.image.startsWith('data:') ? 'Ảnh tải từ máy tính' : 'Ảnh từ URL / Thư viện'}
                        </span>
                      )}
                    </div>

                    {/* Hidden file input for project image */}
                    <input
                      ref={projectFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProjectImageFileUpload(file);
                        e.target.value = '';
                      }}
                    />

                    {/* Upload Drop Zone / Button */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleProjectImageFileUpload(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        isUploadingImage
                          ? 'border-black bg-zinc-100 opacity-80'
                          : 'border-zinc-300 hover:border-black bg-white hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 flex-shrink-0">
                          <Upload size={20} className={isUploadingImage ? 'animate-bounce' : ''} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            {isUploadingImage ? 'Đang nén và xử lý ảnh...' : 'Tải ảnh trực tiếp từ máy tính lên'}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Hỗ trợ JPG, PNG, WebP, GIF, SVG. Kéo thả file ảnh vào đây hoặc bấm nút để chọn tệp.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          onClick={() => projectFileInputRef.current?.click()}
                          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <Upload size={14} />
                          <span>{isUploadingImage ? 'Đang xử lý...' : 'Chọn ảnh từ máy tính'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Preview & URL Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-white p-3.5 border border-zinc-200 rounded-xl">
                      <div className="sm:col-span-1">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 relative group">
                          {editingProject.image ? (
                            <>
                              <img
                                src={editingProject.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = SAMPLE_IMAGES[0].url;
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setEditingProject({ ...editingProject, image: '' })}
                                className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Xóa ảnh này"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-[10px]">
                              <ImageIcon size={22} className="mb-1 text-zinc-400" />
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-3 space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                            Hoặc dán đường dẫn ảnh (URL):
                          </label>
                          <input
                            type="text"
                            value={editingProject.image}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, image: e.target.value })
                            }
                            placeholder="https://... hoặc data:image/..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black font-mono text-[11px]"
                          />
                        </div>

                        {/* Quick preset images */}
                        <div>
                          <span className="text-[10px] text-zinc-400 font-medium block mb-1">
                            Hoặc chọn nhanh ảnh mẫu có sẵn:
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {SAMPLE_IMAGES.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setEditingProject({ ...editingProject, image: img.url })}
                                className={`flex-shrink-0 w-8 h-8 rounded border overflow-hidden transition-all ${
                                  editingProject.image === img.url
                                    ? 'border-black ring-2 ring-black'
                                    : 'border-zinc-200 opacity-60 hover:opacity-100'
                                }`}
                                title={img.label}
                              >
                                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: QUẢN LÝ DỊCH VỤ (SERVICES MANAGEMENT)              */}
            {/* ======================================================== */}
            {activeTab === 'services' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 flex items-center gap-2.5">
                      <Sparkles className="text-zinc-900" size={24} />
                      <span>Quản lý Dịch vụ (Services Studio)</span>
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Thêm mới, chỉnh sửa nội dung song ngữ, chuyển đổi trạng thái <strong>Bản nháp (Draft) / Xuất bản</strong> và xóa an toàn vào thùng rác 30 ngày.
                    </p>
                  </div>

                  {!isCreatingService && !editingService && (
                    <button
                      onClick={startCreateService}
                      className="bg-black text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
                    >
                      <Plus size={15} />
                      <span>Tạo Dịch Vụ Mới</span>
                    </button>
                  )}
                </div>

                {/* Form: Create or Edit Service */}
                {(isCreatingService || editingService) && (
                  <form
                    onSubmit={handleSaveService}
                    className="bg-zinc-50 border-2 border-zinc-900 rounded-2xl p-6 sm:p-7 space-y-6 animate-in fade-in shadow-lg"
                  >
                    {/* Top Bar of Form */}
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingService(false);
                            setEditingService(null);
                          }}
                          className="p-1.5 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                          title="Quay lại danh sách"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 font-serif">
                            {editingService
                              ? `Chỉnh sửa Dịch Vụ: #${serviceForm.number} - ${serviceForm.title_vi || serviceForm.title_en}`
                              : 'Tạo Dịch Vụ Mới'}
                          </h4>
                          <p className="text-[11px] text-zinc-500">
                            Điền thông tin song ngữ (Tiếng Việt & English) và danh sách năng lực cốt lõi
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingService(false);
                          setEditingService(null);
                        }}
                        className="text-zinc-400 hover:text-black p-1.5 rounded-lg hover:bg-zinc-200/60 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Number & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Số hiệu / Thứ tự hiển thị *
                        </label>
                        <input
                          type="text"
                          required
                          value={serviceForm.number}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, number: e.target.value })
                          }
                          placeholder="VD: 01, 02, 03..."
                          className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-black"
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Hiển thị nổi bật ở góc dịch vụ (VD: 01, 02, 03, 04)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Trạng thái xuất bản
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setServiceForm({ ...serviceForm, status: 'published' })
                            }
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                              serviceForm.status === 'published'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Đã xuất bản (Live)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setServiceForm({ ...serviceForm, status: 'draft' })
                            }
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                              serviceForm.status === 'draft'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            <Clock size={13} />
                            <span>Bản nháp (Draft)</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {serviceForm.status === 'published'
                            ? 'Dịch vụ sẽ hiển thị công khai trên website.'
                            : 'Chỉ lưu nội bộ trong CMS, không hiển thị ra ngoài.'}
                        </p>
                      </div>
                    </div>

                    {/* Titles (VI & EN) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Tên dịch vụ (Tiếng Việt) *
                        </label>
                        <input
                          type="text"
                          required
                          value={serviceForm.title_vi}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, title_vi: e.target.value })
                          }
                          placeholder="VD: Chiến Lược Thương Hiệu"
                          className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Tên dịch vụ (English)
                        </label>
                        <input
                          type="text"
                          value={serviceForm.title_en}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, title_en: e.target.value })
                          }
                          placeholder="VD: Brand Strategy"
                          className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Descriptions (VI & EN) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Mô tả dịch vụ (Tiếng Việt)
                        </label>
                        <textarea
                          rows={3}
                          value={serviceForm.description_vi}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, description_vi: e.target.value })
                          }
                          placeholder="Mô tả chi tiết giá trị và phương pháp triển khai dịch vụ..."
                          className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Mô tả dịch vụ (English)
                        </label>
                        <textarea
                          rows={3}
                          value={serviceForm.description_en}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, description_en: e.target.value })
                          }
                          placeholder="Detailed description of value proposition and delivery approach..."
                          className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-xs leading-relaxed focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Features / Capabilities (VI & EN) */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={15} className="text-zinc-700" />
                          <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-800">
                            Năng lực cốt lõi / Gạch đầu dòng tính năng (Core Capabilities)
                          </h5>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* VI Bullets */}
                        <div className="space-y-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                            Năng lực (Tiếng Việt)
                          </span>
                          {serviceForm.features_vi.map((item, idx) => (
                            <div key={`feat-vi-${idx}`} className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-400 w-4 text-right">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const next = [...serviceForm.features_vi];
                                  next[idx] = e.target.value;
                                  setServiceForm({ ...serviceForm, features_vi: next });
                                }}
                                placeholder={`Năng lực ${idx + 1}...`}
                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = serviceForm.features_vi.filter((_, i) => i !== idx);
                                  setServiceForm({ ...serviceForm, features_vi: next });
                                }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Xóa dòng này"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setServiceForm({
                                ...serviceForm,
                                features_vi: [...serviceForm.features_vi, 'Năng lực mới'],
                              });
                            }}
                            className="text-xs font-semibold text-black hover:underline flex items-center gap-1 mt-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Thêm gạch đầu dòng (VI)</span>
                          </button>
                        </div>

                        {/* EN Bullets */}
                        <div className="space-y-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                            Năng lực (English)
                          </span>
                          {serviceForm.features_en.map((item, idx) => (
                            <div key={`feat-en-${idx}`} className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-400 w-4 text-right">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const next = [...serviceForm.features_en];
                                  next[idx] = e.target.value;
                                  setServiceForm({ ...serviceForm, features_en: next });
                                }}
                                placeholder={`Capability ${idx + 1}...`}
                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const next = serviceForm.features_en.filter((_, i) => i !== idx);
                                  setServiceForm({ ...serviceForm, features_en: next });
                                }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete this bullet"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setServiceForm({
                                ...serviceForm,
                                features_en: [...serviceForm.features_en, 'New Capability'],
                              });
                            }}
                            className="text-xs font-semibold text-black hover:underline flex items-center gap-1 mt-1.5 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Add bullet point (EN)</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Nhãn nút liên hệ (Tiếng Việt)
                        </label>
                        <input
                          type="text"
                          value={serviceForm.linkText_vi}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, linkText_vi: e.target.value })
                          }
                          placeholder="VD: Bắt đầu hợp tác"
                          className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                          Nhãn nút liên hệ (English)
                        </label>
                        <input
                          type="text"
                          value={serviceForm.linkText_en}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, linkText_en: e.target.value })
                          }
                          placeholder="VD: Start Collaboration"
                          className="w-full bg-white border border-zinc-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="bg-zinc-900 text-white rounded-xl p-5 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                          Mô phỏng hiển thị trên website (Live Preview)
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            serviceForm.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {serviceForm.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                        </span>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">
                            {serviceForm.number || '01'}
                          </span>
                          <h4 className="text-base font-bold font-serif text-white">
                            {serviceForm.title_vi || 'Tên Dịch Vụ'}
                          </h4>
                          {serviceForm.title_en && (
                            <span className="text-xs text-zinc-400 italic">
                              ({serviceForm.title_en})
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {serviceForm.description_vi || 'Mô tả ngắn gọn về dịch vụ này...'}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {serviceForm.features_vi.map((f, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-zinc-900 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                            >
                              <Check size={11} className="text-emerald-400" />
                              <span>{f}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingService(false);
                          setEditingService(null);
                        }}
                        className="px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Save size={14} />
                        <span>{editingService ? 'Lưu Thay Đổi Dịch Vụ' : 'Tạo Dịch Vụ Mới'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Services List View */}
                {!isCreatingService && !editingService && (
                  <div className="space-y-5">
                    {/* Search & Status Filter Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/80 p-3 rounded-xl">
                      {/* Status Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        <button
                          onClick={() => setServiceStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            serviceStatusFilter === 'all'
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'text-zinc-600 hover:bg-zinc-200/60'
                          }`}
                        >
                          Tất cả ({services.length})
                        </button>

                        <button
                          onClick={() => setServiceStatusFilter('published')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            serviceStatusFilter === 'published'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-zinc-600 hover:bg-zinc-200/60'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>
                            Đã xuất bản ({services.filter((s) => (s.status || 'published') === 'published').length})
                          </span>
                        </button>

                        <button
                          onClick={() => setServiceStatusFilter('draft')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            serviceStatusFilter === 'draft'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-zinc-600 hover:bg-zinc-200/60'
                          }`}
                        >
                          <Clock size={12} />
                          <span>
                            Bản nháp ({services.filter((s) => s.status === 'draft').length})
                          </span>
                        </button>
                      </div>

                      {/* Search Box */}
                      <div className="relative min-w-[200px]">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                          type="text"
                          value={serviceSearchTerm}
                          onChange={(e) => setServiceSearchTerm(e.target.value)}
                          placeholder="Tìm kiếm dịch vụ..."
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Empty State */}
                    {filteredServices.length === 0 && (
                      <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                          <Sparkles size={24} />
                        </div>
                        <h4 className="font-semibold text-sm text-zinc-800">
                          {serviceSearchTerm
                            ? 'Không tìm thấy dịch vụ nào phù hợp với từ khóa'
                            : 'Chưa có dịch vụ nào trong mục này'}
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                          Bạn có thể bấm nút "Tạo Dịch Vụ Mới" ở trên để bắt đầu thêm dịch vụ vào hệ thống.
                        </p>
                        <button
                          onClick={startCreateService}
                          className="bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Tạo Dịch Vụ Đầu Tiên</span>
                        </button>
                      </div>
                    )}

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredServices.map((srv) => {
                        const isPublished = (srv.status || 'published') === 'published';
                        const srvTitleVi = srv.title?.vi || (typeof srv.title === 'string' ? srv.title : '');
                        const srvTitleEn = srv.title?.en || '';
                        const srvDescVi = srv.description?.vi || (typeof srv.description === 'string' ? srv.description : '');
                        const featList = Array.isArray(srv.features?.vi)
                          ? srv.features.vi
                          : Array.isArray(srv.features)
                          ? srv.features
                          : [];

                        return (
                          <div
                            key={srv.id}
                            className={`bg-white border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-2xs hover:shadow-md ${
                              isPublished
                                ? 'border-zinc-200 hover:border-zinc-400'
                                : 'border-amber-200 bg-amber-50/20'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top Bar: Number + Status */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold bg-zinc-900 text-white px-2.5 py-0.5 rounded">
                                  #{srv.number || '01'}
                                </span>

                                <div className="flex items-center gap-2">
                                  {isPublished ? (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>Đã Xuất Bản</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                      <Clock size={11} />
                                      <span>Bản Nháp (Draft)</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Titles */}
                              <div>
                                <h4 className="font-bold text-base text-zinc-900 font-serif">
                                  {srvTitleVi}
                                </h4>
                                {srvTitleEn && (
                                  <p className="text-xs text-zinc-400 italic">
                                    EN: {srvTitleEn}
                                  </p>
                                )}
                              </div>

                              {/* Description */}
                              {srvDescVi && (
                                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                                  {srvDescVi}
                                </p>
                              )}

                              {/* Capabilities preview */}
                              {featList.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    Năng lực cốt lõi ({featList.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {featList.slice(0, 3).map((f, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200/80"
                                      >
                                        • {f}
                                      </span>
                                    ))}
                                    {featList.length > 3 && (
                                      <span className="text-[10px] text-zinc-400 font-medium self-center">
                                        +{featList.length - 3} nữa
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Footer: Quick Actions */}
                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                              {/* Quick Draft/Publish Toggle */}
                              <button
                                onClick={() => handleToggleServiceStatus(srv)}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                                  isPublished
                                    ? 'text-zinc-600 bg-zinc-50 border-zinc-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={
                                  isPublished
                                    ? 'Chuyển dịch vụ này sang Bản nháp (ẩn khỏi web)'
                                    : 'Xuất bản dịch vụ này lên website'
                                }
                              >
                                {isPublished ? (
                                  <>
                                    <Clock size={12} />
                                    <span>Chuyển sang Nháp</span>
                                  </>
                                ) : (
                                  <>
                                    <Check size={12} />
                                    <span>Xuất bản ngay</span>
                                  </>
                                )}
                              </button>

                              {/* Edit & Delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditService(srv)}
                                  className="px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-zinc-200"
                                  title="Chỉnh sửa dịch vụ"
                                >
                                  <Edit3 size={13} />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteService(srv)}
                                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa dịch vụ (Chuyển vào thùng rác 30 ngày)"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: BỘ LỌC CHÍNH & BADGE (TAXONOMY & BADGE STUDIO)     */}
            {/* ======================================================== */}
            {activeTab === 'taxonomies' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 flex items-center gap-2.5">
                      <Tag className="text-zinc-900" size={24} />
                      <span>Quản lý Bộ Lọc Chính & BADGE</span>
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Toàn quyền thêm, sửa, xóa, đổi màu sắc cho <strong>Thẻ BADGE</strong> góc ảnh và cấu hình <strong>Bộ Lọc chính</strong> hiển thị trên Header trang chủ & thanh lọc dự án.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {taxonomyTab === 'badges' && (
                      <button
                        onClick={startCreateEditorialTag}
                        className="bg-black text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus size={15} />
                        <span>Tạo BADGE Mới</span>
                      </button>
                    )}
                    {taxonomyTab === 'filters' && (
                      <button
                        onClick={startCreateCategory}
                        className="bg-black text-white hover:bg-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus size={15} />
                        <span>Thêm Bộ Lọc Chính</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtabs: 1. BADGE vs 2. Main Filters vs 3. Quick Matrix */}
                <div className="flex border-b border-zinc-200 gap-3 overflow-x-auto">
                  <button
                    onClick={() => {
                      setTaxonomyTab('badges');
                      setIsCreatingEditorialTag(false);
                      setEditingEditorialTag(null);
                    }}
                    className={`pb-3.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
                      taxonomyTab === 'badges'
                        ? 'border-black text-black'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <Palette size={15} />
                    <span>1. Quản lý BADGE (Thẻ Nhãn)</span>
                    <span className="bg-zinc-100 text-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {editorialTags.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setTaxonomyTab('filters');
                      setIsCreatingCategory(false);
                      setEditingCategory(null);
                    }}
                    className={`pb-3.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
                      taxonomyTab === 'filters'
                        ? 'border-black text-black'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <Filter size={15} />
                    <span>2. Bộ Lọc Chính (Main Categories)</span>
                    <span className="bg-zinc-100 text-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {categories.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setTaxonomyTab('matrix')}
                    className={`pb-3.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap ${
                      taxonomyTab === 'matrix'
                        ? 'border-black text-black'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <Layers size={15} />
                    <span>3. Gán Nhanh (Quick Matrix)</span>
                    <span className="bg-zinc-100 text-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {posts.length + projects.length} mục
                    </span>
                  </button>
                </div>

                {/* ======================================================== */}
                {/* SUBTAB 1: BADGE MANAGEMENT (ADD, EDIT, DELETE & THEMES)  */}
                {/* ======================================================== */}
                {taxonomyTab === 'badges' && (
                  <div className="space-y-6">
                    {/* Add / Edit BADGE Form */}
                    {(isCreatingEditorialTag || editingEditorialTag) && (
                      <form
                        onSubmit={handleSaveEditorialTag}
                        className="bg-zinc-50 border-2 border-zinc-900 rounded-2xl p-6 sm:p-7 space-y-6 animate-in fade-in shadow-lg"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-black text-white rounded-lg">
                              <Palette size={16} />
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-zinc-900">
                                {editingEditorialTag
                                  ? `Chỉnh sửa BADGE: ${editingEditorialTag.name}`
                                  : 'Tạo BADGE Mới Cho Bài Viết & Dự Án'}
                              </h4>
                              <p className="text-[11px] text-zinc-500">
                                Nhập tên mã badge, chọn phong cách bảng màu và cấu hình nhãn đa ngôn ngữ
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingEditorialTag(false);
                              setEditingEditorialTag(null);
                            }}
                            className="text-zinc-400 hover:text-black p-1.5 rounded-lg hover:bg-zinc-200/60 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Live BADGE Preview Box */}
                        <div className="bg-zinc-900 text-white p-4 sm:p-5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                              Mô phỏng hiển thị trên góc bài viết (Live Preview)
                            </span>
                            <span className="text-xs text-zinc-300">
                              Badge này sẽ hiển thị ở góc trên bên phải của ảnh thumbnail:
                            </span>
                          </div>

                          <div className="relative bg-zinc-950 p-4 rounded-lg border border-zinc-700 flex items-center justify-center min-w-[200px]">
                            <span
                              className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded select-none transition-all ${getBadgeColorClasses(
                                editorialTagForm.color
                              )}`}
                            >
                              {editorialTagForm.name.trim() || 'TÊN BADGE'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên BADGE (Mã Viết Hoa) *
                            </label>
                            <input
                              type="text"
                              required
                              value={editorialTagForm.name}
                              onChange={(e) =>
                                setEditorialTagForm({
                                  ...editorialTagForm,
                                  name: e.target.value.toUpperCase(),
                                })
                              }
                              placeholder="VD: WEB DESIGN, AGENCY..."
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1">
                              Tự động viết hoa (VD: EDITORIAL, STRATEGY, PORTFOLIO)
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Áp dụng cho đối tượng
                            </label>
                            <select
                              value={editorialTagForm.badgeType || 'both'}
                              onChange={(e) =>
                                setEditorialTagForm({
                                  ...editorialTagForm,
                                  badgeType: e.target.value as any,
                                })
                              }
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-black cursor-pointer"
                            >
                              <option value="both">Toàn hệ thống (Bài viết & Dự án)</option>
                              <option value="article">Chỉ Bài viết (Article Badge)</option>
                              <option value="project">Chỉ Dự án (Project Badge)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Bảng Phối Màu (Color Theme)
                            </label>
                            <select
                              value={editorialTagForm.color || 'dark'}
                              onChange={(e) =>
                                setEditorialTagForm({
                                  ...editorialTagForm,
                                  color: e.target.value,
                                })
                              }
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-black cursor-pointer"
                            >
                              <option value="dark">Đen Cổ Điển (Dark Classic)</option>
                              <option value="white">Trắng Sáng (Pure White)</option>
                              <option value="emerald">Xanh Ngọc (Emerald Forest)</option>
                              <option value="violet">Tím Hoàng Gia (Royal Violet)</option>
                              <option value="amber">Hổ Phách (Warm Amber)</option>
                              <option value="rose">Hồng Ruby (Rose Pink)</option>
                              <option value="blue">Xanh Biển (Ocean Blue)</option>
                              <option value="zinc">Ghi Slate (Slate Minimal)</option>
                              <option value="outline">Kính Mờ (Glass Outline)</option>
                            </select>
                          </div>
                        </div>

                        {/* Color Swatch Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                            Chọn nhanh bảng màu sắc cho BADGE:
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                            {[
                              { key: 'dark', label: 'Dark', bg: 'bg-black text-white' },
                              { key: 'white', label: 'White', bg: 'bg-white text-zinc-900 border border-zinc-300' },
                              { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-900 text-emerald-100' },
                              { key: 'violet', label: 'Violet', bg: 'bg-violet-900 text-violet-100' },
                              { key: 'amber', label: 'Amber', bg: 'bg-amber-900 text-amber-100' },
                              { key: 'rose', label: 'Rose', bg: 'bg-rose-900 text-rose-100' },
                              { key: 'blue', label: 'Blue', bg: 'bg-blue-900 text-blue-100' },
                              { key: 'zinc', label: 'Slate', bg: 'bg-zinc-800 text-zinc-200' },
                              { key: 'outline', label: 'Glass', bg: 'bg-zinc-900/60 text-white border border-white/40' },
                            ].map((sw) => (
                              <button
                                key={sw.key}
                                type="button"
                                onClick={() => setEditorialTagForm({ ...editorialTagForm, color: sw.key })}
                                className={`p-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                  sw.bg
                                } ${
                                  (editorialTagForm.color || 'dark') === sw.key
                                    ? 'ring-2 ring-black ring-offset-2 scale-105 shadow-md'
                                    : 'opacity-80 hover:opacity-100'
                                }`}
                              >
                                {sw.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên hiển thị tiếng Việt (Nhãn mô tả)
                            </label>
                            <input
                              type="text"
                              value={editorialTagForm.label_vi}
                              onChange={(e) =>
                                setEditorialTagForm({
                                  ...editorialTagForm,
                                  label_vi: e.target.value,
                                })
                              }
                              placeholder="VD: Thiết kế giao diện số"
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên hiển thị tiếng Anh (English Label)
                            </label>
                            <input
                              type="text"
                              value={editorialTagForm.label_en}
                              onChange={(e) =>
                                setEditorialTagForm({
                                  ...editorialTagForm,
                                  label_en: e.target.value,
                                })
                              }
                              placeholder="VD: Digital Interface Design"
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                            Ghi chú / Mô tả ngắn
                          </label>
                          <input
                            type="text"
                            value={editorialTagForm.description || ''}
                            onChange={(e) =>
                              setEditorialTagForm({
                                ...editorialTagForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Mục đích sử dụng của badge này..."
                            className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingEditorialTag(false);
                              setEditingEditorialTag(null);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                          >
                            <Save size={14} />
                            <span>{editingEditorialTag ? 'Lưu Thay Đổi BADGE' : 'Tạo BADGE Mới'}</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* BADGE Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {editorialTags.map((tag) => {
                        const postUsageCount = posts.filter(
                          (p) => (p.tag || '').toUpperCase() === tag.name.toUpperCase()
                        ).length;
                        const projUsageCount = projects.filter(
                          (p) => (p.categoryBadge || '').toUpperCase() === tag.name.toUpperCase()
                        ).length;
                        const badgeColorClass = getBadgeColorClasses(tag.color || 'dark');

                        return (
                          <div
                            key={tag.id}
                            className="bg-white border border-zinc-200 hover:border-zinc-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded select-none ${badgeColorClass}`}>
                                  {tag.name}
                                </span>

                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                  {tag.badgeType === 'project'
                                    ? 'Dự án'
                                    : tag.badgeType === 'article'
                                    ? 'Bài viết'
                                    : 'Toàn hệ thống'}
                                </span>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-zinc-800">
                                  {tag.label_vi || tag.name}
                                </p>
                                {tag.label_en && (
                                  <p className="text-[11px] text-zinc-400">EN: {tag.label_en}</p>
                                )}
                              </div>

                              {tag.description && (
                                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                  {tag.description}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                              <div className="flex items-center gap-1.5">
                                <span>Đang dùng:</span>
                                <span className="font-bold text-zinc-900">
                                  {postUsageCount} bài / {projUsageCount} dự án
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditEditorialTag(tag)}
                                  className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa BADGE"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEditorialTag(tag)}
                                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa BADGE (Chuyển vào thùng rác 30 ngày)"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SUBTAB 2: MAIN FILTERS MANAGEMENT (BLOG & WORK FILTERS)  */}
                {/* ======================================================== */}
                {taxonomyTab === 'filters' && (
                  <div className="space-y-6">
                    {/* Add / Edit Category Form */}
                    {(isCreatingCategory || editingCategory) && (
                      <form
                        onSubmit={handleSaveCategory}
                        className="bg-zinc-50 border-2 border-zinc-900 rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in shadow-lg"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-black text-white rounded-lg">
                              <Filter size={16} />
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-zinc-900">
                                {editingCategory
                                  ? `Sửa Bộ Lọc Chính: ${editingCategory.name}`
                                  : 'Tạo Bộ Lọc Chính Mới'}
                              </h4>
                              <p className="text-[11px] text-zinc-500">
                                Định nghĩa các nhóm danh mục chính trên thanh lọc Blog & Work
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingCategory(false);
                              setEditingCategory(null);
                            }}
                            className="text-zinc-400 hover:text-black p-1.5 rounded-lg hover:bg-zinc-200/60 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên Bộ Lọc (Mã/Slug) *
                            </label>
                            <input
                              type="text"
                              required
                              value={categoryForm.name}
                              onChange={(e) =>
                                setCategoryForm({ ...categoryForm, name: e.target.value.toUpperCase() })
                              }
                              placeholder="VD: BRANDING, STUDIO, NEWS..."
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1">Viết hoa, không dấu (VD: BRANDING, CODE)</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Phạm Vi Áp Dụng
                            </label>
                            <select
                              value={categoryForm.target || 'both'}
                              onChange={(e) =>
                                setCategoryForm({ ...categoryForm, target: e.target.value as any })
                              }
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-black cursor-pointer"
                            >
                              <option value="both">Cả Bài Viết (Blog) & Dự Án (Work)</option>
                              <option value="blog">Chỉ Lọc Bài Viết (Blog Articles)</option>
                              <option value="work">Chỉ Lọc Dự Án (Work Projects)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Thanh Điều Hướng Hero
                            </label>
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="checkbox"
                                id="showInHeroCheck"
                                checked={categoryForm.showInHero}
                                onChange={(e) =>
                                  setCategoryForm({ ...categoryForm, showInHero: e.target.checked })
                                }
                                className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                              />
                              <label htmlFor="showInHeroCheck" className="text-xs text-zinc-800 font-medium cursor-pointer">
                                Hiển thị nút bấm trên thanh Hero
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên hiển thị (Tiếng Việt)
                            </label>
                            <input
                              type="text"
                              value={categoryForm.label_vi}
                              onChange={(e) =>
                                setCategoryForm({ ...categoryForm, label_vi: e.target.value })
                              }
                              placeholder="VD: Xây dựng thương hiệu"
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                              Tên hiển thị (Tiếng Anh)
                            </label>
                            <input
                              type="text"
                              value={categoryForm.label_en}
                              onChange={(e) =>
                                setCategoryForm({ ...categoryForm, label_en: e.target.value })
                              }
                              placeholder="VD: Branding & Strategy"
                              className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                            Mô tả nội dung của Bộ Lọc
                          </label>
                          <input
                            type="text"
                            value={categoryForm.description}
                            onChange={(e) =>
                              setCategoryForm({ ...categoryForm, description: e.target.value })
                            }
                            placeholder="Mô tả tóm tắt nội dung thuộc nhóm bộ lọc này..."
                            className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingCategory(false);
                              setEditingCategory(null);
                            }}
                            className="px-4 py-2 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                          >
                            <Save size={14} />
                            <span>{editingCategory ? 'Lưu Thay Đổi Bộ Lọc' : 'Tạo Bộ Lọc Mới'}</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Categories List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((cat) => {
                        const postUsageCount = posts.filter(
                          (p) => (p.category || '').toUpperCase() === cat.name.toUpperCase()
                        ).length;
                        const projUsageCount = projects.filter(
                          (p) =>
                            (p.filterTag || '').toUpperCase() === cat.name.toUpperCase() ||
                            (p.secondaryTag || '').toUpperCase() === cat.name.toUpperCase()
                        ).length;

                        return (
                          <div
                            key={cat.id}
                            className="bg-white border border-zinc-200 hover:border-zinc-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="bg-black text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-2xs">
                                    {cat.name}
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-800">
                                    {cat.label_vi || cat.label_en || ''}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                    {cat.target === 'work'
                                      ? 'Dự án'
                                      : cat.target === 'blog'
                                      ? 'Blog'
                                      : 'Toàn trang'}
                                  </span>
                                  {cat.showInHero !== false && (
                                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Hero Bar
                                    </span>
                                  )}
                                </div>
                              </div>

                              {cat.label_en && cat.label_vi && (
                                <p className="text-[11px] text-zinc-400">EN: {cat.label_en}</p>
                              )}

                              {cat.description && (
                                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                                  {cat.description}
                                </p>
                              )}
                            </div>

                            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                              <div>
                                Đang có <span className="font-bold text-zinc-900">{postUsageCount}</span> bài viết, <span className="font-bold text-zinc-900">{projUsageCount}</span> dự án
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditCategory(cat)}
                                  className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa bộ lọc"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa bộ lọc (Chuyển vào thùng rác 30 ngày)"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* SUBTAB 3: QUICK ASSIGN MATRIX (DIRECT 1-CLICK ASSIGNMENT)*/}
                {/* ======================================================== */}
                {taxonomyTab === 'matrix' && (
                  <div className="space-y-4">
                    {/* Matrix Control Bar */}
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            value={matrixSearch}
                            onChange={(e) => setMatrixSearch(e.target.value)}
                            placeholder="Tìm bài viết hoặc dự án..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-black"
                          />
                        </div>

                        <div className="bg-zinc-200/80 p-0.5 rounded-lg flex items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => setMatrixFilterType('all')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                              matrixFilterType === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                            }`}
                          >
                            Tất cả ({posts.length + projects.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatrixFilterType('posts')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                              matrixFilterType === 'posts' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                            }`}
                          >
                            Bài viết ({posts.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatrixFilterType('projects')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                              matrixFilterType === 'projects' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                            }`}
                          >
                            Dự án ({projects.length})
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-500 text-right w-full sm:w-auto">
                        💡 <em>Đổi trực tiếp trong bảng — hệ thống tự động lưu lên Firestore ngay lập tức</em>
                      </div>
                    </div>

                    {/* Matrix Interactive Table */}
                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">Tên / Tiêu đề</th>
                              <th className="py-3 px-4 w-28">Loại</th>
                              <th className="py-3 px-4 w-52">Bộ Lọc Chính (Main Category)</th>
                              <th className="py-3 px-4 w-52">Thẻ BADGE (Corner Badge)</th>
                              <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200">
                            {/* Posts rows */}
                            {(matrixFilterType === 'all' || matrixFilterType === 'posts') &&
                              posts
                                .filter((p) =>
                                  !matrixSearch ||
                                  p.title.vi.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                                  p.title.en.toLowerCase().includes(matrixSearch.toLowerCase())
                                )
                                .map((post) => {
                                  const matchingBadge = editorialTags.find(
                                    (t) => t.name.toUpperCase() === (post.tag || '').toUpperCase()
                                  );

                                  return (
                                    <tr key={post.id} className="hover:bg-zinc-50/80 transition-colors">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={post.image}
                                            alt={post.title.vi}
                                            className="w-10 h-7 object-cover rounded border border-zinc-200 shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <p className="font-semibold text-zinc-900 truncate max-w-xs sm:max-w-md">
                                              {post.title.vi}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-mono">
                                              ID: {post.id}
                                            </p>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                                          <FileText size={11} />
                                          <span>Bài viết</span>
                                        </span>
                                      </td>

                                      <td className="py-3 px-4">
                                        <select
                                          value={post.category || 'BRANDING'}
                                          onChange={(e) => handleQuickAssignPostCategory(post, e.target.value)}
                                          className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black cursor-pointer"
                                        >
                                          {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                              {c.name} {c.label_vi ? `(${c.label_vi})` : ''}
                                            </option>
                                          ))}
                                        </select>
                                      </td>

                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={post.tag || 'EDITORIAL'}
                                            onChange={(e) => handleQuickAssignPostBadge(post, e.target.value)}
                                            className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black cursor-pointer"
                                          >
                                            {editorialTags.map((t) => (
                                              <option key={t.id} value={t.name}>
                                                {t.name}
                                              </option>
                                            ))}
                                          </select>
                                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${getBadgeColorClasses(matchingBadge?.color || 'dark')}`}>
                                            ●
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 text-center">
                                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                                          post.status === 'published'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                          {post.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}

                            {/* Projects rows */}
                            {(matrixFilterType === 'all' || matrixFilterType === 'projects') &&
                              projects
                                .filter((pr) =>
                                  !matrixSearch ||
                                  pr.name.toLowerCase().includes(matrixSearch.toLowerCase())
                                )
                                .map((proj) => {
                                  const matchingBadge = editorialTags.find(
                                    (t) => t.name.toUpperCase() === (proj.categoryBadge || '').toUpperCase()
                                  );

                                  return (
                                    <tr key={proj.id} className="hover:bg-zinc-50/80 transition-colors">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          <img
                                            src={proj.image}
                                            alt={proj.name}
                                            className="w-10 h-7 object-cover rounded border border-zinc-200 shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <p className="font-semibold text-zinc-900 truncate max-w-xs sm:max-w-md">
                                              {proj.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-mono">
                                              ID: {proj.id}
                                            </p>
                                          </div>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                                          <Briefcase size={11} />
                                          <span>Dự án</span>
                                        </span>
                                      </td>

                                      <td className="py-3 px-4">
                                        <select
                                          value={proj.filterTag || 'BRANDING'}
                                          onChange={(e) => handleQuickAssignProjectFilter(proj, e.target.value)}
                                          className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black cursor-pointer"
                                        >
                                          {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                              {c.name} {c.label_vi ? `(${c.label_vi})` : ''}
                                            </option>
                                          ))}
                                        </select>
                                      </td>

                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={proj.categoryBadge || 'AGENCY'}
                                            onChange={(e) => handleQuickAssignProjectBadge(proj, e.target.value)}
                                            className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-black cursor-pointer"
                                          >
                                            {editorialTags.map((t) => (
                                              <option key={t.id} value={t.name}>
                                                {t.name}
                                              </option>
                                            ))}
                                          </select>
                                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${getBadgeColorClasses(matchingBadge?.color || 'zinc')}`}>
                                            ●
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-4 text-center">
                                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                                          proj.status === 'published'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                          {proj.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                                        </span>
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
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: FOOTER STUDIO & NAVIGATION MANAGEMENT               */}
            {/* ======================================================== */}
            {activeTab === 'footer' && (
              <FooterStudio
                showNotification={showNotification}
                onRequestDelete={(type, item, name) =>
                  setDeleteModalState({
                    isOpen: true,
                    type,
                    item,
                    name,
                  })
                }
              />
            )}

            {/* ======================================================== */}
            {/* TAB: SITE HEADERS & PAGE CONTENT SETTINGS                */}
            {/* ======================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                      Nội dung các Header & Trang
                    </h2>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                      Tự do cập nhật tiêu đề, phụ đề và thông điệp cho 5 mục: TRANG CHỦ, DỰ ÁN, DỊCH VỤ, BÀI VIẾT, KẾT NỐI.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="bg-black text-white hover:bg-zinc-800 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Save size={16} />
                    <span>Lưu Cài Đặt</span>
                  </button>
                </div>

                {/* Sub-tabs for the 5 Headers */}
                <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2">
                  {(
                    [
                      { id: 'home', label: '1. TRANG CHỦ' },
                      { id: 'work', label: '2. DỰ ÁN' },
                      { id: 'services', label: '3. DỊCH VỤ' },
                      { id: 'blog', label: '4. BÀI VIẾT' },
                      { id: 'connect', label: '5. KẾT NỐI' },
                      { id: 'typography', label: '6. PHÔNG & CỠ CHỮ (H1 & NAV)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsSubTab(item.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                        settingsSubTab === item.id
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Form for selected header */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-5">
                  {settingsSubTab === 'home' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-zinc-900">
                        Cấu hình Nội dung TRANG CHỦ (Homepage)
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề lớn Hero (Tiếng Việt)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.home.heroTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              home: { ...settingsForm.home, heroTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề lớn Hero (English)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.home.heroTitle_en}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              home: { ...settingsForm.home, heroTitle_en: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Phụ đề Hero (Tiếng Việt)
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.home.heroSubtitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              home: { ...settingsForm.home, heroSubtitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề phần Dịch Vụ (What We Do)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.home.whatWeDoTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              home: { ...settingsForm.home, whatWeDoTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề phần Quy Trình (How We Work)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.home.howWeWorkTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              home: { ...settingsForm.home, howWeWorkTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'work' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-zinc-900">
                        Cấu hình Trang DỰ ÁN (Work Page)
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề trang (Tiếng Việt)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.work.title_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              work: { ...settingsForm.work, title_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Phụ đề giới thiệu dự án
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.work.subtitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              work: { ...settingsForm.work, subtitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'services' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-zinc-900">
                        Cấu hình Trang DỊCH VỤ (Services Page)
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề trang Dịch vụ
                        </label>
                        <input
                          type="text"
                          value={settingsForm.services.title_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              services: { ...settingsForm.services, title_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Phụ đề dịch vụ
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.services.subtitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              services: { ...settingsForm.services, subtitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'blog' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-zinc-900">
                        Cấu hình Trang BÀI VIẾT (Blog Page)
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề Hero Bài viết (Tiếng Việt)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.blog.heroTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              blog: { ...settingsForm.blog, heroTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Phụ đề Hero Bài viết (Tiếng Việt)
                        </label>
                        <textarea
                          rows={2}
                          value={settingsForm.blog.heroSubtitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              blog: { ...settingsForm.blog, heroSubtitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'connect' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-zinc-900">
                        Cấu hình Trang KẾT NỐI (Connect Page)
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề Kết nối (Hero Title)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.connect.heroTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              connect: { ...settingsForm.connect, heroTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
                          Tiêu đề phần Sứ mệnh (Our Mission)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.connect.missionTitle_vi}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              connect: { ...settingsForm.connect, missionTitle_vi: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2.5 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {settingsSubTab === 'typography' && (
                    <div className="space-y-6">
                      <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                            <Type size={16} className="text-zinc-900" />
                            <span>Tùy chỉnh Phông Chữ & Cỡ Chữ (Heading H1 & Navigation)</span>
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Cấu hình phông chữ và cỡ chữ chung cho toàn hệ thống website.
                          </p>
                        </div>
                      </div>

                      {/* Unified Font Mode Switch */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between gap-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-900 block">
                            Đồng bộ 1 phông chữ duy nhất cho cả Heading H1 và Menu Nav
                          </label>
                          <p className="text-[11px] text-zinc-500">
                            Khi bật, thanh điều hướng Nav sẽ áp dụng chung phông chữ với tiêu đề H1.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentTypo = settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
                            const nextUnified = !currentTypo.unifiedFont;
                            setSettingsForm({
                              ...settingsForm,
                              typography: {
                                ...currentTypo,
                                unifiedFont: nextUnified,
                                navFontFamily: nextUnified ? currentTypo.h1FontFamily : currentTypo.navFontFamily,
                              },
                            });
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                            settingsForm.typography?.unifiedFont ? 'bg-zinc-900' : 'bg-zinc-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                              settingsForm.typography?.unifiedFont ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* H1 Heading Font Family & Size */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                            Phông chữ cho Heading H1
                          </label>
                          <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                            {(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).h1CustomPx}px
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {AVAILABLE_FONTS.map((f) => {
                            const isSelected =
                              (settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).h1FontFamily === f.value;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                  const currentTypo = settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
                                  setSettingsForm({
                                    ...settingsForm,
                                    typography: {
                                      ...currentTypo,
                                      h1FontFamily: f.value,
                                      navFontFamily: currentTypo.unifiedFont ? f.value : currentTypo.navFontFamily,
                                    },
                                  });
                                }}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-zinc-900 bg-zinc-900 text-white font-semibold shadow-xs'
                                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-800'
                                }`}
                              >
                                <div style={{ fontFamily: f.value }} className="text-xl mb-1">
                                  Aa
                                </div>
                                <div className="text-[11px] font-medium truncate">{f.name}</div>
                              </button>
                            );
                          })}
                        </div>

                        {/* H1 Size Slider */}
                        <div className="space-y-1 pt-2 border-t border-zinc-100">
                          <div className="flex justify-between text-xs font-semibold text-zinc-600">
                            <span>Cỡ chữ H1 (px):</span>
                            <span>{(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).h1CustomPx}px</span>
                          </div>
                          <input
                            type="range"
                            min={32}
                            max={120}
                            step={2}
                            value={(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).h1CustomPx}
                            onChange={(e) => {
                              const currentTypo = settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
                              setSettingsForm({
                                ...settingsForm,
                                typography: {
                                  ...currentTypo,
                                  h1CustomPx: Number(e.target.value),
                                },
                              });
                            }}
                            className="w-full accent-zinc-900 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Nav Bar Font Size & Weight */}
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                            Cỡ chữ & Độ đậm cho Menu Nav Header
                          </label>
                          <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                            {(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).navFontSizePx}px / {(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).navFontWeight}
                          </span>
                        </div>

                        {/* Nav Size Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-zinc-600">
                            <span>Cỡ chữ Nav (px):</span>
                            <span>{(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).navFontSizePx}px</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={20}
                            step={1}
                            value={(settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).navFontSizePx}
                            onChange={(e) => {
                              const currentTypo = settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
                              setSettingsForm({
                                ...settingsForm,
                                typography: {
                                  ...currentTypo,
                                  navFontSizePx: Number(e.target.value),
                                },
                              });
                            }}
                            className="w-full accent-zinc-900 cursor-pointer"
                          />
                        </div>

                        {/* Nav Weight Selector */}
                        <div className="space-y-1 pt-2 border-t border-zinc-100">
                          <label className="text-xs font-semibold text-zinc-600 block">Độ đậm (Font Weight):</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['normal', 'medium', 'semibold', 'bold'].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => {
                                  const currentTypo = settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
                                  setSettingsForm({
                                    ...settingsForm,
                                    typography: {
                                      ...currentTypo,
                                      navFontWeight: w,
                                    },
                                  });
                                }}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer text-center ${
                                  (settingsForm.typography || DEFAULT_TYPOGRAPHY_SETTINGS).navFontWeight === w
                                    ? 'bg-zinc-900 text-white shadow-2xs'
                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: BACKUP & SEED                                     */}
            {/* ======================================================== */}
            {activeTab === 'backup' && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="border-b border-zinc-100 pb-5">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900">
                    Dữ liệu & Khôi phục (Backup & Restore)
                  </h2>
                  <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                    Quản lý sao lưu dữ liệu toàn bộ website hoặc khôi phục về trạng thái mẫu ban đầu.
                  </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-6">
                  {/* Export */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900">
                        Xuất file dữ liệu dự phòng (Export JSON)
                      </h4>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Tải về file JSON chứa toàn bộ bài viết, dự án và cấu hình của bạn.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const exportData = {
                          posts,
                          projects,
                          siteSettings,
                          exportDate: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `gocthuong_cms_backup_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        showNotification('Đã xuất file sao lưu thành công!');
                      }}
                      className="bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={15} />
                      <span>Tải file JSON</span>
                    </button>
                  </div>

                  <div className="h-px bg-zinc-200" />

                  {/* Reset to defaults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-rose-700">
                        Khôi phục dữ liệu mẫu ban đầu
                      </h4>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Đặt lại toàn bộ bài viết và dự án về bộ dữ liệu mẫu chuẩn của góc Thương.
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            'Bạn có chắc chắn muốn đặt lại dữ liệu về mặc định ban đầu không? Thao tác này sẽ ghi đè dữ liệu mẫu lên Firestore.'
                          )
                        ) {
                          await resetToDefaults();
                          showNotification('Đã khôi phục dữ liệu mẫu thành công!');
                        }
                      }}
                      className="border border-rose-300 text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      <span>Khôi phục mẫu</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: TRASH MANAGEMENT (THÙNG RÁC - 30 NGÀY)            */}
            {/* ======================================================== */}
            {activeTab === 'trash' && (
              <div className="max-w-5xl space-y-6">
                {/* Trash Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                        <Trash2 size={18} />
                      </span>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900">
                        Thùng rác & Lưu trữ tạm thời
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                      Mọi dự án, thẻ editorial, chuyên mục và bài viết khi xóa sẽ được giữ tại đây.
                      Hệ thống sẽ <strong>tự động quét và xóa vĩnh viễn sau 30 ngày</strong> kể từ ngày xóa.
                      Bạn có thể <strong>Khôi phục</strong> bất cứ lúc nào trước thời hạn 30 ngày.
                    </p>
                  </div>

                  {trashItems.length > 0 && (
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            'Bạn có chắc chắn muốn dọn sạch toàn bộ thùng rác ngay bây giờ? Tất cả mục trong thùng rác sẽ bị xóa vĩnh viễn khỏi hệ thống.'
                          )
                        ) {
                          await emptyTrash();
                          showNotification('Đã dọn sạch thùng rác thành công.');
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                    >
                      <Trash2 size={14} />
                      <span>Dọn sạch thùng rác</span>
                    </button>
                  )}
                </div>

                {/* 30-Day Policy Banner */}
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <div className="font-semibold text-amber-950">
                      Cơ chế an toàn 30 ngày (30-day Soft Delete Retention)
                    </div>
                    <p className="leading-relaxed text-amber-800/90">
                      Khi bấm nút xóa Dự án hoặc Thẻ, dữ liệu không bị xóa mất ngay mà được chuyển an toàn vào thùng rác này và ẩn khỏi website.
                      Hệ thống tự động tính ngày hết hạn và xóa sạch vĩnh viễn khi tròn 30 ngày.
                    </p>
                  </div>
                </div>

                {/* Filter Sub-navigation */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(
                    [
                      { key: 'all', label: 'Tất cả', count: trashItems.length },
                      {
                        key: 'project',
                        label: 'Dự án',
                        count: trashItems.filter((i) => i.type === 'project').length,
                      },
                      {
                        key: 'service',
                        label: 'Dịch vụ',
                        count: trashItems.filter((i) => i.type === 'service').length,
                      },
                      {
                        key: 'tag',
                        label: 'Thẻ BADGE',
                        count: trashItems.filter((i) => i.type === 'tag').length,
                      },
                      {
                        key: 'category',
                        label: 'Chuyên mục',
                        count: trashItems.filter((i) => i.type === 'category').length,
                      },
                      {
                        key: 'post',
                        label: 'Bài viết',
                        count: trashItems.filter((i) => i.type === 'post').length,
                      },
                      {
                        key: 'footer_link',
                        label: 'Link Footer',
                        count: trashItems.filter((i) => i.type === 'footer_link').length,
                      },
                      {
                        key: 'footer_column',
                        label: 'Cột Footer',
                        count: trashItems.filter((i) => i.type === 'footer_column').length,
                      },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setTrashFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        trashFilter === f.key
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          trashFilter === f.key
                            ? 'bg-zinc-700 text-white'
                            : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Trashed Items List */}
                {(() => {
                  const filteredTrash = trashItems.filter((item) =>
                    trashFilter === 'all' ? true : item.type === trashFilter
                  );

                  if (filteredTrash.length === 0) {
                    return (
                      <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                          <Trash2 size={24} />
                        </div>
                        <h4 className="font-semibold text-sm text-zinc-800">
                          {trashFilter === 'all'
                            ? 'Thùng rác hiện đang trống'
                            : `Không có mục nào thuộc loại "${trashFilter}" trong thùng rác`}
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                          Khi bạn xóa bất kỳ Dịch vụ, Dự án, Bài viết hoặc Thẻ nào trong CMS, mục đó sẽ được chuyển vào đây để lưu trữ an toàn trong 30 ngày trước khi tự động xóa vĩnh viễn.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredTrash.map((item) => {
                        const daysLeft = Math.max(
                          0,
                          Math.ceil(
                            (new Date(item.expiresAt).getTime() - Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )
                        );
                        const deletedDateStr = new Date(item.deletedAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const expireDateStr = new Date(item.expiresAt).toLocaleDateString('vi-VN');

                        const typeBadge = {
                          project: {
                            label: 'DỰ ÁN',
                            classes: 'bg-blue-50 text-blue-700 border-blue-200',
                          },
                          service: {
                            label: 'DỊCH VỤ',
                            classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          },
                          tag: {
                            label: 'THẺ BADGE',
                            classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          },
                          category: {
                            label: 'CHUYÊN MỤC',
                            classes: 'bg-purple-50 text-purple-700 border-purple-200',
                          },
                          post: {
                            label: 'BÀI VIẾT',
                            classes: 'bg-amber-50 text-amber-700 border-amber-200',
                          },
                          footer_link: {
                            label: 'LINK FOOTER',
                            classes: 'bg-teal-50 text-teal-700 border-teal-200',
                          },
                          footer_column: {
                            label: 'CỘT FOOTER',
                            classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                          },
                        }[item.type];

                        return (
                          <div
                            key={item.id}
                            className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${typeBadge.classes}`}
                                >
                                  {typeBadge.label}
                                </span>
                                <span className="text-[11px] text-zinc-400">
                                  Xóa lúc: {deletedDateStr}
                                </span>
                              </div>

                              <h4 className="font-semibold text-zinc-900 text-sm sm:text-base truncate">
                                {item.name}
                              </h4>

                              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                                <Clock size={13} className="flex-shrink-0" />
                                <span>
                                  Tự động xóa sau <strong>{daysLeft} ngày</strong> (vào ngày {expireDateStr})
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                              <button
                                onClick={async () => {
                                  await restoreFromTrash(item.id);
                                  showNotification(`Đã khôi phục "${item.name}" thành công!`);
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                                title="Khôi phục về trạng thái hoạt động"
                              >
                                <RotateCcw size={13} />
                                <span>Khôi phục</span>
                              </button>

                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `Bạn có chắc chắn muốn xóa vĩnh viễn "${item.name}" khỏi hệ thống ngay bây giờ? Không thể hoàn tác!`
                                    )
                                  ) {
                                    await deletePermanently(item.id);
                                    showNotification(`Đã xóa vĩnh viễn "${item.name}".`);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Xóa vĩnh viễn ngay lập tức"
                              >
                                <Trash2 size={13} />
                                <span>Xóa vĩnh viễn</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================ */}
      {/* POPUP XÁC NHẬN XÓA (CONFIRMATION MODAL WITH 30-DAY TRASH)   */}
      {/* ============================================================ */}
      {deleteModalState?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95">
            {/* Header with warning icon */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-900 font-serif">
                  {deleteModalState.type === 'project'
                    ? 'Xác nhận xóa Dự án'
                    : deleteModalState.type === 'service'
                    ? 'Xác nhận xóa Dịch vụ'
                    : deleteModalState.type === 'tag'
                    ? 'Xác nhận xóa Thẻ BADGE'
                    : deleteModalState.type === 'category'
                    ? 'Xác nhận xóa Chuyên mục'
                    : deleteModalState.type === 'footer_link'
                    ? 'Xác nhận xóa Liên kết Footer'
                    : deleteModalState.type === 'footer_column'
                    ? 'Xác nhận xóa Cột Footer'
                    : 'Xác nhận xóa Bài viết'}
                </h3>
                <p className="text-xs text-zinc-500">
                  Chuyển vào Thùng rác & tự động xóa sau 30 ngày
                </p>
              </div>
            </div>

            {/* Target Item Name Box */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {deleteModalState.type === 'project'
                  ? 'Tên Dự án'
                  : deleteModalState.type === 'service'
                  ? 'Tên Dịch vụ'
                  : deleteModalState.type === 'tag'
                  ? 'Tên Thẻ BADGE'
                  : deleteModalState.type === 'category'
                  ? 'Tên Chuyên mục'
                  : deleteModalState.type === 'footer_link'
                  ? 'Tên Liên kết Footer'
                  : deleteModalState.type === 'footer_column'
                  ? 'Tên Cột Footer'
                  : 'Tên Bài viết'}
              </div>
              <div className="font-semibold text-sm text-zinc-900">
                {deleteModalState.name}
              </div>
            </div>

            {/* 30-Day Auto Cleanup Notice */}
            <div className="space-y-2 text-xs text-zinc-600 leading-relaxed bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5">
              <div className="flex items-start gap-2 text-amber-900 font-semibold">
                <Clock size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <span>Chuyển vào thùng rác & tự động xóa sau 30 ngày</span>
              </div>
              <p className="text-amber-800/90 text-[11px] pl-6 leading-relaxed">
                Mục này sẽ được chuyển ngay vào <strong>Thùng rác</strong> và tạm ẩn khỏi website.
                Hệ thống sẽ lưu trữ và <strong>tự động xóa vĩnh viễn sau 30 ngày</strong>.
                Bạn có thể khôi phục lại bất kỳ lúc nào tại tab Thùng rác.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalState(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { type, item, name } = deleteModalState;
                  setDeleteModalState(null);

                  if (type === 'footer_link') {
                    const { columnId, link } = item;
                    const curFooter = siteSettings?.footer || DEFAULT_FOOTER_SETTINGS;
                    const updatedCols = (curFooter.columns || []).map((col) => {
                      if (col.id === columnId) {
                        return {
                          ...col,
                          links: col.links.filter((l) => l.id !== link.id),
                        };
                      }
                      return col;
                    });
                    await saveSiteSettings({
                      ...siteSettings,
                      footer: {
                        ...curFooter,
                        columns: updatedCols,
                      },
                    });
                  } else if (type === 'footer_column') {
                    const curFooter = siteSettings?.footer || DEFAULT_FOOTER_SETTINGS;
                    const updatedCols = (curFooter.columns || []).filter((c) => c.id !== item.id);
                    await saveSiteSettings({
                      ...siteSettings,
                      footer: {
                        ...curFooter,
                        columns: updatedCols,
                      },
                    });
                  }

                  await moveToTrash(type, item, name);
                  showNotification(`Đã chuyển "${name}" vào Thùng rác (Tự động xóa sau 30 ngày)`);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Đồng ý chuyển vào Thùng rác</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
