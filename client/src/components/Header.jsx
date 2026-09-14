import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
  Heart,
  ChevronDown,
  X,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '../store/auth';
import { useSiteConfig, setting } from '../hooks/useSiteConfig';
import http, { assetUrl } from '../api/http';

const isExternal = (url) => /^https?:\/\//i.test(url || '');

function SmartLink({
  item,
  className = '',
  children,
  onClick,
}) {
  if (isExternal(item.url)) {
    return (
      <a
        href={item.url}
        target={item.open_new_tab ? '_blank' : undefined}
        rel={item.open_new_tab ? 'noreferrer' : undefined}
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={item.url || '/'}
      target={item.open_new_tab ? '_blank' : undefined}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [q, setQ] = useState('');
  const [mobile, setMobile] = useState(false);

  const nav = useNavigate();

  const user = useAuthStore((s) => s.user);

  const { data: cfg } = useSiteConfig();

  const brand = setting(
    cfg,
    'brand.name',
    'ShasthoCare'
  );

  const logo = setting(
    cfg,
    'brand.logo',
    ''
  );

  const announcement = setting(
    cfg,
    'announcement.text',
    ''
  );

  const suggestions = useQuery({
    queryKey: ['suggest', q],

    enabled: q.trim().length >= 2,

    queryFn: () =>
      http
        .get('/search/suggestions', {
          params: {
            q,
          },
        })
        .then((r) => r.data.data),
  });

  const go = (e) => {
    e.preventDefault();

    const value = q.trim();

    setMobile(false);

    nav(
      '/products?q=' +
        encodeURIComponent(value)
    );
  };

  const configured = (
    cfg?.navigation || []
  ).filter(
    (x) => x.location === 'header'
  );

  const top = configured.filter(
    (x) => !x.parent_id
  );

  const children = (id) =>
    configured.filter(
      (x) =>
        Number(x.parent_id) ===
        Number(id)
    );

  const fallback = [
    {
      id: 'home',
      label: 'Home',
      url: '/',
    },

    ...(cfg?.categories || [])
      .slice(0, 6)
      .map((x) => ({
        id: 'c' + x.id,
        label: x.name,
        url:
          '/products?category=' +
          x.slug,
      })),

    {
      id: 'offers',
      label: 'Offers',
      url:
        '/products?sort=price_asc',
    },
  ];

  const menu =
    top.length > 0
      ? top
      : fallback;

  const closeMobile = () => {
    setMobile(false);
  };

  return (
    <>
      {/* ========================= */}
      {/* Announcement bar */}
      {/* ========================= */}

      {setting(
        cfg,
        'announcement.enabled',
        '0'
      ) !== '0' &&
        announcement && (
          <div className="relative z-[70] bg-brand-700 px-4 py-2 text-center text-xs font-semibold text-white">
            {announcement}
          </div>
        )}

      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <header className="sticky top-0 z-[70] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        {/* ========================= */}
        {/* Main top row */}
        {/* ========================= */}

        <div className="container-app flex h-20 items-center gap-4">
          {/* Logo */}

          <Link
            to="/"
            onClick={closeMobile}
            className="flex min-w-0 shrink-0 items-center gap-2"
          >
            {logo ? (
              <img
                src={assetUrl(logo)}
                alt={brand}
                className="h-11 max-w-[150px] object-contain sm:max-w-44"
              />
            ) : (
              <>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-xl font-black text-white">
                  +
                </span>

                <span className="hidden text-xl font-black text-slate-900 min-[380px]:block sm:text-2xl">
                  {brand}
                </span>
              </>
            )}
          </Link>

          {/* ========================= */}
          {/* Desktop Search */}
          {/* ========================= */}

          <div className="relative hidden min-w-0 flex-1 md:block">
            <form
              onSubmit={go}
              className="flex max-w-2xl items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-brand-400 focus-within:bg-white"
            >
              <Search
                size={18}
                className="mr-3 shrink-0 text-slate-400"
              />

              <input
                value={q}
                onChange={(e) =>
                  setQ(e.target.value)
                }
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder={setting(
                  cfg,
                  'header.search_placeholder',
                  'Search medicines, healthcare products...'
                )}
              />

              <button
                type="submit"
                aria-label="Search"
                className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700"
              >
                <Search size={17} />
              </button>
            </form>

            {/* Desktop Suggestions */}

            {q.trim().length >= 2 &&
              (
                suggestions.data ||
                []
              ).length > 0 && (
                <div className="absolute left-0 top-[56px] z-[120] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {(
                    suggestions.data ||
                    []
                  ).map((s) => (
                    <Link
                      key={s.slug}
                      to={
                        '/product/' +
                        s.slug
                      }
                      onClick={() => {
                        setQ('');
                      }}
                      className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-brand-50"
                    >
                      <div className="text-sm font-bold text-slate-900">
                        {s.name}
                      </div>

                      {s.generic_name && (
                        <div className="mt-0.5 text-xs text-slate-500">
                          {
                            s.generic_name
                          }
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
          </div>

          {/* ========================= */}
          {/* Header actions */}
          {/* ========================= */}

          <nav className="ml-auto flex shrink-0 items-center gap-2 text-xs font-semibold sm:gap-4">
            {/* Track Order */}

            <Link
              to="/track"
              className="hidden flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700 lg:flex"
            >
              <MapPin size={20} />

              <span>
                Track Order
              </span>
            </Link>

            {/* Account */}

            <Link
              to={
                user
                  ? '/account'
                  : '/login'
              }
              className="flex flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700"
            >
              <User size={20} />

              <span className="hidden min-[360px]:block">
                {user
                  ? 'Account'
                  : 'Sign In'}
              </span>
            </Link>

            {/* Wishlist */}

            <Link
              to="/account/wishlist"
              className="hidden flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700 sm:flex"
            >
              <Heart size={20} />

              <span>
                Wishlist
              </span>
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              className="flex flex-col items-center gap-1 text-slate-700 transition hover:text-brand-700"
            >
              <ShoppingCart
                size={20}
              />

              <span className="hidden min-[360px]:block">
                Cart
              </span>
            </Link>

            {/* Mobile menu button */}

            <button
              type="button"
              aria-label={
                mobile
                  ? 'Close menu'
                  : 'Open menu'
              }
              aria-expanded={mobile}
              onClick={() =>
                setMobile(
                  (prev) => !prev
                )
              }
              className={`grid h-10 w-10 place-items-center rounded-xl transition md:hidden ${
                mobile
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {mobile ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </nav>
        </div>

        {/* ========================= */}
        {/* Mobile Search */}
        {/* NOW INSIDE HEADER */}
        {/* ========================= */}

        <div className="border-t border-slate-100 md:hidden">
          <div className="container-app relative py-3">
            <form
              onSubmit={go}
              className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-brand-400 focus-within:bg-white"
            >
              <Search
                size={17}
                className="mr-2 shrink-0 text-slate-400"
              />

              <input
                value={q}
                onChange={(e) => {
                  setQ(
                    e.target.value
                  );

                  if (mobile) {
                    setMobile(false);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder={setting(
                  cfg,
                  'header.search_placeholder',
                  'Search medicines...'
                )}
              />

              {q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() =>
                    setQ('')
                  }
                  className="mr-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                aria-label="Search"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-white"
              >
                <Search
                  size={16}
                />
              </button>
            </form>

            {/* Mobile search suggestions */}

            {!mobile &&
              q.trim().length >= 2 &&
              (
                suggestions.data ||
                []
              ).length > 0 && (
                <div className="absolute left-4 right-4 top-[60px] z-[120] max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {(
                    suggestions.data ||
                    []
                  ).map((s) => (
                    <Link
                      key={s.slug}
                      to={
                        '/product/' +
                        s.slug
                      }
                      onClick={() => {
                        setQ('');
                        setMobile(
                          false
                        );
                      }}
                      className="block border-b border-slate-100 px-4 py-3 last:border-b-0 active:bg-brand-50"
                    >
                      <div className="text-sm font-bold text-slate-900">
                        {s.name}
                      </div>

                      {s.generic_name && (
                        <div className="mt-1 text-xs text-slate-500">
                          {
                            s.generic_name
                          }
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* ========================= */}
        {/* Desktop navigation */}
        {/* ========================= */}

        <div className="hidden border-t border-slate-100 md:block">
          <div className="container-app flex h-12 items-center gap-2 overflow-visible text-sm font-semibold">
            {menu.map(
              (item, i) => {
                const kids =
                  children(
                    item.id
                  );

                return (
                  <div
                    key={
                      item.id
                    }
                    className="group relative shrink-0"
                  >
                    <SmartLink
                      item={
                        item
                      }
                      className={`flex items-center gap-1 rounded-full px-4 py-2 transition ${
                        i ===
                        0
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
                      }`}
                    >
                      {
                        item.label
                      }

                      {kids.length >
                        0 && (
                        <ChevronDown
                          size={
                            14
                          }
                        />
                      )}
                    </SmartLink>

                    {kids.length >
                      0 && (
                      <div className="invisible absolute left-0 top-full z-[120] min-w-60 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        {kids.map(
                          (
                            k
                          ) => (
                            <SmartLink
                              item={
                                k
                              }
                              key={
                                k.id
                              }
                              className="block rounded-xl px-4 py-3 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                            >
                              {
                                k.label
                              }
                            </SmartLink>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* MOBILE MENU */}
        {/* ATTACHED DIRECTLY */}
        {/* UNDER HEADER */}
        {/* ========================= */}

        {mobile && (
          <div className="absolute left-0 right-0 top-full z-[110] border-t border-slate-200 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.18)] md:hidden">
            <div className="container-app max-h-[calc(100vh-160px)] overflow-y-auto py-3">
              {/* Main navigation */}

              <div className="space-y-1">
                {menu.map(
                  (
                    item,
                    index
                  ) => {
                    const kids =
                      children(
                        item.id
                      );

                    return (
                      <div
                        key={
                          item.id
                        }
                      >
                        <SmartLink
                          item={
                            item
                          }
                          onClick={
                            closeMobile
                          }
                          className={`flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-[15px] font-bold transition ${
                            index ===
                            0
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-slate-800 hover:bg-slate-50 active:bg-brand-50'
                          }`}
                        >
                          <span>
                            {
                              item.label
                            }
                          </span>

                          {kids.length >
                            0 && (
                            <ChevronDown
                              size={
                                16
                              }
                              className="text-slate-400"
                            />
                          )}
                        </SmartLink>

                        {/* Children */}

                        {kids.length >
                          0 && (
                          <div className="ml-5 border-l-2 border-slate-100 pl-2">
                            {kids.map(
                              (
                                k
                              ) => (
                                <SmartLink
                                  key={
                                    k.id
                                  }
                                  item={
                                    k
                                  }
                                  onClick={
                                    closeMobile
                                  }
                                  className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                                >
                                  {
                                    k.label
                                  }
                                </SmartLink>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Mobile extra links */}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  to="/track"
                  onClick={
                    closeMobile
                  }
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  <MapPin
                    size={19}
                    className="text-brand-600"
                  />

                  Track Order
                </Link>

                <Link
                  to="/account/wishlist"
                  onClick={
                    closeMobile
                  }
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 sm:hidden"
                >
                  <Heart
                    size={19}
                    className="text-brand-600"
                  />

                  Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ========================= */}
      {/* Mobile backdrop */}
      {/* Header এর নিচে থাকবে */}
      {/* Page push করবে না */}
      {/* ========================= */}

      {mobile && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobile}
          className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-[1px] md:hidden"
        />
      )}
    </>
  );
}