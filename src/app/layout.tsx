import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "../theme/ThemeRegistry";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { LoadingProvider } from "../context/LoadingContext";
import { ToastProvider } from "../components/ui/ToastProvider";
import { NotificationProvider } from "../context/NotificationContext";
import { ErrorProvider } from "../context/ErrorContext";
import { NotificationHandler } from "../components/NotificationHandler";
import { GlobalEventHandler } from "../components/GlobalEventHandler";
import GlobalLoadingOverlay from "../components/GlobalLoadingOverlay";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { BackgroundJobProvider } from "../components/ui/BackgroundJobProvider";
import { AppLayout } from "../components/layout/AppLayout";
import DemoRoleSwitcher from "../components/DemoRoleSwitcher";
import DemoWelcomeGuide from "../components/DemoWelcomeGuide";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Deras - Premium Catering Made Simple",
    description:
        "Streamline your catering operations with our all-in-one platform. From ordering to delivery, we've got you covered with premium quality service.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <meta name="emotion-insertion-point" content="" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeRegistry>
                    <LoadingProvider>
                        <ErrorProvider>
                            <NotificationProvider>
                                <AuthProvider>
                                    <CartProvider>
                                        <ToastProvider>
                                            <BackgroundJobProvider>
                                                <ErrorBoundary>
                                                    <NotificationHandler />
                                                    <GlobalLoadingOverlay />
                                                    <DemoRoleSwitcher />
                                                    <DemoWelcomeGuide />
                                                    <AppLayout>
                                                        <GlobalEventHandler>
                                                            {children}
                                                        </GlobalEventHandler>
                                                    </AppLayout>
                                                </ErrorBoundary>
                                            </BackgroundJobProvider>
                                        </ToastProvider>
                                    </CartProvider>
                                </AuthProvider>
                            </NotificationProvider>
                        </ErrorProvider>
                    </LoadingProvider>
                </ThemeRegistry>
            </body>
        </html>
    );
}
