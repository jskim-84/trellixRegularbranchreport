'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
    label: string;
    children?: { label: string; href: string }[];
};

const menuItems: MenuItem[] = [
    {
        label: 'LSITC',
        children: [
            { label: 'NX', href: '/reports?group=LSITC&type=NX' },
            { label: 'EX', href: '/reports?group=LSITC&type=EX' },
            { label: 'CM', href: '/reports?group=LSITC&type=CM' },
            { label: 'HX', href: '/reports?group=LSITC&type=HX' },
        ],
    },
    {
        label: 'LS Automotive',
        children: [
            { label: 'HX', href: '/reports?group=LS Automotive&type=HX' },
            { label: 'ETP', href: '/reports?group=LS Automotive&type=ETP' },
        ],
    },
    {
        label: '주성엔지니어링',
        children: [
            { label: 'NX', href: '/reports?group=주성엔지니어링&type=NX' },
            { label: 'EX', href: '/reports?group=주성엔지니어링&type=EX' },
            { label: 'CM', href: '/reports?group=주성엔지니어링&type=CM' },
        ],
    },
];

export default function Navbar() {
    const pathname = usePathname();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <nav style={{ background: '#1f2937', color: '#fff', borderBottom: '1px solid #374151' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', height: '60px' }}>
                <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginRight: '40px', textDecoration: 'none', color: '#fff' }}>
                    Trellix Report
                </Link>
                <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
                    {menuItems.map((menu) => (
                        <div
                            key={menu.label}
                            onMouseEnter={() => setActiveMenu(menu.label)}
                            onMouseLeave={() => setActiveMenu(null)}
                            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                        >
                            <span style={{ cursor: 'pointer', padding: '0 10px', color: '#e5e7eb', fontWeight: 500 }}>
                                {menu.label}
                            </span>

                            {activeMenu === menu.label && menu.children && (
                                <div style={{
                                    position: 'absolute',
                                    top: '60px',
                                    left: 0,
                                    background: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0 0 4px 4px',
                                    minWidth: '150px',
                                    zIndex: 50,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    {menu.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            style={{
                                                display: 'block',
                                                padding: '10px 15px',
                                                color: '#d1d5db',
                                                textDecoration: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
}
