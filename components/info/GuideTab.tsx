import React from 'react';
import DOMPurify from 'dompurify';
import { t } from '../../i18n';
import { CollapsibleSection } from '../settings/Shared';

export const GuideTab: React.FC = () => {
    
    const sanitize = (html: string) => {
        return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{t('info.guide.title')}</h1>
            <p className="text-slate-600 dark:text-slate-300">{t('info.guide.intro')}</p>

            <CollapsibleSection title={t('info.guide.general.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.general.content')) }}
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('info.guide.calculation.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.calculation.content')) }}
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('info.guide.display.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.display.content')) }}
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('info.guide.alarm.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.alarm.content')) }}
                />
            </CollapsibleSection>

            <CollapsibleSection title={t('info.guide.slides.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.slides.content')) }}
                />
            </CollapsibleSection>
            
            <CollapsibleSection title={t('info.guide.mosqueMode.title')}>
                <div
                    className="guide-content text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: sanitize(t('info.guide.mosqueMode.content')) }}
                />
            </CollapsibleSection>
        </div>
    );
};
