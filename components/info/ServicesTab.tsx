
import React from 'react';
import { t } from '../../i18n';

// Simple Icons
const BoxIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>);
const SdCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="2" x2="9" y2="6"></line><line x1="12" y1="2" x2="12" y2="6"></line><line x1="15" y1="2" x2="15" y2="6"></line></svg>);
const WrenchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>);
const BrushIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10c0-1.5-1-2.5-2.5-2.5S17 10.5 17 12a5 5 0 1 1-5-5c1.5 0 2.5 1 2.5 2.5S15.5 12 14 12a1 1 0 1 0 1 1"></path></svg>);
const WhatsappIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);

interface ServiceCardProps {
    title: string;
    description: string;
    price: string;
    icon: React.ReactNode;
    colorClass: string;
    actionText: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, price, icon, colorClass, actionText }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full hover:shadow-md transition-shadow duration-300">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colorClass}`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
            {description}
        </p>
        <div className="mt-auto">
            <p className="font-semibold text-[var(--accent-color)] mb-4">{price}</p>
            <a 
                href={`https://wa.me/6281225879494?text=${encodeURIComponent(`Halo AI Projek, saya tertarik dengan ${title} untuk masjid kami.`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
            >
                <WhatsappIcon />
                {actionText}
            </a>
        </div>
    </div>
);

export const ServicesTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <section className="text-center max-w-2xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-[var(--accent-color)] mb-3">{t('info.services.title')}</h1>
                <p className="text-slate-600 dark:text-slate-300">
                    {t('info.services.intro')}
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ServiceCard 
                    title={t('info.services.waqtibox.title')}
                    description={t('info.services.waqtibox.description')}
                    price={t('info.services.waqtibox.price')}
                    icon={<BoxIcon />}
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    actionText={t('info.services.contact_button')}
                />
                <ServiceCard 
                    title={t('info.services.sdcard.title')}
                    description={t('info.services.sdcard.description')}
                    price={t('info.services.sdcard.price')}
                    icon={<SdCardIcon />}
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    actionText={t('info.services.contact_button')}
                />
                <ServiceCard 
                    title={t('info.services.setup.title')}
                    description={t('info.services.setup.description')}
                    price={t('info.services.setup.price')}
                    icon={<WrenchIcon />}
                    colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    actionText={t('info.services.contact_button')}
                />
                <ServiceCard 
                    title={t('info.services.whitelabel.title')}
                    description={t('info.services.whitelabel.description')}
                    price={t('info.services.whitelabel.price')}
                    icon={<BrushIcon />}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    actionText={t('info.services.contact_button')}
                />
            </div>
            
            <div className="text-center mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>{t('info.services.note_title')}</strong> {t('info.services.note_content')}
                </p>
            </div>
        </div>
    );
};
