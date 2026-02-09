import React from 'react';
import type { FinanceSlide } from '../../types';
import { t } from '../../i18n';
import { formatCurrency, useFormatUpdateDate } from './Shared';

declare const Recharts: any;

interface FinanceSlideProps {
    slide: FinanceSlide;
}

export const FinanceSlideDisplay: React.FC<FinanceSlideProps> = ({ slide }) => {
    const formatUpdateDate = useFormatUpdateDate();
    const { title, lastBalance, income, expense, currentBalance, donationTarget, lastUpdated } = slide.financeInfo;
    const formattedLastUpdated = formatUpdateDate(lastUpdated);
    const collectedAmount = Math.max(0, income || 0);
    const hasDonationTarget = donationTarget && donationTarget > 0;
    const progress = hasDonationTarget ? (collectedAmount / donationTarget!) * 100 : 0;

    // Tampilan dengan Grafik (jika Recharts tersedia)
    if (typeof Recharts !== 'undefined') {
        const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label } = Recharts;

        const barChartData = [{ 
            name: t('settings.slides.finance.summary'), 
            [t('settings.slides.finance.income')]: income, 
            [t('settings.slides.finance.expense')]: expense 
        }];
        
        const pieData = hasDonationTarget ? [
            { name: t('settings.slides.finance.collected'), value: collectedAmount },
            { name: t('settings.slides.finance.remaining'), value: Math.max(0, donationTarget! - collectedAmount) },
        ] : [];

        const PIE_COLORS = ['var(--accent-color, #8B5CF6)', '#475569'];

        return (
            <div className="w-full flex flex-col justify-center items-center p-4 md:p-8">
                <div className="w-full max-w-6xl bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                            {title}
                        </h1>
                        {formattedLastUpdated && (
                            <p className="text-lg md:text-xl text-white/80 font-normal mt-4 mb-8">
                                {formattedLastUpdated}
                            </p>
                        )}
                    </div>
                    <div className={`grid grid-cols-1 ${hasDonationTarget ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
                        <div className="lg:col-span-1 bg-black/20 p-4 rounded-lg flex flex-col justify-center">
                            <h2 className="text-xl font-bold text-center mb-4 text-white/90">{t('settings.slides.finance.chartTitle')}</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                                    <XAxis dataKey="name" tick={{ fill: 'white' }} />
                                    <YAxis tickFormatter={(value: number) => new Intl.NumberFormat('id-ID', {notation: 'compact'}).format(value)} tick={{ fill: 'white' }} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value as number)}
                                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem' }}
                                        labelStyle={{ color: 'white' }}
                                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                    />
                                    <Legend wrapperStyle={{ color: 'white' }} />
                                    <Bar dataKey={t('settings.slides.finance.income')} fill="#22c55e" radius={[4, 4, 0, 0]}/>
                                    <Bar dataKey={t('settings.slides.finance.expense')} fill="#ef4444" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="lg:col-span-1 flex flex-col justify-center gap-4">
                            <div className="bg-black/20 p-4 rounded-lg text-center">
                                <p className="text-lg md:text-xl uppercase text-white/70">{t('settings.slides.finance.initialBalance')}</p>
                                <p className="text-2xl md:text-4xl font-bold font-mono">{formatCurrency(lastBalance)}</p>
                            </div>
                            <div className="bg-[var(--accent-color)]/30 p-6 rounded-lg text-center">
                                <p className="text-xl md:text-2xl uppercase text-white/80">{t('settings.slides.finance.finalBalance')}</p>
                                <p className="text-4xl md:text-6xl font-bold font-mono">{formatCurrency(currentBalance)}</p>
                            </div>
                        </div>
                        {hasDonationTarget && (
                            <div className="lg:col-span-1 bg-black/20 p-4 rounded-lg flex flex-col justify-center">
                                <h2 className="text-xl font-bold text-center mb-1 text-white/90">{t('settings.slides.finance.donationTarget')}</h2>
                                <p className="text-center text-lg font-mono text-white/80 mb-2">{formatCurrency(donationTarget!)}</p>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationBegin={200}
                                            animationDuration={800}
                                        >
                                            {pieData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={PIE_COLORS[index % PIE_COLORS.length]}/>
                                            ))}
                                            <Label value={`${progress.toFixed(0)}%`} position="center" fill="white" className="text-3xl font-bold"/>
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                                        <Legend wrapperStyle={{ color: 'white', paddingTop: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {collectedAmount < donationTarget! && (
                                    <div className="mt-4 text-center">
                                        <p className="text-lg text-white/90">{t('settings.slides.finance.remainingNeeded')}</p>
                                        <p className="text-2xl font-bold font-mono text-[var(--accent-color)]">{formatCurrency(donationTarget! - collectedAmount)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Fallback jika Recharts tidak ada
    return (
        <div className="w-full flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-5xl bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                        {title}
                    </h1>
                    {formattedLastUpdated && (
                        <p className="text-lg md:text-xl text-white/80 font-normal mt-4 mb-8">
                            {formattedLastUpdated}
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-black/20 p-4 rounded-lg">
                        <p className="text-lg md:text-xl uppercase text-white/70">{t('settings.slides.finance.initialBalance')}</p>
                        <p className="text-2xl md:text-4xl font-bold">{formatCurrency(lastBalance)}</p>
                    </div>
                    <div className="bg-green-500/30 p-4 rounded-lg">
                        <p className="text-lg md:text-xl uppercase text-white/80">{t('settings.slides.finance.income')}</p>
                        <p className="text-2xl md:text-4xl font-bold">{formatCurrency(income)}</p>
                    </div>
                    <div className="bg-red-500/30 p-4 rounded-lg">
                        <p className="text-lg md:text-xl uppercase text-white/80">{t('settings.slides.finance.expense')}</p>
                        <p className="text-2xl md:text-4xl font-bold">{formatCurrency(expense)}</p>
                    </div>
                </div>
                <div className="mt-6 bg-[var(--accent-color)]/30 p-6 rounded-lg text-center">
                        <p className="text-xl md:text-2xl uppercase text-white/80">{t('settings.slides.finance.finalBalance')}</p>
                        <p className="text-4xl md:text-6xl font-bold">{formatCurrency(currentBalance)}</p>
                </div>
                {hasDonationTarget && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2 text-lg">
                            <span>{t('settings.slides.finance.donationTarget')}</span>
                            <span>{formatCurrency(donationTarget!)}</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-6">
                            <div 
                                className="bg-[var(--accent-color)] h-6 rounded-full text-center text-white font-bold flex items-center justify-center"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            >
                                {progress.toFixed(0)}%
                            </div>
                        </div>
                            {collectedAmount < donationTarget! && (
                            <div className="mt-4 text-center">
                                <p className="text-lg text-white/90">{t('settings.slides.finance.remainingNeeded')}</p>
                                <p className="text-2xl font-bold font-mono text-[var(--accent-color)]">{formatCurrency(donationTarget! - collectedAmount)}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
