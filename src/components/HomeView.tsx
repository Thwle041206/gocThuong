import { Language, Article } from '../data/content';
import { WorkView } from './WorkView';

interface HomeViewProps {
  lang: Language;
  onNavigate?: (tab: 'home' | 'connect' | 'work' | 'blog' | 'contact') => void;
  onSelectArticle?: (article: Article) => void;
  onOpenContact: (defaultService?: string) => void;
}

export function HomeView({
  lang,
  onOpenContact,
}: HomeViewProps) {
  // Trang chính thể hiện trọn vẹn Portfolio với 2 chế độ xem: Dạng chữ Website & Dạng PDF
  return <WorkView lang={lang} onOpenContact={onOpenContact} />;
}
