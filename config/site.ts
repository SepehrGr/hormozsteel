export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'آهن هرمز | قیمت روز انواع آهن آلات',
  description: 'آهن هرمز،بروز ترین مرجع اطلاع رسانی قیمت انواع آهن آلات',
  navItems: [
    {
      label: 'درباره ما',
      href: '/about',
    },
    {
      label: 'تماس با ما',
      href: '/contact',
    },
  ],
  navMenuItems: [
    {
      label: 'صفحه اصلی',
      href: '/',
    },
    {
      label: 'محصولات',
      href: '/products',
    },
    {
      label: 'درباره ما',
      href: '/about',
    },
    {
      label: 'تماس با ما',
      href: '/contact',
    },
  ],
  heroItems: [
    {
      name: 'rebar',
      icon: 'icon-rebar',
      label: 'میلگرد',
      href: '/products/rebar',
      items: [
        { label: 'میلگرد آجدار', href: '/products/rebar/milgerd-ajdar' },
        { label: 'میلگرد ساده', href: '/products/rebar/milgerd-sade' },
        { label: 'میلگرد کلاف', href: '/products/rebar/milgerd-kolaf' },
        { label: 'میلگرد حرارتی', href: '/products/rebar/milgerd-harati' },
        { label: 'میلگرد بستر', href: '/products/rebar/milgerd-bastar' },
        { label: 'میلگرد ترانس', href: '/products/rebar/milgerd-trans' },
        { label: 'میلگرد استیل', href: '/products/rebar/milgerd-steel' },
      ],
    },
    {
      name: 'profile',
      icon: 'icon-profile',
      label: 'پروفیل',
      href: '/products/profile',
      items: [
        {
          label: 'پروفیل ساختمانی',
          href: '/products/profile/profile-sakhtmani',
        },
        { label: 'پروفیل کنگره', href: '/products/profile/profile-kongre' },
        { label: 'پروفیل صنعتی', href: '/products/profile/profile-sanati' },
        { label: 'پروفیل Z', href: '/products/profile/profile-z' },
        {
          label: 'پروفیل گالوانیزه',
          href: '/products/profile/profile-galvanize',
        },
        { label: 'پروفیل سبک', href: '/products/profile/profile-sabk' },
        { label: 'پروفیل استیل', href: '/products/profile/profile-steel' },
        {
          label: 'پروفیل آلومینیوم',
          href: '/products/profile/profile-aluminum',
        },
        { label: 'پروفیل UPE', href: '/products/profile/profile-upe' },
        { label: 'پروفیل IPE', href: '/products/profile/profile-ipe' },
        { label: 'پروفیل HEA', href: '/products/profile/profile-hea' },
        { label: 'پروفیل HEB', href: '/products/profile/profile-heb' },
      ],
    },
    {
      name: 'sheet',
      icon: 'icon-sheet',
      label: 'ورق',
      href: '/products/sheet',
      items: [
        { label: 'ورق گرم', href: '/products/sheet/varagh-garm' },
        { label: 'ورق سیاه', href: '/products/sheet/varagh-siah' },
        { label: 'ورق سرد', href: '/products/sheet/varagh-sard' },
        { label: 'ورق گالوانیزه', href: '/products/sheet/varagh-galvanize' },
        { label: 'ورق رنگی', href: '/products/sheet/varagh-rangi' },
        { label: 'ورق استیل', href: '/products/sheet/varagh-steel' },
        { label: 'ورق آلومینیوم', href: '/products/sheet/varagh-aluminum' },
        { label: 'ورق مس', href: '/products/sheet/varagh-mes' },
      ],
    },
    {
      name: 'angle',
      icon: 'icon-Corners',
      label: 'نبشی و ناودانی',
      href: '/products/angle',
      items: [
        { label: 'نبشی', href: '/products/angle/nabshi' },
        { label: 'ناودانی', href: '/products/angle/navodani' },
        { label: 'سپری', href: '/products/angle/separi' },
        { label: 'نبشی گالوانیزه', href: '/products/angle/nabshi-galvanize' },
      ],
    },
    {
      name: 'beam',
      icon: 'icon-girder',
      label: 'تیرآهن',
      href: '/products/beam',
      items: [
        { label: 'تیرآهن', href: '/products/beam/tirahan' },
        { label: 'هاش', href: '/products/beam/hash' },
        { label: 'لانه زنبوری', href: '/products/beam/lane-zanbori' },
        { label: 'ریل', href: '/products/beam/rail' },
        { label: 'تیرآهن سنگین', href: '/products/beam/tirahan-sangin' },
        { label: 'تیرآهن سبک', href: '/products/beam/tirahan-sabk' },
      ],
    },
    {
      name: 'pipe',
      icon: 'icon-pipe',
      label: 'لوله',
      href: '/products/pipe',
      items: [
        { label: 'لوله درزدار', href: '/products/pipe/lole-darzdar' },
        { label: 'لوله بدون درز', href: '/products/pipe/lole-bedone-darz' },
        { label: 'لوله گالوانیزه', href: '/products/pipe/lole-galvanize' },
        { label: 'لوله استیل', href: '/products/pipe/lole-steel' },
        { label: 'لوله مس', href: '/products/pipe/lole-mes' },
        { label: 'لوله آلومینیوم', href: '/products/pipe/lole-aluminum' },
        { label: 'لوله پلی‌اتیلن', href: '/products/pipe/lole-polyethylene' },
        { label: 'لوله PVC', href: '/products/pipe/lole-pvc' },
      ],
    },
    {
      name: 'wire',
      icon: 'icon-Wire-products',
      label: 'سیم',
      href: '/products/wire',
      items: [
        { label: 'سیم سیاه', href: '/products/wire/sim-siah' },
        { label: 'سیم گالوانیزه', href: '/products/wire/sim-galvanize' },
        { label: 'سیم خاردار', href: '/products/wire/sim-khardar' },
        { label: 'کابل', href: '/products/wire/kabel' },
      ],
    },
    {
      name: 'mesh',
      icon: 'icon-wire',
      label: 'توری',
      href: '/products/mesh',
      items: [
        { label: 'توری حصاری', href: '/products/mesh/tori-hesari' },
        { label: 'توری جوشی', href: '/products/mesh/tori-joshi' },
        { label: 'توری گالوانیزه', href: '/products/mesh/tori-galvanize' },
        { label: 'توری پلاستیکی', href: '/products/mesh/tori-plastic' },
      ],
    },
  ],
  links: {
    github: 'https://github.com/heroui-inc/heroui',
    twitter: 'https://twitter.com/hero_ui',
    docs: 'https://heroui.com',
    discord: 'https://discord.gg/9b6yyZKmH4',
    sponsor: 'https://patreon.com/jrgarciadev',
  },
}
