export const site = {
  name: {
    zh: '凯风',
    en: 'Kaifeng',
  },
  siteName: {
    zh: '凯风的博客',
    en: "Kaifeng's Blog",
  },
  motto: {
    zh: `决心不过是记忆的奴隶`,
    en: `Purpose is but the slave to memory`,
  },
  footer: {
    startYear: 2025,
    builtWith: { label: 'Astro', href: 'https://astro.build', target: '_blank' },
  },
  url: 'https://www.kfenghub.top',
  github: 'https://github.com/k4if3ng',
  bilibili: 'https://space.bilibili.com/259333405',
  email: 'mailto:kaifeng.ak@gmail.com',
  linuxdo: 'https://linux.do/u/k4if3ng/summary',
  x: 'https://x.com/k4if3ng',
  zhihu: '',
  resume_en: '/documents/resume/resume-en.pdf',
  resume_zh: '/documents/resume/resume-zh_CN.pdf',
  avatar: '/images/avatar.jpg',
  gravatarHash: '6aa1967a641094ee937ff87c3998dfca',
} as const;

export const socials = [
  { label: 'GitHub', href: site.github, icon: 'fa-brands fa-github', target: '_blank' },
  { label: 'Bilibili', href: site.bilibili, icon: 'fa-brands fa-bilibili', target: '_blank' },
  { label: 'Zhihu', href: site.zhihu, icon: 'fa-brands fa-zhihu', target: undefined },
  { label: 'X', href: site.x, icon: 'fa-brands fa-x-twitter', target: '_blank' },
  { label: 'Linux Do', href: site.linuxdo, icon: 'fa-solid fa-l', target: '_blank' },
  { label: 'Email', href: site.email, icon: 'fa-solid fa-envelope', target: undefined },
  { label: 'Curriculum Vitae (EN)', href: site.resume_en, icon: 'fa-solid fa-file-lines', target: '_blank' },
  { label: '中文简历', href: site.resume_zh, icon: 'fa-solid fa-file', target: '_blank' },
  { label: 'RSS', href: '/rss.xml', icon: 'fa-solid fa-rss', target: undefined },
] as const;

export const avatarUrl = site.gravatarHash
  ? `https://www.gravatar.com/avatar/${site.gravatarHash}?s=192&d=404`
  : site.avatar;
