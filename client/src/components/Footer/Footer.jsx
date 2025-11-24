// src/components/layout/Footer.jsx
import { FaInstagram, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import './Footer.css';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const year = new Date().getFullYear();
    const { t } = useTranslation();

    return (
        <footer className="site-footer">
            <div className="footer-inner">

                {/* טור טקסט על המערכת */}
                <div className="footer-col footer-col-main">
                    <h4>{t('footer.title')}</h4>
                    <p>
                        {t('footer.description.line1')}
                        <br />
                        {t('footer.description.line2')}
                    </p>
                    <p className="footer-tagline">
                        {t('footer.tagline')}
                    </p>
                </div>

                {/* טור קישורים */}
                <div className="footer-col">
                    <h4>{t('footer.usefulLinksTitle')}</h4>
                    <ul className="footer-links footer-links-grid">
                        <li><a href="/">{t('footer.link.home')}</a></li>
                        <li><a href="/groups">{t('footer.link.groups')}</a></li>
                        <li><a href="/user-guide">{t('footer.link.guide')}</a></li>
                        <li><a href="/about">{t('footer.link.about')}</a></li>
                        <li><a href="/contact">{t('footer.link.contact')}</a></li>
                    </ul>
                </div>

                {/* טור רשתות חברתיות */}
                <div className="footer-col footer-col-social">
                    <h4>{t('footer.followUs')}</h4>

                    <div className="footer-social-icons">
                        <a href="https://wa.me/972500000000" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
                        <a href="https://www.instagram.com/your_page" target="_blank" rel="noreferrer"><FaInstagram /></a>
                        <a href="https://t.me/your_channel" target="_blank" rel="noreferrer"><FaTelegramPlane /></a>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <span>© {year} {t('footer.bottomText')}</span>
            </div>

        </footer>
    );
}
