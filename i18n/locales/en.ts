
export const en = {
    general: {
        online: 'Online',
        offline: 'Offline',
        credit: 'Made by AI Projek',
        back: 'Back',
        save: 'Save',
        close: 'Close',
        saved: 'Settings saved successfully!',
        saveError: 'Failed to save settings.',
        exported: 'Data exported successfully.',
        exportError: 'Failed to export data.',
        imported: 'Data imported successfully! Reloading...',
        importError: 'Failed to import data. The file might be corrupt or invalid.',
        noContent: 'No content available for the selected themes.',
        customTextPlaceholder: 'Set running text in the Settings menu.',
        jummah: "Jum'ah",
        jumat: "Jum'at",
    },
    welcome: {
        title: 'Welcome to Waqti',
        message: 'Your personal reminder for appointments with The Creator. Before you begin, please select your preferred language.',
        language: 'Select Language',
        guide: 'View Guide',
        start: 'Get Started'
    },
    prayerNames: {
        Fajr: 'Fajr',
        Sunrise: 'Sunrise',
        Dhuhr: 'Dhuhr',
        Asr: 'Asr',
        Maghrib: 'Magrib',
        Isha: 'Isha',
    },
    main: {
        loading: 'Loading prayer times...',
        error: 'An error occurred',
        prayerTime: 'PRAYER TIME',
        upNext: 'Next Prayer',
        countdownTo: 'Countdown to',
        iqamahIn: 'Iqamah in',
        prayerInProgress: 'ESTABLISH THE PRAYER',
        prayerInProgressTagline: 'Straighten and close the rows!',
        dhikr: 'DHIKR AFTER PRAYER',
        until: 'Until',
        in: 'in',
        otherPrayerTimes: 'Other Prayer Times',
        iqamahOffset: 'Iqamah in {{minutes}} min',
    },
    footer: {
        runningText: {
            text: `Surely, prayer is a timed prescription for the believers.`,
            source: 'Q.S. An-Nisa: 103'
        },
    },
    settings: {
        title: 'Settings',
        tabs: {
            general: 'General',
            calculation: 'Calculation',
            display: 'Display',
            alarm: 'Alarm & Dhikr',
            slides: 'Slides',
            services: 'Services & Store'
        },
        general: {
            title: 'General Settings',
            mosqueName: 'Mosque Name',
            language: 'Language',
            city: 'City',
            search: 'Search',
            searching: 'Searching...',
            currentCity: 'Current city: {{city}}',
            citySetTo: 'City set to {{city}}. Prayer times will be updated.',
            cityTooShort: 'City name is too short.',
            dataManagement: {
                title: 'Data Management',
                description: 'Save your settings to a file for backup or to move them to another device.',
                export: 'Export Settings',
                import: 'Import Settings'
            },
            offlineAssets: {
                title: 'Offline Assets',
                description: 'Download required libraries, default images, and sounds to ensure the app works fully without internet (Offline Mode).',
                download: 'Download Assets',
                downloading: 'Downloading...',
                ready: 'Assets Ready (Offline Mode Available)',
                success: 'Assets downloaded successfully!'
            },
            remote: {
                title: 'Remote Control',
                description: 'Scan this QR Code with your phone to control the display remotely.',
                pairingCode: 'Pairing Code / Peer ID',
                statusConnected: 'Remote Connected',
                statusWaiting: 'Waiting for Connection...',
                scanButton: 'Scan to Connect',
                manualInputLabel: 'Or Enter Code Manually',
                manualInputPlaceholder: 'Example: WAQTI-AB123',
                connectButton: 'Connect'
            },
            promo: {
                title: 'Need Specialized Hardware?',
                description: 'Get the plug-and-play WaqtiBox (Mini PC). More stable, no installation hassle.',
                button: 'View Services & Store'
            }
        },
        calculation: {
            title: 'Prayer Time Calculation Settings',
            method: 'Calculation Method',
            madhab: 'Madhab (for Asr Time)',
            highLatitude: 'High Latitude Rule',
            fajrAngle: 'Fajr Angle',
            ishaAngle: 'Isha Angle',
            customNote: 'Angles can only be changed if the Calculation Method is set to Custom.',
            source: {
                title: 'Data Source & Location',
                source: 'Calculation Source',
                api: 'Online (API)',
                calculated: 'Offline (Calculated)',
                latitude: 'Latitude',
                longitude: 'Longitude',
                detect: 'Detect Location',
                detecting: 'Detecting...',
                detectError: 'Could not detect location. Please ensure location services are enabled.',
                searchCityPlaceholder: 'Search coordinates by city name...',
                searchCity: 'Search Coordinates',
                searchSuccess: 'Found coordinates for: {{city}}',
                searchNotFound: 'City coordinates not found.',
                manualHelp: 'You can type the Latitude and Longitude manually above.',
                currentCoordinates: 'Current Coordinates',
                modeHelp: "Choose 'Online' for server-validated results, or 'Offline' for internal calculation (Adhan.js) without internet."
            },
            methodHelp: 'The settings below apply to both methods (Online API & Offline Adhan.js).',
            corrections: {
                title: 'Manual Adjustments',
                useManual: 'Use Manual Prayer Times',
                correction: 'Time Adjustments (minutes)',
                iqamah: 'Delay to Iqamah (minutes)',
                hijri: 'Hijri Date Adjustment (Days)',
                hijriHelp: 'Adjust the Hijri date by +/- 1 or 2 days if it differs from the local sighting (Rukyat).'
            }
        },
        display: {
            title: 'Display & Visual Settings',
            presets: {
                title: 'Theme Presets (One-Click Style)',
                description: 'Quickly apply a curated set of colors, wallpapers, and fonts.',
                apply: 'Apply'
            },
            fontStyle: {
                title: 'Font Style',
                sans: 'Modern (Sans-Serif)',
                serif: 'Classic (Serif)'
            },
            theme: 'Theme',
            dark: 'Dark',
            light: 'Light',
            orientation: 'Orientation Mode',
            landscape: 'Landscape (Wide Screen)',
            portrait: 'Portrait (Tall Screen)',
            layout: 'Main Display Layout Template',
            layoutFocus: 'Focus Clock',
            layoutDashboard: 'Information Dashboard',
            layoutMinimalist: 'Minimalist',
            minimalist: {
                enableSwap: 'Show Full Schedule Periodically',
                swapInterval: 'Interval (minutes)'
            },
            bgAnimation: 'Enable Background Animation',
            dimScreen: {
                enable: 'Enable Dim Screen during Prayer',
                help: 'The screen will turn black during the "Prayer in Progress" period to simulate being off.'
            },
            sleepMode: {
                title: 'Power Saving (Auto Sleep/Wake)',
                enable: 'Enable Sleep Mode',
                startTime: 'Start Time (Sleep)',
                endTime: 'End Time (Wake)',
                help: 'The screen will turn completely black during these hours to save power and prevent burn-in.'
            },
            accentColor: 'Accent Color',
            wallpaper: {
                title: 'Main Wallpaper',
                useUrl: 'Use URL',
                upload: 'Upload',
                useColor: 'Solid Color',
                url: 'Wallpaper Image URL',
                selectFile: 'Select Image File...',
                maxSize: 'Max file size is 2MB.',
                preview: 'Preview',
                reset: 'Reset'
            },
            contextualWallpaper: {
                title: 'Contextual Wallpapers',
                enable: 'Enable different wallpapers for each prayer time'
            },
            runningText: {
                title: 'Running Text',
                enable: 'Enable Running Text in Footer',
                mode: 'Content Mode',
                custom: 'Custom',
                themed: 'Themed',
                customList: 'Custom Text List',
                addText: 'Add Text',
                text: 'Text',
                empty: 'No custom texts yet. Please add one.',
                quranThemes: 'Qur\'an Themes',
                hadithThemes: 'Hadith Themes',
                speed: 'Animation Speed (seconds)',
                speedHelp: 'Duration for the text to scroll from one side to the other. Longer text takes longer.'
            }
        },
        alarm: {
            title: 'Alarm Settings',
            enableAdhan: 'Enable Adhan Alarm',
            enableIqamah: 'Enable Iqamah Alarm',
            sound: {
                default: 'Default',
                url: 'URL',
                upload: 'Upload'
            },
            friday: {
                title: 'Jum\'ah Mode Settings',
                enable: 'Enable Jum\'ah Mode',
                timeSource: 'Jum\'ah Time Source',
                followDhuhr: 'Follow Dhuhr Time',
                manual: 'Set Manually',
                manualTime: 'Manual Jum\'ah Time',
                khutbahDuration: 'Khutbah Display Duration (minutes)',
                khutbahDurationHelp: 'Replaces the iqamah countdown. After this, the prayer is considered finished.',
                khutbahTitle: 'Khutbah Message Title',
                khutbahTagline: 'Khutbah Message Tagline',
                enableSlides: 'Enable slides specific to Friday'
            },
            duration: {
                title: 'Display Duration Settings',
                prayer: '"Prayer Established" Duration (minutes)',
                dhikr: 'Total Dhikr Duration (minutes)',
                enableDhikr: 'Enable Dhikr Display After Prayer',
                dhikrList: 'Dhikr List to Display',
                dhikrEmpty: 'Select at least one dhikr to display.',
                addDhikr: 'Add New Dhikr',
                arabic: 'Arabic Text',
                latin: 'Latin Text (Transliteration)',
                add: 'Add',
                emptyFields: 'Arabic and Latin text cannot be empty.'
            }
        },
        slides: {
            title: 'Slide Settings',
            list: 'Slide List',
            add: {
                text: 'Add Text',
                image: 'Add Image',
                schedule: 'Add Schedule',
                finance: 'Add Finance',
                fridayOfficer: 'Add Officer'
            },
            slide: 'Slide',
            enable: 'Enable Slide',
            remove: 'Remove',
            duration: 'Display Duration',
            seconds: 'seconds',
            fridayOnly: 'Show on Fridays only',
            fridayOnlyHelp: 'Enable "slides specific to Friday" in the Alarm & Dhikr tab to use this.',
            titleInput: 'Title',
            content: 'Content',
            imageUrl: 'Image URL',
            image: 'Image',
            selectFile: 'Select File...',
            schedule: {
                topic: 'Topic',
                speaker: 'Speaker',
                day: 'Day',
                time: 'Time',
                add: 'Add Schedule Item'
            },
            finance: {
                reportTitle: 'Report Title',
                initialBalance: 'Initial Balance',
                income: 'Income',
                expense: 'Expense',
                finalBalance: 'Final Balance',
                donationTarget: 'Donation Target (Optional)',
                chartTitle: 'Income vs Expense',
                summary: 'Summary',
                collected: 'Collected',
                remaining: 'Remaining',
                remainingNeeded: 'Remaining Amount Needed:'
            },
            officer: {
                title: 'Jum\'ah Officers',
                khotib: 'Khatib',
                imam: 'Imam',
                muadzin: 'Muadzin',
                bilal: 'Bilal'
            },
            empty: 'No slides yet. Please add one.',
            type: {
                text: 'Text Slide',
                image: 'Image Slide',
                schedule: 'Schedule Slide',
                finance: 'Finance Slide',
                'friday-officer': 'Officers Slide'
            }
        }
    },
    info: {
        title: 'About & Guide',
        tabs: {
            about: 'About App',
            guide: 'User Guide',
            services: 'Services & Store',
            contact: 'Contact'
        },
        about: {
            appName: "Waqti",
            description_part1: "A modern and personal prayer times application to accompany your time with The Creator. Features customizations, themes, and dynamic content for personal use and digital mosque clock displays. Inspired by ",
            mawaqit_link_text: "Mawaqit",
            description_part2: " with simplified usage—no account or backoffice needed. The name Waqti (وقتي) means 'My Time', emphasizing a personal connection to prayer times.",
            featuresTitle: 'Key Features',
            features: "Automatic Prayer Times:Calculates prayer times based on city and selected method.|Remote Control:Control the display (change slides, stop alarms) remotely via smartphone with a built-in QR scanner.|Customizable Calculations:Adjust methods, madhab, and time corrections.|Iqamah Countdown:Displays a countdown from adhan to iqamah.|Jum'ah Mode:Special display mode for Friday prayers.|Display Layouts:Choose from Focus, Dashboard, or Minimalist views.|Dynamic Slideshow:Display text, images, schedules, and financial reports.|Theme Presets:One-click style application (e.g., Masjidil Haram, Modern Minimalist).|Theming:Customize accent colors and wallpapers.|Running Text:Show custom messages or themed content.|Dhikr Display:Shows a sequence of dhikr after prayers.|Dim Screen:An optional feature to make the screen go black during prayer.|Power Saving:Auto Sleep/Wake feature to turn off the screen rendering at night.|Jum'ah Officers:Dedicated slide to display Imam, Khatib, and Muadzin.|Total Offline Support:Works without internet, complete with asset downloading for images/sounds.|High Performance:Optimized image storage and rendering.|Backup & Restore:Easily export and import settings.",
            supportTitle: 'Developer',
            coffee: 'Buy Me a Coffee',
            discussion: 'Join Discussion',
            github: 'GitHub'
        },
        services: {
            title: 'Services & Hardware',
            intro: 'Support Waqti development and simplify your mosque operations with these premium solutions. Proceeds go towards maintenance and new features.',
            waqtibox: {
                title: 'WaqtiBox (Mini PC Plug & Play)',
                description: 'Mini PC device pre-installed with Waqti. Just plug into your mosque TV, connect WiFi, and you are good to go. The most stable and easy-to-configure solution.',
                price: 'Starts from $35 (Depends on device)'
            },
            sdcard: {
                title: 'WaqtiDrive (USB Bootable)',
                description: 'Bootable SD Card or Flashdrive with OS and Waqti (for Raspberry Pi or old PCs). A budget-friendly solution if you own the hardware.',
                price: 'Starts from $7'
            },
            setup: {
                title: 'On-Site Setup Service',
                description: 'Our team is ready to visit your mosque (Java Island Area) for installation, TV setup, and training. Transport costs are covered by the client.',
                price: 'Contact Us'
            },
            whitelabel: {
                title: 'Custom Branding / White Label',
                description: 'A special version of Waqti with your Mosque/Foundation Logo permanently embedded, corporate colors, and specific features upon request.',
                price: 'Contact Us'
            },
            contact_button: 'Order via WhatsApp',
            note_title: 'Note:',
            note_content: 'This Web App version remains Free & Open Source forever. The services above are optional add-ons for those needing hardware convenience or specific customization.'
        },
        guide: {
            title: 'Settings Guide',
            intro: 'Here is an explanation of each available setting to help you customize the application according to your needs.',
            general: {
                title: 'General Settings',
                content: `<ul>
<li><strong>Mosque Name:</strong> The name displayed on the main screen.</li>
<li><strong>Language:</strong> Changes the application's interface language.</li>
<li><strong>City:</strong> Determines the prayer time calculations (Online Mode). The app will fetch data from the internet based on this city.</li>
<li><strong>Remote Control:</strong> Scan the QR code to pair your smartphone and use it as a remote control for the display.</li>
<li><strong>Offline Assets:</strong> Download necessary files to ensure the app works perfectly without an internet connection.</li>
<li><strong>Data Management:</strong> You can export all current settings into a <code>.json</code> file as a backup or to move them to another device. Use import to restore from that file.</li>
</ul>`
            },
            calculation: {
                title: 'Calculation Settings',
                content: `<ul>
<li><strong>Source:</strong> Choose 'Online (API)' to fetch times using the city name, or 'Offline (Calculated)' to calculate internally using coordinates.</li>
<li><strong>Coordinates:</strong> Latitude and Longitude are required for offline calculation. You can detect them automatically.</li>
<li><strong>Calculation Method:</strong> Choose the institution for prayer time calculation (e.g., Ministry of Religious Affairs of Indonesia). Select 'Custom' to set your own Fajr and Isha angles.</li>
<li><strong>Madhab:</strong> Affects the Asr prayer time calculation. 'Standard' is for Shafii, Maliki, Hanbali, while 'Hanafi' has a later time.</li>
<li><strong>Time Corrections:</strong> Manually add or subtract minutes for each prayer time if you find a discrepancy with your local mosque.</li>
<li><strong>Iqamah Delay:</strong> Sets the countdown duration from the adhan to the iqamah for each prayer.</li>
<li><strong>Hijri Date Adjustment:</strong> Manually add or subtract days to the Hijri date to match local moon sighting.</li>
</ul>`
            },
            display: {
                title: 'Display Settings',
                content: `<ul>
<li><strong>Theme Presets:</strong> Quickly apply a pre-configured look (colors, wallpaper, font).</li>
<li><strong>Theme:</strong> Choose between a dark or light appearance.</li>
<li><strong>Orientation Mode:</strong> 'Landscape' is suitable for wide screens (monitors), 'Portrait' is for tall screens. This affects the layout.</li>
<li><strong>Display Layout Template:</strong> Select the main screen appearance. 'Focus Clock' is large and clear, 'Information Dashboard' shows various info, and 'Minimalist' is simple.</li>
<li><strong>Power Saving (Sleep Mode):</strong> Automatically turns the screen black during specified hours (e.g., 10 PM to 3 AM) to save electricity and prevent burn-in.</li>
<li><strong>Enable Dim Screen:</strong> If enabled, the screen will go black during the prayer time (after the initial 'Establish the Prayer' message) to reduce distractions.</li>
<li><strong>Accent Color:</strong> The primary color used for highlights, buttons, and the next prayer time marker.</li>
<li><strong>Wallpaper:</strong> Set the background for the main screen. You can use an image via URL, upload your own image, or choose 'Solid Color' to select a simple matte color.</li>
<li><strong>Contextual Wallpaper:</strong> If enabled, the wallpaper will change automatically based on the current prayer time period (e.g., a different image for Fajr, Dhuhr, etc.).</li>
<li><strong>Running Text:</strong> Display a moving text at the bottom of the screen. 'Custom' mode uses text you write, while 'Themed' mode randomly selects from Quranic verses or hadiths.</li>
</ul>`
            },
            mosqueMode: {
                title: 'Usage as a Digital Mosque Clock',
                content: `<p>This application is designed to function as a full-screen digital clock in a mosque. Here are the practical steps to set it up:</p>
<ol>
<li><strong>Device & Connection:</strong> Connect a computer device (like a Mini PC, Intel NUC, or Raspberry Pi) to a large TV screen or projector in your mosque using an HDMI cable.</li>
<li><strong>Open in Browser:</strong> Open the Waqti application in a web browser on that device (e.g., Google Chrome or Firefox).</li>
<li><strong>Fullscreen Mode:</strong> Press the <code>F11</code> key on your keyboard to make the browser enter fullscreen mode, hiding the address bar and tabs. Press <code>F11</code> again to exit.</li>
<li><strong>Choose the Best Layout:</strong> In the Settings > Display menu, select the 'Layout Template' that is most suitable for remote viewing. <strong>'Focus Clock'</strong> is highly recommended for maximum readability, or <strong>'Information Dashboard'</strong> if you want to display schedules and financial info.</li>
<li><strong>Instal Aplikasi (PWA) & Download Assets:</strong> For easy access and offline reliability, install this application onto the device. Also, go to Settings > General and click "Download Assets" to ensure all images and sounds are saved locally.</li>
<li><strong>Remote Control:</strong> Use your phone to scan the QR code in Settings > Remote Control to manage slides or stop alarms without touching the TV.</li>
</ol>`
            },
            alarm: {
                title: 'Alarm & Dhikr Settings',
                content: `<ul>
<li><strong>Alarms:</strong> Enable alarms that will sound when it is time for Adhan and Iqamah. You can use the default sound, a URL, or upload your own audio file.</li>
<li><strong>Jum'ah Mode:</strong> Special settings for Fridays. You can set the Jum'ah time to follow Dhuhr or a manual time. The 'Khutbah Display Duration' replaces the iqamah countdown on Fridays.</li>
<li><strong>Display Durations:</strong> Set how long the 'Prayer in Progress' screen is shown for each prayer and the total duration for the entire dhikr sequence.</li>
<li><strong>Dhikr List:</strong> Enable, disable, add, remove, and reorder the list of dhikr that appear after the prayer is completed.</li>
</ul>`
            },
            slides: {
                title: 'Slide Settings',
                content: `<p>This feature allows you to display various informational slides that will alternate with the main clock display.</p>
<ul>
<li><strong>Add Slides:</strong> Click the buttons to add different types of slides: Text, Image, Schedule, Finance, or Officer.</li>
<li><strong>Slide Settings:</strong> For each slide, you can enable/disable it, set its display duration, and choose if it should only appear on Fridays.</li>
<li><strong>Content Types:</strong>
<ul>
<li>- <strong>Text:</strong> Display a title and content with simple formatting.</li>
<li>- <strong>Image:</strong> Display an image from a URL or an uploaded file. Supports large files with optimized loading.</li>
<li>- <strong>Schedule:</strong> Display a list of mosque activities/studies.</li>
<li>- <strong>Finance:</strong> Display a financial report summary, including income, expenses, and final balance, complete with a chart.</li>
<li>- <strong>Officers:</strong> Display the names of the Khotib, Imam, and Muadzin for Jum'ah prayers.</li>
</ul>
</li>
</ul>`
            }
        },
        contact: {
            title: 'Contact Us',
            description: 'Have questions, feedback, or suggestions? Please fill out the form below to send us an email. We appreciate your input!',
            name: 'Name',
            email: 'Email (Optional)',
            subject: 'Subject',
            message: 'Message',
            send: 'Send Message'
        },
        developedBy: 'This application was developed by:',
        license: 'License:',
        dataSource: 'Prayer time data provided by',
    },
    defaults: {
        khutbah: {
            title: 'Maintain Calm',
            tagline: "The Jum'ah Khutbah is in progress"
        },
        fridaySlides: [
            { title: "Sunnah: Read Surah Al-Kahf", content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Whoever reads Surah Al-Kahf on the day of Jum’at, will have a light that will shine from him from one Friday to the next."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(Narrated by al-Haakim and al-Bayhaqi)</strong></p>` },
            { title: "Sunnah: Prepare Yourself", content: `<p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">Bathe, Wear Your Best Clothes, & Use Perfume</strong></p><p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Whoever takes a bath on Friday, purifies himself as much as he can... his sins between that Friday and the next will be forgiven."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(Narrated by Bukhari)</strong></p>` },
            { title: "Virtue: Hasten to the Mosque", content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">Coming in the first hour is like sacrificing a camel, the second hour like a cow, the third like a ram, the fourth like a chicken, and the fifth like an egg.</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(Agreed upon)</strong></p>` },
            { title: "Virtue: Increase Salawat", content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"Increase your prayers upon me on Friday. Whoever sends one prayer upon me, Allah will send ten prayers upon him."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">(Narrated by Al-Bayhaqi)</strong></p>` },
            { title: "An Auspicious Time for Dua", content: `<p class="ql-align-center"><em style="color: rgb(255, 255, 255);">"On Friday there is a time, when if a Muslim slave stands to pray and asks Allah for something, He will give it to him."</em></p><p class="ql-align-center"><strong style="color: rgb(255, 255, 255);">That time is after Asr until Maghrib. (Narrated by Bukhari & Muslim)</strong></p>` }
        ],
        calculationMethods: [
            { id: 0, name: 'Shia Ithna-Ansari' },
            { id: 1, name: 'University of Islamic Sciences, Karachi' },
            { id: 2, name: 'Islamic Society of North America (ISNA)' },
            { id: 3, name: 'Muslim World League (MWL)' },
            { id: 4, name: 'Umm Al-Qura University, Makkah' },
            { id: 5, name: 'Egyptian General Authority of Survey' },
            { id: 7, name: 'Institute of Geophysics, University of Tehran' },
            { id: 8, name: 'Gulf Region' },
            { id: 9, name: 'Kuwait' },
            { id: 10, name: 'Qatar' },
            { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore' },
            { id: 12, name: 'Union of Islamic Organisations of France' },
            { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
            { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
            { id: 15, name: 'Moonsighting Committee Worldwide' },
            { id: 16, name: 'Dubai (unofficial)' },
            { id: 17, name: 'Ministry of Religious Affairs of Indonesia' },
            { id: 99, name: 'Custom' }
        ],
        madhabOptions: [
            { id: 0, name: 'Standard (Shafii, Maliki, Hanbali)' },
            { id: 1, name: 'Hanafi' }
        ],
        highLatitudeRules: [
            { id: 'auto', name: 'Automatic (Default)' },
            { id: 'MiddleOfTheNight', name: 'Middle of the Night' },
            { id: 'OneSeventh', name: 'One Seventh of the Night' },
            { id: 'AngleBased', name: 'Angle Based (Twilight)' }
        ],
        themeOptions: [
            { id: 'quran-tauhid', name: 'Tawhid & Aqidah', category: 'quran' },
            { id: 'quran-akhlaq', name: 'Akhlaq (Manners)', category: 'quran' },
            { id: 'quran-fikih', name: 'Fiqh', category: 'quran' },
            { id: 'quran-random', name: 'Random', category: 'quran' },
            { id: 'hadith-tauhid', name: 'Tawhid & Aqidah', category: 'hadith' },
            { id: 'hadith-akhlaq', name: 'Akhlaq (Manners)', category: 'hadith' },
            { id: 'hadith-fikih', name: 'Fiqh', category: 'hadith' },
            { id: 'hadith-random', name: 'Random', category: 'hadith' },
        ],
    }
};
