'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export interface MonthlyPoint {
    month: string;
    students: number;
    revenue: number;
}

/*
 * Charts are split out and loaded with next/dynamic (ssr:false) from the
 * dashboard page. recharts is ~100KB, so keeping it out of the initial bundle
 * lets the dashboard render immediately and pull the charts in afterwards.
 */
export default function DashboardCharts({ monthlyData }: { monthlyData: MonthlyPoint[] }) {
    return (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Student Growth Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Growth</CardTitle>
                    <CardDescription>Monthly student enrollment trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="month" stroke="#737373" />
                            <YAxis stroke="#737373" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#141414',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="students"
                                stroke="url(#lineGradient)"
                                strokeWidth={3}
                                dot={{ fill: '#c6ff2e', r: 4 }}
                            />
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#c6ff2e" />
                                    <stop offset="100%" stopColor="#f5f4ef" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue from enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="month" stroke="#737373" />
                            <YAxis stroke="#737373" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#141414',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
