import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/config/demo";
import { createDemoState } from "@/mocks/data";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!DEMO_MODE) {
        return NextResponse.json(
            { message: "Proxy not configured in demo mode." },
            { status: 501 }
        );
    }

    const { id } = await params;
    const state = createDemoState();
    const chef = state.users.find(
        (user) => user.id === id && user.role === "CHEF"
    );
    if (!chef) {
        return NextResponse.json(
            { message: "Chef not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        chef: { productGroup: chef.productGroup },
    });
}
