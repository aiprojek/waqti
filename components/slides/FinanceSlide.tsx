
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

    // Logic for Side QR Layout
    const isSideQr = slide.qrCodeUrl && (slide.qrCodePosition === 'side-left' || slide.qrCodePosition === 'side-right');
    const qrPosition = slide.qrCodePosition === 'side-left' ? 'left' : 'right';

    const QrComponent = () => (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-2xl h-full min-w-[250px] max-w-[300px]">
            <p className="text-slate-800 font-bold text-lg mb-4 text-center uppercase tracking-wider">Scan Infaq</p>
            <div className="relative w-full aspect-square">
                <img src={slide.qrCodeUrl!} alt="QRIS Masjid" className="w-full h-full object-contain" />
            </div>
            <p className="text-slate-500 text-xs mt-4 text-center">Dukung operasional masjid dengan transaksi non-tunai (QRIS).</p>
        </div>
    );

    const MainContent = () => {
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
                <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col h-full justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-shadow-lg" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                            {title}
                        </h1>
                        {formattedLastUpdated && (
                            <p className="text-base md:text-lg text-white/80 font-normal mt-2 mb-6">
                                {formattedLastUpdated}
                            </p>
                        )}
                    </div>
                    <div className={`grid grid-cols-1 ${hasDonationTarget ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 md:gap-6`}>
                        <div className="lg:col-span-1 bg-black/20 p-4 rounded-lg flex flex-col justify-center min-h-[250px]">
                            <h2 className="text-lg font-bold text-center mb-2 text-white/90">{t('settings.slides.finance.chartTitle')}</h2>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                                    <XAxis dataKey="name" tick={{ fill: 'white', fontSize: 12 }} />
                                    <YAxis tickFormatter={(value: number) => new Intl.NumberFormat('id-ID', {notation: 'compact'}).format(value)} tick={{ fill: 'white', fontSize: 12 }} width={35} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value as number)}
                                        contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem' }}
                                        labelStyle={{ color: 'white' }}
                                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                    />
                                    <Legend wrapperStyle={{ color: 'white', fontSize: 12 }} />
                                    <Bar dataKey={t('settings.slides.finance.income')} fill="#22c55e" radius={[4, 4, 0, 0]}/>
                                    <Bar dataKey={t('settings.slides.finance.expense')} fill="#ef4444" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="lg:col-span-1 flex flex-col justify-center gap-3">
                            <div className="bg-black/20 p-3 rounded-lg text-center">
                                <p className="text-sm md:text-base uppercase text-white/70">{t('settings.slides.finance.initialBalance')}</p>
                                <p className="text-xl md:text-2xl font-bold font-mono">{formatCurrency(lastBalance)}</p>
                            </div>
                            <div className="bg-[var(--accent-color)]/30 p-4 rounded-lg text-center flex-grow flex flex-col justify-center">
                                <p className="text-base md:text-lg uppercase text-white/80">{t('settings.slides.finance.finalBalance')}</p>
                                <p className="text-3xl md:text-4xl font-bold font-mono">{formatCurrency(currentBalance)}</p>
                            </div>
                        </div>
                        {hasDonationTarget && (
                            <div className="lg:col-span-1 bg-black/20 p-4 rounded-lg flex flex-col justify-center min-h-[250px]">
                                <h2 className="text-lg font-bold text-center mb-1 text-white/90">{t('settings.slides.finance.donationTarget')}</h2>
                                <p className="text-center text-base font-mono text-white/80 mb-2">{formatCurrency(donationTarget!)}</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            animationBegin={200}
                                            animationDuration={800}
                                        >
                                            {pieData.map((_entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={PIE_COLORS[index % PIE_COLORS.length]}/>
                                            ))}
                                            <Label value={`${progress.toFixed(0)}%`} position="center" fill="white" className="text-2xl font-bold"/>
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {collectedAmount < donationTarget! && (
                                    <div className="mt-2 text-center">
                                        <p className="text-sm text-white/90">{t('settings.slides.finance.remainingNeeded')}</p>
                                        <p className="text-lg font-bold font-mono text-[var(--accent-color)]">{formatCurrency(donationTarget! - collectedAmount)}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Fallback jika Recharts tidak ada (Simplified)
        return (
            <div className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-shadow-lg">
                        {title}
                    </h1>
                    {formattedLastUpdated && (
                        <p className="text-lg text-white/80 font-normal mt-2 mb-6">
                            {formattedLastUpdated}
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-black/20 p-4 rounded-lg">
                        <p className="text-sm uppercase text-white/70">{t('settings.slides.finance.initialBalance')}</p>
                        <p className="text-2xl font-bold">{formatCurrency(lastBalance)}</p>
                    </div>
                    <div className="bg-green-500/30 p-4 rounded-lg">
                        <p className="text-sm uppercase text-white/80">{t('settings.slides.finance.income')}</p>
                        <p className="text-2xl font-bold">{formatCurrency(income)}</p>
                    </div>
                    <div className="bg-red-500/30 p-4 rounded-lg">
                        <p className="text-sm uppercase text-white/80">{t('settings.slides.finance.expense')}</p>
                        <p className="text-2xl font-bold">{formatCurrency(expense)}</p>
                    </div>
                </div>
                <div className="mt-6 bg-[var(--accent-color)]/30 p-6 rounded-lg text-center">
                        <p className="text-lg uppercase text-white/80">{t('settings.slides.finance.finalBalance')}</p>
                        <p className="text-4xl font-bold">{formatCurrency(currentBalance)}</p>
                </div>
            </div>
        );
    };

    if (isSideQr) {
        return (
            <div className="w-full h-full flex flex-col md:flex-row justify-center items-stretch p-4 md:p-8 gap-6 md:gap-8">
                {qrPosition === 'left' && <div className="flex-shrink-0 flex items-center justify-center"><QrComponent /></div>}
                <div className="flex-grow min-w-0 flex items-center justify-center w-full">
                    <MainContent />
                </div>
                {qrPosition === 'right' && <div className="flex-shrink-0 flex items-center justify-center"><QrComponent /></div>}
            </div>
        );
    }

    // Default Centered Layout
    return (
        <div className="w-full flex flex-col justify-center items-center p-4 md:p-8">
            <div className="w-full max-w-6xl">
                <MainContent />
            </div>
        </div>
    );
};
