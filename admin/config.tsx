// admin/config.tsx

import React from 'react';
import Link from 'next/link';
import type { AdminConfig } from '@keystone-6/core/types';
import { CustomNavigation } from './components/CustomNavigation';

const CustomLogo = () => (
    <Link href="/dashboard"><a style={{
        height: "100%",
        width: "100%",
        padding: "0.5rem 2.5rem",
        cursor: "pointer"
    }}>
        <img src="/images/snort-logo.png" alt='Snort logo' style={{
            height: "100%",
            width: "100%"
        }} />
    </a></Link>
);


export const components: AdminConfig['components'] = {
    Navigation: CustomNavigation,
    Logo: CustomLogo
}