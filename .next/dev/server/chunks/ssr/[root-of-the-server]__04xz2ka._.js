module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/components/layout/Header.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cn.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Container.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Button.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const PUBLIC_LINKS = [
    {
        href: "/packages",
        label: "Packages"
    }
];
const USER_LINKS = [
    {
        href: "/dashboard",
        label: "Dashboard"
    },
    {
        href: "/dashboard/bookings",
        label: "Bookings"
    },
    {
        href: "/dashboard/payments",
        label: "Payments"
    }
];
const ADMIN_LINKS = [
    {
        href: "/admin",
        label: "Overview"
    },
    {
        href: "/admin/packages",
        label: "Packages"
    },
    {
        href: "/admin/bookings",
        label: "Bookings"
    },
    {
        href: "/admin/payments",
        label: "Payments"
    },
    {
        href: "/admin/cancellations",
        label: "Cancellations"
    },
    {
        href: "/admin/refunds",
        label: "Refunds"
    },
    {
        href: "/admin/reports",
        label: "Reports"
    },
    {
        href: "/admin/audit-logs",
        label: "Audit"
    }
];
function Header() {
    const { status, user, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const links = user?.role === "ADMIN" ? ADMIN_LINKS : status === "authenticated" ? USER_LINKS : PUBLIC_LINKS;
    async function handleLogout() {
        await logout();
        router.push("/");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Container$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-16 items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-9 w-9 items-center justify-center rounded-chip bg-emerald text-white",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    width: "18",
                                    height: "18",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 2L21 7V17L12 22L3 17V7L12 2Z",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/Header.tsx",
                                            lineNumber: 56,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M12 2L21 7L12 12L3 7L12 2Z",
                                            fill: "currentColor",
                                            opacity: "0.3"
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/Header.tsx",
                                            lineNumber: 62,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/Header.tsx",
                                    lineNumber: 55,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/layout/Header.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "leading-tight",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-default font-bold text-text",
                                        children: "HajjGo"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/Header.tsx",
                                        lineNumber: 70,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-meta text-text-subtle",
                                        children: "Booking System"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/Header.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layout/Header.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layout/Header.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "hidden flex-1 items-center justify-center gap-1 md:flex",
                        children: links.map((link)=>{
                            const active = pathname === link.href || link.href !== "/" && pathname.startsWith(link.href);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: link.href,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-chip px-3 py-1.5 text-default font-medium transition-colors", active ? "bg-emerald/10 text-emerald" : "text-text-muted hover:bg-base hover:text-text"),
                                children: link.label
                            }, link.href, false, {
                                fileName: "[project]/components/layout/Header.tsx",
                                lineNumber: 81,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Header.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: status === "loading" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-9 w-24 rounded-chip bg-base"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Header.tsx",
                            lineNumber: 99,
                            columnNumber: 15
                        }, this) : status === "authenticated" && user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden text-right sm:block",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-default font-semibold text-text",
                                            children: user.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/Header.tsx",
                                            lineNumber: 103,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-meta text-text-subtle",
                                            children: user.role
                                        }, void 0, false, {
                                            fileName: "[project]/components/layout/Header.tsx",
                                            lineNumber: 104,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/layout/Header.tsx",
                                    lineNumber: 102,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    variant: "outline",
                                    size: "sm",
                                    onClick: handleLogout,
                                    children: "Log out"
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/Header.tsx",
                                    lineNumber: 106,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/Header.tsx",
                            lineNumber: 101,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        variant: "ghost",
                                        size: "sm",
                                        children: "Log in"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/Header.tsx",
                                        lineNumber: 113,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/Header.tsx",
                                    lineNumber: 112,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/register",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        variant: "primary",
                                        size: "sm",
                                        children: "Sign up"
                                    }, void 0, false, {
                                        fileName: "[project]/components/layout/Header.tsx",
                                        lineNumber: 118,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/layout/Header.tsx",
                                    lineNumber: 117,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/layout/Header.tsx",
                            lineNumber: 111,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Header.tsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/Header.tsx",
                lineNumber: 52,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/layout/Header.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/layout/Header.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/ui/Button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Button
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cn.ts [app-ssr] (ecmascript)");
;
;
;
const VARIANT_STYLES = {
    primary: "bg-emerald text-white hover:bg-emerald-light border border-emerald",
    secondary: "bg-teal text-white hover:bg-teal-light border border-teal",
    outline: "bg-card text-text border border-border-strong hover:border-emerald hover:text-emerald",
    ghost: "bg-transparent text-text-muted hover:bg-base hover:text-text border border-transparent",
    danger: "bg-danger text-white hover:bg-danger/90 border border-danger"
};
const SIZE_STYLES = {
    sm: "px-3 py-1.5 text-meta gap-2",
    md: "px-4 py-2.5 text-default gap-2",
    lg: "px-6 py-3 text-default gap-3"
};
const baseClasses = "inline-flex items-center justify-center rounded-chip font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";
function Button(props) {
    const { children, variant = "primary", size = "md", fullWidth, className, disabled, loading, type = "button" } = props;
    const classes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(baseClasses, VARIANT_STYLES[variant], SIZE_STYLES[size], fullWidth && "w-full", className);
    if ("href" in props && props.href) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: props.href,
            "aria-disabled": disabled,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(classes, disabled && "pointer-events-none"),
            children: [
                loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Spinner, {}, void 0, false, {
                    fileName: "[project]/components/ui/Button.tsx",
                    lineNumber: 77,
                    columnNumber: 20
                }, this) : null,
                children
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/Button.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this);
    }
    const onClick = "onClick" in props ? props.onClick : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        onClick: onClick,
        disabled: disabled || loading,
        className: classes,
        children: [
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Spinner, {}, void 0, false, {
                fileName: "[project]/components/ui/Button.tsx",
                lineNumber: 92,
                columnNumber: 18
            }, this) : null,
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/Button.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
function Spinner() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent",
        "aria-label": "Loading"
    }, void 0, false, {
        fileName: "[project]/components/ui/Button.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/ui/Container.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Container
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cn.ts [app-ssr] (ecmascript)");
;
;
const SIZE_CLASSES = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1440px]"
};
function Container({ children, className, size = "xl", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cn$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZE_CLASSES[size], className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ui/Container.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/endpoints.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("loading");
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchMe"])().then((me)=>{
            setUser(me);
            setStatus("authenticated");
        }).catch(()=>{
            setStatus("unauthenticated");
        });
    }, []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (email, password)=>{
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"])(email, password);
        setUser(me);
        setStatus("authenticated");
        return me;
    }, []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (name, email, phone, password)=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["register"])({
            name,
            email,
            phone,
            password
        });
        // After registration, auto-login (the register endpoint does not set cookies)
        const me = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"])(email, password);
        setUser(me);
        setStatus("authenticated");
        return me;
    }, []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$endpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logout"])();
        } catch  {
        // If the server is unreachable we still clear local state.
        }
        setUser(null);
        setStatus("unauthenticated");
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            status,
            user,
            login,
            register,
            logout
        }), [
        status,
        user,
        login,
        register,
        logout
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 86,
        columnNumber: 10
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
}),
"[project]/lib/api/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiRequest",
    ()=>apiRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/types.ts [app-ssr] (ecmascript)");
;
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:3001/api/v1") ?? "http://localhost:3001/api/v1";
async function apiRequest(path, { method = "GET", body, query, headers: extraHeaders = {} } = {}) {
    let url;
    try {
        url = new URL(`${API_BASE_URL}${path}`);
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](0, {
            message: "The app isn't configured with a valid API URL.",
            code: "BAD_CONFIG"
        });
    }
    if (query) {
        for (const [key, value] of Object.entries(query)){
            if (value !== undefined) url.searchParams.set(key, String(value));
        }
    }
    const headers = {
        Accept: "application/json",
        ...extraHeaders
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    let response;
    try {
        response = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            // Sends the HttpOnly auth cookie and accepts Set-Cookie from the server.
            credentials: "include"
        });
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](0, {
            message: "Couldn't reach the server. Check your connection and try again.",
            code: "NETWORK_ERROR"
        });
    }
    if (response.status === 204) return undefined;
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : undefined;
    } catch  {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](response.status || 0, {
            message: response.ok ? "The server sent back something unexpected. Please try again." : `Request failed (${response.status}).`,
            code: "BAD_RESPONSE"
        });
    }
    if (!response.ok) {
        // The backend wraps errors as { success: false, error: { code, message } }
        const errorBody = data;
        const body = errorBody?.error ?? {
            message: errorBody?.message || response.statusText || "Request failed",
            code: "UNKNOWN"
        };
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$types$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](response.status, body);
    }
    return data;
}
}),
"[project]/lib/api/endpoints.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/normalize.ts [app-ssr] (ecmascript)");
;
;
async function register(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/register", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function login(email, password) {
    // Backend returns { user, access_token, refresh_token }; the cookies are
    // set as HttpOnly by the response. We only need the user here.
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/login", {
        method: "POST",
        body: {
            email,
            password
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function logout() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/logout", {
        method: "POST"
    });
}
async function fetchMe() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/auth/me");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeUser"])(res.data.user);
}
async function listPackages(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/packages", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePublicPackage"]),
        meta: res.meta
    };
}
async function getPackage(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/packages/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePublicPackage"])(res.data);
}
async function adminListPackages(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/packages", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAdminPackage"]),
        meta: res.meta
    };
}
async function adminGetPackage(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function createPackage(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/packages", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function updatePackage(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAdminPackage"])(res.data);
}
async function deletePackage(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${id}`, {
        method: "DELETE"
    });
}
async function createTier(packageId, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/packages/${packageId}/tiers`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function updateTier(tierId, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/tiers/${tierId}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function adjustQuota(tierId, total_quota) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/tiers/${tierId}/quota`, {
        method: "PATCH",
        body: {
            total_quota
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePackageTier"])(res.data);
}
async function createBooking(body, idempotencyKey) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/bookings", {
        method: "POST",
        body,
        headers: idempotencyKey ? {
            "Idempotency-Key": idempotencyKey
        } : undefined
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function listBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/bookings", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function getBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function cancelBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${id}/cancel`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function listPilgrims(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/pilgrims`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePilgrim"]);
}
async function cancelPilgrim(bookingId, pilgrimId) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/pilgrims/${pilgrimId}/cancel`, {
        method: "POST"
    });
}
async function listInstallments(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/installments`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInstallment"]);
}
async function initiatePayment(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/payments", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function listPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/payments", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function getPayment(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/payments/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function mockPaymentSuccess(paymentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/mock-payments/${paymentId}/success`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function mockPaymentFail(paymentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/mock-payments/${paymentId}/fail`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"])(res.data);
}
async function requestCancellation(bookingId, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/cancellation-request`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function listBookingCancellations(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/cancellation-requests`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"]);
}
async function adminListBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/bookings", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function adminGetBooking(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/bookings/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"])(res.data);
}
async function createManualPayment(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/manual-payments", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function approveManualPayment(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/manual-payments/${id}/approve`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function rejectManualPayment(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/manual-payments/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeManualPayment"])(res.data);
}
async function adminListPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/payments", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function adminListCancellations(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/cancellations", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"]),
        meta: res.meta
    };
}
async function adminGetCancellation(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/cancellations/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function approveCancellation(id, body = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/cancellations/${id}/approve`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function rejectCancellation(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/cancellations/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCancellation"])(res.data);
}
async function listBookingRefunds(bookingId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/bookings/${bookingId}/refunds`);
    return res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"]);
}
async function createRefund(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/refunds", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function adminListRefunds(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/refunds", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"]),
        meta: res.meta
    };
}
async function approveRefund(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/approve`, {
        method: "POST"
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function processRefund(id, body = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/process`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function rejectRefund(id, reason) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/refunds/${id}/reject`, {
        method: "POST",
        body: {
            reason
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRefund"])(res.data);
}
async function listReconciliation(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reconciliation", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeReconciliation"]),
        meta: res.meta
    };
}
async function importSettlement(body) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reconciliation/import", {
        method: "POST",
        body
    });
}
async function resolveReconciliation(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/reconciliation/${id}/resolve`, {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeReconciliation"])(res.data);
}
async function listVendors(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendors", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeVendor"]),
        meta: res.meta
    };
}
async function createVendor(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendors", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeVendor"])(res.data);
}
async function updateVendor(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendors/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeVendor"])(res.data);
}
async function deleteVendor(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendors/${id}`, {
        method: "DELETE"
    });
}
async function listVendorExpenses(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendor-expenses", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeVendorExpense"]),
        meta: res.meta
    };
}
async function createVendorExpense(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/vendor-expenses", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeVendorExpense"])(res.data);
}
async function deleteVendorExpense(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/vendor-expenses/${id}`, {
        method: "DELETE"
    });
}
async function listInventoryItems(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/items", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInventoryItem"]),
        meta: res.meta
    };
}
async function createInventoryItem(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/items", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInventoryItem"])(res.data);
}
async function updateInventoryItem(id, body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/inventory/items/${id}`, {
        method: "PATCH",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInventoryItem"])(res.data);
}
async function deleteInventoryItem(id) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/inventory/items/${id}`, {
        method: "DELETE"
    });
}
async function createInventoryTransaction(body) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/inventory/transactions", {
        method: "POST",
        body
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInventoryTransaction"])(res.data);
}
async function reportOverview() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/overview");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeReportOverview"])(res.data);
}
async function reportBookings(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/bookings", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBooking"]),
        meta: res.meta
    };
}
async function reportPayments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/payments", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizePayment"]),
        meta: res.meta
    };
}
async function reportInstallments(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/installments", {
        query: params
    });
    return {
        summary: res.summary,
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeInstallment"]),
        meta: res.meta
    };
}
async function reportRefunds() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/refunds");
}
async function reportSeatQuota() {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/reports/seat-quota");
    // The seat-quota endpoint returns `{ summary, tiers }` not the standard envelope.
    // Handle both shapes defensively.
    if (res.data && typeof res.data === "object" && "tiers" in res.data) {
        const data = res.data;
        return {
            summary: data.summary,
            tiers: (data.tiers ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSeatQuotaRow"])
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
        tiers: (rows ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSeatQuotaRow"])
    };
}
async function listAuditLogs(params = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])("/admin/audit-logs", {
        query: params
    });
    return {
        data: res.data.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAuditLog"]),
        meta: res.meta
    };
}
async function getAuditLog(id) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiRequest"])(`/admin/audit-logs/${id}`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$normalize$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAuditLog"])(res.data);
}
}),
"[project]/lib/api/normalize.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/api/types.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    ()=>ApiError
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
}),
"[project]/lib/cn.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Joins class names, skipping falsy values. Small stand-in for a
 * `clsx`/`tailwind-merge` dependency the project doesn't need.
 */ __turbopack_context__.s([
    "cn",
    ()=>cn
]);
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__04xz2ka._.js.map