'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Globe,
    LogOut,
    Menu,
    Search,
    X,
    type LucideIcon,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import CommandPalette, { type CommandItem } from '@/components/ui/CommandPalette';

export interface NavLink {
    href: string;
    label: string;
    icon: LucideIcon;
}

export interface NavSection {
    title?: string;
    links: NavLink[];
}

interface PortalShellProps {
    sections: NavSection[];
    /** Caption under the logo, e.g. "Admin console". */
    caption: string;
    /** Extra entries that appear only in the command palette. */
    extraCommands?: CommandItem[];
    profileHref: string;
    children: React.ReactNode;
}

const COLLAPSE_KEY = 'csl.sidebar.collapsed';

const isActivePath = (pathname: string, href: string) =>
    pathname === href || pathname.startsWith(href + '/');

export default function PortalShell({ sections, caption, extraCommands = [], profileHref, children }: PortalShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Restore sidebar preference
    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
        } catch { /* storage unavailable */ }
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((c) => {
            try { localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1'); } catch { /* ignore */ }
            return !c;
        });
    };

    // Close overlays on navigation
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Current page, for the top-bar breadcrumb
    const current = useMemo(() => {
        let best: { section?: string; link: NavLink } | null = null;
        for (const s of sections) {
            for (const l of s.links) {
                if (isActivePath(pathname, l.href) && (!best || l.href.length > best.link.href.length)) {
                    best = { section: s.title, link: l };
                }
            }
        }
        return best;
    }, [pathname, sections]);

    const isDetailPage = current ? pathname !== current.link.href : false;

    const commands: CommandItem[] = useMemo(() => [
        ...sections.flatMap((s) =>
            s.links.map((l) => ({ label: l.label, href: l.href, icon: l.icon, group: s.title ?? 'Navigation' }))
        ),
        ...extraCommands,
        { label: 'Log out', icon: LogOut, group: 'Account', onSelect: handleLogout, keywords: 'sign out exit' },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [sections, extraCommands]);

    const initials = getInitials(user?.name || 'User');

    const renderNavList = (compact: boolean, onNavigate?: () => void) => (
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4" aria-label="Main">
            {sections.map((section, si) => (
                <div key={si} className={cn(si > 0 && 'mt-6')}>
                    {section.title && (
                        compact ? (
                            <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
                        ) : (
                            <div className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500">
                                {section.title}
                            </div>
                        )
                    )}
                    <ul className="space-y-0.5">
                        {section.links.map((link) => {
                            const active = isActivePath(pathname, link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={onNavigate}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                                            compact && 'justify-center px-0',
                                            active
                                                ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                                                : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-100'
                                        )}
                                    >
                                        {active && (
                                            <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-400 shadow-[0_0_12px_rgba(198,255,46,0.8)]" />
                                        )}
                                        <link.icon
                                            size={18}
                                            strokeWidth={active ? 2.2 : 1.8}
                                            className={cn('shrink-0', active ? 'text-brand-300' : 'text-gray-500 group-hover:text-gray-300')}
                                        />
                                        {!compact && <span className="truncate">{link.label}</span>}
                                        {compact && (
                                            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-white/10 bg-ink-800 px-2 py-1 text-xs text-white opacity-0 shadow-elevated transition-opacity group-hover:opacity-100">
                                                {link.label}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    );

    const renderUserCard = (compact: boolean) => (
        <div className="border-t border-white/[0.06] p-3">
            <div className={cn('flex items-center gap-3 rounded-lg p-2', compact && 'justify-center p-0 py-2')}>
                <Link href={profileHref} className="flex min-w-0 flex-1 items-center gap-3" title={user?.name}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400 on-neon hover:bg-brand-300 text-xs font-semibold text-white ring-2 ring-white/10">
                        {initials}
                    </span>
                    {!compact && (
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-white">{user?.name || 'User'}</span>
                            <span className="block truncate text-xs text-gray-500">{user?.email}</span>
                        </span>
                    )}
                </Link>
                {!compact && (
                    <button
                        onClick={handleLogout}
                        className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Log out"
                        aria-label="Log out"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-ink-950">
            {/* Desktop sidebar */}
            <aside
                className={cn(
                    'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/80 transition-[width] duration-200 ease-out lg:flex',
                    collapsed ? 'w-[72px]' : 'w-[260px]'
                )}
            >
                <div className={cn('flex h-16 items-center border-b border-white/[0.06] px-4', collapsed && 'justify-center px-0')}>
                    <Logo compact={collapsed} caption={caption} size={30} />
                </div>

                {!collapsed && (
                    <div className="px-3 pt-4">
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 text-sm text-gray-500 transition-colors hover:border-white/[0.12] hover:text-gray-300"
                        >
                            <Search size={15} />
                            <span className="flex-1 text-left">Quick search…</span>
                            <span className="kbd">Ctrl K</span>
                        </button>
                    </div>
                )}

                {renderNavList(collapsed)}

                <div className="px-3 pb-1">
                    <button
                        onClick={toggleCollapsed}
                        className={cn(
                            'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-300',
                            collapsed && 'justify-center px-0'
                        )}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={18} /><span>Collapse</span></>}
                    </button>
                </div>
                {renderUserCard(collapsed)}
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.06] bg-ink-900 lg:hidden"
                        >
                            <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
                                <Logo caption={caption} size={30} />
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.06] hover:text-white"
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {renderNavList(false, () => setMobileOpen(false))}
                            {renderUserCard(false)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-ink-950/75 px-4 backdrop-blur-xl sm:px-6">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="-ml-1 rounded-lg p-2 text-gray-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                        {current?.section && (
                            <>
                                <span className="hidden text-gray-500 sm:inline">{current.section}</span>
                                <ChevronRight size={14} className="hidden text-gray-600 sm:inline" />
                            </>
                        )}
                        {current ? (
                            isDetailPage ? (
                                <>
                                    <Link href={current.link.href} className="truncate text-gray-400 hover:text-white">
                                        {current.link.label}
                                    </Link>
                                    <ChevronRight size={14} className="text-gray-600" />
                                    <span className="truncate font-medium text-white">Details</span>
                                </>
                            ) : (
                                <span className="truncate font-medium text-white">{current.link.label}</span>
                            )
                        ) : (
                            <span className="truncate font-medium text-white">{caption}</span>
                        )}
                    </div>

                    <button
                        onClick={() => setPaletteOpen(true)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.06] hover:text-white"
                        aria-label="Search"
                        title="Search (Ctrl K)"
                    >
                        <Search size={18} />
                    </button>

                    <Link
                        href="/"
                        className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white md:flex"
                    >
                        <Globe size={15} />
                        <span>Website</span>
                    </Link>

                    <NotificationDropdown />

                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen((o) => !o)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 on-neon hover:bg-brand-300 text-xs font-semibold text-white ring-2 ring-white/10 transition hover:ring-white/25"
                            aria-label="Account menu"
                            aria-expanded={userMenuOpen}
                        >
                            {initials}
                        </button>
                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-ink-850/95 p-1 shadow-elevated backdrop-blur-xl"
                                >
                                    <div className="px-3 py-2.5">
                                        <div className="truncate text-sm font-medium text-white">{user?.name}</div>
                                        <div className="truncate text-xs text-gray-500">{user?.email}</div>
                                    </div>
                                    <div className="my-1 h-px bg-white/[0.06]" />
                                    <Link href={profileHref} className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white">
                                        Account settings
                                    </Link>
                                    <Link href="/" className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/[0.06] hover:text-white">
                                        Back to website
                                    </Link>
                                    <div className="my-1 h-px bg-white/[0.06]" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                                    >
                                        <LogOut size={15} /> Log out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>

            <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} items={commands} />
        </div>
    );
}
