import type { DemoUser } from "./types";

const toBase64Url = (input: string): string => {
    let base64: string | undefined;
    if (typeof Buffer !== "undefined") {
        base64 = Buffer.from(input, "utf8").toString("base64");
    } else if (typeof btoa === "function") {
        base64 = btoa(input);
    } else {
        base64 = (globalThis as unknown as { btoa?: typeof btoa }).btoa?.(
            input
        );
    }
    if (!base64) {
        throw new Error("Unable to encode base64 in this environment");
    }
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (segment: string): string => {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const pad =
        normalized.length % 4 === 0
            ? normalized
            : normalized + "=".repeat(4 - (normalized.length % 4));
    if (typeof Buffer !== "undefined") {
        return Buffer.from(pad, "base64").toString("utf8");
    }
    if (typeof atob === "function") {
        return atob(pad);
    }
    const browserAtob = (globalThis as unknown as { atob?: typeof atob }).atob;
    if (browserAtob) {
        return browserAtob(pad);
    }
    throw new Error("Unable to decode base64 in this environment");
};

export const createMockToken = (user: DemoUser): string => {
    const header = { alg: "none", typ: "JWT" };
    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
        isActive: user.isActive,
        companyName: user.companyName,
        address: user.address,
        productGroup: user.productGroup,
        assignedDistributorId: user.assignedDistributorId ?? null,
        priceListId: user.priceListId ?? null,
    };
    return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(
        JSON.stringify(payload)
    )}.demo-signature`;
};

export const decodeMockToken = (
    token: string
): Record<string, unknown> | null => {
    if (!token) return null;
    const segments = token.split(".");
    if (segments.length < 2) return null;
    try {
        const payloadJson = fromBase64Url(segments[1]);
        return JSON.parse(payloadJson) as Record<string, unknown>;
    } catch {
        return null;
    }
};
