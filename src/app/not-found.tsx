"use client";
import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', textAlign: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Page Not Found</h1>
            <p style={{ margin: 0 }}>The page you are looking for does not exist or has been moved.</p>
            <Link href="/">Go back home</Link>
        </div>
    );
}


