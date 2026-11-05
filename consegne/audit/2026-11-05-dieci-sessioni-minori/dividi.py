import json,re,sys,collections
# Registro di come e' stata fatta la divisione del 5/11 (legge file di lavoro della sessione AD, non si rilancia).
R=json.load(open('MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json'))
P=R['problemi']
PAT=re.compile(r'(?<![\w/.\-\[])((?:\.github/|\.env\.example|package-lock\.json|app/|lib/|components/|tests/|migrations/|scripts/|supabase/|messages/|public/|types/|docs/|seeds/|stories/|hooks/|middleware\.ts|next\.config\.js|vercel\.json|package\.json|tailwind\.config\.ts|instrumentation[\w.-]*\.ts|sentry[\w.-]*\.ts|i18n\.ts|playwright\.config\.ts|vitest[\w.]*\.ts)[\w./\[\]()@\-]*)')
NONCODICE={224,397,600,692,701,789,2455,2539}
NOMI={'S01':'soldi-carta-e-guadagni','S02':'ordini-e-fattorino','S03':'lavori-a-orario-email-rilascio',
 'S04':'database-prove-e-pagine-secondarie','S05':'amministrazione-e-segnalazioni','S06':'pannello-del-negozio-e-catalogo',
 'S07':'carrello-cassa-e-consegna','S08':'legale-privacy-account-accessi','S09':'vetrina-prodotto-home-pagine',
 'S10':'accessi-ai-analytics-interfaccia-comune'}
T={
'S01':['lib/stripe/','app/api/stripe/','app/api/cron/release-payouts/','app/api/cron/riquadra-casse/','lib/guadagni/','app/seller/earnings/','lib/rimborsi/','app/api/returns/','app/returns/','app/api/gift-cards/','app/regali/','lib/cassa/','lib/metriche-venditore.ts','app/seller/analytics/','app/seller/dashboard/','lib/ordini/annulla.ts','lib/ordini/prezzi.ts','lib/ordini/rimbors','lib/ordini/pagament','lib/ordini/contanti','lib/ordini/bonific','lib/ordini/incass','lib/promotions.ts','app/api/sponsored/'],
'S02':['lib/ordini/','app/api/orders/','app/orders/','lib/order-status.ts','app/rider/','components/rider/','app/api/rider/','lib/rider/','app/api/consegna/','components/orders/','lib/ritiro-in-negozio.ts','lib/shipping-etichetta/','lib/riordino.ts','components/DeliveryMap.tsx'],
'S03':['app/api/cron/expire-stale-orders/','app/api/cron/veloce-non-confermata/','app/api/cron/','lib/email/','lib/push/','scripts/','.github/','vercel.json','lib/cron-','lib/carrelli-abbandonati.ts','app/api/unsubscribe/','app/api/newsletter/','components/PushNotificationOptIn.tsx','app/notifications/','lib/health','app/api/health/','app/status/','sentry','instrumentation','next.config.js','package.json','package-lock.json','.env.example','lib/logger.ts','lib/errors.ts','docs/','playwright.config.ts','lib/db/'],
'S04':['app/events/','app/lists/','app/favorites/','components/AddToListButton.tsx','app/shop-of-month/','app/piu-venduti/','components/DailyCheckIn.tsx','components/BuyerOnboardingTour.tsx','migrations/','supabase/','tests/','types/','seeds/'],
'S05':['app/admin/','app/api/admin/','components/admin/','lib/admin/','app/api/kyc/','lib/kyc/','app/api/segnalazioni/','components/Segnala.tsx','app/api/support/','components/SupportChatModal.tsx','app/help/','lib/cms-page.ts','components/cms/','lib/sanitize-html.ts','app/messages/','app/api/marketplace/'],
'S06':['app/seller/orders/','app/seller/','components/seller/','app/api/seller/','lib/products/','components/StoreMediaManager.tsx','lib/store-customization.ts','components/VendorForm.tsx','components/SellerApplicationForm.tsx','app/sell/','lib/banner-vetrina.ts','lib/media/','lib/image-resize.ts','lib/storage/','app/api/image/','lib/image-url.ts','app/lavora-con-noi/'],
'S07':['app/checkout/','components/checkout/','app/cart/','components/cart/','lib/store-hours.ts','lib/promesse-pubbliche.ts','lib/quando-arriva.ts','lib/shipping.ts','app/shipping/','lib/coupons.ts','lib/constants.ts','lib/promessa-consegna.ts','app/shared-cart/','components/ShareCartButton.tsx','lib/cart-sync.ts','components/CartCrossDeviceSync.tsx','components/StickyAddToCart.tsx','lib/tempo-piacenza.ts','lib/delivery.ts','lib/geo.ts','components/LocationPill.tsx','app/near/','lib/funzioni-al-lancio.ts','components/WelcomeCreditBanner.tsx','app/promozioni/','components/PromoTicker.tsx'],
'S08':['app/terms/','app/privacy/','lib/privacy/','lib/legal/','app/cookies/','components/CookieBanner.tsx','lib/consent.ts','app/api/account/','app/profile/','lib/account/','components/account/','app/api/contact/','app/contact/','app/faq/','app/about/','app/accessibility/','components/Footer.tsx','app/accetta-condizioni/','lib/contatti-pubblici.ts','lib/site-branding.ts','app/u/','components/PublicProfileToggle.tsx','app/come-funziona/',],
'S09':['app/product/','components/home/','components/home-sections/','components/store-sections/','lib/queries/','components/ProductQA.tsx','app/store/','app/stores/','components/ProductGrid.tsx','app/category/','app/categorie/','lib/category-attributes.ts','app/sitemap.ts','components/CategoryShowcase.tsx','components/products/','components/CategoryBar.tsx','app/page.tsx','app/loading.tsx','lib/home-site.ts','components/ProductCard.tsx','components/StoreProductExplorer.tsx','components/StorePreviewCard.tsx','components/StoreListRow.tsx','components/StoreAvatar.tsx','app/search/','components/SearchBar.tsx','components/StoryViewer.tsx','components/RecentlyViewed.tsx','components/ProductViewTracker.tsx','components/LiveActivityFeed.tsx','components/PhotoReviewUpload.tsx','app/api/track/'],
'S10':['middleware.ts','lib/api/','app/sign-up/','app/sign-in/','lib/auth/','components/VerifyCodeDialog.tsx','app/auth/','app/api/auth/','lib/rate-limit.ts','lib/rate','lib/supabase/','app/reset-password/','lib/env','app/api/ai/','lib/ai/','app/api/vision/','app/api/chat/','lib/analytics/','components/ui/','components/providers/','components/hooks/','public/','tailwind.config.ts','app/globals.css','app/layout.tsx','components/Navbar.tsx','components/MobileTabBar.tsx','components/PWAInstallBanner.tsx','components/ActivityTracker.tsx','lib/format.ts','messages/','i18n.ts','stories/','hooks/','app/'],
}
def owner(f):
    best=None;bl=-1
    for s,ps in T.items():
        for p in ps:
            if f.startswith(p) and len(p)>bl: best,bl=s,len(p)
    return best
def norm(raw):
    raw=raw.replace('/home/user/mycity/','').replace('marketplace/','')
    files=[]
    for mm in PAT.findall(raw):
        mm=mm.rstrip('.,;:)'); mm=re.sub(r':\d.*$','',mm)
        if mm not in files: files.append(mm)
    return files
sess=collections.defaultdict(list); fuori=[]; unowned=collections.Counter()
for i,x in enumerate(P):
    if x.get('stato')!='aperto' or x.get('severita')!='minore': continue
    if i in NONCODICE or x.get('file','').startswith('(nel referto'): fuori.append((i,'non codice o referto privato')); continue
    files=norm(x.get('file',''))
    if not files: fuori.append((i,'senza file: '+x.get('file','')[:80])); continue
    o=owner(files[0])
    if o is None: unowned[files[0]]+=1; fuori.append((i,'nessun padrone '+files[0])); continue
    sess[o].append(dict(i=i,files=files,altri={f:owner(f) for f in files[1:] if owner(f) not in (o,None)}))
for s in sorted(sess): 
    cross=sum(1 for d in sess[s] if d['altri'])
    print(s,NOMI[s],len(sess[s]),'con file altrui',cross)
print('fuori',len(fuori)); print([f for f in fuori if not f[1].startswith('non codice')][:20]); print(unowned.most_common(30))
json.dump(dict(sess=sess,fuori=fuori,T=T,NOMI=NOMI),open(sys.argv[1],'w'),ensure_ascii=False)
