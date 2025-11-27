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
                    // === about page ===
                    'about.title': 'אודות',
                    'about.subtitle': 'הכירו את הפלטפורמה שלנו – פשוטה, יעילה ובטוחה',

                    'about.cards.main.whatWeDo.title': 'מה אנחנו עושים',
                    'about.cards.main.whatWeDo.desc':
                        'פלטפורמה נוחה ונגישה לניהול קבוצות והצבעות, המאפשרת לכל המשתמשים לשלוט בתהליך בצורה פשוטה וברורה.',

                    'about.cards.main.success.title': 'הצלחות שלנו',
                    'about.cards.main.success.desc':
                        'אלפי משתמשים מרוצים משתמשים במערכת מדי יום, עם חוויית משתמש חלקה ומהירה.',

                    'about.cards.main.saving.title': 'חיסכון במשאבים',
                    'about.cards.main.saving.desc':
                        'חוסכים זמן, כסף וכוח אדם בניהול הקבוצה וההצבעות, תוך שמירה על סדר ויעילות.',

                    'about.highlight.title': 'מדוע כדאי לעבוד איתנו?',
                    'about.highlight.desc':
                        'אנחנו מקפידים על פשטות, יעילות וביטחון. הפלטפורמה שלנו מספקת פתרון מלא לניהול קבוצות והצבעות, חוסכת זמן ומשאבים, ומביאה את המשתמשים לתוצאה מיטבית.',

                    'about.cards.mini.simpleManagement.title': 'ניהול פשוט',
                    'about.cards.mini.simpleManagement.desc':
                        'כל הקבוצות וההצבעות במקום אחד, עם ממשק ידידותי.',

                    'about.cards.mini.security.title': 'אבטחה',
                    'about.cards.mini.security.desc':
                        'הגנה מלאה על מידע אישי והצבעות המשתמשים.',

                    'about.cards.mini.support.title': 'תמיכה זמינה',
                    'about.cards.mini.support.desc':
                        'צוות מקצועי זמין בכל עת לעזרה ולפתרון בעיות.',

                    'about.cards.mini.customization.title': 'התאמה אישית',
                    'about.cards.mini.customization.desc':
                        'אפשרויות התאמה אישית של קבוצות ותצוגות לפי צרכי המשתמש.',
                    // === contact page ===
                    'contact.title': 'צור קשר',

                    'contact.fullNameLabel': 'שם מלא',
                    'contact.fullNamePlaceholder': 'איך לפנות אלייך?',
                    'contact.emailLabel': 'אימייל',
                    'contact.emailPlaceholder': 'name@example.com',
                    'contact.phoneLabel': 'טלפון (אופציונלי)',
                    'contact.phonePlaceholder': '050-0000000',
                    'contact.messageLabel': 'הודעה',
                    'contact.messagePlaceholder': 'איך אפשר לעזור?',

                    'contact.errors.fullNameRequired': 'נא למלא שם מלא',
                    'contact.errors.emailRequired': 'נא למלא אימייל',
                    'contact.errors.emailInvalid': 'פורמט אימייל אינו תקין',
                    'contact.errors.messageRequired': 'נא לכתוב הודעה',

                    'contact.button.loading': 'שולח/ת…',
                    'contact.button.submit': 'שלח/י הודעה',

                    'contact.successText': 'ההודעה נשלחה, נחזור אלייך בהקדם 🙂',

                    'contact.toast.success': 'ההודעה נשלחה בהצלחה!',
                    'contact.toast.error': 'אירעה שגיאה בשליחה, נסו שוב',

                    'contact.mailSubject': 'פנייה חדשה מהאתר – {{name}}',
                    'contact.mailText.nameLabel': 'שם',
                    'contact.mailText.emailLabel': 'דוא"ל',
                    'contact.mailText.phoneLabel': 'טלפון',
                    'contact.mailText.messageLabel': 'הודעה',
                    // === groups create page ===
                    'groups.create.title': 'יצירת קבוצה חדשה',

                    'groups.create.labels.name': 'שם קבוצה',
                    'groups.create.labels.description': 'תיאור',
                    'groups.create.labels.endDate': 'תאריך סיום',
                    'groups.create.labels.candidateEndDate': 'תאריך סיום הגשת מועמדות',
                    'groups.create.labels.maxWinners': 'מקסימום זוכים',
                    'groups.create.labels.status': 'מצב קבוצה',

                    'groups.create.status.locked': 'נעולה',
                    'groups.create.status.open': 'פתוחה',

                    'groups.create.errors.nameRequired': 'שם קבוצה חובה',
                    'groups.create.errors.descriptionRequired': 'תיאור חובה',
                    'groups.create.errors.endDateRequired': 'תאריך סיום חובה',
                    'groups.create.errors.candidateEndDateRequired': 'תאריך סיום הגשת מועמדות חובה',
                    'groups.create.errors.candidateAfterGroup':
                        'תאריך סיום הגשת מועמדות לא יכול להיות אחרי תאריך סיום הקבוצה',

                    'groups.create.buttons.saving': 'שומר…',
                    'groups.create.buttons.create': 'צור קבוצה',
                    'groups.create.buttons.cancel': 'ביטול',

                    'groups.create.toast.created': 'הקבוצה נוצרה בהצלחה!',
                    'groups.create.toast.linkCopied': 'הקישור הועתק',

                    'groups.create.modal.title': 'הקבוצה נוצרה ✔',
                    'groups.create.modal.lockedInfo':
                        'כדי לבקש להצטרף לקבוצה נעולה יש להתחבר — לאחר התחברות נשלחת בקשת הצטרפות אוטומטית.',
                    'groups.create.modal.shareLinkLabel': 'קישור לשיתוף:',
                    'groups.create.modal.shareCopy': 'העתק',
                    'groups.create.modal.shareCopied': 'הועתק ✓',
                    'groups.create.modal.finish': 'סיום',
                    // === groups list page ===
                    'groups.list.loading': 'טוען קבוצות...',

                    'groups.list.empty.noGroups': 'אין קבוצות עדיין.',
                    'groups.list.empty.createButton': '+ יצירת קבוצה חדשה',
                    'groups.list.empty.loginHint': 'כדי ליצור קבוצה יש להתחבר תחילה.',

                    'groups.list.searchPlaceholder': 'חיפוש קבוצות...',

                    'groups.list.filters.title': 'סינון',
                    'groups.list.filters.alt': 'סינון',
                    'groups.list.filters.all': 'כל הקבוצות',
                    'groups.list.filters.open': 'קבוצות פתוחות',
                    'groups.list.filters.locked': 'קבוצות נעולות',
                    'groups.list.filters.joined': 'קבוצות שאני מחובר/ת',
                    'groups.list.filters.owned': 'קבוצות שאני מנהל/ת',
                    'groups.list.filters.expired': 'קבוצות שהסתיימו',
                    'groups.list.filters.candidateOpen': 'הגשת מועמדות פתוחה',

                    'groups.list.sort.title': 'מיון',
                    'groups.list.sort.alt': 'מיון',
                    'groups.list.sort.creationDate': 'תאריך יצירה (חדש קודם)',
                    'groups.list.sort.endDate': 'תאריך סיום (מוקדם קודם)',
                    'groups.list.sort.name': 'שם קבוצה (א-ת)',

                    'groups.list.card.lockedAlt': 'נעול',
                    'groups.list.card.lockedTitle': 'קבוצה נעולה',
                    'groups.list.card.memberTooltip': 'מחובר/ת',
                    'groups.list.card.notMemberTooltip': 'לא מחובר/ת',
                    'groups.list.card.settingsTitle': 'הגדרות קבוצה',
                    'groups.list.card.settingsAlt': 'הגדרות',

                    'groups.list.card.ownerLabel': 'מנהל/ת:',
                    'groups.list.card.ownerUnknown': 'לא ידוע',

                    'groups.list.card.expiredText': 'תקופת ההצבעה הסתיימה — לצפייה בתוצאות',
                    'groups.list.card.endDateLabel': 'תאריך סיום:',

                    'groups.list.card.status.member': 'מחובר/ת',
                    'groups.list.card.rejectedNotice':
                        'בקשתך נדחתה על ידי מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.',
                    'groups.list.card.requestAgain': 'שלח/י בקשה שוב',
                    'groups.list.card.pendingButton': 'בהמתנה...',
                    'groups.list.card.pendingHint':
                        'בקשתך נשלחה וממתינה לאישור מנהל/ת',
                    'groups.list.card.removedNotice':
                        'הוסרת מהקבוצה על ידי מנהל/ת. ניתן לשלוח בקשת הצטרפות חדשה.',
                    'groups.list.card.requestJoin': 'בקשת הצטרפות',

                    'groups.list.pagination.prev': 'הקודם',
                    'groups.list.pagination.next': 'הבא',

                    'groups.list.fab.title': 'יצירת קבוצה חדשה',

                    'groups.list.toasts.loginToCreate': 'כדי ליצור קבוצה יש להתחבר תחילה.',
                    'groups.list.toasts.loginToRequestJoin':
                        'כדי לשלוח בקשת הצטרפות יש להתחבר תחילה.',
                    'groups.list.toasts.lockedLoginToJoin':
                        'הקבוצה נעולה. כדי לבקש הצטרפות – יש להתחבר',
                    'groups.list.toasts.pendingStill':
                        'עדיין אינך מחובר/ת לקבוצה. הבקשה בהמתנה לאישור מנהל/ת.',
                    'groups.list.toasts.rejected':
                        'בקשתך נדחתה על ידי מנהל/ת הקבוצה. ניתן לשלוח בקשה חדשה.',
                    // === home page ===
                    'home.loading': 'טוען קבוצות...',

                    'home.error.title': 'שגיאה',
                    'home.error.retry': 'נסה שוב',

                    'home.hero.title': 'מערכת הצבעה דיגיטלית',
                    'home.hero.subtitle': 'קולך נשמע • ההחלטה שלנו',
                    'home.hero.cta': 'יצירת חדר הצבעות חדש',
                    'home.hero.scrollDown': 'גלול למטה',

                    'home.time.noEndDate': 'ללא מועד סיום',
                    'home.time.ended': 'הסתיים',
                    'home.time.days': 'ימים',
                    'home.time.hours': 'שעות',
                    'home.time.minutes': 'דקות',

                    'home.active.title': 'הצבעות פעילות',
                    'home.active.empty': 'אין הצבעות פעילות כרגע',
                    // אם תרצי להחזיר את כפתור ההצבעה:
                    'home.active.voteNow': 'הצבע עכשיו',

                    'home.closed.title': 'תוצאות אחרונות',
                    'home.closed.viewResults': 'צפה בתוצאות',
                    'home.closed.empty': 'אין תוצאות אחרונות',

                    'home.emptyState.title': 'אין קבוצות זמינות כרגע',
                    'home.emptyState.subtitle': 'כשיהיו הצבעות פעילות, הן יופיעו כאן',
                    'home.emptyState.create': 'צור קבוצה חדשה',

                    'home.actions.allGroups': 'כל חדרי ההצבעה',
                    'home.actions.myProfile': 'הפרופיל שלי',
                    'home.actions.createGroup': 'יצירת קבוצה',

                    'home.common.noName': 'ללא שם',

                    'home.toasts.loginToCreate': 'כדי ליצור קבוצה יש להתחבר תחילה.',
                    // === join group page ===
                    'join.loading': 'טוען…',

                    'join.errors.groupNotFound': 'קבוצה לא נמצאה',
                    'join.errors.sendRequestFailed': 'שליחת בקשת ההצטרפות נכשלה',

                    'join.hints.alreadyPending':
                        'כבר קיימת בקשת הצטרפות ממתינה לאישור.',
                    'join.hints.alreadyMember': 'את/ה כבר חבר/ה בקבוצה.',
                    'join.hints.groupOpen': 'הקבוצה פתוחה — אין צורך בבקשת הצטרפות.',

                    'join.loginModal.title':
                        'בקשת הצטרפות לקבוצה {{groupName, default:(קבוצה נעולה)}}',
                    'join.loginModal.text':
                        'כדי לבקש להצטרף לקבוצה נעולה יש להתחבר לחשבון.',

                    'join.successModal.title': 'הפניה בוצעה ✔',
                    'join.successModal.defaultHint':
                        'הבקשה נשלחה וממתינה לאישור מנהל/ת הקבוצה.',

                    // אפשר להשתמש בהם גם במקומות אחרים
                    'common.cancel': 'ביטול',
                    'common.close': 'סגור',
                    'auth.login': 'התחברות',
                    'auth.forgot.title': 'שכחת סיסמה?',
                    'auth.forgot.subtitle': 'אל דאגה, נשלח לך קישור לאיפוס',
                    'auth.forgot.emailLabel': 'אימייל',
                    'auth.forgot.emailPlaceholder': 'הכנס את כתובת האימייל שלך',
                    'auth.forgot.submit': 'שלח קישור איפוס',
                    'auth.forgot.submitting': 'שולח...',
                    'auth.forgot.backToLogin': 'חזרה להתחברות',
                    // Login page
                    'auth.login.title': 'התחברות',
                    'auth.login.subtitle': 'ברוכים השבים! נעים לראות אתכם שוב',

                    'auth.login.emailLabel': 'אימייל',
                    'auth.login.emailPlaceholder': 'example@gmail.com',
                    'auth.login.passwordLabel': 'סיסמה',
                    'auth.login.passwordPlaceholder': 'הכנס סיסמה',

                    'auth.login.emailRequired': 'אימייל נדרש',
                    'auth.login.passwordRequired': 'סיסמה נדרשת',

                    'auth.login.forgotLink': 'שכחת סיסמה?',
                    'auth.login.button': 'התחבר',
                    'auth.login.submitting': 'מתחבר...',

                    'auth.login.expired': 'פג תוקף ההתחברות, יש להתחבר שוב',

                    'auth.login.showPassword': 'הצג סיסמה',
                    'auth.login.hidePassword': 'הסתר סיסמה',

                    'auth.login.google': 'המשך עם Google',
                    'auth.login.noAccount': 'עדיין לא נרשמת? ',
                    'auth.login.registerNow': 'הירשם עכשיו',

                    // משותפים
                    'common.or': 'או',
                    'common.genericError': 'אירעה שגיאה',
                    // Reset password page
                    'auth.reset.title': 'איפוס סיסמה',
                    'auth.reset.subtitle': 'הכנס סיסמה חדשה לחשבון שלך',

                    'auth.reset.newPasswordLabel': 'סיסמה חדשה*',
                    'auth.reset.newPasswordPlaceholder': 'לפחות 6 תווים',
                    'auth.reset.confirmPasswordLabel': 'אימות סיסמה*',
                    'auth.reset.confirmPasswordPlaceholder': 'הכנס את הסיסמה שוב',

                    'auth.reset.passwordTooShort': 'סיסמה חייבת להיות באורך של לפחות 6 תווים',
                    'auth.reset.passwordsMismatch': 'הסיסמאות אינן תואמות',

                    'auth.reset.button': 'איפוס סיסמה',
                    'auth.reset.submitting': 'מאפס סיסמה...',

                    'auth.reset.showPassword': 'הצג סיסמה',
                    'auth.reset.hidePassword': 'הסתר סיסמה',
                    // === profile page ===
                    'profile.title': 'הפרופיל שלי',
                    'profile.loading': 'טוען פרופיל...',
                    'profile.firstName': 'שם פרטי',
                    'profile.lastName': 'שם משפחה',
                    'profile.email': 'אימייל',
                    'profile.phone': 'טלפון',
                    'profile.address': 'כתובת',
                    'profile.editUser': 'עריכת משתמש',
                    'profile.changePassword': 'שינוי סיסמה',
                    'profile.groupsOwned': 'קבוצות שאני מנהל/ת',
                    'profile.groupsJoined': 'קבוצות שאני מחובר/ת',
                    'profile.noGroups': 'אין קבוצות',
                    'profile.viewGroup': 'לפרטי הקבוצה',
                    'profile.passwordUpdated': 'הסיסמה עודכנה בהצלחה',
                    'profile.currentPassword': 'סיסמה נוכחית',
                    'profile.newPassword': 'סיסמה חדשה',
                    'profile.confirmPassword': 'אימות סיסמה',
                    'profile.passwordErrors.currentRequired': 'יש להזין סיסמה נוכחית',
                    'profile.passwordErrors.newRequired': 'יש להזין סיסמה חדשה',
                    'profile.passwordErrors.mismatch': 'הסיסמאות אינן תואמות',

                    // משותף – השתמשת בזה בקומפוננטה
                    'common.save': 'שמור',
                    // === register page ===
                    'auth.register.title': 'הרשמה',
                    'auth.register.subtitle': 'צור חשבון חדש והצטרף אלינו',
                    'auth.register.successRedirect': 'נרשמת בהצלחה! מעביר אותך...',

                    'auth.register.firstNameLabel': 'שם פרטי*',
                    'auth.register.firstNamePlaceholder': 'הכנס שם פרטי',
                    'auth.register.lastNameLabel': 'שם משפחה*',
                    'auth.register.lastNamePlaceholder': 'הכנס שם משפחה',
                    'auth.register.emailLabel': 'אימייל*',
                    'auth.register.emailPlaceholder': 'example@email.com',
                    'auth.register.phoneLabel': 'טלפון*',
                    'auth.register.phonePlaceholder': '050-1234567',
                    'auth.register.cityLabel': 'עיר*',
                    'auth.register.cityPlaceholder': 'עיר',
                    'auth.register.streetLabel': 'רחוב*',
                    'auth.register.streetPlaceholder': 'רחוב',
                    'auth.register.passwordLabel': 'סיסמה*',
                    'auth.register.passwordPlaceholder': 'לפחות 6 תווים',
                    'auth.register.confirmPasswordLabel': 'אימות סיסמה*',
                    'auth.register.confirmPasswordPlaceholder': 'הכנס את הסיסמה שוב',

                    'auth.register.submitting': 'יוצר חשבון...',
                    'auth.register.submit': 'צור חשבון',

                    'auth.register.alreadyHaveAccount': 'כבר יש לך חשבון? ',
                    'auth.register.loginLink': 'התחבר',

                    'auth.register.errors.firstNameTooShort': 'שם פרטי חייב לפחות 2 תווים',
                    'auth.register.errors.lastNameTooShort': 'שם משפחה חייב לפחות 2 תווים',
                    'auth.register.errors.invalidEmail': 'אימייל לא תקין',
                    'auth.register.errors.passwordTooShort': 'סיסמה חייבת לפחות 6 תווים',
                    'auth.register.errors.invalidPhone': 'טלפון לא תקין',
                    'auth.register.errors.cityRequired': 'עיר חובה',
                    'auth.register.errors.addressRequired': 'כתובת חובה',
                    'auth.register.errors.passwordsMismatch': 'הסיסמאות אינן תואמות',
                    'auth.register.errors.emailExists': 'מייל זה קיים במערכת',
                    // === User Guide ===
                    'guide.title': 'מדריך למשתמש',
                    'guide.subtitle': 'כל מה שאתה צריך לדעת כדי להשתמש באתר בצורה נוחה ובטוחה',

                    'guide.steps.registerTitle': 'הרשמה והתחברות',
                    'guide.steps.registerDesc': 'יצירת חשבון חדש או התחברות לחשבון קיים מאפשרת לך להשתמש בכל הפיצ\'רים של האתר.',

                    'guide.steps.groupsTitle': 'ניהול קבוצות',
                    'guide.steps.groupsDesc': 'צור קבוצות, נהל חברים וקבע הצבעות בקלות וביעילות.',

                    'guide.steps.votesTitle': 'הצבעות',
                    'guide.steps.votesDesc': 'הצבע על נושאים, עקוב אחרי תוצאות בזמן אמת, והבן את דעת הקבוצה בצורה ברורה.',

                    'guide.steps.notificationsTitle': 'התראות ומעקב',
                    'guide.steps.notificationsDesc': 'קבל התראות על שינויים, הצבעות חדשות או בקשות להצטרפות.',

                    'guide.highlightTitle': 'טיפ חשוב למשתמש',
                    'guide.highlightDesc': 'כדי ליהנות מהמערכת בצורה מיטבית, הקפד לבדוק את כל ההגדרות של הקבוצה שלך, נהל את החברים בצורה מסודרת, ועקוב אחרי ההתראות בזמן אמת.',

                    'guide.tips.shortcutsTitle': 'קיצורי דרך',
                    'guide.tips.shortcutsDesc': 'למד את הקיצורים שלנו לחיסכון בזמן ובקלות שימוש.',

                    'guide.tips.mobileTitle': 'שימוש בטלפון',
                    'guide.tips.mobileDesc': 'הממשק מותאם גם למכשירים ניידים ונוח לשימוש מכל מקום.',

                    'guide.tips.privacyTitle': 'שמירה על פרטיות',
                    'guide.tips.privacyDesc': 'המערכת שומרת על המידע האישי שלך והצבעותיך מאובטחות.',

                    'guide.tips.supportTitle': 'תמיכה מקצועית',
                    'guide.tips.supportDesc': 'פנה אלינו בכל שאלה – אנחנו כאן כדי לעזור.',
                    'users.title': 'כל המשתמשים',
                    'users.loading': 'טוען משתמשים...',
                    'users.error': 'שגיאה בטעינת משתמשים: {{error}}',
                    'auth.register.genericError': 'אירעה שגיאה ברישום',

                    // 👇 להוסיף את שני אלה
                    'auth.login.errors.emailNotFound': 'האימייל לא קיים במערכת',
                    'auth.login.errors.invalidPassword': 'סיסמה לא נכונה',

                    // 👇 לעדכן את זה (במקום "אימייל לא קיים במערכת")
                    'auth.serverError': 'אירעה שגיאה בשרת. נסי שוב מאוחר יותר',

                    'auth.profile.loadFailed': 'טעינת הפרופיל נכשלה',

                    'auth.profile.updateFailed': 'עדכון הפרופיל נכשל',

                    'auth.forgot.genericSuccess': 'אם המייל קיים, נשלחו הוראות לאיפוס.',
                    'auth.forgot.genericError': 'הבקשה לאיפוס נכשלה',

                    'auth.reset.genericSuccess': 'הסיסמה עודכנה בהצלחה.',
                    'auth.reset.genericError': 'איפוס הסיסמה נכשל',

                    'auth.changePassword.genericSuccess': 'הסיסמה עודכנה בהצלחה',
                    'auth.changePassword.genericError': 'עדכון הסיסמה נכשל',
                    'candidates.errors.loadFailed': 'טעינת המועמדים נכשלה',
                    'candidates.errors.createFailed': 'יצירת המועמד נכשלה',
                    'candidates.errors.updateFailed': 'עדכון המועמד נכשל',
                    'candidates.errors.deleteFailed': 'מחיקת המועמד נכשלה',
                    'candidates.errors.applyFailed': 'שליחת בקשת המועמדות נכשלה',
                    'candidates.errors.fetchRequestsFailed': 'טעינת בקשות המועמדות נכשלה',
                    'candidates.errors.approveFailed': 'אישור בקשת המועמדות נכשל',
                    'candidates.errors.rejectFailed': 'דחיית בקשת המועמדות נכשלה',
                    'groups.errors.loadAllFailed': 'טעינת הקבוצות נכשלה',
                    'groups.errors.loadOneFailed': 'טעינת הקבוצה נכשלה',
                    'groups.errors.loadWithMembersFailed': 'טעינת הקבוצה וחבריה נכשלה',
                    'groups.errors.createFailed': 'יצירת הקבוצה נכשלה',
                    'groups.errors.updateFailed': 'עדכון הקבוצה נכשל',
                    'groups.errors.loadMyFailed': 'טעינת הקבוצות שלך נכשלה',
                    'groups.errors.removeMemberFailed': 'הסרת המשתתף נכשלה',
                    'groups.errors.deleteFailed': 'מחיקת הקבוצה נכשלה',
                    'join.errors.statusLoadFailed': 'כשל בטעינת סטטוסי ההצטרפות',
                    'join.errors.loadRequestsFailed': 'כשל בטעינת בקשות ההצטרפות',
                    'join.errors.approveFailed': 'כשל באישור בקשה',
                    'join.errors.rejectFailed': 'כשל בדחיית בקשה',
                    'mail.sendSuccess': 'ההודעה נשלחה בהצלחה.',
                    'mail.sendFailed': 'שליחת ההודעה נכשלה.',
                    'users.loadFailed': 'טעינת המשתמשים נכשלה',
                    'users.hydrateFailed': 'טעינת פרטי המשתמשים נכשלה',
                    'votes.errors.notLoggedIn': 'עליך להתחבר לפני ההצבעה',
                    'votes.errors.voteFailed': 'הצבעה נכשלה',
                    'votes.errors.fetchVotersFailed': 'טעינת רשימת המצביעים נכשלה',
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
                    // === about page ===
                    'about.title': 'About',
                    'about.subtitle': 'Get to know our platform – simple, efficient and secure.',

                    'about.cards.main.whatWeDo.title': 'What we do',
                    'about.cards.main.whatWeDo.desc':
                        'A convenient and accessible platform for managing groups and votes, allowing all users to control the process in a simple and clear way.',

                    'about.cards.main.success.title': 'Our success',
                    'about.cards.main.success.desc':
                        'Thousands of satisfied users use the system every day, enjoying a smooth and fast user experience.',

                    'about.cards.main.saving.title': 'Saving resources',
                    'about.cards.main.saving.desc':
                        'Save time, money and manpower when managing groups and votes, while keeping everything organized and efficient.',

                    'about.highlight.title': 'Why work with us?',
                    'about.highlight.desc':
                        'We focus on simplicity, efficiency and security. Our platform provides a complete solution for managing groups and votes, saving time and resources and helping users reach the best outcome.',

                    'about.cards.mini.simpleManagement.title': 'Simple management',
                    'about.cards.mini.simpleManagement.desc':
                        'All groups and votes in one place, with a friendly interface.',

                    'about.cards.mini.security.title': 'Security',
                    'about.cards.mini.security.desc':
                        'Full protection of personal data and user votes.',

                    'about.cards.mini.support.title': 'Available support',
                    'about.cards.mini.support.desc':
                        'A professional team available at any time to help and solve issues.',

                    'about.cards.mini.customization.title': 'Personalization',
                    'about.cards.mini.customization.desc':
                        'Options to customize groups and views according to the user’s needs.',
                    // === contact page ===
                    'contact.title': 'Contact Us',

                    'contact.fullNameLabel': 'Full name',
                    'contact.fullNamePlaceholder': 'How should we address you?',
                    'contact.emailLabel': 'Email',
                    'contact.emailPlaceholder': 'name@example.com',
                    'contact.phoneLabel': 'Phone (optional)',
                    'contact.phonePlaceholder': '050-0000000',
                    'contact.messageLabel': 'Message',
                    'contact.messagePlaceholder': 'How can we help?',

                    'contact.errors.fullNameRequired': 'Please enter your full name',
                    'contact.errors.emailRequired': 'Please enter an email address',
                    'contact.errors.emailInvalid': 'Email format is not valid',
                    'contact.errors.messageRequired': 'Please write a message',

                    'contact.button.loading': 'Sending…',
                    'contact.button.submit': 'Send message',

                    'contact.successText': 'Your message has been sent, we will get back to you soon 🙂',

                    'contact.toast.success': 'Message sent successfully!',
                    'contact.toast.error': 'An error occurred while sending, please try again',

                    'contact.mailSubject': 'New message from site – {{name}}',
                    'contact.mailText.nameLabel': 'Name',
                    'contact.mailText.emailLabel': 'Email',
                    'contact.mailText.phoneLabel': 'Phone',
                    'contact.mailText.messageLabel': 'Message',
                    // === groups create page ===
                    'groups.create.title': 'Create a new group',

                    'groups.create.labels.name': 'Group name',
                    'groups.create.labels.description': 'Description',
                    'groups.create.labels.endDate': 'End date',
                    'groups.create.labels.candidateEndDate': 'Candidate application end date',
                    'groups.create.labels.maxWinners': 'Maximum winners',
                    'groups.create.labels.status': 'Group status',

                    'groups.create.status.locked': 'Locked',
                    'groups.create.status.open': 'Open',

                    'groups.create.errors.nameRequired': 'Group name is required',
                    'groups.create.errors.descriptionRequired': 'Description is required',
                    'groups.create.errors.endDateRequired': 'End date is required',
                    'groups.create.errors.candidateEndDateRequired':
                        'Candidate application end date is required',
                    'groups.create.errors.candidateAfterGroup':
                        'Candidate end date cannot be after the group end date',

                    'groups.create.buttons.saving': 'Saving…',
                    'groups.create.buttons.create': 'Create group',
                    'groups.create.buttons.cancel': 'Cancel',

                    'groups.create.toast.created': 'Group created successfully!',
                    'groups.create.toast.linkCopied': 'Link copied',

                    'groups.create.modal.title': 'Group created ✔',
                    'groups.create.modal.lockedInfo':
                        'To request joining a locked group you must log in — after logging in, a join request is sent automatically.',
                    'groups.create.modal.shareLinkLabel': 'Share link:',
                    'groups.create.modal.shareCopy': 'Copy',
                    'groups.create.modal.shareCopied': 'Copied ✓',
                    'groups.create.modal.finish': 'Done',
                    // === groups list page ===
                    'groups.list.loading': 'Loading groups...',

                    'groups.list.empty.noGroups': 'There are no groups yet.',
                    'groups.list.empty.createButton': '+ Create a new group',
                    'groups.list.empty.loginHint': 'You need to log in before creating a group.',

                    'groups.list.searchPlaceholder': 'Search groups...',

                    'groups.list.filters.title': 'Filter',
                    'groups.list.filters.alt': 'Filter',
                    'groups.list.filters.all': 'All groups',
                    'groups.list.filters.open': 'Open groups',
                    'groups.list.filters.locked': 'Locked groups',
                    'groups.list.filters.joined': 'Groups I joined',
                    'groups.list.filters.owned': 'Groups I manage',
                    'groups.list.filters.expired': 'Expired groups',
                    'groups.list.filters.candidateOpen': 'Open application',

                    'groups.list.sort.title': 'Sort',
                    'groups.list.sort.alt': 'Sort',
                    'groups.list.sort.creationDate': 'Creation date (newest first)',
                    'groups.list.sort.endDate': 'End date (earliest first)',
                    'groups.list.sort.name': 'Group name (A–Z)',

                    'groups.list.card.lockedAlt': 'Locked',
                    'groups.list.card.lockedTitle': 'Locked group',
                    'groups.list.card.memberTooltip': 'Joined',
                    'groups.list.card.notMemberTooltip': 'Not joined',
                    'groups.list.card.settingsTitle': 'Group settings',
                    'groups.list.card.settingsAlt': 'Settings',

                    'groups.list.card.ownerLabel': 'Owner:',
                    'groups.list.card.ownerUnknown': 'Unknown',

                    'groups.list.card.expiredText': 'Voting period has ended — view results',
                    'groups.list.card.endDateLabel': 'End date:',

                    'groups.list.card.status.member': 'Joined',
                    'groups.list.card.rejectedNotice':
                        'Your request was rejected by the group admin. You may send a new request.',
                    'groups.list.card.requestAgain': 'Send request again',
                    'groups.list.card.pendingButton': 'Pending...',
                    'groups.list.card.pendingHint':
                        'Your request has been sent and is waiting for admin approval.',
                    'groups.list.card.removedNotice':
                        'You were removed from the group by the admin. You can send a new join request.',
                    'groups.list.card.requestJoin': 'Request to join',

                    'groups.list.pagination.prev': 'Previous',
                    'groups.list.pagination.next': 'Next',

                    'groups.list.fab.title': 'Create a new group',

                    'groups.list.toasts.loginToCreate':
                        'You must log in before creating a group.',
                    'groups.list.toasts.loginToRequestJoin':
                        'You must log in before sending a join request.',
                    'groups.list.toasts.lockedLoginToJoin':
                        'This group is locked. To request to join, please log in.',
                    'groups.list.toasts.pendingStill':
                        'You are not yet a member of this group. Your request is still pending admin approval.',
                    'groups.list.toasts.rejected':
                        'Your request was rejected by the group admin. You may send a new request.',
                    // === home page ===
                    'home.loading': 'Loading groups...',

                    'home.error.title': 'Error',
                    'home.error.retry': 'Try again',

                    'home.hero.title': 'Digital voting platform',
                    'home.hero.subtitle': 'Your voice • Our decision',
                    'home.hero.cta': 'Create a new voting room',
                    'home.hero.scrollDown': 'Scroll down',

                    'home.time.noEndDate': 'No end date',
                    'home.time.ended': 'Ended',
                    'home.time.days': 'days',
                    'home.time.hours': 'hours',
                    'home.time.minutes': 'minutes',

                    'home.active.title': 'Active votes',
                    'home.active.empty': 'There are no active votes at the moment',
                    // if you later use the button:
                    'home.active.voteNow': 'Vote now',

                    'home.closed.title': 'Latest results',
                    'home.closed.viewResults': 'View results',
                    'home.closed.empty': 'No recent results',

                    'home.emptyState.title': 'No groups available yet',
                    'home.emptyState.subtitle': 'When there are active votes, they will appear here.',
                    'home.emptyState.create': 'Create a new group',

                    'home.actions.allGroups': 'All voting rooms',
                    'home.actions.myProfile': 'My profile',
                    'home.actions.createGroup': 'Create group',

                    'home.common.noName': 'No name',

                    'home.toasts.loginToCreate': 'You must log in before creating a group.',
                    // === join group page ===
                    'join.loading': 'Loading…',

                    'join.errors.groupNotFound': 'Group not found',
                    'join.errors.sendRequestFailed': 'Failed to send join request',

                    'join.hints.alreadyPending':
                        'A join request already exists and is pending approval.',
                    'join.hints.alreadyMember': 'You are already a member of this group.',
                    'join.hints.groupOpen':
                        'This group is open — no join request is required.',

                    'join.loginModal.title':
                        'Join request for group {{groupName, default:(locked group)}}',
                    'join.loginModal.text':
                        'To request to join a locked group, you must be logged in.',

                    'join.successModal.title': 'Request sent ✔',
                    'join.successModal.defaultHint':
                        'Your request has been sent and is waiting for admin approval.',

                    'common.cancel': 'Cancel',
                    'common.close': 'Close',
                    'auth.login': 'Login',
                    'auth.forgot.title': 'Forgot your password?',
                    'auth.forgot.subtitle': "No worries, we'll send you a reset link",
                    'auth.forgot.emailLabel': 'Email',
                    'auth.forgot.emailPlaceholder': 'Enter your email address',
                    'auth.forgot.submit': 'Send reset link',
                    'auth.forgot.submitting': 'Sending...',
                    'auth.forgot.backToLogin': 'Back to login',
                    // Login page
                    'auth.login.title': 'Login',
                    'auth.login.subtitle': 'Welcome back! Good to see you again',

                    'auth.login.emailLabel': 'Email',
                    'auth.login.emailPlaceholder': 'example@gmail.com',
                    'auth.login.passwordLabel': 'Password',
                    'auth.login.passwordPlaceholder': 'Enter your password',

                    'auth.login.emailRequired': 'Email is required',
                    'auth.login.passwordRequired': 'Password is required',

                    'auth.login.forgotLink': 'Forgot your password?',
                    'auth.login.button': 'Log in',
                    'auth.login.submitting': 'Logging in...',

                    'auth.login.expired': 'Your session has expired, please log in again',

                    'auth.login.showPassword': 'Show password',
                    'auth.login.hidePassword': 'Hide password',

                    'auth.login.google': 'Continue with Google',
                    'auth.login.noAccount': "Don't have an account? ",
                    'auth.login.registerNow': 'Sign up now',

                    // shared
                    'common.or': 'or',
                    'common.genericError': 'An error occurred',
                    // Reset password page
                    'auth.reset.title': 'Reset password',
                    'auth.reset.subtitle': 'Enter a new password for your account',

                    'auth.reset.newPasswordLabel': 'New password*',
                    'auth.reset.newPasswordPlaceholder': 'At least 6 characters',
                    'auth.reset.confirmPasswordLabel': 'Confirm password*',
                    'auth.reset.confirmPasswordPlaceholder': 'Re-enter your password',

                    'auth.reset.passwordTooShort': 'Password must be at least 6 characters long',
                    'auth.reset.passwordsMismatch': 'Passwords do not match',

                    'auth.reset.button': 'Reset password',
                    'auth.reset.submitting': 'Resetting password...',

                    'auth.reset.showPassword': 'Show password',
                    'auth.reset.hidePassword': 'Hide password',
                    // === profile page ===
                    'profile.title': 'My profile',
                    'profile.loading': 'Loading profile...',
                    'profile.firstName': 'First name',
                    'profile.lastName': 'Last name',
                    'profile.email': 'Email',
                    'profile.phone': 'Phone',
                    'profile.address': 'Address',
                    'profile.editUser': 'Edit user',
                    'profile.changePassword': 'Change password',
                    'profile.groupsOwned': 'Groups I manage',
                    'profile.groupsJoined': 'Groups I joined',
                    'profile.noGroups': 'No groups',
                    'profile.viewGroup': 'View group',
                    'profile.passwordUpdated': 'Password updated successfully',
                    'profile.currentPassword': 'Current password',
                    'profile.newPassword': 'New password',
                    'profile.confirmPassword': 'Confirm password',
                    'profile.passwordErrors.currentRequired': 'Current password is required',
                    'profile.passwordErrors.newRequired': 'New password is required',
                    'profile.passwordErrors.mismatch': 'Passwords do not match',

                    'common.save': 'Save',
                    // === register page ===
                    'auth.register.title': 'Sign up',
                    'auth.register.subtitle': 'Create a new account and join us',
                    'auth.register.successRedirect': 'Registered successfully! Redirecting...',

                    'auth.register.firstNameLabel': 'First name*',
                    'auth.register.firstNamePlaceholder': 'Enter your first name',
                    'auth.register.lastNameLabel': 'Last name*',
                    'auth.register.lastNamePlaceholder': 'Enter your last name',
                    'auth.register.emailLabel': 'Email*',
                    'auth.register.emailPlaceholder': 'example@email.com',
                    'auth.register.phoneLabel': 'Phone*',
                    'auth.register.phonePlaceholder': '050-1234567',
                    'auth.register.cityLabel': 'City*',
                    'auth.register.cityPlaceholder': 'City',
                    'auth.register.streetLabel': 'Street*',
                    'auth.register.streetPlaceholder': 'Street',
                    'auth.register.passwordLabel': 'Password*',
                    'auth.register.passwordPlaceholder': 'At least 6 characters',
                    'auth.register.confirmPasswordLabel': 'Confirm password*',
                    'auth.register.confirmPasswordPlaceholder': 'Re-enter your password',

                    'auth.register.submitting': 'Creating account...',
                    'auth.register.submit': 'Create account',

                    'auth.register.alreadyHaveAccount': 'Already have an account? ',
                    'auth.register.loginLink': 'Log in',

                    'auth.register.errors.firstNameTooShort': 'First name must be at least 2 characters',
                    'auth.register.errors.lastNameTooShort': 'Last name must be at least 2 characters',
                    'auth.register.errors.invalidEmail': 'Email is not valid',
                    'auth.register.errors.passwordTooShort': 'Password must be at least 6 characters long',
                    'auth.register.errors.invalidPhone': 'Phone number is not valid',
                    'auth.register.errors.cityRequired': 'City is required',
                    'auth.register.errors.addressRequired': 'Address is required',
                    'auth.register.errors.passwordsMismatch': 'Passwords do not match',
                    'auth.register.errors.emailExists': 'This email already exists in the system',
                    // === User Guide ===
                    'guide.title': 'User Guide',
                    'guide.subtitle': 'Everything you need to know to use the site comfortably and safely',

                    'guide.steps.registerTitle': 'Register & Login',
                    'guide.steps.registerDesc': 'Create a new account or log in to access all site features.',

                    'guide.steps.groupsTitle': 'Group Management',
                    'guide.steps.groupsDesc': 'Create groups, manage members, and set up votes easily and efficiently.',

                    'guide.steps.votesTitle': 'Voting',
                    'guide.steps.votesDesc': 'Vote on topics, track live results, and understand the group’s opinions clearly.',

                    'guide.steps.notificationsTitle': 'Notifications & Tracking',
                    'guide.steps.notificationsDesc': 'Receive alerts about updates, new votes, and join requests.',

                    'guide.highlightTitle': 'Pro Tip',
                    'guide.highlightDesc': 'To get the most out of the system, review your group settings, manage members properly, and stay updated with real-time notifications.',

                    'guide.tips.shortcutsTitle': 'Shortcuts',
                    'guide.tips.shortcutsDesc': 'Learn our shortcuts to save time and improve usability.',

                    'guide.tips.mobileTitle': 'Mobile Use',
                    'guide.tips.mobileDesc': 'The interface is optimized for mobile devices and works great anywhere.',

                    'guide.tips.privacyTitle': 'Privacy Protection',
                    'guide.tips.privacyDesc': 'Your personal information and votes are secure and protected.',

                    'guide.tips.supportTitle': 'Professional Support',
                    'guide.tips.supportDesc': 'Contact us anytime — we’re here to help.',
                    'users.title': 'All Users',
                    'users.loading': 'Loading users...',
                    'users.error': 'Error loading users: {{error}}',
                    'auth.register.genericError': 'Registration failed, please try again.',

                    // 👇 להוסיף
                    'auth.login.errors.emailNotFound': 'Email does not exist in the system.',
                    'auth.login.errors.invalidPassword': 'Incorrect password',

                    // 👇 לעדכן
                    'auth.serverError': 'A server error occurred. Please try again later.',

                    'auth.profile.loadFailed': 'Loading profile failed',

                    'auth.profile.updateFailed': 'Updating profile failed',

                    'auth.forgot.genericSuccess':
                        'If this email exists, reset instructions have been sent.',
                    'auth.forgot.genericError': 'Password reset request failed',

                    'auth.reset.genericSuccess': 'Your password has been updated.',
                    'auth.reset.genericError': 'Password reset failed',

                    'auth.changePassword.genericSuccess': 'Password changed successfully',
                    'auth.changePassword.genericError': 'Changing password failed',
                    'candidates.errors.loadFailed': 'Failed to load candidates',
                    'candidates.errors.createFailed': 'Failed to create candidate',
                    'candidates.errors.updateFailed': 'Failed to update candidate',
                    'candidates.errors.deleteFailed': 'Failed to delete candidate',
                    'candidates.errors.applyFailed': 'Failed to send candidate application',
                    'candidates.errors.fetchRequestsFailed': 'Failed to load candidate requests',
                    'candidates.errors.approveFailed': 'Failed to approve candidate request',
                    'candidates.errors.rejectFailed': 'Failed to reject candidate request',
                    'groups.errors.loadAllFailed': 'Failed to load groups',
                    'groups.errors.loadOneFailed': 'Failed to load group',
                    'groups.errors.loadWithMembersFailed': 'Failed to load group and members',
                    'groups.errors.createFailed': 'Failed to create group',
                    'groups.errors.updateFailed': 'Failed to update group',
                    'groups.errors.loadMyFailed': 'Failed to load your groups',
                    'groups.errors.removeMemberFailed': 'Failed to remove member',
                    'groups.errors.deleteFailed': 'Failed to delete group',
                    'join.errors.statusLoadFailed': 'Failed to load join statuses',
                    'join.errors.loadRequestsFailed': 'Failed to load join requests',
                    'join.errors.approveFailed': 'Failed to approve request',
                    'join.errors.rejectFailed': 'Failed to reject request',
                    'mail.sendSuccess': 'Mail was sent successfully.',
                    'mail.sendFailed': 'Failed to send mail.',
                    'users.loadFailed': 'Failed to load users',
                    'users.hydrateFailed': 'Failed to load user details',
                    'votes.errors.notLoggedIn': 'You must be logged in to vote',
                    'votes.errors.voteFailed': 'Voting failed',
                    'votes.errors.fetchVotersFailed': 'Failed to load voters list',

                },
            },
        },
    });

export default i18n;
