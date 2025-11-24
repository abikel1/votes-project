// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)        // מזהה שפה מהדפדפן / localStorage
    .use(initReactI18next)       // מחבר ל-React
    .init({
        fallbackLng: 'he',         // אם אין תרגום – ברירת מחדל עברית
        supportedLngs: ['he', 'en'],
        debug: false,

        detection: {
            order: ['localStorage', 'navigator'], // קודם מה-localStorage, אח"כ מהדפדפן
            caches: ['localStorage'],
            lookupLocalStorage: 'appLanguage',    // 👈 אותו שם שהיה ב-switcher
        },

        interpolation: {
            escapeValue: false,      // React כבר עושה escape
        },

        resources: {
            he: {
                translation: {
                    // כאן שמים את כל המחרוזות בעברית
                    'app.title': 'בחירות',
                    'nav.home': 'בית',
                    'nav.groups': 'קבוצות',
                    'nav.about': 'אודות',
                    'nav.guide': 'מדריך למשתמש',
                    'nav.logout': 'יציאה',
                    'nav.login': 'התחברות',
                    'group.join': 'בקשת הצטרפות',
                    'group.vote': 'להצבעה בקלפי',
                    'timer.title': 'זמן עד סיום',
                    'common.yes': 'כן',
                    'common.no': 'לא',
                    'timer.days': 'ימים',
                    'timer.hours': 'שעות',
                    'timer.minutes': 'דקות',
                    'timer.seconds': 'שניות',
                    // === mail form ===
                    'mail.sendTitle': 'שליחת מייל',
                    'mail.toPlaceholder': 'נמען (to)',
                    'mail.subjectPlaceholder': 'נושא (subject)',
                    'mail.textPlaceholder': 'טקסט (text)',
                    'mail.htmlPlaceholder': 'HTML (אופציונלי)',
                    'mail.templateLabel': 'Template (אופציונלי)',
                    'mail.templatePlaceholder': 'למשל resetPassword',
                    'mail.varsJsonPlaceholder': 'Vars JSON (למשל {"link":"https://..."})',
                    'mail.sendButton': 'שליחה',
                    'mail.sentOk': 'נשלח ✓',
                    'mail.etherealNote': '(Ethereal)',
                    'mail.previewLink': 'פתח תצוגה מקדימה',
                    // === footer ===
                    'footer.title': 'מערכת ההצבעות',
                    'footer.description.line1': 'פלטפורמה פשוטה לניהול הצבעות וקבוצות.',
                    'footer.description.line2': 'יצירת קבוצות, הוספת מועמדים, שליחת קישורי הצבעה ועוד.',
                    'footer.tagline': 'ניהול הצבעות מסודר, מאובטח וקל לשימוש – במקום אחד.',

                    'footer.usefulLinksTitle': 'קישורים שימושיים',
                    'footer.link.home': 'עמוד הבית',
                    'footer.link.groups': 'הקבוצות',
                    'footer.link.guide': 'מדריך למשתמש',
                    'footer.link.about': 'אודות',
                    'footer.link.contact': 'צור קשר',

                    'footer.followUs': 'עקוב אחרינו',

                    'footer.bottomText': 'מערכת ההצבעות · כל הזכויות שמורות',
                    // === voting page ===
                    'voting.pageTitle': 'דף הצבעה',
                    'voting.loadingGroup': 'טוען נתוני קבוצה...',
                    'voting.groupNotFound': 'הקבוצה לא נמצאה.',
                    'voting.backToGroupsList': 'חזרה לרשימת הקבוצות',

                    'voting.notMemberText':
                        'נראה שאינך מחובר/ת לקבוצה {{groupName}}, ולכן לא ניתן להצביע בה.',
                    'voting.notMemberHelp':
                        'כדי להשתתף בהצבעה יש להצטרף לקבוצה ולהמתין לאישור מנהל/ת הקבוצה.',
                    'voting.goToGroupPage': 'מעבר לדף הקבוצה',
                    'voting.goToAllGroups': 'לרשימת כל הקבוצות',

                    'voting.loadingCandidates': 'טוען מועמדים...',
                    'voting.noCandidates': 'אין מועמדים בקבוצה',

                    'voting.backToGroupDetails': 'חזור לפרטי הקבוצה',

                    'voting.dragSlipHere': 'גרור פתק לכאן',
                    'voting.voteSuccess': 'הצבעתך נקלטה בהצלחה',
                    'voting.dragEnvelopeToBallot': 'גרור מעטפה לקלפי',

                    'voting.selectForVote': 'בחר להצבעה',
                    'voting.noName': 'ללא שם',

                    'voting.voteErrorPrefix': 'שגיאה בהצבעה: ',
                    // === address autocomplete ===
                    'address.cityPlaceholder': '*עיר',
                    'address.streetPlaceholder': '*כתובת / רחוב',
                    'address.selectCityFirst': 'בחרי עיר מהרשימה',

                },
            },
            en: {
                translation: {
                    'app.title': 'Elections',
                    'nav.home': 'Home',
                    'nav.groups': 'Groups',
                    'nav.guide': 'User Guide',
                    'nav.about': 'About',
                    'nav.login': 'Login',
                    'nav.logout': 'Logout',
                    'group.join': 'Request to Join',
                    'group.vote': 'Go to Vote',
                    'timer.title': 'Time Left',
                    'common.yes': 'Yes',
                    'common.no': 'No',
                    'timer.days': 'Days',
                    'timer.hours': 'Hours',
                    'timer.minutes': 'Minutes',
                    'timer.seconds': 'Seconds',
                    // === mail form ===
                    'mail.sendTitle': 'Send Email',
                    'mail.toPlaceholder': 'Recipient (to)',
                    'mail.subjectPlaceholder': 'Subject',
                    'mail.textPlaceholder': 'Text body',
                    'mail.htmlPlaceholder': 'HTML (optional)',
                    'mail.templateLabel': 'Template (optional)',
                    'mail.templatePlaceholder': 'e.g. resetPassword',
                    'mail.varsJsonPlaceholder': 'Vars JSON (e.g. {"link":"https://..."})',
                    'mail.sendButton': 'Send',
                    'mail.sentOk': 'Sent ✓',
                    'mail.etherealNote': '(Ethereal)',
                    'mail.previewLink': 'Open preview',
                    // === footer ===
                    'footer.title': 'Voting System',
                    'footer.description.line1': 'A simple platform for managing votes and groups.',
                    'footer.description.line2': 'Create groups, add candidates, send voting links and more.',
                    'footer.tagline': 'Organized, secure and easy-to-use voting – all in one place.',

                    'footer.usefulLinksTitle': 'Useful Links',
                    'footer.link.home': 'Home',
                    'footer.link.groups': 'Groups',
                    'footer.link.guide': 'User Guide',
                    'footer.link.about': 'About',
                    'footer.link.contact': 'Contact',

                    'footer.followUs': 'Follow Us',

                    'footer.bottomText': 'Voting System · All rights reserved',
                    // === voting page ===
                    'voting.pageTitle': 'Voting Page',
                    'voting.loadingGroup': 'Loading group data...',
                    'voting.groupNotFound': 'Group not found.',
                    'voting.backToGroupsList': 'Back to groups list',

                    'voting.notMemberText':
                        'It seems you are not a member of the group {{groupName}}, so you cannot vote in it.',
                    'voting.notMemberHelp':
                        'To participate in the vote, please join the group and wait for the admin approval.',
                    'voting.goToGroupPage': 'Go to group page',
                    'voting.goToAllGroups': 'Back to all groups',

                    'voting.loadingCandidates': 'Loading candidates...',
                    'voting.noCandidates': 'There are no candidates in this group.',

                    'voting.backToGroupDetails': 'Back to group details',

                    'voting.dragSlipHere': 'Drag a slip here',
                    'voting.voteSuccess': 'Your vote has been recorded successfully',
                    'voting.dragEnvelopeToBallot': 'Drag the envelope to the ballot box',

                    'voting.selectForVote': 'Select for vote',
                    'voting.noName': 'No name',

                    'voting.voteErrorPrefix': 'Voting error: ',
                    // === address autocomplete ===
                    'address.cityPlaceholder': '*City',
                    'address.streetPlaceholder': '*Address / Street',
                    'address.selectCityFirst': 'Please select a city first',

                },
            },
        },
    });

export default i18n;
