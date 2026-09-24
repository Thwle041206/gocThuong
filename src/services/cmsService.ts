import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Article,
  ARTICLES,
  WorkProject,
  WORK_PROJECTS,
  ServiceItem,
  SERVICES,
  UI_TEXT,
} from '../data/content';

export interface CMSPost extends Article {
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSProject extends WorkProject {
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSServiceItem extends ServiceItem {
  status?: 'draft' | 'published';
  order?: number;
  linkText?: { en: string; vi: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSCategory {
  id: string;
  name: string; // e.g. 'BRANDING'
  label_vi: string;
  label_en: string;
  description?: string;
  target?: 'blog' | 'work' | 'both';
  color?: string;
  showInHero?: boolean;
  order?: number;
}

export interface CMSEditorialTag {
  id: string;
  name: string; // e.g. 'EDITORIAL', 'WEB DESIGN', 'AGENCY', 'PORTFOLIO'
  label_vi: string;
  label_en: string;
  description?: string;
  badgeType?: 'article' | 'project' | 'both';
  color?: 'dark' | 'white' | 'emerald' | 'violet' | 'amber' | 'rose' | 'blue' | 'zinc' | 'outline' | string;
  order?: number;
}

export function getBadgeColorClasses(color?: string): string {
  switch (color) {
    case 'white':
    case 'light':
      return 'bg-white/95 text-zinc-900 border border-zinc-200/80 shadow-xs';
    case 'emerald':
    case 'green':
      return 'bg-emerald-900/90 text-emerald-100 border border-emerald-700/50 shadow-xs';
    case 'violet':
    case 'purple':
      return 'bg-violet-900/90 text-violet-100 border border-violet-700/50 shadow-xs';
    case 'amber':
    case 'yellow':
      return 'bg-amber-900/90 text-amber-100 border border-amber-700/50 shadow-xs';
    case 'rose':
    case 'red':
      return 'bg-rose-900/90 text-rose-100 border border-rose-700/50 shadow-xs';
    case 'blue':
    case 'sky':
      return 'bg-blue-900/90 text-blue-100 border border-blue-700/50 shadow-xs';
    case 'zinc':
    case 'gray':
      return 'bg-zinc-800/90 text-zinc-200 border border-zinc-700/50 shadow-xs';
    case 'outline':
      return 'bg-black/40 backdrop-blur-md text-white border border-white/30 shadow-xs';
    case 'dark':
    default:
      return 'bg-black/95 text-white border border-white/10 shadow-xs';
  }
}

export type TrashItemType = 'project' | 'tag' | 'category' | 'post' | 'service' | 'footer_link' | 'footer_column';

export interface CMSTrashItem {
  id: string;
  originalId: string;
  type: TrashItemType;
  name: string;
  deletedAt: string; // ISO date string
  expiresAt: string; // ISO date string: 30 days after deletion
  payload: any; // Full object data for recovery
}

export const DEFAULT_CATEGORIES: CMSCategory[] = [
  { id: 'cat-branding', name: 'BRANDING', label_vi: 'Xây dựng thương hiệu', label_en: 'Branding', description: 'Chiến lược & bộ nhận diện thương hiệu', target: 'both', showInHero: true, order: 1 },
  { id: 'cat-studio', name: 'STUDIO', label_vi: 'Đời sống Studio', label_en: 'Studio Culture', description: 'Góc nhìn nội bộ và văn hóa sáng tạo', target: 'blog', showInHero: true, order: 2 },
  { id: 'cat-news', name: 'NEWS', label_vi: 'Tin tức & Xu hướng', label_en: 'News & Trends', description: 'Cập nhật sự kiện và chuyển động thiết kế', target: 'blog', showInHero: true, order: 3 },
  { id: 'cat-web-design', name: 'WEB DESIGN', label_vi: 'Thiết kế Web UI/UX', label_en: 'Web Design', description: 'Giao diện & Trải nghiệm số đỉnh cao', target: 'both', showInHero: true, order: 4 },
  { id: 'cat-web-development', name: 'WEB DEVELOPMENT', label_vi: 'Phát triển Web & Code', label_en: 'Web Development', description: 'Hạ tầng và công nghệ lập trình', target: 'work', showInHero: true, order: 5 },
  { id: 'cat-design-system', name: 'DESIGN SYSTEM', label_vi: 'Hệ thống thiết kế', label_en: 'Design Systems', description: 'Quy chuẩn và ngôn ngữ thiết kế', target: 'blog', showInHero: true, order: 6 },
];

export const DEFAULT_EDITORIAL_TAGS: CMSEditorialTag[] = [
  { id: 'tag-editorial', name: 'EDITORIAL', label_vi: 'Tạp chí & Bài viết chọn lọc', label_en: 'Editorial', badgeType: 'article', color: 'dark', order: 1 },
  { id: 'tag-web-design', name: 'WEB DESIGN', label_vi: 'Thiết kế giao diện số', label_en: 'Web Design', badgeType: 'both', color: 'dark', order: 2 },
  { id: 'tag-typography', name: 'TYPOGRAPHY', label_vi: 'Nghệ thuật chữ & Font', label_en: 'Typography', badgeType: 'article', color: 'zinc', order: 3 },
  { id: 'tag-strategy', name: 'STRATEGY', label_vi: 'Chiến lược sáng tạo', label_en: 'Strategy', badgeType: 'article', color: 'emerald', order: 4 },
  { id: 'tag-case-study', name: 'CASE STUDY', label_vi: 'Phân tích dự án thực chiến', label_en: 'Case Study', badgeType: 'article', color: 'violet', order: 5 },
  { id: 'tag-interview', name: 'INTERVIEW', label_vi: 'Phỏng vấn chuyên sâu', label_en: 'Interview', badgeType: 'article', color: 'amber', order: 6 },
  { id: 'tag-agency', name: 'AGENCY', label_vi: 'Dự án Doanh nghiệp Agency', label_en: 'Agency', badgeType: 'project', color: 'dark', order: 7 },
  { id: 'tag-portfolio', name: 'PORTFOLIO', label_vi: 'Hồ sơ Cá nhân Portfolio', label_en: 'Portfolio', badgeType: 'project', color: 'blue', order: 8 },
  { id: 'tag-business', name: 'BUSINESS', label_vi: 'Doanh nghiệp Thương mại', label_en: 'Business', badgeType: 'project', color: 'rose', order: 9 },
  { id: 'tag-ecommerce', name: 'ECOMMERCE', label_vi: 'Thương mại điện tử E-com', label_en: 'E-commerce', badgeType: 'project', color: 'violet', order: 10 },
];

export interface CMSHomeServiceItem {
  num: string;
  title_vi: string;
  title_en: string;
  desc_vi: string;
  desc_en: string;
  link_vi: string;
  link_en: string;
}

export interface CMSHomeClientReview {
  variant: number;
  quote_vi: string;
  quote_en: string;
  body_vi: string;
  body_en: string;
  author: string;
  company: string;
  avatar: string;
}

export interface CMSHomeJoinCard {
  title_vi: string;
  title_en: string;
  desc_vi: string;
  desc_en: string;
  buttonText_vi: string;
  buttonText_en: string;
}

export interface CMSHomeSettings {
  // 1. Hero
  heroTitle_en: string;
  heroTitle_vi: string;
  heroSubtitle_en: string;
  heroSubtitle_vi: string;

  // 2. What We Do
  whatWeDoKicker_vi: string;
  whatWeDoKicker_en: string;
  whatWeDoTitle_en: string;
  whatWeDoTitle_vi: string;
  servicesList: CMSHomeServiceItem[];

  // 3. How We Work
  howWeWorkKicker_vi: string;
  howWeWorkKicker_en: string;
  howWeWorkTitle_en: string;
  howWeWorkTitle_vi: string;
  howWeWorkParagraph1_vi: string;
  howWeWorkParagraph1_en: string;
  howWeWorkParagraph2_vi: string;
  howWeWorkParagraph2_en: string;

  // Mosaic Photos
  mosaicImageTopWide: string;
  joinCard: CMSHomeJoinCard;
  mosaicImagePortrait: string;
  mosaicImageDesk: string;
  mosaicImageDiscussion: string;

  // 4. Featured Review Banner (Dark Banner)
  featuredReviewQuote_vi: string;
  featuredReviewQuote_en: string;
  featuredReviewBody_vi: string;
  featuredReviewBody_en: string;
  featuredReviewAuthor: string;
  featuredReviewCompany: string;
  featuredReviewAvatar: string;

  // 5. Our Clients Testimonials
  clientsKicker_vi: string;
  clientsKicker_en: string;
  clientsTitle_en: string;
  clientsTitle_vi: string;
  clientReviews: CMSHomeClientReview[];
}

export interface CMSFooterSocial {
  id: string;
  platform: 'instagram' | 'twitter' | 'behance' | 'pinterest' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'dribbble' | 'gmail' | 'telegram' | 'custom';
  label: string;
  url: string;
  isVisible: boolean;
}

export interface CMSFooterLinkItem {
  id: string;
  label: { vi: string; en: string };
  type: 'tab' | 'utility' | 'external' | 'admin';
  target: string; // tab name e.g. 'home' | 'services' | 'connect' | 'work' | 'blog' | 'contact' or external URL or utility key
  utilityContent?: {
    title: { vi: string; en: string };
    desc: { vi: string; en: string };
  };
  highlight?: boolean;
  isVisible: boolean;
}

export interface CMSFooterColumn {
  id: string;
  title: { vi: string; en: string };
  isVisible: boolean;
  links: CMSFooterLinkItem[];
}

export interface CMSFooterCtaButton {
  isVisible: boolean;
  label: { vi: string; en: string };
  type: 'utility' | 'external' | 'tab';
  target: string;
  utilityContent?: {
    title: { vi: string; en: string };
    desc: { vi: string; en: string };
  };
}

export interface CMSFooterSettings {
  brandSub: {
    vi: string;
    en: string;
  };
  socials: CMSFooterSocial[];
  columns: CMSFooterColumn[];
  ctaButton: CMSFooterCtaButton;
  copyright: {
    vi: string;
    en: string;
  };
  locations: string[];
}

export interface CMSTypographySettings {
  unifiedFont: boolean; // Dùng 1 dạng phông chữ chung cho cả H1 và Nav
  h1FontFamily: string; // Phông chữ cho Heading H1
  h1CustomPx: number; // Cỡ chữ cho Heading H1 (in px)
  navFontFamily: string; // Phông chữ cho Nav Menu
  navFontSizePx: number; // Cỡ chữ cho Nav Menu (in px)
  navFontWeight: string; // 'normal' | 'medium' | 'semibold' | 'bold'
}

export const AVAILABLE_FONTS = [
  { id: 'cormorant', name: 'Cormorant Garamond', value: "'Cormorant Garamond', Georgia, serif", category: 'Serif Cổ Điển & Tạp Chí' },
  { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', Georgia, serif", category: 'Serif Sang Trọng & Hiện Đại' },
  { id: 'instrument', name: 'Instrument Serif', value: "'Instrument Serif', Georgia, serif", category: 'Serif Sắc Thảo & Ý Niệm' },
  { id: 'bodoni', name: 'Bodoni Moda', value: "'Bodoni Moda', serif", category: 'Serif Thời Trang & Cao Cấp' },
  { id: 'jakarta', name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', system-ui, sans-serif", category: 'Sans Số Hóa & Hiện Đại' },
  { id: 'inter', name: 'Inter', value: "'Inter', system-ui, sans-serif", category: 'Sans Tối Giản & Chuẩn Mực' },
  { id: 'space', name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", category: 'Display Công Nghệ & Độc Bản' },
  { id: 'syne', name: 'Syne', value: "'Syne', sans-serif", category: 'Display Sáng Tạo & Nghệ Thuật' },
];

export const DEFAULT_TYPOGRAPHY_SETTINGS: CMSTypographySettings = {
  unifiedFont: false,
  h1FontFamily: "'Cormorant Garamond', Georgia, serif",
  h1CustomPx: 80,
  navFontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  navFontSizePx: 12,
  navFontWeight: 'medium',
};

export interface CMSSiteSettings {
  home: CMSHomeSettings;
  work: {
    title_en: string;
    title_vi: string;
    subtitle_en: string;
    subtitle_vi: string;
  };
  services: {
    title_en: string;
    title_vi: string;
    subtitle_en: string;
    subtitle_vi: string;
  };
  blog: {
    heroTitle_en: string;
    heroTitle_vi: string;
    heroSubtitle_en: string;
    heroSubtitle_vi: string;
  };
  connect: {
    heroTitle_en: string;
    heroTitle_vi: string;
    heroSubtitle_en: string;
    heroSubtitle_vi: string;
    missionTitle_en: string;
    missionTitle_vi: string;
  };
  footer: CMSFooterSettings;
  typography?: CMSTypographySettings;
}

export const DEFAULT_HOME_SERVICES: CMSHomeServiceItem[] = [
  {
    num: '01',
    title_vi: 'Branding',
    title_en: 'Branding',
    desc_vi: 'Kiến tạo nhận diện thương hiệu gợi cảm hứng và xây dựng kết nối bền lâu với công chúng.',
    desc_en: 'Crafting identities that resonate and inspire lasting connections with audiences.',
    link_vi: 'VỀ BRANDING',
    link_en: 'ABOUT BRANDING',
  },
  {
    num: '02',
    title_vi: 'Web Design',
    title_en: 'Web Design',
    desc_vi: 'Thiết kế giao diện trực quan cuốn hút người dùng và tối ưu tương tác mượt mà.',
    desc_en: 'Designing intuitive interfaces that captivate users and drive engagement seamlessly.',
    link_vi: 'VỀ THIẾT KẾ WEB',
    link_en: 'ABOUT WEB DESIGN',
  },
  {
    num: '03',
    title_vi: 'Web Development',
    title_en: 'Web Development',
    desc_vi: 'Xây dựng nền tảng công nghệ số vững chắc đáp ứng riêng biệt nhu cầu thương hiệu.',
    desc_en: "Building robust digital infrastructures tailored to your brand's unique needs.",
    link_vi: 'VỀ PHÁT TRIỂN WEB',
    link_en: 'ABOUT WEB DEVELOPMENT',
  },
  {
    num: '04',
    title_vi: 'SEO & Content',
    title_en: 'SEO & Content',
    desc_vi: 'Tối ưu hóa nội dung và chiến lược để thúc đẩy độ hiển thị và lưu lượng tự nhiên.',
    desc_en: 'Optimizing content and strategies to boost visibility and organic reach.',
    link_vi: 'VỀ SEO & NỘI DUNG',
    link_en: 'ABOUT SEO & CONTENT',
  },
];

export const DEFAULT_HOME_CLIENT_REVIEWS: CMSHomeClientReview[] = [
  {
    variant: 1,
    quote_vi: 'Dịch vụ xuất sắc, vượt trên kỳ vọng. Hiroki đã bàn giao những thiết kế tuyệt mỹ một cách nhanh chóng.',
    quote_en: 'Exceptional service, exceeded expectations. Hiroki delivered stunning designs promptly.',
    body_vi: 'Sự tỉ mỉ đến từng chi tiết và khả năng lắng nghe tuyệt vời đã giúp toàn bộ quy trình diễn ra vô cùng suôn sẻ. Rất khuyến nghị dịch vụ xây dựng thương hiệu và phát triển web của họ.',
    body_en: 'Their attention to detail and communication made the process seamless. Highly recommend their services for branding and web development.',
    author: 'Sarah Johnson',
    company: 'JOHNSON & CO.',
    avatar: '/src/assets/images/team_sarah_lee_1790135127741.jpg',
  },
  {
    variant: 2,
    quote_vi: 'Đội ngũ chuyên nghiệp, đáng tin cậy và tay nghề cao. Đã giúp tăng trưởng mạnh mẽ độ nhận diện trực tuyến của chúng tôi.',
    quote_en: 'Professional, reliable, and highly skilled team. Significantly boosted our online visibility.',
    body_vi: 'Chuyên môn sâu của Hiroki về SEO và chiến lược nội dung đã nâng tầm thương hiệu của chúng tôi trên không gian số. Sự tận tụy đồng hành xuyên suốt mang lại trải nghiệm hợp tác rất hài lòng.',
    body_en: "Hiroki's expertise in SEO and content strategy significantly boosted our online visibility. Their dedication to our project's success was evident throughout. A pleasure to work with.",
    author: 'David Lee',
    company: 'INNOVATIONS LTD.',
    avatar: '/src/assets/images/team_david_brown_1790135150592.jpg',
  },
  {
    variant: 3,
    quote_vi: 'Những thiết kế sáng tạo đột phá, được may đo hoàn hảo theo đúng nhu cầu của chúng tôi.',
    quote_en: 'Innovative designs tailored perfectly to our needs.',
    body_vi: 'Đội ngũ thiết kế của Hiroki đã nắm bắt trọn vẹn bản sắc thương hiệu của chúng tôi. Cách làm việc đồng hành chặt chẽ giúp hiện thực hóa tầm nhìn một cách hoàn hảo.',
    body_en: 'Hiroki’s web design team captured our brand essence brilliantly. Their collaborative approach ensured our vision translated seamlessly into our digital presence. Highly recommended.',
    author: 'Emily Chen',
    company: 'CREATIVE AGENCY',
    avatar: '/src/assets/images/team_emil_johnson_1790135108227.jpg',
  },
  {
    variant: 4,
    quote_vi: 'Đối tác tin cậy cho thành công kỹ thuật số. Người đồng hành không thể thiếu cho các dự án tương lai.',
    quote_en: 'Reliable partners for digital success. A trusted partner for our future projects.',
    body_vi: 'Hiroki mang đến dịch vụ phát triển web xuất sắc, vượt xa sự mong đợi ban đầu. Sự chuyên nghiệp và chuẩn mực cao làm cho tiến độ luôn thông suốt.',
    body_en: 'Hiroki provided exceptional web development services, exceeding our expectations. Their professionalism and attention to detail made the process smooth.',
    author: 'Michael Thompson',
    company: 'THOMPSON LLC',
    avatar: '/src/assets/images/creative_man_notebook_1790135085678.jpg',
  },
];

export const DEFAULT_HOME_SETTINGS: CMSHomeSettings = {
  heroTitle_en: 'A digital agency from Tokyo.',
  heroTitle_vi: 'Một digital agency từ Tokyo.',
  heroSubtitle_en: "Transform your brand's identity and digital footprint with our specialized services.",
  heroSubtitle_vi: 'Chuyển đổi nhận diện thương hiệu và dấu ấn kỹ thuật số của bạn với các dịch vụ chuyên biệt của chúng tôi.',

  whatWeDoKicker_vi: 'DỊCH VỤ CỦA CHÚNG TÔI',
  whatWeDoKicker_en: 'WHAT WE DO',
  whatWeDoTitle_en: 'Comprehensive solutions tailored to enhance visibility, engagement, and success.',
  whatWeDoTitle_vi: 'Giải pháp toàn diện được may đo để nâng cao độ nhận diện, tương tác và thành công.',
  servicesList: DEFAULT_HOME_SERVICES,

  howWeWorkKicker_vi: 'CÁCH CHÚNG TÔI LÀM VIỆC',
  howWeWorkKicker_en: 'HOW WE WORK',
  howWeWorkTitle_en: 'Our collaborative approach to crafting digital excellence',
  howWeWorkTitle_vi: 'Cách tiếp cận hợp tác kiến tạo đỉnh cao kỹ thuật số',
  howWeWorkParagraph1_vi: 'Khám phá quy trình làm việc nơi mỗi dự án bắt đầu từ sự thấu hiểu sâu sắc, sáng tạo đồng hành và thực thi tỉ mỉ. Từ khâu lên ý tưởng sơ khai đến bàn giao hoàn thiện, chúng tôi đặt sự giao tiếp, phản hồi và đổi mới làm trọng tâm để biến tầm nhìn của bạn thành thành quả số rõ nét. Bằng sự kết hợp giữa sáng tạo và chuyên môn công nghệ, chúng tôi may đo từng giải pháp phù hợp mục tiêu của bạn.',
  howWeWorkParagraph1_en: 'Dive into our process where every project begins with deep understanding, collaborative ideation, and meticulous execution. From initial brainstorming to final delivery, we prioritize communication, feedback, and innovation to ensure your vision transforms into tangible digital success. With a blend of creativity and technical expertise, we tailor solutions to suit your brand’s distinct identity and objectives.',
  howWeWorkParagraph2_vi: 'Cam kết về tính minh bạch và sự linh hoạt của chúng tôi đảm bảo bạn luôn đồng hành trong từng bước đi, mang lại kết quả liền mạch, ấn tượng và vượt trên kỳ vọng để thúc đẩy thương hiệu tiến xa trên bức tranh kỹ thuật số.',
  howWeWorkParagraph2_en: 'Our commitment to transparency and agility ensures that you’re involved every step of the way, resulting in seamless, impactful outcomes that exceed expectations and propel your brand forward in the digital landscape.',

  mosaicImageTopWide: '/src/assets/images/team_hero_collab_1790135062529.jpg',
  joinCard: {
    title_vi: 'Gia nhập Hiroki!',
    title_en: 'Join Hiroki!',
    desc_vi: 'Khám phá các cơ hội nghề nghiệp đầy hứng khởi cùng chúng tôi và bước tiếp trên hành trình kiến tạo tương lai số.',
    desc_en: 'Explore exciting career opportunities with us and take the next step towards building your future in digital innovation.',
    buttonText_vi: 'VỊ TRÍ TUYỂN DỤNG',
    buttonText_en: 'AVAILABLE JOBS',
  },
  mosaicImagePortrait: '/src/assets/images/team_sarah_lee_1790135127741.jpg',
  mosaicImageDesk: '/src/assets/images/creative_man_notebook_1790135085678.jpg',
  mosaicImageDiscussion: '/src/assets/images/blog_coworking_discussion_1790133957592.jpg',

  featuredReviewQuote_vi: '“Dịch vụ mẫu mực, thành quả vượt bậc, rất đáng tin cậy. Lựa chọn hàng đầu cho các giải pháp chuyển đổi số.”',
  featuredReviewQuote_en: '“Exemplary service, remarkable results, highly recommended. A top choice for digital solutions.”',
  featuredReviewBody_vi: 'Chuyên môn xây dựng thương hiệu của Hiroki đã chuyển hóa hoàn toàn nhận diện doanh nghiệp của chúng tôi, tạo tiếng vang mạnh mẽ với khách hàng mục tiêu.',
  featuredReviewBody_en: "Hiroki's branding expertise transformed our company's identity, resonating with our target audience. Their dedication and creativity exceeded our expectations.",
  featuredReviewAuthor: 'Rachel Miller',
  featuredReviewCompany: 'IP CONSULTING',
  featuredReviewAvatar: '/src/assets/images/team_david_brown_1790135150592.jpg',

  clientsKicker_vi: 'KHÁCH HÀNG CỦA CHÚNG TÔI',
  clientsKicker_en: 'OUR CLIENTS',
  clientsTitle_en: 'Hear from our clients about their experience working with us.',
  clientsTitle_vi: 'Lắng nghe chia sẻ từ khách hàng về trải nghiệm đồng hành cùng chúng tôi.',
  clientReviews: DEFAULT_HOME_CLIENT_REVIEWS,
};

export const DEFAULT_FOOTER_SETTINGS: CMSFooterSettings = {
  brandSub: {
    vi: 'Tạp chí & Không gian Sáng tạo Độc bản. Kiến tạo cho các agency, studio và giám đốc sáng tạo độc lập.',
    en: 'An Editorial & Bespoke Creative Journal. Crafted for discerning agencies, studios, and independent creative directors.',
  },
  socials: [
    { id: 'soc-1', platform: 'instagram', label: 'Instagram', url: 'https://instagram.com', isVisible: true },
    { id: 'soc-2', platform: 'twitter', label: 'Twitter (X)', url: 'https://twitter.com', isVisible: true },
    { id: 'soc-3', platform: 'behance', label: 'Behance', url: 'https://behance.net', isVisible: true },
    { id: 'soc-4', platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com', isVisible: true },
    { id: 'soc-5', platform: 'gmail', label: 'Gmail', url: 'mailto:contact@hiroki.studio', isVisible: true },
    { id: 'soc-6', platform: 'telegram', label: 'Telegram', url: 'https://t.me/hirokistudio', isVisible: true },
  ],
  columns: [
    {
      id: 'col-pages',
      title: { vi: 'TRANG (PAGES)', en: 'PAGES' },
      isVisible: true,
      links: [
        { id: 'lnk-home', label: { vi: 'TRANG CHỦ', en: 'HOME' }, type: 'tab', target: 'home', isVisible: true },
        { id: 'lnk-services', label: { vi: 'DỊCH VỤ', en: 'SERVICES' }, type: 'tab', target: 'services', isVisible: true },
        { id: 'lnk-connect', label: { vi: 'CONNECT (KẾT NỐI)', en: 'CONNECT' }, type: 'tab', target: 'connect', isVisible: true },
        {
          id: 'lnk-career',
          label: { vi: 'SỰ NGHIỆP', en: 'CAREER' },
          type: 'utility',
          target: 'career',
          utilityContent: {
            title: { vi: 'Cơ hội nghề nghiệp tại góc Thương', en: 'Careers at Hiroki' },
            desc: {
              vi: 'Chúng tôi luôn tìm kiếm những nhà thiết kế thương hiệu, chuyên gia nghệ thuật chữ và kỹ sư frontend tài năng. Gửi hồ sơ năng lực về careers@gocthuong.studio.',
              en: 'We are always looking for visionary brand designers, type specialists, and frontend engineers. Send your folio to careers@hiroki.studio.',
            },
          },
          isVisible: true,
        },
        { id: 'lnk-contact', label: { vi: 'LIÊN HỆ', en: 'CONTACT' }, type: 'tab', target: 'contact', isVisible: true },
      ],
    },
    {
      id: 'col-cms',
      title: { vi: 'NỘI DUNG (CMS)', en: 'CMS' },
      isVisible: true,
      links: [
        { id: 'lnk-work', label: { vi: 'DỰ ÁN', en: 'WORK' }, type: 'tab', target: 'work', isVisible: true },
        { id: 'lnk-work-single', label: { vi: 'CHI TIẾT DỰ ÁN', en: 'WORK SINGLE' }, type: 'tab', target: 'work', isVisible: true },
        { id: 'lnk-blog', label: { vi: 'BÀI VIẾT', en: 'BLOG' }, type: 'tab', target: 'blog', isVisible: true },
        { id: 'lnk-blog-single', label: { vi: 'CHI TIẾT BÀI VIẾT', en: 'BLOG SINGLE' }, type: 'tab', target: 'blog', isVisible: true },
        {
          id: 'lnk-admin',
          label: { vi: 'CMS STUDIO (QUẢN TRỊ)', en: 'CMS STUDIO (ADMIN)' },
          type: 'admin',
          target: 'admin',
          highlight: true,
          isVisible: true,
        },
      ],
    },
    {
      id: 'col-utility',
      title: { vi: 'TIỆN ÍCH (UTILITY PAGES)', en: 'UTILITY PAGES' },
      isVisible: true,
      links: [
        {
          id: 'lnk-404',
          label: { vi: 'TRANG LỖI 404', en: '404 ERROR PAGE' },
          type: 'utility',
          target: '404',
          utilityContent: {
            title: { vi: '404 Not Found', en: '404 Not Found' },
            desc: {
              vi: 'Không tìm thấy trang yêu cầu. Bạn có thể khám phá các bài viết hoặc dự án của chúng tôi.',
              en: 'The requested page could not be located. Feel free to explore our blog articles or portfolio projects.',
            },
          },
          isVisible: true,
        },
        {
          id: 'lnk-styleguide',
          label: { vi: 'QUY CHUẨN STYLE', en: 'STYLEGUIDE' },
          type: 'utility',
          target: 'styleguide',
          utilityContent: {
            title: { vi: 'Quy chuẩn Phong cách', en: 'Styleguide' },
            desc: {
              vi: 'Nghệ thuật chữ: Cormorant Garamond & Plus Jakarta Sans. Bảng màu: Đen tuyền #000000, Nền trắng #FFFFFF.',
              en: 'Typography: Cormorant Garamond & Plus Jakarta Sans. Palette: Pure Black #000000, Clean Canvas #FFFFFF, Subtle Hairline Borders rgba(0,0,0,0.08).',
            },
          },
          isVisible: true,
        },
        {
          id: 'lnk-licensing',
          label: { vi: 'BẢN QUYỀN', en: 'LICENSING' },
          type: 'utility',
          target: 'licensing',
          utilityContent: {
            title: { vi: 'Bản quyền & Giấy phép', en: 'Licensing' },
            desc: {
              vi: 'Toàn bộ nội dung và hình ảnh được xây dựng với mục đích minh hoạ và truyền cảm hứng thiết kế.',
              en: 'All editorial texts and custom photography generated for this personal portfolio template are licensed for demonstration and creative inspiration.',
            },
          },
          isVisible: true,
        },
        {
          id: 'lnk-changelog',
          label: { vi: 'LỊCH SỬ THAY ĐỔI', en: 'CHANGELOG' },
          type: 'utility',
          target: 'changelog',
          utilityContent: {
            title: { vi: 'Lịch sử thay đổi v2.5', en: 'Changelog v2.5' },
            desc: {
              vi: 'v2.5: Bổ sung hệ thống Quản lý Footer CMS toàn diện (chỉnh sửa, tạo mới link, đổi loại điều hướng, mạng xã hội, xóa 30 ngày).',
              en: 'v2.5: Added full CMS Footer Management system (edit, create links, navigation type switching, social channels, 30-day trash).',
            },
          },
          isVisible: true,
        },
      ],
    },
  ],
  ctaButton: {
    isVisible: true,
    label: { vi: 'THÊM GIAO DIỆN KHÁC', en: 'MORE TEMPLATES' },
    type: 'utility',
    target: 'more_templates',
    utilityContent: {
      title: { vi: 'Thêm Giao Diện Khác', en: 'More Templates' },
      desc: {
        vi: 'Khám phá thêm các mẫu giao diện Webflow và React cao cấp khác từ Gola Templates.',
        en: 'Discover more high-end editorial Webflow and React templates designed by Gola Templates.',
      },
    },
  },
  copyright: {
    vi: '© 2026 GÓC THƯƠNG. BẢN QUYỀN ĐÃ ĐƯỢC BẢO LƯU.',
    en: '© 2026 HIROKI. ALL RIGHTS RESERVED.',
  },
  locations: ['Tokyo', 'Hanoi', 'New York'],
};

export const DEFAULT_SITE_SETTINGS: CMSSiteSettings = {
  home: DEFAULT_HOME_SETTINGS,
  work: {
    title_en: 'Work',
    title_vi: 'Dự án',
    subtitle_en: 'Dive into our curated collection of projects, highlighting our expertise.',
    subtitle_vi: 'Khám phá bộ sưu tập các dự án tiêu biểu, minh chứng cho chuyên môn và thẩm mỹ.',
  },
  services: {
    title_en: 'Services',
    title_vi: 'Dịch vụ',
    subtitle_en: 'Comprehensive digital and design solutions engineered for lasting brand impact.',
    subtitle_vi: 'Các giải pháp kỹ thuật số và thiết kế toàn diện, kiến tạo dấu ấn thương hiệu bền vững.',
  },
  blog: {
    heroTitle_en: 'Stories, Insights & Creative Thoughts',
    heroTitle_vi: 'Câu chuyện, Góc nhìn & Cảm hứng Sáng tạo',
    heroSubtitle_en: 'A curated journal exploring typography, visual identity, and modern digital craft.',
    heroSubtitle_vi: 'Tạp chí chọn lọc khám phá nghệ thuật chữ, bản sắc thị giác và tay nghề kỹ thuật số đương đại.',
  },
  connect: {
    heroTitle_en: 'Digital excellence for modern brands.',
    heroTitle_vi: 'Đẳng cấp kỹ thuật số cho các thương hiệu hiện đại.',
    heroSubtitle_en: 'Discover our passion for creativity and technology as we strive to transform.',
    heroSubtitle_vi: 'Khám phá đam mê sáng tạo và công nghệ của chúng tôi trong hành trình chuyển đổi.',
    missionTitle_en: 'At our core, we believe in the transformative power of digital technology.',
    missionTitle_vi: 'Tại tâm điểm, chúng tôi tin tưởng sâu sắc vào sức mạnh biến đổi của công nghệ số.',
  },
  footer: DEFAULT_FOOTER_SETTINGS,
  typography: DEFAULT_TYPOGRAPHY_SETTINGS,
};

const LOCAL_STORAGE_POSTS = 'gocthuong_cms_posts';
const LOCAL_STORAGE_PROJECTS = 'gocthuong_cms_projects';
const LOCAL_STORAGE_SERVICES = 'gocthuong_cms_services';
const LOCAL_STORAGE_SETTINGS = 'gocthuong_cms_settings';
const LOCAL_STORAGE_CATEGORIES = 'gocthuong_cms_categories';
const LOCAL_STORAGE_EDITORIAL_TAGS = 'gocthuong_cms_editorial_tags';
const LOCAL_STORAGE_TRASH = 'gocthuong_cms_trash_v2';

// Cache helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const CMSService = {
  // -------------------------------------------------------------
  // Posts / Articles Operations
  // -------------------------------------------------------------
  async fetchPosts(): Promise<CMSPost[]> {
    const local = getLocal<CMSPost[]>(LOCAL_STORAGE_POSTS, []);
    try {
      const colRef = collection(db, 'posts');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const posts: CMSPost[] = [];
        snap.forEach((d) => {
          posts.push(d.data() as CMSPost);
        });
        setLocal(LOCAL_STORAGE_POSTS, posts);
        return posts;
      } else {
        // If Firestore is empty, seed initial articles
        const initial = ARTICLES.map((a) => ({
          ...a,
          status: 'published' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        for (const item of initial) {
          await setDoc(doc(db, 'posts', item.id), item);
        }
        setLocal(LOCAL_STORAGE_POSTS, initial);
        return initial;
      }
    } catch (e) {
      console.warn('Error fetching posts from Firestore, using local fallback:', e);
      if (local.length > 0) return local;
      return ARTICLES.map((a) => ({ ...a, status: 'published' }));
    }
  },

  async savePost(post: CMSPost): Promise<CMSPost> {
    const now = new Date().toISOString();
    const finalPost: CMSPost = {
      ...post,
      id: post.id || `post-${Date.now()}`,
      status: post.status || 'published',
      updatedAt: now,
      createdAt: post.createdAt || now,
    };

    // Update local cache immediately
    const posts = getLocal<CMSPost[]>(LOCAL_STORAGE_POSTS, []);
    const idx = posts.findIndex((p) => p.id === finalPost.id);
    if (idx >= 0) {
      posts[idx] = finalPost;
    } else {
      posts.unshift(finalPost);
    }
    setLocal(LOCAL_STORAGE_POSTS, posts);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'posts', finalPost.id), finalPost);
    } catch (e) {
      console.warn('Firestore write failed, saved locally:', e);
    }

    return finalPost;
  },

  async deletePost(id: string): Promise<void> {
    const posts = getLocal<CMSPost[]>(LOCAL_STORAGE_POSTS, []).filter((p) => p.id !== id);
    setLocal(LOCAL_STORAGE_POSTS, posts);

    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (e) {
      console.warn('Firestore delete failed, removed locally:', e);
    }
  },

  // -------------------------------------------------------------
  // Projects Operations
  // -------------------------------------------------------------
  async fetchProjects(): Promise<CMSProject[]> {
    const local = getLocal<CMSProject[]>(LOCAL_STORAGE_PROJECTS, []);
    try {
      const colRef = collection(db, 'projects');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const projects: CMSProject[] = [];
        snap.forEach((d) => {
          projects.push(d.data() as CMSProject);
        });
        setLocal(LOCAL_STORAGE_PROJECTS, projects);
        return projects;
      } else {
        // Seed initial projects
        const initial = WORK_PROJECTS.map((p) => ({
          ...p,
          status: 'published' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        for (const item of initial) {
          await setDoc(doc(db, 'projects', item.id), item);
        }
        setLocal(LOCAL_STORAGE_PROJECTS, initial);
        return initial;
      }
    } catch (e) {
      console.warn('Error fetching projects from Firestore, using local fallback:', e);
      if (local.length > 0) return local;
      return WORK_PROJECTS.map((p) => ({ ...p, status: 'published' }));
    }
  },

  async saveProject(proj: CMSProject): Promise<CMSProject> {
    const now = new Date().toISOString();
    const finalProject: CMSProject = {
      ...proj,
      id: proj.id || `proj-${Date.now()}`,
      status: proj.status || 'published',
      updatedAt: now,
      createdAt: proj.createdAt || now,
    };

    const projects = getLocal<CMSProject[]>(LOCAL_STORAGE_PROJECTS, []);
    const idx = projects.findIndex((p) => p.id === finalProject.id);
    if (idx >= 0) {
      projects[idx] = finalProject;
    } else {
      projects.unshift(finalProject);
    }
    setLocal(LOCAL_STORAGE_PROJECTS, projects);

    try {
      await setDoc(doc(db, 'projects', finalProject.id), finalProject);
    } catch (e) {
      console.warn('Firestore write failed, saved locally:', e);
    }

    return finalProject;
  },

  async deleteProject(id: string): Promise<void> {
    const projs = getLocal<CMSProject[]>(LOCAL_STORAGE_PROJECTS, []).filter((p) => p.id !== id);
    setLocal(LOCAL_STORAGE_PROJECTS, projs);

    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.warn('Firestore delete failed, removed locally:', e);
    }
  },

  // -------------------------------------------------------------
  // Services Operations (Dịch vụ: Tạo mới, Sửa, Xóa vào thùng rác, Draft/Publish)
  // -------------------------------------------------------------
  async fetchServices(): Promise<CMSServiceItem[]> {
    const local = getLocal<CMSServiceItem[]>(LOCAL_STORAGE_SERVICES, []);
    try {
      const colRef = collection(db, 'services');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const services: CMSServiceItem[] = [];
        snap.forEach((d) => {
          services.push(d.data() as CMSServiceItem);
        });
        services.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
        setLocal(LOCAL_STORAGE_SERVICES, services);
        return services;
      } else {
        // Seed initial services
        const initial = SERVICES.map((s, idx) => ({
          ...s,
          status: 'published' as const,
          order: idx + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        for (const item of initial) {
          await setDoc(doc(db, 'services', item.id), item);
        }
        setLocal(LOCAL_STORAGE_SERVICES, initial);
        return initial;
      }
    } catch (e) {
      console.warn('Error fetching services from Firestore, using local fallback:', e);
      if (local.length > 0) return local;
      return SERVICES.map((s, idx) => ({
        ...s,
        status: 'published' as const,
        order: idx + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
  },

  async saveService(service: CMSServiceItem): Promise<CMSServiceItem> {
    const now = new Date().toISOString();
    const finalService: CMSServiceItem = {
      ...service,
      id: service.id || `srv-${Date.now()}`,
      number: service.number || '01',
      status: service.status || 'published',
      updatedAt: now,
      createdAt: service.createdAt || now,
    };

    const services = getLocal<CMSServiceItem[]>(LOCAL_STORAGE_SERVICES, []);
    const idx = services.findIndex((s) => s.id === finalService.id);
    if (idx >= 0) {
      services[idx] = finalService;
    } else {
      services.push(finalService);
    }
    services.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
    setLocal(LOCAL_STORAGE_SERVICES, services);

    try {
      await setDoc(doc(db, 'services', finalService.id), finalService);
    } catch (e) {
      console.warn('Firestore write service failed, saved locally:', e);
    }

    return finalService;
  },

  async deleteService(id: string): Promise<void> {
    const services = getLocal<CMSServiceItem[]>(LOCAL_STORAGE_SERVICES, []).filter((s) => s.id !== id);
    setLocal(LOCAL_STORAGE_SERVICES, services);

    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.warn('Firestore delete service failed, removed locally:', e);
    }
  },

  // -------------------------------------------------------------
  // Site Sections & Headers (Trang chủ, Dự án, Dịch vụ, Bài viết, Kết nối)
  // -------------------------------------------------------------
  async fetchSiteSettings(): Promise<CMSSiteSettings> {
    const rawLocal = getLocal<CMSSiteSettings>(LOCAL_STORAGE_SETTINGS, DEFAULT_SITE_SETTINGS);
    const local: CMSSiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...rawLocal,
      footer: { ...DEFAULT_FOOTER_SETTINGS, ...(rawLocal?.footer || {}) },
    };
    try {
      const snap = await getDocs(collection(db, 'site_sections'));
      if (!snap.empty) {
        const settings: CMSSiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          footer: { ...DEFAULT_FOOTER_SETTINGS },
        };
        snap.forEach((d) => {
          const key = d.id as keyof CMSSiteSettings;
          if (key === 'footer') {
            settings.footer = { ...DEFAULT_FOOTER_SETTINGS, ...d.data() } as CMSFooterSettings;
          } else if (settings[key]) {
            (settings as any)[key] = { ...(settings as any)[key], ...d.data() };
          }
        });
        setLocal(LOCAL_STORAGE_SETTINGS, settings);
        return settings;
      } else {
        // Seed default settings into Firestore
        for (const [key, val] of Object.entries(DEFAULT_SITE_SETTINGS)) {
          await setDoc(doc(db, 'site_sections', key), val);
        }
        setLocal(LOCAL_STORAGE_SETTINGS, DEFAULT_SITE_SETTINGS);
        return DEFAULT_SITE_SETTINGS;
      }
    } catch (e) {
      console.warn('Error fetching settings from Firestore, using local fallback:', e);
      return local;
    }
  },

  async saveSiteSettings(settings: CMSSiteSettings): Promise<void> {
    setLocal(LOCAL_STORAGE_SETTINGS, settings);
    try {
      for (const [key, val] of Object.entries(settings)) {
        await setDoc(doc(db, 'site_sections', key), val);
      }
    } catch (e) {
      console.warn('Firestore write settings failed, saved locally:', e);
    }
  },

  // -------------------------------------------------------------
  // Categories Operations (Create, Edit, Delete)
  // -------------------------------------------------------------
  async fetchCategories(): Promise<CMSCategory[]> {
    const local = getLocal<CMSCategory[]>(LOCAL_STORAGE_CATEGORIES, []);
    try {
      const colRef = collection(db, 'categories');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const cats: CMSCategory[] = [];
        snap.forEach((d) => cats.push(d.data() as CMSCategory));
        setLocal(LOCAL_STORAGE_CATEGORIES, cats);
        return cats;
      } else {
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
        setLocal(LOCAL_STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
    } catch (e) {
      console.warn('Error fetching categories from Firestore, using local fallback:', e);
      return local.length > 0 ? local : DEFAULT_CATEGORIES;
    }
  },

  async saveCategory(cat: CMSCategory): Promise<CMSCategory> {
    const finalCat: CMSCategory = {
      ...cat,
      id: cat.id || `cat-${Date.now()}`,
      name: cat.name.trim().toUpperCase(),
    };
    const cats = getLocal<CMSCategory[]>(LOCAL_STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    const idx = cats.findIndex((c) => c.id === finalCat.id);
    if (idx >= 0) {
      cats[idx] = finalCat;
    } else {
      cats.push(finalCat);
    }
    setLocal(LOCAL_STORAGE_CATEGORIES, cats);

    try {
      await setDoc(doc(db, 'categories', finalCat.id), finalCat);
    } catch (e) {
      console.warn('Firestore category write failed, saved locally:', e);
    }
    return finalCat;
  },

  async deleteCategory(id: string): Promise<void> {
    const cats = getLocal<CMSCategory[]>(LOCAL_STORAGE_CATEGORIES, DEFAULT_CATEGORIES).filter((c) => c.id !== id);
    setLocal(LOCAL_STORAGE_CATEGORIES, cats);
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (e) {
      console.warn('Firestore category delete failed, removed locally:', e);
    }
  },

  // -------------------------------------------------------------
  // Editorial Tags Operations (Create, Edit, Delete)
  // -------------------------------------------------------------
  async fetchEditorialTags(): Promise<CMSEditorialTag[]> {
    const local = getLocal<CMSEditorialTag[]>(LOCAL_STORAGE_EDITORIAL_TAGS, []);
    try {
      const colRef = collection(db, 'editorial_tags');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const tags: CMSEditorialTag[] = [];
        snap.forEach((d) => tags.push(d.data() as CMSEditorialTag));
        setLocal(LOCAL_STORAGE_EDITORIAL_TAGS, tags);
        return tags;
      } else {
        for (const tag of DEFAULT_EDITORIAL_TAGS) {
          await setDoc(doc(db, 'editorial_tags', tag.id), tag);
        }
        setLocal(LOCAL_STORAGE_EDITORIAL_TAGS, DEFAULT_EDITORIAL_TAGS);
        return DEFAULT_EDITORIAL_TAGS;
      }
    } catch (e) {
      console.warn('Error fetching editorial tags from Firestore, using local fallback:', e);
      return local.length > 0 ? local : DEFAULT_EDITORIAL_TAGS;
    }
  },

  async saveEditorialTag(tag: CMSEditorialTag): Promise<CMSEditorialTag> {
    const finalTag: CMSEditorialTag = {
      ...tag,
      id: tag.id || `tag-${Date.now()}`,
      name: tag.name.trim().toUpperCase(),
    };
    const tags = getLocal<CMSEditorialTag[]>(LOCAL_STORAGE_EDITORIAL_TAGS, DEFAULT_EDITORIAL_TAGS);
    const idx = tags.findIndex((t) => t.id === finalTag.id);
    if (idx >= 0) {
      tags[idx] = finalTag;
    } else {
      tags.push(finalTag);
    }
    setLocal(LOCAL_STORAGE_EDITORIAL_TAGS, tags);

    try {
      await setDoc(doc(db, 'editorial_tags', finalTag.id), finalTag);
    } catch (e) {
      console.warn('Firestore editorial tag write failed, saved locally:', e);
    }
    return finalTag;
  },

  async deleteEditorialTag(id: string): Promise<void> {
    const tags = getLocal<CMSEditorialTag[]>(LOCAL_STORAGE_EDITORIAL_TAGS, DEFAULT_EDITORIAL_TAGS).filter((t) => t.id !== id);
    setLocal(LOCAL_STORAGE_EDITORIAL_TAGS, tags);
    try {
      await deleteDoc(doc(db, 'editorial_tags', id));
    } catch (e) {
      console.warn('Firestore editorial tag delete failed, removed locally:', e);
    }
  },

  // Reset to original default data
  async resetAllToDefaults(): Promise<void> {
    const initialPosts = ARTICLES.map((a) => ({
      ...a,
      status: 'published' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const initialProjects = WORK_PROJECTS.map((p) => ({
      ...p,
      status: 'published' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    const initialServices = SERVICES.map((s, idx) => ({
      ...s,
      status: 'published' as const,
      order: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setLocal(LOCAL_STORAGE_POSTS, initialPosts);
    setLocal(LOCAL_STORAGE_PROJECTS, initialProjects);
    setLocal(LOCAL_STORAGE_SERVICES, initialServices);
    setLocal(LOCAL_STORAGE_SETTINGS, DEFAULT_SITE_SETTINGS);
    setLocal(LOCAL_STORAGE_CATEGORIES, DEFAULT_CATEGORIES);
    setLocal(LOCAL_STORAGE_EDITORIAL_TAGS, DEFAULT_EDITORIAL_TAGS);

    try {
      for (const p of initialPosts) {
        await setDoc(doc(db, 'posts', p.id), p);
      }
      for (const pr of initialProjects) {
        await setDoc(doc(db, 'projects', pr.id), pr);
      }
      for (const s of initialServices) {
        await setDoc(doc(db, 'services', s.id), s);
      }
      for (const [k, v] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        await setDoc(doc(db, 'site_sections', k), v);
      }
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const tag of DEFAULT_EDITORIAL_TAGS) {
        await setDoc(doc(db, 'editorial_tags', tag.id), tag);
      }
    } catch (e) {
      console.warn('Firestore reset failed:', e);
    }
  },

  // -------------------------------------------------------------
  // TRASH BIN & 30-DAY RETENTION (Thùng rác & Tự động xóa sau 30 ngày)
  // -------------------------------------------------------------
  async fetchTrash(): Promise<CMSTrashItem[]> {
    const now = Date.now();
    let trashList = getLocal<CMSTrashItem[]>(LOCAL_STORAGE_TRASH, []);

    try {
      const colRef = collection(db, 'trash');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreItems: CMSTrashItem[] = [];
        snap.forEach((d) => {
          firestoreItems.push(d.data() as CMSTrashItem);
        });
        trashList = firestoreItems;
      }
    } catch (e) {
      console.warn('Error fetching trash from Firestore, using local fallback:', e);
    }

    // Auto-cleanup: permanently purge items older than 30 days
    const activeTrash: CMSTrashItem[] = [];
    const expiredIds: string[] = [];

    for (const item of trashList) {
      const expiresTime = new Date(item.expiresAt).getTime();
      if (expiresTime <= now) {
        expiredIds.push(item.id);
      } else {
        activeTrash.push(item);
      }
    }

    if (expiredIds.length > 0) {
      for (const id of expiredIds) {
        try {
          await deleteDoc(doc(db, 'trash', id));
        } catch {
          // ignore
        }
      }
    }

    activeTrash.sort(
      (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    setLocal(LOCAL_STORAGE_TRASH, activeTrash);
    return activeTrash;
  },

  async moveToTrash(type: TrashItemType, item: any, name: string): Promise<CMSTrashItem> {
    const now = new Date();
    const expiresDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days retention

    const trashId = `trash-${type}-${item.id}`;
    const trashItem: CMSTrashItem = {
      id: trashId,
      originalId: item.id,
      type,
      name: name || item.name || item.title?.vi || item.title?.en || 'Mục chưa đặt tên',
      deletedAt: now.toISOString(),
      expiresAt: expiresDate.toISOString(),
      payload: item,
    };

    if (type === 'project') {
      await this.deleteProject(item.id);
    } else if (type === 'service') {
      await this.deleteService(item.id);
    } else if (type === 'tag') {
      await this.deleteEditorialTag(item.id);
    } else if (type === 'category') {
      await this.deleteCategory(item.id);
    } else if (type === 'post') {
      await this.deletePost(item.id);
    }

    const currentTrash = getLocal<CMSTrashItem[]>(LOCAL_STORAGE_TRASH, []);
    const updated = [trashItem, ...currentTrash.filter((t) => t.id !== trashId)];
    setLocal(LOCAL_STORAGE_TRASH, updated);

    try {
      await setDoc(doc(db, 'trash', trashId), trashItem);
    } catch (e) {
      console.warn('Firestore write to trash failed, saved locally:', e);
    }

    return trashItem;
  },

  async restoreFromTrash(trashId: string): Promise<any> {
    const currentTrash = getLocal<CMSTrashItem[]>(LOCAL_STORAGE_TRASH, []);
    const item = currentTrash.find((t) => t.id === trashId);
    if (!item) {
      try {
        const snap = await getDocs(collection(db, 'trash'));
        let found: CMSTrashItem | null = null;
        snap.forEach((d) => {
          if (d.id === trashId) found = d.data() as CMSTrashItem;
        });
        if (found) {
          return this.restoreFromTrashItem(found);
        }
      } catch (e) {
        console.warn('Error reading trash doc:', e);
      }
      throw new Error('Không tìm thấy mục trong thùng rác');
    }
    return this.restoreFromTrashItem(item);
  },

  async restoreFromTrashItem(item: CMSTrashItem): Promise<any> {
    if (item.type === 'project') {
      await this.saveProject(item.payload);
    } else if (item.type === 'service') {
      await this.saveService(item.payload);
    } else if (item.type === 'tag') {
      await this.saveEditorialTag(item.payload);
    } else if (item.type === 'category') {
      await this.saveCategory(item.payload);
    } else if (item.type === 'post') {
      await this.savePost(item.payload);
    } else if (item.type === 'footer_link') {
      const currentSettings = await this.fetchSiteSettings();
      const colId = item.payload?.columnId;
      const link = item.payload?.link || item.payload;
      const targetCol = currentSettings.footer?.columns?.find((c) => c.id === colId);
      if (targetCol) {
        if (!targetCol.links.some((l) => l.id === link.id)) {
          targetCol.links.push(link);
        }
      } else if (currentSettings.footer?.columns?.[0]) {
        currentSettings.footer.columns[0].links.push(link);
      }
      await this.saveSiteSettings(currentSettings);
    } else if (item.type === 'footer_column') {
      const currentSettings = await this.fetchSiteSettings();
      const col = item.payload;
      if (currentSettings.footer?.columns) {
        if (!currentSettings.footer.columns.some((c) => c.id === col.id)) {
          currentSettings.footer.columns.push(col);
        }
      }
      await this.saveSiteSettings(currentSettings);
    }

    await this.deletePermanently(item.id);
    return item.payload;
  },

  async deletePermanently(trashId: string): Promise<void> {
    const currentTrash = getLocal<CMSTrashItem[]>(LOCAL_STORAGE_TRASH, []);
    setLocal(
      LOCAL_STORAGE_TRASH,
      currentTrash.filter((t) => t.id !== trashId)
    );

    try {
      await deleteDoc(doc(db, 'trash', trashId));
    } catch (e) {
      console.warn('Firestore delete permanently failed, removed locally:', e);
    }
  },

  async emptyTrash(): Promise<void> {
    const currentTrash = getLocal<CMSTrashItem[]>(LOCAL_STORAGE_TRASH, []);
    setLocal(LOCAL_STORAGE_TRASH, []);

    try {
      for (const item of currentTrash) {
        await deleteDoc(doc(db, 'trash', item.id));
      }
    } catch (e) {
      console.warn('Firestore empty trash failed:', e);
    }
  },
};
