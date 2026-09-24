import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CMSService,
  CMSPost,
  CMSProject,
  CMSServiceItem,
  CMSCategory,
  CMSEditorialTag,
  CMSSiteSettings,
  CMSTrashItem,
  TrashItemType,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_CATEGORIES,
  DEFAULT_EDITORIAL_TAGS,
} from '../services/cmsService';
import { ARTICLES, WORK_PROJECTS, SERVICES } from '../data/content';

interface CMSContextType {
  posts: CMSPost[];
  publishedPosts: CMSPost[];
  projects: CMSProject[];
  publishedProjects: CMSProject[];
  services: CMSServiceItem[];
  publishedServices: CMSServiceItem[];
  categories: CMSCategory[];
  editorialTags: CMSEditorialTag[];
  siteSettings: CMSSiteSettings;
  trashItems: CMSTrashItem[];
  isLoading: boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  savePost: (post: CMSPost) => Promise<CMSPost>;
  deletePost: (id: string) => Promise<void>;
  setPostStatus: (id: string, status: 'draft' | 'published') => Promise<void>;
  saveProject: (project: CMSProject) => Promise<CMSProject>;
  deleteProject: (id: string) => Promise<void>;
  setProjectStatus: (id: string, status: 'draft' | 'published') => Promise<void>;
  saveService: (service: CMSServiceItem) => Promise<CMSServiceItem>;
  deleteService: (id: string) => Promise<void>;
  setServiceStatus: (id: string, status: 'draft' | 'published') => Promise<void>;
  saveCategory: (category: CMSCategory) => Promise<CMSCategory>;
  deleteCategory: (id: string) => Promise<void>;
  saveEditorialTag: (tag: CMSEditorialTag) => Promise<CMSEditorialTag>;
  deleteEditorialTag: (id: string) => Promise<void>;
  saveSiteSettings: (settings: CMSSiteSettings) => Promise<void>;
  moveToTrash: (type: TrashItemType, item: any, name?: string) => Promise<CMSTrashItem>;
  restoreFromTrash: (trashId: string) => Promise<void>;
  deletePermanently: (trashId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  refreshTrash: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  reloadAll: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<CMSPost[]>(() =>
    ARTICLES.map((a) => ({ ...a, status: 'published' }))
  );
  const [projects, setProjects] = useState<CMSProject[]>(() =>
    WORK_PROJECTS.map((p) => ({ ...p, status: 'published' }))
  );
  const [services, setServices] = useState<CMSServiceItem[]>(() =>
    SERVICES.map((s, idx) => ({ ...s, status: 'published', order: idx + 1 }))
  );
  const [categories, setCategories] = useState<CMSCategory[]>(DEFAULT_CATEGORIES);
  const [editorialTags, setEditorialTags] = useState<CMSEditorialTag[]>(DEFAULT_EDITORIAL_TAGS);
  const [siteSettings, setSiteSettings] = useState<CMSSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [trashItems, setTrashItems] = useState<CMSTrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        fetchedPosts,
        fetchedProjects,
        fetchedServices,
        fetchedSettings,
        fetchedCategories,
        fetchedTags,
        fetchedTrash,
      ] = await Promise.all([
        CMSService.fetchPosts(),
        CMSService.fetchProjects(),
        CMSService.fetchServices(),
        CMSService.fetchSiteSettings(),
        CMSService.fetchCategories(),
        CMSService.fetchEditorialTags(),
        CMSService.fetchTrash(),
      ]);
      setPosts(fetchedPosts);
      setProjects(fetchedProjects);
      setServices(fetchedServices);
      setSiteSettings(fetchedSettings);
      setCategories(fetchedCategories);
      setEditorialTags(fetchedTags);
      setTrashItems(fetchedTrash);
    } catch (e) {
      console.warn('CMS loadData error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const savePost = async (post: CMSPost) => {
    const saved = await CMSService.savePost(post);
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deletePost = async (id: string) => {
    await CMSService.deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const setPostStatus = async (id: string, status: 'draft' | 'published') => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await savePost({ ...post, status });
  };

  const saveProject = async (proj: CMSProject) => {
    const saved = await CMSService.saveProject(proj);
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  const deleteProject = async (id: string) => {
    await CMSService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const setProjectStatus = async (id: string, status: 'draft' | 'published') => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    await saveProject({ ...proj, status });
  };

  const saveService = async (service: CMSServiceItem) => {
    const saved = await CMSService.saveService(service);
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy.sort((a, b) => (a.number || '').localeCompare(b.number || ''));
      }
      return [...prev, saved].sort((a, b) => (a.number || '').localeCompare(b.number || ''));
    });
    return saved;
  };

  const deleteService = async (id: string) => {
    await CMSService.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const setServiceStatus = async (id: string, status: 'draft' | 'published') => {
    const srv = services.find((s) => s.id === id);
    if (!srv) return;
    await saveService({ ...srv, status });
  };

  const saveCategory = async (cat: CMSCategory) => {
    const saved = await CMSService.saveCategory(cat);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const deleteCategory = async (id: string) => {
    await CMSService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const saveEditorialTag = async (tag: CMSEditorialTag) => {
    const saved = await CMSService.saveEditorialTag(tag);
    setEditorialTags((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });
    return saved;
  };

  const deleteEditorialTag = async (id: string) => {
    await CMSService.deleteEditorialTag(id);
    setEditorialTags((prev) => prev.filter((t) => t.id !== id));
  };

  const saveSiteSettings = async (settings: CMSSiteSettings) => {
    await CMSService.saveSiteSettings(settings);
    setSiteSettings(settings);
  };

  // --------------------------------------------------------------------------
  // TRASH BIN ACTIONS (Chuyển vào thùng rác & Tự động xóa sau 30 ngày)
  // --------------------------------------------------------------------------
  const moveToTrash = async (type: TrashItemType, item: any, name?: string) => {
    const resolvedName = name || item.name || item.title?.vi || item.title?.en || 'Mục chưa đặt tên';
    const trashItem = await CMSService.moveToTrash(type, item, resolvedName);

    if (type === 'project') {
      setProjects((prev) => prev.filter((p) => p.id !== item.id));
    } else if (type === 'service') {
      setServices((prev) => prev.filter((s) => s.id !== item.id));
    } else if (type === 'tag') {
      setEditorialTags((prev) => prev.filter((t) => t.id !== item.id));
    } else if (type === 'category') {
      setCategories((prev) => prev.filter((c) => c.id !== item.id));
    } else if (type === 'post') {
      setPosts((prev) => prev.filter((p) => p.id !== item.id));
    }

    setTrashItems((prev) => [trashItem, ...prev.filter((t) => t.id !== trashItem.id)]);
    return trashItem;
  };

  const restoreFromTrash = async (trashId: string) => {
    const restored = await CMSService.restoreFromTrash(trashId);
    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
    // Reload full state to ensure clean sync
    await loadData();
    return restored;
  };

  const deletePermanently = async (trashId: string) => {
    await CMSService.deletePermanently(trashId);
    setTrashItems((prev) => prev.filter((t) => t.id !== trashId));
  };

  const emptyTrash = async () => {
    await CMSService.emptyTrash();
    setTrashItems([]);
  };

  const refreshTrash = async () => {
    const fetched = await CMSService.fetchTrash();
    setTrashItems(fetched);
  };

  const resetToDefaults = async () => {
    await CMSService.resetAllToDefaults();
    await loadData();
  };

  const publishedPosts = posts.filter((p) => (p.status || 'published') === 'published');
  const publishedProjects = projects.filter((p) => (p.status || 'published') === 'published');
  const publishedServices = services.filter((s) => (s.status || 'published') === 'published');

  return (
    <CMSContext.Provider
      value={{
        posts,
        publishedPosts,
        projects,
        publishedProjects,
        services,
        publishedServices,
        categories,
        editorialTags,
        siteSettings,
        trashItems,
        isLoading,
        isAdminOpen,
        setIsAdminOpen,
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
        refreshTrash,
        resetToDefaults,
        reloadAll: loadData,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return ctx;
}
