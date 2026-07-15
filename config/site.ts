export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'Hormoz Steel',
  description:
    'Live steel and metal pricing catalog — rebar, beams, sheets, profiles, and more. Built as an English portfolio demo.',
  tagline: 'Clear prices. Fast quotes. Industrial products.',
  navItems: [
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  navMenuItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Products',
      href: '/products',
    },
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Contact',
      href: '/contact',
    },
  ],
  heroItems: [
    {
      name: 'rebar',
      icon: 'icon-rebar',
      label: 'Rebar',
      href: '/products/rebar',
      items: [
        { label: 'Ribbed rebar', href: '/products/rebar/milgerd-ajdar' },
        { label: 'Plain rebar', href: '/products/rebar/milgerd-sade' },
        { label: 'Coil rebar', href: '/products/rebar/milgerd-kolaf' },
        { label: 'Thermal rebar', href: '/products/rebar/milgerd-harati' },
        { label: 'Bed rebar', href: '/products/rebar/milgerd-bastar' },
        { label: 'Trans rebar', href: '/products/rebar/milgerd-trans' },
        { label: 'Stainless rebar', href: '/products/rebar/milgerd-steel' },
      ],
    },
    {
      name: 'profile',
      icon: 'icon-profile',
      label: 'Profiles',
      href: '/products/profile',
      items: [
        {
          label: 'Structural profiles',
          href: '/products/profile/profile-sakhtmani',
        },
        { label: 'Corrugated profiles', href: '/products/profile/profile-kongre' },
        { label: 'Industrial profiles', href: '/products/profile/profile-sanati' },
        { label: 'Z profiles', href: '/products/profile/profile-z' },
        {
          label: 'Galvanized profiles',
          href: '/products/profile/profile-galvanize',
        },
        { label: 'Light profiles', href: '/products/profile/profile-sabk' },
        { label: 'Stainless profiles', href: '/products/profile/profile-steel' },
        {
          label: 'Aluminum profiles',
          href: '/products/profile/profile-aluminum',
        },
        { label: 'UPE profiles', href: '/products/profile/profile-upe' },
        { label: 'IPE beams', href: '/products/profile/profile-ipe' },
        { label: 'HEA beams', href: '/products/profile/profile-hea' },
        { label: 'HEB beams', href: '/products/profile/profile-heb' },
      ],
    },
    {
      name: 'sheet',
      icon: 'icon-sheet',
      label: 'Sheets',
      href: '/products/sheet',
      items: [
        { label: 'Hot-rolled sheet', href: '/products/sheet/varagh-garm' },
        { label: 'Black sheet', href: '/products/sheet/varagh-siah' },
        { label: 'Cold-rolled sheet', href: '/products/sheet/varagh-sard' },
        { label: 'Galvanized sheet', href: '/products/sheet/varagh-galvanize' },
        { label: 'Color-coated sheet', href: '/products/sheet/varagh-rangi' },
        { label: 'Stainless sheet', href: '/products/sheet/varagh-steel' },
        { label: 'Aluminum sheet', href: '/products/sheet/varagh-aluminum' },
        { label: 'Copper sheet', href: '/products/sheet/varagh-mes' },
      ],
    },
    {
      name: 'angle',
      icon: 'icon-Corners',
      label: 'Angles & channels',
      href: '/products/angle',
      items: [
        { label: 'Angle bar', href: '/products/angle/nabshi' },
        { label: 'Channel', href: '/products/angle/navodani' },
        { label: 'T-bar', href: '/products/angle/separi' },
        { label: 'Galvanized angle', href: '/products/angle/nabshi-galvanize' },
      ],
    },
    {
      name: 'beam',
      icon: 'icon-girder',
      label: 'Beams',
      href: '/products/beam',
      items: [
        { label: 'I-beam', href: '/products/beam/tirahan' },
        { label: 'H-beam', href: '/products/beam/hash' },
        { label: 'Castellated beam', href: '/products/beam/lane-zanbori' },
        { label: 'Rail', href: '/products/beam/rail' },
        { label: 'Heavy beam', href: '/products/beam/tirahan-sangin' },
        { label: 'Light beam', href: '/products/beam/tirahan-sabk' },
      ],
    },
    {
      name: 'pipe',
      icon: 'icon-pipe',
      label: 'Pipes',
      href: '/products/pipe',
      items: [
        { label: 'Seamed pipe', href: '/products/pipe/lole-darzdar' },
        { label: 'Seamless pipe', href: '/products/pipe/lole-bedone-darz' },
        { label: 'Galvanized pipe', href: '/products/pipe/lole-galvanize' },
        { label: 'Stainless pipe', href: '/products/pipe/lole-steel' },
        { label: 'Copper pipe', href: '/products/pipe/lole-mes' },
        { label: 'Aluminum pipe', href: '/products/pipe/lole-aluminum' },
        { label: 'PE pipe', href: '/products/pipe/lole-polyethylene' },
        { label: 'PVC pipe', href: '/products/pipe/lole-pvc' },
      ],
    },
    {
      name: 'wire',
      icon: 'icon-Wire-products',
      label: 'Wire',
      href: '/products/wire',
      items: [
        { label: 'Black wire', href: '/products/wire/sim-siah' },
        { label: 'Galvanized wire', href: '/products/wire/sim-galvanize' },
        { label: 'Barbed wire', href: '/products/wire/sim-khardar' },
        { label: 'Cable', href: '/products/wire/kabel' },
      ],
    },
    {
      name: 'mesh',
      icon: 'icon-wire',
      label: 'Mesh',
      href: '/products/mesh',
      items: [
        { label: 'Fence mesh', href: '/products/mesh/tori-hesari' },
        { label: 'Welded mesh', href: '/products/mesh/tori-joshi' },
        { label: 'Galvanized mesh', href: '/products/mesh/tori-galvanize' },
        { label: 'Plastic mesh', href: '/products/mesh/tori-plastic' },
      ],
    },
  ],
  links: {
    github: 'https://github.com/SepehrGR7',
    portfolio: 'https://sepehrgr.dev',
  },
}
