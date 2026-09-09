# -*- coding: utf-8 -*-
"""
Arabic (MSA) translation dictionary for the Turnkii marketing site.

The build (`build.py`) generates RTL `/ar/*.html` twins of the English pages by
running a plain string replacement of every EN phrase below with its AR value on
the whole document (template markup + the DC logic script). Two rules keep this
safe and complete:

  1. Replacements run LONGEST-FIRST, so a long phrase is translated before any
     shorter phrase that is a substring of it (avoids partial clobbering).
  2. Keys must be verbatim, human-visible English strings exactly as they appear
     in the source `.dc.html` (mind `&amp;`, `—`, `–`, `·`, `’`, spaces).

The brand name "Turnkii" is intentionally NOT translated (stays Latin), and so
are Latin numerals, currency amounts formatted at runtime by pricing.js, file
types (PDF/DWG/JPG) and partner company names. Runtime catalogue content injected
from the admin (style/service names) is English until the admin gains Arabic
fields — not covered here.

`META[slug] = (title, description)` supplies the per-page <title>/description.
`PAGES[slug]` maps a built slug to its phrase dict.
"""

# ── Per-page <title> + meta description (Arabic) ─────────────────────────────
META = {
    "index.html": (
        "Turnkii — تشطيب وتأثيث وتسليم منزلك تحت عقد واحد",
        "التشطيب والأثاث والمطابخ والتكييف والمظلات والأعمال الخارجية تحت عقد "
        "واحد في القاهرة والساحل الشمالي — برنامج واحد، فريق واحد، وتسليم موثّق "
        "بالصور.",
    ),
}

# ── Homepage phrase dictionary ───────────────────────────────────────────────
# Order here doesn't matter — build.py sorts by length (longest first).
HOME = {
    # ── nav / header ─────────────────────────────────────────────────────────
    "Services": "الخدمات",
    "Inspiration": "الافكار",
    "AI studio": "استوديو الذكاء الاصطناعي",
    "Styles": "التصاميم الجاهزة",
    "Marketplace": "المتجر",
    "Financing": "التمويل",
    "Facility management": "إدارة المشاريع والاصول",
    "Care &amp; maintenance": "العناية والصيانة",
    "Projects &amp; bulk": "خدمات المشروعات الكاملة",
    "My account": "حسابي",
    "Start a brief": "ابدأ طلبك",
    "Refer &amp; earn": "رشح واكسب",
    "Menu": "القائمة",

    # ── hero ─────────────────────────────────────────────────────────────────
    "Turnkey delivery · Cairo &amp; North Coast": "تسليم على المفتاح · القاهرة والساحل الشمالي",
    "The unit is finished when it is": "الوحدة تكون جاهزة حين تصبح",
    "liveable": "صالحة للسكن",
    "Finishing, furniture, kitchens, HVAC, shutters and outdoor — one contract, one programme, photographed handover.":
        "تشطيب وأثاث ومطابخ وتكييف وشتترز وأعمال خارجية — تحت عقد واحد وبرنامج واحد، وتسليم موثّق بالصور.",
    "Build your brief": "جهّز طلبك",
    "Browse inspiration": "تصفّح الافكار",

    # ── financing strip ──────────────────────────────────────────────────────
    "Payment plans": "خطط السداد",
    "Finish now, pay over 12 to 60 months.": "شطب الآن وادفع على 12 إلى 60 شهرًا.",
    "Milestone payments as standard, bank financing up to EGP 60M, rent-backed plans for portfolios, or save ahead at 5% off.":
        "دفعات مرحلية كنظام أساسي، وتمويل بنكي حتى 60 مليون جنيه، وخطط مدعومة بالإيجار للمحافظ العقارية، أو ادّخر مسبقًا بخصم 5%.",
    "Get pre-approved": "احصل على موافقة مبدئية",
    "See payment plans": "اعرض خطط السداد",
    "Hide plans": "إخفاء الخطط",
    "Calculate": "احسب قسطك",
    "Pre-approval takes two minutes and does not affect your credit file. Final terms are confirmed with your scope after the free site survey.":
        "الموافقة المبدئية تستغرق 24 ساعة ولا تؤثر على سجلك الائتماني. تُؤكَّد الشروط النهائية مع الاعمال المطلوبة بعد المعاينة المجانية للموقع.",
    # financing plans (FIN_DEFAULT)
    "Milestone": "دفعات مرحلية",
    "4 payments": "4 دفعات",
    "Deposit, mid-works, pre-delivery and handover. No interest, no third party.":
        "مقدَّم، ومنتصف العمل، وقبل التسليم، وعند التسليم. بدون فوائد ولا طرف ثالث.",
    "Single unit": "وحدة واحدة",
    "Bank instalments": "أقساط بنكية",
    "12–60 months": "12–60 شهرًا",
    "Partner bank financing up to EGP 60M, approved alongside the survey.":
        "تمويل من شريك حتى 60 مليون جنيه، يُعتمَد بالتوازي مع المعاينة.",
    "Owners &amp; end users": "المُلّاك والمستخدمون",
    "Rent-backed": "مدعوم بالإيجار",
    "12–24 months": "12–24 شهرًا",
    "Repayment scheduled against rental income once units are listed and let.":
        "يُجدوَل السداد على دخل الإيجار بمجرد عرض الوحدات وتأجيرها.",
    "Investors, 3+ units": "مستثمرون، 3 وحدات فأكثر",
    "Plan ahead": "خطّط مسبقًا",
    "10–12 months": "10–12 شهرًا",
    "Save in equal interest-free instalments, then draw the full budget.":
        "ادّخر بأقساط متساوية دون فوائد، ثم احصل على مبلغ التشطيب بالكامل.",
    "Interest free · 5% off": "بدون فوائد · خصم 5%",
    "Choose plan": "اختر الخطة",
    "In your brief ✓": "ضمن طلبك ✓",
    "Add this plan to my brief": "أضف هذه الخطة إلى طلبي",

    # ── hero stats + why grid ────────────────────────────────────────────────
    "Units handed over": "وحدة تم تسليمها",
    "Average apartment": "متوسط الشقة",
    "Costed design styles": "تصميمات مُسعّرة",
    "12 wks": "12 أسبوعًا",
    "Contract, one team": "عقد وفريق واحد",
    "Why clients use Turnkii": "لماذا يختار العملاء Turnkii",
    "Start your brief →": "ابدأ طلبك ←",
    # redesigned "Why Turnkii": header + three benefit cards + dark stats band
    "Why Turnkii": "لماذا Turnkii",
    "We took the ": "تولّينا ",
    "whole": "المهمة كاملة",
    " job.": ".",
    "Fit-outs fail in the gaps between contractors. Turnkii removes the gaps — one scope, one programme, one number that answers.":
        "أعمال التشطيب تفشل في الفجوات بين المقاولين. Turnkii يزيل هذه الفجوات — نطاق واحد، وبرنامج واحد، ورقم واحد يُجيب.",
    "One accountable contract": "عقد واحد مسؤول",
    "Our contractor and supplier network builds. We scope, price, programme and carry the quality — so you deal with us, not with six trades.":
        "شبكتنا من المقاولين والموردين هي من تنفّذ. نحدّد النطاق ونُسعّر ونبرمج ونضمن الجودة — لتتعامل معنا وحدنا، لا مع ست حِرَف.",
    "One scope · One crew · One number": "نطاق واحد · فريق واحد · رقم واحد",
    "Priced before you commit": "سعر واضح قبل أن تلتزم",
    "Costed style boards and a quantity-backed estimate, fixed at signature. Four ways to pay, out to sixty months.":
        "لوحات تصاميم مُسعّرة وتقدير مبني على الكميات، يُثبَّت عند التوقيع. أربع طرق للسداد حتى ستين شهرًا.",
    "Fixed at signature · No drift": "يُثبَّت عند التوقيع · بلا انزلاق",
    "Managed past handover": "إدارة تمتدّ بعد التسليم",
    "Weekly photo and video updates, milestones you sign off before they are paid, and every unit you own tracked in one account.":
        "تحديثات أسبوعية بالصور والفيديو، ومراحل توافق عليها قبل صرف دفعتها، وكل وحدة تملكها مُتابَعة في حساب واحد.",
    "Sign-off gates payment": "الموافقة تحكم الدفع",
    "The numbers we hold ourselves to": "الأرقام التي نُلزم أنفسنا بها",
    "Written into the contract, not the brochure. Miss one and it is on us.":
        "مكتوبة في العقد، لا في الكتيّب. وإن أخللنا بواحدة فهي على حسابنا.",
    "Shell to keys": "من الهيكل إلى المفاتيح",
    "Costed styles": "تصاميم مُسعّرة",
    "Ways to pay": "طرق السداد",
    "Cover after keys": "ضمان بعد التسليم",
    "Contract, team and accountable number": "عقد وفريق ورقم مسؤول واحد",
    "Styles, costed — not concepts": "تصاميم مُسعّرة — لا مجرد أفكار",
    "Ways to pay, to 60 months": "طرق للسداد حتى 60 شهرًا",
    "Shell to photographed handover": "من المحارة إلى تسليم موثّق بالصور",
    "Workmanship cover after handover": "ضمان جودة التنفيذ بعد التسليم",
    "Account for every unit you own": "حساب لكل وحدة تمتلكها",

    # ── recent handovers ─────────────────────────────────────────────────────
    "Recent handovers": "تسليمات حديثة",
    "Delivered with our own crews and named partner suppliers.":
        "نُفِّذت بطواقمنا الخاصة وموردين شركاء موثوقين.",
    "Sheikh Zayed": "الشيخ زايد",
    "New Cairo": "القاهرة الجديدة",
    "North Coast": "الساحل الشمالي",
    "Maadi": "المعادي",
    "2-bed apartment, full finishing + FF&E": "شقة غرفتين، تشطيب كامل + أثاث وتجهيزات",
    "Villa reception and family living": "استقبال فيلا ومعيشة عائلية",
    "Chalet package, 6 units for rental": "باقة شاليه، 6 وحدات للإيجار",
    "Short-stay conversion, 3 studios": "تحويل لإقامات قصيرة، 3 استوديوهات",
    "Main contractor": "المقاول الرئيسي",
    "Joinery & fit-out": "نجارة وتجهيز",
    "FF&E supplier": "مورّد أثاث وتجهيزات",
    "Finishing contractor": "مقاول تشطيب",

    # ── services section ─────────────────────────────────────────────────────
    "What do you need done?": "ما الذي تحتاج إنجازه؟",
    "Tap everything that applies. Your picks fill the brief below — nothing to type yet.":
        "اضغط على كل ما ينطبق. اختياراتك تملأ الطلب بالأسفل — دون كتابة أي شيء بعد.",
    # service tiles (TILES titles + shortCopy) — 'From N weeks' via fragments
    "Finishing": "التشطيب",
    "Furnishing": "الأثاث",
    "FF&E packages": "باقات الأثاث والتجهيزات",
    "Kitchens": "المطابخ",
    "HVAC & cooling": "التكييف والتبريد",
    "Shutters & shading": "الشتر والتظليل",
    "Outdoor & landscaping": "الأعمال الخارجية والتنسيق",
    "Bare shell to sealed, snagged, paint-ready.": "من المحارة إلى جاهز للدهان.",
    "Layout, sourcing, one delivery window.": "تخطيط وتوريد وتسليم في خطوة واحدة.",
    "One spec repeated across 10–200 units.": "مواصفة واحدة تتكرر عبر 10–200 وحدة.",
    "Cabinetry, stone counters, appliances.": "خزائن وأسطح وأجهزة.",
    "Sized, zoned, concealed, maintained.": "محسوب ومقسوم ومخفي ومُصان.",
    "Motorised shutters, blinds, curtains.": "شتر بموتور وستائر معدنية وستائر.",
    "Shade, decking, salt-rated furniture.": "تظليل وأرضيات خشبية وأثاث مقاوم للملوحة.",
    "Nothing selected yet": "لم يتم اختيار شيء بعد",
    "Pick your services above — they carry straight into the brief.":
        "اختر خدماتك بالأعلى — تنتقل مباشرة إلى الطلب.",
    "Next: property, style, budget and a survey slot. About ninety seconds.":
        "التالي: العقار والتصميم والميزانية وموعد المعاينة. نحو تسعين ثانية.",
    "Start the brief": "ابدأ الطلب",

    # ── styles section ───────────────────────────────────────────────────────
    "Ready design styles": "تصاميم جاهزة للتنفيذ",
    "Five signed-off directions": "خمسة تصاميم جاهزة",
    "Each style is a costed kit — finishes, joinery, lighting and furniture already specified. Pick one to skip four weeks of design.":
        "كل تصميم مُسعّر بالكامل — التشطيبات والنجارة والإضاءة والأثاث محددة مسبقًا. اختر واحدًا لتوفّر أربعة أسابيع من التصميم.",
    "Just exploring? Every style is already costed — browse freely, no account or obligation.":
        "مجرد تصفّح؟ كل تصميم مُسعّر بالفعل — تصفّح بحرية، دون حساب أو التزام.",
    "See how a style works →": "شاهد كيف يعمل التصميم ←",
    "✨ Not sure which one fits? Take the 60-second style quiz →": "✨ غير متأكد أيها يناسبك؟ جرّب اختبار التصميم في 60 ثانية ←",
    "Or see a style in your own room →": "أو شاهد التصميم في غرفتك ←",
    "Warm Contemporary": "معاصر دافئ",
    "Neo-Classic Calm": "نيوكلاسيك هادئ",
    "Modern Majlis": "مودرن مجلس",
    "Layered Eclectic": "ايلكتك",
    "Coastal Light": "ساحلي فاتح",
    "Sand plaster, cane and walnut. Soft, photogenic, easy to let.":
        "محارة رملية وخيزران وجوز. ناعم وجذّاب وسهل التأجير.",
    "Panelled walls, brass and sage. Quiet formality for premium units.":
        "جدران مُلبّسة ونحاس ولون مريمي. فخامة هادئة للوحدات المميزة.",
    "Deep velvets, gold accent and layered seating for large gatherings.":
        "مخمل غامق ولمسات ذهبية وجلسات متدرجة للتجمعات الكبيرة.",
    "Teal upholstery, rattan and greenery. Character-led, short-stay friendly.":
        "تنجيد أزرق مخضر وخيزران وخُضرة. ذو طابع ومناسب للإقامة القصيرة.",
    "Bouclé, pale oak and open doors. Built for the North Coast.":
        "قماش بوكليه وبلوط فاتح وأبواب مفتوحة. صُمِّم للساحل الشمالي.",
    "Sand · Walnut · Olive": "رملي · جوزي · زيتوني",
    "Chalk · Sage · Brass": "طباشيري · مريمي · نحاسي",
    "Cocoa · Camel · Gold": "كاكاو · جملي · ذهبي",
    "Teal · Rattan · Linen": "أزرق مخضر · خيزران · كتان",
    "Bone · Oak · Sea green": "عاجي · بلوط · أخضر بحري",
    "Use this style": "اختر هذا التصميم",
    "Materials &amp; furniture →": "الخامات والأثاث ←",
    "Share": "مشاركة",

    # ── decide section ───────────────────────────────────────────────────────
    "Not sure yet? Two ways to decide.": "لم تقرر بعد؟ طريقتان للاختيار.",
    "Both feed the brief automatically — whatever you save or preview arrives with your request.":
        "كلاهما يذهب الي الطلب تلقائيًا — كل ما تحفظه أو تعاينه يصل مع طلبك.",
    "Step 1 · Browse": "الخطوة 1 · التصفّح",
    "Save the rooms you like": "احفظ الغرف التي تعجبك",
    "Twelve delivered rooms, filterable and already costed. Your board picks the style in the brief for you.":
        "اثنتا عشرة غرفة مُسلَّمة، قابلة للتصفية ومُسعّرة مسبقًا. لوحتك تختار التصميم في الطلب نيابةً عنك.",
    "Open the inspiration board →": "افتح لوحة الافكار ←",
    "Step 2 · Preview": "الخطوة 2 · المعاينة",
    "See it in your own space": "شاهده في مساحتك",
    "Upload a photo of the room and slide between how it looks today and the style you chose.":
        "ارفع صورة للغرفة وحرّك المؤشر بين شكلها اليوم والتصميم الذي اخترته.",
    "Upload a photo →": "ارفع صورة ←",

    # ── packages section ─────────────────────────────────────────────────────
    "Furniture &amp; FF&amp;E packages": "باقات الأثاث والتجهيزات",
    "Pick your level of fit-out": "اختر مستوى التجهيز",
    "Rates are quoted per unit in EGP once we know area, style and unit count. Ranges shared on request during your call.":
        "تُحدَّد الأسعار لكل وحدة بالجنيه بمجرد معرفة المساحة والتصميم وعدد الوحدات. تُشارَك الاسعار الاولية عند الطلب أثناء مكالمتك.",
    "No furniture": "بدون أثاث",
    "Finishing only": "تشطيب فقط",
    "Finishing and fixed works only — you furnish the unit yourself.":
        "التشطيب والأعمال الثابتة فقط — تؤثث الوحدة بنفسك.",
    "Finishing, joinery and MEP scope": "نطاق التشطيب والنجارة والأعمال الكهروميكانيكية",
    "Kitchen and wardrobes if selected": "المطبخ والدواليب إن اختيرت",
    "No loose furniture or styling": "بدون أثاث متحرك أو تنسيق",
    "Handover cleaned and photographed": "تسليم نظيف وموثّق بالصور",
    "Essential": "الأساسي",
    "Rent-ready": "جاهز للإيجار",
    "Everything a tenant needs, nothing they will not use.":
        "كل ما يحتاجه المستأجر، ولا شيء لن يستخدمه.",
    "Living, dining, two bedrooms": "معيشة وطعام وغرفتا نوم",
    "Local manufacture, 3-year frames": "تصنيع محلي، هياكل بضمان 3 سنوات",
    "Curtains, rugs and lighting": "ستائر وسجاد وإضاءة",
    "Delivered and assembled in one day": "تسليم وتركيب في يوم واحد",
    "Signature": "المميّز",
    "Most units": "معظم الوحدات",
    "Most specified": "الأكثر طلبًا",
    "Our standard for premium rentals and owner-occupied homes.":
        "معيارنا للإيجارات المميزة والمنازل التي يسكنها ملّاكها.",
    "Full unit including outdoor": "وحدة كاملة تشمل الأعمال الخارجية",
    "Mixed local and imported pieces": "قطع محلية ومستوردة مختلطة",
    "Custom joinery for TV and storage": "نجارة مُفصَّلة للتلفزيون والتخزين",
    "Art, accessories and styling pass": "لوحات وإكسسوارات ولمسة تنسيق",
    "Handover photography included": "تصوير التسليم مشمول",
    "Bespoke": "حسب الطلب",
    "Made to order": "يُصنَع حسب الطلب",
    "Drawn from scratch, made in our workshop, nothing off the shelf.":
        "يُرسَم من الصفر ويُصنَع في ورشتنا، لا شيء جاهز.",
    "Bespoke furniture drawings": "رسومات أثاث مُفصَّلة",
    "Imported fabrics and stone": "أقمشة وأحجار مستوردة",
    "Lighting design and dimming scenes": "تصميم إضاءة ومَشاهد خفوت",
    "On-site project manager throughout": "مدير مشروع في الموقع طوال الوقت",
    "Range on request": "السعر الاولي عند الطلب",
    "I don’t need furniture — finishing only": "لا أحتاج أثاثًا — تشطيب فقط",
    "Keeping your own pieces? Exclude them later and we retain 5%.":
        "تحتفظ بأثاثك؟ استبعدها لاحقًا ونمنحك خصم 5%.",

    # ── what happens next / programme ────────────────────────────────────────
    "What happens next": "ما الذي يحدث بعد ذلك",
    "Nine weeks from brief to keys.": "تسعة أسابيع من الطلب إلى المفاتيح.",
    "You send it once. We measure, price and build — you approve at each milestone.":
        "ترسله مرة واحدة. نقيس ونُسعّر وننفّذ — وتوافق عند كل مرحلة.",
    "Start the brief below ↓": "ابدأ الطلب بالأسفل ↓",
    "Send the brief": "أرسل الطلب",
    "Scope, style, survey slot. Ninety seconds.": "الأعمال المطلوبة والتصميم وموعد المعاينة. تسعون ثانية.",
    "Day 0": "اليوم 0",
    "Day 1": "اليوم 1",
    "Day 4": "اليوم 4",
    "Week 9": "تاسع اسبوع",
    "Free survey": "معاينة مجانية",
    "45 minutes on site: measure, MEP, photos.": "45 دقيقة في الموقع: قياس وأعمال كهروميكانيكية وصور.",
    "Fixed price and plan": "سعر وخطة ثابتان",
    "Written quantities, price locked, payment approved.": "كميات مكتوبة وسعر مثبّت ودفعة معتمدة.",
    "Keys and photographs": "المفاتيح والصور",
    "You sign off each milestone before it is invoiced.": "توافق على كل مرحلة قبل إصدار فاتورتها.",

    # ── project brief ────────────────────────────────────────────────────────
    "Project brief": "طلب المشروع",
    "Tell us the unit. We are in touch within 24 hours.": "أخبرنا عن الوحدة. نتواصل معك خلال 24 ساعة.",
    "Three short steps. Send it and our team calls you within one working day to confirm the survey — only the property, a slot and your mobile are required.":
        "ثلاث خطوات قصيرة. أرسل طلبك ويتصل بك فريقنا خلال يوم عمل واحد لتأكيد المعاينة — المطلوب فقط العقار وموعد ورقم هاتفك.",
    "The project": "المشروع",
    "Scope, property, documents": "الأعمال المطلوبة والعقار والمستندات",
    "What and where": "ماذا وأين",
    "Property finishing": "تشطيب العقار",
    "AC & HVAC": "التكييف",
    "Shutters & blinds": "الشتر والستائر",
    "Outdoor furnishing": "الأثاث الخارجي",
    "Property": "العقار",
    "Required": "مطلوب",
    "Apartment": "شقة",
    "Villa / townhouse": "فيلا / تاون هاوس",
    "Multiple units": "وحدات متعددة",
    "Short-stay rental": "وحدة إيجار قصير المدة",
    "Commercial / hospitality": "تجاري / وحدة فندقية",
    "Area m²": "المساحة م²",
    "Units": "الوحدات",
    "Location": "الموقع",
    "Upload drawings or documents": "ارفع الرسومات أو المستندات",
    "Floor plans, BOQ, photos — PDF, DWG, JPG. Optional.":
        "مخططات وجداول كميات وصور — PDF وDWG وJPG. اختياري.",
    # phase II
    "The look": "المظهر",
    "Style, package, materials": "التصميم والباقة والخامات",
    "Optional — sharpens the quote": "اختياري — يدقّق العرض",
    "Materials that matter": "الخامات المهمة",
    "Porcelain & large-format tile": "بورسلين وبلاط كبير المقاس",
    "Natural marble & granite": "رخام وجرانيت طبيعي",
    "Engineered wood flooring": "أرضيات خشب",
    "Veneer & lacquer joinery": "نجارة قشرة وورنيش",
    "HPL & laminate": "HPL ولامينيت",
    "Micro-cement & plaster": "مايكرو سمنت ومحارة",
    "Gypsum ceiling detail": "تفاصيل أسقف جبسية",
    "Solid wood": "خشب صُلب",
    "Not sure — advise me": "غير متأكد — انصحني",
    # phase III
    "Commercials & booking": "التفاصيل المالية والحجز",
    "Budget, plan, slot, contact": "الميزانية والخطة والموعد والتواصل",
    "Budget, plan, survey slot": "الميزانية والخطة وموعد المعاينة",
    "Budget per unit, EGP": "الميزانية لكل وحدة، جنيه",
    "Under 750K": "أقل من 750 ألف",
    "750K – 1.5M": "750 ألف – 1.5 مليون",
    "1.5M – 3M": "1.5 – 3 مليون",
    "3M – 6M": "3 – 6 مليون",
    "6M +": "6 مليون +",
    "Not defined yet": "غير محدد بعد",
    "Advise me": "انصحني",
    "EGP / unit": "جنيه / وحدة",
    "Ready now — keys in hand": "جاهز الآن — المفاتيح باليد",
    "Within a month": "خلال شهر",
    "1–3 months": "1–3 أشهر",
    "3–6 months": "3–6 أشهر",
    "Planning ahead": "أخطّط مسبقًا",

    # ── brief summary rail + estimate ────────────────────────────────────────
    "Your brief so far": "طلبك حتى الآن",
    "Scope": "نطاق الأعمال",
    "Style": "التصميم",
    "Package": "الباقة",
    "Materials": "الخامات",
    "Budget": "الميزانية",
    "Start": "البدء",
    "Payment": "السداد",
    "Offer": "العرض",
    "Saved designs": "التصاميم المحفوظة",
    "Service detail": "تفاصيل الخدمة",
    "Documents": "المستندات",
    "Site visit": "زيارة الموقع",
    "Live estimate": "تقدير فوري مبدئي",
    "awaiting area": "بانتظار المساحة",
    "Add area to price it": "أضف المساحة لتسعيرها",
    "Enter the unit area in step I and the estimate appears here — before you give us any contact details.":
        "أدخِل مساحة الوحدة في الخطوة الأولى ويظهر التقدير هنا — قبل أن تعطينا أي بيانات تواصل.",
    "Answer the next question to narrow this range.": "أجب عن السؤال التالي لتضييق هذا النطاق.",
    "Fixed after the free site survey.": "يُثبَّت بعد المعاينة المجانية للموقع.",
    "No cost, no obligation. We reply within one working day.":
        "دون تكلفة ولا التزام. نردّ خلال يوم عمل واحد.",
    "Add your name, mobile and a visit slot to confirm.":
        "أضف اسمك ورقم هاتفك وموعد زيارة للتأكيد.",
    "Confirm & book the visit": "أكّد واحجز الزيارة",
    "Choose a property type to book": "اختر نوع العقار للحجز",
    "Add your name and mobile to book": "أضف اسمك ورقم هاتفك للحجز",
    "Pick a visit slot to book": "اختر موعد زيارة للحجز",
    "Any": "الكل",
    "Optional": "اختياري",

    # ── pre-approval modal ───────────────────────────────────────────────────
    "Get pre-approved in two minutes": "احصل على موافقة مبدئية في دقيقتين",
    "A soft check only — no impact on your credit file. We come back with an indicative limit and the plans you qualify for.":
        "فحص مبدئي فقط — دون أي أثر على سجلك الائتماني. نعود إليك بحدّ تقريبي والخطط التي تتأهل لها.",
    "Where do we send the scope": "إلى أين نرسل النطاق",
    "Full name": "الاسم الكامل",
    "Mobile / WhatsApp": "الهاتف / واتساب",
    "Monthly income, EGP": "الدخل الشهري، جنيه",
    "Amount needed, EGP": "المبلغ المطلوب، جنيه",
    "Salaried": "موظف براتب",
    "Business owner": "صاحب عمل",
    "Self-employed": "يعمل لحسابه",
    "Expat income": "دخل من الخارج",
    "Submit for pre-approval": "أرسِل للموافقة المبدئية",
    "Fill name, mobile and income": "أدخِل الاسم والهاتف والدخل",
    "Soft check only. We share your details with our partner bank solely to size the limit.":
        "فحص مبدئي فقط. نشارك بياناتك مع البنك الشريك لتحديد الحدّ فقط لا غير.",
    "Indicative only. Bank plans are subject to approval; final terms are confirmed with your scope.":
        "تقريبي فقط. خطط البنك خاضعة للموافقة؛ وتُؤكَّد الشروط النهائية مع نطاق عملك.",

    # ── after handover / care ────────────────────────────────────────────────
    "After handover": "بعد التسليم",
    "Already living in it?": "تسكن فيها بالفعل؟",
    "No brief needed — pick a service, a day, and we confirm the visit by WhatsApp.":
        "لا حاجة لطلب — اختر خدمة ونؤكّد الزيارة عبر واتساب.",
    "Deep cleaning": "تنظيف عميق",
    "Post-works or seasonal. Crew, kit and materials included.":
        "بعد الأعمال أو موسمي. الطاقم والمعدات والمواد مشمولة.",
    "per visit": "لكل زيارة",
    "per year": "سنويًا",
    "Maintenance & repairs": "الصيانة والإصلاحات",
    "AC service, plumbing, electrics, joinery and snag fixes.":
        "صيانة تكييف وسباكة وكهرباء ونجارة وإصلاح ملاحظات.",

    # ── how it works ─────────────────────────────────────────────────────────
    "How it works": "كيف نعمل",
    "Five steps from empty shell to keys": "خمس خطوات من المحاره إلى المفاتيح",
    "Design, procurement and site execution run under one roof, so nothing gets lost between the drawing and the wall. One number to call the whole way through.":
        "التصميم والتوريد والتنفيذ في الموقع تحت سقف واحد، فلا يضيع شيء بين الرسم والتنفيذ. رقم واحد تتصل به.",
    "Step 01": "الخطوة 01",
    "Step 02": "الخطوة 02",
    "Step 03": "الخطوة 03",
    "Step 04": "الخطوة 04",
    "Step 05": "الخطوة 05",
    "Tell us about the unit": "أخبرنا عن الوحدة",
    "Answer the brief: location, size, condition and what you want the place to do. Two minutes, no site visit needed.":
        "أجب عن الطلب: الموقع والمساحة والحالة وما تريده من المكان. دقيقتان، دون حاجة لزيارة الموقع.",
    "Get a costed estimate": "احصل على تقدير مُسعّر",
    "A price range against the current rate card, with the scope and quantities behind it. Fixed once you sign.":
        "نطاق سعري وفق قائمة الأسعار الحالية، مع النطاق والكميات وراءه. يُثبَّت بمجرد التوقيع.",
    "Pick a style, we procure": "اختر تصميم ونحن ننفذ",
    "Choose a style and material board, or bring your own. We lock vendor prices and handle logistics to site.":
        "اختر تصميم ولوحة خامات. نثبّت أسعار الموردين وندير الشحن إلى الموقع.",
    "Watch the work each week": "تابِع العمل كل أسبوع",
    "Every Thursday: progress photos and video in your account, percentage complete, next week’s trades.":
        "كل خميس: صور وفيديو للتنفيذ على حسابك، ونسبة الإنجاز، وأعمال الأسبوع القادم.",
    "Sign off, then we hand over": "وقّع بالموافقة ثم نُسلّم",
    "You accept each milestone digitally — that sign-off releases the payment. Twelve-month workmanship cover after keys.":
        "توافق على كل مرحلة من حسابك — وهذه الموافقة تُفرِج عن الدفعة للمقاول. ضمان جودة تنفيذ لاثني عشر شهرًا بعد التسليم.",

    # ── FAQ ──────────────────────────────────────────────────────────────────
    "Questions we get before the first visit": "أسئلة تصلنا قبل الزيارة الأولى",
    "What’s included": "ما المشمول",
    "Close": "إغلاق",
    "Add to brief": "أضف إلى الطلب",
    "Added to brief ✓": "أُضيف إلى الطلب ✓",
    "What exactly is Turnkii?": "ما هو Turnkii بالضبط؟",
    "Turnkii is a turnkey property delivery platform. The work itself is executed by our vetted network of contractors, workshops and suppliers — that network is our execution arm, and our job is to manage and coordinate it: scoping, pricing, procurement, programme, quality control and snagging, so the owner deals with us instead of chasing six trades. Around that we provide the financial and technology layer — payment plans, milestone-gated payments, live progress tracking and after-handover care — so a customer can finish and then manage their property entirely through Turnkii. The mission: nobody should lose a year of rent, or a year of their life, to a fit-out.":
        "Turnkii منصة لتسليم العقارات جاهزة بالمفتاح. العمل نفسه تنفّذه شبكتنا المعتمدة من المقاولين والورش والموردين — هذه الشبكة هي ذراعنا التنفيذية، ومهمتنا إدارتها وتنسيقها: تحديد النطاق والتسعير والتوريد والبرنامج وضبط الجودة ومعالجة الملاحظات، حتى يتعامل المالك معنا فقط ليتمكن العميل من التشطيب ثم إدارة عقاره بالكامل عبر Turnkii. رسالتنا: ألّا يخسر أحد عامًا من الإيجار، أو عامًا من عمره، بسبب التشطيب.",
    "How is pricing structured?": "كيف يُبنى التسعير؟",
    "Finishing is quoted per square metre against a fixed scope; furniture and FF&E are quoted per unit against the style and package you chose. Ranges are shared on the site visit, once we have measured.":
        "يُسعَّر التشطيب بالمتر المربع مقابل نطاق اعمال ثابت؛ ويُسعَّر الأثاث والتجهيزات لكل وحدة مقابل التصميم والباقة اللذين اخترتهما. تُشارَك الأسعار المبدئية في زيارة الموقع، بعد القياس.",
    "Can we keep our own contractor for part of the scope?": "هل يمكننا الاحتفاظ بمقاولنا لجزء من الأعمال؟",
    "Yes. Many clients keep an existing MEP or joinery supplier. We coordinate them inside our programme and stay accountable for the sequence.":
        "نعم. كثير من العملاء يحتفظون بمورّد كهروميكانيكا أو نجارة قائم. ننسّق معه ضمن برنامجنا ونظل مسؤولين عن التسليم.",
    "What happens on the site visit?": "ماذا يحدث في زيارة الموقع؟",
    "A 45-minute survey: measurements, MEP condition, photographs and a walk through your chosen style. You get a scope document and cost range within three working days.":
        "معاينة مدتها 45 دقيقة: قياسات وحالة الأعمال الكهروميكانيكية وصور وجولة على التصميم المختار. تحصل على مستند اعمال و تسعير مبدئي خلال ثلاثة أيام عمل.",
    "How do milestone payments actually get approved?": "كيف تُعتمَد الدفعات المرحلية فعليًا؟",
    "Each milestone is posted to your account as photos and a video walk-through. You accept, reject with a reason, or ask for another shot. Once every item is accepted you sign off in one tap, and that certificate — your name, the timestamp and the item count — is what we attach to the invoice. No sign-off, no payment, no handover visit.":
        "تُنشَر كل مرحلة في حسابك كصور وجولة فيديو. توافق، أو ترفض مع ذكر السبب، أو تطلب لقطة أخرى. وبمجرد قبول كل بند توقّع بالموافقة بضغطة واحدة، وهذه الشهادة — اسمك والوقت وعدد البنود — هي ما نرفقه بالفاتورة. لا توقيع، لا دفعة، لا زيارة تسليم.",
    "Do you handle furniture for short-stay units differently?": "هل تتعاملون مع أثاث وحدات الإقامة القصيرة بشكل مختلف؟",
    "Materially, yes — commercial-grade fabrics, sealed surfaces, replaceable soft goods and a spare-part list so a damaged item is swapped, not re-specified.":
        "من حيث الخامات، نعم — أقمشة بمستوى تجاري وأسطح محكمة ومفروشات قابلة للاستبدال وقائمة قطع غيار حتى تُستبدَل القطعة التالفة لا أن يُعاد تحديد مواصفاتها.",

    # ── promise band + footer ────────────────────────────────────────────────
    "Bare shell on Monday. Rent-ready by handover.": "على المحاره يوم الاثنين. جاهز للإيجار عند التسليم.",
    "Recent work": "أعمال حديثة",
    "Packages": "الباقات",
    "FAQ": "الأسئلة الشائعة",
    "Furnishing &amp; FF&amp;E": "الأثاث والتجهيزات",
    "Kitchen design &amp; build": "تصميم وتنفيذ المطابخ",
    "AC &amp; HVAC": "التكييف",
    "Shutters &amp; blinds": "الشتر والستائر",
    "Maintenance &amp; repairs": "الصيانة والإصلاحات",
    "Talk to us": "تواصل معنا",
    "Sun–Thu, 10:00–18:00": "الأحد–الخميس، 10:00–18:00",
    "New Cairo · Sheikh Zayed · North Coast": "القاهرة الجديدة · الشيخ زايد · الساحل الشمالي",
    "Privacy policy": "سياسة الخصوصية",
    "Terms &amp; conditions": "الشروط والأحكام",
    "Back to top": "العودة للأعلى",
    "Continue to my brief": "المتابعة إلى طلبي",
    "Create my account": "أنشئ حسابي",
    "Track in my account": "تابِع في حسابي",
    "Book the free 45-minute survey": "احجز المعاينة المجانية (45 دقيقة)",

    # estimate rail labels + package/scope CTAs + care note
    "Rate": "السعر",
    "Programme": "البرنامج",
    "If financed": "عند التمويل",
    "What do you need done": "ما الذي تحتاج إنجازه",
    "Choose ": "اختر ",
    "Continue with ": "المتابعة بـ ",
    "call-out, parts at cost": "زيارة، وقطع الغيار بسعر التكلفة",
    # brief bottom-bar composition (rendered live from renderVals)
    "Ready to send": "جاهز للإرسال",
    " · brief ready to send": " · الطلب جاهز للإرسال",
    " · your brief so far": " · طلبك حتى الآن",
    "your brief so far": "طلبك حتى الآن",
    " complete · still needed: ": " مكتملة · المطلوب بعد: ",
    "property type": "نوع العقار",
    "name and mobile": "الاسم والهاتف",
    "a visit slot": "موعد زيارة",

    # ── care booking flow (homepage "after handover" widget) ─────────────────
    "Which service": "أي خدمة",
    "What to clean": "ما الذي يُنظَّف",
    "How often": "كم مرة",
    "How many rooms": "كم عدد الغرف",
    "Visit day": "يوم الزيارة",
    "Arrival window": "نافذة الوقت",
    "Whole unit": "الوحدة كاملة",
    "Kitchen & bathrooms": "المطبخ والحمّامات",
    "Post-works clean": "تنظيف بعد الأعمال",
    "Windows & terrace": "النوافذ والتراس",
    "One visit": "زيارة واحدة",
    "Yearly plan · 4 visits": "خطة سنوية · 4 زيارات",
    "Yearly plan · 3 visits": "خطة سنوية · 3 زيارات",
    "Pick a service": "اختر خدمة",
    "Pick rooms": "اختر الغرف",
    "Pick an area": "اختر المنطقة",
    "Pick what\\'s needed": "اختر المطلوب",
    "Pick units": "اختر الوحدات",
    "Priced by rooms and what to clean.": "يُسعَّر حسب الغرف وما يُنظَّف.",
    "Pick what to clean and how many rooms.": "اختر ما يُنظَّف وكم عدد الغرف.",
    "Pick the service, what\\'s needed, and how many units.": "اختر الخدمة، والمطلوب، وعدد الوحدات.",
    "Deep cleaning by rooms; maintenance per sub-service and units.": "تنظيف عميق حسب الغرف؛ وصيانة حسب الخدمة الفرعية والوحدات.",
    "Request the visit": "اطلب الزيارة",
    "Finish your selection": "أكمل اختيارك",
    "Technician": "فني",
    "Cleaning crew": "طاقم التنظيف",
    "We confirm on WhatsApp within the hour": "نؤكّد عبر واتساب خلال ساعة",
    ". The visit is logged against the unit in your account.": ". تُسجَّل الزيارة على الوحدة في حسابك.",

    # ── brief phase-II detail questions ──────────────────────────────────────
    "Kitchen layout": "تصميم المطبخ",
    "Cooling — rooms to cover": "التبريد — الغرف المطلوب تغطيتها",
    "Openings to fit": "الفتحات المطلوب تركيبها",
    "Outdoor space": "المساحة الخارجية",
    "Galley / straight run": "ممر / خط مستقيم",
    "L-shaped": "على شكل L",
    "U-shaped": "على شكل U",
    "With island": "مع جزيرة",
    "1–2 rooms": "1–2 غرفة",
    "3–4 rooms": "3–4 غرف",
    "5+ rooms": "5+ غرف",
    "Whole building": "المبنى كامل",
    "1–4 openings": "1–4 فتحات",
    "5–10 openings": "5–10 فتحات",
    "10+ openings": "10+ فتحات",
    "Balcony": "بلكونة",
    "Terrace": "تراس",
    "Garden": "حديقة",
    "Roof": "سطح",
    "Add more documents": "أضف مزيدًا من المستندات",
    "Anything specific (optional)": "أي شيء محدد (اختياري)",

    # ── service picker tags + package/style CTAs ─────────────────────────────
    "Core build": "الإنشاء الأساسي",
    "Fit-out": "التجهيز",
    "For portfolios": "للمحافظ",
    "Joinery": "النجارة",
    "Openings": "الفتحات",
    "Exterior": "الأعمال الخارجية",
    "In your brief": "ضمن طلبك",
    "Selected": "مُختار",
    "Not sure yet": "لست متأكدًا بعد",
    "Finishing only — furniture excluded ✓": "تشطيب فقط — الأثاث مستبعد ✓",

    # ── pre-approval result + calculator ─────────────────────────────────────
    "Employment": "نوع العمل",
    "Mobile": "الهاتف",
    "Owners & end users": "المُلّاك والمستخدمون",
    ", you": "، يمكنك",
    "You": "يمكنك",
    " can borrow up to EGP ": " الاقتراض حتى EGP ",
    "Indicative only, based on the income you gave and a ": "تقريبي فقط، بناءً على الدخل الذي ذكرته ونسبة قسط إلى دخل تبلغ ",
    "% instalment-to-income ratio. Our team confirms the final limit with the partner bank once your scope is priced — usually within one working day of the survey.":
        "%. يؤكّد فريقنا الحدّ النهائي مع البنك الشريك بمجرد تحديد التكلفة النهائية — عادةً خلال يوم عمل واحد من المعاينة.",
    "Indicative limit": "الحد التقريبي",
    "Max monthly": "الحد الأقصى الشهري",
    "Plans open to you": "الخطط المتاحة لك",
    "Each milestone": "كل دفعة",
    "Monthly payment": "الدفعة الشهرية",
    "Interest free: deposit, mid-works, pre-delivery and handover.":
        "بدون فوائد: مقدَّم، ومنتصف العمل، وقبل التسليم، وعند التسليم.",
    "Illustrative bank rate, up to EGP {cap}, approved alongside the survey.":
        "سعر بنكي توضيحي، حتى EGP {cap}، يُعتمَد بالتوازي مع المعاينة.",
    "Repaid from rental income once the units are listed and let.":
        "يُسدَّد من دخل الإيجار بمجرد إدراج الوحدات وتأجيرها.",
    "5% discount applied — you pay on EGP {discounted} and draw the budget at the end.":
        "خصم 5% مُطبَّق — تدفع على EGP {discounted} وتسحب الميزانية في النهاية.",

    # ── confirmation copy ────────────────────────────────────────────────────
    ", your brief is in.": "، طلبك وصلنا.",
    "Your brief is in.": "طلبك وصلنا.",
    " We call you within 24 hours.": " سوف نتصل بك خلال 24 ساعة.",
    "Our team confirms the survey by phone": "يؤكّد فريقنا المعاينة هاتفيًا",
    ". A surveyor and a designer attend for about 45 minutes, and a written scope with an EGP range follows within three working days":
        ". يحضر مسّاح ومصمّم لنحو 45 دقيقة، ثم يتبع ذلك نطاق مكتوب مع مدى تكلفة بالجنيه خلال ثلاثة أيام عمل",
    ", built on the ": "، مبني على تصميم ",
    ". Confirmation sent to ": ". أُرسل التأكيد إلى ",
    "Saved designs come with your brief": "التصاميم المحفوظة تصلك مع طلبك",
    " saved designs are attached": " تصميم محفوظ مرفق",
    "5% off furniture (kept)": "خصم 5% على الأثاث (محتفظ به)",
    "5% off furniture": "خصم 5% على الأثاث",

    # ── safe runtime-concatenation fragments (leading spaces preserved) ───────
    "How many ": "كم عدد ",
    "All ": "كل ",
    " milestones": " دفعات",
    " months": " شهرًا",
    " plans": " خطط",
    " visits, ": " زيارات، ",
    "% off · cancel anytime": "% خصم · إلغاء في أي وقت",
    " — parts quoted on site.": " — قطع الغيار تُسعَّر في الموقع.",
    " — held for ": " — محجوز لـ ",
    " direction": "",
    "your mobile": "هاتفك",
    " requested — ": " — تم الطلب — ",
    " services": " خدمات",
    " materials": " خامة",
    " files": " ملفات",
    " file": " ملف",
    " room": " غرفة",
    "From ": "من ",
    "from ": "من ",
    " weeks": " أسبوع",
    " selected": " مختار",
    " images": " صورة",
    " units": " وحدة",
    " service": " خدمة",
    " of ": " من ",
    "% confidence": "% ثقة",
    " / m²": " / م²",
    " / mo": " / شهر",
    " / unit": " / وحدة",
    "wks": "أسبوع",
    "mo": "شهر",
}

# slug → phrase dict
PAGES = {
    "index.html": HOME,
}
