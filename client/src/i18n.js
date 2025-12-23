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

                    'voting.insertEnvelope': 'הכנס מעטפה לקלפי',
                    'voting.voteSuccessToast': 'הצבעתך נקלטה במערכת',
                    'voting.confirmVoteMessage': 'את/ה בטוח/ה רוצה להצביע למועמד {{name}}?',
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
                    'groups.list.loading': 'טוען...',

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
                    'groups.list.filters.votingOpen': 'קבוצות שפתוחות להצבעה',

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
                    'home.loading': 'טוען...',

                    'home.error.title': 'שגיאה',
                    'home.error.retry': 'נסה שוב',

                    'home.hero.title': 'מערכת הצבעה דיגיטלית',
                    'home.hero.subtitle': 'קולך נשמע • ההחלטה שלנו',
                    'home.hero.cta': 'יצירת חדר הצבעות חדש',
                    'home.hero.login': 'להתחברות',
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
                    // === chat (group chat) ===
                    'chat.title': "צ'אט",
                    'chat.readOnlyNote': 'ניתן לקרוא הודעות בלבד. רק חברי קבוצה יכולים לכתוב.',
                    'chat.loading': 'טוען הודעות…',
                    'chat.noMessages': 'אין הודעות עדיין. אפשר להתחיל את השיחה 🙂',
                    'chat.participantFallback': 'משתתף',
                    'chat.messageDeleted': 'הודעה נמחקה',

                    'chat.menu.optionsTitle': 'אפשרויות',
                    'chat.menu.edit': 'עריכה',
                    'chat.menu.delete': 'מחיקה',

                    'chat.confirmDelete': 'למחוק את ההודעה?',
                    'chat.editingBar.text': 'עורך/ת הודעה',
                    'chat.editingBar.cancel': 'ביטול',

                    'chat.moreButton.title': 'פעולות נוספות',
                    'chat.moreMenu.summary': 'סיכום שיחה AI',
                    'chat.moreMenu.summarizing': 'מסכם…',

                    'chat.input.placeholder': 'הקלד/י הודעה…',
                    'chat.input.readonlyPlaceholder': "אין לך הרשאה לכתוב בצ׳אט",

                    'chat.emojiButton.title': 'אימוג׳ים',
                    'chat.emoji.searchPlaceholder': 'חיפוש',

                    'chat.sendButton.title': 'שליחת הודעה',

                    'chat.errors.loadFailed': 'שגיאה בטעינת ההודעות',
                    'chat.errors.sendFailed': 'שגיאה בשליחת ההודעה',
                    'chat.errors.updateFailed': 'שגיאה בעדכון ההודעה',
                    'chat.errors.deleteFailed': 'שגיאה במחיקת ההודעה',
                    'chat.errors.summaryFailed': 'שגיאה בסיכום השיחה',
                    // === candidates form ===
                    'candidates.form.nameLabel': 'שם *',
                    'candidates.form.descriptionLabel': 'תיאור *',
                    'candidates.form.symbolLabel': 'סמל *',
                    'candidates.form.symbolPlaceholder': 'למשל: א׳',
                    'candidates.form.photoLabel': 'תמונה',
                    'candidates.form.previewAlt': 'תצוגה מקדימה',
                    'candidates.form.changePhoto': 'שינוי תמונה',
                    'candidates.form.removePhoto': 'הסרת תמונה',
                    'candidates.form.uploading': 'מעלה…',
                    // === candidate requests tab ===
                    'candidates.requests.title': 'בקשות מועמדות',
                    'candidates.requests.loading': 'טוען…',
                    'candidates.requests.empty': 'אין בקשות.',
                    'candidates.requests.approve': 'אשר/י',
                    'candidates.requests.reject': 'דחה/י',
                    // === candidates tab (list & add) ===
                    'candidates.tab.title': 'מועמדים',
                    'candidates.list.loading': 'טוען מועמדים…',
                    'candidates.list.empty': 'אין מועמדים בקבוצה.',
                    'candidates.list.noName': '(ללא שם)',
                    'candidates.list.photoAlt': 'תמונת מועמד',
                    'candidates.list.photoAltWithName': 'תמונת מועמד {{name}}',
                    'candidates.list.edit': 'עריכה',
                    'candidates.list.remove': 'הסרה',

                    'candidates.add.title': 'הוספת מועמד/ת',
                    'candidates.add.submit': 'הוסף/י מועמד/ת',

                    'candidates.upload.error': 'שגיאה בהעלאת התמונה',
                    // === group settings – danger zone ===
                    'groupSettings.danger.title': 'מחיקת קבוצה',
                    'groupSettings.danger.warning': 'מחיקה היא פעולה בלתי הפיכה. כל נתוני הקבוצה יימחקו לכולם.',
                    'groupSettings.danger.deleteButton': 'מחיקת הקבוצה ',
                    // === group settings – delete modal ===
                    'groupSettings.deleteModal.title': 'מחק/י את הקבוצה',
                    'groupSettings.deleteModal.typeToConfirm': 'כדי לאשר, הקלד/י בתיבה את',
                    'groupSettings.deleteModal.mustMatch': 'יש להקליד בדיוק את הערך לעיל',
                    'groupSettings.deleteModal.deleteForever': 'מחיקת הקבוצה לצמיתות',
                    // === edit candidate modal ===
                    'candidates.edit.title': 'עריכת מועמד/ת',
                    'candidates.edit.save': 'שמור/י',
                    'candidates.edit.saving': 'שומר/ת…',
                    // === common ===
                    'common.edit': 'עריכה',

                    // === group settings – general tab ===
                    'groupSettings.general.title': 'פרטי הקבוצה',
                    'groupSettings.general.status': 'סטטוס',
                    'groupSettings.general.symbolLabel': 'סמל',
                    'groupSettings.general.photoLabel': 'תמונה',
                    'groupSettings.general.photoOpen': 'פתיחה',
                    'groupSettings.general.createdBy': 'נוצר ע״י',
                    'groupSettings.general.shareLinkLabel': 'קישור שיתוף',
                    'groupSettings.general.shareInputAria': 'קישור לשיתוף',
                    'groupSettings.general.shareCopy': 'העתק',
                    'groupSettings.general.shareCopied': 'הועתק ✓',
                    'groupSettings.general.shareHintLocked':
                        'קבוצה נעולה: הקישור יבקש התחברות ואז ישלח בקשת הצטרפות.',
                    'groupSettings.general.shareHintOpen':
                        'קבוצה פתוחה: הקישור מוביל ישירות לעמוד הקבוצה.',
                    'groupSettings.general.updateSuccess': 'נשמר בהצלחה',
                    'groupSettings.general.lockedHint': 'קבוצה נעולה (חברים נכנסים דרך בקשות)',
                    'groupSettings.general.symbolLabelOptional': 'סמל (אופציונלי)',
                    'groupSettings.general.symbolPlaceholder': 'למשל: א׳',
                    // === candidates validation ===
                    'candidates.validation.nameRequired': 'שם הוא שדה חובה',
                    'candidates.validation.nameTooShort': 'השם צריך להיות לפחות באורך 2 תווים',
                    'candidates.validation.nameTooLong': 'השם ארוך מדי (מקסימום 50 תווים)',
                    'candidates.validation.descriptionTooLong': 'התיאור ארוך מדי (מקסימום 500 תווים)',
                    'candidates.validation.symbolTooLong': 'הסמל יכול להכיל עד 3 תווים',
                    // === common ===
                    'common.edit': 'עריכה',
                    'common.uploadError': 'שגיאה בהעלאת הקובץ',
                    'common.noName': 'ללא שם',

                    // === group settings – page ===
                    'groupSettings.pageTitle': 'הגדרות קבוצה',
                    'groupSettings.loadingResolving': 'טוען נתוני קבוצה...',
                    'groupSettings.loading': 'טוען...',
                    'groupSettings.notFound': 'הקבוצה לא נמצאה.',
                    'groupSettings.noGroup': 'לא נמצאה קבוצה.',
                    'groupSettings.backToGroups': 'חזרה לרשימת הקבוצות',
                    'groupSettings.noPermissionText':
                        'אין לך הרשאות ניהול לקבוצה זו. רק מנהל/ת הקבוצה יכול/ה לצפות ולהתאים את ההגדרות. אם את/ה צריך/ה שינוי, אפשר לפנות למנהל/ת הקבוצה.',

                    // header buttons
                    'groupSettings.header.detailsTooltip': 'פרטי הקבוצה',
                    'groupSettings.header.backTooltip': 'חזרה לקבוצות',

                    // sidebar
                    'groupSettings.sidebar.general': 'פרטי קבוצה',
                    'groupSettings.sidebar.candidates': 'מועמדים',
                    'groupSettings.sidebar.voters': 'מצביעים',
                    'groupSettings.sidebar.members': 'משתתפי הקבוצה',
                    'groupSettings.sidebar.danger': 'מחיקה',

                    // confirm actions
                    'groupSettings.removeMemberConfirm': 'להסיר את {{name}} מהקבוצה?',
                    'groupSettings.deleteCandidateConfirm': 'להסיר את {{name}}?',

                    // candidates – מחיקה
                    'candidates.errors.deleteIdMissing': 'מחיקת המועמד נכשלה – מזהה לא נמצא',
                    joinRequests: {
                        title: 'בקשות הצטרפות',
                        loading: 'טוען בקשות…',
                        empty: 'אין בקשות כרגע.',
                        approve: 'אשר/י',
                        reject: 'דחה/י',
                    },

                    members: {
                        noName: '(ללא שם)',
                        created: 'נוצר',
                        joined: 'הצטרף',
                        remove: 'הסרה',
                    },
                    members: {
                        noName: '(ללא שם)',
                        created: 'נוצר',
                        joined: 'הצטרף',
                        remove: 'הסרה',
                        title: 'משתתפי הקבוצה',
                        empty: 'אין משתתפים עדיין.',
                    },
                    voters: {
                        title: 'המצביעים',
                        loading: 'טוען מצביעים…',
                        empty: 'אין מצביעים עדיין.',
                    },
                    candidateApply: {
                        invalidGroup: '❌ קבוצה לא תקינה. נסי לרענן את העמוד.',
                        mustLogin: 'כדי להגיש מועמדות יש להתחבר למערכת.',
                        status: {
                            pending: '📝 בקשת המועמדות שלך נמצאת בבדיקה אצל המנהל/ת',
                            approved: '✅ בקשת המועמדות שלך אושרה. את/ה כבר מועמד/ת בקבוצה זו.',
                            rejected: '⚠️ בקשת המועמדות שלך נדחתה – ניתן להגיש בקשה חדשה',
                            removed: '⚠️ המועמדות הקודמת שלך נמחקה ע"י המנהל/ת – ניתן להגיש בקשה חדשה',
                        },
                        title: 'הגש מועמדות',
                        subtitle: 'מלא/י את הפרטים למועמדות בקבוצה',
                        nameRequired: 'שם מלא חובה',
                        submit: 'הגש מועמדות',
                        submitting: 'טוען...',
                        success: 'בקשת המועמדות הוגשה למנהל/ת הקבוצה!',
                        genericError: 'שגיאה בלתי צפויה',
                    },
                    toastDemo: {
                        title: '🎨 דוגמאות React Hot Toast',
                        subtitle: 'לחץ על הכפתורים לראות סוגי הודעות שונות',

                        // טקסטים של הטוסטים
                        success: 'הפעולה בוצעה בהצלחה!',
                        error: 'אופס! משהו השתבש',
                        info: 'זוהי הודעת מידע רגילה',
                        warning: '⚠️ אזהרה: שים לב לפרטים',
                        loading: 'טוען נתונים...',
                        loaded: 'הנתונים נטענו!',
                        promiseLoading: 'שומר נתונים...',
                        promiseSuccess: 'הנתונים נשמרו בהצלחה!',
                        promiseError: 'שגיאה בשמירת הנתונים',
                        customTitle: 'הודעה מותאמת אישית!',
                        customText: 'זה עיצוב מיוחד שלך',
                        longText:
                            'זוהי הודעה ארוכה יותר שמדגימה איך נראה טקסט ארוך בתוך ההודעה הקופצת. אפשר לראות שזה עובד מצוין גם עם תוכן רב.',
                        emoji: '🚀 המערכת עולה לאוויר!',
                        multiFirst: 'הודעה ראשונה',
                        multiSecond: 'הודעה שנייה',
                        multiThird: 'הודעה שלישית',

                        // כפתורים
                        buttons: {
                            success: '✓ הודעת הצלחה',
                            error: '✕ הודעת שגיאה',
                            info: 'ℹ הודעת מידע',
                            warning: '⚠ הודעת אזהרה',
                            loading: '⏳ הודעת טעינה',
                            promise: '🔄 Promise Toast',
                            custom: '✨ הודעה מותאמת',
                            longText: '📝 טקסט ארוך',
                            emoji: '🎯 עם אמוג׳י',
                            multiple: '📚 מספר הודעות',
                        },

                        // קופסת הטיפים
                        tipsTitle: '💡 טיפים:',
                        tips: {
                            autoHide: 'ההודעות נעלמות אוטומטית אחרי 3 שניות',
                            close: 'אפשר לסגור הודעה ידנית בלחיצה עליה',
                            multiple: 'מספר הודעות יכולות להופיע בו זמנית',
                            animation: 'כל הודעה מקבלת אנימציה חלקה',
                        },
                    },
                    'groups.create.ai.fillNameFirstError': 'קודם צריך למלא שם קבוצה',
                    'groups.create.ai.tooltip': 'עזרה בכתיבת תיאור עם AI',
                    // למשל תחת groups.detail
                    // campaign page
                    'campaign.loadingUser': 'טוען משתמש…',
                    'campaign.loading': 'טוען קמפיין…',
                    'campaign.errorPrefix': 'שגיאה: ',

                    'common.back': 'חזרה',
                    'common.linkCopied': 'הקישור הועתק ללוח!',

                    'campaign.header.finishEdit': 'סיום עריכה',
                    'campaign.header.editPage': 'עריכת הדף',

                    'campaign.editCandidate': 'עריכת מועמד/ת',

                    'campaign.sections.posts': 'פוסטים',
                    'campaign.sections.about': 'אודות',
                    'campaign.sections.gallery': 'גלריית תמונות',

                    'campaign.posts.new.titlePlaceholder': 'כותרת פוסט',
                    'campaign.posts.new.contentPlaceholder': 'תוכן הפוסט',
                    'campaign.posts.new.youtubePlaceholder': 'קישור YouTube (אופציונלי)',
                    'campaign.posts.new.addButton': 'הוסף פוסט',
                    'campaign.posts.new.aiHelpButton': 'עזרה מ־AI',
                    'campaign.posts.empty': 'אין פוסטים בקמפיין',
                    'campaign.posts.confirmDelete': 'למחוק פוסט זה?',

                    'campaign.description.placeholder': 'הוסף תיאור לקמפיין',
                    'campaign.description.empty': 'אין תיאור קמפיין עדיין',
                    'campaign.description.editButton': 'ערוך תיאור',

                    'campaign.stats.views': 'צפיות',
                    'campaign.stats.supp': 'תומכים',
                    'campaign.stats.share': 'שתף',
                    'campaign.share.text': 'בואו להכיר את {{name}}',

                    'campaign.gallery.upload.linkPlaceholder': 'קישור לתמונה',
                    'campaign.gallery.upload.addButton': 'הוסף',
                    'campaign.gallery.upload.orText': 'או העלאה מהמחשב:',
                    'campaign.gallery.empty': 'אין תמונות בגלריה',
                    'campaign.gallery.imageAlt': 'תמונה {{index}}',
                    'campaign.gallery.lightboxAlt': 'תמונה מוגדלת',

                    'campaign.ai.modal.title': 'עזרה בכתיבת פוסט (AI)',
                    'campaign.ai.modal.subtitle':
                        'המערכת תשתמש בשם המועמד/ת והקבוצה ותיצור פוסט קצר בגוף ראשון',
                    'campaign.ai.modal.titleLabelGenerated': 'כותרת הפוסט:',
                    'campaign.ai.modal.titleLabel': 'כותרת מוצעת:',
                    'campaign.ai.modal.titlePlaceholder': 'כותרת לפוסט עבור {{name}}',
                    'campaign.ai.modal.candidateFallback': 'המועמד/ת',
                    'campaign.ai.modal.contentLabelGenerated': 'תוכן:',
                    'campaign.ai.modal.contentLabel': 'על מה לכתוב?',
                    'campaign.ai.modal.contentPlaceholder':
                        'לדוגמה: להתמקד בשקיפות, בעזרה לחברים בקבוצה...',
                    'campaign.ai.modal.generateButton': 'יצירת פוסט עם AI',
                    'campaign.ai.modal.generating': 'מייצר פוסט…',
                    'campaign.ai.modal.savePost': 'שמור פוסט',

                    'campaign.editCandidate.uploadError': 'שגיאה בהעלאת תמונת המועמד/ת',
                    'campaign.editCandidate.missingIds': 'חסר מזהה קבוצה או מועמד לעדכון',
                    'campaign.editCandidate.errors.nameRequired': 'שם מועמד/ת חובה',
                    'campaign.editCandidate.errors.descriptionRequired': 'תיאור חובה',
                    'campaign.editCandidate.errors.symbolRequired': 'סמל חובה',
                    'campaign.editCandidate.genericError': 'שגיאה בעדכון המועמד/ת',

                    'campaign.posts.deletePostTitle': 'מחק פוסט',

                    'campaign.comments.toggleLabel': '{{count}} תגובות',
                    'campaign.comments.confirmDelete': 'למחוק תגובה זו?',
                    'campaign.comments.placeholder': 'כתוב תגובה...',
                    'campaign.comments.sending': 'שולח...',
                    'campaign.comments.send': 'שלח',
                    'campaign.comments.empty': 'אין תגובות עדיין',
                    'campaign.comments.anonymousUser': 'משתמש',
                    'campaign.comments.deleteButtonTitle': 'מחק תגובה',

                    'common.nothingToSave': 'אין שינויים לשמירה',

                    "about": {
                        "hero": {
                            "badge": "פלטפורמת בחירות דיגיטלית",
                            "title": "בחירות דמוקרטיות, פשוטות ונגישות לכולם",
                            "subtitle": "פלטפורמה מקיפה לניהול בחירות אונליין - מנציגות כיתה ועד ועדי עובדים. כל מה שצריך למען תהליך בחירות שקוף, מאובטח ודמוקרטי.",
                            "ctaPrimary": "התחל עכשיו",
                            "ctaSecondary": "צור קבוצת בחירות"
                        },
                        "mission": {
                            "title": "המשימה שלנו",
                            "text": "אנחנו מאמינים שכל בחירות, בין אם זה נציגות כיתה או ועד עובדים, ראויה לתהליך דמוקרטי, שקוף ומאובטח. הפלטפורמה שלנו מאפשרת לכל ארגון, קהילה או קבוצה לנהל בחירות באופן מקצועי וידידותי, תוך שמירה על פרטיות המצביעים והגינות התהליך. בנוסף, אנחנו תורמים לסביבה ירוקה יותר על ידי הפחתת השימוש בנייר ובמשאבים פיזיים."
                        },
                        "features": {
                            "sectionTitle": "למה לבחור בנו?",
                            "democratic": {
                                "title": "דמוקרטיה אמיתית",
                                "desc": "כל אחד יכול להצביע במי שהוא רוצה, בחשאיות מלאה. התוצאות מוצגות רק בסיום הבחירות כדי למנוע השפעה על המצביעים."
                            },
                            "privacy": {
                                "title": "פרטיות מלאה",
                                "desc": "אף אחד לא יודע מי בחר במי. גם כמות הקולות לא מוצגת במהלך הבחירות, רק בסיום - כדי לשמור על הגינות ולמנוע שכנוע."
                            },
                            "campaigns": {
                                "title": "קמפיינים דיגיטליים",
                                "desc": "כל מועמד יכול ליצור קמפיין משלו, להעלות תוכן, לשכנע ולהציג את עצמו בצורה הטובה ביותר."
                            },
                            "secure": {
                                "title": "מאובטח ואמין",
                                "desc": "מערכת מאובטחת ואמינה שמבטיחה שכל קול נספר ושהתוצאות אמיתיות. אפשרות להגדיר מספר מקומות של מנצחים (ראשון, שני, שלישי וכו')."
                            },
                            "green": {
                                "title": "ידידותי לסביבה",
                                "desc": "בחירות אונליין פירושן פחות נייר, פחות הדפסות ופחות פסולת. תרומה קטנה אך חשובה לסביבה הירוקה שלנו."
                            }
                        },
                        "useCases": {
                            "sectionTitle": "למי זה מתאים?",
                            "student": {
                                "title": "בתי ספר וכיתות",
                                "desc": "נציגות כיתה, מועצת תלמידים, או כל בחירות בבית הספר - בצורה פשוטה ומהנה."
                            },
                            "workplace": {
                                "title": "ועדי עובדים",
                                "desc": "בחירות לועד עובדים, נציגי עובדים, או כל תפקיד ארגוני - בצורה מקצועית ומאובטחת."
                            },
                            "community": {
                                "title": "קהילות וארגונים",
                                "desc": "ועדי בתים, ארגונים התנדבותיים, קבוצות חברתיות - כל קהילה יכולה לנהל בחירות דמוקרטיות."
                            },
                            "organization": {
                                "title": "כל סוג בחירות",
                                "desc": "מבחירות רציניות ועד בחירות קטנות ופרטיות - הפלטפורמה שלנו מתאימה לכולם."
                            }
                        },
                        "cta": {
                            "title": "מוכנים להתחיל?",
                            "desc": "הצטרפו אלינו והפכו את הבחירות הבאות שלכם לחוויה דיגיטלית, דמוקרטית ומקצועית.",
                            "button": "צור קבוצת בחירות עכשיו"
                        }
                    },
                    // User Guide - Enhanced page
                    'guide.pageTitle': 'מדריך למשתמש',
                    'guide.pageSubtitle': 'כל מה שצריך לדעת על המערכת במקום אחד',

                    'guide.flow.title': 'תרשים זרימת המערכת',
                    'guide.flow.register': 'הרשמה',
                    'guide.flow.createGroup': 'יצירת קבוצה',
                    'guide.flow.votes': 'הצבעות',
                    'guide.flow.notifications': 'התראות',

                    'guide.steps.registerTitle2': 'הרשמה למערכת',
                    'guide.steps.registerDesc2': 'צור חשבון חדש במערכת תוך דקות ספורות',
                    'guide.steps.registerDetails.0': 'מלא את הפרטים הבסיסיים',
                    'guide.steps.registerDetails.1': 'אמת את כתובת האימייל שלך',
                    'guide.steps.registerDetails.2': 'צור סיסמה חזקה ומאובטחת',
                    'guide.steps.registerDetails.3': 'התחל להשתמש במערכת מיד',

                    'guide.steps.groupsTitle2': 'ניהול קבוצות',
                    'guide.steps.groupsDesc2': 'צור וצרף קבוצות, הזמן חברים ונהל הרשאות',
                    'guide.steps.groupsDetails.0': 'צור קבוצה חדשה עם שם ותיאור',
                    'guide.steps.groupsDetails.1': 'הזמן משתמשים באמצעות קישור או אימייל',
                    'guide.steps.groupsDetails.2': 'הגדר הרשאות ותפקידים',
                    'guide.steps.groupsDetails.3': 'עקוב אחר פעילות הקבוצה',

                    'guide.steps.votesTitle2': 'הצבעות וסקרים',
                    'guide.steps.votesDesc2': 'צור הצבעות, הצבע, וצפה בתוצאות בזמן אמת',
                    'guide.steps.votesDetails.0': 'צור הצבעה חדשה עם אפשרויות מרובות',
                    'guide.steps.votesDetails.1': 'הגדר זמן סיום להצבעה',
                    'guide.steps.votesDetails.2': 'הצבע באופן פשוט ומהיר',
                    'guide.steps.votesDetails.3': 'צפה בתוצאות גרפיות ומפורטות',

                    'guide.steps.notificationsTitle2': 'התראות ועדכונים',
                    'guide.steps.notificationsDesc2': 'קבל התראות על פעילות חשובה בקבוצות שלך',
                    'guide.steps.notificationsDetails.0': 'התראות על הצבעות חדשות',
                    'guide.steps.notificationsDetails.1': 'עדכונים על תוצאות הצבעות',
                    'guide.steps.notificationsDetails.2': 'הזמנות לקבוצות חדשות',
                    'guide.steps.notificationsDetails.3': 'התאמה אישית של העדפות התראות',

                    'guide.tips.sectionTitle': 'טיפים ותכונות נוספות',
                    'guide.tips.shortcutsTitle2': 'קיצורי דרך',
                    'guide.tips.shortcutsDesc2': 'שימוש במקלדת למעבר מהיר בין דפים',
                    'guide.tips.mobileTitle2': 'גרסה ניידת',
                    'guide.tips.mobileDesc2': 'השתמש במערכת מכל מכשיר, בכל מקום',
                    'guide.tips.privacyTitle2': 'פרטיות ואבטחה',
                    'guide.tips.privacyDesc2': 'המידע שלך מוגן ומאובטח',
                    'guide.tips.supportTitle2': 'תמיכה טכנית',
                    'guide.tips.supportDesc2': 'צוות התמיכה זמין לעזרה 24/7',

                    'groups.create.ai.noDescriptionError': 'לא התקבל תיאור מה-AI',
                    'groups.create.ai.createdToast': 'נוצר תיאור מוצע',
                    'groups.create.ai.genericError': 'שגיאה ביצירת תיאור אוטומטי',
                    'groups.create.ai.appliedToast': 'התיאור עודכן מה-AI',

                    'groups.create.ai.modal.title': 'עזרה בכתיבת תיאור (AI)',
                    'groups.create.ai.modal.subtitle':
                        'המערכת תשתמש בשם הקבוצה וההנחיה שלך ותציע תיאור קצר וברור (2–4 שורות).',

                    'groups.create.ai.hintLabel': 'מה חשוב לך שיהיה בתיאור?',
                    'groups.create.ai.hintPlaceholder': 'לא חובה – אפשר להשאיר ריק',

                    'groups.create.ai.generating': 'יוצר תיאור…',
                    'groups.create.ai.generate': 'יצירת הצעה',

                    'groups.create.ai.previewLabel': 'תיאור מוצע:',
                    'groups.create.ai.useDescription': 'השתמש בתיאור',
                    chat: {
                        confirmDelete: "למחוק את ההודעה?"
                    },
                    // ===== vote results notifier =====
                    'votes.results.modalTitle': 'ההצבעה הסתיימה!',
                    'votes.results.modalText': 'ההצבעה בקבוצה "{{name}}" הסתיימה ויש זוכה 🎉',
                    'votes.results.winnersLabel': 'זוכה/ים:',
                    'votes.results.seeWinnerButton': 'מעבר לדף הקבוצה',
                    'votes.results.closeButton': 'סגור',
                    'voting.alreadyVotedThisGroup': 'כבר הצבעת לקבוצה זו, לא ניתן להצביע שוב.',
                    'imageCrop.title': 'חתוך תמונה',
                    // === campaign page - missing keys ===

                    // HE
                    'campaign.loginRequired.title': 'לא ניתן לצפות בקמפיין',
                    'campaign.loginRequired.message': 'כדי לצפות בדף הקמפיין עליך להתחבר למערכת.',
                    'campaign.loginRequired.goToLogin': 'לעמוד התחברות',

                    'campaign.posts.deletedSuccessfully': 'הפוסט נמחק בהצלחה',
                    'campaign.posts.deleteError': 'שגיאה במחיקת הפוסט',

                    'campaign.share.linkLabel': 'קישור לשיתוף:',
                    'campaign.share.copy': 'העתק',
                    'campaign.share.copied': 'הועתק!',
                    'campaign.share.done': 'סיום',

                    // ===== unified groups (HE) =====
                    groups: {
                        list: {
                            tour: {
                                header: "כאן נמצאים הכלים של עמוד הקבוצות",
                                cardTitle: "כאן מוצג שם הקבוצה",
                                cardBadges: "סמלים המציינים סטטוס כמו נעול או הגשת מועמדות פתוחה",
                                cardDesc: "כאן מופיע תיאור קצר של הקבוצה",
                                cardOwner: "כאן מופיע מי מנהל/ת את הקבוצה",
                                cardFooter: "כאן מוצג תאריך סיום הקבוצה או שהיא פגה",
                                cardActions: "כאן נמצאים כפתורי הפעולה",
                            },
                            card: {
                                candidateOpenTitle: "הגשת מועמדות פתוחה",
                                votingOpenTitle: "הצבעה פתוחה",
                            },
                        },

                        detail: {
                            error: {
                                loadFailed: "שגיאה בטעינת הקבוצה.",
                                candidatesFailed: "שגיאה בטעינת המועמדים",
                            },
                            buttons: {
                                backToList: "חזרה לרשימת הקבוצות",
                                backToGroups: "כל הקבוצות",
                                joinRequest: "בקשת הצטרפות",
                                goVote: "להצבעה בקלפי",
                                settings: "הגדרות קבוצה",
                            },
                            locked: {
                                title: "קבוצה נעולה",
                                mustLogin:
                                    'קבוצה זו נעולה. כדי לבקש הצטרפות עליה יש להתחבר למערכת ולאחר מכן לשלוח בקשת הצטרפות מעמוד "קבוצות".',
                                notMember:
                                    'אינך מחובר/ת לקבוצה זו. כדי להצטרף, חזור/י לעמוד הקבוצות ולחץ/י על "בקשת הצטרפות" בקבוצה המתאימה.',
                            },
                            loading: "טוען נתוני קבוצה…",
                            meta: {
                                creationDate: "תאריך יצירה:",
                                endDate: "תאריך סיום:",
                                totalVotes: "סך הצבעות:",
                                notAvailable: "לא זמין",
                            },
                            toast: {
                                mustLoginToVote: "אינך מחובר/ת. כדי להצביע צריך להתחבר.",
                            },
                            candidates: {
                                title: "המועמדים",
                                loading: "טוען מועמדים...",
                                none: "אין מועמדים",
                                imageAlt: "תמונת מועמד",
                                votesLabelShort: "קולות",
                                unknownName: "לא ידוע",
                                cardVotesSuffix: "קולות",
                                myCampaignTitle: "קמפיין שלי",
                            },
                            infoCards: {
                                timeLeft: "זמן עד סיום",
                                totalVotes: "סך הצבעות",
                                candidatesCount: "מספר מועמדים",
                                winnersCount: "מספר מקומות לזוכים",
                            },
                            charts: {
                                pieTitle: "אחוזי הצבעה",
                                barTitle: "מספר קולות",
                                tooltipVotesSuffix: "קולות",
                                noVotes: "🕐 אין הצבעות — לא ניתן להציג גרפים",
                            },

                            tabs: {
                                candidates: "מועמדים",
                                info: "מידע וגרפים",
                            },
                            readMore: {
                                more: "עוד",
                                less: "פחות",
                            },
                            survey: {
                                title: "סקר תמיכה (לא תוצאות רשמיות)",
                                note: "נתוני הסקר מתבססים על תמיכה בקמפיין. רק מועמד עם קמפיין פעיל יכול לקבל תמיכה.",
                                tooltipSupportSuffix: "תמיכה",
                            },
                            common: {
                                unknown: "לא ידוע",
                            },

                            tour: {
                                header: "כאן מוצג שם הקבוצה והתיאור שלה",
                                meta: "כאן תראה את תאריך היצירה, תאריך הסיום וסך הקולות",
                                voteButton: "לחץ כאן כדי להצביע למועמדים!",
                                candidateCard: "כל כרטיס מציג מועמד עם תמונה, שם ותיאור",
                                settingsButton: "כבעל הקבוצה, תוכל לנהל את הקבוצה מכאן",
                            },
                        },
                    },

                    // ===== unified members (HE) =====
                    members: {
                        title: "משתתפי הקבוצה",
                        empty: "אין משתתפים עדיין.",
                        noName: "(ללא שם)",
                        created: "נוצר",
                        joined: "הצטרף",
                        remove: "הסרה",
                    },



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

                    'voting.insertEnvelope': 'Insert envelope into ballot',
                    'voting.voteSuccessToast': 'Your vote has been recorded',
                    'voting.confirmVoteMessage': 'Are you sure you want to vote for candidate {{name}}?',
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
                    'groups.list.filters.votingOpen': 'Groups open for voting',

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
                    // === chat (group chat) ===
                    'chat.title': 'Chat',
                    'chat.readOnlyNote': 'You can only read messages. Only group members can write.',
                    'chat.loading': 'Loading messages…',
                    'chat.noMessages': 'No messages yet. Start the conversation 🙂',
                    'chat.participantFallback': 'Participant',
                    'chat.messageDeleted': 'Message deleted',

                    'chat.menu.optionsTitle': 'Options',
                    'chat.menu.edit': 'Edit',
                    'chat.menu.delete': 'Delete',

                    'chat.confirmDelete': 'Delete this message?',
                    'chat.editingBar.text': 'Editing message',
                    'chat.editingBar.cancel': 'Cancel',

                    'chat.moreButton.title': 'More actions',
                    'chat.moreMenu.summary': 'AI chat summary',
                    'chat.moreMenu.summarizing': 'Summarizing…',

                    'chat.input.placeholder': 'Type a message…',
                    'chat.input.readonlyPlaceholder': "You don't have permission to write in this chat",

                    'chat.emojiButton.title': 'Emojis',
                    'chat.emoji.searchPlaceholder': 'Search',

                    'chat.sendButton.title': 'Send message',

                    'chat.errors.loadFailed': 'Failed to load messages',
                    'chat.errors.sendFailed': 'Failed to send message',
                    'chat.errors.updateFailed': 'Failed to update message',
                    'chat.errors.deleteFailed': 'Failed to delete message',
                    'chat.errors.summaryFailed': 'Failed to summarize chat',
                    // === candidates form ===
                    'candidates.form.nameLabel': 'Name *',
                    'candidates.form.descriptionLabel': 'Description *',
                    'candidates.form.symbolLabel': 'Symbol *',
                    'candidates.form.symbolPlaceholder': 'e.g.: A',
                    'candidates.form.photoLabel': 'Image',
                    'candidates.form.previewAlt': 'Preview',
                    'candidates.form.changePhoto': 'Change image',
                    'candidates.form.removePhoto': 'Remove image',
                    'candidates.form.uploading': 'Uploading…',
                    // === candidate requests tab ===
                    'candidates.requests.title': 'Candidate requests',
                    'candidates.requests.loading': 'Loading…',
                    'candidates.requests.empty': 'No requests.',
                    'candidates.requests.approve': 'Approve',
                    'candidates.requests.reject': 'Reject',
                    // === candidates tab (list & add) ===
                    'candidates.tab.title': 'Candidates',
                    'candidates.list.loading': 'Loading candidates…',
                    'candidates.list.empty': 'No candidates in this group.',
                    'candidates.list.noName': '(No name)',
                    'candidates.list.photoAlt': 'Candidate picture',
                    'candidates.list.photoAltWithName': 'Picture of candidate {{name}}',
                    'candidates.list.edit': 'Edit',
                    'candidates.list.remove': 'Remove',

                    'candidates.add.title': 'Add candidate',
                    'candidates.add.submit': 'Add candidate',

                    'candidates.upload.error': 'Error uploading image',
                    // === group settings – danger zone ===
                    'groupSettings.danger.title': 'Delete Group',
                    'groupSettings.danger.warning':
                        'Deleting is irreversible. All group data will be removed for all members.',
                    'groupSettings.danger.deleteButton': 'Delete group…',
                    // === group settings – delete modal ===
                    'groupSettings.deleteModal.title': 'Delete the group',
                    'groupSettings.deleteModal.typeToConfirm': 'To confirm, type the following:',
                    'groupSettings.deleteModal.mustMatch': 'You must type the exact value above',
                    'groupSettings.deleteModal.deleteForever': 'Delete group permanently',
                    // === edit candidate modal ===
                    'candidates.edit.title': 'Edit candidate',
                    'candidates.edit.save': 'Save',
                    'candidates.edit.saving': 'Saving…',
                    // === common ===
                    'common.edit': 'Edit',

                    // === group settings – general tab ===
                    'groupSettings.general.title': 'Group details',
                    'groupSettings.general.status': 'Status',
                    'groupSettings.general.symbolLabel': 'Symbol',
                    'groupSettings.general.photoLabel': 'Image',
                    'groupSettings.general.photoOpen': 'Open',
                    'groupSettings.general.createdBy': 'Created by',
                    'groupSettings.general.shareLinkLabel': 'Share link',
                    'groupSettings.general.shareInputAria': 'Share link',
                    'groupSettings.general.shareCopy': 'Copy',
                    'groupSettings.general.shareCopied': 'Copied ✓',
                    'groupSettings.general.shareHintLocked':
                        'Locked group: the link will ask the user to log in and then send a join request.',
                    'groupSettings.general.shareHintOpen':
                        'Open group: the link leads directly to the group page.',
                    'groupSettings.general.updateSuccess': 'Saved successfully',
                    'groupSettings.general.lockedHint': 'Locked group (members join via requests)',
                    'groupSettings.general.symbolLabelOptional': 'Symbol (optional)',
                    'groupSettings.general.symbolPlaceholder': 'e.g.: A',
                    // === candidates validation ===
                    'candidates.validation.nameRequired': 'Name is required',
                    'candidates.validation.nameTooShort': 'Name must be at least 2 characters long',
                    'candidates.validation.nameTooLong': 'Name is too long (maximum 50 characters)',
                    'candidates.validation.descriptionTooLong': 'Description is too long (maximum 500 characters)',
                    'candidates.validation.symbolTooLong': 'Symbol can contain up to 3 characters',
                    // === common ===
                    'common.edit': 'Edit',
                    'common.uploadError': 'An error occurred while uploading the file',
                    'common.noName': 'No name',

                    // === group settings – page ===
                    'groupSettings.pageTitle': 'Group settings',
                    'groupSettings.loadingResolving': 'Loading group data...',
                    'groupSettings.loading': 'Loading...',
                    'groupSettings.notFound': 'Group not found.',
                    'groupSettings.noGroup': 'No group found.',
                    'groupSettings.backToGroups': 'Back to groups list',
                    'groupSettings.noPermissionText':
                        'You do not have management permissions for this group. Only the group owner/admin can view and change the settings. If you need a change, please contact the group admin.',

                    // header buttons
                    'groupSettings.header.detailsTooltip': 'Group details',
                    'groupSettings.header.backTooltip': 'Back to groups',

                    // sidebar
                    'groupSettings.sidebar.general': 'Group details',
                    'groupSettings.sidebar.candidates': 'Candidates',
                    'groupSettings.sidebar.voters': 'Voters',
                    'groupSettings.sidebar.members': 'Group members',
                    'groupSettings.sidebar.danger': 'Danger zone',

                    // confirm actions
                    'groupSettings.removeMemberConfirm': 'Remove {{name}} from the group?',
                    'groupSettings.deleteCandidateConfirm': 'Remove {{name}}?',

                    // candidates – delete
                    'candidates.errors.deleteIdMissing': 'Candidate deletion failed – id not found',
                    joinRequests: {
                        title: 'Join requests',
                        loading: 'Loading requests…',
                        empty: 'No requests at the moment.',
                        approve: 'Approve',
                        reject: 'Reject',
                    },
                    members: {
                        noName: '(No name)',
                        created: 'Created',
                        joined: 'Joined',
                        remove: 'Remove',
                    },
                    members: {
                        noName: '(No name)',
                        created: 'Created',
                        joined: 'Joined',
                        remove: 'Remove',
                        title: 'Group members',
                        empty: 'No members yet.',
                    },
                    voters: {
                        title: 'Voters',
                        loading: 'Loading voters…',
                        empty: 'No voters yet.',
                    },
                    candidateApply: {
                        invalidGroup: '❌ Invalid group. Please refresh the page.',
                        mustLogin: 'You must be logged in to apply as a candidate.',
                        status: {
                            pending: '📝 Your candidate request is being reviewed by the admin.',
                            approved: '✅ Your candidate request was approved. You are already a candidate in this group.',
                            rejected: '⚠️ Your candidate request was rejected – you may submit a new request.',
                            removed: '⚠️ Your previous candidacy was removed by the admin – you may submit a new request.',
                        },
                        title: 'Apply as candidate',
                        subtitle: 'Fill in your details to apply as a candidate in this group',
                        nameRequired: 'Full name is required',
                        submit: 'Submit application',
                        submitting: 'Submitting...',
                        success: 'Your candidate request has been sent to the group admin!',
                        genericError: 'Unexpected error occurred',
                    },
                    toastDemo: {
                        title: '🎨 React Hot Toast Examples',
                        subtitle: 'Click the buttons to see different types of toasts',

                        // Toast texts
                        success: 'Action completed successfully!',
                        error: 'Oops! Something went wrong',
                        info: 'This is a regular info message',
                        warning: '⚠️ Warning: please pay attention to the details',
                        loading: 'Loading data...',
                        loaded: 'Data loaded!',
                        promiseLoading: 'Saving data...',
                        promiseSuccess: 'Data saved successfully!',
                        promiseError: 'Error saving data',
                        customTitle: 'Custom toast message!',
                        customText: 'This is your special design',
                        longText:
                            'This is a longer message to demonstrate how a long text looks inside the toast. It works great even with lots of content.',
                        emoji: '🚀 The system is launching!',
                        multiFirst: 'First message',
                        multiSecond: 'Second message',
                        multiThird: 'Third message',

                        // Buttons
                        buttons: {
                            success: '✓ Success toast',
                            error: '✕ Error toast',
                            info: 'ℹ Info toast',
                            warning: '⚠ Warning toast',
                            loading: '⏳ Loading toast',
                            promise: '🔄 Promise toast',
                            custom: '✨ Custom toast',
                            longText: '📝 Long text',
                            emoji: '🎯 With emoji',
                            multiple: '📚 Multiple toasts',
                        },

                        // Tips box
                        tipsTitle: '💡 Tips:',
                        tips: {
                            autoHide: 'Toasts disappear automatically after 3 seconds',
                            close: 'You can close a toast manually by clicking it',
                            multiple: 'Multiple toasts can be displayed at the same time',
                            animation: 'Each toast has a smooth animation',
                        },
                    },
                    'groups.create.ai.fillNameFirstError': 'Please fill in a group name first',
                    'groups.create.ai.tooltip': 'Help writing a description with AI',
                    // campaign page
                    'campaign.loadingUser': 'Loading user…',
                    'campaign.loading': 'Loading campaign…',
                    'campaign.errorPrefix': 'Error: ',

                    'common.back': 'Back',
                    'common.linkCopied': 'Link copied to clipboard!',

                    'campaign.header.finishEdit': 'Finish editing',
                    'campaign.header.editPage': 'Edit page',

                    'campaign.editCandidate': 'Edit candidate',

                    'campaign.sections.posts': 'Posts',
                    'campaign.sections.about': 'About',
                    'campaign.sections.gallery': 'Image gallery',

                    'campaign.posts.new.titlePlaceholder': 'Post title',
                    'campaign.posts.new.contentPlaceholder': 'Post content',
                    'campaign.posts.new.youtubePlaceholder': 'YouTube link (optional)',
                    'campaign.posts.new.addButton': 'Add post',
                    'campaign.posts.new.aiHelpButton': 'Help from AI',
                    'campaign.posts.empty': 'No posts in this campaign',
                    'campaign.posts.confirmDelete': 'Delete this post?',

                    'campaign.description.placeholder': 'Add a description for the campaign',
                    'campaign.description.empty': 'No campaign description yet',
                    'campaign.description.editButton': 'Edit description',

                    'campaign.stats.views': 'views',
                    'campaign.stats.share': 'Share',
                    'campaign.share.text': 'Come meet {{name}}',

                    'campaign.gallery.upload.linkPlaceholder': 'Image link',
                    'campaign.gallery.upload.addButton': 'Add',
                    'campaign.gallery.upload.orText': 'Or upload from your computer:',
                    'campaign.gallery.empty': 'No images in the gallery',
                    'campaign.gallery.imageAlt': 'Image {{index}}',
                    'campaign.gallery.lightboxAlt': 'Enlarged image',

                    'campaign.ai.modal.title': 'Help writing a post (AI)',
                    'campaign.ai.modal.subtitle':
                        'The system will use the candidate and group names and generate a short first-person post.',
                    'campaign.ai.modal.titleLabelGenerated': 'Post title:',
                    'campaign.ai.modal.titleLabel': 'Suggested title:',
                    'campaign.ai.modal.titlePlaceholder': 'Post title for {{name}}',
                    'campaign.ai.modal.candidateFallback': 'the candidate',
                    'campaign.ai.modal.contentLabelGenerated': 'Content:',
                    'campaign.ai.modal.contentLabel': 'What to write about?',
                    'campaign.ai.modal.contentPlaceholder':
                        'For example: focus on transparency, helping group members...',
                    'campaign.ai.modal.generateButton': 'Generate post with AI',
                    'campaign.ai.modal.generating': 'Generating post…',
                    'campaign.ai.modal.savePost': 'Save post',

                    'campaign.editCandidate.uploadError': 'Error uploading candidate image',
                    'campaign.editCandidate.missingIds': 'Missing group or candidate id for update',
                    'campaign.editCandidate.errors.nameRequired': 'Candidate name is required',
                    'campaign.editCandidate.errors.descriptionRequired': 'Description is required',
                    'campaign.editCandidate.errors.symbolRequired': 'Symbol is required',
                    'campaign.editCandidate.genericError': 'Error updating candidate',

                    'campaign.posts.deletePostTitle': 'Delete post',

                    'campaign.comments.toggleLabel': '{{count}} comments',
                    'campaign.comments.confirmDelete': 'Delete this comment?',
                    'campaign.comments.placeholder': 'Write a comment...',
                    'campaign.comments.sending': 'Sending...',
                    'campaign.comments.send': 'Send',
                    'campaign.comments.empty': 'No comments yet',
                    'campaign.comments.anonymousUser': 'User',
                    'campaign.comments.deleteButtonTitle': 'Delete comment',

                    'common.nothingToSave': 'No changes to save',
                    "about": {
                        "hero": {
                            "badge": "Digital Election Platform",
                            "title": "Democratic, Simple, and Accessible Elections for Everyone",
                            "subtitle": "A comprehensive platform for managing online elections - from class representatives to employee committees. Everything you need for a transparent, secure, and democratic election process.",
                            "ctaPrimary": "Get Started",
                            "ctaSecondary": "Create Election Group"
                        },
                        "mission": {
                            "title": "Our Mission",
                            "text": "We believe that every election, whether it's a class representative or an employee committee, deserves a democratic, transparent, and secure process. Our platform enables any organization, community, or group to manage elections professionally and user-friendly, while maintaining voter privacy and process integrity. Additionally, we contribute to a greener environment by reducing the use of paper and physical resources."
                        },
                        "features": {
                            "sectionTitle": "Why Choose Us?",
                            "democratic": {
                                "title": "True Democracy",
                                "desc": "Everyone can vote for whoever they want, with complete confidentiality. Results are displayed only after the election ends to prevent influencing voters."
                            },
                            "privacy": {
                                "title": "Complete Privacy",
                                "desc": "No one knows who voted for whom. Vote counts aren't displayed during the election, only at the end - to maintain fairness and prevent persuasion."
                            },
                            "campaigns": {
                                "title": "Digital Campaigns",
                                "desc": "Each candidate can create their own campaign, upload content, persuade, and present themselves in the best way possible."
                            },
                            "secure": {
                                "title": "Secure & Reliable",
                                "desc": "A secure and reliable system that ensures every vote counts and results are genuine. Option to define multiple winner positions (first, second, third, etc.)."
                            },
                            "green": {
                                "title": "Environmentally Friendly",
                                "desc": "Online elections mean less paper, fewer printouts, and less waste. A small but important contribution to our green environment."
                            }
                        },
                        "useCases": {
                            "sectionTitle": "Who Is This For?",
                            "student": {
                                "title": "Schools & Classes",
                                "desc": "Class representatives, student council, or any school elections - in a simple and fun way."
                            },
                            "workplace": {
                                "title": "Employee Committees",
                                "desc": "Elections for employee committees, employee representatives, or any organizational role - professionally and securely."
                            },
                            "community": {
                                "title": "Communities & Organizations",
                                "desc": "Building committees, volunteer organizations, social groups - any community can manage democratic elections."
                            },
                            "organization": {
                                "title": "Any Type of Election",
                                "desc": "From serious elections to small private ones - our platform fits everyone."
                            }
                        },
                        "cta": {
                            "title": "Ready to Start?",
                            "desc": "Join us and turn your next elections into a digital, democratic, and professional experience.",
                            "button": "Create Election Group Now"
                        }
                    },

                    // User Guide - Enhanced page
                    'guide.pageTitle': 'User Guide',
                    'guide.pageSubtitle': 'Everything you need to know about the system in one place',

                    'guide.flow.title': 'System Flow Diagram',
                    'guide.flow.register': 'Sign up',
                    'guide.flow.createGroup': 'Create a group',
                    'guide.flow.votes': 'Voting',
                    'guide.flow.notifications': 'Notifications',

                    'guide.steps.registerTitle2': 'Sign up',
                    'guide.steps.registerDesc2': 'Create a new account in just a few minutes',
                    'guide.steps.registerDetails.0': 'Fill in the basic details',
                    'guide.steps.registerDetails.1': 'Verify your email address',
                    'guide.steps.registerDetails.2': 'Create a strong and secure password',
                    'guide.steps.registerDetails.3': 'Start using the system right away',

                    'guide.steps.groupsTitle2': 'Group management',
                    'guide.steps.groupsDesc2': 'Create and join groups, invite members, and manage permissions',
                    'guide.steps.groupsDetails.0': 'Create a new group with a name and description',
                    'guide.steps.groupsDetails.1': 'Invite users via a link or email',
                    'guide.steps.groupsDetails.2': 'Set roles and permissions',
                    'guide.steps.groupsDetails.3': 'Track group activity',

                    'guide.steps.votesTitle2': 'Votes & polls',
                    'guide.steps.votesDesc2': 'Create votes, vote, and see results in real time',
                    'guide.steps.votesDetails.0': 'Create a new vote with multiple options',
                    'guide.steps.votesDetails.1': 'Set an end time for the vote',
                    'guide.steps.votesDetails.2': 'Vote quickly and easily',
                    'guide.steps.votesDetails.3': 'View detailed visual results',

                    'guide.steps.notificationsTitle2': 'Notifications & updates',
                    'guide.steps.notificationsDesc2': 'Get notified about important activity in your groups',
                    'guide.steps.notificationsDetails.0': 'Alerts for new votes',
                    'guide.steps.notificationsDetails.1': 'Updates on vote results',
                    'guide.steps.notificationsDetails.2': 'Invitations to new groups',
                    'guide.steps.notificationsDetails.3': 'Customize notification preferences',

                    'guide.tips.sectionTitle': 'Tips & extra features',
                    'guide.tips.shortcutsTitle2': 'Shortcuts',
                    'guide.tips.shortcutsDesc2': 'Use keyboard shortcuts to move quickly between pages',
                    'guide.tips.mobileTitle2': 'Mobile version',
                    'guide.tips.mobileDesc2': 'Use the system from any device, anywhere',
                    'guide.tips.privacyTitle2': 'Privacy & security',
                    'guide.tips.privacyDesc2': 'Your data is protected and secure',
                    'guide.tips.supportTitle2': 'Technical support',
                    'guide.tips.supportDesc2': 'Our support team is available 24/7',
                    'groups.create.ai.noDescriptionError': 'No AI description was returned',
                    'groups.create.ai.createdToast': 'Suggested description created',
                    'groups.create.ai.genericError': 'Error generating an automatic description',
                    'groups.create.ai.appliedToast': 'Description updated from AI',

                    'groups.create.ai.modal.title': 'Help writing a description (AI)',
                    'groups.create.ai.modal.subtitle':
                        'The system will use the group name and your hint to suggest a short and clear description (2–4 lines).',

                    'groups.create.ai.hintLabel': 'What should the description include?',
                    'groups.create.ai.hintPlaceholder': 'Optional — you can leave it empty',

                    'groups.create.ai.generating': 'Generating…',
                    'groups.create.ai.generate': 'Generate suggestion',

                    'groups.create.ai.previewLabel': 'Suggested description:',
                    'groups.create.ai.useDescription': 'Use description',
                    chat: {
                        confirmDelete: "Delete this message?"
                    },
                    // ===== vote results notifier =====
                    'votes.results.modalTitle': 'Voting has ended!',
                    'votes.results.modalText': 'Voting in the group "{{name}}" has ended and there is a winner 🎉',
                    'votes.results.winnersLabel': 'Winner(s):',
                    'votes.results.seeWinnerButton': 'Go to group page',
                    'votes.results.closeButton': 'Close',
                    'voting.alreadyVotedThisGroup': 'You already voted in this group. You cannot vote again.',
                    'imageCrop.title': 'Crop image',
                    // EN
                    'campaign.loginRequired.title': 'Cannot view campaign',
                    'campaign.loginRequired.message': 'To view this campaign page, you must log in.',
                    'campaign.loginRequired.goToLogin': 'Go to login',

                    'campaign.posts.deletedSuccessfully': 'Post deleted successfully',
                    'campaign.posts.deleteError': 'Failed to delete post',

                    'campaign.stats.supp': 'supporters',

                    'campaign.share.linkLabel': 'Share link:',
                    'campaign.share.copy': 'Copy',
                    'campaign.share.copied': 'Copied!',
                    'campaign.share.done': 'Done',
                    // ===== unified groups (EN) =====
                    groups: {
                        list: {
                            tour: {
                                header: "These are the tools on the Groups page",
                                cardTitle: "This is the group name",
                                cardBadges: "Badges show statuses like locked or candidate submissions open",
                                cardDesc: "This is a short description of the group",
                                cardOwner: "This shows who manages the group",
                                cardFooter: "This shows the end date (or that the group expired)",
                                cardActions: "These are the available actions",
                            },
                            card: {
                                candidateOpenTitle: "Candidate submissions are open",
                                votingOpenTitle: "Voting is open",
                            },
                        },

                        detail: {
                            error: {
                                loadFailed: "Failed to load group.",
                                candidatesFailed: "Failed to load candidates.",
                            },
                            buttons: {
                                backToList: "Back to groups list",
                                backToGroups: "All groups",
                                joinRequest: "Request to join",
                                goVote: "Go to ballot",
                                settings: "Group settings",
                            },
                            locked: {
                                title: "Locked group",
                                mustLogin:
                                    'This group is locked. To request joining, please log in and send a join request from the "Groups" page.',
                                notMember:
                                    'You are not a member of this group. To join, go back to the groups page and click "Request to join" on the relevant group.',
                            },
                            loading: "Loading group data…",
                            meta: {
                                creationDate: "Creation date:",
                                endDate: "End date:",
                                totalVotes: "Total votes:",
                                notAvailable: "N/A",
                            },
                            toast: {
                                mustLoginToVote: "You are not logged in. Please log in to vote.",
                            },
                            candidates: {
                                title: "Candidates",
                                loading: "Loading candidates...",
                                none: "No candidates yet",
                                imageAlt: "Candidate image",
                                votesLabelShort: "votes",
                                unknownName: "Unknown",
                                cardVotesSuffix: "votes",
                                myCampaignTitle: "My campaign",
                            },
                            infoCards: {
                                timeLeft: "Time remaining",
                                totalVotes: "Total votes",
                                candidatesCount: "Number of candidates",
                                winnersCount: "Number of winner spots",
                            },
                            charts: {
                                pieTitle: "Voting distribution",
                                barTitle: "Number of votes",
                                tooltipVotesSuffix: "votes",
                                noVotes: "🕐 No votes — cannot display charts",
                            },

                            tabs: {
                                candidates: "Candidates",
                                info: "Info & Charts",
                            },
                            readMore: {
                                more: "More",
                                less: "Less",
                            },
                            survey: {
                                title: "Support poll (not official results)",
                                note: "Poll data is based on campaign support. Only candidates with an active campaign can receive support.",
                                tooltipSupportSuffix: "supports",
                            },
                            common: {
                                unknown: "Unknown",
                            },

                            tour: {
                                header: "Here you can see the group name and its description",
                                meta: "Here you can view the creation date, end date, and total votes",
                                voteButton: "Click here to vote for candidates!",
                                candidateCard: "Each card shows a candidate with a photo, name, and description",
                                settingsButton: "As the group owner, you can manage the group from here",
                            },
                        },
                    },

                    // ===== unified members (EN) =====
                    members: {
                        title: "Group members",
                        empty: "No members yet.",
                        noName: "(No name)",
                        created: "Created",
                        joined: "Joined",
                        remove: "Remove",
                    },

                },
            },
        },
    });

export default i18n;
