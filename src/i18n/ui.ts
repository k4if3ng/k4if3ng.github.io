import type { Locale } from './config';
export { defaultLocale, localeMeta, locales, type Locale } from './config';

const zh = {
  'nav.home': '首页', 'nav.archive': '归档', 'nav.projects': '项目', 'nav.about': '关于',
  'brand.subtitle': 'notes, projects & unfinished thoughts', 'identity.name': '凯风',
  'a11y.mobileNav': '移动端导航', 'a11y.mainNav': '主导航', 'a11y.social': '社交账号', 'a11y.preferences': '显示偏好', 'a11y.avatar': '{name} 的头像',
  'language.switch': '切换至英文', 'language.current': '中文', 'language.target': '英文',
  'theme.system': '跟随系统', 'theme.light': '浅色模式', 'theme.dark': '深色模式', 'theme.change': '切换颜色主题',
  'footer.built': '由 Astro 构建',
  'social.mobileEyebrow': '其他地方', 'social.mobileTitle': '也可以在这些地方找到我',
  'home.kicker': 'KAIFENG / FIELD NOTES',
  'home.title': '记录代码、设计，以及仍在生长的想法。',
  'home.recentEyebrow': 'Writing', 'home.recentTitle': '最近更新', 'home.projectsEyebrow': 'Selected work', 'home.projectsTitle': '正在做的项目',
  'home.viewAll': '查看全部', 'home.emptyPosts': '暂时还没有中文文章。',
  'archive.eyebrow': 'Archive', 'archive.title': '归档', 'archive.count': '共 {count} 篇内容',
  'archive.searchPlaceholder': '搜索标题、摘要或标签…', 'archive.searchAria': '搜索笔记', 'archive.noMatch': '没有找到匹配的笔记。', 'archive.empty': '暂时还没有中文文章。',
  'projects.eyebrow': 'Projects', 'projects.title': '项目', 'projects.subtitle': '一些正在生长的作品与实验。', 'projects.imageAlt': '{name} 项目截图',
  'about.eyebrow': 'About', 'about.title': '关于', 'about.imageAlt': '凯风的个人视觉卡片',
  'resume.link': '简历',
  'notFound.eyebrow': '404 / Not found', 'notFound.title': '页面未找到', 'notFound.heading': '这里暂时没有内容。', 'notFound.body': '链接可能已经移动，或者这个想法还没写完。', 'notFound.back': '返回首页',
  'post.eyebrow': 'Writing / {tag}', 'post.words': '{count} 字', 'post.reading': '约 {count} 分钟',
  'post.toolbarAria': '文章工具', 'post.toc': '目录', 'post.archive': '归档', 'post.top': '顶部', 'post.bottom': '底部',
  'post.topAria': '回到顶部', 'post.bottomAria': '前往底部', 'post.paginationAria': '相邻文章', 'post.previous': '上一篇', 'post.next': '下一篇',
  'post.copy': '复制代码', 'post.copySuccess': '已复制', 'post.copyFailed': '复制失败',
} as const;

export type MessageKey = keyof typeof zh;

const en = {
  'nav.home': 'Home', 'nav.archive': 'Archive', 'nav.projects': 'Projects', 'nav.about': 'About',
  'brand.subtitle': 'notes, projects & unfinished thoughts', 'identity.name': 'Kaifeng',
  'a11y.mobileNav': 'Mobile navigation', 'a11y.mainNav': 'Main navigation', 'a11y.social': 'Social accounts', 'a11y.preferences': 'Display preferences', 'a11y.avatar': "{name}'s avatar",
  'language.switch': 'Switch to Chinese', 'language.current': 'English', 'language.target': 'Chinese',
  'theme.system': 'System', 'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.change': 'Change color theme',
  'footer.built': 'Built with Astro',
  'social.mobileEyebrow': 'Elsewhere', 'social.mobileTitle': 'Find me elsewhere',
  'home.kicker': 'KAIFENG / FIELD NOTES',
  'home.title': 'Notes on code, design, and ideas in progress.',
  'home.recentEyebrow': 'Writing', 'home.recentTitle': 'Recent writing', 'home.projectsEyebrow': 'Selected work', 'home.projectsTitle': 'Selected projects',
  'home.viewAll': 'View all', 'home.emptyPosts': 'No English articles yet.',
  'archive.eyebrow': 'Archive', 'archive.title': 'Archive', 'archive.count': '{count} entries',
  'archive.searchPlaceholder': 'Search titles, excerpts, or tags…', 'archive.searchAria': 'Search notes', 'archive.noMatch': 'No matching notes found.', 'archive.empty': 'No English articles yet.',
  'projects.eyebrow': 'Projects', 'projects.title': 'Projects', 'projects.subtitle': 'A selection of growing projects and experiments.', 'projects.imageAlt': '{name} project screenshot',
  'about.eyebrow': 'About', 'about.title': 'About', 'about.imageAlt': 'Kaifeng personal visual card',
  'resume.link': 'Résumé',
  'notFound.eyebrow': '404 / Not found', 'notFound.title': 'Page not found', 'notFound.heading': 'Nothing lives here yet.', 'notFound.body': 'The address may have changed, or this note has not been written.', 'notFound.back': 'Back home',
  'post.eyebrow': 'Writing / {tag}', 'post.words': '{count} words', 'post.reading': 'About {count} min',
  'post.toolbarAria': 'Article tools', 'post.toc': 'Contents', 'post.archive': 'Archive', 'post.top': 'Top', 'post.bottom': 'Bottom',
  'post.topAria': 'Back to top', 'post.bottomAria': 'Go to bottom', 'post.paginationAria': 'Adjacent articles', 'post.previous': 'Previous', 'post.next': 'Next',
  'post.copy': 'Copy code', 'post.copySuccess': 'Copied', 'post.copyFailed': 'Copy failed',
} satisfies Record<MessageKey, string>;

export const messages: Record<Locale, Record<MessageKey, string>> = { zh, en };

export function t(locale: Locale, key: MessageKey, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), messages[locale][key]);
}

export function localizePath(path: string, locale: Locale) {
  const unprefixed = path.replace(/^\/en(?=\/|$)/, '') || '/';
  return locale === 'en' ? `/en${unprefixed === '/' ? '/' : unprefixed}` : unprefixed;
}
