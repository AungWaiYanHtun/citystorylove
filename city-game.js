/* VideoSpace "City Story Love" (Fix 21). A 2D city game that takes the VIP Videos tab place.
   Walk with the on-screen D-pad, work at the bakery / bar for money, buy gifts, complete missions
   and fall in love. Runs fully in the browser; progress is saved locally and in Telegram CloudStorage.
   Adults only. Romance stays at hugs and a kiss, then fades to black. */
(() => {
  "use strict";
  const cfg = window.VIDEOSPACE_CONFIG || {};
  const API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const tg = window.Telegram?.WebApp;
  const KEY = "videospace_city_v1"; // Telegram CloudStorage key (already per Telegram account)
  // localStorage is shared by every Telegram account on the phone, so the local copy is per user id
  const UID = String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "guest"), LKEY = KEY + "_" + UID;
  const $ = (id) => document.getElementById(id);
  const TS = 32;              // tile size in CSS px
  const MW = 46, MH = 30;     // map size in tiles
  const DAY_START = 8 * 60, DAY_END = 26 * 60; // 8:00 AM .. 2:00 AM

  // ---------------- Text ----------------
  const TXT = {
    en: {
      tab: "🏙️ City", eyebrow: "CITY STORY LOVE", heading: '🏙️ City <span class="gold-text">Story Love</span>',
      intro: "Walk around the city, work at the bakery to earn money, buy gifts, complete missions and fall in love. The night club and bar open at night.",
      play: "▶ Play", cont: "▶ Continue · Day {d}", newg: "New game", name: "Your name", namePh: "Your name", look: "Look",
      boy: "👦 Boy", girl: "👧 Girl", adult: "I am 18 or older", lang: "Language", needAdult: "Please confirm you are 18+.",
      day: "Day {d}", enter: "A · Enter {p}", closed: "{p} is closed. Opens at {t}.", hours: "Open {a} – {b}", always: "Open all day",
      people: "People here", nobody: "No one you know is here right now.", buy: "Buy",
      work: "🧑‍🍳 Work a shift", barwork: "🍹 Night shift", dance: "💃 Dance", sleep: "😴 Sleep (next day)",
      talk: "💬 Talk", gift: "🎁 Give gift", date: "💞 Ask on a date", confess: "💌 Confess", close: "✕", back: "← Back",
      noMoney: "Not enough money.", noEnergy: "Too tired. Sleep at Home first.", talked: "You already talked today.",
      gifted: "You already gave a gift today.", noItems: "Your bag is empty. Buy gifts at the shops.",
      dateNeed: "Reach ❤ 40 to ask for a date.", dateDone: "You already had a date today.", dateWhere: "Where do you want to go?",
      dateClosed: "closed now", free: "Free", couple: "💞 {n} is now your partner!", partner: "💞 Partner",
      lvUp: "⭐ Level up! Lv {l} · +${m}", bag: "Bag", missions: "Missions", reward: "Reward", missionDone: "Mission complete! +${r}", allDone: "All missions complete! Keep enjoying city life 💞",
      shiftTitle: "Bakery orders", barTitle: "Mocktail orders", shiftHelp: "Tap what the customer wants!", time: "Time", earned: "Earned",
      start: "Start", shiftEnd: "Shift over! You earned ${m}.", shiftHours: "Shifts can start {a} – {b}.", vipx2: "👑 VIP x2",
      danceHelp: "Tap DANCE when the marker is in the pink zone!", danceBtn: "💃 DANCE", perfect: "Perfect!", good: "Good", miss: "Miss",
      danceEnd: "Dance score {s}/5", noticed: "{n} noticed your moves! ❤ +{v}",
      slept: "Good morning! Day {d}.", passout: "It's 2 AM… you got sleepy and went home.", sleepEarly: "You can sleep after 8 PM.",
      entry: "Entry ${p}", entryVip: "Free entry for 👑 VIP", vipBonus: "👑 VIP daily bonus +$50", exit: "Exit", energy: "Energy",
      ok: "OK", owned: "In bag: {q}", loved: "I love it! How did you know?", liked: "Thank you, that's sweet.", meh: "Oh… thanks.",
      pickLang: "Choose your language", pickLook: "Choose your character", pickName: "What is your name?", next: "Next ▶", tapPlay: "Tap to play", cardSub: "Work · Shop · Date · Night club", changeLang: "🌐 Language",
      everyone: "Everyone you know", coffee: "☕ Drink a coffee", rest: "🪑 Relax on a bench", movie: "🎬 Watch a movie", rotate: "Tip: turn your phone sideways",
      items: { latte: "Latte", cupcake: "Cupcake", mocktail: "Mocktail", rose: "Rose", bouquet: "Bouquet", chocolate: "Chocolate", novel: "Novel", teddy: "Teddy bear", perfume: "Perfume", watch: "Watch", necklace: "Necklace" },
      roles: { lin: "Barista", kai: "Bookstore clerk", mira: "Bar regular", yuna: "DJ", ray: "Club owner" },
      m: { shift: "Work a shift at the Bakery", lin: "Meet Lin at the Café", gift: "Give someone a gift", earn: "Earn $300 in total",
        club: "Visit Neon Club at night", mira: "Meet Mira at Blue Moon Bar", dance: "Dance at Neon Club", bar: "Work a night shift at the Bar",
        love: "Reach ❤ 50 with anyone", date: "Take someone on a date", confess: "Reach ❤ 100 and confess" },
      dates: {
        cinema: "You share popcorn in the dark. During the sad scene, {n} quietly holds your hand.",
        park: "You walk around the fountain at sunset. {n} laughs at your silly story until the street lights turn on.",
        club: "The beat drops and {n} pulls you onto the dance floor. For one song, the whole city disappears.",
        bar: "Soft jazz, two glowing mocktails, and {n} tells you a secret no one else knows."
      },
      confessText: "Under the street lights, {n} stops and looks at you. \"I like you. Not as a friend — more.\" You pull {n} into a hug, and the first kiss is soft and certain. The night fades into something new…",
      lines: {
        lin: [["Welcome to Moonlight Café! First time here?", "I'm Lin. I make the best caramel latte on this street."],
              ["Oh, it's you again! I saved you the window seat.", "I read until closing time. Do you like books too?"],
              ["I smile more when you walk in… did you notice?", "After my shift, will you walk me home? The street is prettier with you."]],
        kai: [["Looking for something? The poetry shelf is my favorite.", "I'm Kai. Recommending books to strangers is my superpower."],
              ["I put a book aside for you. I think you'll love the ending.", "You always come when it's quiet. I like that."],
              ["I keep writing your name in the margins… don't laugh.", "Let's close the shop early and watch the sunset together."]],
        mira: [["This seat is taken… by my coat. But you may sit.", "I'm Mira. I come here to forget long days."],
               ["You again. I was hoping you'd come tonight.", "Tell me something true about yourself. I'm tired of polite lies."],
               ["When you laugh, this whole bar feels warmer.", "Stay a little longer tonight. I don't want the music to end yet."]],
        yuna: [["Hey newbie! Can you even dance?", "I'm Yuna, the DJ. Request a song and I might play it."],
               ["There you are! I dropped my best track when I saw you.", "Teach me something you love, and I'll teach you a beat."],
               ["The crowd is loud, but I only hear you.", "After my set, let's grab street noodles. Just us."]],
        ray: [["VIP section's upstairs. You don't look like a regular.", "Ray. I own this place. Behave and we'll get along."],
              ["You're becoming a regular. I like loyal people.", "The city looks different from the rooftop. Want to see it someday?"],
              ["I don't usually say this… but I wait for you every night.", "Stay. The club can run without me for one song."]]
      }
    },
    my: {
      tab: "🏙️ မြို့", eyebrow: "CITY STORY LOVE", heading: '🏙️ City <span class="gold-text">Story Love</span>',
      intro: "မြို့ထဲ လမ်းလျှောက်၊ မုန့်ဆိုင်မှာ အလုပ်လုပ်ပြီး ပိုက်ဆံရှာ၊ လက်ဆောင်ဝယ်၊ mission တွေဖြည့်ပြီး ချစ်ကြည့်ပါ။ ညဘက်မှာ Night club နဲ့ Bar ဖွင့်တယ်။",
      play: "▶ ဆော့မယ်", cont: "▶ ဆက်ဆော့မယ် · နေ့ {d}", newg: "အသစ်စမယ်", name: "နာမည်", namePh: "မင်းနာမည်", look: "ပုံစံ",
      boy: "👦 ယောက်ျားလေး", girl: "👧 မိန်းကလေး", adult: "ကျွန်ုပ် အသက် ၁၈ နှစ်ပြည့်ပြီ", lang: "ဘာသာစကား", needAdult: "အသက် ၁၈ နှစ်ပြည့်ကြောင်း အတည်ပြုပါ။",
      day: "နေ့ {d}", enter: "A · {p} ထဲဝင်မယ်", closed: "{p} ပိတ်ထားတယ်။ {t} မှာဖွင့်မယ်။", hours: "ဖွင့်ချိန် {a} – {b}", always: "တစ်နေ့လုံးဖွင့်",
      people: "ဒီမှာရှိတဲ့သူ", nobody: "အခု သိတဲ့သူ ဘယ်သူမှမရှိဘူး။", buy: "ဝယ်မယ်",
      work: "🧑‍🍳 အလုပ်ဆင်းမယ်", barwork: "🍹 ညဆိုင်း အလုပ်ဆင်းမယ်", dance: "💃 ကမယ်", sleep: "😴 အိပ်မယ် (နောက်နေ့)",
      talk: "💬 စကားပြော", gift: "🎁 လက်ဆောင်ပေး", date: "💞 ချိန်းတွေ့ဖို့ခေါ်", confess: "💌 ချစ်ကြောင်းပြော", close: "✕", back: "← နောက်သို့",
      noMoney: "ပိုက်ဆံမလောက်ဘူး။", noEnergy: "ပင်ပန်းလွန်းနေပြီ။ အိမ်မှာ အရင်အိပ်ပါ။", talked: "ဒီနေ့ စကားပြောပြီးပြီ။",
      gifted: "ဒီနေ့ လက်ဆောင်ပေးပြီးပြီ။", noItems: "အိတ်ထဲ ဘာမှမရှိဘူး။ ဆိုင်တွေမှာ လက်ဆောင်ဝယ်ပါ။",
      dateNeed: "ချိန်းတွေ့ဖို့ ❤ 40 လိုတယ်။", dateDone: "ဒီနေ့ ချိန်းတွေ့ပြီးပြီ။", dateWhere: "ဘယ်ကိုသွားမလဲ",
      dateClosed: "အခုပိတ်ထား", free: "အခမဲ့", couple: "💞 {n} က အခု မင်းရဲ့ ချစ်သူ!", partner: "💞 ချစ်သူ",
      lvUp: "⭐ Level တက်ပြီ! Lv {l} · +${m}", bag: "အိတ်", missions: "Mission များ", reward: "ဆုငွေ", missionDone: "Mission ပြီးပြီ! +${r}", allDone: "Mission အားလုံးပြီးပြီ! မြို့ထဲ ဆက်ပျော်ပါ 💞",
      shiftTitle: "မုန့်ဆိုင် အော်ဒါများ", barTitle: "Mocktail အော်ဒါများ", shiftHelp: "ဧည့်သည်လိုချင်တာတွေကို နှိပ်ပါ!", time: "အချိန်", earned: "ရငွေ",
      start: "စမယ်", shiftEnd: "အလုပ်ချိန်ပြီးပြီ! ${m} ရတယ်။", shiftHours: "အလုပ်ဆင်းချိန် {a} – {b} ပဲ စလို့ရတယ်။", vipx2: "👑 VIP x2",
      danceHelp: "အမှတ်အသားက ပန်းရောင်ဇုန်ထဲရောက်ရင် DANCE နှိပ်ပါ!", danceBtn: "💃 DANCE", perfect: "အရမ်းကောင်း!", good: "ကောင်းတယ်", miss: "လွဲသွားပြီ",
      danceEnd: "ကခုန်အမှတ် {s}/5", noticed: "{n} က မင်းကခုန်တာ သတိထားမိတယ်! ❤ +{v}",
      slept: "မင်္ဂလာနံနက်ခင်းပါ! နေ့ {d}။", passout: "မနက် ၂ နာရီရောက်ပြီ… အိပ်ချင်လို့ အိမ်ပြန်သွားတယ်။", sleepEarly: "ည ၈ နာရီနောက်မှ အိပ်လို့ရတယ်။",
      entry: "ဝင်ကြေး ${p}", entryVip: "👑 VIP အတွက် အခမဲ့ဝင်", vipBonus: "👑 VIP နေ့စဉ်ဆု +$50", exit: "ထွက်မယ်", energy: "အား",
      ok: "OK", owned: "အိတ်ထဲ: {q}", loved: "အရမ်းကြိုက်တယ်! ဘယ်လိုသိတာလဲ", liked: "ကျေးဇူးပဲ၊ ချစ်စရာလေး။", meh: "အော်… ကျေးဇူးပါ။",
      pickLang: "ဘာသာစကား ရွေးပါ", pickLook: "ဇာတ်ကောင် ရွေးပါ", pickName: "မင်းနာမည် ဘယ်လိုခေါ်လဲ", next: "ရှေ့ဆက် ▶", tapPlay: "နှိပ်ပြီးဆော့ပါ", cardSub: "အလုပ် · ဈေးဝယ် · ချိန်းတွေ့ · Night club", changeLang: "🌐 ဘာသာစကား",
      everyone: "သိတဲ့သူအားလုံး", coffee: "☕ ကော်ဖီသောက်မယ်", rest: "🪑 ခုံတန်းမှာ အနားယူမယ်", movie: "🎬 ရုပ်ရှင်ကြည့်မယ်", rotate: "ဖုန်းကို စောင်းပြီးဆော့ပါ",
      items: { latte: "လာတေး", cupcake: "ကပ်ကိတ်", mocktail: "Mocktail", rose: "နှင်းဆီ", bouquet: "ပန်းစည်း", chocolate: "ချောကလက်", novel: "ဝတ္ထုစာအုပ်", teddy: "တက်ဒီဝက်ဝံ", perfume: "ရေမွှေး", watch: "လက်ပတ်နာရီ", necklace: "ဆွဲကြိုး" },
      roles: { lin: "ကော်ဖီဆိုင်ဝန်ထမ်း", kai: "စာအုပ်ဆိုင်ဝန်ထမ်း", mira: "ဘားဧည့်သည်", yuna: "DJ", ray: "ကလပ်ပိုင်ရှင်" },
      m: { shift: "မုန့်ဆိုင်မှာ အလုပ်တစ်ဆိုင်းဆင်းပါ", lin: "Café မှာ Lin နဲ့တွေ့ပါ", gift: "တစ်ယောက်ယောက်ကို လက်ဆောင်ပေးပါ", earn: "စုစုပေါင်း $300 ရှာပါ",
        club: "ညဘက် Neon Club ကိုသွားပါ", mira: "Blue Moon Bar မှာ Mira နဲ့တွေ့ပါ", dance: "Neon Club မှာ ကခုန်ပါ", bar: "Bar မှာ ညဆိုင်း အလုပ်ဆင်းပါ",
        love: "တစ်ယောက်ယောက်နဲ့ ❤ 50 ရောက်အောင်လုပ်ပါ", date: "တစ်ယောက်ယောက်နဲ့ ချိန်းတွေ့ပါ", confess: "❤ 100 ရောက်ပြီး ချစ်ကြောင်းပြောပါ" },
      dates: {
        cinema: "မှောင်မှောင်ထဲမှာ ပေါက်ပေါက်ဆုပ်ကို မျှစားကြတယ်။ ဝမ်းနည်းစရာအခန်းရောက်တော့ {n} က မင်းလက်ကို တိတ်တဆိတ် ဆုပ်ကိုင်လာတယ်။",
        park: "နေဝင်ချိန် ရေပန်းပတ်လည် လမ်းလျှောက်ကြတယ်။ မင်းရဲ့ ရယ်စရာပုံပြင်ကြောင့် မီးတိုင်တွေလင်းလာတဲ့အထိ {n} ရယ်နေတယ်။",
        club: "beat ကျလာတော့ {n} က မင်းကို ကခုန်ကွင်းထဲ ဆွဲခေါ်သွားတယ်။ သီချင်းတစ်ပုဒ်စာ မြို့ကြီးတစ်ခုလုံး ပျောက်သွားသလိုပဲ။",
        bar: "jazz သံညင်းညင်း၊ မီးရောင်လက်နေတဲ့ mocktail နှစ်ခွက်နဲ့ {n} က ဘယ်သူမှမသိတဲ့ လျှို့ဝှက်ချက်တစ်ခု ပြောပြတယ်။"
      },
      confessText: "မီးတိုင်အောက်မှာ {n} ရပ်ပြီး မင်းကိုကြည့်တယ်။ \"မင်းကို ကြိုက်တယ်။ သူငယ်ချင်းထက် ပိုပြီးတော့။\" မင်းက {n} ကို ဖက်လိုက်တယ်၊ ပထမဆုံးအနမ်းက နူးညံ့ပြီး သေချာတယ်။ ညကြီးက အသစ်တစ်ခုဆီ မှေးမှိန်သွားတယ်…",
      lines: {
        lin: [["Moonlight Café ကို ကြိုဆိုပါတယ်ရှင်! ဒီကို ပထမဆုံးလာတာလား", "ကျွန်မနာမည် Lin ပါ။ ဒီလမ်းမှာ caramel latte အကောင်းဆုံးဖျော်တာ ကျွန်မပဲ။"],
              ["အော် ရှင်ပြန်လာတာပဲ! ပြတင်းပေါက်နားက ခုံ ချန်ထားပေးတယ်။", "ဆိုင်ပိတ်ချိန်ထိ စာအုပ်ဖတ်နေတတ်တယ်။ ရှင်ရော စာဖတ်ရတာကြိုက်လား"],
              ["ရှင်ဝင်လာရင် ကျွန်မ ပိုပြုံးမိတယ်… သတိထားမိလား", "အလုပ်ဆင်းရင် အိမ်ထိ လိုက်ပို့ပေးမလား။ ရှင်ပါရင် လမ်းက ပိုလှတယ်။"]],
        kai: [["ဘာရှာနေတာလဲ။ ကဗျာစင်က ငါအကြိုက်ဆုံးပဲ။", "ငါ Kai ပါ။ မသိတဲ့သူတွေကို စာအုပ်ညွှန်းပေးတာ ငါ့ superpower ပဲ။"],
              ["မင်းအတွက် စာအုပ်တစ်အုပ် ဖယ်ထားပေးတယ်။ အဆုံးသတ်ကို ကြိုက်မယ်ထင်တယ်။", "မင်းက အမြဲ တိတ်ဆိတ်တဲ့အချိန်မှ ရောက်လာတယ်။ ငါကြိုက်တယ်။"],
              ["စာရွက်အနားတွေမှာ မင်းနာမည် ရေးမိနေတယ်… မရယ်နဲ့နော်။", "ဆိုင်စောစောပိတ်ပြီး နေဝင်ချိန်ကို အတူကြည့်ရအောင်။"]],
        mira: [["ဒီခုံမှာ လူရှိတယ်… ကျွန်မကုတ်အင်္ကျီလေ။ ဒါပေမယ့် ထိုင်လို့ရပါတယ်။", "ကျွန်မ Mira ပါ။ ပင်ပန်းတဲ့နေ့တွေကို မေ့ဖို့ ဒီကိုလာတာ။"],
               ["ရှင်ပဲ ပြန်လာတာ။ ဒီည လာမယ်လို့ မျှော်နေတာ။", "ရှင့်အကြောင်း အမှန်တစ်ခု ပြောပြပါ။ ယဉ်ကျေးတဲ့ လိမ်လည်မှုတွေ ငြီးငွေ့နေပြီ။"],
               ["ရှင်ရယ်လိုက်ရင် ဒီဘားတစ်ခုလုံး ပိုနွေးလာသလိုပဲ။", "ဒီည နည်းနည်းလောက် ကြာကြာနေပါဦး။ သီချင်းသံ မဆုံးစေချင်သေးဘူး။"]],
        yuna: [["ဟေး လူသစ်! ကခုန်တတ်ရဲ့လား", "ငါ Yuna၊ ဒီက DJ။ သီချင်းတောင်းကြည့်၊ ဖွင့်ပေးချင်ဖွင့်ပေးမယ်။"],
               ["ရောက်လာပြီပဲ! နင့်ကိုမြင်တော့ အကောင်းဆုံး track ဖွင့်လိုက်တယ်။", "နင်ကြိုက်တာတစ်ခု သင်ပေး၊ ငါ beat တစ်ခု သင်ပေးမယ်။"],
               ["လူတွေ ဆူညံနေပေမယ့် ငါ နင့်အသံပဲကြားတယ်။", "set ပြီးရင် လမ်းဘေးခေါက်ဆွဲ သွားစားရအောင်။ ငါတို့နှစ်ယောက်တည်း။"]],
        ray: [["VIP နေရာက အပေါ်ထပ်မှာ။ မင်းက ပုံမှန်လာနေကျ မဟုတ်ပုံပဲ။", "Ray။ ဒီနေရာက ငါ့ဆိုင်။ စည်းကမ်းရှိရင် အဆင်ပြေမယ်။"],
              ["မင်း ပုံမှန်ဧည့်သည် ဖြစ်လာပြီ။ သစ္စာရှိတဲ့လူကို ငါကြိုက်တယ်။", "ခေါင်မိုးပေါ်ကကြည့်ရင် မြို့က တမျိုးလှတယ်။ တစ်နေ့ လိုက်ကြည့်မလား။"],
              ["ငါ ဒီလိုမပြောတတ်ဘူး… ဒါပေမယ့် ညတိုင်း မင်းကို စောင့်နေတယ်။", "နေပါဦး။ သီချင်းတစ်ပုဒ်စာလောက် ငါမရှိလည်း ဆိုင်က အဆင်ပြေပါတယ်။"]]
      }
    },
    ru: {
      intro: "Гуляй по городу, работай в пекарне, зарабатывай деньги, покупай подарки, выполняй миссии и влюбляйся. Ночью открываются клуб и бар.",
      play: "▶ Играть", cont: "▶ Продолжить · День {d}", newg: "Новая игра", name: "Твоё имя", namePh: "Твоё имя", look: "Персонаж",
      boy: "👦 Парень", girl: "👧 Девушка", adult: "Мне 18 лет или больше", lang: "Язык", needAdult: "Подтверди, что тебе есть 18.",
      day: "День {d}", enter: "A · Войти: {p}", closed: "{p} закрыто. Откроется в {t}.", hours: "Открыто {a} – {b}", always: "Открыто весь день",
      people: "Здесь сейчас", nobody: "Сейчас здесь нет знакомых.", buy: "Купить",
      work: "🧑‍🍳 Отработать смену", barwork: "🍹 Ночная смена", dance: "💃 Танцевать", sleep: "😴 Спать (следующий день)",
      talk: "💬 Поговорить", gift: "🎁 Подарить", date: "💞 Позвать на свидание", confess: "💌 Признаться", close: "✕", back: "← Назад",
      noMoney: "Не хватает денег.", noEnergy: "Ты слишком устал(а). Сначала поспи дома.", talked: "Сегодня вы уже говорили.",
      gifted: "Сегодня ты уже дарил(а) подарок.", noItems: "Сумка пуста. Купи подарки в магазинах.",
      dateNeed: "Для свидания нужно ❤ 40.", dateDone: "Сегодня свидание уже было.", dateWhere: "Куда пойдём?",
      dateClosed: "сейчас закрыто", free: "Бесплатно", couple: "💞 {n} теперь твоя пара!", partner: "💞 Пара",
      lvUp: "⭐ Новый уровень! Lv {l} · +${m}", bag: "Сумка", missions: "Миссии", reward: "Награда", missionDone: "Миссия выполнена! +${r}", allDone: "Все миссии выполнены! Наслаждайся городом 💞",
      shiftTitle: "Заказы пекарни", barTitle: "Заказы моктейлей", shiftHelp: "Нажимай то, что хочет клиент!", time: "Время", earned: "Заработано",
      start: "Старт", shiftEnd: "Смена окончена! Ты заработал(а) ${m}.", shiftHours: "Смену можно начать {a} – {b}.", vipx2: "👑 VIP x2",
      danceHelp: "Жми DANCE, когда метка в розовой зоне!", danceBtn: "💃 DANCE", perfect: "Идеально!", good: "Хорошо", miss: "Мимо",
      danceEnd: "Танец: {s}/5", noticed: "{n} заметил(а) твои движения! ❤ +{v}",
      slept: "Доброе утро! День {d}.", passout: "Уже 2 часа ночи… ты захотел(а) спать и ушёл(ушла) домой.", sleepEarly: "Спать можно после 20:00.",
      entry: "Вход ${p}", entryVip: "Бесплатный вход для 👑 VIP", vipBonus: "👑 VIP бонус дня +$50", exit: "Выйти", energy: "Энергия",
      ok: "OK", owned: "В сумке: {q}", loved: "Обожаю! Как ты догадался(ась)?", liked: "Спасибо, очень мило.", meh: "Ой… спасибо.",
      pickLang: "Выбери язык", pickLook: "Выбери персонажа", pickName: "Как тебя зовут?", next: "Далее ▶", tapPlay: "Нажми, чтобы играть", cardSub: "Работа · Покупки · Свидания · Клуб", changeLang: "🌐 Язык",
      everyone: "Все знакомые", rotate: "Совет: поверни телефон горизонтально", coffee: "☕ Выпить кофе", rest: "🪑 Отдохнуть на скамейке", movie: "🎬 Посмотреть фильм",
      items: { latte: "Латте", cupcake: "Капкейк", mocktail: "Моктейль", rose: "Роза", bouquet: "Букет", chocolate: "Шоколад", novel: "Роман", teddy: "Плюшевый мишка", perfume: "Духи", watch: "Часы", necklace: "Колье" },
      roles: { lin: "Бариста", kai: "Продавец книг", mira: "Гостья бара", yuna: "Диджей", ray: "Владелец клуба" },
      m: { shift: "Отработай смену в пекарне", lin: "Познакомься с Лин в кафе", gift: "Подари кому-нибудь подарок", earn: "Заработай всего $300",
        club: "Сходи ночью в Neon Club", mira: "Познакомься с Мирой в Blue Moon Bar", dance: "Потанцуй в Neon Club", bar: "Отработай ночную смену в баре",
        love: "Набери ❤ 50 с кем-нибудь", date: "Сходи на свидание", confess: "Набери ❤ 100 и признайся" },
      dates: {
        cinema: "Вы делите попкорн в темноте. На грустной сцене {n} тихо берёт тебя за руку.",
        park: "Вы гуляете у фонтана на закате. {n} смеётся над твоей забавной историей, пока не зажигаются фонари.",
        club: "Бит взрывается, и {n} тянет тебя на танцпол. На одну песню весь город исчезает.",
        bar: "Тихий джаз, два светящихся моктейля, и {n} рассказывает тебе секрет, которого не знает никто."
      },
      confessText: "Под фонарями {n} останавливается и смотрит на тебя. «Ты мне нравишься. Не как друг — больше». Ты обнимаешь {n}, и первый поцелуй нежный и уверенный. Ночь растворяется во что-то новое…",
      lines: {
        lin: [["Добро пожаловать в Moonlight Café! Ты здесь впервые?", "Я Лин. Лучший карамельный латте на этой улице — мой."],
              ["О, это снова ты! Я оставила тебе место у окна.", "Я читаю до закрытия. А ты любишь книги?"],
              ["Когда ты входишь, я улыбаюсь чаще… заметил(а)?", "После смены проводишь меня домой? С тобой улица красивее."]],
        kai: [["Что-то ищешь? Полка с поэзией — моя любимая.", "Я Кай. Советовать книги незнакомцам — моя суперсила."],
              ["Я отложил для тебя книгу. Думаю, тебе понравится финал.", "Ты всегда приходишь, когда тихо. Мне это нравится."],
              ["Я всё пишу твоё имя на полях… не смейся.", "Давай закроем магазин пораньше и посмотрим на закат вместе."]],
        mira: [["Это место занято… моим пальто. Но можешь сесть.", "Я Мира. Прихожу сюда забыть длинные дни."],
               ["Снова ты. Я надеялась, что ты придёшь сегодня.", "Расскажи о себе что-то настоящее. Я устала от вежливой лжи."],
               ["Когда ты смеёшься, весь бар становится теплее.", "Останься ещё немного. Я не хочу, чтобы музыка кончалась."]],
        yuna: [["Эй, новичок! Ты вообще танцевать умеешь?", "Я Юна, диджей. Закажи песню — может, и поставлю."],
               ["Вот ты где! Увидела тебя и поставила свой лучший трек.", "Научи меня тому, что любишь, а я научу тебя биту."],
               ["Толпа шумит, но я слышу только тебя.", "После сета пойдём есть уличную лапшу. Только мы."]],
        ray: [["VIP-зона наверху. Ты не похож(а) на завсегдатая.", "Рэй. Это моё место. Веди себя хорошо — и поладим."],
              ["Ты становишься завсегдатаем. Я люблю верных людей.", "С крыши город выглядит иначе. Хочешь как-нибудь увидеть?"],
              ["Я обычно такого не говорю… но жду тебя каждую ночь.", "Останься. Клуб проживёт без меня одну песню."]]
      }
    },
    es: {
      intro: "Pasea por la ciudad, trabaja en la panadería para ganar dinero, compra regalos, completa misiones y enamórate. De noche abren el club y el bar.",
      play: "▶ Jugar", cont: "▶ Continuar · Día {d}", newg: "Nueva partida", name: "Tu nombre", namePh: "Tu nombre", look: "Personaje",
      boy: "👦 Chico", girl: "👧 Chica", adult: "Tengo 18 años o más", lang: "Idioma", needAdult: "Confirma que tienes 18 años o más.",
      day: "Día {d}", enter: "A · Entrar a {p}", closed: "{p} está cerrado. Abre a las {t}.", hours: "Abierto {a} – {b}", always: "Abierto todo el día",
      people: "Gente aquí", nobody: "Ahora no hay nadie conocido aquí.", buy: "Comprar",
      work: "🧑‍🍳 Trabajar un turno", barwork: "🍹 Turno de noche", dance: "💃 Bailar", sleep: "😴 Dormir (día siguiente)",
      talk: "💬 Hablar", gift: "🎁 Dar regalo", date: "💞 Pedir una cita", confess: "💌 Declararse", close: "✕", back: "← Volver",
      noMoney: "No tienes suficiente dinero.", noEnergy: "Estás muy cansado/a. Duerme en casa primero.", talked: "Ya hablaron hoy.",
      gifted: "Ya diste un regalo hoy.", noItems: "Tu bolsa está vacía. Compra regalos en las tiendas.",
      dateNeed: "Necesitas ❤ 40 para pedir una cita.", dateDone: "Ya tuviste una cita hoy.", dateWhere: "¿Adónde quieres ir?",
      dateClosed: "cerrado ahora", free: "Gratis", couple: "💞 ¡{n} ahora es tu pareja!", partner: "💞 Pareja",
      lvUp: "⭐ ¡Subiste de nivel! Lv {l} · +${m}", bag: "Bolsa", missions: "Misiones", reward: "Premio", missionDone: "¡Misión cumplida! +${r}", allDone: "¡Todas las misiones cumplidas! Disfruta la ciudad 💞",
      shiftTitle: "Pedidos de panadería", barTitle: "Pedidos de mocktails", shiftHelp: "¡Toca lo que pide el cliente!", time: "Tiempo", earned: "Ganado",
      start: "Empezar", shiftEnd: "¡Turno terminado! Ganaste ${m}.", shiftHours: "Los turnos empiezan {a} – {b}.", vipx2: "👑 VIP x2",
      danceHelp: "¡Toca DANCE cuando la marca esté en la zona rosa!", danceBtn: "💃 DANCE", perfect: "¡Perfecto!", good: "Bien", miss: "Fallo",
      danceEnd: "Baile: {s}/5", noticed: "¡{n} se fijó en tus pasos! ❤ +{v}",
      slept: "¡Buenos días! Día {d}.", passout: "Son las 2 AM… te dio sueño y volviste a casa.", sleepEarly: "Puedes dormir después de las 8 PM.",
      entry: "Entrada ${p}", entryVip: "Entrada gratis para 👑 VIP", vipBonus: "👑 Bono VIP diario +$50", exit: "Salir", energy: "Energía",
      ok: "OK", owned: "En la bolsa: {q}", loved: "¡Me encanta! ¿Cómo lo sabías?", liked: "Gracias, qué detalle.", meh: "Oh… gracias.",
      pickLang: "Elige tu idioma", pickLook: "Elige tu personaje", pickName: "¿Cómo te llamas?", next: "Siguiente ▶", tapPlay: "Toca para jugar", cardSub: "Trabajo · Compras · Citas · Club", changeLang: "🌐 Idioma",
      everyone: "Todos tus conocidos", rotate: "Consejo: gira el teléfono", coffee: "☕ Tomar un café", rest: "🪑 Descansar en un banco", movie: "🎬 Ver una película",
      items: { latte: "Latte", cupcake: "Cupcake", mocktail: "Mocktail", rose: "Rosa", bouquet: "Ramo", chocolate: "Chocolate", novel: "Novela", teddy: "Osito de peluche", perfume: "Perfume", watch: "Reloj", necklace: "Collar" },
      roles: { lin: "Barista", kai: "Librero", mira: "Clienta del bar", yuna: "DJ", ray: "Dueño del club" },
      m: { shift: "Trabaja un turno en la panadería", lin: "Conoce a Lin en el café", gift: "Dale un regalo a alguien", earn: "Gana $300 en total",
        club: "Visita Neon Club de noche", mira: "Conoce a Mira en Blue Moon Bar", dance: "Baila en Neon Club", bar: "Trabaja un turno de noche en el bar",
        love: "Llega a ❤ 50 con alguien", date: "Ten una cita", confess: "Llega a ❤ 100 y declárate" },
      dates: {
        cinema: "Comparten palomitas en la oscuridad. En la escena triste, {n} te toma la mano en silencio.",
        park: "Pasean junto a la fuente al atardecer. {n} se ríe de tu historia tonta hasta que se encienden las farolas.",
        club: "Cae el beat y {n} te lleva a la pista. Durante una canción, toda la ciudad desaparece.",
        bar: "Jazz suave, dos mocktails brillantes y {n} te cuenta un secreto que nadie más sabe."
      },
      confessText: "Bajo las farolas, {n} se detiene y te mira. «Me gustas. No como amigo — más». Abrazas a {n}, y el primer beso es suave y seguro. La noche se funde en algo nuevo…",
      lines: {
        lin: [["¡Bienvenido/a a Moonlight Café! ¿Primera vez aquí?", "Soy Lin. Preparo el mejor latte de caramelo de esta calle."],
              ["¡Oh, eres tú otra vez! Te guardé el asiento junto a la ventana.", "Leo hasta la hora de cerrar. ¿A ti también te gustan los libros?"],
              ["Sonrío más cuando entras… ¿lo notaste?", "Después de mi turno, ¿me acompañas a casa? La calle es más bonita contigo."]],
        kai: [["¿Buscas algo? La estantería de poesía es mi favorita.", "Soy Kai. Recomendar libros a desconocidos es mi superpoder."],
              ["Te aparté un libro. Creo que te encantará el final.", "Siempre vienes cuando está tranquilo. Me gusta."],
              ["No dejo de escribir tu nombre en los márgenes… no te rías.", "Cerremos la tienda temprano y veamos el atardecer juntos."]],
        mira: [["Este asiento está ocupado… por mi abrigo. Pero puedes sentarte.", "Soy Mira. Vengo aquí a olvidar los días largos."],
               ["Tú otra vez. Esperaba que vinieras esta noche.", "Cuéntame algo verdadero de ti. Estoy cansada de mentiras amables."],
               ["Cuando te ríes, todo el bar se siente más cálido.", "Quédate un poco más. No quiero que la música termine todavía."]],
        yuna: [["¡Hey, novato! ¿Sabes bailar siquiera?", "Soy Yuna, la DJ. Pide una canción y quizá la ponga."],
               ["¡Ahí estás! Puse mi mejor tema cuando te vi.", "Enséñame algo que ames y yo te enseño un beat."],
               ["La gente hace ruido, pero solo te oigo a ti.", "Después de mi set, vamos por fideos callejeros. Solo nosotros."]],
        ray: [["La zona VIP está arriba. No pareces un cliente habitual.", "Ray. Este lugar es mío. Pórtate bien y nos llevaremos bien."],
              ["Te estás volviendo habitual. Me gusta la gente leal.", "Desde la azotea la ciudad se ve distinta. ¿Quieres verla algún día?"],
              ["No suelo decir esto… pero te espero cada noche.", "Quédate. El club puede seguir sin mí durante una canción."]]
      }
    }
  };
  // English is the base: any key a language lacks falls back to English.
  ["my", "ru", "es"].forEach((k) => { TXT[k] = Object.assign({}, TXT.en, TXT[k]); });
  // Fix 24: characters, boutique and wardrobe texts.
  const EXTRA = {
    en: { ward: "👗 Wardrobe", tops: "👕 Tops", bottoms: "👖 Bottoms", chars: "👤 Character", orig: "Original", wear: "Wear", wearing: "✓ Wearing",
      own: "Owned", buyWear: "Buy & wear {p}", tryHint: "Tap clothes to try them on.", bought: "🛍️ Bought! +{n}", mstyle: "Buy new clothes at the Boutique",
      cl: { white: "White", red: "Red", pink: "Pink", sky: "Sky blue", mint: "Mint", yellow: "Yellow", purple: "Lavender", black: "Black", stripe: "Stripes", plaid: "Plaid", heart: "Hearts", gold: "Gold", denim: "Denim", khaki: "Khaki", navy: "Navy", green: "Green" } },
    my: { ward: "👗 အဝတ်ဗီရို", tops: "👕 အင်္ကျီ", bottoms: "👖 ဘောင်းဘီ/စကတ်", chars: "👤 ဇာတ်ကောင်", orig: "မူလ", wear: "ဝတ်မယ်", wearing: "✓ ဝတ်ထားတယ်",
      own: "ရှိပြီး", buyWear: "ဝယ်ပြီးဝတ်မယ် {p}", tryHint: "အဝတ်ကိုနှိပ်ပြီး စမ်းဝတ်ကြည့်ပါ။", bought: "🛍️ ဝယ်ပြီးပြီ! +{n}", mstyle: "Boutique မှာ အဝတ်အစားအသစ် ဝယ်ပါ",
      cl: { white: "အဖြူ", red: "အနီ", pink: "ပန်းရောင်", sky: "မိုးပြာ", mint: "မင့်စိမ်း", yellow: "အဝါ", purple: "ခရမ်းနု", black: "အနက်", stripe: "အစင်း", plaid: "အကွက်", heart: "နှလုံးပုံ", gold: "ရွှေရောင်", denim: "ဂျင်းပြာ", khaki: "ခါကီ", navy: "နက်ပြာ", green: "အစိမ်း" } },
    ru: { ward: "👗 Гардероб", tops: "👕 Верх", bottoms: "👖 Низ", chars: "👤 Персонаж", orig: "Оригинал", wear: "Надеть", wearing: "✓ Надето",
      own: "Есть", buyWear: "Купить и надеть {p}", tryHint: "Нажми на одежду, чтобы примерить.", bought: "🛍️ Куплено! +{n}", mstyle: "Купи новую одежду в бутике",
      cl: { white: "Белый", red: "Красный", pink: "Розовый", sky: "Голубой", mint: "Мятный", yellow: "Жёлтый", purple: "Лавандовый", black: "Чёрный", stripe: "Полоска", plaid: "Клетка", heart: "Сердечки", gold: "Золотой", denim: "Деним", khaki: "Хаки", navy: "Тёмно-синий", green: "Зелёный" } },
    es: { ward: "👗 Armario", tops: "👕 Partes de arriba", bottoms: "👖 Partes de abajo", chars: "👤 Personaje", orig: "Original", wear: "Poner", wearing: "✓ Puesto",
      own: "Tuyo", buyWear: "Comprar y poner {p}", tryHint: "Toca la ropa para probártela.", bought: "🛍️ ¡Comprado! +{n}", mstyle: "Compra ropa nueva en la boutique",
      cl: { white: "Blanco", red: "Rojo", pink: "Rosa", sky: "Celeste", mint: "Menta", yellow: "Amarillo", purple: "Lavanda", black: "Negro", stripe: "Rayas", plaid: "Cuadros", heart: "Corazones", gold: "Dorado", denim: "Mezclilla", khaki: "Caqui", navy: "Azul marino", green: "Verde" } }
  };
  Object.keys(TXT).forEach((k) => { Object.assign(TXT[k], EXTRA.en, EXTRA[k] || {}); TXT[k].m = Object.assign({}, TXT[k].m, { style: TXT[k].mstyle }); });
  const LANGS = [["en", "🇬🇧 English"], ["ru", "🇷🇺 Русский"], ["es", "🇪🇸 Español"], ["my", "🇲🇲 မြန်မာ"]];
  const GAME_TITLE = "City Love";
  const TAB_TEXT = "👑 VIP Game";

  // ---------------- Game data ----------------
  const ITEMS = {
    latte: { e: "☕", p: 8 }, cupcake: { e: "🧁", p: 15 }, mocktail: { e: "🍹", p: 15 }, rose: { e: "🌹", p: 20 },
    chocolate: { e: "🍫", p: 25 }, novel: { e: "📕", p: 30 }, bouquet: { e: "💐", p: 45 }, teddy: { e: "🧸", p: 60 },
    perfume: { e: "🌸", p: 120 }, watch: { e: "⌚", p: 200 }, necklace: { e: "💍", p: 250 }
  };
  const H = (h, m = 0) => h * 60 + m;
  const VENUES = {
    home:    { sign: "HOME",          b: [1, 3, 6, 6],  roof: "#7a5cc4", wall: "#efe6fb", open: 0, close: 99999, bg: "story-assets/bg_room.webp" },
    cafe:    { sign: "CAFÉ",          b: [12, 4, 5, 5], roof: "#c0565b", wall: "#f3e2c8", open: H(8), close: H(20), bg: "story-assets/bg_cafe.webp", shop: ["latte"] },
    flowers: { sign: "FLOWERS",       b: [18, 4, 5, 5], roof: "#e07aa5", wall: "#fbe8f0", open: H(9), close: H(21), bg: "city-assets/bg_shop.webp", shop: ["rose", "bouquet"] },
    club:    { sign: "NEON CLUB",     b: [27, 3, 8, 6], roof: "#b84d86", wall: "#2a2140", open: H(20), close: DAY_END, bg: "city-assets/bg_club.webp", neon: "#ff4fd8" },
    bar:     { sign: "BLUE MOON BAR", b: [40, 3, 5, 6], roof: "#2f4f9a", wall: "#1f2a44", open: H(18), close: DAY_END, bg: "city-assets/bg_bar.webp", shop: ["mocktail"], neon: "#4fc3ff" },
    bakery:  { sign: "BAKERY",        b: [1, 14, 6, 5], roof: "#d08a3a", wall: "#f6eadb", open: H(7), close: H(20), bg: "city-assets/bg_bakery.webp", shop: ["cupcake"] },
    books:   { sign: "BOOKS",         b: [12, 14, 5, 5], roof: "#3f8f6b", wall: "#e6f2ea", open: H(10), close: H(20), bg: "story-assets/bg_campus.webp", shop: ["novel"] },
    gifts:   { sign: "GIFTS",         b: [18, 14, 5, 5], roof: "#4c6fb8", wall: "#e6e9f2", open: H(10), close: H(22), bg: "city-assets/bg_shop.webp", shop: ["chocolate", "teddy", "perfume", "watch", "necklace"] },
    cinema:  { sign: "CINEMA",        b: [40, 14, 5, 5], roof: "#5b3f8f", wall: "#ece6f7", open: H(12), close: H(24), bg: "story-assets/bg_night.webp" },
    park:    { sign: "PARK", park: true, door: [31.5, 15.1], open: H(6), close: H(23), bg: "story-assets/bg_forest.webp" }
  };
  VENUES.boutique = { sign: "BOUTIQUE", b: [12, 24, 6, 3], roof: "#d4569b", wall: "#fde8f3", open: H(10), close: H(21), bg: "city-assets/bg_boutique.webp" };
  const DECOR = [[1, 24, 6, 3], [19, 24, 4, 3], [27, 24, 9, 3], [40, 24, 5, 3]];
  // Fix 24: six playable characters + clothes (recoloured on the fly from shading masks).
  const CHARS = [1, 2, 3, 4, 5, 6];
  const charsFor = (look) => (look === "girl" ? [4, 5, 6] : [1, 2, 3]); // boys pick boys, girls pick girls
  const LEGCUT = { 1: 0.67, 2: 0.67, 3: 0.66, 4: 0.75, 5: 0.76, 6: 0.70 }; // where the legs start (fraction of height)
  const PL = (k, n) => `city-assets/players/${k}${n}.webp`;
  const CLOTH = {
    white: { c: "#ffffff" }, red: { c: "#ff5a6e" }, pink: { c: "#ffa3c7" }, sky: { c: "#8ccfff" }, mint: { c: "#9eecc8" }, yellow: { c: "#ffe066" },
    purple: { c: "#b9a0ff" }, black: { c: "#55556a" }, gold: { c: "#f0c96a" }, denim: { c: "#6f9ee0" }, khaki: { c: "#e2c99a" }, navy: { c: "#4d68b0" }, green: { c: "#7ccf96" },
    stripe: { pat: "stripe", c: "#5a78c8", c2: "#ffffff" }, plaid: { pat: "plaid", c: "#e0566a", c2: "#2e3a6a" }, heart: { pat: "heart", c: "#ffc2d9", c2: "#ff4f8b" }
  };
  const SHOP = {
    t: [["white", 15], ["red", 20], ["pink", 20], ["sky", 20], ["mint", 20], ["yellow", 25], ["purple", 25], ["black", 30], ["stripe", 40], ["plaid", 45], ["heart", 50], ["gold", 60]],
    b: [["denim", 20], ["black", 20], ["khaki", 20], ["white", 25], ["navy", 25], ["pink", 25], ["red", 30], ["green", 30], ["stripe", 40], ["plaid", 45]]
  };
  const NPCS = {
    lin:  { name: "Lin",  venue: "cafe",  from: H(9),  to: H(18),   img: (e) => `story-assets/lin_${e}.webp`, faces: true, loves: ["rose", "teddy"], likes: ["cupcake", "chocolate", "novel", "bouquet"] },
    kai:  { name: "Kai",  venue: "books", from: H(10), to: H(19),   img: (e) => `story-assets/kai_${e}.webp`, faces: true, loves: ["novel", "latte"], likes: ["chocolate", "cupcake", "watch"] },
    mira: { name: "Mira", venue: "bar",   from: H(18), to: DAY_END, img: () => "detective-assets/mira.webp", loves: ["necklace", "perfume"], likes: ["rose", "bouquet", "mocktail"] },
    yuna: { name: "Yuna", venue: "club",  from: H(21), to: DAY_END, img: () => "city-assets/yuna.webp", loves: ["chocolate", "mocktail"], likes: ["teddy", "cupcake", "rose"] },
    ray:  { name: "Ray",  venue: "club",  from: H(20), to: DAY_END, img: () => "detective-assets/ray.webp", loves: ["watch", "mocktail"], likes: ["chocolate", "novel", "perfume"] }
  };
  const DATES = { cinema: { cost: 40, love: 12 }, park: { cost: 0, love: 8 }, club: { cost: 30, love: 14 }, bar: { cost: 50, love: 12 } };
  const MISSIONS = [
    ["shift", 20, (s) => s.st.shifts >= 1], ["lin", 10, (s) => !!s.met.lin], ["gift", 15, (s) => s.st.gifts >= 1],
    ["earn", 30, (s) => s.st.earned >= 300], ["club", 20, (s) => s.st.club >= 1], ["mira", 20, (s) => !!s.met.mira],
    ["dance", 20, (s) => s.st.dances >= 1], ["bar", 25, (s) => s.st.barShifts >= 1],
    ["style", 15, (s) => (s.st.clothes || 0) >= 1],
    ["love", 40, (s) => Math.max(...Object.values(s.love)) >= 50], ["date", 50, (s) => s.st.dates >= 1], ["confess", 100, (s) => !!s.partner]
  ];
  const JOBS = {
    bakery: { items: ["🥐", "🍩", "🍰", "🥖", "🧁", "🍪"], per: 5, bonus: 3, from: H(8), to: H(17), stat: "shifts", title: "shiftTitle" },
    bar:    { items: ["🍹", "🥤", "🧃", "🍋", "🧊", "🍒"], per: 7, bonus: 4, from: H(18), to: H(23), stat: "barShifts", title: "barTitle" }
  };

  // ---------------- State ----------------
  let S = loadLocal();
  let setup = { name: "", look: "boy", char: 1, adult: false, lang: (S && S.lang) || "en" };
  function norm() { if (!S) return; S.look = S.look === "girl" ? "girl" : "boy"; if (!charsFor(S.look).includes(S.char)) S.char = charsFor(S.look)[0]; S.wear = S.wear || { t: "orig", b: "orig" }; S.closet = S.closet || {}; S.st.clothes = S.st.clothes || 0; }
  let vip = false;
  const L = () => TXT[(S && S.lang) || setup.lang] || TXT.en;
  const fmt = (s, o = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ""));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function fresh() {
    return { v: 1, ts: Date.now(), lang: setup.lang, name: setup.name.trim().slice(0, 18) || "You", look: setup.look, char: charsFor(setup.look).includes(setup.char) ? setup.char : charsFor(setup.look)[0], wear: { t: "orig", b: "orig" }, closet: {}, charSet: 1,
      day: 1, min: DAY_START, energy: 100, money: 40, lv: 1, xp: 0, x: 4.5, y: 9.6,
      love: { lin: 0, kai: 0, mira: 0, yuna: 0, ray: 0 }, met: {}, talk: {}, gave: {}, dated: {}, inv: {}, done: {},
      st: { shifts: 0, barShifts: 0, gifts: 0, earned: 0, club: 0, dances: 0, dates: 0, clothes: 0 }, partner: "", clubDay: 0 };
  }
  function loadLocal() { try { const s = JSON.parse(localStorage.getItem(LKEY) || "null"); return s && s.v === 1 && (!s.uid || s.uid === UID) ? s : null; } catch { return null; } }
  let cloudTimer = 0;
  function save() {
    if (!S) return;
    S.ts = Date.now(); S.uid = UID;
    const json = JSON.stringify(S);
    try { localStorage.setItem(LKEY, json); } catch {}
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => { try { tg?.CloudStorage?.setItem?.(KEY, json, () => {}); } catch {} }, 1500);
    if (!srvTimer) srvTimer = setTimeout(() => { srvTimer = 0; if (S) pushServer(JSON.stringify(S)); }, 5000);
  }
  // server copy (Supabase, keyed by the verified Telegram user id): survives new phones and cleared caches
  let srvTimer = 0;
  function pushServer(json, keep) {
    if (!API || !tg?.initData) return;
    try { fetch(API + "/api/save/city", { method: "POST", keepalive: !!keep, headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: json === null ? '{"data":null}' : '{"data":' + json + '}' }).catch(() => {}); } catch {}
  }
  function flushServer() { if (S && srvTimer) { clearTimeout(srvTimer); srvTimer = 0; pushServer(JSON.stringify(S), true); } }
  async function loadServer() {
    if (!API || !tg?.initData) return;
    try {
      const r = await fetch(API + "/api/save/city", { headers: { "X-Telegram-Init-Data": tg.initData } });
      const d = await r.json().catch(() => ({})); const c = d && d.data;
      if (r.ok && c && c.v === 1 && (!c.uid || c.uid === UID) && (!S || (c.ts || 0) > (S.ts || 0))) {
        S = c; try { localStorage.setItem(LKEY, JSON.stringify(c)); } catch {} if (!G) renderStart();
      } else if (r.ok && !c && S) pushServer(JSON.stringify(S));
    } catch {}
  }
  function loadCloud() {
    try {
      tg?.CloudStorage?.getItem?.(KEY, (err, val) => {
        if (err || !val) return;
        try { const c = JSON.parse(val); if (c && c.v === 1 && (!S || c.ts > S.ts)) { S = c; try { localStorage.setItem(LKEY, val); localStorage.removeItem(KEY); } catch {} renderStart(); } } catch {}
      });
    } catch {}
  }
  async function loadVip() {
    if (!API || !tg?.initData) return;
    try {
      const r = await fetch(API + "/api/detective/status", { headers: { "X-Telegram-Init-Data": tg.initData } });
      const d = await r.json().catch(() => ({})); vip = !!(r.ok && d.vip);
    } catch {}
  }

  // ---------------- Page tab + start screen ----------------
  function mount() {
    const nav = document.querySelector(".video-switch");
    if (!nav || $("city-tab-btn")) return;
    const vipBtn = $("vip-videos-btn");
    const btn = document.createElement("button");
    btn.type = "button"; btn.id = "city-tab-btn"; btn.className = "video-switch-btn";
    btn.textContent = TAB_TEXT;
    if (vipBtn) { nav.insertBefore(btn, vipBtn); vipBtn.classList.add("hidden"); } else nav.appendChild(btn);
    const sec = document.createElement("section");
    sec.id = "city-section"; sec.className = "story-section city-section hidden";
    sec.innerHTML = `<div class="section-heading"><div><span class="eyebrow"></span><h2></h2></div></div><div id="city-start"></div>`;
    const anchor = $("story-section") || $("library");
    anchor?.parentNode?.insertBefore(sec, anchor);
    btn.addEventListener("click", () => showTab(true));
    ["detective-tab-btn", "story-tab-btn", "regular-videos-btn", "vip-videos-btn"].forEach((id) =>
      $(id)?.addEventListener("click", () => showTab(false), true));
    renderStart(); loadCloud(); loadServer(); loadVip();
    document.addEventListener("visibilitychange", () => { if (document.hidden) flushServer(); });
  }
  function showTab(on) {
    const sec = $("city-section"); if (!sec) return;
    sec.classList.toggle("hidden", !on);
    $("city-tab-btn")?.classList.toggle("active", on);
    if (!on) return;
    ["library", "story-section", "detective-section"].forEach((id) => $(id)?.classList.add("hidden"));
    $("vip-hero")?.classList.remove("hidden"); // keep "Get VIP" reachable: VIP doubles job pay in the city
    ["regular-videos-btn", "vip-videos-btn", "story-tab-btn", "detective-tab-btn"].forEach((id) => $(id)?.classList.remove("active"));
    renderStart();
  }
  // The tab is a small game library ("VIP Game"); City Love is its first card.
  function renderStart() {
    const box = $("city-start"); if (!box) return;
    const t = L();
    const sec = $("city-section");
    sec.querySelector(".eyebrow").textContent = "VIP GAME";
    sec.querySelector("h2").innerHTML = '👑 VIP <span class="gold-text">Game</span>';
    const tab = $("city-tab-btn"); if (tab) tab.textContent = TAB_TEXT;
    const sub = S ? `👤 ${esc(S.name)} · ${fmt(t.day, { d: S.day })} · 💰 $${S.money}` : esc(t.cardSub);
    box.innerHTML = `<div class="cg-library">
      <button type="button" class="cg-card" id="cg-card-city">
        <div class="cg-card-img" style="background-image:url('city-assets/bg_club.webp')"><img src="city-assets/yuna.webp" alt=""><span class="cg-card-tag">2D · 18+</span></div>
        <div class="cg-card-body"><b>🏙️ ${GAME_TITLE}</b><small>${sub}</small><span class="cg-card-play">▶ ${S ? fmt(t.cont, { d: S.day }).replace("▶ ", "") : t.tapPlay}</span></div>
      </button>
      <button type="button" class="cg-card" id="cg-card-palace">
        <div class="cg-card-img" style="background-image:url('hanok3d/a/k_sky.jpg')"><img src="hanok3d/a/b1.webp" alt=""><span class="cg-card-tag">3D · NEW</span></div>
        <div class="cg-card-body"><b>🌸 Hanok Love</b><small>Korean spring village · Ha-eun</small><span class="cg-card-play">▶ ${t.tapPlay}</span></div>
      </button></div>`;
    $("cg-card-city").addEventListener("click", () => openTitle());
    $("cg-card-palace").addEventListener("click", openPalace);
  }

  // Hanok Love (3D) runs in its own page inside a full-screen frame.
  function openPalace() {
    try { tg && tg.requestFullscreen && tg.requestFullscreen(); } catch (e) {}
    let ov = $("palace-ov");
    if (!ov) {
      ov = document.createElement("div"); ov.id = "palace-ov";
      ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:#1a0f0a";
      ov.innerHTML = '<iframe src="hanok3d/index.html" style="border:0;width:100%;height:100%" allow="fullscreen"></iframe>';
      document.body.appendChild(ov);
      addEventListener("message", (e) => { if (e.data === "palace-close") { $("palace-ov")?.remove(); } });
    }
  }

  // ---------------- Landscape setup: language -> character -> name ----------------
  // Telegram Bot API 8.0+: real fullscreen (hides the white Telegram header).
  let fsByGame = false, fsTimer = 0;
  function enterFs() {
    clearTimeout(fsTimer);
    try { tg?.expand?.(); if (tg?.isVersionAtLeast?.("8.0") && !tg.isFullscreen) { tg.requestFullscreen(); fsByGame = true; } } catch {}
  }
  function exitFsLater() {
    clearTimeout(fsTimer);
    fsTimer = setTimeout(() => { if (G || T0 || !fsByGame) return; fsByGame = false; try { if (tg?.isFullscreen) tg.exitFullscreen(); } catch {} }, 400);
  }
  function resetJoy() {
    if (!G) return; G.joy = null; G.joyId = null;
    const k = $("cg-knob"); if (k) k.style.transform = ""; $("cg-joy")?.classList.remove("on");
  }
  function addXP(n) {
    S.xp = (S.xp || 0) + n; S.lv = S.lv || 1;
    let up = 0;
    while (S.xp >= needXP(S.lv)) { S.xp -= needXP(S.lv); S.lv += 1; up = S.lv; S.money += S.lv * 10; }
    if (up) setTimeout(() => toast(fmt(L().lvUp, { l: up, m: up * 10 })), 900);
  }
  const needXP = (lv) => 60 + lv * 40;
  function fitLandscape(el) {
    const w = window.innerWidth, h = window.innerHeight, portrait = h > w;
    el.style.width = (portrait ? h : w) + "px"; el.style.height = (portrait ? w : h) + "px";
    el.style.transform = portrait ? `translateX(${w}px) rotate(90deg)` : "none";
  }
  let T0 = null; // title/setup overlay
  function openTitle() {
    if (G || T0) return;
    const el = document.createElement("div"); el.id = "cg-title"; el.className = "cg-title";
    document.body.appendChild(el); document.documentElement.classList.add("cg-open");
    T0 = { el, resize: () => fitLandscape(el), back: () => closeTitle() };
    enterFs();
    fitLandscape(el); addEventListener("resize", T0.resize);
    try { tg?.onEvent?.("viewportChanged", T0.resize); tg?.BackButton?.onClick?.(T0.back); tg?.BackButton?.show?.(); tg?.disableVerticalSwipes?.(); } catch {}
    try { screen.orientation?.lock?.("landscape").catch(() => {}); } catch {}
    if (S) stepTitle(); else stepLang();
  }
  function closeTitle(keepOpen) {
    if (!T0) return;
    removeEventListener("resize", T0.resize);
    try { tg?.offEvent?.("viewportChanged", T0.resize); tg?.BackButton?.offClick?.(T0.back); if (!keepOpen) tg?.BackButton?.hide?.(); } catch {}
    T0.el.remove(); T0 = null; exitFsLater();
    if (!keepOpen) { document.documentElement.classList.remove("cg-open"); try { screen.orientation?.unlock?.(); } catch {} renderStart(); }
  }
  function titleFrame(inner, step) {
    const dots = step ? `<div class="cg-steps">${[1, 2, 3, 4].map((n) => `<i class="${n <= step ? "on" : ""}"></i>`).join("")}</div>` : "";
    T0.el.innerHTML = `<div class="cg-pbg" style="background-image:url('city-assets/bg_club.webp')"></div>
      <button type="button" class="cg-x cg-tclose" data-t="close">✕</button>
      <div class="cg-tbox"><div class="cg-logo"><span class="cg-logo-e">🏙️</span> <span class="cg-logo-t">${GAME_TITLE}</span></div>${dots}${inner}</div>`;
    T0.el.querySelector("[data-t=close]").addEventListener("click", () => closeTitle());
  }
  function stepTitle() {
    const t = L(); norm();
    titleFrame(`<p class="cg-tsub">👤 ${esc(S.name)} · ${fmt(t.day, { d: S.day })} · 💰 $${S.money}${S.partner ? " · 💞 " + NPCS[S.partner].name : ""}</p>
      <div class="cg-tcol"><button type="button" class="button button-gold cg-big" data-t="cont">${fmt(t.cont, { d: S.day })}</button>
      <button type="button" class="button cg-new" data-t="new">${t.newg}</button></div>`);
    T0.el.querySelector("[data-t=cont]").addEventListener("click", () => { if (!S.charSet) return stepChar(true); closeTitle(true); openGame(); });
    T0.el.querySelector("[data-t=new]").addEventListener("click", () => {
      if (!confirm(t.newg + "?")) return;
      S = null; try { localStorage.removeItem(LKEY); tg?.CloudStorage?.removeItem?.(KEY, () => {}); pushServer(null); } catch {}
      setup = { name: "", look: "boy", char: 1, adult: false, lang: "en" }; stepLang();
    });
  }
  function stepLang() {
    titleFrame(`<h3 class="cg-th">🌐 Language · Язык · Idioma · ဘာသာစကား</h3>
      <div class="cg-langs">${LANGS.map(([k, l]) => `<button type="button" class="cg-lang${setup.lang === k ? " active" : ""}" data-l="${k}">${l}</button>`).join("")}</div>`, 1);
    T0.el.querySelectorAll("[data-l]").forEach((b) => b.addEventListener("click", () => { setup.lang = b.dataset.l; stepLook(); }));
  }
  function stepLook() {
    const t = L();
    titleFrame(`<h3 class="cg-th">${t.pickLook}</h3>
      <div class="cg-looks"><button type="button" class="cg-look${setup.look === "boy" ? " active" : ""}" data-k="boy"><span>👦</span>${t.boy.replace(/^\S+\s/, "")}</button>
      <button type="button" class="cg-look${setup.look === "girl" ? " active" : ""}" data-k="girl"><span>👧</span>${t.girl.replace(/^\S+\s/, "")}</button></div>
      <button type="button" class="cg-x cg-tback" data-t="back">${t.back}</button>`, 2);
    T0.el.querySelectorAll(".cg-look").forEach((b) => b.addEventListener("click", () => {
      if (setup.look !== b.dataset.k || !charsFor(b.dataset.k).includes(setup.char)) setup.char = charsFor(b.dataset.k)[0];
      setup.look = b.dataset.k; stepName();
    }));
    T0.el.querySelector("[data-t=back]").addEventListener("click", stepLang);
  }
  // character pick: last step of a new game, or once for an old save that never picked one
  function stepChar(cont) {
    const t = L(), look = cont ? S.look : setup.look, list = charsFor(look);
    let cur = cont ? (list.includes(S.char) ? S.char : list[0]) : (list.includes(setup.char) ? setup.char : list[0]);
    titleFrame(`<h3 class="cg-th">${t.chars}</h3>
      <div class="cg-chars cg-chars3">${list.map((n) => `<button type="button" class="cg-charpick${cur === n ? " active" : ""}" data-k="${n}"><img src="${PL("c", n)}" alt=""></button>`).join("")}</div>
      <div class="cg-trow">${cont ? "" : `<button type="button" class="cg-x" data-t="back">${t.back}</button>`}<button type="button" class="button button-gold" data-t="go">${t.play}</button></div>`, cont ? 0 : 4);
    T0.el.querySelectorAll(".cg-charpick").forEach((b) => b.addEventListener("click", () => {
      cur = +b.dataset.k; T0.el.querySelectorAll(".cg-charpick").forEach((x) => x.classList.toggle("active", x === b));
    }));
    const bk = T0.el.querySelector("[data-t=back]"); if (bk) bk.addEventListener("click", stepName);
    T0.el.querySelector("[data-t=go]").addEventListener("click", () => {
      if (cont) { S.char = cur; S.charSet = 1; save(); closeTitle(true); openGame(); return; }
      setup.char = cur; S = fresh(); save(); closeTitle(true); setTimeout(openGame, 250);
    });
  }
  function stepName() {
    const t = L();
    titleFrame(`<h3 class="cg-th">${t.pickName}</h3>
      <input id="cg-name" class="cg-input cg-tinput" maxlength="18" placeholder="${esc(t.namePh)}" value="${esc(setup.name)}" autocomplete="off">
      <label class="cg-check"><input type="checkbox" id="cg-adult"${setup.adult ? " checked" : ""}> ${t.adult}</label>
      <p class="cg-err hidden" id="cg-err"></p>
      <div class="cg-trow"><button type="button" class="cg-x" data-t="back">${t.back}</button><button type="button" class="button button-gold" data-t="go">${t.next || "Next →"}</button></div>`, 3);
    const nameEl = $("cg-name");
    T0.el.querySelector("[data-t=back]").addEventListener("click", () => { setup.name = nameEl.value; stepLook(); });
    const go = () => {
      setup.name = nameEl.value.trim(); setup.adult = !!$("cg-adult").checked;
      const err = $("cg-err");
      if (!setup.name) { err.textContent = t.pickName; err.classList.remove("hidden"); nameEl.focus(); return; }
      if (!setup.adult) { err.textContent = t.needAdult; err.classList.remove("hidden"); return; }
      nameEl.blur(); stepChar();
    };
    T0.el.querySelector("[data-t=go]").addEventListener("click", go);
    nameEl.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  }

  // ---------------- Map ----------------
  const map = [];
  function buildMap() {
    for (let y = 0; y < MH; y++) { map[y] = []; for (let x = 0; x < MW; x++) map[y][x] = 0; }
    const fill = (x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (map[y] && map[y][x] !== undefined) map[y][x] = v; };
    const hRoads = [11, 21], vRoads = [9, 24, 37];
    hRoads.forEach((r) => fill(0, r - 1, MW - 1, r + 2, 2)); vRoads.forEach((c) => fill(c - 1, 0, c + 2, MH - 1, 2));
    hRoads.forEach((r) => fill(0, r, MW - 1, r + 1, 1)); vRoads.forEach((c) => fill(c, 0, c + 1, MH - 1, 1));
    fill(0, 27, MW - 1, 28, 2); vRoads.forEach((c) => fill(c, 27, c + 1, MH - 1, 1)); // south walkway (Fix 24)
    fill(27, 14, 35, 19, 4); fill(30, 16, 32, 17, 5);
    Object.values(VENUES).forEach((v) => { if (v.b) { const [x, y, w, h] = v.b; fill(x, y, x + w - 1, y + h - 1, 3); v.door = [x + w / 2, y + h + 0.55]; } });
    DECOR.forEach(([x, y, w, h]) => fill(x, y, x + w - 1, y + h - 1, 3));
  }
  const TREES = [[8, 2], [8, 6], [11, 16], [23, 5], [23, 16], [26, 14], [36, 14], [26, 19], [36, 19], [29, 14], [33, 19], [7, 15], [36, 6], [39, 9], [15, 9.2], [21, 9.2], [3, 19.2], [30, 9.2], [13, 19.2], [20, 19.2], [42, 19.2], [0, 9], [45, 1], [45, 15]];
  const LAMPS = [[11, 9], [17, 9], [22.5, 9], [11, 19], [17, 19], [26, 9], [36, 9], [39.5, 19], [6.5, 9], [7.5, 19], [36, 19], [26.5, 19], [41, 9.2]];
  const blocked = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y); if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true; const v = map[ty][tx]; return v === 3 || v === 5; };

  // ---------------- Game screen ----------------
  let G = null; // runtime: canvas, ctx, layers, input, raf
  const imgCache = {};
  function img(src) { if (!imgCache[src]) { const i = new Image(); i.src = src; imgCache[src] = i; } return imgCache[src]; }

  function openGame() {
    if (G) return;
    if (!map.length) buildMap();
    norm(); CHARS.forEach((n) => { img(PL("c", n)); img(PL("t", n)); img(PL("b", n)); });
    const t = L();
    const root = document.createElement("div");
    root.id = "cg-root";
    root.innerHTML = `
      <canvas id="cg-canvas"></canvas>
      <div class="cg-hud"><div class="cg-av" id="cg-av" data-a="ward"><span class="cg-lv" id="cg-lv"></span></div><div><div class="cg-nm" id="cg-nm"></div>
        <div class="cg-bar"><i id="cg-en"></i></div><div class="cg-bar cg-xpbar"><i id="cg-xp"></i></div><div class="cg-sub" id="cg-sub"></div></div></div>
      <div class="cg-clock" id="cg-clock"></div>
      <div class="cg-tr"><div class="cg-chip" id="cg-money"></div><button type="button" class="cg-chip" data-a="ward">👕</button><button type="button" class="cg-chip" data-a="bag">🎒</button><button type="button" class="cg-chip" data-a="menu">☰</button><button type="button" class="cg-chip" data-a="exit">✕</button></div>
      <div class="cg-mini"><canvas id="cg-mini" width="184" height="120"></canvas></div>
      <div class="cg-quest" id="cg-quest"></div>
      <div class="cg-hint hidden" id="cg-hint"></div>
      <div class="cg-joy" id="cg-joy"><div class="cg-ring"></div><div class="cg-knob" id="cg-knob"></div></div>
      <div class="cg-btns"><button type="button" class="cg-b cg-bA" id="cg-A">A<small>OK</small></button><button type="button" class="cg-b cg-bB" id="cg-B">B<small>Run</small></button></div>
      <div class="cg-toast hidden" id="cg-toast"></div>
      <div id="cg-layer"></div>`;
    document.body.appendChild(root);
    document.documentElement.classList.add("cg-open");
    G = { root, cv: $("cg-canvas"), held: new Set(), run: false, raf: 0, last: performance.now(), paused: false, near: null, face: 1, walk: 0, hudT: 0,
      cars: [{ x: 2, y: 11.2, v: 2.2, c: "#e05555" }, { x: 30, y: 21.2, v: 2.6, c: "#4aa3e0" }, { x: 40, y: 12.2, v: -2.0, c: "#f0c040" }, { x: 12, y: 22.2, v: -2.4, c: "#5fd08a" }] };
    try { tg?.disableVerticalSwipes?.(); } catch {}
    enterFs();
    try { screen.orientation?.lock?.("landscape").catch(() => {}); } catch {}
    G.back = () => closeOrBack(); try { tg?.BackButton?.onClick?.(G.back); tg?.BackButton?.show?.(); } catch {}
    // input
    // Swipe joystick: drag anywhere on the pad; works in portrait (rotated) too.
    const joy = $("cg-joy");
    const joyMove = (e) => {
      if (!G?.joyId || e.pointerId !== G.joyId.id) return;
      e.preventDefault();
      const sx = e.clientX - G.joyId.cx, sy = e.clientY - G.joyId.cy;
      let lx = G.portrait ? sy : sx, ly = G.portrait ? -sx : sy; // screen -> game coordinates
      const R = 46, len = Math.hypot(lx, ly);
      if (len > R) { lx = lx / len * R; ly = ly / len * R; }
      $("cg-knob").style.transform = `translate(${lx}px,${ly}px)`;
      const m = Math.min(1, len / R);
      G.joy = m < 0.18 ? null : { x: lx / R, y: ly / R, m };
    };
    const joyEnd = (e) => { if (!G?.joyId || e.pointerId !== G.joyId.id) return; resetJoy(); };
    joy.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const r = joy.getBoundingClientRect();
      G.joyId = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      try { joy.setPointerCapture(e.pointerId); } catch {}
      joy.classList.add("on"); joyMove(e);
    });
    joy.addEventListener("pointermove", joyMove);
    joy.addEventListener("pointerup", joyEnd); joy.addEventListener("pointercancel", joyEnd);
    $("cg-A").addEventListener("pointerdown", (e) => { e.preventDefault(); pressA(); });
    $("cg-B").addEventListener("pointerdown", (e) => { e.preventDefault(); G.run = !G.run; $("cg-B").classList.toggle("on", G.run); });
    root.addEventListener("click", onClick);
    G.key = (e) => {
      const k = { ArrowUp: "u", KeyW: "u", ArrowDown: "d", KeyS: "d", ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r" }[e.code];
      if (k) { e.preventDefault(); e.type === "keydown" ? G.held.add(k) : G.held.delete(k); }
      if (e.type === "keydown" && (e.code === "Space" || e.code === "Enter")) { e.preventDefault(); pressA(); }
      if (e.type === "keydown" && (e.code === "ShiftLeft" || e.code === "ShiftRight")) G.run = !G.run;
    };
    addEventListener("keydown", G.key); addEventListener("keyup", G.key);
    G.resize = () => layout(); addEventListener("resize", G.resize);
    try { ["viewportChanged", "fullscreenChanged", "safeAreaChanged", "contentSafeAreaChanged"].forEach((ev) => tg?.onEvent?.(ev, G.resize)); } catch {}
    layout(); buildLayers(); paintHud(true);
    G.raf = requestAnimationFrame(loop);
    G.saveTimer = setInterval(save, 10000);
    // preload faces
    Object.values(NPCS).forEach((n) => img(n.img(n.faces ? "neutral" : "")));
  }
  function closeGame() {
    if (!G) return;
    save(); flushServer(); cancelAnimationFrame(G.raf); clearInterval(G.saveTimer);
    removeEventListener("keydown", G.key); removeEventListener("keyup", G.key); removeEventListener("resize", G.resize);
    try { ["viewportChanged", "fullscreenChanged", "safeAreaChanged", "contentSafeAreaChanged"].forEach((ev) => tg?.offEvent?.(ev, G.resize)); tg?.BackButton?.offClick?.(G.back); tg?.BackButton?.hide?.(); } catch {}
    try { screen.orientation?.unlock?.(); } catch {}
    G.root.remove(); document.documentElement.classList.remove("cg-open"); G = null; renderStart(); exitFsLater();
  }
  function closeOrBack() { if ($("cg-layer")?.firstChild) closePanel(); else closeGame(); }
  function layout() {
    const w = window.innerWidth, h = window.innerHeight, portrait = h > w;
    const W = portrait ? h : w, Hh = portrait ? w : h;
    const r = G.root.style; r.width = W + "px"; r.height = Hh + "px";
    r.transform = portrait ? `translateX(${w}px) rotate(90deg)` : "none";
    G.portrait = portrait;
    // Telegram fullscreen: keep buttons clear of the status bar and Telegram's own top buttons.
    const sa = tg?.safeAreaInset || {}, ca = tg?.contentSafeAreaInset || {};
    const sT = (sa.top || 0) + (ca.top || 0), sB = (sa.bottom || 0) + (ca.bottom || 0), sL = (sa.left || 0) + (ca.left || 0), sR = (sa.right || 0) + (ca.right || 0);
    const [gl, gt, gr, gb] = portrait ? [sT, sR, sB, sL] : [sL, sT, sR, sB];
    r.setProperty("--sl", gl + "px"); r.setProperty("--st", gt + "px"); r.setProperty("--sr", gr + "px"); r.setProperty("--sb", gb + "px");
    G.W = W; G.H = Hh; G.dpr = Math.min(2, window.devicePixelRatio || 1);
    G.cv.width = Math.round(W * G.dpr); G.cv.height = Math.round(Hh * G.dpr);
    G.cv.style.width = W + "px"; G.cv.style.height = Hh + "px";
  }

  // pre-rendered static layers (day map + night lights)
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
  function buildLayers() {
    const s = G.dpr, base = document.createElement("canvas"), lit = document.createElement("canvas");
    base.width = lit.width = MW * TS * s; base.height = lit.height = MH * TS * s;
    const c = base.getContext("2d"), l = lit.getContext("2d"); c.scale(s, s); l.scale(s, s);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const v = map[y][x], X = x * TS, Y = y * TS;
      if (v === 0 || v === 3) { c.fillStyle = (x + y) % 2 ? "#4f9a55" : "#55a35b"; c.fillRect(X, Y, TS, TS); if ((x * 7 + y * 3) % 5 === 0) { c.fillStyle = "#6cbf63"; c.fillRect(X + 8, Y + 10, 3, 3); c.fillRect(X + 20, Y + 22, 3, 3); } }
      else if (v === 1) { c.fillStyle = "#3a3f4b"; c.fillRect(X, Y, TS, TS); }
      else if (v === 2) { c.fillStyle = (x + y) % 2 ? "#c9c2b4" : "#d3ccbe"; c.fillRect(X, Y, TS, TS); c.strokeStyle = "rgba(0,0,0,.06)"; c.strokeRect(X + 0.5, Y + 0.5, TS - 1, TS - 1); }
      else if (v === 4) { c.fillStyle = (x + y) % 2 ? "#e2d6c0" : "#ebe0cb"; c.fillRect(X, Y, TS, TS); }
      else if (v === 5) { c.fillStyle = "#5fb7e0"; c.fillRect(X, Y, TS, TS); }
    }
    c.fillStyle = "#f2d36b";
    for (let x = 0; x < MW * TS; x += 28) [11.97, 21.97].forEach((r) => c.fillRect(x, r * TS, 16, 3));
    for (let y = 0; y < MH * TS; y += 28) [9.97, 24.97, 37.97].forEach((cc) => c.fillRect(cc * TS, y, 3, 16));
    c.fillStyle = "rgba(255,255,255,.85)";
    [[9, 13], [24, 13], [37, 13], [9, 20], [24, 20], [37, 20], [9, 10], [24, 10], [37, 10], [9, 23], [24, 23], [37, 23]].forEach(([cx, cy]) => { for (let i = 0; i < 4; i++) c.fillRect(cx * TS + i * 16 + 2, cy * TS + 6, 9, 20); });
    // fountain
    c.fillStyle = "#9aa3ad"; rr(c, 29.6 * TS, 15.6 * TS, 3.8 * TS, 2.8 * TS, 20); c.fill(); c.fillStyle = "#5fb7e0"; rr(c, 30 * TS, 16 * TS, 3 * TS, 2 * TS, 16); c.fill();
    c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(31.5 * TS, 17 * TS, 7, 0, 7); c.fill();
    // benches
    c.fillStyle = "#8a5a3a"; [[28, 18.6], [34, 18.6], [28, 14.4], [34, 14.4]].forEach(([x, y]) => c.fillRect(x * TS, y * TS, 40, 8));
    const building = ([x, y, w, h], roof, wall, sign, neon) => {
      const X = x * TS, Y = y * TS, BW = w * TS, BH = h * TS;
      c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(X + 6, Y + 8, BW, BH);
      c.fillStyle = wall; c.fillRect(X, Y + BH * 0.45, BW, BH * 0.55);
      c.fillStyle = roof; c.fillRect(X - 3, Y, BW + 6, BH * 0.5);
      c.fillStyle = "rgba(255,255,255,.16)"; for (let i = 0; i < BW + 6; i += 10) c.fillRect(X - 3 + i, Y, 4, BH * 0.5);
      c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(X - 3, Y + BH * 0.5 - 4, BW + 6, 4);
      for (let i = X + 10; i < X + BW - 14; i += 26) {
        c.fillStyle = neon ? "#3b3358" : "#9fc6e6"; c.fillRect(i, Y + BH * 0.58, 14, 12);
        l.fillStyle = neon || "#ffd27a"; l.globalAlpha = 0.55; l.fillRect(i, Y + BH * 0.58, 14, 12);
        l.globalAlpha = 0.12; l.beginPath(); l.arc(i + 7, Y + BH * 0.58 + 6, 14, 0, 7); l.fill(); l.globalAlpha = 1;
      }
      if (sign) {
        c.fillStyle = "#5a3b2b"; c.fillRect(X + BW / 2 - 9, Y + BH - 22, 18, 22); c.fillStyle = "#ffd37a"; c.fillRect(X + BW / 2 + 4, Y + BH - 12, 3, 3);
        c.font = "bold 11px system-ui, sans-serif"; const tw = c.measureText(sign).width + 14;
        c.fillStyle = "#1d1b2a"; rr(c, X + BW / 2 - tw / 2, Y + BH * 0.5 - 10, tw, 18, 6); c.fill();
        c.fillStyle = neon || "#ffcf6b"; c.textAlign = "center"; c.fillText(sign, X + BW / 2, Y + BH * 0.5 + 3);
        if (neon) { l.font = "bold 11px system-ui, sans-serif"; l.textAlign = "center"; l.shadowColor = neon; l.shadowBlur = 14; l.fillStyle = neon; l.fillText(sign, X + BW / 2, Y + BH * 0.5 + 3); l.shadowBlur = 0; }
        { const g = l.createRadialGradient(X + BW / 2, Y + BH, 2, X + BW / 2, Y + BH, 34); g.addColorStop(0, "rgba(255,200,110,.55)"); g.addColorStop(1, "rgba(255,200,110,0)"); l.fillStyle = g; l.beginPath(); l.arc(X + BW / 2, Y + BH, 34, 0, 7); l.fill(); }
      }
    };
    Object.values(VENUES).forEach((v) => { if (v.b) building(v.b, v.roof, v.wall, v.sign, v.neon); });
    DECOR.forEach((b) => building(b, "#6b6b8a", "#e6e6ef", "", ""));
    // cafe awning
    { const [x, y, w, h] = VENUES.cafe.b, X = x * TS, Y = y * TS, BW = w * TS, BH = h * TS; for (let i = 0; i < BW; i += 12) { c.fillStyle = (i / 12) % 2 ? "#fff" : "#e45b6b"; c.beginPath(); c.moveTo(X + i, Y + BH - 30); c.lineTo(X + i + 12, Y + BH - 30); c.lineTo(X + i + 6, Y + BH - 24); c.fill(); } }
    TREES.forEach(([x, y]) => { const X = x * TS + 16, Y = y * TS + 16; c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(X + 4, Y + 10, 15, 8, 0, 0, 7); c.fill(); c.fillStyle = "#6b4a2e"; c.fillRect(X - 3, Y, 6, 12); c.fillStyle = "#2f7d3c"; c.beginPath(); c.arc(X, Y - 4, 15, 0, 7); c.fill(); c.fillStyle = "#3f9b4c"; c.beginPath(); c.arc(X - 4, Y - 8, 9, 0, 7); c.fill(); });
    LAMPS.forEach(([x, y]) => {
      const X = x * TS + 16, Y = y * TS + 16; c.fillStyle = "#333"; c.fillRect(X - 2, Y - 14, 4, 20); c.fillStyle = "#e8e2c8"; c.beginPath(); c.arc(X, Y - 16, 5, 0, 7); c.fill();
      const g = l.createRadialGradient(X, Y - 14, 2, X, Y - 10, 70); g.addColorStop(0, "rgba(255,220,140,.75)"); g.addColorStop(1, "rgba(255,220,140,0)"); l.fillStyle = g; l.beginPath(); l.arc(X, Y - 10, 70, 0, 7); l.fill();
    });
    G.base = base; G.lit = lit;
    // minimap base
    const mini = document.createElement("canvas"); mini.width = 184; mini.height = Math.round(184 / MW * MH); const m = mini.getContext("2d"); const ms = 184 / MW;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { m.fillStyle = ["#4f9a55", "#3a3f4b", "#bdb6a8", "#a8708a", "#e2d6c0", "#5fb7e0"][map[y][x]]; m.fillRect(x * ms, y * ms, ms + 0.5, ms + 0.5); }
    G.miniBase = mini; G.ms = ms;
  }
  function nightFactor() { const m = S.min; if (m < H(17)) return 0; if (m < H(19, 30)) return (m - H(17)) / 150; return 1; }
  const isOpen = (v, m = S.min) => m >= v.open && m < v.close;
  const present = (id, m = S.min) => { const n = NPCS[id]; return m >= n.from && m < n.to && isOpen(VENUES[n.venue], m); };
  const peopleAt = (venue) => Object.keys(NPCS).filter((id) => NPCS[id].venue === venue && present(id));

  function loop(now) {
    if (!G) return;
    const dt = Math.min(0.05, (now - G.last) / 1000); G.last = now;
    if (!G.paused) update(dt);
    draw(now);
    G.hudT += dt; if (G.hudT > 0.25) { G.hudT = 0; paintHud(); }
    G.raf = requestAnimationFrame(loop);
  }
  function update(dt) {
    let dx = 0, dy = 0;
    let mag = 1;
    if (G.joy) { dx = G.joy.x; dy = G.joy.y; mag = Math.max(0.45, G.joy.m); }
    else { if (G.held.has("l")) dx -= 1; if (G.held.has("r")) dx += 1; if (G.held.has("u")) dy -= 1; if (G.held.has("d")) dy += 1; }
    if (dx || dy) { G.side = Math.abs(dx) > Math.abs(dy) * 0.8; if (!G.side) G.back = dy < 0; }
    if (dx || dy) {
      const len = Math.hypot(dx, dy), sp = (G.run ? 5.6 : 3.4) * mag * dt;
      const nx = S.x + (dx / len) * sp, ny = S.y + (dy / len) * sp, r = 0.28;
      const ok = (x, y) => !blocked(x - r, y) && !blocked(x + r, y) && !blocked(x - r, y - 0.2) && !blocked(x + r, y - 0.2);
      if (ok(nx, S.y)) S.x = nx; if (ok(S.x, ny)) S.y = ny;
      if (Math.abs(dx) > 0.2) G.face = Math.sign(dx); G.walk += dt * (G.run ? 14 : 9);
    } else G.walk = 0;
    for (const car of G.cars) { car.x += car.v * dt; if (car.x > MW + 2) car.x = -3; if (car.x < -3) car.x = MW + 2; }
    S.min += dt; // 1 game minute per real second
    if (S.min >= DAY_END) passOut();
    // nearest door
    let best = null, bd = 1.25;
    for (const [id, v] of Object.entries(VENUES)) { const d = Math.hypot(S.x - v.door[0], S.y - v.door[1]); if (d < bd) { bd = d; best = id; } }
    if (best !== G.near) { G.near = best; const h = $("cg-hint"); if (best) { h.textContent = fmt(L().enter, { p: VENUES[best].sign }); h.classList.remove("hidden"); } else h.classList.add("hidden"); }
  }
  function draw(now) {
    const c = G.cv.getContext("2d"), s = G.dpr, W = G.W, Hh = G.H;
    const camX = Math.max(0, Math.min(MW * TS - W, S.x * TS - W / 2)), camY = Math.max(0, Math.min(MH * TS - Hh, S.y * TS - Hh / 2));
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = "#1b2a1e"; c.fillRect(0, 0, G.cv.width, G.cv.height);
    c.drawImage(G.base, camX * s, camY * s, W * s, Hh * s, 0, 0, W * s, Hh * s);
    c.setTransform(s, 0, 0, s, -camX * s, -camY * s);
    // cars
    for (const car of G.cars) { const X = car.x * TS, Y = car.y * TS; c.fillStyle = "rgba(0,0,0,.3)"; rr(c, X + 3, Y + 4, 54, 26, 7); c.fill(); c.fillStyle = car.c; rr(c, X, Y, 54, 26, 7); c.fill(); c.fillStyle = "#bfe3ff"; const f = car.v > 0 ? 34 : 8; rr(c, X + f, Y + 4, 12, 18, 3); c.fill(); }
    // sprites sorted by y
    const list = [];
    for (const id of Object.keys(NPCS)) if (present(id)) { const d = VENUES[NPCS[id].venue].door; const off = { ray: 1.3, yuna: -1.3 }[id] ?? 1.2; list.push({ y: d[1] - 0.2, f: () => drawNpc(c, id, (d[0] + off) * TS, (d[1] - 0.15) * TS, now) }); }
    list.push({ y: S.y, f: () => drawPlayer(c, S.x * TS, S.y * TS) });
    list.sort((a, b) => a.y - b.y).forEach((o) => o.f());
    c.setTransform(1, 0, 0, 1, 0, 0);
    const n = nightFactor();
    if (n > 0) {
      c.fillStyle = `rgba(18,16,60,${0.5 * n})`; c.fillRect(0, 0, G.cv.width, G.cv.height);
      c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.85 * n;
      c.drawImage(G.lit, camX * s, camY * s, W * s, Hh * s, 0, 0, W * s, Hh * s);
      c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    } else if (S.min < H(9)) { c.fillStyle = "rgba(255,200,150,.08)"; c.fillRect(0, 0, G.cv.width, G.cv.height); }
    // minimap
    const m = $("cg-mini")?.getContext("2d");
    if (m && (!G.mt || now - G.mt > 200)) {
      G.mt = now; m.drawImage(G.miniBase, 0, 0);
      m.fillStyle = "#ff5c8a"; for (const id of Object.keys(NPCS)) if (present(id)) { const d = VENUES[NPCS[id].venue].door; m.beginPath(); m.arc(d[0] * G.ms, d[1] * G.ms, 3, 0, 7); m.fill(); }
      m.fillStyle = "#ffcf6b"; m.beginPath(); m.arc(S.x * G.ms, S.y * G.ms, 3.6, 0, 7); m.fill();
      m.strokeStyle = "rgba(255,255,255,.8)"; m.lineWidth = 1.5; m.strokeRect(camX / TS * G.ms, camY / TS * G.ms, W / TS * G.ms, Hh / TS * G.ms);
    }
  }
  function drawNpc(c, id, X, Y, now) {
    const n = NPCS[id], im = img(n.img(n.faces ? "neutral" : "")), h = 58, w = h * 520 / 768;
    c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.ellipse(X, Y + 2, 11, 4, 0, 0, 7); c.fill();
    if (im.complete && im.naturalWidth) c.drawImage(im, X - w / 2, Y - h + 4, w, h);
    const bob = Math.sin(now / 300) * 2;
    c.fillStyle = S.partner === id ? "#ff2f6d" : "#ff5c8a"; rr(c, X - 11, Y - h - 16 + bob, 22, 16, 8); c.fill();
    c.fillStyle = "#fff"; c.font = "bold 11px system-ui, sans-serif"; c.textAlign = "center"; c.fillText("♥", X, Y - h - 4 + bob);
    c.fillStyle = "rgba(10,12,20,.7)"; rr(c, X - 16, Y + 5, 32, 12, 6); c.fill(); c.fillStyle = "#fff"; c.font = "bold 9px system-ui, sans-serif"; c.fillText(n.name, X, Y + 14);
  }
  // Compose a character with recoloured top / bottom. Cached per combination.
  const PCACHE = {};
  const ready = (i) => i.complete && i.naturalWidth > 0;
  function paint(ctx, key) {
    const d = CLOTH[key]; if (!d) return "#fff"; if (!d.pat) return d.c;
    const p = document.createElement("canvas"); p.width = p.height = 24; const q = p.getContext("2d");
    q.fillStyle = d.c; q.fillRect(0, 0, 24, 24); q.fillStyle = d.c2;
    if (d.pat === "stripe") q.fillRect(0, 0, 24, 8);
    else if (d.pat === "plaid") { q.globalAlpha = 0.45; q.fillRect(0, 9, 24, 6); q.fillRect(9, 0, 6, 24); q.globalAlpha = 1; q.fillRect(0, 11, 24, 2); q.fillRect(11, 0, 2, 24); }
    else { q.beginPath(); q.moveTo(12, 17); q.bezierCurveTo(3, 11, 7, 3, 12, 8); q.bezierCurveTo(17, 3, 21, 11, 12, 17); q.fill(); }
    return ctx.createPattern(p, "repeat");
  }
  // side-view walk frames per character (s{n}_{j} sprite, st/sb masks); frame 0 = standing
  const SIDEN = { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 3 };
  const SIDECYC = { 3: [1, 0, 2, 0], 2: [1, 0] };
  function sprite(ch, wt, wb, fr) {
    const bk = fr === "k", id = fr == null || bk ? ch : ch + "_" + fr, pre = bk ? "k" : fr == null ? "" : "s";
    const key = pre + id + "|" + wt + "|" + wb; if (PCACHE[key]) return PCACHE[key];
    const base = img(PL(bk ? "k" : fr == null ? "c" : "s", id)); if (!ready(base)) return null;
    const parts = [["t", wt], ["b", wb]].filter(([, v]) => v && v !== "orig" && CLOTH[v]);
    const ims = parts.map(([g]) => img(PL(pre + g, id))); if (ims.some((i) => !ready(i))) return null;
    const cv = document.createElement("canvas"); cv.width = base.naturalWidth; cv.height = base.naturalHeight;
    const c = cv.getContext("2d"); c.drawImage(base, 0, 0);
    parts.forEach(([, v], j) => {
      const L2 = document.createElement("canvas"); L2.width = cv.width; L2.height = cv.height; const l = L2.getContext("2d");
      l.drawImage(ims[j], 0, 0); l.globalCompositeOperation = "multiply"; l.fillStyle = paint(l, v); l.fillRect(0, 0, L2.width, L2.height);
      l.globalCompositeOperation = "destination-in"; l.drawImage(ims[j], 0, 0); c.drawImage(L2, 0, 0);
    });
    return (PCACHE[key] = cv);
  }
  function swatch(key) {
    const d = CLOTH[key]; if (!d) return "background:linear-gradient(135deg,#ffcf6b,#ff7aa8)";
    if (d.pat === "stripe") return `background:repeating-linear-gradient(180deg,${d.c2} 0 4px,${d.c} 4px 11px)`;
    if (d.pat === "plaid") return `background:linear-gradient(90deg,transparent 40%,${d.c2}88 40% 60%,transparent 60%),linear-gradient(0deg,transparent 40%,${d.c2}88 40% 60%,transparent 60%),${d.c}`;
    if (d.pat === "heart") return `background:radial-gradient(circle at 30% 35%,${d.c2} 0 3px,transparent 3.5px),radial-gradient(circle at 70% 70%,${d.c2} 0 3px,transparent 3.5px),${d.c}`;
    return `background:${d.c}`;
  }
  // Wardrobe (home / menu) and Boutique (shop) share one panel.
  function renderStyle(mode) {
    const t = L(), shop = mode === "shop";
    G.wmode = mode; if (!G.wtab || (shop && G.wtab === "char")) G.wtab = shop ? "t" : "char";
    G.try = G.try || {};
    const tabs = (shop ? ["t", "b"] : ["char", "t", "b"]).map((k) => `<button type="button" class="story-chip${G.wtab === k ? " active" : ""}" data-a="wtab" data-k="${k}">${k === "char" ? t.chars : k === "t" ? t.tops : t.bottoms}</button>`).join("");
    let cells = "", buy = "";
    if (G.wtab === "char") {
      cells = charsFor(S.look).map((n) => `<button type="button" class="cg-wcell cg-wchar${S.char === n ? " active" : ""}" data-a="wchar" data-k="${n}"><img src="${PL("c", n)}" alt=""></button>`).join("");
    } else {
      const g = G.wtab, cur = S.wear[g], tried = shop ? G.try[g] : null;
      const list = shop ? SHOP[g] : [["orig", 0], ...SHOP[g].filter(([k]) => S.closet[g + ":" + k])];
      cells = list.map(([k, p]) => {
        const owned = k === "orig" || !!S.closet[g + ":" + k], on = cur === k, sel = tried === k;
        const tag = on ? t.wearing : owned ? t.own : "$" + p;
        return `<button type="button" class="cg-wcell${on ? " active" : ""}${sel ? " sel" : ""}" data-a="wpick" data-k="${g}:${k}"><i class="cg-sw" style="${swatch(k)}"></i><span>${esc(k === "orig" ? t.orig : t.cl[k])}</span><small>${tag}</small></button>`;
      }).join("");
      if (shop && tried && !S.closet[g + ":" + tried]) { const p = SHOP[g].find(([k]) => k === tried)[1]; buy = `<button type="button" class="button button-gold cg-wbuy" data-a="cbuy" data-k="${g}:${tried}">${fmt(t.buyWear, { p: "$" + p })}</button>`; }
      else if (shop) buy = `<p class="cg-small">${t.tryHint}</p>`;
    }
    const title = shop ? "🛍️ BOUTIQUE" : t.ward;
    const sub = shop ? fmt(t.hours, { a: clock(VENUES.boutique.open), b: clock(VENUES.boutique.close) }) + ` · 💰 $${S.money}` : `💰 $${S.money}`;
    openPanel(`<div class="cg-ph"><div><h3>${title}</h3><small>${sub}</small></div><button type="button" class="cg-x" data-a="wclose">${t.close}</button></div>
      <div class="cg-ward"><div class="cg-wprev"><canvas id="cg-wcv" width="240" height="360"></canvas></div>
      <div class="cg-wright"><div class="cg-wtabs">${tabs}</div><div class="cg-wgrid${G.wtab === "char" ? " cg-wgrid3" : ""}">${cells}</div>${buy}</div></div>`, shop ? VENUES.boutique.bg : "story-assets/bg_room.webp");
    if (shop) G.venue = "boutique";
    drawPrev();
  }
  function drawPrev(tries = 0) {
    const cv = $("cg-wcv"); if (!cv || !G) return;
    const tr = G.wmode === "shop" ? G.try : {};
    const sp = sprite(S.char, tr.t || S.wear.t, tr.b || S.wear.b);
    if (!sp) { if (tries < 30) setTimeout(() => drawPrev(tries + 1), 150); return; }
    const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height);
    const h = cv.height * 0.96, w = h * sp.width / sp.height; c.imageSmoothingQuality = "high";
    c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(cv.width / 2, cv.height - 10, 60, 10, 0, 0, 7); c.fill();
    c.drawImage(sp, (cv.width - w) / 2, cv.height - h - 6, w, h);
  }
  function drawPlayer(c, X, Y) {
    if (G.side && SIDEN[S.char]) {
      const cyc = SIDECYC[SIDEN[S.char]], mv = G.walk > 0;
      const fr = mv ? cyc[Math.floor(G.walk / 1.4) % cyc.length] : 0;
      const ss = sprite(S.char, S.wear.t, S.wear.b, fr);
      if (ss) {
        const h = 62, w = h * ss.width / ss.height, bob = mv && fr === 0 ? 1.5 : 0;
        c.fillStyle = "rgba(0,0,0,.32)"; c.beginPath(); c.ellipse(X, Y + 2, fr ? 14 : 11, 4.5, 0, 0, 7); c.fill();
        c.save(); c.translate(X, Y + 3 - bob); c.scale(G.face < 0 ? -1 : 1, 1); c.imageSmoothingQuality = "high"; c.drawImage(ss, -w / 2, -h, w, h); c.restore();
        c.fillStyle = "rgba(10,12,20,.7)"; c.font = "bold 10px system-ui, sans-serif"; const tw3 = Math.max(28, c.measureText(S.name).width + 10);
        rr(c, X - tw3 / 2, Y + 5, tw3, 13, 6); c.fill(); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(S.name, X, Y + 15);
        return;
      }
    }
    // walking up the screen = back view (falls back to the front sprite until it loads)
    const sp = (G.back && sprite(S.char, S.wear.t, S.wear.b, "k")) || sprite(S.char, S.wear.t, S.wear.b);
    if (sp) {
      const h = 62, w = h * sp.width / sp.height, mv = G.walk > 0, k = h / sp.height;
      const SW = sp.width, SH = sp.height, cut = Math.round(SH * (LEGCUT[S.char] || 0.67)), lh = SH - cut;
      const ph = G.walk, sn = mv ? Math.sin(ph) : 0, amp = G.run ? 0.36 : 0.28;
      const liftL = Math.max(0, sn), liftR = Math.max(0, -sn);
      // shadow squashes as the feet move
      c.fillStyle = "rgba(0,0,0,.32)"; c.beginPath(); c.ellipse(X, Y + 2, 12 - Math.abs(sn) * 1.5, 4.5, 0, 0, 7); c.fill();
      c.save(); c.translate(X, Y + 3); c.scale(G.face < 0 ? -1 : 1, 1); c.imageSmoothingQuality = "high";
      const hipY = -h + cut * k, sway = mv ? Math.sin(ph) * 0.045 : 0, bob = mv ? Math.abs(Math.cos(ph)) * 1.6 : 0;
      // legs: the lifted leg gets shorter (knee bends) and swings slightly forward
      const leg = (sx, dx, lift) => { const dh = lh * k * (1 - amp * lift); c.drawImage(sp, sx, cut, SW / 2, lh, dx + lift * (sx ? 1.4 : -1.4), hipY - bob * 0.3, w / 2, dh + bob * 0.3); };
      leg(0, -w / 2, liftL); leg(SW / 2, 0, liftR);
      // upper body: small bob + sway around the hips
      c.save(); c.translate(0, hipY); c.rotate(sway); c.drawImage(sp, 0, 0, SW, cut + 3, -w / 2, -cut * k - bob, w, (cut + 3) * k); c.restore();
      c.restore();
      c.fillStyle = "rgba(10,12,20,.7)"; c.font = "bold 10px system-ui, sans-serif"; const tw2 = Math.max(28, c.measureText(S.name).width + 10);
      rr(c, X - tw2 / 2, Y + 5, tw2, 13, 6); c.fill(); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(S.name, X, Y + 15);
      return;
    }
    const step = G.walk ? Math.sin(G.walk) * 3 : 0, girl = S.look === "girl";
    c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(X, Y + 2, 10, 4, 0, 0, 7); c.fill();
    c.fillStyle = "#2b2f45"; c.fillRect(X - 7, Y - 10 + Math.max(0, step), 6, 11); c.fillRect(X + 1, Y - 10 + Math.max(0, -step), 6, 11);
    c.fillStyle = girl ? "#ff8fb1" : "#ffcf6b"; rr(c, X - 10, Y - 26, 20, 18, 6); c.fill();
    if (girl) { c.fillStyle = "#ff8fb1"; c.beginPath(); c.moveTo(X - 11, Y - 12); c.lineTo(X + 11, Y - 12); c.lineTo(X + 13, Y - 4); c.lineTo(X - 13, Y - 4); c.fill(); }
    c.fillStyle = "#f5d0b5"; c.beginPath(); c.arc(X, Y - 33, 10, 0, 7); c.fill();
    c.fillStyle = "#3a2a20"; c.beginPath(); c.arc(X, Y - 36, 10.5, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    if (girl) { c.fillRect(X - 11, Y - 37, 4, 16); c.fillRect(X + 7, Y - 37, 4, 16); }
    c.fillStyle = "#222"; c.fillRect(X - 4 + G.face, Y - 33, 2, 3); c.fillRect(X + 2 + G.face, Y - 33, 2, 3);
    c.fillStyle = "rgba(10,12,20,.7)"; c.font = "bold 10px system-ui, sans-serif"; const tw = Math.max(28, c.measureText(S.name).width + 10);
    rr(c, X - tw / 2, Y + 5, tw, 13, 6); c.fill(); c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(S.name, X, Y + 15);
  }
  const clock = (m) => { m = Math.floor(m) % (24 * 60); const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
  function paintHud(force) {
    if (!G) return; const t = L();
    $("cg-nm").textContent = `${S.name}${vip ? " 👑" : ""}`;
    $("cg-en").style.width = Math.max(0, S.energy) + "%";
    const lv = S.lv || 1; $("cg-lv").textContent = "Lv " + lv;
    const av = $("cg-av"); if (av && av.dataset.c !== String(S.char)) { av.dataset.c = S.char; av.style.backgroundImage = `url('${PL("c", S.char)}')`; }
    $("cg-xp").style.width = Math.min(100, ((S.xp || 0) / needXP(lv)) * 100) + "%";
    const best = Object.entries(S.love).sort((a, b) => b[1] - a[1])[0];
    $("cg-sub").textContent = S.partner ? `💞 ${NPCS[S.partner].name}` : best[1] > 0 ? `♥ ${NPCS[best[0]].name} ${best[1]}%` : `⚡ ${t.energy} ${Math.round(S.energy)}%`;
    $("cg-clock").innerHTML = `${fmt(t.day, { d: S.day })} · <b>${clock(S.min)}</b>`;
    $("cg-money").textContent = `💰 $${S.money}`;
    const next = MISSIONS.find(([id]) => !S.done[id]);
    $("cg-quest").innerHTML = next ? `<b>MISSION</b><br>${esc(t.m[next[0]])} <span>+$${next[1]}</span>` : `<b>💞</b> ${esc(t.allDone)}`;
  }
  let toastT = 0;
  function toast(msg) { const el = $("cg-toast"); if (!el) return; el.textContent = msg; el.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), 2600); }

  // ---------------- Time / missions ----------------
  function spend(min, energy = 0) { S.min = Math.min(S.min + min, DAY_END - 1); S.energy = Math.max(0, S.energy - energy); }
  function newDay(msg) {
    S.day += 1; S.min = DAY_START; S.x = VENUES.home.door[0]; S.y = VENUES.home.door[1];
    if (vip) S.money += 50;
    save(); toast(msg + (vip ? "  " + L().vipBonus : ""));
  }
  function passOut() { closePanel(true); S.energy = 70; newDay(L().passout); }
  function checkMissions() {
    for (const [id, r, ok] of MISSIONS) if (!S.done[id] && ok(S)) { S.done[id] = 1; S.money += r; addXP(20); setTimeout(() => toast(`🏆 ${fmt(L().missionDone, { r })} · ${L().m[id]}`), 300); }
    save(); paintHud();
  }

  // ---------------- Panels ----------------
  function openPanel(html, bg, cls = "") {
    G.paused = true; G.held.clear(); resetJoy();
    $("cg-layer").innerHTML = `<div class="cg-panel ${cls}"><div class="cg-pbg" style="background-image:url('${bg}')"></div><div class="cg-pbox">${html}</div></div>`;
  }
  function closePanel(silent) { const l = $("cg-layer"); if (l) l.innerHTML = ""; if (G) { G.paused = false; G.last = performance.now(); if (G.job) { clearInterval(G.job.timer); G.job = null; } if (G.dance) { cancelAnimationFrame(G.dance.raf); G.dance = null; } } if (!silent) paintHud(); }
  function pressA() {
    if (!G) return;
    if (G.paused) { const p = $("cg-layer").querySelector("[data-a=dance-tap]"); if (p) danceTap(); return; }
    if (G.near) enterVenue(G.near);
  }
  function enterVenue(id) {
    const v = VENUES[id], t = L();
    if (!isOpen(v)) return toast(fmt(t.closed, { p: v.sign, t: clock(v.open) }));
    if (id === "club" && S.clubDay !== S.day) {
      if (!vip) { if (S.money < 20) return toast(`${t.noMoney} (${fmt(t.entry, { p: 20 })})`); S.money -= 20; toast(fmt(t.entry, { p: 20 })); } else toast(t.entryVip);
      S.clubDay = S.day; S.st.club += 1; checkMissions();
    }
    if (id === "boutique") { G.try = {}; return renderStyle("shop"); }
    renderVenue(id);
  }
  function renderVenue(id) {
    const v = VENUES[id], t = L();
    const hours = v.close > 9999 ? t.always : fmt(t.hours, { a: clock(v.open), b: clock(v.close) });
    let acts = "";
    (v.shop || []).forEach((k) => { const it = ITEMS[k]; acts += `<button type="button" class="cg-act" data-a="buy" data-k="${k}"><span>${it.e} ${esc(t.items[k])}</span><b>$${it.p}</b><small>${fmt(t.owned, { q: S.inv[k] || 0 })}</small></button>`; });
    if (id === "bakery") acts += `<button type="button" class="cg-act cg-hl" data-a="job" data-k="bakery"><span>${t.work}</span><small>${fmt(t.shiftHours, { a: clock(JOBS.bakery.from), b: clock(JOBS.bakery.to) })}</small></button>`;
    if (id === "bar") acts += `<button type="button" class="cg-act cg-hl" data-a="job" data-k="bar"><span>${t.barwork}</span><small>${fmt(t.shiftHours, { a: clock(JOBS.bar.from), b: clock(JOBS.bar.to) })}</small></button>`;
    if (id === "club") acts += `<button type="button" class="cg-act cg-hl" data-a="dance"><span>${t.dance}</span><small>⚡ -15</small></button>`;
    if (id === "cafe") acts += `<button type="button" class="cg-act" data-a="coffee"><span>${t.coffee}</span><b>$6</b><small>⚡ +15</small></button>`;
    if (id === "park") acts += `<button type="button" class="cg-act cg-hl" data-a="rest"><span>${t.rest}</span><small>⚡ +20 · 1h</small></button>`;
    if (id === "cinema") acts += `<button type="button" class="cg-act cg-hl" data-a="movie"><span>${t.movie}</span><b>$15</b><small>⚡ +10 · 2h</small></button>`;
    if (id === "home") acts += `<button type="button" class="cg-act cg-hl" data-a="sleep"><span>${t.sleep}</span><small>⚡ 100%</small></button><button type="button" class="cg-act" data-a="ward"><span>${t.ward}</span><small>${t.chars} · ${t.tops}</small></button>`;
    const ppl = id === "home" ? Object.keys(NPCS).filter((k) => S.met[k]) : peopleAt(id);
    const cards = ppl.map((k) => personCard(k)).join("") || `<p class="cg-none">${t.nobody}</p>`;
    openPanel(`<div class="cg-ph"><div><h3>${esc(v.sign)}</h3><small>${hours}</small></div><button type="button" class="cg-x" data-a="close">${t.close}</button></div>
      <div class="cg-cols"><div class="cg-acts">${acts}</div><div class="cg-people"><h4>${id === "home" ? t.everyone : t.people}</h4>${cards}</div></div>`, v.bg);
    G.venue = id;
  }
  function personCard(k) {
    const n = NPCS[k], t = L();
    return `<button type="button" class="cg-person" data-a="npc" data-k="${k}"><img src="${n.img(n.faces ? "smile" : "")}" alt=""><div><b>${n.name}${S.partner === k ? " 💞" : ""}</b><small>${esc(t.roles[k])}</small><div class="cg-heart"><i style="width:${S.love[k]}%"></i></div><small>♥ ${S.love[k]}%</small></div></button>`;
  }
  const tier = (k) => (S.love[k] >= 70 ? 2 : S.love[k] >= 30 ? 1 : 0);
  const faceFor = (k, mood) => { const n = NPCS[k]; if (!n.faces) return n.img(""); return n.img(mood || (S.love[k] >= 70 ? "shy" : S.love[k] >= 30 ? "smile" : "neutral")); };
  function renderNpc(k, line, mood) {
    const n = NPCS[k], t = L();
    S.met[k] = 1; checkMissions();
    const txt = line || t.lines[k][tier(k)][0];
    const fromHome = G.venue === "home";
    const btns = fromHome ? "" : `<button type="button" class="cg-act" data-a="talk" data-k="${k}"><span>${t.talk}</span><small>❤ +3</small></button>
      <button type="button" class="cg-act" data-a="giftlist" data-k="${k}"><span>${t.gift}</span></button>
      <button type="button" class="cg-act" data-a="datelist" data-k="${k}"><span>${t.date}</span><small>❤ 40+</small></button>
      ${S.love[k] >= 100 && !S.partner ? `<button type="button" class="cg-act cg-hl" data-a="confess" data-k="${k}"><span>${t.confess}</span></button>` : ""}`;
    openPanel(`<div class="cg-npc"><img class="cg-sprite" src="${faceFor(k, mood)}" alt="">
      <div class="cg-npcbox"><div class="cg-ph"><div><h3>${n.name}${S.partner === k ? " · " + t.partner : ""}</h3><small>${esc(t.roles[k])} · ♥ ${S.love[k]}%</small></div><button type="button" class="cg-x" data-a="vback">${t.back}</button></div>
      <div class="cg-heart big"><i style="width:${S.love[k]}%"></i></div>
      <p class="cg-say">“${esc(txt)}”</p><div class="cg-acts">${btns}</div></div></div>`, VENUES[G.venue].bg);
  }
  function addLove(k, v) { S.love[k] = Math.min(100, S.love[k] + v); }
  function onClick(e) {
    const el = e.target.closest("[data-a]"); if (!el || !G) return;
    const a = el.dataset.a, k = el.dataset.k, t = L();
    if (a === "close") return closePanel();
    if (a === "ward") { G.wtab = "char"; G.wfrom = G.venue === "home" && $("cg-layer").querySelector(".cg-acts") ? "home" : ""; return renderStyle("home"); }
    if (a === "wclose") { G.try = {}; const from = G.wfrom; G.wfrom = ""; return from === "home" ? renderVenue("home") : closePanel(); }
    if (a === "wtab") { G.wtab = k; return renderStyle(G.wmode); }
    if (a === "wchar") { if (!charsFor(S.look).includes(+k)) return; S.char = +k; S.charSet = 1; save(); paintHud(); return renderStyle(G.wmode); }
    if (a === "wpick") {
      const [g, v] = k.split(":");
      if (v === "orig" || S.closet[k]) { S.wear[g] = v; if (G.try) delete G.try[g]; save(); return renderStyle(G.wmode); }
      G.try[g] = v; return renderStyle(G.wmode);
    }
    if (a === "cbuy") {
      const [g, v] = k.split(":"), item = SHOP[g].find(([x]) => x === v); if (!item || S.closet[k]) return;
      if (S.money < item[1]) return toast(t.noMoney);
      S.money -= item[1]; S.closet[k] = 1; S.wear[g] = v; delete G.try[g]; S.st.clothes = (S.st.clothes || 0) + 1;
      addXP(8); checkMissions(); toast(fmt(t.bought, { n: (g === "t" ? "👕 " : "👖 ") + t.cl[v] })); return renderStyle("shop");
    }
    if (a === "exit") return closeGame();
    if (a === "vback") return renderVenue(G.venue);
    if (a === "bag") return renderBag();
    if (a === "lang") { S.lang = k; setup.lang = k; save(); paintHud(); return renderMenu(); }
    if (a === "menu") return renderMenu();
    if (a === "buy") { const it = ITEMS[k]; if (S.money < it.p) return toast(t.noMoney); S.money -= it.p; S.inv[k] = (S.inv[k] || 0) + 1; save(); toast(`${it.e} ${t.items[k]} -$${it.p}`); return renderVenue(G.venue); }
    if (a === "npc") return renderNpc(k);
    if (a === "talk") {
      if (S.talk[k] === S.day) return toast(t.talked);
      S.talk[k] = S.day; addLove(k, 3); spend(15); addXP(10); checkMissions();
      return renderNpc(k, t.lines[k][tier(k)][1], "smile");
    }
    if (a === "giftlist") {
      if (S.gave[k] === S.day) return toast(t.gifted);
      const own = Object.keys(ITEMS).filter((i) => S.inv[i] > 0);
      if (!own.length) return toast(t.noItems);
      const box = $("cg-layer").querySelector(".cg-npcbox .cg-acts");
      box.innerHTML = own.map((i) => `<button type="button" class="cg-act" data-a="give" data-k="${k}" data-i="${i}"><span>${ITEMS[i].e} ${esc(t.items[i])}</span><small>x${S.inv[i]}</small></button>`).join("");
      return;
    }
    if (a === "give") {
      const i = el.dataset.i, n = NPCS[k], p = ITEMS[i].p;
      const base = p <= 20 ? 4 : p <= 60 ? 7 : 12;
      const loved = n.loves.includes(i), liked = n.likes.includes(i);
      const v = Math.round(base * (loved ? 2 : liked ? 1.3 : 0.5));
      S.inv[i] -= 1; S.gave[k] = S.day; S.st.gifts += 1; addLove(k, v); spend(10); addXP(8); checkMissions();
      toast(`${ITEMS[i].e} → ${n.name}  ❤ +${v}`);
      return renderNpc(k, loved ? t.loved : liked ? t.liked : t.meh, loved ? "surprised" : liked ? "smile" : "neutral");
    }
    if (a === "datelist") {
      if (S.love[k] < 40) return toast(t.dateNeed);
      if (S.dated[k] === S.day) return toast(t.dateDone);
      const box = $("cg-layer").querySelector(".cg-npcbox .cg-acts");
      box.innerHTML = `<p class="cg-small">${t.dateWhere}</p>` + Object.entries(DATES).map(([d, o]) => {
        const open = isOpen(VENUES[d]);
        return `<button type="button" class="cg-act${open ? "" : " off"}" data-a="dodate" data-k="${k}" data-d="${d}"><span>${VENUES[d].sign}</span><b>${o.cost ? "$" + o.cost : t.free}</b><small>${open ? "❤ +" + o.love : t.dateClosed}</small></button>`;
      }).join("");
      return;
    }
    if (a === "dodate") {
      const d = el.dataset.d, o = DATES[d];
      if (!isOpen(VENUES[d])) return toast(fmt(t.closed, { p: VENUES[d].sign, t: clock(VENUES[d].open) }));
      if (S.money < o.cost) return toast(t.noMoney);
      if (S.energy < 15) return toast(t.noEnergy);
      S.money -= o.cost; S.dated[k] = S.day; S.st.dates += 1; addLove(k, o.love); spend(120, 15); addXP(25); checkMissions();
      return scene(k, VENUES[d].bg, fmt(t.dates[d], { n: NPCS[k].name }) + `\n\n❤ +${o.love}`, "smile");
    }
    if (a === "confess") {
      S.partner = k; addXP(60); checkMissions();
      return scene(k, VENUES[G.venue].bg, fmt(t.confessText, { n: NPCS[k].name }) + `\n\n${fmt(t.couple, { n: NPCS[k].name })}`, "shy", true);
    }
    if (a === "scene-ok") return renderVenue(G.venue);
    if (a === "sleep") { if (S.min < H(20)) return toast(t.sleepEarly); S.energy = 100; closePanel(true); return newDay(fmt(t.slept, { d: S.day + 1 })); }
    if (a === "coffee") { if (S.money < 6) return toast(t.noMoney); S.money -= 6; S.energy = Math.min(100, S.energy + 15); spend(15); save(); toast("☕ ⚡ +15"); return renderVenue(G.venue); }
    if (a === "rest") { S.energy = Math.min(100, S.energy + 20); spend(60); save(); toast("🪑 ⚡ +20"); return renderVenue(G.venue); }
    if (a === "movie") { if (S.money < 15) return toast(t.noMoney); S.money -= 15; S.energy = Math.min(100, S.energy + 10); spend(120); save(); toast("🎬 ⚡ +10"); return renderVenue(G.venue); }
    if (a === "job") return startJob(k);
    if (a === "job-go") return runJob();
    if (a === "dance") { if (S.energy < 15) return toast(t.noEnergy); return startDance(); }
    if (a === "dance-tap") return danceTap();
  }
  function scene(k, bg, text, mood, fade) {
    const t = L();
    openPanel(`<div class="cg-scene${fade ? " cg-fade" : ""}"><img class="cg-sprite" src="${faceFor(k, mood)}" alt=""><div class="cg-scenebox"><b>${NPCS[k].name}</b><p>${esc(text).replace(/\n/g, "<br>")}</p><button type="button" class="button button-gold" data-a="scene-ok">${t.ok}</button></div></div>`, bg);
  }
  function renderBag() {
    const t = L(); const own = Object.keys(ITEMS).filter((i) => S.inv[i] > 0);
    G.venue = G.venue || "home";
    openPanel(`<div class="cg-ph"><div><h3>🎒 ${t.bag}</h3><small>💰 $${S.money} · ⚡ ${Math.round(S.energy)}%</small></div><button type="button" class="cg-x" data-a="close">${t.close}</button></div>
      <div class="cg-grid">${own.map((i) => `<div class="cg-item">${ITEMS[i].e}<b>${esc(t.items[i])}</b><small>x${S.inv[i]}</small></div>`).join("") || `<p class="cg-none">${t.noItems}</p>`}</div>`, "story-assets/bg_room.webp", "cg-light");
  }
  function renderMenu() {
    const t = L();
    const rows = MISSIONS.map(([id, r]) => `<div class="cg-mis${S.done[id] ? " done" : ""}"><span>${S.done[id] ? "✅" : "⬜"} ${esc(t.m[id])}</span><b>+$${r}</b></div>`).join("");
    const love = Object.keys(NPCS).filter((k) => S.met[k]).map((k) => `<div class="cg-mis"><span>${NPCS[k].name}${S.partner === k ? " 💞" : ""}</span><b>♥ ${S.love[k]}%</b></div>`).join("");
    openPanel(`<div class="cg-ph"><div><h3>📜 ${t.missions}</h3><small>⭐ Lv ${S.lv || 1} (${S.xp || 0}/${needXP(S.lv || 1)} XP) · ${fmt(t.day, { d: S.day })} · 💰 $${S.money}</small></div><button type="button" class="cg-x" data-a="close">${t.close}</button></div>
      <div class="cg-cols"><div class="cg-list">${rows}</div><div class="cg-list">${love}<div class="cg-mlang">${LANGS.map(([k, l]) => `<button type="button" class="story-chip${S.lang === k ? " active" : ""}" data-a="lang" data-k="${k}">${l}</button>`).join("")}</div><button type="button" class="cg-act" data-a="ward"><span>${t.ward}</span></button><button type="button" class="cg-act" data-a="exit"><span>💾 ${t.exit}</span></button></div></div>`, "story-assets/bg_night.webp");
  }

  // ---------------- Job mini-game ----------------
  function startJob(kind) {
    const j = JOBS[kind], t = L();
    if (S.min < j.from || S.min > j.to) return toast(fmt(t.shiftHours, { a: clock(j.from), b: clock(j.to) }));
    if (S.energy < 25) return toast(t.noEnergy);
    G.job = { kind, left: 30, pay: 0, order: [], done: [], timer: 0, running: false };
    openPanel(`<div class="cg-ph"><div><h3>${t[j.title]}</h3><small>${t.shiftHelp}${vip ? " · " + t.vipx2 : ""}</small></div><button type="button" class="cg-x" data-a="vback">${t.back}</button></div>
      <div class="cg-job"><div class="cg-jstat"><span>⏱ ${t.time} <b id="cg-jt">30</b>s</span><span>💰 ${t.earned} <b id="cg-jp">$0</b></span></div>
      <div class="cg-order" id="cg-order"><button type="button" class="button button-gold" data-a="job-go">${t.start}</button></div>
      <div class="cg-pick" id="cg-pick">${j.items.map((e, i) => `<button type="button" class="cg-food" data-i="${i}">${e}</button>`).join("")}</div></div>`, VENUES[kind].bg);
    $("cg-pick").querySelectorAll(".cg-food").forEach((b) => b.addEventListener("pointerdown", (e) => { e.preventDefault(); pickFood(+b.dataset.i, b); }));
  }
  function newOrder() {
    const j = JOBS[G.job.kind], n = 1 + Math.floor(Math.random() * 3);
    G.job.order = Array.from({ length: n }, () => Math.floor(Math.random() * j.items.length)); G.job.done = G.job.order.map(() => false);
    paintOrder();
  }
  function paintOrder() {
    const j = JOBS[G.job.kind];
    $("cg-order").innerHTML = `<div class="cg-cust">🙂</div><div class="cg-bubble">${G.job.order.map((i, x) => `<span class="${G.job.done[x] ? "ok" : ""}">${j.items[i]}</span>`).join("")}</div>`;
  }
  function runJob() {
    if (!G.job || G.job.running) return;
    G.job.running = true; newOrder();
    G.job.timer = setInterval(() => {
      if (!G?.job) return; G.job.left -= 1; $("cg-jt").textContent = G.job.left;
      if (G.job.left <= 0) endJob();
    }, 1000);
  }
  function pickFood(i, btn) {
    const J = G?.job; if (!J || !J.running) return;
    const j = JOBS[J.kind], x = J.order.findIndex((o, n) => o === i && !J.done[n]);
    if (x < 0) { btn.classList.add("bad"); setTimeout(() => btn.classList.remove("bad"), 250); J.left = Math.max(0, J.left - 1); return; }
    J.done[x] = true; J.pay += j.per; btn.classList.add("good"); setTimeout(() => btn.classList.remove("good"), 200);
    if (J.done.every(Boolean)) { J.pay += j.bonus * J.order.length; newOrder(); } else paintOrder();
    $("cg-jp").textContent = "$" + J.pay * (vip ? 2 : 1);
  }
  function endJob() {
    const J = G.job, j = JOBS[J.kind], t = L(); clearInterval(J.timer); G.job = null;
    const pay = J.pay * (vip ? 2 : 1);
    S.money += pay; S.st.earned += pay; S.st[j.stat] += 1; spend(180, 25); addXP(30); checkMissions();
    $("cg-order").innerHTML = `<div class="cg-result">🎉 ${fmt(t.shiftEnd, { m: pay })}${vip ? " " + t.vipx2 : ""}<br><button type="button" class="button button-gold" data-a="vback">${t.ok}</button></div>`;
  }

  // ---------------- Dance mini-game ----------------
  function startDance() {
    const t = L();
    openPanel(`<div class="cg-ph"><div><h3>💃 NEON CLUB</h3><small>${t.danceHelp}</small></div><button type="button" class="cg-x" data-a="vback">${t.back}</button></div>
      <div class="cg-dance"><div class="cg-beats" id="cg-beats">○○○○○</div><div class="cg-track"><div class="cg-zone" id="cg-zone"></div><div class="cg-mark" id="cg-mark"></div></div>
      <div class="cg-dmsg" id="cg-dmsg"></div><button type="button" class="cg-dbtn" data-a="dance-tap">${t.danceBtn}</button></div>`, VENUES.club.bg);
    G.dance = { pos: 0, dir: 1, beat: 0, score: 0, marks: [], zone: 0.5, w: 0.2, raf: 0, last: performance.now(), wait: 0 };
    newZone(); const step = (now) => { const D = G?.dance; if (!D) return; const dt = (now - D.last) / 1000; D.last = now;
      if (D.wait > 0) D.wait -= dt; else { D.pos += D.dir * dt * (1.1 + D.beat * 0.15); if (D.pos > 1) { D.pos = 1; D.dir = -1; } if (D.pos < 0) { D.pos = 0; D.dir = 1; } }
      const m = $("cg-mark"); if (m) m.style.left = D.pos * 100 + "%"; D.raf = requestAnimationFrame(step); };
    G.dance.raf = requestAnimationFrame(step);
  }
  function newZone() { const D = G.dance; D.zone = 0.15 + Math.random() * 0.7; D.w = 0.22 - D.beat * 0.02; const z = $("cg-zone"); if (z) { z.style.left = (D.zone - D.w / 2) * 100 + "%"; z.style.width = D.w * 100 + "%"; } }
  function danceTap() {
    const D = G?.dance, t = L(); if (!D || D.wait > 0 || D.beat >= 5) return;
    const off = Math.abs(D.pos - D.zone);
    const r = off < D.w * 0.18 ? 1 : off < D.w / 2 ? 0.6 : 0;
    D.score += r; D.marks.push(r === 1 ? "★" : r ? "●" : "✕"); D.beat += 1;
    $("cg-dmsg").textContent = r === 1 ? t.perfect : r ? t.good : t.miss;
    $("cg-beats").textContent = D.marks.join("") + "○".repeat(5 - D.beat);
    D.wait = 0.35;
    if (D.beat < 5) return newZone();
    cancelAnimationFrame(D.raf);
    const s = Math.round(D.score); S.st.dances += 1; spend(60, 15);
    let msg = fmt(t.danceEnd, { s });
    for (const k of ["yuna", "ray"]) if (present(k) && s > 0) { const v = s * 2; addLove(k, v); msg += "<br>" + fmt(t.noticed, { n: NPCS[k].name, v }); }
    addXP(5 + s * 3); checkMissions(); G.dance = null;
    setTimeout(() => { const el = $("cg-layer").querySelector(".cg-dance"); if (el) el.innerHTML = `<div class="cg-result">🎶 ${msg}<br><button type="button" class="button button-gold" data-a="vback">${t.ok}</button></div>`; }, 400);
  }

  // ---------------- boot ----------------
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
