import { defineConfig } from 'dumi';
export default defineConfig({
  title: '张哈哈技术大杂铺',
  mode: 'site',
  logo: 'logo.jpg',
  locales: [['zh-CN', '中文']],
  navs: [
    {
      title: '区块链',
      path: '/blockchain',
      order: 1,
    },
    {
      title: '后端技术',
      path: '/backend',
      order: 2,
    },
    {
      title: '前端技术',
      path: '/frontend',
      order: 3,
    },
    {
      title: 'GitHub',
      path: 'https://github.com/ShaolongZhang',
    },
  ],
  links: [{ rel: 'icon', href: 'favicon.ico' }],
});
