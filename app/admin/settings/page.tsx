'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Bell, Mail, Lock, Globe, Palette, Database, Loader2, User, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminService } from '@/lib/services';

interface AdminProfile {
    name: string;
    email: string;
    phone?: string;
}

interface PlatformSettings {
    siteName: string;
    siteEmail: string;
    supportEmail: string;
    enableNotifications: boolean;
    enableEmailAlerts: boolean;
    maintenanceMode: boolean;
    allowRegistration: boolean;
}

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<AdminProfile>({
        name: '',
        email: '',
        phone: '',
    });
    const [settings, setSettings] = useState<PlatformSettings>({
        siteName: 'CodeSprint Labs',
        siteEmail: 'admin@codesprintlabs.com',
        supportEmail: 'support@codesprintlabs.com',
        enableNotifications: true,
        enableEmailAlerts: true,
        maintenanceMode: false,
        allowRegistration: true,
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [profileRes, settingsRes] = await Promise.all([
                adminService.getProfile().catch(() => ({ data: {} })),
                adminService.getPlatformSettings().catch(() => ({ data: {} })),
            ]);

            if (profileRes.data) {
                const p = profileRes.data.data || profileRes.data.admin || profileRes.data;
                setProfile({
                    name: p.name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                });
            }

            if (settingsRes.data) {
                const s = settingsRes.data.data || settingsRes.data.settings || settingsRes.data;
                if (s) {
                    setSettings(prev => ({ ...prev, ...s }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await adminService.updateProfile({
                name: profile.name,
                phone: profile.phone,
            });
            alert('Profile updated successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await adminService.updatePlatformSettings(settings);
            alert('Settings saved successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (passwordData.password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await adminService.updatePassword(passwordData);
            setPasswordSuccess('Password changed successfully!');
            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Configure platform settings and preferences</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User size={20} className="text-purple-400" />
                            Admin Profile
                        </CardTitle>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={profile.email}
                            disabled
                        />
                        <Input
                            label="Phone"
                            value={profile.phone || ''}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                        <Button variant="primary" onClick={handleSaveProfile} isLoading={isSaving}>
                            <Save size={18} className="mr-2" />
                            Update Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key size={20} className="text-purple-400" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {passwordError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                    {passwordSuccess}
                                </div>
                            )}
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                required
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                required
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                required
                            />
                            <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                                <Lock size={18} className="mr-2" />
                                Change Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>

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
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableNotifications ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.enableNotifications ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Email Alerts</div>
                                <div className="text-sm text-gray-400">Send email alerts for important events</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, enableEmailAlerts: !settings.enableEmailAlerts })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableEmailAlerts ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.enableEmailAlerts ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
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
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                            <div>
                                <div className="font-semibold">Allow Registration</div>
                                <div className="text-sm text-gray-400">Enable new user registrations</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowRegistration ? 'bg-purple-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
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
                                <button className="p-3 bg-white/10 rounded-lg text-gray-400 hover:bg-white/20 transition-colors">
                                    Light
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <div className="font-semibold mb-2">Primary Color</div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-600 cursor-pointer ring-2 ring-white"></div>
                                <div className="w-10 h-10 rounded-full bg-blue-600 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"></div>
                                <div className="w-10 h-10 rounded-full bg-green-600 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"></div>
                                <div className="w-10 h-10 rounded-full bg-red-600 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button variant="primary" onClick={handleSaveSettings} isLoading={isSaving}>
                    <Save size={18} className="mr-2" />
                    Save All Settings
                </Button>
            </div>
        </div>
    );
}
