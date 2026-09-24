import { Language, WORK_PROJECTS, Article } from '../data/content';
import { LogoIpsum } from './LogoIpsum';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses, DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface HomeViewProps {
  lang: Language;
  onNavigate: (tab: 'home' | 'connect' | 'work' | 'blog' | 'services' | 'contact') => void;
  onSelectArticle?: (article: Article) => void;
  onOpenContact: () => void;
}

export function HomeView({
  lang,
  onNavigate,
  onOpenContact
}: HomeViewProps) {
  const isEn = lang === 'en';
  const { publishedProjects, publishedServices, siteSettings, categories, editorialTags } = useCMS();

  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  // Use dynamic projects from CMS or fallback
  const projectsSource = (publishedProjects && publishedProjects.length > 0)
    ? publishedProjects
    : WORK_PROJECTS;

  const showcaseProjects = projectsSource.slice(0, 6).map((p) => {
    // Resolve category name (e.g. BRANDING, WEB DESIGN, WEB DEVELOPMENT or custom category)
    const matchingCategory = categories?.find(
      (c) =>
        c.name.toUpperCase() === (p.filterTag || '').toUpperCase() ||
        c.name.toUpperCase() === String(typeof p.category === 'string' ? p.category : '').toUpperCase()
    );

    const rawCat = p.filterTag || (typeof p.category === 'object' ? (isEn ? p.category.en : p.category.vi) : p.category) || 'BRANDING';

    const categoryDisplay = matchingCategory
      ? (isEn ? (matchingCategory.label_en || matchingCategory.name) : (matchingCategory.label_vi || matchingCategory.name))
      : rawCat;

    const matchingBadge = editorialTags?.find(
      (tag) => tag.name.toUpperCase() === (p.categoryBadge || '').toUpperCase()
    );
    const badgeColorClass = getBadgeColorClasses(matchingBadge?.color || 'zinc');

    return {
      id: p.id,
      name: p.name,
      category: categoryDisplay,
      categoryCode: (p.filterTag || matchingCategory?.name || rawCat).toUpperCase(),
      badge: p.categoryBadge,
      badgeColorClass,
      image: p.image,
    };
  });

  // Default fallback services
  const defaultServicesList = [
    {
      num: '01',
      title: 'Branding',
      desc: isEn
        ? 'Crafting identities that resonate and inspire lasting connections with audiences.'
        : 'Kiến tạo nhận diện thương hiệu gợi cảm hứng và xây dựng kết nối bền lâu với công chúng.',
      link: isEn ? 'ABOUT BRANDING' : 'VỀ BRANDING'
    },
    {
      num: '02',
      title: 'Web Design',
      desc: isEn
        ? 'Designing intuitive interfaces that captivate users and drive engagement seamlessly.'
        : 'Thiết kế giao diện trực quan cuốn hút người dùng và tối ưu tương tác mượt mà.',
      link: isEn ? 'ABOUT WEB DESIGN' : 'VỀ THIẾT KẾ WEB'
    },
    {
      num: '03',
      title: 'Web Development',
      desc: isEn
        ? "Building robust digital infrastructures tailored to your brand's unique needs."
        : 'Xây dựng nền tảng công nghệ số vững chắc đáp ứng riêng biệt nhu cầu thương hiệu.',
      link: isEn ? 'ABOUT WEB DEVELOPMENT' : 'VỀ PHÁT TRIỂN WEB'
    },
    {
      num: '04',
      title: 'SEO & Content',
      desc: isEn
        ? 'Optimizing content and strategies to boost visibility and organic reach.'
        : 'Tối ưu hóa nội dung và chiến lược để thúc đẩy độ hiển thị và lưu lượng tự nhiên.',
      link: isEn ? 'ABOUT SEO & CONTENT' : 'VỀ SEO & NỘI DUNG'
    }
  ];

  // Resolve dynamic services from CMS or default fallback
  const servicesList = (publishedServices && publishedServices.length > 0)
    ? publishedServices.map((srv) => {
        const titleStr = typeof srv.title === 'object'
          ? (isEn ? srv.title?.en : srv.title?.vi)
          : (srv.title || '');
        const descStr = typeof srv.description === 'object'
          ? (isEn ? srv.description?.en : srv.description?.vi)
          : (srv.description || '');
        const linkStr = srv.linkText
          ? (typeof srv.linkText === 'object' ? (isEn ? srv.linkText?.en : srv.linkText?.vi) : srv.linkText)
          : (isEn ? `ABOUT ${(titleStr || '').toUpperCase()}` : `VỀ ${(titleStr || '').toUpperCase()}`);
        return {
          num: srv.number || '01',
          title: titleStr || 'Dịch vụ',
          desc: descStr || '',
          link: linkStr || (isEn ? 'LEARN MORE' : 'XEM CHI TIẾT'),
        };
      })
    : defaultServicesList;

  // 4 Client Testimonials matching screenshot
  const clientReviews = [
    {
      variant: 1 as const,
      quote: isEn
        ? 'Exceptional service, exceeded expectations. Hiroki delivered stunning designs promptly.'
        : 'Dịch vụ xuất sắc, vượt trên kỳ vọng. Hiroki đã bàn giao những thiết kế tuyệt mỹ một cách nhanh chóng.',
      body: isEn
        ? 'Their attention to detail and communication made the process seamless. Highly recommend their services for branding and web development.'
        : 'Sự tỉ mỉ đến từng chi tiết và khả năng lắng nghe tuyệt vời đã giúp toàn bộ quy trình diễn ra vô cùng suôn sẻ. Rất khuyến nghị dịch vụ xây dựng thương hiệu và phát triển web của họ.',
      author: 'Sarah Johnson',
      company: 'JOHNSON & CO.',
      avatar: '/src/assets/images/team_sarah_lee_1790135127741.jpg'
    },
    {
      variant: 2 as const,
      quote: isEn
        ? 'Professional, reliable, and highly skilled team. Significantly boosted our online visibility.'
        : 'Đội ngũ chuyên nghiệp, đáng tin cậy và tay nghề cao. Đã giúp tăng trưởng mạnh mẽ độ nhận diện trực tuyến của chúng tôi.',
      body: isEn
        ? "Hiroki's expertise in SEO and content strategy significantly boosted our online visibility. Their dedication to our project's success was evident throughout. A pleasure to work with."
        : 'Chuyên môn sâu của Hiroki về SEO và chiến lược nội dung đã nâng tầm thương hiệu của chúng tôi trên không gian số. Sự tận tụy đồng hành xuyên suốt mang lại trải nghiệm hợp tác rất hài lòng.',
      author: 'David Lee',
      company: 'INNOVATIONS LTD.',
      avatar: '/src/assets/images/team_david_brown_1790135150592.jpg'
    },
    {
      variant: 3 as const,
      quote: isEn
        ? 'Innovative designs tailored perfectly to our needs.'
        : 'Những thiết kế sáng tạo đột phá, được may đo hoàn hảo theo đúng nhu cầu của chúng tôi.',
      body: isEn
        ? 'Hiroki’s web design team captured our brand essence brilliantly. Their collaborative approach ensured our vision translated seamlessly into our digital presence. Highly recommended.'
        : 'Đội ngũ thiết kế của Hiroki đã nắm bắt trọn vẹn bản sắc thương hiệu của chúng tôi. Cách làm việc đồng hành chặt chẽ giúp hiện thực hóa tầm nhìn một cách hoàn hảo.',
      author: 'Emily Chen',
      company: 'CREATIVE AGENCY',
      avatar: '/src/assets/images/team_emil_johnson_1790135108227.jpg'
    },
    {
      variant: 4 as const,
      quote: isEn
        ? 'Reliable partners for digital success. A trusted partner for our future projects.'
        : 'Đối tác tin cậy cho thành công kỹ thuật số. Người đồng hành không thể thiếu cho các dự án tương lai.',
      body: isEn
        ? 'Hiroki provided exceptional web development services, exceeding our expectations. Their professionalism and attention to detail made the process smooth.'
        : 'Hiroki mang đến dịch vụ phát triển web xuất sắc, vượt xa sự mong đợi ban đầu. Sự chuyên nghiệp và chuẩn mực cao làm cho tiến độ luôn thông suốt.',
      author: 'Michael Thompson',
      company: 'THOMPSON LLC',
      avatar: '/src/assets/images/creative_man_notebook_1790135085678.jpg'
    }
  ];

  return (
    <div className="animate-in fade-in duration-300 px-4 sm:px-8 lg:px-10 pb-16">
      {/* ============================================================ */}
      {/* 1. HERO SECTION: Heading & 6 Work Cards (3 cols x 2 rows)   */}
      {/* ============================================================ */}
      <section className="pt-6 sm:pt-10 pb-16">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-zinc-100">
          <h1
            style={{
              fontFamily: typography.h1FontFamily,
              fontSize: typography.h1CustomPx ? `clamp(32px, 6vw, ${typography.h1CustomPx}px)` : undefined,
            }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[84px] text-zinc-900 leading-[1.05] tracking-tight font-normal"
          >
            {isEn ? (
              siteSettings?.home?.heroTitle_en || (
                <>
                  A digital agency
                  <br />
                  from Tokyo.
                </>
              )
            ) : (
              siteSettings?.home?.heroTitle_vi || (
                <>
                  Một digital agency
                  <br />
                  từ Tokyo.
                </>
              )
            )}
          </h1>

          <p className="text-zinc-600 text-sm sm:text-base md:text-[17px] max-w-sm md:text-right leading-relaxed font-sans">
            {isEn
              ? (siteSettings?.home?.heroSubtitle_en || "Transform your brand's identity and digital footprint with our specialized services.")
              : (siteSettings?.home?.heroSubtitle_vi || 'Chuyển đổi nhận diện thương hiệu và dấu ấn kỹ thuật số của bạn với các dịch vụ chuyên biệt của chúng tôi.')}
          </p>
        </div>

        {/* 6 Works Grid (3 columns x 2 rows) matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-10 sm:pt-14">
          {showcaseProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onNavigate('work')}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container with crisp ratio */}
              <div className="w-full aspect-[16/10] overflow-hidden rounded-md bg-zinc-100 shadow-xs">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Title & Category Footer */}
              <div className="flex items-center justify-between pt-3 px-0.5">
                <span className="font-medium text-zinc-900 text-sm sm:text-[15px] group-hover:underline underline-offset-4">
                  {project.name}
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  {project.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. WHAT WE DO SECTION                                       */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 border-t border-zinc-100 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Kicker Column */}
          <div className="lg:col-span-3">
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-500 uppercase">
              {isEn ? 'WHAT WE DO' : 'DỊCH VỤ CỦA CHÚNG TÔI'}
            </span>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-9">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-normal leading-[1.2] mb-12 sm:mb-16 max-w-3xl">
              {isEn
                ? 'Comprehensive solutions tailored to enhance visibility, engagement, and success.'
                : 'Giải pháp toàn diện được may đo để nâng cao độ nhận diện, tương tác và thành công.'}
            </h2>

            {/* 4 Cards Grid (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {servicesList.map((svc) => (
                <div
                  key={svc.num}
                  className="bg-[#F8F9FA] rounded-xl p-8 sm:p-10 flex flex-col justify-between hover:bg-zinc-100/90 transition-colors border border-zinc-100"
                >
                  <div>
                    {/* Badge Number */}
                    <div className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded inline-block mb-6">
                      {svc.num}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal mb-3">
                      {svc.title}
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                      {svc.desc}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div>
                    <button
                      onClick={() => onNavigate('services')}
                      className="text-[11px] font-bold tracking-widest text-zinc-900 uppercase underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center"
                    >
                      {svc.link}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. LOGO RIBBON (Dark strip with 5 Logoipsum variations)      */}
      {/* ============================================================ */}
      <section className="bg-black text-white py-8 sm:py-10 px-6 sm:px-12 rounded-xl my-12 sm:my-20 shadow-md max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-8 sm:gap-12 md:gap-16">
          <LogoIpsum variant={1} theme="dark" className="opacity-95 hover:opacity-100 transition-opacity" />
          <LogoIpsum variant={2} theme="dark" className="opacity-95 hover:opacity-100 transition-opacity" />
          <LogoIpsum variant={3} theme="dark" className="opacity-95 hover:opacity-100 transition-opacity" />
          <LogoIpsum variant={4} theme="dark" className="opacity-95 hover:opacity-100 transition-opacity" />
          <LogoIpsum variant={5} theme="dark" className="opacity-95 hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. HOW WE WORK SECTION                                      */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 border-t border-zinc-100 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Kicker Column */}
          <div className="lg:col-span-3">
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-500 uppercase">
              {isEn ? 'HOW WE WORK' : 'CÁCH CHÚNG TÔI LÀM VIỆC'}
            </span>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-9">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-normal leading-[1.2] mb-8 max-w-3xl">
              {isEn
                ? 'Our collaborative approach to crafting digital excellence'
                : 'Cách tiếp cận hợp tác kiến tạo đỉnh cao kỹ thuật số'}
            </h2>

            {/* 2 Paragraph Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 text-zinc-600 text-xs sm:text-[13px] leading-relaxed mb-12 sm:mb-16 font-sans">
              <p>
                {isEn
                  ? 'Dive into our process where every project begins with deep understanding, collaborative ideation, and meticulous execution. From initial brainstorming to final delivery, we prioritize communication, feedback, and innovation to ensure your vision transforms into tangible digital success. With a blend of creativity and technical expertise, we tailor solutions to suit your brand’s distinct identity and objectives.'
                  : 'Khám phá quy trình làm việc nơi mỗi dự án bắt đầu từ sự thấu hiểu sâu sắc, sáng tạo đồng hành và thực thi tỉ mỉ. Từ khâu lên ý tưởng sơ khai đến bàn giao hoàn thiện, chúng tôi đặt sự giao tiếp, phản hồi và đổi mới làm trọng tâm để biến tầm nhìn của bạn thành thành quả số rõ nét. Bằng sự kết hợp giữa sáng tạo và chuyên môn công nghệ, chúng tôi may đo từng giải pháp phù hợp mục tiêu của bạn.'}
              </p>
              <p>
                {isEn
                  ? 'Our commitment to transparency and agility ensures that you’re involved every step of the way, resulting in seamless, impactful outcomes that exceed expectations and propel your brand forward in the digital landscape.'
                  : 'Cam kết về tính minh bạch và sự linh hoạt của chúng tôi đảm bảo bạn luôn đồng hành trong từng bước đi, mang lại kết quả liền mạch, ấn tượng và vượt trên kỳ vọng để thúc đẩy thương hiệu tiến xa trên bức tranh kỹ thuật số.'}
              </p>
            </div>

            {/* Asymmetrical Photo Mosaic matching screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column (Span 6) */}
              <div className="md:col-span-6 flex flex-col gap-6">
                {/* Top Wide Photo */}
                <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 shadow-xs">
                  <img
                    src="/src/assets/images/team_hero_collab_1790135062529.jpg"
                    alt="Collaboration in studio"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom Row (Join Hiroki Card + Portrait Photo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Join Hiroki Box */}
                  <div className="bg-[#F8F9FA] rounded-xl p-6 sm:p-7 flex flex-col justify-between border border-zinc-100">
                    <div>
                      <h4 className="font-serif text-2xl text-zinc-900 font-normal mb-2">
                        {isEn ? 'Join Hiroki!' : 'Gia nhập Hiroki!'}
                      </h4>
                      <p className="text-zinc-600 text-xs leading-relaxed mb-6 font-sans">
                        {isEn
                          ? 'Explore exciting career opportunities with us and take the next step towards building your future in digital innovation.'
                          : 'Khám phá các cơ hội nghề nghiệp đầy hứng khởi cùng chúng tôi và bước tiếp trên hành trình kiến tạo tương lai số.'}
                      </p>
                    </div>

                    <button
                      onClick={onOpenContact}
                      className="bg-black text-white text-[11px] font-semibold tracking-wider uppercase px-4 py-2.5 rounded text-center hover:bg-zinc-800 transition-colors w-full cursor-pointer"
                    >
                      {isEn ? 'AVAILABLE JOBS' : 'VỊ TRÍ TUYỂN DỤNG'}
                    </button>
                  </div>

                  {/* Vertical Portrait Photo */}
                  <div className="w-full aspect-[4/5] sm:aspect-auto overflow-hidden rounded-xl bg-zinc-100 shadow-xs">
                    <img
                      src="/src/assets/images/team_sarah_lee_1790135127741.jpg"
                      alt="Team creative"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column (Span 6) */}
              <div className="md:col-span-6 flex flex-col gap-6">
                {/* Top Desk/Sketching Photo */}
                <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 shadow-xs">
                  <img
                    src="/src/assets/images/creative_man_notebook_1790135085678.jpg"
                    alt="Creative process"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom Discussion Photo */}
                <div className="w-full aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 shadow-xs">
                  <img
                    src="/src/assets/images/blog_coworking_discussion_1790133957592.jpg"
                    alt="Team creative discussion"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BLACK TESTIMONIAL BANNER (Rachel Miller / IP CONSULTING)  */}
      {/* ============================================================ */}
      <section className="bg-black text-white rounded-2xl p-8 sm:p-14 lg:p-16 my-16 sm:my-24 shadow-xl max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Logo & Author */}
          <div className="lg:col-span-4 space-y-6">
            <LogoIpsum variant={1} theme="dark" />

            <div className="flex items-center gap-3.5 pt-2">
              <img
                src="/src/assets/images/team_david_brown_1790135150592.jpg"
                alt="Rachel Miller"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-700"
              />
              <div>
                <div className="font-semibold text-sm text-white">Rachel Miller</div>
                <div className="text-zinc-400 text-[11px] tracking-wider uppercase">
                  IP CONSULTING
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quote Text */}
          <div className="lg:col-span-8">
            <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal leading-snug mb-4">
              {isEn
                ? '“Exemplary service, remarkable results, highly recommended. A top choice for digital solutions.”'
                : '“Dịch vụ mẫu mực, thành quả vượt bậc, rất đáng tin cậy. Lựa chọn hàng đầu cho các giải pháp chuyển đổi số.”'}
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed font-light max-w-2xl font-sans">
              {isEn
                ? "Hiroki's branding expertise transformed our company's identity, resonating with our target audience. Their dedication and creativity exceeded our expectations."
                : 'Chuyên môn xây dựng thương hiệu của Hiroki đã chuyển hóa hoàn toàn nhận diện doanh nghiệp của chúng tôi, tạo tiếng vang mạnh mẽ với khách hàng mục tiêu.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. OUR CLIENTS SECTION                                      */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 border-t border-zinc-100 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Kicker Column */}
          <div className="lg:col-span-3">
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-500 uppercase">
              {isEn ? 'OUR CLIENTS' : 'KHÁCH HÀNG CỦA CHÚNG TÔI'}
            </span>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-9">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-normal leading-[1.2] mb-12 sm:mb-16 max-w-3xl">
              {isEn
                ? 'Hear from our clients about their experience working with us.'
                : 'Lắng nghe chia sẻ từ khách hàng về trải nghiệm đồng hành cùng chúng tôi.'}
            </h2>

            {/* 4 Testimonials Grid (2x2) matching screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {clientReviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-[#F8F9FA] rounded-xl p-8 sm:p-10 flex flex-col justify-between border border-zinc-100 hover:border-zinc-200 transition-colors"
                >
                  <div className="space-y-5">
                    {/* Top Logoipsum Brand Mark */}
                    <div>
                      <LogoIpsum variant={rev.variant} theme="light" />
                    </div>

                    {/* Bold Highlight Quote */}
                    <h3 className="font-sans font-semibold text-zinc-900 text-sm sm:text-base leading-snug">
                      "{rev.quote}"
                    </h3>

                    {/* Full Body Review */}
                    <p className="text-zinc-600 text-xs sm:text-[13px] leading-relaxed font-sans">
                      {rev.body}
                    </p>
                  </div>

                  {/* Client Avatar & Subtitle */}
                  <div className="flex items-center gap-3 pt-6 mt-6 border-t border-zinc-200/60">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-sm text-zinc-900 font-sans">
                        {rev.author}
                      </div>
                      <div className="text-zinc-500 text-[10px] font-medium tracking-widest uppercase">
                        {rev.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
