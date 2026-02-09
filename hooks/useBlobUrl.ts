import { useState, useEffect } from 'react';
import { db } from '../lib/db';

/**
 * Hook to convert a source string into a usable URL.
 * If source starts with 'local-asset:', it fetches the blob from IndexedDB and creates a temporary URL.
 * Otherwise, it returns the source as is (for http URLs or existing Base64 strings).
 */
export const useBlobUrl = (source: string | undefined | null) => {
    const [url, setUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!source) {
            setUrl(undefined);
            return;
        }

        let objectUrl: string | undefined;
        let isMounted = true;

        if (source.startsWith('local-asset:')) {
            const id = parseInt(source.split(':')[1], 10);
            if (!isNaN(id)) {
                db.assets.get(id).then((asset: any) => {
                    if (isMounted && asset && asset.blob) {
                        objectUrl = URL.createObjectURL(asset.blob);
                        setUrl(objectUrl);
                    } else if (isMounted) {
                        // Asset not found in DB
                        setUrl(''); 
                    }
                }).catch((err: any) => {
                    console.error("Failed to load asset", err);
                    if (isMounted) setUrl('');
                });
            }
        } else {
            // Standard URL or Base64
            setUrl(source);
        }

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [source]);

    return url;
};
