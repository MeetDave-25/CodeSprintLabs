'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Bell, Mail, Lock, Globe, Palette, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'CodeSprint Labs',
        siteEmail: 'admin@codesprintlabs.com',
        supportEmail: 'support@codesprintlabs.com',
        enableNotifications: true,
        enableEmailAlerts: true,
        maintenanceMode: false,
        allowRegistration: true,
    });

    const handleSave = () => {
        // Save settings logic
        alert('Settings saved successfully!');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Configure platform settings and preferences</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe size={20} className="text-purple-400" />
                            General Settings
                        </CardTitle>
                        <CardDescription>Basic platform configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Site Name"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        />
                        <Input
                            label="Site Email"
                            type="email"
                            value={settings.siteEmail}
                            onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                        />
                        <Input
                            label="Support Email"
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        />
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell size={20} className="text-purple-400" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Push Notifications</div>
                                <div className="text-sm text-gray-400">Enable push notifications for users</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableNotifications}
                                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Email Alerts</div>
                                <div className="text-sm text-gray-400">Send email alerts for important events</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableEmailAlerts}
                                    onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock size={20} className="text-purple-400" />
                            Security
                        </CardTitle>
                        <CardDescription>Security and access control</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Maintenance Mode</div>
                                <div className="text-sm text-gray-400">Temporarily disable public access</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Allow Registration</div>
                                <div className="text-sm text-gray-400">Enable new user registrations</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette size={20} className="text-purple-400" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize platform appearance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="font-semibold mb-2">Theme</div>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg text-white font-semibold">
                                    Dark (Active)
                                </button>
                                <button className="p-3 bg-white/10 rounded-lg text-gray-400 hover:bg-white/20">
                                    Light
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="font-semibold mb-2">Primary Color</div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 cursor-pointer ring-2 ring-white"></div>
                                <div className="w-10 h-10 rounded-full bg-blue-600 cursor-pointer"></div>
                                <div className="w-10 h-10 rounded-full bg-green-600 cursor-pointer"></div>
                                <div className="w-10 h-10 rounded-full bg-red-600 cursor-pointer"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button variant="primary" onClick={handleSave}>
                    <Save size={18} className="mr-2" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
