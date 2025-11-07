export const DEMO_MODE: boolean =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export const DEMO_DATA_VERSION = "2025-03-demo";

export interface DemoUserInfo {
    email: string;
    password: string;
    name: string;
    surname: string;
    role: "ADMIN" | "CLIENT" | "CHEF" | "DRIVER" | "DISTRIBUTOR";
    companyName: string;
}

export const DEMO_USERS: DemoUserInfo[] = [
    {
        email: "admin@sproject.demo",
        password: "demo123",
        name: "Ada",
        surname: "Karaca",
        role: "ADMIN",
        companyName: "SProject HQ",
    },
    {
        email: "lina@palmbistro.demo",
        password: "demo123",
        name: "Lina",
        surname: "Al Farsi",
        role: "CLIENT",
        companyName: "Palm Bistro Group",
    },
    {
        email: "omar@sunrisecatering.demo",
        password: "demo123",
        name: "Omar",
        surname: "Rahman",
        role: "CLIENT",
        companyName: "Sunrise Catering",
    },
    {
        email: "chef.selim@sproject.demo",
        password: "demo123",
        name: "Selim",
        surname: "Gursoy",
        role: "CHEF",
        companyName: "Production Lab (Sweets)",
    },
    {
        email: "driver.yusuf@sproject.demo",
        password: "demo123",
        name: "Yusuf",
        surname: "Iskandar",
        role: "DRIVER",
        companyName: "Dispatch Fleet",
    },
    {
        email: "nadia@coastaldist.demo",
        password: "demo123",
        name: "Nadia",
        surname: "Saab",
        role: "DISTRIBUTOR",
        companyName: "Coastal Distributors",
    },
];
