'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandItem {
    label: string;
    group: string;
    icon: LucideIcon;
    href?: string;
    onSelect?: () => void;
    keywords?: string;
}

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: CommandItem[];
}

/** Global "jump to" palette. Toggle with Ctrl/Cmd + K. */
export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange, items }) => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                onOpenChange(!open);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onOpenChange]);

    useEffect(() => {
        if (open) {
            setQuery('');
            setActive(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => `${i.label} ${i.group} ${i.keywords ?? ''}`.toLowerCase().includes(q));
    }, [items, query]);

    useEffect(() => setActive(0), [query]);

    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active]);

    const run = (item: CommandItem) => {
        onOpenChange(false);
        if (item.onSelect) item.onSelect();
        else if (item.href) router.push(item.href);
    };

    const onInputKey = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
        } else if (e.key === 'Enter' && filtered[active]) {
            e.preventDefault();
            run(filtered[active]);
        } else if (e.key === 'Escape') {
            onOpenChange(false);
        }
    };

    // Group while preserving flat indices for keyboard navigation
    const groups = useMemo(() => {
        const map = new Map<string, { item: CommandItem; index: number }[]>();
        filtered.forEach((item, index) => {
            if (!map.has(item.group)) map.set(item.group, []);
            map.get(item.group)!.push({ item, index });
        });
        return Array.from(map.entries());
    }, [filtered]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                        initial={{ opacity: 0, scale: 0.97, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-ink-850/95 shadow-elevated backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
                            <Search size={18} className="text-gray-500" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onInputKey}
                                placeholder="Search pages and actions…"
                                className="h-14 flex-1 bg-transparent text-[15px] text-white placeholder:text-gray-500 focus:outline-none !shadow-none"
                                role="combobox"
                                aria-expanded="true"
                                aria-controls="command-list"
                            />
                            <span className="kbd">Esc</span>
                        </div>

                        <div ref={listRef} id="command-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
                            {filtered.length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-500">No results for “{query}”</div>
                            ) : (
                                groups.map(([group, entries]) => (
                                    <div key={group} className="mb-1">
                                        <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                                            {group}
                                        </div>
                                        {entries.map(({ item, index }) => (
                                            <button
                                                key={`${group}-${item.label}`}
                                                data-index={index}
                                                role="option"
                                                aria-selected={index === active}
                                                onMouseMove={() => setActive(index)}
                                                onClick={() => run(item)}
                                                className={cn(
                                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                                                    index === active ? 'bg-white/[0.07] text-white' : 'text-gray-300'
                                                )}
                                            >
                                                <item.icon size={16} className={index === active ? 'text-brand-300' : 'text-gray-500'} />
                                                <span className="flex-1">{item.label}</span>
                                                {index === active && <CornerDownLeft size={14} className="text-gray-500" />}
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1.5"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
                            <span className="flex items-center gap-1.5"><span className="kbd">↵</span> open</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
