module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.2vob68tjqpejf.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[project]/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Container.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$booking$2f$PackageCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/booking/PackageCard.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/endpoints.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/format.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const FEATURES = [
    {
        title: "Browse published packages",
        description: "Hajj, Ramadan Umrah, off-season Umrah, and Ziyarah — all in one place, with seats and prices in real time."
    },
    {
        title: "Reserve seats safely",
        description: "Concurrent seat-hold logic means you'll never oversell — your reservation is locked the moment you book."
    },
    {
        title: "Full payment or installments",
        description: "Pay the full amount or split into 2–3 installments. Final installments are due before departure."
    },
    {
        title: "Mobile-friendly",
        description: "Book and manage your trip from any device. All data is current — refreshing isn't required."
    }
];
const STEPS = [
    {
        step: "01",
        title: "Sign up",
        description: "Create an account with your name, email, and phone — takes a minute."
    },
    {
        step: "02",
        title: "Pick a package",
        description: "Browse packages by type, departure date, and price. Compare tiers (Economy, Standard, VIP)."
    },
    {
        step: "03",
        title: "Add pilgrims",
        description: "Submit passport info for each traveler — your seat count is reserved in real time."
    },
    {
        step: "04",
        title: "Pay securely",
        description: "Pay via bKash, Nagad, Visa, or manual bank deposit — with full or installment plans."
    }
];
async function HomePage() {
    let packages = [];
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listPackages"])({
            limit: 3,
            sort: "departure_date:asc"
        });
        packages = result.data;
    } catch  {
    // Backend offline is fine on first visit — show the landing without data.
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative overflow-hidden border-b border-border bg-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-emerald/5 to-transparent lg:block"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        size: "lg",
                        className: "relative py-20 sm:py-28",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid items-center gap-12 lg:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "inline-flex items-center rounded-pill border border-emerald/30 bg-emerald/10 px-3 py-1 text-meta font-semibold uppercase tracking-[0.04em] text-emerald",
                                            children: "Hajj & Umrah, simplified"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 75,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-hero font-bold leading-tight text-text",
                                            children: [
                                                "Book your spiritual journey with",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-emerald",
                                                    children: "confidence."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 78,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "max-w-lg text-lead text-text-muted",
                                            children: "Real-time seat availability, secure reservation, and transparent pricing. Plan your Hajj or Umrah package online — without the back-and-forth."
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 82,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/packages",
                                                    size: "lg",
                                                    children: "Browse packages"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 88,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/register",
                                                    size: "lg",
                                                    variant: "outline",
                                                    children: "Create account"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 91,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 87,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-meta text-text-subtle",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "✓ Secure reservation"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "✓ Installments available"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "✓ Refund-friendly"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 95,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        className: "relative overflow-hidden border-emerald/20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/10 blur-2xl"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle",
                                                                children: "Sample package"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 107,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded-pill border border-success/30 bg-success-bg px-2.5 py-0.5 text-meta font-medium text-success",
                                                                children: "Published"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 110,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 106,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-card-title font-bold text-text",
                                                                children: "Hajj Premium 2027"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 115,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-1 text-meta text-text-muted",
                                                                children: "16 days · Standard tier"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 118,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-3 gap-3 pt-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                                                label: "Departure",
                                                                value: "May 20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 123,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                                                label: "Seats",
                                                                value: "40 left"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 124,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Stat, {
                                                                label: "From",
                                                                value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$format$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatBDT"])(450000)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "border-t border-border pt-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/packages",
                                                            className: "text-default font-semibold text-emerald hover:underline",
                                                            children: "See all packages →"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 128,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 105,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-16 sm:py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    size: "lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-meta font-semibold uppercase tracking-[0.06em] text-emerald",
                                            children: "Featured"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 146,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "mt-1 text-section font-bold text-text",
                                            children: "Upcoming packages"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 149,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/packages",
                                    className: "text-default font-semibold text-emerald hover:underline",
                                    children: "View all →"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 144,
                            columnNumber: 11
                        }, this),
                        packages.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
                            children: packages.map((pkg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$booking$2f$PackageCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    pkg: pkg
                                }, pkg.id, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 163,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            className: "text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-default text-text-muted",
                                children: "Packages will appear here once the backend publishes them."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 167,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 143,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "border-y border-border bg-card py-16 sm:py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    size: "lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10 max-w-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-meta font-semibold uppercase tracking-[0.06em] text-emerald",
                                    children: "What you get"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 179,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mt-1 text-section font-bold text-text",
                                    children: "Everything you need to book with confidence"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 182,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 178,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
                            children: FEATURES.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    className: "h-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-default font-semibold text-text",
                                            children: f.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-meta text-text-muted",
                                            children: f.description
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 192,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, f.title, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 186,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 177,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-16 sm:py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    size: "lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-10 max-w-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-meta font-semibold uppercase tracking-[0.06em] text-emerald",
                                    children: "How it works"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "mt-1 text-section font-bold text-text",
                                    children: "Four steps from sign-up to seat"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 207,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
                            children: STEPS.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    className: "h-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-meta font-bold uppercase tracking-[0.06em] text-emerald",
                                            children: [
                                                "Step ",
                                                s.step
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 214,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "mt-2 text-default font-semibold text-text",
                                            children: s.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 217,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-meta text-text-muted",
                                            children: s.description
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 220,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, s.step, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 213,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 211,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 202,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "border-t border-border bg-card py-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    size: "md",
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-section font-bold text-text",
                            children: "Ready to start?"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 231,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-3 text-default text-text-muted",
                            children: "Browse the package catalog or create your account to reserve seats."
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 234,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 flex flex-wrap justify-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/packages",
                                    size: "lg",
                                    children: "Browse packages"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 238,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/register",
                                    size: "lg",
                                    variant: "outline",
                                    children: "Sign up"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 241,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 237,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 230,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
function Stat({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-chip border border-border bg-base p-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-meta uppercase tracking-[0.04em] text-text-subtle",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 254,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-0.5 text-default font-semibold text-text",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/components/booking/PackageCard.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PackageCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$booking$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/booking/StatusBadge.tsx [app-rsc] (ecmascript)");
;
;
;
const TYPE_LABELS = {
    HAJJ: "Hajj",
    RAMADAN_UMRAH: "Ramadan Umrah",
    OFF_SEASON_UMRAH: "Off-Season Umrah",
    ZIYARAH: "Ziyarah"
};
function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
function formatCurrency(n) {
    return `৳${n.toLocaleString("en-BD")}`;
}
function PackageCard({ pkg, className }) {
    const minPrice = pkg.tiers.length ? Math.min(...pkg.tiers.map((t)=>t.price)) : 0;
    const totalAvailable = pkg.tiers.reduce((sum, t)=>sum + (t.availableSeats ?? 0), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        href: `/packages/${pkg.id}`,
        className: "group flex flex-col gap-5 rounded-card border border-border bg-card p-6 transition-all duration-200 hover:border-emerald-light hover:shadow-[0_0_24px_rgba(4,120,87,0.08)] " + (className ?? ""),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-pill border border-emerald/30 bg-emerald/10 px-2.5 py-0.5 text-meta font-semibold text-emerald",
                        children: TYPE_LABELS[pkg.type] ?? pkg.type
                    }, void 0, false, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$booking$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        status: pkg.status
                    }, void 0, false, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-card-title font-semibold text-text group-hover:text-emerald transition-colors line-clamp-2",
                children: pkg.name
            }, void 0, false, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            pkg.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-default text-text-muted line-clamp-2 -mt-2",
                children: pkg.description
            }, void 0, false, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 text-meta text-text-subtle",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "12",
                                height: "12",
                                viewBox: "0 0 12 12",
                                fill: "none",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                        x: "0.5",
                                        y: "1.5",
                                        width: "11",
                                        height: "10",
                                        rx: "1.5",
                                        stroke: "currentColor"
                                    }, void 0, false, {
                                        fileName: "[project]/components/booking/PackageCard.tsx",
                                        lineNumber: 67,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M0.5 4.5h11",
                                        stroke: "currentColor"
                                    }, void 0, false, {
                                        fileName: "[project]/components/booking/PackageCard.tsx",
                                        lineNumber: 68,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M3 0.5v2M9 0.5v2",
                                        stroke: "currentColor",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/components/booking/PackageCard.tsx",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Departs ",
                                    formatDate(pkg.departureDate)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-meta text-text-subtle",
                        children: [
                            "Returns ",
                            formatDate(pkg.returnDate)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: pkg.tiers.map((tier)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-chip border border-border bg-base px-2 py-1 text-meta text-text-muted",
                        children: [
                            tier.name,
                            " — ",
                            formatCurrency(tier.price)
                        ]
                    }, tier.id, true, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 80,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto flex items-center justify-between border-t border-border pt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-meta text-text-subtle",
                                children: "Starting from"
                            }, void 0, false, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-card-title font-bold text-emerald",
                                children: formatCurrency(minPrice)
                            }, void 0, false, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-meta text-text-subtle",
                                children: "Seats"
                            }, void 0, false, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `text-default font-semibold ${totalAvailable === 0 ? "text-danger" : totalAvailable < 10 ? "text-warning" : "text-text"}`,
                                children: totalAvailable === 0 ? "Full" : `${totalAvailable} left`
                            }, void 0, false, {
                                fileName: "[project]/components/booking/PackageCard.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/booking/PackageCard.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/booking/PackageCard.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/booking/PackageCard.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/booking/StatusBadge.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cn.ts [app-rsc] (ecmascript)");
;
;
const STATUS_STYLES = {
    // Booking
    PENDING: "bg-warning-bg text-warning border-warning/30",
    PENDING_PAYMENT: "bg-warning-bg text-warning border-warning/30",
    PARTIALLY_PAID: "bg-info-bg text-info border-info/30",
    CONFIRMED: "bg-success-bg text-success border-success/30",
    EXPIRED: "bg-base text-text-subtle border-border-strong",
    CANCELLED: "bg-danger-bg text-danger border-danger/30",
    DEFAULTED: "bg-danger-bg text-danger border-danger/30",
    COMPLETED: "bg-success-bg text-success border-success/30",
    // Installment
    PAID: "bg-success-bg text-success border-success/30",
    OVERDUE: "bg-danger-bg text-danger border-danger/30",
    // Payment
    PROCESSING: "bg-info-bg text-info border-info/30",
    SUCCESS: "bg-success-bg text-success border-success/30",
    FAILED: "bg-danger-bg text-danger border-danger/30",
    // Cancellation / Refund
    REQUESTED: "bg-warning-bg text-warning border-warning/30",
    APPROVED: "bg-success-bg text-success border-success/30",
    REJECTED: "bg-danger-bg text-danger border-danger/30",
    // Manual Payment
    PENDING_APPROVAL: "bg-warning-bg text-warning border-warning/30",
    // Reconciliation
    MATCHED: "bg-success-bg text-success border-success/30",
    MISMATCH: "bg-danger-bg text-danger border-danger/30",
    RESOLVED: "bg-info-bg text-info border-info/30",
    // Package
    DRAFT: "bg-base text-text-subtle border-border-strong",
    PUBLISHED: "bg-success-bg text-success border-success/30",
    CLOSED: "bg-base text-text-subtle border-border-strong",
    // User status
    ACTIVE: "bg-success-bg text-success border-success/30",
    INACTIVE: "bg-base text-text-subtle border-border-strong",
    SUSPENDED: "bg-danger-bg text-danger border-danger/30"
};
const STATUS_LABELS = {
    PENDING: "Pending",
    PENDING_PAYMENT: "Pending Payment",
    PARTIALLY_PAID: "Partially Paid",
    CONFIRMED: "Confirmed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    DEFAULTED: "Defaulted",
    COMPLETED: "Completed",
    PAID: "Paid",
    OVERDUE: "Overdue",
    PROCESSING: "Processing",
    SUCCESS: "Success",
    FAILED: "Failed",
    REQUESTED: "Requested",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PENDING_APPROVAL: "Pending Approval",
    MATCHED: "Matched",
    MISMATCH: "Mismatch",
    RESOLVED: "Resolved",
    DRAFT: "Draft",
    PUBLISHED: "Published",
    CLOSED: "Closed",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended"
};
function StatusBadge({ status, className }) {
    const style = STATUS_STYLES[status] ?? "bg-base text-text-subtle border-border-strong";
    const label = STATUS_LABELS[status] ?? status;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center rounded-pill border px-2.5 py-0.5 text-meta font-medium", style, className),
        children: label
    }, void 0, false, {
        fileName: "[project]/components/booking/StatusBadge.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/api/client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiRequest",
    ()=>apiRequest,
    "setSessionExpiredHandler",
    ()=>setSessionExpiredHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/types.ts [app-rsc] (ecmascript)");
;
// Resolve the API base URL based on whether this code is running server-side
// (Next.js server component, inside the container network) or client-side
// (browser, talking to the host's published port).
//
// - Server: prefer `API_BASE_URL_SERVER` (set in docker env to `http://backend:3001/api/v1`),
//   fall back to `NEXT_PUBLIC_API_BASE_URL`, then to localhost.
// - Client: must use `NEXT_PUBLIC_API_BASE_URL` (browser is on the host, not the container).
function resolveApiBaseUrl() {
    const publicUrl = ("TURBOPACK compile-time value", "http://localhost:3001/api/v1") ?? "http://localhost:3001/api/v1";
    const serverUrl = process.env.API_BASE_URL_SERVER;
    // `typeof window === "undefined"` is true only during server-side rendering /
    // server component execution; on the browser it's always defined.
    if ("TURBOPACK compile-time truthy", 1) {
        return serverUrl ?? publicUrl;
    }
    //TURBOPACK unreachable
    ;
}
const API_BASE_URL = resolveApiBaseUrl();
/**
 * Notifies the AuthContext (if mounted) that the session can no longer be
 * extended. Kept as a noop default so the API client has no hard dependency
 * on React context — `AuthProvider` overrides it at mount time.
 */ let onSessionExpired = null;
function setSessionExpiredHandler(fn) {
    onSessionExpired = fn;
}
/**
 * Coalesces concurrent 401s so we only call /auth/refresh once even if
 * many in-flight requests expire at the same time.
 */ let refreshInflight = null;
async function tryRefreshAccessToken() {
    if (refreshInflight) return refreshInflight;
    refreshInflight = (async ()=>{
        try {
            const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            });
            return res.ok;
        } catch  {
            return false;
        } finally{
            // Allow the next 401 to start a fresh refresh attempt.
            refreshInflight = null;
        }
    })();
    return refreshInflight;
}
async function runFetch(path, options) {
    let url;
    try {
        url = new URL(`${API_BASE_URL}${path}`);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ApiError"](0, {
            message: "The app isn't configured with a valid API URL.",
            code: "BAD_CONFIG"
        });
    }
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)){
            if (value !== undefined) url.searchParams.set(key, String(value));
        }
    }
    const headers = {
        Accept: "application/json",
        ...options.headers
    };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    let response;
    try {
        response = await fetch(url, {
            method: options.method ?? "GET",
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            // Sends the HttpOnly auth cookie and accepts Set-Cookie from the server.
            credentials: "include"
        });
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ApiError"](0, {
            message: "Couldn't reach the server. Check your connection and try again.",
            code: "NETWORK_ERROR"
        });
    }
    return response;
}
async function readBody(response) {
    if (response.status === 204) return undefined;
    const text = await response.text();
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ApiError"](response.status || 0, {
            message: response.ok ? "The server sent back something unexpected. Please try again." : `Request failed (${response.status}).`,
            code: "BAD_RESPONSE"
        });
    }
}
async function apiRequest(path, options = {}) {
    const { skipRefresh, ...rest } = options;
    let response = await runFetch(path, rest);
    // Auto-refresh on 401 (browser-only — server-side renders don't have cookies).
    if (response.status === 401 && !skipRefresh && ("TURBOPACK compile-time value", "undefined") !== "undefined" && // Never try to refresh the refresh endpoint itself, login, or register.
    !/^\/?(auth\/login|auth\/register|auth\/refresh)/.test(path)) //TURBOPACK unreachable
    ;
    const data = await readBody(response);
    if (!response.ok) {
        // The backend wraps errors as { success: false, error: { code, message } }
        const errorBody = data;
        const body = errorBody?.error ?? {
            message: errorBody?.message || response.statusText || "Request failed",
            code: "UNKNOWN"
        };
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ApiError"](response.status, body);
    }
    return data;
}
}),
"[project]/lib/api/endpoints.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adjustQuota",
    ()=>adjustQuota,
    "adminGetBooking",
    ()=>adminGetBooking,
    "adminGetCancellation",
    ()=>adminGetCancellation,
    "adminGetPackage",
    ()=>adminGetPackage,
    "adminListBookings",
    ()=>adminListBookings,
    "adminListCancellations",
    ()=>adminListCancellations,
    "adminListPackages",
    ()=>adminListPackages,
    "adminListPayments",
    ()=>adminListPayments,
    "adminListRefunds",
    ()=>adminListRefunds,
    "approveCancellation",
    ()=>approveCancellation,
    "approveManualPayment",
    ()=>approveManualPayment,
    "approveRefund",
    ()=>approveRefund,
    "cancelBooking",
    ()=>cancelBooking,
    "cancelPilgrim",
    ()=>cancelPilgrim,
    "createBooking",
    ()=>createBooking,
    "createInventoryItem",
    ()=>createInventoryItem,
    "createInventoryTransaction",
    ()=>createInventoryTransaction,
    "createManualPayment",
    ()=>createManualPayment,
    "createPackage",
    ()=>createPackage,
    "createRefund",
    ()=>createRefund,
    "createTier",
    ()=>createTier,
    "createVendor",
    ()=>createVendor,
    "createVendorExpense",
    ()=>createVendorExpense,
    "deleteInventoryItem",
    ()=>deleteInventoryItem,
    "deletePackage",
    ()=>deletePackage,
    "deleteVendor",
    ()=>deleteVendor,
    "deleteVendorExpense",
    ()=>deleteVendorExpense,
    "fetchMe",
    ()=>fetchMe,
    "getAuditLog",
    ()=>getAuditLog,
    "getBooking",
    ()=>getBooking,
    "getPackage",
    ()=>getPackage,
    "getPackageAvailability",
    ()=>getPackageAvailability,
    "getPayment",
    ()=>getPayment,
    "importSettlement",
    ()=>importSettlement,
    "initiatePayment",
    ()=>initiatePayment,
    "listAuditLogs",
    ()=>listAuditLogs,
    "listBookingCancellations",
    ()=>listBookingCancellations,
    "listBookingRefunds",
    ()=>listBookingRefunds,
    "listBookings",
    ()=>listBookings,
    "listInstallments",
    ()=>listInstallments,
    "listInventoryItems",
    ()=>listInventoryItems,
    "listPackages",
    ()=>listPackages,
    "listPayments",
    ()=>listPayments,
    "listPilgrims",
    ()=>listPilgrims,
    "listReconciliation",
    ()=>listReconciliation,
    "listVendorExpenses",
    ()=>listVendorExpenses,
    "listVendors",
    ()=>listVendors,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "mockPaymentFail",
    ()=>mockPaymentFail,
    "mockPaymentSuccess",
    ()=>mockPaymentSuccess,
    "processRefund",
    ()=>processRefund,
    "register",
    ()=>register,
    "rejectCancellation",
    ()=>rejectCancellation,
    "rejectManualPayment",
    ()=>rejectManualPayment,
    "rejectRefund",
    ()=>rejectRefund,
    "reportBookings",
    ()=>reportBookings,
    "reportInstallments",
    ()=>reportInstallments,
    "reportOverview",
    ()=>reportOverview,
    "reportPayments",
    ()=>reportPayments,
    "reportRefunds",
    ()=>reportRefunds,
    "reportSeatQuota",
    ()=>reportSeatQuota,
    "requestCancellation",
    ()=>requestCancellation,
    "resolveReconciliation",
    ()=>resolveReconciliation,
    "updateInventoryItem",
    ()=>updateInventoryItem,
    "updatePackage",
    ()=>updatePackage,
    "updateTier",
    ()=>updateTier,
    "updateVendor",
    ()=>updateVendor
]);
/**
 * All API endpoint functions for the Hajj & Umrah Booking System.
 * Each function maps to one backend endpoint per docs/API_SPEC.md.
 *
 * Each function returns the camelCase / number-friendly shape produced by
 * `lib/api/normalize.ts`, so callers can import the camelCase domain types
 * from there without ever seeing a snake_case field or a DECIMAL-as-string.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/normalize.ts [app-rsc] (ecmascript)");
;
;
async function register(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/register", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function login(email, password) {
    // Backend returns { user, access_token, refresh_token }; the cookies are
    // set as HttpOnly by the response. We only need the user here.
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/login", {
        method: "POST",
        body: {
            email,
            password
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function logout() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/logout", {
        method: "POST"
    });
}
async function fetchMe() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/me");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function listPackages(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/packages", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePublicPackage"]),
        meta: res.meta
    };
}
async function getPackage(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/packages/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePublicPackage"])(res.data);
}
async function getPackageAvailability(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/packages/availability", {
        query: params
    });
    return res.data;
}
async function adminListPackages(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/packages", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAdminPackage"]),
        meta: res.meta
    };
}
async function adminGetPackage(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function createPackage(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/packages", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function updatePackage(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function deletePackage(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`, {
        method: "DELETE"
    });
}
async function createTier(packageId, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${packageId}/tiers`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function updateTier(tierId, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/tiers/${tierId}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function adjustQuota(tierId, total_quota) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/tiers/${tierId}/quota`, {
        method: "PATCH",
        body: {
            total_quota
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function createBooking(body, idempotencyKey) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/bookings", {
        method: "POST",
        body,
        headers: idempotencyKey ? {
            "Idempotency-Key": idempotencyKey
        } : undefined
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function listBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/bookings", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function getBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function cancelBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${id}/cancel`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function listPilgrims(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/pilgrims`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePilgrim"]);
}
async function cancelPilgrim(bookingId, pilgrimId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/pilgrims/${pilgrimId}/cancel`, {
        method: "POST"
    });
}
async function listInstallments(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/installments`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInstallment"]);
}
async function initiatePayment(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/payments", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function listPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/payments", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function getPayment(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/payments/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function mockPaymentSuccess(paymentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/mock-payments/${paymentId}/success`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function mockPaymentFail(paymentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/mock-payments/${paymentId}/fail`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function requestCancellation(bookingId, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/cancellation-request`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function listBookingCancellations(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/cancellation-requests`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"]);
}
async function adminListBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/bookings", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function adminGetBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/bookings/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function createManualPayment(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/manual-payments", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function approveManualPayment(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/manual-payments/${id}/approve`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function rejectManualPayment(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/manual-payments/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function adminListPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/payments", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function adminListCancellations(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/cancellations", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"]),
        meta: res.meta
    };
}
async function adminGetCancellation(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/cancellations/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function approveCancellation(id, body = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/cancellations/${id}/approve`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function rejectCancellation(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/cancellations/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function listBookingRefunds(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/refunds`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"]);
}
async function createRefund(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/refunds", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function adminListRefunds(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/refunds", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"]),
        meta: res.meta
    };
}
async function approveRefund(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/approve`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function processRefund(id, body = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/process`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function rejectRefund(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function listReconciliation(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reconciliation", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeReconciliation"]),
        meta: res.meta
    };
}
async function importSettlement(body) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reconciliation/import", {
        method: "POST",
        body
    });
}
async function resolveReconciliation(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/reconciliation/${id}/resolve`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeReconciliation"])(res.data);
}
async function listVendors(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendors", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeVendor"]),
        meta: res.meta
    };
}
async function createVendor(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendors", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeVendor"])(res.data);
}
async function updateVendor(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendors/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeVendor"])(res.data);
}
async function deleteVendor(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendors/${id}`, {
        method: "DELETE"
    });
}
async function listVendorExpenses(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendor-expenses", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeVendorExpense"]),
        meta: res.meta
    };
}
async function createVendorExpense(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendor-expenses", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeVendorExpense"])(res.data);
}
async function deleteVendorExpense(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendor-expenses/${id}`, {
        method: "DELETE"
    });
}
async function listInventoryItems(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/items", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInventoryItem"]),
        meta: res.meta
    };
}
async function createInventoryItem(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/items", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInventoryItem"])(res.data);
}
async function updateInventoryItem(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/inventory/items/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInventoryItem"])(res.data);
}
async function deleteInventoryItem(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/inventory/items/${id}`, {
        method: "DELETE"
    });
}
async function createInventoryTransaction(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/transactions", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInventoryTransaction"])(res.data);
}
async function reportOverview() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/overview");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeReportOverview"])(res.data);
}
async function reportBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/bookings", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function reportPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/payments", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function reportInstallments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/installments", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeInstallment"]),
        meta: res.meta
    };
}
async function reportRefunds() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/refunds");
    return res.data;
}
async function reportSeatQuota() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/seat-quota");
    // The seat-quota endpoint returns `{ summary, tiers }` not the standard envelope.
    // Handle both shapes defensively.
    if (res.data && typeof res.data === "object" && "tiers" in res.data) {
        const data = res.data;
        return {
            summary: data.summary,
            tiers: (data.tiers ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSeatQuotaRow"])
        };
    }
    const rows = res.data;
    return {
        summary: {
            total_quota: 0,
            held_seats: 0,
            confirmed_seats: 0,
            available_seats: 0,
            overall_utilization_percent: 0
        },
        tiers: (rows ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeSeatQuotaRow"])
    };
}
async function listAuditLogs(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/audit-logs", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAuditLog"]),
        meta: res.meta
    };
}
async function getAuditLog(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/audit-logs/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeAuditLog"])(res.data);
}
}),
"[project]/lib/api/normalize.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Normalization layer.
 *
 * The backend returns raw entity objects with snake_case fields and DECIMAL
 * money fields as strings. Components want camelCase + number-friendly money.
 * Every endpoint function in `./endpoints` runs its response through these
 * normalizers before returning, so the rest of the app sees one consistent
 * shape per resource.
 *
 * Conventions:
 * - snake_case → camelCase for field names.
 * - string DECIMALs → number (parseFloat).
 * - `null` → `undefined` for optional scalar fields (so `?.` chains work).
 * - nested raw objects (e.g. booking.package) are recursively normalized.
 */ __turbopack_context__.s([
    "normalizeAdminPackage",
    ()=>normalizeAdminPackage,
    "normalizeAuditLog",
    ()=>normalizeAuditLog,
    "normalizeBooking",
    ()=>normalizeBooking,
    "normalizeCancellation",
    ()=>normalizeCancellation,
    "normalizeInstallment",
    ()=>normalizeInstallment,
    "normalizeInventoryItem",
    ()=>normalizeInventoryItem,
    "normalizeInventoryTransaction",
    ()=>normalizeInventoryTransaction,
    "normalizeManualPayment",
    ()=>normalizeManualPayment,
    "normalizePackageTier",
    ()=>normalizePackageTier,
    "normalizePayment",
    ()=>normalizePayment,
    "normalizePilgrim",
    ()=>normalizePilgrim,
    "normalizePublicPackage",
    ()=>normalizePublicPackage,
    "normalizeReconciliation",
    ()=>normalizeReconciliation,
    "normalizeRefund",
    ()=>normalizeRefund,
    "normalizeReportOverview",
    ()=>normalizeReportOverview,
    "normalizeSeatQuotaRow",
    ()=>normalizeSeatQuotaRow,
    "normalizeUser",
    ()=>normalizeUser,
    "normalizeVendor",
    ()=>normalizeVendor,
    "normalizeVendorExpense",
    ()=>normalizeVendorExpense,
    "opt",
    ()=>opt
]);
function opt(v) {
    return v === null ? undefined : v;
}
/** Parse a string-DECIMAL to a number. Falls back to 0 on bad input. */ function money(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}
function normalizeUser(u) {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
        updatedAt: u.updated_at
    };
}
function normalizePackageTier(t) {
    return {
        id: t.id,
        packageId: t.package_id,
        name: t.name,
        price: money(t.price),
        currency: t.currency,
        totalQuota: t.total_quota,
        heldSeats: t.held_seats,
        confirmedSeats: t.confirmed_seats,
        status: t.status,
        availableSeats: Math.max(0, t.total_quota - t.held_seats - t.confirmed_seats),
        createdAt: t.created_at,
        updatedAt: t.updated_at
    };
}
function normalizePublicPackage(p) {
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        description: p.description,
        departureDate: p.departure_date,
        returnDate: p.return_date,
        bookingStart: p.booking_start,
        bookingEnd: p.booking_end,
        status: p.status,
        tiers: (p.tiers ?? []).map((t)=>({
                id: t.id,
                name: t.name,
                price: money(t.price),
                currency: t.currency,
                totalQuota: t.total_quota,
                availableSeats: t.available_seats
            })),
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}
function normalizeAdminPackage(p) {
    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        description: p.description,
        departureDate: p.departure_date,
        returnDate: p.return_date,
        bookingStart: p.booking_start,
        bookingEnd: p.booking_end,
        status: p.status,
        tiers: (p.tiers ?? []).map(normalizePackageTier),
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}
function normalizePilgrim(p) {
    return {
        id: p.id,
        bookingId: p.booking_id,
        fullName: p.full_name,
        dateOfBirth: p.date_of_birth,
        gender: p.gender,
        nationality: p.nationality,
        passportNumber: p.passport_number,
        passportIssueDate: p.passport_issue_date,
        passportExpiryDate: p.passport_expiry_date,
        passportDocumentUrl: p.passport_document_url,
        phone: p.phone,
        email: p.email,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}
function normalizeInstallment(i) {
    return {
        id: i.id,
        bookingId: i.booking_id,
        installmentNumber: i.installment_number,
        amount: money(i.amount),
        paidAmount: money(i.paid_amount),
        dueDate: i.due_date,
        status: i.status,
        createdAt: i.created_at,
        updatedAt: i.updated_at
    };
}
function normalizeBooking(b) {
    return {
        id: b.id,
        bookingNumber: b.booking_number,
        userId: b.user_id,
        packageId: b.package_id,
        packageTierId: b.package_tier_id,
        status: b.status,
        paymentPlan: b.payment_plan,
        pilgrimCount: b.pilgrim_count,
        unitPrice: money(b.unit_price),
        totalAmount: money(b.total_amount),
        amountReceived: money(b.amount_received),
        amountOutstanding: money(b.amount_outstanding),
        holdExpiresAt: b.hold_expires_at,
        confirmedAt: b.confirmed_at,
        package: b.package ? normalizeAdminPackage(b.package) : undefined,
        tier: b.package_tier ? normalizePackageTier(b.package_tier) : undefined,
        pilgrims: (b.pilgrims ?? []).map(normalizePilgrim),
        installments: (b.installments ?? []).map(normalizeInstallment),
        createdAt: b.created_at,
        updatedAt: b.updated_at
    };
}
function normalizePayment(p) {
    return {
        id: p.id,
        bookingId: p.booking_id,
        userId: p.user_id,
        amount: money(p.amount),
        currency: p.currency,
        method: p.method,
        status: p.status,
        gatewayTransactionId: p.gateway_transaction_id,
        gatewayReference: p.gateway_reference,
        paymentDate: p.payment_date,
        reference: p.reference,
        notes: p.notes,
        createdById: p.created_by_id,
        approvedById: p.approved_by_id,
        rejectionReason: p.rejection_reason,
        metadata: p.metadata,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    };
}
function normalizeManualPayment(m) {
    return {
        id: m.id,
        bookingId: m.booking_id,
        amount: money(m.amount),
        reference: m.reference,
        notes: m.notes,
        status: m.status,
        createdById: m.created_by_id,
        approvedById: m.approved_by_id,
        rejectionReason: m.rejection_reason,
        createdAt: m.created_at,
        updatedAt: m.updated_at
    };
}
function normalizeCancellation(c) {
    return {
        id: c.id,
        bookingId: c.booking_id,
        pilgrimId: c.pilgrim_id,
        reason: c.reason,
        cancellationCharge: c.cancellation_charge ? money(c.cancellation_charge) : null,
        vendorCost: c.vendor_cost ? money(c.vendor_cost) : null,
        refundAmount: c.refund_amount ? money(c.refund_amount) : null,
        status: c.status,
        requestedBy: c.requested_by,
        approvedBy: c.approved_by,
        approvedAt: c.approved_at,
        rejectionReason: c.rejection_reason,
        createdAt: c.created_at,
        updatedAt: c.updated_at
    };
}
function normalizeRefund(r) {
    return {
        id: r.id,
        bookingId: r.booking_id,
        paymentId: r.payment_id,
        cancellationRequestId: r.cancellation_request_id,
        amount: money(r.amount),
        method: r.method,
        status: r.status,
        reason: r.reason,
        approvedBy: r.approved_by,
        processedBy: r.processed_by,
        requestedAt: r.requested_at,
        approvedAt: r.approved_at,
        processedAt: r.processed_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at
    };
}
function normalizeReconciliation(r) {
    return {
        id: r.id,
        paymentId: r.payment_id,
        gateway: r.gateway,
        gatewayTransactionId: r.gateway_transaction_id,
        internalAmount: r.internal_amount ? money(r.internal_amount) : null,
        gatewayAmount: money(r.gateway_amount),
        difference: r.difference ? money(r.difference) : null,
        status: r.status,
        settlementDate: r.settlement_date,
        resolvedBy: r.resolved_by,
        resolvedAt: r.resolved_at,
        resolutionNotes: r.resolution_notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at
    };
}
function normalizeVendor(v) {
    return {
        id: v.id,
        name: v.name,
        type: v.type,
        contactInfo: v.contact_info,
        status: v.status,
        createdAt: v.created_at,
        updatedAt: v.updated_at
    };
}
function normalizeVendorExpense(e) {
    return {
        id: e.id,
        vendorId: e.vendor_id,
        vendor: e.vendor ? normalizeVendor(e.vendor) : undefined,
        bookingId: e.booking_id,
        packageId: e.package_id,
        expenseType: e.expense_type,
        amount: money(e.amount),
        currency: e.currency,
        exchangeRate: money(e.exchange_rate),
        amountBdt: money(e.amount_bdt),
        expenseDate: e.expense_date,
        status: e.status,
        notes: e.notes,
        createdBy: e.created_by,
        createdAt: e.created_at,
        updatedAt: e.updated_at
    };
}
function normalizeInventoryItem(i) {
    return {
        id: i.id,
        name: i.name,
        sku: i.sku,
        unit: i.unit,
        quantity: i.quantity,
        minimumStock: i.minimum_stock,
        status: i.status,
        createdAt: i.created_at,
        updatedAt: i.updated_at
    };
}
function normalizeInventoryTransaction(t) {
    return {
        id: t.id,
        inventoryItemId: t.inventory_item_id,
        type: t.type,
        quantity: t.quantity,
        bookingId: t.booking_id,
        pilgrimId: t.pilgrim_id,
        createdBy: t.created_by,
        notes: t.notes,
        createdAt: t.created_at
    };
}
function normalizeAuditLog(a) {
    return {
        id: a.id,
        actorId: a.actor_id,
        action: a.action,
        entityType: a.entity_type,
        entityId: a.entity_id,
        oldValue: a.old_value,
        newValue: a.new_value,
        ipAddress: a.ip_address,
        userAgent: a.user_agent,
        createdAt: a.created_at
    };
}
function normalizeReportOverview(r) {
    return {
        totalBookings: r.totalBookings,
        confirmedBookings: r.confirmedBookings,
        totalCollected: r.totalCollected,
        totalOutstanding: r.totalOutstanding,
        totalRefunded: r.totalRefunded,
        availableSeats: r.availableSeats,
        heldSeats: r.heldSeats,
        confirmedSeats: r.confirmedSeats,
        overdueInstallments: r.overdueInstallments
    };
}
function normalizeSeatQuotaRow(r) {
    return {
        packageId: r.package_id,
        packageName: r.package_name,
        packageSlug: r.package_slug,
        tierId: r.tier_id,
        tierName: r.tier_name,
        price: money(r.price),
        currency: r.currency,
        totalQuota: r.total_quota,
        heldSeats: r.held_seats,
        confirmedSeats: r.confirmed_seats,
        availableSeats: r.available_seats,
        utilizationRatePercent: r.utilization_rate_percent
    };
}
}),
"[project]/lib/api/types.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Type definitions for the Hajj & Umrah Booking System API.
 *
 * The backend (NestJS + TypeORM) returns raw entity objects with snake_case
 * field names. These types mirror the backend shape exactly so the client.ts
 * `apiRequest` can pass them through. The normalize layer in `normalize.ts`
 * converts each raw entity into a camelCase shape that the components
 * consume — components import the camelCase versions, not these.
 */ // ─── Auth ─────────────────────────────────────────────────────────────────
__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "errorMessage",
    ()=>errorMessage
]);
class ApiError extends Error {
    code;
    status;
    constructor(status, body){
        const message = Array.isArray(body.message) ? body.message.join(", ") : body.message || "Request failed";
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = body.code || "UNKNOWN";
    }
}
function errorMessage(err) {
    return err instanceof ApiError ? err.message : undefined;
}
}),
"[project]/lib/format.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Small display-time formatters. All accept potentially-bad input (missing
 * strings, NaN money) and return a placeholder rather than throwing.
 */ __turbopack_context__.s([
    "firstDayOfMonthIso",
    ()=>firstDayOfMonthIso,
    "formatBDT",
    ()=>formatBDT,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatMonthLabel",
    ()=>formatMonthLabel,
    "formatNumber",
    ()=>formatNumber,
    "formatTime",
    ()=>formatTime,
    "lastDayOfMonthIso",
    ()=>lastDayOfMonthIso,
    "monthKey",
    ()=>monthKey,
    "padIsoDate",
    ()=>padIsoDate,
    "parseMonthFromIso",
    ()=>parseMonthFromIso
]);
function formatBDT(amount) {
    const n = typeof amount === "number" ? amount : parseFloat(String(amount ?? "0"));
    if (!Number.isFinite(n)) return "৳0";
    return `৳${n.toLocaleString("en-BD", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}
function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}
function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function formatTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    });
}
function formatNumber(n, fallback = "—") {
    if (n === null || n === undefined || !Number.isFinite(n)) return fallback;
    return n.toLocaleString("en-BD");
}
function padIsoDate(year, monthIdx, day) {
    return `${year}-${pad2(monthIdx + 1)}-${pad2(day)}`;
}
function lastDayOfMonthIso(year, monthIdx) {
    return padIsoDate(year, monthIdx, new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate());
}
function firstDayOfMonthIso(year, monthIdx) {
    return padIsoDate(year, monthIdx, 1);
}
function monthKey(year, monthIdx) {
    return `${year}-${pad2(monthIdx + 1)}`;
}
function parseMonthFromIso(iso) {
    if (!iso) return null;
    const m = /^(\d{4})-(\d{2})/.exec(iso);
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const monthIdx = parseInt(m[2], 10) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthIdx) || monthIdx < 0 || monthIdx > 11) {
        return null;
    }
    return {
        year,
        monthIdx
    };
}
function formatMonthLabel(year, monthIdx) {
    return new Date(Date.UTC(year, monthIdx, 1)).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    });
}
function pad2(n) {
    return String(n).padStart(2, "0");
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0asbevl._.js.map