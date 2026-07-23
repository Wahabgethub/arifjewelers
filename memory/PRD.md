# Arif Jewellers — Premium Mobile PWA

## Problem
Digital showroom (not e-commerce) for Arif Jewellers, a family-run gold & silver jewelry shop **since 1988** in Shahi Bazar, Shahdadpur, Sindh, Pakistan. Goal: build trust and drive customers into the physical shop via WhatsApp (03092276875) and phone — not online checkout.

## Personas
- Local & regional customers browsing designs, checking live gold/silver rates, saving favourites, and messaging the shop directly.
- Shop admin (owner) managing products, rates per city, reviews, and inquiry inbox from a hidden Admin Panel.

## Core Requirements (static)
- Black / Gold / White luxury dark theme (no gaudy gradients).
- Full trilingual: English / Urdu / Sindhi with RTL on Urdu & Sindhi.
- Cinematic intro splash (Roman Urdu lines + shimmer logo reveal — text only).
- Live gold/silver rates per city (24K / 22K / 21K / Silver) with "Last Updated" timestamp.
- Product catalog with 10 categories; each product has WhatsApp "Ask Price" pre-fill.
- Wishlist persisted per-device (localStorage).
- Inquiry form → saved in DB + opens WhatsApp with pre-filled message.
- Reviews with photo, Exchange/Old Gold info section, About Us with Google Maps.
- Bottom nav (5 items) + floating WhatsApp/Call on every non-admin page.
- Hidden Admin Panel: JWT auth (aw0329614@gmail.com / wahab@123, hashed in DB), products CRUD, rates edit per city + "API Suggest" live spot fetch, reviews & inquiries management, image uploads via object storage.

## What's Been Implemented (2026-07-23)
- FastAPI backend with MongoDB — JWT auth, admin seeding, categories/products/rates/reviews/inquiries CRUD, object-storage image upload/download, /api/rates/api-suggestion (goldprice.org + FX → PKR/tola).
- React 19 frontend (Craco) — Playfair Display + Outfit + Noto Nastaliq fonts, Framer Motion transitions, Tailwind + Shadcn UI (dropdown-menu, sonner toasts).
- Cinematic splash (once per session), Language switcher, Bottom nav, Floating WA/Call.
- Pages: Home, Collections + category detail, Product detail, Live Rates, Wishlist, Reviews, Exchange, Inquiry, About, Profile, Admin Login, Admin Dashboard (4 tabs).
- Seed: 10 categories, 3 default cities (Shahdadpur, Hyderabad, Karachi) with placeholder rates.
- Verified via testing subagent: 25/25 backend tests pass, all frontend flows work.

## Backlog / Next
- P0: None (MVP complete).
- P1: Rate-limit + brute-force lockout on /api/auth/login (playbook recommendation).
- P1: Multilingual product names (currently English only; UI is trilingual but product fields aren't).
- P2: True PWA install prompt + offline caching (manifest already in place).
- P2: Push notifications (requires native shell or web-push backend).
- P2: Phone-number login for customers so wishlist syncs cross-device.
- P2: Silent email delivery for inquiries via a mail API (kept hidden on backend).
