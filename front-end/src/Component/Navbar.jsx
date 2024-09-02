import React from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Navbar() {
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className="nav">
            <Link to="/" className="site-title">PLOCLO</Link>
            <ul>
                <CustomLink to="/Page">{t('Insert Data')}</CustomLink>
                <CustomLink to="/process">{t('Edit Data')}</CustomLink>
                <CustomLink to="/aboutData">{t('About')}</CustomLink>
            </ul>
            <form className="d-flex">
                <label htmlFor="language-selector" className="me-2 text-white">Select Language:</label>
                <select
                    id="language-selector"
                    className="form-select"
                    onChange={(e) => changeLanguage(e.target.value)}
                    defaultValue={i18n.language}
                >
                    <option value="en">English</option>
                    <option value="ch">Chinese</option>
                </select>
            </form>
        </nav>
    );
}
//CustomLink ถูกใช้เพื่อสร้างลิงก์การนำทางที่ได้รับคลาส active อัตโนมัติเมื่อเส้นทางของมันตรงกับ URL ปัจจุบัน ซึ่งมีประโยชน์ในการเน้นหน้าปัจจุบันในเมนูการนำทาง

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>{children}</Link>
        </li>
    );
}
