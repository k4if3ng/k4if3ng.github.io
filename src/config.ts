export const site = {
  name: 'Kaifeng',
  locales: {
    zh: {
      title: '凯风的博客',
      description: '记录代码、设计，以及仍在生长的想法。',
      homeIntro: '技术笔记、项目片段，和偶尔偏离主线的生活记录。',
      motto: '回到过去是无用的，\n因为我现在已经不一样了。',
    },
    en: {
      title: "Kaifeng's Blog",
      description: 'Notes on code, design, and ideas in progress.',
      homeIntro: 'Technical notes, project fragments, and occasional life detours.',
      motto: 'It\'s no use going back to yesterday,\nbecause I am different now.',
    },
  },
  url: 'https://www.kfenghub.top',
  github: 'https://github.com/k4if3ng',
  bilibili: 'https://space.bilibili.com/259333405',
  email: 'mailto:kaifeng.ak@gmail.com',
  linuxdo: 'https://linux.do/u/k4if3ng/summary',
  x: 'https://x.com/k4if3ng',
  zhihu: '',
  resume: '/documents/resume/en.pdf',
  avatar: '/images/avatar.jpg',
  // 在 Gravatar 设置头像后，将邮箱的 MD5（小写、去空格）填入这里即可启用。
  gravatarHash: '6aa1967a641094ee937ff87c3998dfca',
} as const;

export const socials = [
  { label: 'GitHub', href: site.github, icon: '/icons/github.svg', target: '_blank' },
  { label: 'Bilibili', href: site.bilibili, icon: '/icons/bilibili.svg', target: '_blank' },
  { label: 'Zhihu', href: site.zhihu, icon: '/icons/zhihu.svg', target: undefined },
  { label: 'Linux Do', href: site.linuxdo, icon: '/icons/linuxdo.svg', target: '_blank' },
  { label: 'X', href: site.x, icon: '/icons/x.svg', target: '_blank' },
  { label: 'Email', href: site.email, icon: '/icons/mail.svg', target: undefined },
  { label: 'RSS', href: '/rss.xml', icon: '/icons/rss.svg', target: undefined },
  { label: 'Résumé', href: site.resume, icon: '/icons/file-text.svg', target: '_blank' },
] as const;

export const avatarUrl = site.gravatarHash
  ? `https://www.gravatar.com/avatar/${site.gravatarHash}?s=192&d=404`
  : site.avatar;
