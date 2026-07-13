'use client';

import React, { useState } from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { PRODUCT_CATEGORIES } from '@/types/products';

// تعریف داده‌های محاسبه وزن آهن آلات
const weightData = [
  { href: '/weight/beam', label: 'وزن تیرآهن' },
  { href: '/weight/rebar', label: 'وزن میلگرد' },
  { href: '/weight/billet', label: 'وزن شمش فولادی' },
  { href: '/weight/pipe', label: 'وزن لوله فولادی' },
  { href: '/weight/stud', label: 'وزن ناودانی' },
  { href: '/weight/angle', label: 'وزن نبشی' },
  { href: '/weight/square-tube', label: 'وزن قوطی' },
  { href: '/weight/sheet', label: 'وزن ورق' },
];

// تعریف داده‌های محصولات با دسته‌بندی کامل
const productsData = {
  میلگرد: [
    { href: '/products/rebar/milgerd-ajdar', label: 'میلگرد آجدار' },
    { href: '/products/rebar/milgerd-sade', label: 'میلگرد ساده' },
    { href: '/products/rebar/milgerd-kolaf', label: 'میلگرد کلاف' },
    { href: '/products/rebar/milgerd-harati', label: 'میلگرد حرارتی' },
    { href: '/products/rebar/milgerd-bastar', label: 'میلگرد بستر' },
    { href: '/products/rebar/milgerd-trans', label: 'میلگرد ترانس' },
    { href: '/products/rebar/milgerd-steel', label: 'میلگرد استیل' },
  ],
  پروفیل: [
    { href: '/products/profile/profile-sakhtmani', label: 'پروفیل ساختمانی' },
    { href: '/products/profile/profile-kongre', label: 'پروفیل کنگره' },
    { href: '/products/profile/profile-sanati', label: 'پروفیل صنعتی' },
    { href: '/products/profile/profile-z', label: 'پروفیل Z' },
    { href: '/products/profile/profile-galvanize', label: 'پروفیل گالوانیزه' },
    { href: '/products/profile/profile-sabk', label: 'پروفیل سبک' },
    { href: '/products/profile/profile-steel', label: 'پروفیل استیل' },
    { href: '/products/profile/profile-aluminum', label: 'پروفیل آلومینیوم' },
    { href: '/products/profile/profile-upe', label: 'پروفیل UPE' },
    { href: '/products/profile/profile-ipe', label: 'پروفیل IPE' },
    { href: '/products/profile/profile-hea', label: 'پروفیل HEA' },
    { href: '/products/profile/profile-heb', label: 'پروفیل HEB' },
  ],
  ورق: [
    { href: '/products/sheet/varagh-garm', label: 'ورق گرم' },
    { href: '/products/sheet/varagh-siah', label: 'ورق سیاه' },
    { href: '/products/sheet/varagh-sard', label: 'ورق سرد' },
    { href: '/products/sheet/varagh-galvanize', label: 'ورق گالوانیزه' },
    { href: '/products/sheet/varagh-rangi', label: 'ورق رنگی' },
    { href: '/products/sheet/varagh-steel', label: 'ورق استیل' },
    { href: '/products/sheet/varagh-aluminum', label: 'ورق آلومینیوم' },
    { href: '/products/sheet/varagh-mes', label: 'ورق مس' },
  ],
  'نبشی و ناودانی': [
    { href: '/products/angle/nabshi', label: 'نبشی' },
    { href: '/products/angle/navodani', label: 'ناودانی' },
    { href: '/products/angle/separi', label: 'سپری' },
    { href: '/products/angle/nabshi-galvanize', label: 'نبشی گالوانیزه' },
  ],
  تیرآهن: [
    { href: '/products/beam/tirahan', label: 'تیرآهن' },
    { href: '/products/beam/hash', label: 'هاش' },
    { href: '/products/beam/lane-zanbori', label: 'لانه زنبوری' },
    { href: '/products/beam/rail', label: 'ریل' },
    { href: '/products/beam/tirahan-sangin', label: 'تیرآهن سنگین' },
    { href: '/products/beam/tirahan-sabk', label: 'تیرآهن سبک' },
  ],
  لوله: [
    { href: '/products/pipe/lole-darzdar', label: 'لوله درزدار' },
    { href: '/products/pipe/lole-bedone-darz', label: 'لوله بدون درز' },
    { href: '/products/pipe/lole-galvanize', label: 'لوله گالوانیزه' },
    { href: '/products/pipe/lole-steel', label: 'لوله استیل' },
    { href: '/products/pipe/lole-mes', label: 'لوله مس' },
    { href: '/products/pipe/lole-aluminum', label: 'لوله آلومینیوم' },
    { href: '/products/pipe/lole-polyethylene', label: 'لوله پلی‌اتیلن' },
    { href: '/products/pipe/lole-pvc', label: 'لوله PVC' },
  ],
  سیم: [
    { href: '/products/wire/sim-siah', label: 'سیم سیاه' },
    { href: '/products/wire/sim-galvanize', label: 'سیم گالوانیزه' },
    { href: '/products/wire/sim-khardar', label: 'سیم خاردار' },
    { href: '/products/wire/kabel', label: 'کابل' },
  ],
  توری: [
    { href: '/products/mesh/tori-hesari', label: 'توری حصاری' },
    { href: '/products/mesh/tori-joshi', label: 'توری جوشی' },
    { href: '/products/mesh/tori-galvanize', label: 'توری گالوانیزه' },
    { href: '/products/mesh/tori-plastic', label: 'توری پلاستیکی' },
  ],
  شمش: [
    { href: '/products/shamsh/shamsh-folad', label: 'شمش فولاد' },
    { href: '/products/shamsh/shamsh-aliaazhi', label: 'شمش آلیاژی' },
  ],
  قوطی: [
    { href: '/products/profile/qooti-sanate', label: 'قوطی صنعتی' },
    { href: '/products/profile/qooti-sotoni', label: 'قوطی ستونی' },
  ],
  'محصولات مفتولی': [
    { href: '/products/maftoli/sim-maftooli-siah', label: 'سیم مفتولی سیاه' },
    {
      href: '/products/maftoli/sim-maftooli-galvanize',
      label: 'سیم مفتولی گالوانیزه',
    },
    { href: '/products/maftoli/toori-hesari', label: 'توری حصاری' },
    { href: '/products/maftoli/mesh-ajdar', label: 'مش آجدار' },
  ],
  'مواد اولیه': [
    { href: '/products/raw-materials/ahan-esfonji', label: 'آهن اسفنجی' },
    { href: '/products/raw-materials/foro-aliazh', label: 'فروآلیاژ' },
  ],
};

// Dynamic pricing data based on product categories
const pricingData = [
  { href: '/pricing', label: 'قیمت‌های روز', icon: '💰' },
  ...PRODUCT_CATEGORIES.map((category) => ({
    href: `/pricing/${category.id}`,
    label: `قیمت ${category.name}`,
    icon: category.icon,
  })),
];

// کامپوننت SubMenu برای زیرمنوها
interface SubMenuProps {
  title: string;
  items: Array<{ href: string; label: string }>;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLinkClick: () => void;
}

const SubMenu: React.FC<SubMenuProps> = ({
  title,
  items,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onLinkClick,
}) => {
  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      میلگرد: 'icon-rebar',
      پروفیل: 'icon-profil',
      ورق: 'icon-varagh',
      'نبشی و ناودانی': 'icon-nabshi',
      تیرآهن: 'icon-tirahan',
      لوله: 'icon-lole',
      سیم: 'icon-wire',
      توری: 'icon-Wire-products',
      شمش: 'icon-bullion',
      قوطی: 'icon-Equipment',
      'محصولات مفتولی': 'icon-wire',
      'مواد اولیه': 'icon-stainless-steel',
    };
    return icons[categoryName] || 'icon-rebar';
  };

  const getCategorySlug = (categoryName: string) => {
    const slugs: Record<string, string> = {
      میلگرد: 'rebar',
      پروفیل: 'profile',
      ورق: 'sheet',
      'نبشی و ناودانی': 'angle',
      تیرآهن: 'beam',
      لوله: 'pipe',
      سیم: 'wire',
      توری: 'mesh',
      شمش: 'shamsh',
      قوطی: 'qooti',
      'محصولات مفتولی': 'maftoli',
      'مواد اولیه': 'raw-materials',
    };
    return slugs[categoryName] || 'other';
  };

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={`/products/${getCategorySlug(title)}`}
        onClick={(e) => {
          e.stopPropagation();
          onLinkClick();
        }}
        className="flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer rounded-xl hover:bg-primary/10 hover:text-primary group"
      >
        <span className="flex items-center gap-3">
          <i className={`text-lg ${getCategoryIcon(title)}`}></i>
          {title}
        </span>
        <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute right-full top-0 mr-2 w-72 max-w-[90vw] bg-background backdrop-blur-xl border border-divider/50 rounded-2xl p-3 shadow-2xl z-[60] lg:right-full lg:left-auto left-0 lg:mr-2 lg:ml-0 ml-2">
          <div className="py-1">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={onLinkClick}
                className="flex gap-3 items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 group hover:bg-primary/10 hover:text-primary hover:translate-x-2"
              >
                <span className="w-2 h-2 transition-all duration-300 rounded-full opacity-60 bg-primary/40 group-hover:opacity-100 group-hover:bg-primary group-hover:scale-125"></span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Transition>
    </div>
  );
};

// کامپوننت اصلی منوی محصولات÷
const ProductsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          setIsOpen(false);
          setActiveSubmenu(null);
        }}
      >
        <MenuButton
          className="text-sm font-semibold text-nowrap cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-300 px-3 xl:px-4 py-2.5 rounded-xl relative group overflow-hidden flex items-center gap-2 focus:outline-none"
          tabIndex={-1}
        >
          <span className="relative z-10 flex items-center gap-2">
            محصولات
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[headlessui-state=open]:rotate-180" />
          </span>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r rounded-xl from-primary/5 to-primary/10 group-hover:opacity-100"></div>
        </MenuButton>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            static
            className="absolute right-0 z-50 p-3 mt-2 origin-top-right border shadow-2xl w-80 rounded-2xl border-divider/50 bg-background backdrop-blur-xl"
          >
            <div className="py-1">
              {Object.entries(productsData).map(([category, categoryItems]) => (
                <SubMenu
                  key={category}
                  title={category}
                  items={categoryItems}
                  isOpen={activeSubmenu === category}
                  onMouseEnter={() => setActiveSubmenu(category)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                  onLinkClick={() => {
                    setIsOpen(false);
                    setActiveSubmenu(null);
                  }}
                />
              ))}

              <div className="my-2 border-t bg-gradient-to-r from-transparent to-transparent via-divider"></div>

              <MenuItem>
                {({ active }) => (
                  <Link
                    href="/products"
                    onClick={() => {
                      setIsOpen(false);
                      setActiveSubmenu(null);
                    }}
                    className={`flex justify-center items-center gap-2 px-3 py-2.5 border rounded-lg transition-colors font-medium cursor-pointer w-full ${
                      active
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                        : 'bg-white border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    مشاهده همه محصولات
                  </Link>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </div>
    </Menu>
  );
};

// کامپوننت منوی وزن آهن آلات
const WeightMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <MenuButton
          className="text-sm font-semibold text-nowrap cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-300 px-3 xl:px-4 py-2.5 rounded-xl relative group overflow-hidden flex items-center gap-2 focus:outline-none"
          tabIndex={-1}
        >
          <span className="relative z-10 flex items-center gap-2">
            وزن آهن آلات
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-data-[headlessui-state=open]:rotate-180" />
          </span>
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r rounded-xl from-primary/5 to-primary/10 group-hover:opacity-100"></div>
        </MenuButton>

        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            static
            className="absolute right-0 z-50 p-3 mt-2 origin-top-right border shadow-2xl w-80 rounded-2xl backdrop-blur-xl border-divider/50 bg-background focus:outline-none focus:ring-0"
          >
            <div className="py-1">
              {weightData.map((item, index) => (
                <MenuItem key={index}>
                  {({ active }) => (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:translate-x-2`}
                    >
                      <span className="w-2 h-2 transition-all duration-300 rounded-full opacity-60 bg-primary/40 group-hover:opacity-100 group-hover:bg-primary group-hover:scale-125"></span>
                      {item.label}
                    </Link>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Transition>
      </div>
    </Menu>
  );
};

// کامپوننت اصلی - ادغام شده
export default function NavMenu() {
  return (
    <div className="flex items-center gap-1 xl:gap-2">
      <ProductsMenu />
      <WeightMenu />
      <Link
        href="/moment-news"
        className="relative px-3 xl:px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 hover:bg-primary/15 hover:text-primary focus:outline-none group overflow-hidden whitespace-nowrap"
      >
        <span className="relative z-10">قیمت لحظه‌ای</span>
      </Link>
    </div>
  );
}
