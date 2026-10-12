'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Notification {
    _id: string; // MongoDB ID often comes as _id or id depending on collection setup, usually Eloquent maps to id, but let's be safe
    id?: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.status === 'success') {
                setNotifications(res.data.data.data); // data.data because paginated
            }

            const countRes = await api.get('/notifications/unread-count');
            if (countRes.data.status === 'success') {
                setUnreadCount(countRes.data.count);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Initial fetch and poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string, link?: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className="text-green-500" />;
            case 'error': return <X size={16} className="text-red-500" />;
            default: return <Bell size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-ink-950 ring-2 ring-ink-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-ink-850/95 shadow-elevated backdrop-blur-xl z-50"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-medium text-brand-300 hover:text-brand-200 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-6 py-12 text-center text-gray-500 text-sm"><Bell size={22} className="mx-auto mb-3 text-gray-600" />
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id || notification._id}
                                        onClick={() => handleMarkAsRead(notification.id || notification._id, notification.link)}
                                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notification.read ? 'bg-brand-500/[0.04]' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center bg-white/5`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm ${!notification.read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <span className="text-[10px] text-gray-500 mt-2 block">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            {!notification.read && (
                                                <div className="mt-2 w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
