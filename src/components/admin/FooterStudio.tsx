import React, { useState } from 'react';
import {
  Columns,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Save,
  Check,
  Globe,
  Share2,
  Sliders,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
  Dribbble,
  Mail,
  Send,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import {
  CMSFooterColumn,
  CMSFooterLinkItem,
  CMSFooterSocial,
  CMSFooterCtaButton,
  DEFAULT_FOOTER_SETTINGS,
  CMSSiteSettings,
} from '../../services/cmsService';
import { HirokiLogo } from '../HirokiLogo';

interface FooterStudioProps {
  showNotification: (msg: string) => void;
  onRequestDelete: (type: 'footer_link' | 'footer_column', item: any, name: string) => void;
}

export function FooterStudio({ showNotification, onRequestDelete }: FooterStudioProps) {
  const { siteSettings, saveSiteSettings } = useCMS();
  const footer = siteSettings?.footer || DEFAULT_FOOTER_SETTINGS;

  // Sub-tabs: 'columns' | 'socials' | 'brand' | 'preview'
  const [subTab, setSubTab] = useState<'columns' | 'socials' | 'brand' | 'preview'>('columns');
  const [previewLang, setPreviewLang] = useState<'vi' | 'en'>('vi');

  // Link Modal / Edit State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkColId, setEditingLinkColId] = useState<string>('col-pages');
  const [linkForm, setLinkForm] = useState<{
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

  // Column Modal / Edit State
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<CMSFooterColumn | null>(null);
  const [colForm, setColForm] = useState<{
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

  // Social Modal / Edit State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<CMSFooterSocial | null>(null);
  const [socialForm, setSocialForm] = useState<{
    id: string;
    platform: 'instagram' | 'twitter' | 'behance' | 'pinterest' | 'facebook' | 'linkedin' | 'youtube' | 'tiktok' | 'github' | 'dribbble' | 'gmail' | 'telegram' | 'custom';
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

  // Brand & CTA State
  const [brandForm, setBrandForm] = useState({
    brandSub_vi: footer.brandSub?.vi || '',
    brandSub_en: footer.brandSub?.en || '',
    copyright_vi: footer.copyright?.vi || '',
    copyright_en: footer.copyright?.en || '',
    locations: (footer.locations || ['Tokyo', 'Hanoi', 'New York']).join(', '),
    // CTA Button
    ctaVisible: footer.ctaButton?.isVisible !== false,
    ctaLabel_vi: footer.ctaButton?.label?.vi || 'THÊM GIAO DIỆN KHÁC',
    ctaLabel_en: footer.ctaButton?.label?.en || 'MORE TEMPLATES',
    ctaType: footer.ctaButton?.type || 'utility',
    ctaTarget: footer.ctaButton?.target || 'templates',
    ctaTitle_vi: footer.ctaButton?.utilityContent?.title?.vi || 'Bộ sưu tập Giao diện',
    ctaTitle_en: footer.ctaButton?.utilityContent?.title?.en || 'More Templates',
    ctaDesc_vi: footer.ctaButton?.utilityContent?.desc?.vi || 'Khám phá các giao diện Webflow và React thiết kế bởi Gola Templates.',
    ctaDesc_en: footer.ctaButton?.utilityContent?.desc?.en || 'Discover more high-end editorial Webflow and React templates designed by Gola Templates.',
  });

  // Re-sync brand form when footer updates
  React.useEffect(() => {
    setBrandForm({
      brandSub_vi: footer.brandSub?.vi || '',
      brandSub_en: footer.brandSub?.en || '',
      copyright_vi: footer.copyright?.vi || '',
      copyright_en: footer.copyright?.en || '',
      locations: (footer.locations || ['Tokyo', 'Hanoi', 'New York']).join(', '),
      ctaVisible: footer.ctaButton?.isVisible !== false,
      ctaLabel_vi: footer.ctaButton?.label?.vi || 'THÊM GIAO DIỆN KHÁC',
      ctaLabel_en: footer.ctaButton?.label?.en || 'MORE TEMPLATES',
      ctaType: footer.ctaButton?.type || 'utility',
      ctaTarget: footer.ctaButton?.target || 'templates',
      ctaTitle_vi: footer.ctaButton?.utilityContent?.title?.vi || 'Bộ sưu tập Giao diện',
      ctaTitle_en: footer.ctaButton?.utilityContent?.title?.en || 'More Templates',
      ctaDesc_vi: footer.ctaButton?.utilityContent?.desc?.vi || 'Khám phá các giao diện Webflow và React thiết kế bởi Gola Templates.',
      ctaDesc_en: footer.ctaButton?.utilityContent?.desc?.en || 'Discover more high-end editorial Webflow and React templates designed by Gola Templates.',
    });
  }, [siteSettings]);

  // --------------------------------------------------------------------------
  // ACTIONS: LINK
  // --------------------------------------------------------------------------
  const openCreateLinkModal = (columnId?: string) => {
    const colId = columnId || footer.columns[0]?.id || 'col-pages';
    setEditingLinkColId(colId);
    setLinkForm({
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
    setIsLinkModalOpen(true);
  };

  const openEditLinkModal = (columnId: string, link: CMSFooterLinkItem) => {
    setEditingLinkColId(columnId);
    setLinkForm({
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
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.label_vi.trim() && !linkForm.label_en.trim()) {
      alert('Vui lòng nhập tên hiển thị cho liên kết (Tiếng Việt hoặc English).');
      return;
    }

    const linkId = linkForm.id || `lnk-${Date.now()}`;
    const newLink: CMSFooterLinkItem = {
      id: linkId,
      label: {
        vi: linkForm.label_vi.trim() || linkForm.label_en.trim(),
        en: linkForm.label_en.trim() || linkForm.label_vi.trim(),
      },
      type: linkForm.type,
      target: linkForm.target.trim(),
      highlight: linkForm.highlight,
      isVisible: linkForm.isVisible,
      utilityContent:
        linkForm.type === 'utility'
          ? {
              title: {
                vi: linkForm.utilityTitle_vi.trim() || linkForm.label_vi.trim(),
                en: linkForm.utilityTitle_en.trim() || linkForm.label_en.trim(),
              },
              desc: {
                vi: linkForm.utilityDesc_vi.trim(),
                en: linkForm.utilityDesc_en.trim(),
              },
            }
          : undefined,
    };

    const targetColId = linkForm.columnId;
    const oldColId = editingLinkColId;

    const updatedCols = (footer.columns || DEFAULT_FOOTER_SETTINGS.columns).map((col) => {
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
      ...siteSettings,
      footer: {
        ...footer,
        columns: updatedCols,
      },
    };

    await saveSiteSettings(updatedSettings);
    setIsLinkModalOpen(false);
    showNotification(`Đã lưu liên kết "${newLink.label.vi || newLink.label.en}" thành công!`);
  };

  const handleToggleLinkVisibility = async (columnId: string, linkId: string) => {
    const updatedCols = (footer.columns || []).map((col) => {
      if (col.id !== columnId) return col;
      return {
        ...col,
        links: col.links.map((l) =>
          l.id === linkId ? { ...l, isVisible: l.isVisible === false ? true : false } : l
        ),
      };
    });

    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        columns: updatedCols,
      },
    };

    await saveSiteSettings(updatedSettings);
    showNotification('Đã cập nhật trạng thái hiển thị của liên kết.');
  };

  const handleMoveLink = async (columnId: string, linkIndex: number, direction: 'up' | 'down') => {
    const col = (footer.columns || []).find((c) => c.id === columnId);
    if (!col) return;
    const newIdx = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    if (newIdx < 0 || newIdx >= col.links.length) return;

    const newLinks = [...col.links];
    const [moved] = newLinks.splice(linkIndex, 1);
    newLinks.splice(newIdx, 0, moved);

    const updatedCols = (footer.columns || []).map((c) =>
      c.id === columnId ? { ...c, links: newLinks } : c
    );

    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        columns: updatedCols,
      },
    };

    await saveSiteSettings(updatedSettings);
  };

  // --------------------------------------------------------------------------
  // ACTIONS: COLUMN
  // --------------------------------------------------------------------------
  const openCreateColModal = () => {
    setEditingColumn(null);
    setColForm({
      id: `col-${Date.now()}`,
      title_vi: '',
      title_en: '',
      isVisible: true,
    });
    setIsColModalOpen(true);
  };

  const openEditColModal = (col: CMSFooterColumn) => {
    setEditingColumn(col);
    setColForm({
      id: col.id,
      title_vi: col.title?.vi || '',
      title_en: col.title?.en || '',
      isVisible: col.isVisible !== false,
    });
    setIsColModalOpen(true);
  };

  const handleSaveCol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colForm.title_vi.trim() && !colForm.title_en.trim()) {
      alert('Vui lòng nhập tiêu đề cột.');
      return;
    }

    const colId = colForm.id || `col-${Date.now()}`;
    const newCol: CMSFooterColumn = {
      id: colId,
      title: {
        vi: colForm.title_vi.trim() || colForm.title_en.trim(),
        en: colForm.title_en.trim() || colForm.title_vi.trim(),
      },
      isVisible: colForm.isVisible,
      links: editingColumn ? editingColumn.links : [],
    };

    const existingIdx = (footer.columns || []).findIndex((c) => c.id === colId);
    let updatedCols = [...(footer.columns || [])];
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
      ...siteSettings,
      footer: {
        ...footer,
        columns: updatedCols,
      },
    };

    await saveSiteSettings(updatedSettings);
    setIsColModalOpen(false);
    showNotification(`Đã lưu cột "${newCol.title.vi}" thành công!`);
  };

  const handleToggleColVisibility = async (colId: string) => {
    const updatedCols = (footer.columns || []).map((col) =>
      col.id === colId ? { ...col, isVisible: col.isVisible === false ? true : false } : col
    );

    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        columns: updatedCols,
      },
    };

    await saveSiteSettings(updatedSettings);
    showNotification('Đã cập nhật trạng thái hiển thị của cột.');
  };

  // --------------------------------------------------------------------------
  // ACTIONS: SOCIALS
  // --------------------------------------------------------------------------
  const openCreateSocialModal = () => {
    setEditingSocial(null);
    setSocialForm({
      id: `soc-${Date.now()}`,
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com',
      isVisible: true,
    });
    setIsSocialModalOpen(true);
  };

  const openEditSocialModal = (soc: CMSFooterSocial) => {
    setEditingSocial(soc);
    setSocialForm({
      id: soc.id,
      platform: soc.platform || 'custom',
      label: soc.label || '',
      url: soc.url || '',
      isVisible: soc.isVisible !== false,
    });
    setIsSocialModalOpen(true);
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const socId = socialForm.id || `soc-${Date.now()}`;
    const newSocial: CMSFooterSocial = {
      id: socId,
      platform: socialForm.platform,
      label: socialForm.label.trim() || socialForm.platform,
      url: socialForm.url.trim(),
      isVisible: socialForm.isVisible,
    };

    const existingIdx = (footer.socials || []).findIndex((s) => s.id === socId);
    let updatedSocials = [...(footer.socials || [])];
    if (existingIdx >= 0) {
      updatedSocials[existingIdx] = newSocial;
    } else {
      updatedSocials.push(newSocial);
    }

    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        socials: updatedSocials,
      },
    };

    await saveSiteSettings(updatedSettings);
    setIsSocialModalOpen(false);
    showNotification(`Đã lưu kênh "${newSocial.label}"!`);
  };

  const handleDeleteSocial = async (socId: string, label: string) => {
    if (!confirm(`Bạn có chắc muốn xóa kênh mạng xã hội "${label}"?`)) return;
    const updatedSocials = (footer.socials || []).filter((s) => s.id !== socId);
    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        socials: updatedSocials,
      },
    };
    await saveSiteSettings(updatedSettings);
    showNotification(`Đã xóa kênh "${label}".`);
  };

  const handleToggleSocialVisibility = async (socId: string) => {
    const updatedSocials = (footer.socials || []).map((s) =>
      s.id === socId ? { ...s, isVisible: s.isVisible === false ? true : false } : s
    );
    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: {
        ...footer,
        socials: updatedSocials,
      },
    };
    await saveSiteSettings(updatedSettings);
    showNotification('Đã cập nhật trạng thái hiển thị kênh mạng xã hội.');
  };

  // --------------------------------------------------------------------------
  // ACTIONS: BRAND & CTA
  // --------------------------------------------------------------------------
  const handleSaveBrandAndCTA = async (e: React.FormEvent) => {
    e.preventDefault();
    const locs = brandForm.locations
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const updatedFooter = {
      ...footer,
      brandSub: {
        vi: brandForm.brandSub_vi.trim(),
        en: brandForm.brandSub_en.trim(),
      },
      copyright: {
        vi: brandForm.copyright_vi.trim(),
        en: brandForm.copyright_en.trim(),
      },
      locations: locs.length > 0 ? locs : ['Tokyo', 'Hanoi', 'New York'],
      ctaButton: {
        isVisible: brandForm.ctaVisible,
        label: {
          vi: brandForm.ctaLabel_vi.trim(),
          en: brandForm.ctaLabel_en.trim(),
        },
        type: brandForm.ctaType as any,
        target: brandForm.ctaTarget.trim(),
        utilityContent: {
          title: {
            vi: brandForm.ctaTitle_vi.trim(),
            en: brandForm.ctaTitle_en.trim(),
          },
          desc: {
            vi: brandForm.ctaDesc_vi.trim(),
            en: brandForm.ctaDesc_en.trim(),
          },
        },
      },
    };

    const updatedSettings: CMSSiteSettings = {
      ...siteSettings,
      footer: updatedFooter,
    };

    await saveSiteSettings(updatedSettings);
    showNotification('Đã lưu thông tin Thương hiệu, CTA & Bản quyền chân trang!');
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (
      confirm(
        'Bạn có chắc muốn khôi phục Chân trang về cài đặt mặc định ban đầu? Các liên kết bạn tự tạo sẽ được đặt lại.'
      )
    ) {
      const updatedSettings: CMSSiteSettings = {
        ...siteSettings,
        footer: DEFAULT_FOOTER_SETTINGS,
      };
      await saveSiteSettings(updatedSettings);
      showNotification('Đã khôi phục Chân trang về cấu hình mặc định!');
    }
  };

  const renderSocialIcon = (platform: string) => {
    const p = (platform || '').toLowerCase();
    switch (p) {
      case 'instagram':
        return <Instagram size={15} />;
      case 'twitter':
        return <Twitter size={15} />;
      case 'behance':
        return <span className="font-bold text-xs">Bē</span>;
      case 'pinterest':
        return <span className="font-serif font-bold text-sm">P</span>;
      case 'facebook':
        return <Facebook size={15} />;
      case 'linkedin':
        return <Linkedin size={15} />;
      case 'youtube':
        return <Youtube size={15} />;
      case 'github':
        return <Github size={15} />;
      case 'dribbble':
        return <Dribbble size={15} />;
      case 'gmail':
      case 'email':
      case 'mail':
        return <Mail size={15} />;
      case 'telegram':
        return <Send size={15} />;
      default:
        return <Globe size={15} />;
    }
  };

  const totalLinksCount = (footer.columns || []).reduce(
    (acc, col) => acc + (col.links?.length || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              CMS Layout Studio
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300" />
            <span className="text-xs font-mono text-zinc-500">{totalLinksCount} Liên kết</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 flex items-center gap-2.5">
            <Columns className="text-zinc-900" size={24} />
            <span>Quản lý Chân Trang (Footer Studio)</span>
          </h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Tự do thêm/sửa/xóa liên kết điều hướng, cấu hình cột, quản lý mạng xã hội, nút CTA và bản quyền chân trang website.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Khôi phục về cấu hình mẫu mặc định"
          >
            <RotateCcw size={14} />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateLinkModal()}
            className="bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Thêm Liên Kết Mới</span>
          </button>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2">
        {[
          {
            id: 'columns',
            label: '1. Cột & Liên kết Footer',
            badge: `${footer.columns?.length || 0} cột / ${totalLinksCount} link`,
            icon: Layers,
          },
          {
            id: 'socials',
            label: '2. Mạng xã hội (Socials)',
            badge: `${footer.socials?.length || 0} kênh`,
            icon: Share2,
          },
          {
            id: 'brand',
            label: '3. Thương hiệu, CTA & Bản quyền',
            badge: 'Cài đặt',
            icon: Sliders,
          },
          {
            id: 'preview',
            label: '4. Xem trước Chân trang (Live Preview)',
            badge: 'Trực tiếp',
            icon: Eye,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* SUBTAB 1: COLUMNS & LINKS                                        */}
      {/* ================================================================ */}
      {subTab === 'columns' && (
        <div className="space-y-8">
          {/* Action Bar for Columns */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/80 p-3.5 rounded-xl">
            <div className="text-xs text-zinc-600">
              <span className="font-bold text-zinc-900">Mẹo quản lý:</span> Bạn có thể đổi vị trí liên kết bằng mũi tên lên/xuống, bật/tắt mắt để ẩn hiện tức thì, hoặc phân loại link vào các cột nội dung.
            </div>
            <button
              type="button"
              onClick={openCreateColModal}
              className="px-3.5 py-1.5 bg-white border border-zinc-300 hover:border-black text-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>Thêm Cột Chân Trang Mới</span>
            </button>
          </div>

          {/* List Columns & Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(footer.columns || DEFAULT_FOOTER_SETTINGS.columns).map((column, colIdx) => (
              <div
                key={column.id || `col-${colIdx}`}
                className={`bg-white border rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col transition-all ${
                  column.isVisible === false
                    ? 'border-zinc-200/60 opacity-60 bg-zinc-50/40'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-500 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      {colIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider truncate">
                        {column.title?.vi || column.title?.en || 'Cột không tên'}
                      </h3>
                      {column.title?.en && column.title?.vi && (
                        <p className="text-[10px] text-zinc-400 truncate uppercase">
                          EN: {column.title.en}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleColVisibility(column.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      title={column.isVisible === false ? 'Bật hiển thị cột này' : 'Tạm ẩn cột này'}
                    >
                      {column.isVisible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditColModal(column)}
                      className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa tên cột"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete('footer_column', column, column.title?.vi || column.title?.en || 'Cột')}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa cột này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Column Links List */}
                <div className="space-y-2 flex-1 min-h-[140px]">
                  {column.links && column.links.length > 0 ? (
                    column.links.map((link, linkIdx) => {
                      const linkTypeBadge = {
                        tab: { label: 'Tab', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        utility: { label: 'Popup', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                        external: { label: 'Web Ngoài', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
                        admin: { label: 'CMS', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      }[link.type || 'tab'];

                      const isHidden = link.isVisible === false;

                      return (
                        <div
                          key={link.id || linkIdx}
                          className={`group p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            isHidden
                              ? 'bg-zinc-50 border-zinc-200/60 opacity-60'
                              : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-zinc-900 truncate">
                                {link.label?.vi || link.label?.en || 'Chưa đặt tên'}
                              </span>
                              {link.highlight && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Đánh dấu nổi bật" />
                              )}
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${linkTypeBadge.color}`}
                              >
                                {linkTypeBadge.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-400 truncate">
                              {link.label?.en ? `EN: ${link.label.en} • ` : ''}
                              {link.type === 'tab'
                                ? `Mục: ${link.target}`
                                : link.type === 'utility'
                                ? `Tiện ích: ${link.utilityContent?.title?.vi || link.target}`
                                : link.type === 'external'
                                ? link.target
                                : 'Mở CMS Studio'}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={linkIdx === 0}
                              onClick={() => handleMoveLink(column.id, linkIdx, 'up')}
                              className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent rounded cursor-pointer"
                              title="Di chuyển lên"
                            >
                              <ArrowUp size={12} />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={linkIdx === column.links.length - 1}
                              onClick={() => handleMoveLink(column.id, linkIdx, 'down')}
                              className="p-1 text-zinc-400 hover:text-black hover:bg-zinc-100 disabled:opacity-20 disabled:hover:bg-transparent rounded cursor-pointer"
                              title="Di chuyển xuống"
                            >
                              <ArrowDown size={12} />
                            </button>

                            {/* Toggle visibility */}
                            <button
                              type="button"
                              onClick={() => handleToggleLinkVisibility(column.id, link.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                isHidden
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
                              }`}
                              title={isHidden ? 'Bật hiển thị link' : 'Tạm ẩn link'}
                            >
                              {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>

                            {/* Edit link */}
                            <button
                              type="button"
                              onClick={() => openEditLinkModal(column.id, link)}
                              className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded cursor-pointer"
                              title="Chỉnh sửa liên kết"
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Delete link */}
                            <button
                              type="button"
                              onClick={() =>
                                onRequestDelete('footer_link', { columnId: column.id, link }, link.label?.vi || link.label?.en || 'Liên kết')
                              }
                              className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Xóa liên kết (Chuyển vào thùng rác 30 ngày)"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 text-zinc-400 space-y-2">
                      <p className="text-xs">Chưa có liên kết nào trong cột này.</p>
                      <button
                        type="button"
                        onClick={() => openCreateLinkModal(column.id)}
                        className="text-xs font-semibold text-black hover:underline cursor-pointer"
                      >
                        + Thêm link đầu tiên
                      </button>
                    </div>
                  )}
                </div>

                {/* Add link button to this column */}
                <button
                  type="button"
                  onClick={() => openCreateLinkModal(column.id)}
                  className="w-full py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Thêm link vào cột này</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SUBTAB 2: SOCIAL MEDIA CHANNELS                                  */}
      {/* ================================================================ */}
      {subTab === 'socials' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl">
            <div>
              <h3 className="font-bold text-sm text-zinc-900">
                Các kênh Mạng Xã Hội (Social Profiles)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Hiển thị icon mạng xã hội ở phần giới thiệu chân trang bên cạnh logo Hiroki Tanaka.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateSocialModal}
              className="bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm Mạng Xã Hội Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(footer.socials || DEFAULT_FOOTER_SETTINGS.socials).map((soc) => {
              const isHidden = soc.isVisible === false;

              return (
                <div
                  key={soc.id}
                  className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-3 transition-all ${
                    isHidden
                      ? 'border-zinc-200/60 opacity-60 bg-zinc-50/50'
                      : 'border-zinc-200 hover:border-zinc-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                      {renderSocialIcon(soc.platform)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                          {soc.label || soc.platform}
                        </h4>
                        {isHidden && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-500">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <a
                        href={soc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 truncate block font-mono"
                      >
                        {soc.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSocialVisibility(soc.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      title={isHidden ? 'Bật hiển thị kênh này' : 'Tạm ẩn kênh này'}
                    >
                      {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditSocialModal(soc)}
                      className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa URL / Tên kênh"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSocial(soc.id, soc.label || soc.platform)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa kênh này"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SUBTAB 3: BRAND, CTA BUTTON & COPYRIGHT                         */}
      {/* ================================================================ */}
      {subTab === 'brand' && (
        <form onSubmit={handleSaveBrandAndCTA} className="space-y-6">
          {/* Section: Brand Subtext */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <HirokiLogo size={20} />
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                Lời giới thiệu dưới Logo (Brand Description)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Giới thiệu ngắn (Tiếng Việt)
                </label>
                <textarea
                  rows={3}
                  value={brandForm.brandSub_vi}
                  onChange={(e) => setBrandForm({ ...brandForm, brandSub_vi: e.target.value })}
                  placeholder="Tạp chí & Không gian Sáng tạo Độc bản..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Giới thiệu ngắn (English)
                </label>
                <textarea
                  rows={3}
                  value={brandForm.brandSub_en}
                  onChange={(e) => setBrandForm({ ...brandForm, brandSub_en: e.target.value })}
                  placeholder="An Editorial & Bespoke Creative Journal..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Section: CTA Button */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-zinc-700" />
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                  Nút Kêu Gọi Hành Động (CTA Button trong Cột 1)
                </h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
                <input
                  type="checkbox"
                  checked={brandForm.ctaVisible}
                  onChange={(e) => setBrandForm({ ...brandForm, ctaVisible: e.target.checked })}
                  className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                />
                <span>Bật hiển thị nút CTA</span>
              </label>
            </div>

            {brandForm.ctaVisible && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Chữ hiển thị trên Nút (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={brandForm.ctaLabel_vi}
                      onChange={(e) => setBrandForm({ ...brandForm, ctaLabel_vi: e.target.value })}
                      placeholder="THÊM GIAO DIỆN KHÁC"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Chữ hiển thị trên Nút (English)
                    </label>
                    <input
                      type="text"
                      value={brandForm.ctaLabel_en}
                      onChange={(e) => setBrandForm({ ...brandForm, ctaLabel_en: e.target.value })}
                      placeholder="MORE TEMPLATES"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Hành động khi bấm vào Nút
                    </label>
                    <select
                      value={brandForm.ctaType}
                      onChange={(e) => setBrandForm({ ...brandForm, ctaType: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                    >
                      <option value="utility">Mở Cửa Sổ Popup Tiện Ích (Modal)</option>
                      <option value="tab">Chuyển đến Tab Trong Trang</option>
                      <option value="external">Mở Liên Kết Ngoài (URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      {brandForm.ctaType === 'tab'
                        ? 'Chọn Tab Đích'
                        : brandForm.ctaType === 'external'
                        ? 'Đường Dẫn URL'
                        : 'Mã Định Danh Tiện Ích'}
                    </label>
                    {brandForm.ctaType === 'tab' ? (
                      <select
                        value={brandForm.ctaTarget}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaTarget: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                      >
                        <option value="home">Trang chủ (Home)</option>
                        <option value="work">Dự án (Work)</option>
                        <option value="services">Dịch vụ (Services)</option>
                        <option value="blog">Bài viết (Journal)</option>
                        <option value="connect">Kết nối (Connect)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={brandForm.ctaTarget}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaTarget: e.target.value })}
                        placeholder={brandForm.ctaType === 'external' ? 'https://...' : 'templates'}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-black font-mono"
                      />
                    )}
                  </div>
                </div>

                {brandForm.ctaType === 'utility' && (
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-zinc-600 block uppercase tracking-wider">
                      Nội dung popup hiển thị khi bấm nút:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={brandForm.ctaTitle_vi}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaTitle_vi: e.target.value })}
                        placeholder="Tiêu đề popup (VI)"
                        className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={brandForm.ctaTitle_en}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaTitle_en: e.target.value })}
                        placeholder="Popup Title (EN)"
                        className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={brandForm.ctaDesc_vi}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaDesc_vi: e.target.value })}
                        placeholder="Mô tả popup (VI)..."
                        className="bg-white border border-zinc-200 rounded-lg p-2.5 text-xs"
                      />
                      <textarea
                        rows={2}
                        value={brandForm.ctaDesc_en}
                        onChange={(e) => setBrandForm({ ...brandForm, ctaDesc_en: e.target.value })}
                        placeholder="Popup description (EN)..."
                        className="bg-white border border-zinc-200 rounded-lg p-2.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Copyright & Locations */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Globe size={16} className="text-zinc-700" />
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
                Bản Quyền & Danh Sách Thành Phố (Bottom Bar)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Dòng Bản Quyền (Tiếng Việt)
                </label>
                <input
                  type="text"
                  value={brandForm.copyright_vi}
                  onChange={(e) => setBrandForm({ ...brandForm, copyright_vi: e.target.value })}
                  placeholder="© 2026 Hiroki Tanaka. Bảo lưu mọi quyền."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Dòng Bản Quyền (English)
                </label>
                <input
                  type="text"
                  value={brandForm.copyright_en}
                  onChange={(e) => setBrandForm({ ...brandForm, copyright_en: e.target.value })}
                  placeholder="© 2026 Hiroki Tanaka. All Rights Reserved."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Các thành phố hiển thị ở góc phải (Phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={brandForm.locations}
                onChange={(e) => setBrandForm({ ...brandForm, locations: e.target.value })}
                placeholder="Tokyo, Hanoi, New York"
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-black font-mono text-[11px]"
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                VD: Tokyo, Hanoi, New York, Paris, London
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>Lưu Thông Tin Thương Hiệu & CTA</span>
            </button>
          </div>
        </form>
      )}

      {/* ================================================================ */}
      {/* SUBTAB 4: LIVE PREVIEW FOOTER                                    */}
      {/* ================================================================ */}
      {subTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-900 text-white p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Mô phỏng hiển thị Chân trang thực tế
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-800 p-1 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => setPreviewLang('vi')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  previewLang === 'vi' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tiếng Việt (VI)
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  previewLang === 'en' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          {/* Rendered Footer Live Box */}
          <div className="bg-zinc-100 p-4 sm:p-8 rounded-2xl border border-zinc-200">
            <div className="bg-black text-white rounded-3xl p-8 sm:p-14 lg:p-16 border border-zinc-800/80 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
                {/* Brand */}
                <div className="lg:col-span-2 space-y-6">
                  <HirokiLogo className="text-white" size={36} />
                  <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-sm leading-relaxed">
                    {footer.brandSub?.[previewLang] ||
                      (previewLang === 'en'
                        ? 'An Editorial & Bespoke Creative Journal. Crafted for discerning agencies, studios, and independent creative directors.'
                        : 'Tạp chí & Không gian Sáng tạo Độc bản. Kiến tạo cho các agency, studio và giám đốc sáng tạo độc lập.')}
                  </p>

                  {/* Socials */}
                  <div className="flex items-center flex-wrap gap-2.5 pt-2">
                    {(footer.socials || DEFAULT_FOOTER_SETTINGS.socials)
                      .filter((s) => s.isVisible !== false)
                      .map((social) => (
                        <div
                          key={social.id}
                          className="w-9 h-9 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
                          title={social.label}
                        >
                          {renderSocialIcon(social.platform)}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Columns */}
                {(footer.columns || DEFAULT_FOOTER_SETTINGS.columns)
                  .filter((c) => c.isVisible !== false)
                  .map((column, colIdx) => (
                    <div key={column.id || colIdx} className="space-y-4">
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {column.title?.[previewLang] || column.title?.vi || column.title?.en}
                      </h4>

                      <ul className="space-y-3 text-xs tracking-wider uppercase font-medium text-zinc-300">
                        {(column.links || [])
                          .filter((l) => l.isVisible !== false)
                          .map((link) => (
                            <li
                              key={link.id}
                              className={
                                link.type === 'admin' || link.highlight
                                  ? 'text-emerald-400 font-bold flex items-center gap-1.5'
                                  : 'text-zinc-300 hover:text-white'
                              }
                            >
                              {link.highlight && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                              )}
                              <span>{link.label?.[previewLang] || link.label?.vi || link.label?.en}</span>
                            </li>
                          ))}
                      </ul>

                      {colIdx === 0 && footer.ctaButton?.isVisible !== false && (
                        <div className="pt-2">
                          <button
                            type="button"
                            className="bg-white text-black px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                          >
                            {footer.ctaButton?.label?.[previewLang] ||
                              footer.ctaButton?.label?.vi ||
                              footer.ctaButton?.label?.en ||
                              'MORE TEMPLATES'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Bottom hairline */}
              <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                <p>{footer.copyright?.[previewLang] || footer.copyright?.vi || '© 2026 Hiroki Tanaka.'}</p>
                <div className="flex items-center gap-4 text-zinc-400 text-[11px] uppercase tracking-wider">
                  {(footer.locations && footer.locations.length > 0
                    ? footer.locations
                    : ['Tokyo', 'Hanoi', 'New York']
                  ).map((city, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span>{city}</span>
                      {idx < arr.length - 1 && <span>·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADD / EDIT FOOTER LINK                                    */}
      {/* ================================================================ */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <Columns size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 font-serif">
                    {linkForm.id.startsWith('lnk-') && !editingLinkColId
                      ? 'Thêm Liên Kết Chân Trang Mới'
                      : 'Chỉnh Sửa Liên Kết Chân Trang'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Cấu hình nhãn song ngữ, loại hành động và vị trí cột
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* Target Column Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Chọn Cột Chứa Liên Kết:
                </label>
                <select
                  value={linkForm.columnId}
                  onChange={(e) => setLinkForm({ ...linkForm, columnId: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                >
                  {(footer.columns || []).map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title?.vi || col.title?.en || col.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multilingual Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Tên hiển thị (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkForm.label_vi}
                    onChange={(e) => setLinkForm({ ...linkForm, label_vi: e.target.value })}
                    placeholder="VD: Dự án tiêu biểu"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Tên hiển thị (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkForm.label_en}
                    onChange={(e) => setLinkForm({ ...linkForm, label_en: e.target.value })}
                    placeholder="e.g. Featured Projects"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Link Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Loại hành động khi bấm vào link:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'tab', label: 'Tab nội bộ', desc: 'Chuyển tab' },
                    { id: 'utility', label: 'Trang tiện ích', desc: 'Mở popup' },
                    { id: 'external', label: 'Link URL', desc: 'Mở web ngoài' },
                    { id: 'admin', label: 'CMS Studio', desc: 'Mở CMS' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLinkForm({ ...linkForm, type: t.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        linkForm.type === t.id
                          ? 'border-black bg-zinc-900 text-white shadow-2xs'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] opacity-70">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination settings based on type */}
              {linkForm.type === 'tab' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Chọn Tab Trang Web Đích Đến:
                  </label>
                  <select
                    value={linkForm.target}
                    onChange={(e) => setLinkForm({ ...linkForm, target: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                  >
                    <option value="home">Trang chủ (Home)</option>
                    <option value="work">Dự án (Work / Portfolio)</option>
                    <option value="services">Dịch vụ (Services)</option>
                    <option value="blog">Tạp chí / Bài viết (Journal)</option>
                    <option value="connect">Liên hệ & Kết nối (Connect / Contact)</option>
                  </select>
                </div>
              )}

              {linkForm.type === 'external' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Đường dẫn Website ngoài (URL đầy đủ):
                  </label>
                  <input
                    type="url"
                    required
                    value={linkForm.target}
                    onChange={(e) => setLinkForm({ ...linkForm, target: e.target.value })}
                    placeholder="https://example.com/..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-black"
                  />
                </div>
              )}

              {linkForm.type === 'utility' && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                  <span className="text-xs font-bold text-zinc-800 block">
                    Cấu hình nội dung Popup Tiện Ích:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Tiêu đề Modal (VI)
                      </label>
                      <input
                        type="text"
                        value={linkForm.utilityTitle_vi}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, utilityTitle_vi: e.target.value })
                        }
                        placeholder="VD: Hướng dẫn Phong cách (Styleguide)"
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Modal Title (EN)
                      </label>
                      <input
                        type="text"
                        value={linkForm.utilityTitle_en}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, utilityTitle_en: e.target.value })
                        }
                        placeholder="e.g. Design Styleguide"
                        className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Nội dung chi tiết (VI)
                      </label>
                      <textarea
                        rows={2}
                        value={linkForm.utilityDesc_vi}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, utilityDesc_vi: e.target.value })
                        }
                        placeholder="Chi tiết bảng màu, typography và components..."
                        className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 mb-1">
                        Details in English
                      </label>
                      <textarea
                        rows={2}
                        value={linkForm.utilityDesc_en}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, utilityDesc_en: e.target.value })
                        }
                        placeholder="Color tokens, typography scale and components..."
                        className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2 border-t border-zinc-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkForm.isVisible}
                    onChange={(e) => setLinkForm({ ...linkForm, isVisible: e.target.checked })}
                    className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span>Bật hiển thị trên website</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkForm.highlight}
                    onChange={(e) => setLinkForm({ ...linkForm, highlight: e.target.checked })}
                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Đánh dấu nổi bật (Highlight)</span>
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Lưu Liên Kết</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADD / EDIT FOOTER COLUMN                                  */}
      {/* ================================================================ */}
      {isColModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900 font-serif">
                {editingColumn ? 'Chỉnh Sửa Cột Chân Trang' : 'Thêm Cột Chân Trang Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsColModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCol} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Tiêu đề cột (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={colForm.title_vi}
                  onChange={(e) => setColForm({ ...colForm, title_vi: e.target.value })}
                  placeholder="VD: TRANG NỘI DUNG"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Tiêu đề cột (English) *
                </label>
                <input
                  type="text"
                  required
                  value={colForm.title_en}
                  onChange={(e) => setColForm({ ...colForm, title_en: e.target.value })}
                  placeholder="e.g. PAGES"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={colForm.isVisible}
                  onChange={(e) => setColForm({ ...colForm, isVisible: e.target.checked })}
                  className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                />
                <span>Bật hiển thị cột này trên footer</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsColModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Lưu Cột
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADD / EDIT SOCIAL CHANNEL                                 */}
      {/* ================================================================ */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900 font-serif">
                {editingSocial ? 'Chỉnh Sửa Mạng Xã Hội' : 'Thêm Kênh Mạng Xã Hội'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-800 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSocial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Chọn Nền Tảng (Platform Icon):
                </label>
                <select
                  value={socialForm.platform}
                  onChange={(e) =>
                    setSocialForm({
                      ...socialForm,
                      platform: e.target.value as any,
                      label:
                        socialForm.label === socialForm.platform
                          ? e.target.value
                          : socialForm.label,
                    })
                  }
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black cursor-pointer"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="behance">Behance</option>
                  <option value="linkedin">LinkedIn (linkedin.com)</option>
                  <option value="gmail">Gmail / Email</option>
                  <option value="telegram">Telegram (t.me)</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="github">GitHub</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="custom">Khác (Custom URL)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Tên hiển thị (Label / Tooltip):
                </label>
                <input
                  type="text"
                  required
                  value={socialForm.label}
                  onChange={(e) => setSocialForm({ ...socialForm, label: e.target.value })}
                  placeholder="VD: Instagram"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Đường dẫn Profile (URL):
                </label>
                <input
                  type="url"
                  required
                  value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-black"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={socialForm.isVisible}
                  onChange={(e) => setSocialForm({ ...socialForm, isVisible: e.target.checked })}
                  className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                />
                <span>Bật hiển thị kênh này trên footer</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Lưu Mạng Xã Hội
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
