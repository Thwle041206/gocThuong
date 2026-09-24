export type Language = 'en' | 'vi';

export interface ArticleContentBlock {
  id: string;
  type: 'intro' | 'section' | 'quote' | 'image' | 'keyPoints' | 'conclusion';
  title?: { en: string; vi: string };
  body?: { en: string; vi: string };
  quote?: { en: string; vi: string };
  quoteAuthor?: string;
  image?: string;
  imageCaption?: { en: string; vi: string };
  secondaryImage?: string;
  imagePosition?: 'none' | 'below' | 'left' | 'right' | 'banner';
  layoutMode?: 'stacked' | 'split-left' | 'split-right' | 'grid-2' | 'card';
  items?: { en: string; vi: string }[];
}

export interface Article {
  id: string;
  category: string;
  tag: string;
  image: string;
  title: {
    en: string;
    vi: string;
  };
  excerpt: {
    en: string;
    vi: string;
  };
  readTime: string;
  date: string;
  publishTime?: string;
  author: {
    name: string;
    role: { en: string; vi: string };
    avatar: string;
  };
  blocks?: ArticleContentBlock[];
  content: {
    en: {
      intro: string;
      section1Title: string;
      section1Body: string;
      quote: string;
      quoteAuthor: string;
      section2Title: string;
      section2Body: string;
      conclusion: string;
      keyPoints: string[];
    };
    vi: {
      intro: string;
      section1Title: string;
      section1Body: string;
      quote: string;
      quoteAuthor: string;
      section2Title: string;
      section2Body: string;
      conclusion: string;
      keyPoints: string[];
    };
  };
}

export function getArticleBlocks(article: Article): ArticleContentBlock[] {
  if (article.blocks && article.blocks.length > 0) {
    return article.blocks;
  }
  return [
    {
      id: `${article.id}-intro`,
      type: 'intro',
      body: {
        en: article.content?.en?.intro || '',
        vi: article.content?.vi?.intro || '',
      },
      imagePosition: 'none',
      layoutMode: 'stacked',
    },
    {
      id: `${article.id}-keypoints`,
      type: 'keyPoints',
      title: {
        en: 'Key Takeaways',
        vi: 'Điểm chính cần ghi nhớ',
      },
      items: (article.content?.vi?.keyPoints || ['']).map((viPt, idx) => ({
        vi: viPt,
        en: article.content?.en?.keyPoints?.[idx] || viPt,
      })),
      layoutMode: 'stacked',
    },
    {
      id: `${article.id}-sec1`,
      type: 'section',
      title: {
        en: article.content?.en?.section1Title || '1. Section Title',
        vi: article.content?.vi?.section1Title || '1. Tiêu đề mục 1',
      },
      body: {
        en: article.content?.en?.section1Body || '',
        vi: article.content?.vi?.section1Body || '',
      },
      imagePosition: 'none',
      layoutMode: 'stacked',
    },
    {
      id: `${article.id}-quote`,
      type: 'quote',
      quote: {
        en: article.content?.en?.quote || '',
        vi: article.content?.vi?.quote || '',
      },
      quoteAuthor: article.content?.vi?.quoteAuthor || article.content?.en?.quoteAuthor || '',
      layoutMode: 'stacked',
    },
    {
      id: `${article.id}-sec2`,
      type: 'section',
      title: {
        en: article.content?.en?.section2Title || '2. Section Title',
        vi: article.content?.vi?.section2Title || '2. Tiêu đề mục 2',
      },
      body: {
        en: article.content?.en?.section2Body || '',
        vi: article.content?.vi?.section2Body || '',
      },
      imagePosition: 'none',
      layoutMode: 'stacked',
    },
    {
      id: `${article.id}-conclusion`,
      type: 'conclusion',
      title: {
        en: 'Conclusion',
        vi: 'Kết luận',
      },
      body: {
        en: article.content?.en?.conclusion || '',
        vi: article.content?.vi?.conclusion || '',
      },
      imagePosition: 'none',
      layoutMode: 'stacked',
    },
  ];
}

export function syncBlocksToLegacyContent(blocks: ArticleContentBlock[]): Article['content'] {
  const introBlock = blocks.find((b) => b.type === 'intro');
  const sections = blocks.filter((b) => b.type === 'section');
  const quoteBlock = blocks.find((b) => b.type === 'quote');
  const keyPointsBlock = blocks.find((b) => b.type === 'keyPoints');
  const conclusionBlock = blocks.find((b) => b.type === 'conclusion');

  return {
    en: {
      intro: introBlock?.body?.en || '',
      section1Title: sections[0]?.title?.en || '',
      section1Body: sections[0]?.body?.en || '',
      quote: quoteBlock?.quote?.en || '',
      quoteAuthor: quoteBlock?.quoteAuthor || '',
      section2Title: sections[1]?.title?.en || '',
      section2Body: sections[1]?.body?.en || '',
      conclusion: conclusionBlock?.body?.en || '',
      keyPoints: keyPointsBlock?.items?.map((it) => it.en).filter(Boolean) || [],
    },
    vi: {
      intro: introBlock?.body?.vi || '',
      section1Title: sections[0]?.title?.vi || '',
      section1Body: sections[0]?.body?.vi || '',
      quote: quoteBlock?.quote?.vi || '',
      quoteAuthor: quoteBlock?.quoteAuthor || '',
      section2Title: sections[1]?.title?.vi || '',
      section2Body: sections[1]?.body?.vi || '',
      conclusion: conclusionBlock?.body?.vi || '',
      keyPoints: keyPointsBlock?.items?.map((it) => it.vi).filter(Boolean) || [],
    },
  };
}

export interface WorkProject {
  id: string;
  name: string;
  title: { en: string; vi: string };
  category: { en: string; vi: string };
  categoryBadge: string;
  filterTag: string;
  secondaryTag?: string;
  year: string;
  description: { en: string; vi: string };
  image: string;
  deliverables: string[];
  client?: string;
  timeline?: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  features: { en: string[]; vi: string[] };
  linkText?: { en: string; vi: string };
  status?: 'draft' | 'published';
}

export const ARTICLES: Article[] = [
  {
    id: 'art-of-effective-email-marketing',
    category: 'BRANDING',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_speaker_stage_1790133941051.jpg',
    readTime: '5 min read',
    date: 'Oct 24, 2024',
    publishTime: '09:30',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Creative Director', vi: 'Giám đốc sáng tạo' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'The art of effective email marketing: strategies to engage and convert subscribers',
      vi: 'Nghệ thuật email marketing hiệu quả: chiến lược tương tác và chuyển đổi khách hàng'
    },
    excerpt: {
      en: 'Explore proven tactics to enhance your email marketing campaigns and nurture meaningful relationships with your subscribers.',
      vi: 'Khám phá các chiến thuật đã được chứng minh nhằm nâng cao chiến dịch email và nuôi dưỡng mối quan hệ ý nghĩa với người đăng ký.'
    },
    content: {
      en: {
        intro: 'In an era overwhelmed by social media noise, direct email remains the most intimate and highest-converting communication channel between a brand and its audience. Crafting messages that resonate requires empathy, rigorous segmentation, and exquisite visual hierarchy.',
        section1Title: '1. Segmentation Beyond Basic Demographics',
        section1Body: 'Modern subscribers expect personalization that reflects their actual behavioral journeys. Rather than blasting your entire list with identical promotions, segment based on purchase frequency, engagement tiers, and interaction history. This creates relevance that cuts through crowded inboxes.',
        quote: 'Email is not about shouting to a crowd; it is an intimate conversation whispered into one person’s morning routine.',
        quoteAuthor: 'Hiroki Tanaka — Design Director',
        section2Title: '2. Minimalist Layouts and Typographic Precision',
        section2Body: 'Aesthetically disciplined emails prioritize scannable hierarchy, uncluttered breathing room, and decisive calls-to-action. Eliminate redundant borders and multi-colored ribbons; let high-resolution photography and typographic balance guide the eye naturally down the screen.',
        conclusion: 'When email marketing honors the reader’s time with genuine value and thoughtful editorial polish, conversion rates transition from transactional spikes to enduring brand loyalty.',
        keyPoints: [
          'Prioritize behavioral segmentation over static age/location groups',
          'Write subject lines that promise concise, genuine utility',
          'Maintain single-column responsive layouts for seamless mobile reading',
          'Conduct A/B testing on send-time frequency and typography scale'
        ]
      },
      vi: {
        intro: 'Trong thời đại bão hoà bởi mạng xã hội, email trực tiếp vẫn là kênh giao tiếp gần gũi và có tỷ lệ chuyển đổi cao nhất giữa thương hiệu và khách hàng. Để tạo ra những thông điệp lay động người đọc, bạn cần sự thấu cảm, phân khúc dữ liệu sắc bén và trật tự thị giác tinh tế.',
        section1Title: '1. Phân khúc khách hàng vượt trên dữ liệu nhân khẩu học cơ bản',
        section1Body: 'Khách hàng ngày nay mong đợi trải nghiệm cá nhân hóa phản ánh đúng hành vi thực tế của họ. Thay vì gửi cùng một email khuyến mãi cho toàn bộ danh sách, hãy phân nhóm dựa trên tần suất mua sắm, mức độ tương tác và lịch sử quan tâm. Điều này tạo nên sự gắn kết và giá trị thực sự.',
        quote: 'Email không phải là việc đứng giữa đám đông la lớn, mà là cuộc trò chuyện thân tình trong khoảnh khắc buổi sáng của một người.',
        quoteAuthor: 'Hiroki Tanaka — Giám đốc Thiết kế',
        section2Title: '2. Bố cục tối giản và kỷ luật nghệ thuật chữ',
        section2Body: 'Những mẫu email có tính thẩm mỹ cao luôn chú trọng đến khoảng thở, trật tự đọc dễ lướt và nút kêu gọi hành động dứt khoát. Hãy loại bỏ những khung viền rườm rà hay màu sắc lòe loẹt; hãy để hình ảnh chất lượng cao và nghệ thuật sắp đặt chữ dẫn dắt ánh nhìn.',
        conclusion: 'Khi chiến lược email tôn trọng thời gian của độc giả bằng nội dung chất lượng và hình thức chỉn chu, tỷ lệ chuyển đổi sẽ chuyển hóa thành sự gắn bó lâu dài với thương hiệu.',
        keyPoints: [
          'Ưu tiên phân khúc theo hành vi thực tế thay vì tuổi tác hay địa lý',
          'Tiêu đề ngắn gọn, gợi mở và mang lại giá trị thiết thực',
          'Thiết kế bố cục một cột tối ưu cho trải nghiệm đọc trên điện thoại',
          'Liên tục kiểm thử A/B về tần suất gửi và cấu trúc thông điệp'
        ]
      }
    }
  },
  {
    id: 'mastering-social-media-growth',
    category: 'STUDIO',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_coworking_discussion_1790133957592.jpg',
    readTime: '4 min read',
    date: 'Oct 18, 2024',
    publishTime: '14:15',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Creative Director', vi: 'Giám đốc sáng tạo' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'Mastering social media: tips to boost engagement and grow your online presence',
      vi: 'Làm chủ mạng xã hội: bí quyết tăng tương tác và phát triển thương hiệu trực tuyến'
    },
    excerpt: {
      en: 'Unlock the potential of social media platforms with actionable strategies to increase engagement and reach.',
      vi: 'Khai phá tiềm năng của các nền tảng mạng xã hội với những chiến lược thực tế giúp gia tăng mức độ tương tác và độ phủ sóng.'
    },
    content: {
      en: {
        intro: 'Building an authentic digital presence is no longer about chasing algorithm tricks. It requires an unmistakable visual identity and a commitment to publishing perspectives that genuinely educate or inspire.',
        section1Title: '1. Consistency Over Volume',
        section1Body: 'Audiences recognize craft. Publishing two thoughtfully constructed, high-fidelity posts per week yields vastly superior trust compared to automated, daily churn. Maintain your typographic rules, color palette, and conversational tone across every touchpoint.',
        quote: 'A loyal digital community is forged by consistent perspective, not algorithmic desperation.',
        quoteAuthor: 'Editorial Team — Studio Hiroki',
        section2Title: '2. Native Conversation and Active Listening',
        section2Body: 'Treat comments and direct messages as direct collaborative workshops. Responding with depth rather than canned replies elevates your studio from a broadcast speaker to an approachable authority.',
        conclusion: 'Mastering social media is fundamentally an exercise in digital hospitality. When your feed provides sanctuary and insight, audience growth follows as a natural byproduct.',
        keyPoints: [
          'Establish a distinct visual signature for all carousel covers',
          'Focus on storytelling behind the scenes of your client deliverables',
          'Measure quality of comments and shares above raw impressions'
        ]
      },
      vi: {
        intro: 'Xây dựng một vị thế trực tuyến uy tín không còn là cuộc đua đuổi theo thuật toán. Điều cốt lõi nằm ở nhận diện thị giác độc bản và cam kết chia sẻ góc nhìn thực sự mang lại tri thức và nguồn cảm hứng cho cộng đồng.',
        section1Title: '1. Chất lượng và sự nhất quán quan trọng hơn số lượng',
        section1Body: 'Người theo dõi luôn nhận ra sự tâm huyết. Đăng tải hai bài viết chỉn chu, sâu sắc mỗi tuần mang lại niềm tin bền vững hơn rất nhiều so với những nội dung sản xuất hàng loạt thiếu hồn. Hãy giữ vững phong cách chữ, bảng màu và giọng điệu đặc trưng.',
        quote: 'Cộng đồng trung thành được vun đắp bởi góc nhìn nhất quán, chứ không phải sự hối hả chạy theo thuật toán.',
        quoteAuthor: 'Ban biên tập — Hiroki Studio',
        section2Title: '2. Đối thoại chân thành và lắng nghe người dùng',
        section2Body: 'Hãy xem phần bình luận và tin nhắn như không gian trao đổi cởi mở. Việc phản hồi sâu sắc và tận tâm sẽ nâng tầm thương hiệu từ một kênh phát thanh đơn chiều thành một đối tác đáng tin cậy.',
        conclusion: 'Làm chủ mạng xã hội về bản chất là sự hiếu khách trong không gian số. Khi trang của bạn là nơi chia sẻ tri thức chân thực, sự phát triển sẽ đến một cách tự nhiên.',
        keyPoints: [
          'Thiết lập nhận diện thị giác đồng bộ cho các bài đăng dạng carousel',
          'Kể câu chuyện hậu trường phía sau các dự án thực tế',
          'Đo lường chất lượng thảo luận và lượt chia sẻ hơn là lượt xem ảo'
        ]
      }
    }
  },
  {
    id: 'importance-of-user-experience',
    category: 'STUDIO',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_laptop_ux_workspace_1790133973378.jpg',
    readTime: '6 min read',
    date: 'Oct 12, 2024',
    publishTime: '16:45',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Product Architect', vi: 'Kiến trúc sư trải nghiệm' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'The importance of user experience: creating seamless digital interactions for your audience',
      vi: 'Tầm quan trọng của trải nghiệm người dùng: tạo tương tác số mượt mà cho đối tượng của bạn'
    },
    excerpt: {
      en: 'Delve into the significance of user experience design and learn how to optimize digital interactions effectively.',
      vi: 'Đi sâu vào ý nghĩa của thiết kế trải nghiệm người dùng (UX) và học cách tối ưu hoá các tương tác kỹ thuật số một cách hiệu quả.'
    },
    content: {
      en: {
        intro: 'Frictionless digital experiences are rarely noticed because they feel so natural. When user experience is engineered with intent, every tap, scroll, and transition feels like an intuitive extension of human thought.',
        section1Title: '1. Cognitive Load and Visual Hierarchy',
        section1Body: 'Every visual element introduced onto a canvas demands a fraction of the user’s cognitive energy. By stripping away extraneous decorations, loud banners, and conflicting calls-to-action, the user’s path to purpose becomes clear and effortless.',
        quote: 'Good design is invisible. Great experience feels inevitable.',
        quoteAuthor: 'Hiroki Tanaka',
        section2Title: '2. Micro-Interactions and Spatial Feedback',
        section2Body: 'Subtle motion feedback—hover states settling in 150ms, smooth drawer slide-ins, and deliberate tactile responses—assures users that the system is listening. Performance is not merely raw server speed; it is perceived continuity.',
        conclusion: 'Investing in UX architecture is the highest leverage strategy for digital products. Seamless experiences turn first-time visitors into passionate advocates.',
        keyPoints: [
          'Enforce strict typographic scale with maximum 2 font pairings',
          'Ensure all touch targets measure at least 44px on mobile devices',
          'Provide clear, immediate feedback for every form submission or action'
        ]
      },
      vi: {
        intro: 'Một trải nghiệm số mượt mà thường ít khi bị nhận ra chính vì nó quá tự nhiên. Khi UX được thiết kế có chủ đích, từng thao tác lướt, chạm và chuyển cảnh đều mang lại cảm giác nhẹ nhàng, dễ chịu như một phản xạ tự nhiên.',
        section1Title: '1. Giảm thiểu áp lực nhận thức và cấu trúc phân cấp thị giác',
        section1Body: 'Mỗi chi tiết xuất hiện trên màn hình đều tiêu tốn một phần năng lượng tập trung của người dùng. Bằng cách loại bỏ những chi tiết rườm rà, banner rối mắt và nút bấm xung đột, con đường đi đến mục tiêu của người dùng sẽ trở nên thông suốt.',
        quote: 'Thiết kế tốt là vô hình. Trải nghiệm tuyệt vời mang lại cảm giác tất yếu.',
        quoteAuthor: 'Hiroki Tanaka',
        section2Title: '2. Tương tác vi mô và phản hồi trực giác',
        section2Body: 'Những chuyển động tinh tế như hiệu ứng rê chuột phản hồi trong 150ms, thanh kéo trượt êm ái hay thông báo tức thời tạo cho người dùng sự tin tưởng rằng hệ thống luôn hoạt động nhịp nhàng.',
        conclusion: 'Đầu tư vào trải nghiệm người dùng là đòn bẩy lớn nhất cho mọi sản phẩm số. Một trải nghiệm liền mạch sẽ biến khách ghé thăm lần đầu thành những người đồng hành trung thành.',
        keyPoints: [
          'Áp dụng thang tỉ lệ chữ chặt chẽ với tối đa 2 bộ font kết hợp',
          'Đảm bảo mọi điểm chạm trên điện thoại đạt kích thước tối thiểu 44px',
          'Cung cấp phản hồi thị giác tức thì cho mọi thao tác gửi biểu mẫu'
        ]
      }
    }
  },
  {
    id: 'influencer-marketing-power',
    category: 'BRANDING',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_paper_desk_overhead_1790133987529.jpg',
    readTime: '5 min read',
    date: 'Sep 29, 2024',
    publishTime: '10:20',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Brand Strategist', vi: 'Chiến lược gia thương hiệu' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'Harnessing the power of influencer marketing: strategies for authentic brand partnerships',
      vi: 'Khai thác sức mạnh của influencer marketing: chiến lược hợp tác thương hiệu chân thực'
    },
    excerpt: {
      en: 'Discover how to leverage influencer partnerships to enhance brand awareness and drive engagement authentically.',
      vi: 'Khám phá cách tận dụng quan hệ đối tác với người có tầm ảnh hưởng để nâng cao nhận diện thương hiệu và tăng trưởng tự nhiên.'
    },
    content: {
      en: {
        intro: 'The era of generic brand endorsements has drawn to a close. Modern audiences crave genuine alignment between creator principles and the products they spotlight. True influence is measured in trust, not follower counts.',
        section1Title: '1. Niche Resonance Over Mass Reach',
        section1Body: 'Micro-creators who possess deep domain authority and active dialogue with their audience routinely outperform macro-celebrities in brand affinity and actual conversion. Seek partners whose daily practice embodies your brand values.',
        quote: 'Advocacy without genuine affinity is just noisy advertising.',
        quoteAuthor: 'Strategic Insights Report — 2024',
        section2Title: '2. Co-Creation Over Rigid Scripts',
        section2Body: 'Grant creators creative autonomy to interpret your brief in their authentic voice. Audiences can spot a scripted read immediately; genuine stories, honest trials, and behind-the-scenes insights earn sustained interest.',
        conclusion: 'Authentic partnerships transform marketing budgets into cultural capital that compound in equity over years.',
        keyPoints: [
          'Evaluate creator engagement quality and comment depth rather than follower tally',
          'Craft briefs that outline brand values rather than verbatim scripts',
          'Structure multi-quarter partnerships instead of one-off sponsored posts'
        ]
      },
      vi: {
        intro: 'Thời kỳ của những bài đăng quảng cáo hời hợt đã khép lại. Khán giả ngày nay đòi hỏi sự đồng điệu chân thực giữa quan điểm sống của người sáng tạo và sản phẩm họ giới thiệu. Sức ảnh hưởng đích thực đo bằng niềm tin, không phải số lượng người theo dõi.',
        section1Title: '1. Cộng hưởng ngách sâu sắc hơn độ phủ đại trà',
        section1Body: 'Những người sáng tạo nội dung ngách có chuyên môn sâu và tương tác tích cực với người xem thường mang lại tỷ lệ tin tưởng và chuyển đổi vượt trội so với các ngôi sao đại chúng. Hãy tìm kiếm những đối tác có phong cách sống phản ánh giá trị thương hiệu của bạn.',
        quote: 'Lời giới thiệu thiếu sự chân thành chỉ là một mẩu quảng cáo ồn ào.',
        quoteAuthor: 'Báo cáo Chiến lược Thương hiệu — 2024',
        section2Title: '2. Cùng sáng tạo thay vì gò bó theo kịch bản cứng nhắc',
        section2Body: 'Hãy trao cho người sáng tạo quyền tự chủ để truyền tải thông điệp bằng chính giọng văn quen thuộc của họ. Khán giả rất tinh tế để nhận ra bài đọc theo mẫu; câu chuyện chân thật và trải nghiệm thực tế mới là điều giữ chân họ.',
        conclusion: 'Mối quan hệ hợp tác chân thành sẽ biến ngân sách tiếp thị thành tài sản thương hiệu bền vững theo thời gian.',
        keyPoints: [
          'Đánh giá chất lượng thảo luận của người xem thay vì chỉ nhìn vào số lượng người theo dõi',
          'Xây dựng định hướng nội dung dựa trên giá trị cốt lõi thay vì kịch bản rập khuôn',
          'Ưu tiên hợp tác dài hạn thay vì các bài đăng ngắn hạn rời rạc'
        ]
      }
    }
  },
  {
    id: 'staying-ahead-in-digital-marketing-2024',
    category: 'NEWS',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_creatives_armchairs_1790134000004.jpg',
    readTime: '7 min read',
    date: 'Sep 15, 2024',
    publishTime: '11:00',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Industry Analyst', vi: 'Chuyên gia phân tích ngành' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'Staying ahead in digital marketing: Trends to watch for in 2024',
      vi: 'Dẫn đầu xu hướng tiếp thị số: Các xu hướng nổi bật cần theo dõi trong năm'
    },
    excerpt: {
      en: 'Stay informed about the latest digital marketing trends shaping the industry and influencing consumer behavior.',
      vi: 'Cập nhật liên tục các xu hướng tiếp thị số mới nhất đang định hình ngành công nghiệp và hành vi người tiêu dùng.'
    },
    content: {
      en: {
        intro: 'Digital marketing is undergoing a seismic recalibration. Privacy shifts, AI-augmented creative workflows, and community-first architectures are redefining how brands build enduring cultural resonance.',
        section1Title: '1. Privacy-First Data Architecture',
        section1Body: 'As third-party cookies sunset, zero-party data—information that consumers intentionally and proactively share with a brand—becomes the gold standard. Interactive quizzes, personalized preference centers, and bespoke consultations anchor this shift.',
        quote: 'The future of marketing belongs to brands that earn permission rather than purchase attention.',
        quoteAuthor: 'Hiroki Tanaka',
        section2Title: '2. Human Curation in an AI Era',
        section2Body: 'While generative tooling accelerates ideation, the premium on human curation, nuanced taste, and distinctive editorial voice has never been higher. Distinctive brands will stand out by doubling down on craftsmanship.',
        conclusion: 'Staying ahead requires an appetite for continuous experimentation paired with an immovable commitment to aesthetic integrity.',
        keyPoints: [
          'Invest heavily in owned media, newsletters, and bespoke customer journeys',
          'Deploy generative AI for research and drafting while preserving human taste in final polish',
          'Cultivate private communities (Discord, Slack, Substack) for high-intent brand advocates'
        ]
      },
      vi: {
        intro: 'Tiếp thị số đang trải qua một cuộc chuyển mình sâu sắc. Các chính sách bảo mật dữ liệu, công cụ sáng tạo hỗ trợ bởi AI và mô hình phát triển hướng về cộng đồng đang tái định hình cách thức thương hiệu kết nối với thế giới.',
        section1Title: '1. Kiến trúc dữ liệu ưu tiên quyền riêng tư',
        section1Body: 'Khi cookie của bên thứ ba dần biến mất, dữ liệu do chính khách hàng chủ động chia sẻ (zero-party data) trở thành tiêu chuẩn vàng. Những bài trắc nghiệm tương tác, bảng tuỳ chọn sở thích cá nhân và tư vấn riêng biệt chính là nền tảng của xu hướng này.',
        quote: 'Tương lai của tiếp thị thuộc về những thương hiệu biết cách nhận được sự đồng thuận thay vì mua sự chú ý.',
        quoteAuthor: 'Hiroki Tanaka',
        section2Title: '2. Dấu ấn tinh hoa con người giữa kỷ nguyên số',
        section2Body: 'Dù các công cụ tự động hóa tăng tốc quy trình làm việc, giá trị của gu thẩm mỹ độc đáo, sự thấu cảm tinh tế và tiếng nói cá nhân lại càng trở nên vô giá. Những thương hiệu nổi bật nhất sẽ là nơi tôn vinh tay nghề sáng tạo đích thực.',
        conclusion: 'Để luôn dẫn đầu, bạn cần tinh thần sẵn sàng đón nhận điều mới song hành với sự kiên định về chuẩn mực thẩm mỹ cao nhất.',
        keyPoints: [
          'Tập trung đầu tư vào các kênh truyền thông tự sở hữu như bản tin và website cá nhân',
          'Ứng dụng công nghệ hỗ trợ nghiên cứu nhưng giữ vững gu thẩm mỹ trong sản phẩm hoàn thiện',
          'Nuôi dưỡng các cộng đồng riêng tư cho những khách hàng trung thành nhất'
        ]
      }
    }
  },
  {
    id: 'science-of-storytelling',
    category: 'BRANDING',
    tag: 'WEB DESIGN',
    image: '/src/assets/images/blog_team_meeting_1790134014477.jpg',
    readTime: '5 min read',
    date: 'Sep 02, 2024',
    publishTime: '15:30',
    author: {
      name: 'Hiroki Tanaka',
      role: { en: 'Story Director', vi: 'Đạo diễn nội dung' },
      avatar: '/src/assets/images/blog_speaker_stage_1790133941051.jpg'
    },
    title: {
      en: 'The science of storytelling: Crafting narratives that resonate with your audience',
      vi: 'Nghệ thuật kể chuyện thương hiệu: Xây dựng câu chuyện lay động trái tim khách hàng'
    },
    excerpt: {
      en: 'Learn how to weave compelling narratives that captivate your audience and foster deeper connections with your brand.',
      vi: 'Học cách đan dệt những câu chuyện lôi cuốn, thu hút khán giả và xây dựng mối liên kết bền chặt hơn với thương hiệu của bạn.'
    },
    content: {
      en: {
        intro: 'Storytelling is not marketing ornament—it is neurological hardware. The human brain is evolutionarily wired to retain emotional narratives while effortlessly forgetting dry metric recitations.',
        section1Title: '1. Conflict and Vulnerability as Anchors',
        section1Body: 'Every memorable story hinges on an unresolved tension. When a brand honestly shares the hurdles, false starts, and lessons learned on its journey, audience empathy is unlocked. Perfect facades inspire skepticism; honest persistence inspires loyalty.',
        quote: 'Facts inform minds, but stories move people to action.',
        quoteAuthor: 'Narrative Design Handbook',
        section2Title: '2. The Customer as Protagonist',
        section2Body: 'In modern narrative design, the brand is never the hero of the story—the customer is. The brand serves as the mentor (the guide with the blueprint) who empowers the customer to conquer their challenge.',
        conclusion: 'When you master narrative architecture, your brand ceases to be a vendor and becomes an indispensable chapter in your customer’s personal journey.',
        keyPoints: [
          'Structure your case studies with clear context, hurdle, insight, and resolution',
          'Position your client as the champion and your studio as the trusted guide',
          'Use sensory, descriptive language that paints vivid mental pictures'
        ]
      },
      vi: {
        intro: 'Kể chuyện không chỉ là một thủ pháp tiếp thị mà là cách bộ não con người tiếp nhận thế giới. Chúng ta được lập trình để ghi nhớ những câu chuyện giàu cảm xúc trong khi dễ dàng quên đi những con số khô khan.',
        section1Title: '1. Thử thách và sự chân thật là điểm tựa cảm xúc',
        section1Body: 'Mọi câu chuyện đáng nhớ đều bắt nguồn từ một trở ngại cần vượt qua. Khi thương hiệu cởi mở chia sẻ về những khó khăn, bài học kinh nghiệm và hành trình kiên trì, người nghe sẽ cảm nhận được sự đồng điệu sâu sắc.',
        quote: 'Số liệu cung cấp thông tin, nhưng câu chuyện mới truyền cảm hứng hành động.',
        quoteAuthor: 'Sổ tay Thiết kế Truyền thông',
        section2Title: '2. Đặt khách hàng làm nhân vật chính',
        section2Body: 'Trong nghệ thuật kể chuyện hiện đại, thương hiệu không bao giờ đóng vai người hùng duy nhất—người hùng chính là khách hàng. Thương hiệu đóng vai trò người dẫn đường tận tụy, trao cho họ giải pháp để chinh phục mục tiêu của mình.',
        conclusion: 'Khi bạn thành thạo cách kể chuyện, thương hiệu của bạn sẽ không còn đơn thuần là một nhà cung cấp, mà trở thành một phần ý nghĩa trong hành trình của khách hàng.',
        keyPoints: [
          'Cấu trúc các dự án mẫu theo trình tự: bối cảnh, thách thức, giải pháp và kết quả',
          'Đặt khách hàng ở vị trí trung tâm và studio đóng vai trò bạn đồng hành tin cậy',
          'Sử dụng ngôn từ giàu hình ảnh và cảm xúc chân thật để khơi gợi sự đồng cảm'
        ]
      }
    }
  }
];

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'kista',
    name: 'Kista',
    title: { en: 'Kista Studio', vi: 'Kista Studio' },
    category: { en: 'Agency Brand & Web Experience', vi: 'Nhận diện Agency & Trải nghiệm Web' },
    categoryBadge: 'AGENCY',
    filterTag: 'BRANDING',
    secondaryTag: 'WEB DESIGN',
    year: '2024',
    description: {
      en: 'A high-concept fashion agency digital platform highlighting contemporary editorial campaigns and runway collections.',
      vi: 'Nền tảng kỹ thuật số cho agency thời trang ý niệm, tôn vinh các chiến dịch biên tập và bộ sưu tập đương đại.'
    },
    image: '/src/assets/images/work_kista_agency_1790135945749.jpg',
    deliverables: ['Brand Identity', 'Art Direction', 'Web Design', 'Full-stack Development'],
    client: 'Kista Studio Paris',
    timeline: '8 Weeks'
  },
  {
    id: 'akito',
    name: 'Akito',
    title: { en: 'Akito Buda', vi: 'Akito Buda' },
    category: { en: 'Creative Portfolio', vi: 'Portfolio Sáng Tạo' },
    categoryBadge: 'PORTFOLIO',
    filterTag: 'WEB DESIGN',
    secondaryTag: 'WEB DEVELOPMENT',
    year: '2024',
    description: {
      en: 'Experimental digital portfolio and interactive archive for Tokyo-based art director Akito Buda.',
      vi: 'Portfolio số thử nghiệm và kho lưu trữ tương tác cho giám đốc nghệ thuật Akito Buda tại Tokyo.'
    },
    image: '/src/assets/images/work_akito_portfolio_1790135960377.jpg',
    deliverables: ['Interactive UX', 'Creative Development', 'Editorial Layout', 'Motion Design'],
    client: 'Akito Buda Studio',
    timeline: '6 Weeks'
  },
  {
    id: 'kraft',
    name: 'Kraft',
    title: { en: 'Kraft Performance', vi: 'Kraft Performance' },
    category: { en: 'Automotive & Business Platform', vi: 'Nền tảng Doanh nghiệp & Xe điện' },
    categoryBadge: 'BUSINESS',
    filterTag: 'WEB DEVELOPMENT',
    secondaryTag: 'BRANDING',
    year: '2024',
    description: {
      en: 'Next-generation digital platform showcasing revolutionary electric vehicle performance engineering.',
      vi: 'Nền tảng kỹ thuật số thế hệ mới giới thiệu kỹ thuật đột phá của các dòng xe điện hiệu năng cao.'
    },
    image: '/src/assets/images/work_kraft_business_1790135978247.jpg',
    deliverables: ['Digital Architecture', '3D Configurator UI', 'Design System', 'Performance Optimization'],
    client: 'Kraft Mobility GmbH',
    timeline: '12 Weeks'
  },
  {
    id: 'nilsson',
    name: 'Nilsson',
    title: { en: 'Nilsson Architecture', vi: 'Kiến Trúc Nilsson' },
    category: { en: 'Architecture & Sustainable Design', vi: 'Kiến trúc & Không gian bền vững' },
    categoryBadge: 'BUSINESS',
    filterTag: 'WEB DESIGN',
    secondaryTag: 'BRANDING',
    year: '2024',
    description: {
      en: 'Editorial architectural showcase and spatial catalog exploring minimalist Nordic residential environments.',
      vi: 'Trưng bày kiến trúc biên tập và danh mục không gian khám phá những công trình nhà ở Bắc Âu tối giản.'
    },
    image: '/src/assets/images/work_nilsson_architect_1790135992309.jpg',
    deliverables: ['Brand Guidelines', 'Editorial Web Design', 'Interactive Floorplans', 'CMS Architecture'],
    client: 'Nilsson Arkitekter',
    timeline: '10 Weeks'
  },
  {
    id: 'larsson',
    name: 'Larsson',
    title: { en: 'Larsson Studio', vi: 'Larsson Studio' },
    category: { en: 'Luxury Fashion & Talent Agency', vi: 'Thời trang cao cấp & Quản lý người mẫu' },
    categoryBadge: 'AGENCY',
    filterTag: 'BRANDING',
    secondaryTag: 'WEB DESIGN',
    year: '2023',
    description: {
      en: 'High-contrast monochrome typographic identity and casting archive for an international modeling agency.',
      vi: 'Bộ nhận diện kiểu chữ đơn sắc tương phản cao và lưu trữ hồ sơ casting cho agency người mẫu quốc tế.'
    },
    image: '/src/assets/images/work_larsson_agency_1790136007494.jpg',
    deliverables: ['Visual Identity System', 'Talent Database UI', 'Web Direction', 'Typography Licensing'],
    client: 'Larsson Model Management',
    timeline: '7 Weeks'
  },
  {
    id: 'kjell',
    name: 'Kjell',
    title: { en: 'Kjell Films', vi: 'Hãng Phim Kjell' },
    category: { en: 'Cinematography & Film Production', vi: 'Sản xuất Điện ảnh & Quay phim' },
    categoryBadge: 'AGENCY',
    filterTag: 'WEB DEVELOPMENT',
    secondaryTag: 'WEB DESIGN',
    year: '2023',
    description: {
      en: 'Atmospheric video portfolio and documentary screening hub built for international film directors.',
      vi: 'Portfolio video giàu cảm xúc và trung tâm trình chiếu phim tài liệu dành cho các đạo diễn quốc tế.'
    },
    image: '/src/assets/images/work_kjell_films_1790136022089.jpg',
    deliverables: ['Video Stream Engine', 'Cinematic Interface', 'Custom Sound Integration', 'Frontend Architecture'],
    client: 'Kjell Films Copenhagen',
    timeline: '9 Weeks'
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 's-brand',
    number: '01',
    title: { en: 'Brand Strategy & Identity', vi: 'Chiến lược & Nhận diện thương hiệu' },
    description: {
      en: 'Positioning, visual systems, typographic governance, and bespoke brand artifacts crafted for long-term equity.',
      vi: 'Định vị thương hiệu, hệ thống nhận diện thị giác, quy chuẩn nghệ thuật chữ và tài sản thương hiệu độc bản.'
    },
    features: {
      en: ['Brand Narrative & Positioning', 'Visual Identity Systems', 'Guidelines & Design Tokens', 'Art Direction'],
      vi: ['Câu chuyện & Định vị thương hiệu', 'Hệ thống nhận diện thị giác', 'Cẩm nang thương hiệu & Tokens', 'Giám đốc nghệ thuật']
    }
  },
  {
    id: 's-digital',
    number: '02',
    title: { en: 'Digital Experience & UX/UI', vi: 'Trải nghiệm số & Thiết kế UX/UI' },
    description: {
      en: 'High-character, production-ready interfaces engineered with anti-slop discipline and human-centered ergonomics.',
      vi: 'Giao diện web độc bản, chỉn chu với tiêu chuẩn thẩm mỹ cao cấp và tối ưu cho người dùng thực tế.'
    },
    features: {
      en: ['Information Architecture', 'Editorial Web Design', 'Interactive Prototypes', 'Accessibility Audits'],
      vi: ['Kiến trúc thông tin', 'Thiết kế website biên tập', 'Bản mẫu tương tác mượt mà', 'Tiêu chuẩn tiếp cận tối ưu']
    }
  },
  {
    id: 's-editorial',
    number: '03',
    title: { en: 'Creative Direction & Content', vi: 'Giám đốc sáng tạo & Nội dung' },
    description: {
      en: 'Curating compelling narratives, bespoke photography direction, and editorial strategy that commands attention.',
      vi: 'Xây dựng câu chuyện lôi cuốn, định hướng hình ảnh chuyên nghiệp và chiến lược nội dung gây ấn tượng mạnh.'
    },
    features: {
      en: ['Editorial Storytelling', 'Campaign Architecture', 'Bilingual Content Strategy', 'Digital Monographs'],
      vi: ['Kể chuyện thương hiệu', 'Kiến trúc chiến dịch', 'Chiến lược nội dung song ngữ', 'Ấn phẩm số chuyên sâu']
    }
  }
];

export const UI_TEXT = {
  en: {
    nav: {
      home: 'HOME',
      connect: 'CONNECT',
      about: 'ABOUT',
      work: 'WORK',
      blog: 'BLOG',
      contact: 'CONTACT',
      services: 'SERVICES',
      pages: 'PAGES',
      letsTalk: "LET'S TALK",
      langSwitch: 'VI'
    },
    connectSection: {
      heroTitle: 'Digital excellence for modern brands.',
      heroSubtitle: 'Discover our passion for creativity and technology as we strive to transform.',
      missionBadge: 'OUR MISSION',
      missionTitle: 'At our core, we believe in the transformative power of digital technology.',
      missionCol1: "Our mission is to empower businesses of all sizes to thrive in the digital age by providing innovative solutions that drive growth and success. We are committed to delivering exceptional results through a combination of creativity, expertise, and collaboration. With a focus on understanding our clients' unique needs and objectives, we tailor our approach to ensure maximum impact and value. Whether it's crafting a compelling brand identity, designing an intuitive website, or implementing effective SEO strategies, we are dedicated to helping our clients achieve their goals and surpass their expectations.",
      missionCol2: "Our team of talented professionals is passionate about pushing the boundaries of digital innovation and delivering solutions that make a difference. Together, we work tirelessly to create meaningful experiences that resonate with audiences, drive engagement, and ultimately, drive business results. With a relentless focus on quality, integrity, and customer satisfaction, we are committed to being a trusted partner for our clients as they navigate the ever-evolving digital landscape.",
      stats: [
        {
          label: 'HAPPY CLIENTS',
          value: '100%',
          desc: 'Our focus on client satisfaction ensures a 100% happiness rate with our services.'
        },
        {
          label: 'COMMITMENT',
          value: '110%',
          desc: 'We give 110% commitment to every project we undertake.'
        },
        {
          label: 'PROJECTS',
          value: '250+',
          desc: "We've successfully completed over 250 projects, delivering outstanding results."
        },
        {
          label: 'CLIENTS',
          value: '140+',
          desc: 'Over 140 satisfied clients trust our expertise and exceptional services.'
        }
      ],
      teamBadge: 'OUR TEAM',
      teamTitle: 'One team. One goal: To drive digital innovation and deliver exceptional results for our clients.',
      joinCard: {
        title: 'Join Hiroki!',
        desc: 'Explore exciting career opportunities with us and take the next step towards building your future in digital innovation.',
        button: 'AVAILABLE JOBS'
      },
      teamMembers: [
        {
          name: 'Emil Johnson',
          role: 'WEB DESIGNER',
          image: '/src/assets/images/team_emil_johnson_1790135108227.jpg'
        },
        {
          name: 'Michael Smith',
          role: 'WEB DEVELOPER',
          image: '/src/assets/images/creative_man_notebook_1790135085678.jpg'
        },
        {
          name: 'Sarah Lee',
          role: 'CONTENT WRITER',
          image: '/src/assets/images/team_sarah_lee_1790135127741.jpg'
        },
        {
          name: 'David Brown',
          role: 'SEO SPECIALIST',
          image: '/src/assets/images/team_david_brown_1790135150592.jpg'
        }
      ]
    },
    workSection: {
      title: 'Work',
      subtitle: 'Dive into our curated collection of projects, highlighting our expertise.',
      filters: {
        all: 'ALL',
        branding: 'BRANDING',
        webDesign: 'WEB DESIGN',
        webDev: 'WEB DEVELOPMENT'
      },
      inquireBtn: 'INQUIRE ABOUT THIS PROJECT',
      clientLabel: 'CLIENT',
      timelineLabel: 'TIMELINE',
      deliverablesLabel: 'DELIVERABLES'
    },
    homeSection: {
      statusBadge: 'AVAILABLE FOR SELECT COMMISSIONS',
      heroKicker: 'INDEPENDENT DESIGN & CREATIVE DIRECTION · TOKYO / WORLDWIDE',
      heroTitle: 'Crafting distinct digital identities & timeless brand experiences.',
      heroBio: 'Hiroki Tanaka is an independent creative director and product architect partnering with visionary founders, design studios, and culture makers to distill complex ideas into captivating, human experiences.',
      ctaExplore: 'EXPLORE WORK',
      ctaContact: "LET'S TALK",
      stats: [
        { value: '10+', label: 'Years Experience' },
        { value: '90+', label: 'Global Projects' },
        { value: '24', label: 'Design Awards' },
        { value: '100%', label: 'Independent Craft' }
      ],
      worksBadge: 'SELECTED WORKS (2023 - 2024)',
      worksTitle: 'Featured Case Studies',
      worksDesc: 'A curated selection of brand identities, e-commerce flagships, and editorial digital architectures.',
      viewAllWork: 'VIEW ALL WORK',
      philosophyBadge: 'PHILOSOPHY & CRAFT',
      philosophyTitle: 'Quiet aesthetic restraint meets relentless structural precision.',
      philosophyQuote: 'True luxury in digital design is not loud decoration; it is clarity of purpose, typographic mastery, and respect for the user’s cognitive space.',
      philosophyAuthor: 'Hiroki Tanaka — Design Director',
      pillars: [
        {
          num: '01',
          title: 'Brand Strategy & Visual Systems',
          desc: 'Positioning, typographic governance, and bespoke brand artifacts crafted for enduring recognition.'
        },
        {
          num: '02',
          title: 'Digital Experience & Product UX',
          desc: 'High-character, production-ready interfaces engineered with anti-slop discipline and responsive fluidity.'
        },
        {
          num: '03',
          title: 'Editorial Direction & Storytelling',
          desc: 'Curating compelling narratives, bespoke photography direction, and digital publications that command trust.'
        }
      ],
      readBio: 'READ FULL BIOGRAPHY',
      articlesBadge: 'PERSPECTIVES & ESSAYS',
      articlesTitle: 'From the Blog',
      articlesDesc: 'Essays, design methodologies, and industry analyses on digital culture and brand strategy.',
      viewAllArticles: 'ALL ARTICLES',
      ctaBanner: {
        tag: 'COLLABORATION',
        title: 'Have an ambitious project in mind? Let’s create something timeless.',
        subtitle: 'Currently accepting select brand commissions, digital product architectures, and creative advisory worldwide.',
        button: "START A CONVERSATION"
      }
    },
    hero: {
      title: 'Blog',
      subtitle: 'Explore our blog for expert perspectives, strategies, and trends.'
    },
    filters: {
      all: 'ALL',
      branding: 'BRANDING',
      studio: 'STUDIO',
      news: 'NEWS'
    },
    card: {
      readArticle: 'READ ARTICLE',
      by: 'By',
      minRead: 'min read'
    },
    reader: {
      back: 'Back to all articles',
      publishedOn: 'Published on',
      writtenBy: 'Written by',
      takeaways: 'Key Strategic Takeaways',
      share: 'Share Article',
      copied: 'Link copied to clipboard!',
      nextArticle: 'Next Article'
    },
    contactModal: {
      badge: "LET'S COLLABORATE",
      title: 'Start a conversation.',
      subtitle: 'Have a project in mind, need design direction, or want to discuss strategic branding? Let’s connect.',
      nameLabel: 'Your Full Name',
      namePlaceholder: 'e.g. Alex Morgan',
      emailLabel: 'Email Address',
      emailPlaceholder: 'alex@company.com',
      serviceLabel: 'Area of Interest',
      serviceOptions: ['Brand Identity & Strategy', 'UX/UI & Web Experience', 'Editorial Direction', 'General Inquiry'],
      messageLabel: 'Project Overview / Message',
      messagePlaceholder: 'Tell us about your goals, timeline, and scope...',
      submitBtn: 'Send Message',
      sendingBtn: 'Sending...',
      successTitle: 'Message received!',
      successDesc: 'Thank you for reaching out. We will get back to you within 24 hours.',
      directEmail: 'Direct email',
      location: 'Based in Tokyo / Working Worldwide'
    },
    contactPage: {
      title: 'Contact',
      subtitle: "Get in touch with us today! We're here to answer\nyour questions and discuss how we can help you.",
      namePlaceholder: 'Name',
      emailPlaceholder: 'Name',
      messagePlaceholder: 'Name',
      sendBtn: 'SEND MESSAGE',
      sendingBtn: 'SENDING...',
      successTitle: 'Message Sent Successfully',
      successSubtitle: "Thank you for getting in touch! We're here to answer your questions and will respond promptly.",
      sendAnother: 'Send another message'
    },
    pagesModal: {
      title: 'Site Navigation & Pages',
      subtitle: 'Explore all available destinations in this portfolio website.',
      sections: {
        main: 'Main Pages',
        cases: 'Case Studies & CMS',
        legal: 'Utility & System'
      }
    },
    footer: {
      brandSub: 'By Gola Templates.',
      designedFor: 'Hiroki Tanaka — Independent Design & Creative Direction.',
      col1Title: 'PAGES',
      col1Links: ['HOME', 'SERVICES', 'ABOUT', 'CAREER', 'CONTACT'],
      moreTemplatesBtn: 'MORE TEMPLATES',
      col2Title: 'CMS',
      col2Links: ['WORK', 'WORK SINGLE', 'BLOG', 'BLOG SINGLE'],
      col3Title: 'UTILITY PAGES',
      col3Links: ['404 ERROR PAGE', 'STYLEGUIDE', 'LICENSING', 'CHANGELOG'],
      copyright: '© 2024 Hiroki Tanaka. All rights reserved. Crafted with clean typography and editorial discipline.'
    },
    aboutSection: {
      badge: 'ABOUT HIROKI',
      title: 'Crafting thoughtful digital landscapes and enduring brand identities.',
      bio: 'With over a decade of creative leadership, Hiroki Tanaka partners with visionary founders, design studios, and cultural institutions to distill complex ideas into captivating, human experiences.',
      experience: '10+ Years of Practice',
      awards: '24 Industry Honors',
      projectsCount: '90+ Completed Works',
      clientQuote: 'Hiroki brings a rare duality: immaculate visual taste paired with rigorous engineering discipline.'
    }
  },
  vi: {
    nav: {
      home: 'TRANG CHỦ',
      connect: 'KẾT NỐI',
      about: 'GIỚI THIỆU',
      work: 'DỰ ÁN',
      blog: 'BÀI VIẾT',
      contact: 'LIÊN HỆ',
      services: 'DỊCH VỤ',
      pages: 'TRANG',
      letsTalk: 'LIÊN HỆ',
      langSwitch: 'EN'
    },
    connectSection: {
      heroTitle: 'Đẳng cấp kỹ thuật số cho các thương hiệu hiện đại.',
      heroSubtitle: 'Khám phá đam mê sáng tạo và công nghệ của chúng tôi trong hành trình chuyển đổi.',
      missionBadge: 'SỨ MỆNH CỦA CHÚNG TÔI',
      missionTitle: 'Tại tâm điểm, chúng tôi tin tưởng sâu sắc vào sức mạnh biến đổi của công nghệ số.',
      missionCol1: 'Sứ mệnh của chúng tôi là trao quyền cho doanh nghiệp mọi quy mô phát triển vượt trội trong kỷ nguyên số bằng các giải pháp tiên phong thúc đẩy tăng trưởng và thành công. Chúng tôi cam kết mang lại kết quả xuất sắc thông qua sự kết hợp giữa tính sáng tạo, chuyên môn sâu và tinh thần đồng hành. Lấy việc thấu hiểu nhu cầu và mục tiêu độc bản của khách hàng làm trọng tâm, chúng tôi may đo từng giải pháp để tối ưu hóa giá trị và tầm ảnh hưởng.',
      missionCol2: 'Đội ngũ chuyên gia tài năng của chúng tôi luôn đam mê vượt qua mọi giới hạn của đổi mới kỹ thuật số để tạo nên những giải pháp mang lại sự khác biệt thực sự. Cùng nhau, chúng tôi tạo dựng những trải nghiệm ý nghĩa, thu hút khán giả và thúc đẩy kết quả kinh doanh vượt bậc. Với chuẩn mực khắt khe về chất lượng, sự chính trực và hài lòng của khách hàng, chúng tôi tự hào là đối tác tin cậy.',
      stats: [
        {
          label: 'KHÁCH HÀNG HÀI LÒNG',
          value: '100%',
          desc: 'Cam kết mang lại trải nghiệm hoàn hảo và tỷ lệ hài lòng tuyệt đối 100% với các dịch vụ của chúng tôi.'
        },
        {
          label: 'SỰ TẬN TÂM',
          value: '110%',
          desc: 'Chúng tôi dành trọn vẹn 110% tâm huyết và sự kỹ lưỡng cho mọi dự án đảm nhận.'
        },
        {
          label: 'DỰ ÁN HOÀN THÀNH',
          value: '250+',
          desc: 'Đã hoàn thành xuất sắc hơn 250 dự án số, mang lại những thành quả vượt bậc.'
        },
        {
          label: 'ĐỐI TÁC TIN CẬY',
          value: '140+',
          desc: 'Hơn 140 khách hàng và thương hiệu toàn cầu gửi gắm niềm tin vào chuyên môn của chúng tôi.'
        }
      ],
      teamBadge: 'ĐỘI NGŨ CHÚNG TÔI',
      teamTitle: 'Một đội ngũ. Một mục tiêu: Thúc đẩy đổi mới kỹ thuật số và mang lại kết quả vượt trội cho khách hàng.',
      joinCard: {
        title: 'Gia nhập Hiroki!',
        desc: 'Khám phá các cơ hội nghề nghiệp thú vị cùng chúng tôi và kiến tạo tương lai của công nghệ số.',
        button: 'VỊ TRÍ TUYỂN DỤNG'
      },
      teamMembers: [
        {
          name: 'Emil Johnson',
          role: 'WEB DESIGNER',
          image: '/src/assets/images/team_emil_johnson_1790135108227.jpg'
        },
        {
          name: 'Michael Smith',
          role: 'WEB DEVELOPER',
          image: '/src/assets/images/creative_man_notebook_1790135085678.jpg'
        },
        {
          name: 'Sarah Lee',
          role: 'CONTENT WRITER',
          image: '/src/assets/images/team_sarah_lee_1790135127741.jpg'
        },
        {
          name: 'David Brown',
          role: 'SEO SPECIALIST',
          image: '/src/assets/images/team_david_brown_1790135150592.jpg'
        }
      ]
    },
    workSection: {
      title: 'Work',
      subtitle: 'Khám phá bộ sưu tập dự án tuyển chọn, thể hiện chuyên môn và năng lực sáng tạo của chúng tôi.',
      filters: {
        all: 'TẤT CẢ',
        branding: 'BRANDING',
        webDesign: 'WEB DESIGN',
        webDev: 'WEB DEVELOPMENT'
      },
      inquireBtn: 'YÊU CẦU TƯ VẤN DỰ ÁN',
      clientLabel: 'KHÁCH HÀNG',
      timelineLabel: 'THỜI GIAN',
      deliverablesLabel: 'HẠNG MỤC'
    },
    homeSection: {
      statusBadge: 'SẴN SÀNG HỢP TÁC DỰ ÁN MỚI',
      heroKicker: 'THIẾT KẾ ĐỘC LẬP & GIÁM ĐỐC NGHỆ THUẬT · TOKYO / TOÀN CẦU',
      heroTitle: 'Kiến tạo nhận diện thương hiệu độc bản & trải nghiệm số vượt thời gian.',
      heroBio: 'Hiroki Tanaka là giám đốc sáng tạo độc lập và kiến trúc sư trải nghiệm số, đồng hành cùng các nhà sáng lập tiên phong, studio thiết kế và tổ chức văn hóa để biến những ý tưởng phức tạp thành trải nghiệm trực quan lay động lòng người.',
      ctaExplore: 'KHÁM PHÁ DỰ ÁN',
      ctaContact: 'LIÊN HỆ NGAY',
      stats: [
        { value: '10+', label: 'Năm Kinh Nghiệm' },
        { value: '90+', label: 'Dự Án Toàn Cầu' },
        { value: '24', label: 'Giải Thưởng Thiết Kế' },
        { value: '100%', label: 'Tay Nghề Độc Bản' }
      ],
      worksBadge: 'DỰ ÁN TIÊU BIỂU (2023 - 2024)',
      worksTitle: 'Các Dự Án Nổi Bật',
      worksDesc: 'Tuyển tập các dự án định danh thương hiệu, nền tảng thương mại điện tử và kiến trúc số.',
      viewAllWork: 'XEM TẤT CẢ DỰ ÁN',
      philosophyBadge: 'TRIẾT LÝ & TAY NGHỀ',
      philosophyTitle: 'Nét tối giản thanh lịch hòa cùng trật tự kết cấu chuẩn xác.',
      philosophyQuote: 'Sự xa xỉ đích thực trong thiết kế số không nằm ở trang trí màu mè; nó là sự sáng tỏ về mục đích, tinh hoa nghệ thuật chữ và sự trân trọng tâm trí người dùng.',
      philosophyAuthor: 'Hiroki Tanaka — Giám đốc Thiết kế',
      pillars: [
        {
          num: '01',
          title: 'Chiến Lược Thương Hiệu & Hệ Nhận Diện',
          desc: 'Định vị thương hiệu, chuẩn mực nghệ thuật chữ và tài sản thị giác độc bản được xây dựng cho sự phát triển trường tồn.'
        },
        {
          num: '02',
          title: 'Trải Nghiệm Số & Thiết Kế Sản Phẩm UX',
          desc: 'Giao diện web độc bản, chỉn chu với tiêu chuẩn thẩm mỹ cao cấp và tối ưu cho người dùng thực tế.'
        },
        {
          num: '03',
          title: 'Giám Đốc Nghệ Thuật & Kể Chuyện Nội Dung',
          desc: 'Xây dựng câu chuyện lôi cuốn, định hướng hình ảnh chuyên nghiệp và ấn phẩm số mang lại sự tin cậy vững chắc.'
        }
      ],
      readBio: 'XEM TIỂU SỬ ĐẦY ĐỦ',
      articlesBadge: 'GÓC NHÌN & BÀI VIẾT',
      articlesTitle: 'Bài Viết Mới Nhất',
      articlesDesc: 'Các bài viết phân tích, phương pháp thiết kế và xu hướng tiếp thị số trong bối cảnh đương đại.',
      viewAllArticles: 'TẤT CẢ BÀI VIẾT',
      ctaBanner: {
        tag: 'HỢP TÁC SÁNG TẠO',
        title: 'Bạn đang ấp ủ một dự án đột phá? Hãy cùng nhau tạo nên điều đặc biệt.',
        subtitle: 'Hiện đang nhận các dự án hợp tác chọn lọc và tư vấn chiến lược thương hiệu cho các đối tác trên toàn thế giới.',
        button: 'BẮT ĐẦU DỰ ÁN'
      }
    },
    hero: {
      title: 'Bài Viết',
      subtitle: 'Khám phá các góc nhìn chuyên sâu, chiến lược thương hiệu và xu hướng thiết kế mới nhất.'
    },
    filters: {
      all: 'TẤT CẢ',
      branding: 'THƯƠNG HIỆU',
      studio: 'STUDIO',
      news: 'TIN TỨC'
    },
    card: {
      readArticle: 'ĐỌC BÀI VIẾT',
      by: 'Bởi',
      minRead: 'phút đọc'
    },
    reader: {
      back: 'Quay lại danh sách bài viết',
      publishedOn: 'Đăng ngày',
      writtenBy: 'Tác giả',
      takeaways: 'Điểm Nhấn Chiến Lược Quan Trọng',
      share: 'Chia sẻ bài viết',
      copied: 'Đã sao chép liên kết!',
      nextArticle: 'Bài viết kế tiếp'
    },
    contactModal: {
      badge: 'HỢP TÁC SÁNG TẠO',
      title: 'Cùng bắt đầu dự án mới.',
      subtitle: 'Bạn có một dự án tiềm năng, muốn định hướng thiết kế hoặc xây dựng thương hiệu bài bản? Hãy kết nối cùng chúng tôi.',
      nameLabel: 'Họ và tên của bạn',
      namePlaceholder: 'VD: Nguyễn Minh Trí',
      emailLabel: 'Địa chỉ Email',
      emailPlaceholder: 'tri.nguyen@congty.vn',
      serviceLabel: 'Dịch vụ quan tâm',
      serviceOptions: ['Nhận diện & Chiến lược thương hiệu', 'Thiết kế UX/UI & Trải nghiệm số', 'Giám đốc nghệ thuật & Nội dung', 'Tư vấn chung'],
      messageLabel: 'Mô tả dự án / Lời nhắn',
      messagePlaceholder: 'Chia sẻ về mục tiêu, thời gian dự kiến và quy mô dự án của bạn...',
      submitBtn: 'Gửi Lời Nhắn',
      sendingBtn: 'Đang gửi...',
      successTitle: 'Đã nhận được thông điệp!',
      successDesc: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.',
      directEmail: 'Email trực tiếp',
      location: 'Trụ sở tại Tokyo / Làm việc toàn cầu'
    },
    contactPage: {
      title: 'Contact',
      subtitle: 'Liên hệ với chúng tôi ngay hôm nay! Chúng tôi luôn sẵn sàng giải đáp thắc mắc và cùng thảo luận cách hỗ trợ tốt nhất cho bạn.',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      messagePlaceholder: 'Message',
      sendBtn: 'SEND MESSAGE',
      sendingBtn: 'ĐANG GỬI...',
      successTitle: 'Tin nhắn đã được gửi thành công',
      successSubtitle: 'Cảm ơn bạn đã liên hệ! Chúng tôi luôn sẵn sàng giải đáp và sẽ phản hồi sớm nhất.',
      sendAnother: 'Gửi tin nhắn khác'
    },
    pagesModal: {
      title: 'Danh mục trang web',
      subtitle: 'Khám phá tất cả các trang và phân khu có trong website cá nhân.',
      sections: {
        main: 'Các trang chính',
        cases: 'Dự án & Quản lý nội dung',
        legal: 'Trang tiện ích & Hệ thống'
      }
    },
    footer: {
      brandSub: 'Bởi Gola Templates.',
      designedFor: 'Hiroki Tanaka — Thiết kế độc lập & Giám đốc nghệ thuật.',
      col1Title: 'TRANG CHÍNH',
      col1Links: ['TRANG CHỦ', 'DỊCH VỤ', 'GIỚI THIỆU', 'SỰ NGHIỆP', 'LIÊN HỆ'],
      moreTemplatesBtn: 'XEM THÊM MẪU',
      col2Title: 'HỆ THỐNG CMS',
      col2Links: ['DỰ ÁN', 'CHI TIẾT DỰ ÁN', 'BÀI VIẾT', 'CHI TIẾT BÀI VIẾT'],
      col3Title: 'TRANG TIỆN ÍCH',
      col3Links: ['TRANG LỖI 404', 'QUY CHUẨN STYLE', 'BẢN QUYỀN', 'LỊCH SỬ THAY ĐỔI'],
      copyright: '© 2024 Hiroki Tanaka. Bảo lưu mọi quyền. Được kiến tạo với chuẩn mực nghệ thuật chữ và phong cách thanh lịch.'
    },
    aboutSection: {
      badge: 'VỀ HIROKI',
      title: 'Kiến tạo những không gian số ý nghĩa và nhận diện thương hiệu bền vững.',
      bio: 'Với hơn một thập kỷ dẫn dắt sáng tạo, Hiroki Tanaka đồng hành cùng các nhà sáng lập tiên phong, các studio thiết kế và tổ chức văn hóa để biến những ý tưởng phức tạp thành trải nghiệm trực quan lay động lòng người.',
      experience: '10+ Năm Kinh Nghiệm',
      awards: '24 Giải Thưởng Quốc Tế',
      projectsCount: '90+ Dự Án Hoàn Thành',
      clientQuote: 'Hiroki sở hữu sự kết hợp hiếm có: gu thẩm mỹ thị giác tinh tế hòa cùng sự kỷ luật kỹ thuật sắc sảo.'
    }
  }
};
