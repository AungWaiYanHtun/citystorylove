/*
  🏖️ Summer Love — story script (shared by all 3 routes).
  Tokens: {P} partner name · {me} player name · {he}/{He}/{his}/{His}/{him} partner pronouns (English only).
  w: "n" narration · "p" partner speaks · "m" player's thought.  ex: "s" smile, "h" shy, "" hide sprite.
  c: choices [text, love, reply?]. cg: "hug" | "kiss" | "night" (shown only when love >= need).
  Text: [English, Burmese]. Other languages use the English line.
*/
window.CSL_BEACH_STORY = [
  // ───────── Chapter 1 · Arrival ─────────
  { ch: 1, bg: "bg_hotel_lobby", title: ["Chapter 1 · Azure Bay", "အခန်း ၁ · Azure Bay ကမ်းခြေ"] },
  { w: "n", ex: "", t: ["Three days off. No emails, no alarms. Just the sea, the sun, and the Azure Bay Resort.", "ရုံးပိတ်ရက် သုံးရက်။ Email မရှိ၊ နှိုးစက်မရှိ။ ပင်လယ်၊ နေရောင်နဲ့ Azure Bay Resort ပဲရှိတယ်။"] },
  { w: "n", t: ["You step into the open-air lobby. The ocean breeze smells like salt and frangipani.", "လေဝင်လေထွက်ကောင်းတဲ့ ဟော်တယ် lobby ထဲ ဝင်လိုက်တယ်။ ပင်လယ်လေက ဆားနံ့နဲ့ စံပယ်ပန်းနံ့ သင်းနေတယ်။"] },
  { w: "n", t: ["You turn around too fast — and your welcome coconut drink splashes right onto someone's shirt.", "အမြန်လှည့်လိုက်တာ — ကြိုဆိုတဲ့ အုန်းရည်ခွက်က တစ်ယောက်ယောက်ရဲ့ အင်္ကျီပေါ် ဖိတ်စင်သွားတယ်။"] },
  { w: "p", ex: "h", t: ["Whoa! Well… that's one way to say hello.", "အိုး! ဒါလည်း… နှုတ်ဆက်တဲ့ နည်းတစ်မျိုးပေါ့နော်။"] },
  { w: "m", t: ["Of course it's the most good-looking person in the whole hotel.", "ဟော်တယ်တစ်ခုလုံးမှာ အချောဆုံးလူကိုမှ ဖိတ်မိတယ်။"] },
  { w: "p", ex: "s", t: ["I'm {P}. I'm staying here for the summer, taking photos for a travel magazine.", "နာမည် {P} ပါ။ ခရီးသွားမဂ္ဂဇင်းအတွက် ဓာတ်ပုံရိုက်ဖို့ ဒီမှာ နွေရာသီလုံး တည်းနေတာ။"],
    c: [["I'm so sorry! Let me buy you a new drink.", 8, ["Deal. But you're drinking one with me.", "ရတယ်။ ဒါပေမဲ့ တစ်ခွက် အတူသောက်ရမယ်နော်။"]],
        ["At least it matches your shirt now.", 5, ["Ha! Funny. I like you already.", "ဟား! ရယ်ရတယ်။ သဘောကျသွားပြီ။"]],
        ["Grab a towel and help wipe it off.", 6, ["Careful… you're making me blush.", "ဖြည်းဖြည်း… ရှက်လာပြီ။"]]],
    cm: [["တောင်းပန်ပါတယ်! အသစ်တစ်ခွက် ဝယ်ပေးမယ်။"], ["အခုတော့ အင်္ကျီနဲ့ အရောင်လိုက်သွားပြီ။"], ["မျက်နှာသုတ်ပဝါယူပြီး သုတ်ပေးမယ်။"]] },
  { w: "p", ex: "s", t: ["Tomorrow morning, the beach. I'll teach you to surf. Don't be late, {me}.", "မနက်ဖြန်မနက် ကမ်းခြေမှာ။ Surf စီးနည်း သင်ပေးမယ်။ နောက်မကျနဲ့နော် {me}။"] },
  { w: "n", ex: "", t: ["{He} walks away, and you realize you're smiling at nothing.", "သူ ထွက်သွားပြီးတော့ ဘာမှမရှိဘဲ ကိုယ့်ဘာသာ ပြုံးနေမိတာ သတိထားမိတယ်။"] },

  // ───────── Chapter 2 · Surf & sun ─────────
  { ch: 2, bg: "bg_beach_day", title: ["Chapter 2 · Sun, Sand & Surf", "အခန်း ၂ · နေရောင်၊ သဲပြင်နဲ့ လှိုင်း"] },
  { w: "n", t: ["The sand is warm and the water is impossibly blue. {P} is already waiting with two surfboards.", "သဲတွေ နွေးနေပြီး ရေက ပြာလဲ့နေတယ်။ {P} က surfboard နှစ်ချပ်နဲ့ စောင့်နေပြီ။"] },
  { w: "p", ex: "s", t: ["You came! I almost thought you'd chicken out.", "ရောက်လာပြီပဲ! ကြောက်လို့ မလာတော့ဘူးထင်နေတာ။"] },
  { w: "p", ex: "s", t: ["First rule: sunscreen. The sun here is no joke. Want me to help with your shoulders?", "ပထမစည်းကမ်း — နေလောင်ကာလိမ်းရမယ်။ ဒီကနေက မလွယ်ဘူး။ ပခုံးလေး လိမ်းပေးရမလား?"],
    c: [["Yes, please. Your hands are gentle.", 8, ["Hold still… there. Now you won't burn.", "ငြိမ်ငြိမ်နေ… ပြီးပြီ။ အခု နေမလောင်တော့ဘူး။"]],
        ["I can do it myself, thanks!", 2, ["Independent. Okay, okay.", "ကိုယ့်ဘာသာ လုပ်တတ်တာပေါ့။ ရပါတယ်။"]],
        ["Only if I can do yours too.", 10, ["…Deal. You're bold, you know that?", "…ရတယ်။ သိလား၊ တော်တော်ရဲတယ်နော်။"]]],
    cm: [["ဟုတ်၊ လိမ်းပေးပါ။ လက်လေးက နူးညံ့တယ်။"], ["ကိုယ့်ဘာသာ လိမ်းလိုက်မယ်၊ ကျေးဇူးပဲ!"], ["ငါလည်း ပြန်လိမ်းပေးခွင့်ရရင်ပေါ့။"]] },
  { w: "n", ex: "", t: ["The first wave knocks you flat. The second one too. On the third, you stand… for one glorious second.", "ပထမလှိုင်းက ပစ်လဲသွားတယ်။ ဒုတိယလှိုင်းလည်း ထပ်လဲ။ တတိယလှိုင်းမှာ မတ်တပ်ရပ်နိုင်သွားတယ်… တစ်စက္ကန့်လောက်။"] },
  { w: "n", t: ["You slip — and {P} catches you around the waist before you hit the water.", "ချော်သွားတယ် — ရေထဲမကျခင် {P} က ခါးကိုဖက်ပြီး ဖမ်းထားလိုက်တယ်။"] },
  { w: "p", ex: "h", t: ["Got you. …You can let go of my shirt now. Or not. Either is fine.", "ဖမ်းမိပြီ။ …အင်္ကျီကို လွှတ်လို့ရပြီနော်။ မလွှတ်လည်း ရပါတယ်။"],
    c: [["Stay close for a moment longer.", 10, ["…Okay. The waves can wait.", "…ရတယ်။ လှိုင်းတွေ ခဏစောင့်ပါစေ။"]],
        ["Laugh and splash water at {him}.", 6, ["Oh, it's war now!", "အိုး၊ အခုတော့ စစ်ပွဲစပြီ!"]],
        ["Thank {him} and swim back to shore.", 2, ["Wait for me!", "စောင့်ဦး!"]]],
    cm: [["ခဏလေး အနားမှာ ဆက်နေပါဦး။"], ["ရယ်ပြီး ရေပက်လိုက်မယ်။"], ["ကျေးဇူးတင်ပြီး ကမ်းဘက် ပြန်ကူးမယ်။"]] },
  { w: "p", ex: "s", t: ["Lunch is on me. There's a mango smoothie stand that changed my life.", "နေ့လယ်စာ ငါကျွေးမယ်။ သရက်သီး smoothie ဆိုင်လေးရှိတယ်၊ ဘဝပြောင်းသွားလောက်အောင် ကောင်းတယ်။"] },

  // ───────── Chapter 3 · The reef ─────────
  { ch: 3, bg: "bg_beach_day", title: ["Chapter 3 · Under the Waves", "အခန်း ၃ · လှိုင်းအောက်က ကမ္ဘာ"] },
  { w: "n", ex: "", t: ["In the afternoon, a little boat takes you both to the coral reef. Fish flash like jewels under the water.", "နေ့လယ်ခင်းမှာ လှေလေးတစ်စင်းနဲ့ သန္တာကျောက်တန်းဆီ သွားကြတယ်။ ရေအောက်မှာ ငါးလေးတွေ ကျောက်မျက်ရတနာလို တောက်ပနေတယ်။"] },
  { w: "p", ex: "s", t: ["Hold my hand when we dive. The current is strong, and I don't want to lose you.", "ရေငုပ်တဲ့အခါ လက်ကိုကိုင်ထားနော်။ ရေစီးသန်တယ်၊ မင်းကို မပျောက်စေချင်ဘူး။"] },
  { w: "n", ex: "", t: ["Something soft brushes your leg. A jellyfish! You panic and grab {P}.", "ခြေထောက်ကို တစ်ခုခု ထိသွားတယ်။ ရေဘဝဲ! ထိတ်လန့်ပြီး {P} ကို ဖက်လိုက်မိတယ်။"] },
  { w: "p", ex: "h", t: ["Hey, hey — it's okay. It's just a moon jelly, it doesn't sting. I've got you.", "ဟေး ဟေး — ရပါတယ်။ လရေဘဝဲလေးပါ၊ မကိုက်ပါဘူး။ ငါရှိတယ်။"],
    c: [["Don't let go of my hand.", 10, ["I won't. Not today.", "မလွှတ်ပါဘူး။ ဒီနေ့တော့ လုံးဝ။"]],
        ["Pretend you weren't scared at all.", 4, ["Sure. Your scream was very brave.", "ဟုတ်ပါပြီ။ အော်သံကတော့ သတ္တိရှိလိုက်တာ။"]],
        ["Point at the jellyfish and laugh together.", 7, ["Look, it's waving at you.", "ကြည့်၊ မင်းကို လက်ပြနေတယ်။"]]],
    cm: [["လက်ကို မလွှတ်နဲ့နော်။"], ["လုံးဝ မကြောက်ခဲ့သလို ဟန်ဆောင်မယ်။"], ["ရေဘဝဲကို လက်ညှိုးထိုးပြီး အတူရယ်မယ်။"]] },
  { w: "n", t: ["On the boat back, {he} shows you a photo {he} took underwater: you, laughing, surrounded by tiny blue fish.", "ပြန်လာတဲ့လှေပေါ်မှာ ရေအောက်က ရိုက်ထားတဲ့ ဓာတ်ပုံကို ပြတယ်။ ငါးပြာလေးတွေကြားမှာ ရယ်နေတဲ့ ကိုယ့်ပုံ။"] },
  { w: "p", ex: "h", t: ["Best photo I've taken all summer. Don't tell my editor.", "ဒီနွေမှာ ရိုက်ခဲ့သမျှထဲ အကောင်းဆုံးပုံပဲ။ editor ကို မပြောနဲ့နော်။"] },

  // ───────── Chapter 4 · Sunset pier ─────────
  { ch: 4, bg: "bg_beach_sunset", title: ["Chapter 4 · Golden Hour", "အခန်း ၄ · ရွှေရောင်နေဝင်ချိန်"] },
  { w: "n", ex: "", t: ["The sky turns pink, then gold. You walk barefoot along the water, the waves washing over your toes.", "ကောင်းကင်က ပန်းရောင်ကနေ ရွှေရောင်ပြောင်းသွားတယ်။ ခြေဗလာနဲ့ ရေစပ်တလျှောက် လမ်းလျှောက်တော့ လှိုင်းလေးတွေက ခြေချောင်းကို လာနမ်းတယ်။"] },
  { w: "p", ex: "s", t: ["Can I tell you something? I travel all the time. New places, new people. But I never want to stay anywhere.", "တစ်ခုပြောလို့ရမလား? ငါ ခရီးအမြဲသွားနေတယ်။ နေရာသစ်၊ လူသစ်။ ဒါပေမဲ့ ဘယ်နေရာမှာမှ ဆက်နေချင်တယ်လို့ မခံစားရဖူးဘူး။"] },
  { w: "p", ex: "h", t: ["…Until this week.", "…ဒီတစ်ပတ်အထိပေါ့။"],
    c: [["Then stay. Even just a little longer.", 10, ["You make it sound so easy.", "မင်းပြောတော့ လွယ်လိုက်တာ။"]],
        ["Me too. I didn't expect this.", 9, ["Neither did I.", "ငါလည်း မထင်ထားခဲ့ဘူး။"]],
        ["Tease {him}: 'Is that your best line?'", 4, ["Hey! I'm being serious.", "ဟေး! တကယ်ပြောနေတာ။"]]],
    cm: [["ဒါဆို နေခဲ့ပါ။ နည်းနည်းပိုကြာကြာလေး။"], ["ငါလည်း ဒီလိုဖြစ်လာမယ် မထင်ခဲ့ဘူး။"], ["စ'မယ်: 'ဒါက အကောင်းဆုံး စကားလား?'"]] },
  { w: "n", t: ["The sun touches the sea. {P} turns to face you, close enough that you can hear {his} heartbeat over the waves.", "နေက ပင်လယ်ပြင်ကို ထိလာပြီ။ {P} က ကိုယ့်ဘက်လှည့်လာတယ်။ လှိုင်းသံကြားကနေ နှလုံးခုန်သံကြားရလောက်အောင် နီးနေတယ်။"] },
  { w: "p", ex: "h", t: ["Can I… hug you?", "ဖက်လို့… ရမလား?"], need: 30,
    c: [["Pull {him} into a hug.", 10], ["Nod, and close your eyes.", 8], ["'Not yet.' Smile and take {his} hand instead.", 3]],
    cm: [["ဆွဲဖက်လိုက်မယ်။"], ["ခေါင်းညိတ်ပြီး မျက်လုံးမှိတ်မယ်။"], ["'မဖက်သေးဘူး' — ပြုံးပြီး လက်ကိုပဲ ကိုင်မယ်။"]], pick: [0, 1] },
  { cg: "hug", need: 30, t: ["The world goes quiet. Just the waves, the warm light, and {his} arms around you.", "ကမ္ဘာကြီး တိတ်ဆိတ်သွားတယ်။ လှိုင်းသံ၊ နွေးထွေးတဲ့ အလင်းရောင်နဲ့ ကိုယ့်ကိုဖက်ထားတဲ့ သူ့လက်တွေပဲ ရှိတယ်။"] },
  { w: "p", ex: "h", t: ["Tomorrow night… have dinner with me? A real date.", "မနက်ဖြန်ည… ညစာ အတူစားမလား? တကယ့် date တစ်ခုပေါ့။"] },

  // ───────── Chapter 5 · Dinner date ─────────
  { ch: 5, bg: "bg_beach_dinner", title: ["Chapter 5 · Candlelight Dinner", "အခန်း ၅ · ဖယောင်းတိုင်မီးအောက်က ညစာ"] },
  { w: "n", ex: "", t: ["The hotel set up a table on the terrace, just for two. Candles, rose petals, fairy lights swinging in the sea breeze.", "ဟော်တယ်က terrace ပေါ်မှာ နှစ်ယောက်တည်းအတွက် စားပွဲပြင်ထားတယ်။ ဖယောင်းတိုင်၊ နှင်းဆီပွင့်ဖတ်လေးတွေ၊ ပင်လယ်လေထဲ ယိမ်းနေတဲ့ မီးလုံးလေးတွေ။"] },
  { w: "p", ex: "s", t: ["You look… wow. I had a whole speech ready and I forgot all of it.", "မင်းကြည့်ရတာ… အမလေး။ ပြောဖို့ စကားတွေ ကြိုစဉ်းထားတာ အကုန်မေ့သွားပြီ။"],
    c: [["You look amazing too.", 8, ["Stop, I'll drop my fork.", "တော်ပါ၊ ခက်ရင်းလွတ်ကျတော့မယ်။"]],
        ["Forget the speech. Just talk to me.", 9, ["Okay. Just us, then.", "ရတယ်။ ဒါဆို ငါတို့နှစ်ယောက်တည်း စကားပြောကြမယ်။"]],
        ["Was it a good speech?", 5, ["It had a joke about coconuts.", "အုန်းသီးအကြောင်း ဟာသပါတယ်။"]]],
    cm: [["မင်းလည်း အရမ်းကြည့်ကောင်းတာပဲ။"], ["စကားတွေမေ့လိုက်ပါ။ ဒီတိုင်း ပြောပါ။"], ["အဲ့စကားတွေက ကောင်းလား?"]] },
  { w: "n", t: ["Grilled prawns, lime, chili, and a dessert of coconut ice cream you share with one spoon.", "ကင်ထားတဲ့ ပုစွန်၊ သံပုရာ၊ ငရုတ်သီး၊ ပြီးတော့ ဇွန်းတစ်ချောင်းတည်းနဲ့ ခွဲစားတဲ့ အုန်းရေခဲမုန့်။"] },
  { w: "p", ex: "h", t: ["I have to tell you the truth. My contract ends in three days. Then I fly to Iceland for the next shoot.", "အမှန်အတိုင်း ပြောရမယ်။ ငါ့စာချုပ် သုံးရက်နေရင် ပြီးမယ်။ ပြီးရင် နောက်ရိုက်ကွင်းအတွက် Iceland ကို ပျံရမယ်။"],
    c: [["Then let's make these three days count.", 10, ["…That's exactly what I hoped you'd say.", "…ငါ ကြားချင်နေတဲ့ စကားအတိုင်းပဲ။"]],
        ["Iceland has phones too, you know.", 8, ["Are you saying you'd call me?", "ဖုန်းဆက်မယ်လို့ ပြောနေတာလား?"]],
        ["Go quiet and look at the sea.", 2, ["Did I ruin the night?", "ညကို ဖျက်လိုက်မိပြီလား?"]]],
    cm: [["ဒါဆို ဒီသုံးရက်ကို တန်ဖိုးရှိအောင် ဖြတ်သန်းကြမယ်။"], ["Iceland မှာလည်း ဖုန်းရှိပါတယ်နော်။"], ["ဘာမှမပြောဘဲ ပင်လယ်ကို ငေးနေမယ်။"]] },
  { w: "p", ex: "s", t: ["Come to the pool party tomorrow night. There'll be fireworks. I want to see them with you.", "မနက်ဖြန်ည pool party လာခဲ့နော်။ မီးပန်းတွေရှိမယ်။ မင်းနဲ့ အတူကြည့်ချင်တယ်။"] },

  // ───────── Chapter 6 · Fireworks ─────────
  { ch: 6, bg: "bg_hotel_pool_night", title: ["Chapter 6 · Fireworks by the Pool", "အခန်း ၆ · ရေကူးကန်ဘေးက မီးပန်း"] },
  { w: "n", ex: "", t: ["Music, laughter, lanterns floating on the glowing pool. Everyone is dancing.", "သီချင်းသံ၊ ရယ်သံ၊ အလင်းတောက်နေတဲ့ ရေကူးကန်ပေါ်မှာ မီးအိမ်လေးတွေ မျောနေတယ်။ လူတိုင်း ကနေကြတယ်။"] },
  { w: "p", ex: "s", t: ["Dance with me? I'm terrible at it, so you can't judge.", "အတူကမလား? ငါ ကတာ ညံ့တယ်၊ ဒါကြောင့် မဝေဖန်ရဘူးနော်။"],
    c: [["Take {his} hands and lead.", 9, ["Okay, you're definitely better than me.", "ဟုတ်ပြီ၊ မင်းက ငါ့ထက် အများကြီးတော်တယ်။"]],
        ["Dance badly on purpose to make {him} laugh.", 7, ["Hahaha! Stop! People are looking!", "ဟားဟား! တော်ပြီ! လူတွေကြည့်နေပြီ!"]],
        ["Say you'd rather just watch.", 1, ["Oh… okay.", "အော်… ရပါတယ်။"]]],
    cm: [["လက်ကိုကိုင်ပြီး ဦးဆောင်ကမယ်။"], ["ရယ်ရအောင် တမင်ညံ့ညံ့ကမယ်။"], ["ကြည့်ရုံပဲ ကြည့်ချင်တယ်လို့ ပြောမယ်။"]] },
  { w: "n", t: ["At midnight the first firework bursts over the ocean. Gold, then pink, then a shower of silver.", "သန်းခေါင်ရောက်တော့ ပထမဆုံး မီးပန်းက ပင်လယ်ပြင်ပေါ် ပေါက်ကွဲသွားတယ်။ ရွှေရောင်၊ ပန်းရောင်၊ ပြီးတော့ ငွေရောင်မိုးရေစက်တွေ။"] },
  { w: "p", ex: "h", t: ["{me}… I've wanted to do this since you spilled that coconut on me.", "{me}… အုန်းရည်ဖိတ်ခံရကတည်းက ဒါကို လုပ်ချင်နေခဲ့တာ။"], need: 60,
    c: [["Close the distance and kiss {him}.", 10], ["Whisper: 'Then do it.'", 10], ["Turn away shyly: 'Not here…'", 2]],
    cm: [["နီးကပ်သွားပြီး နမ်းလိုက်မယ်။"], ["တိုးတိုးလေး: 'ဒါဆို လုပ်လေ'"], ["ရှက်ရှက်နဲ့ လှည့်မယ်: 'ဒီမှာ မဟုတ်ဘူး…'"]], pick: [0, 1] },
  { cg: "kiss", need: 60, t: ["Fireworks bloom above you. {His} hand on your cheek, soft and warm. Your first kiss tastes like summer.", "ခေါင်းပေါ်မှာ မီးပန်းတွေ ပွင့်နေတယ်။ ပါးပေါ်က သူ့လက်က နူးညံ့ နွေးထွေးတယ်။ ပထမဆုံးအနမ်းက နွေရာသီအရသာ ရှိတယ်။"] },
  { w: "p", ex: "h", t: ["…Wow. Okay. My heart is louder than the fireworks.", "…အမလေး။ ငါ့နှလုံးခုန်သံက မီးပန်းသံထက်တောင် ကျယ်နေတယ်။"] },

  // ───────── Chapter 7 · The last night ─────────
  { ch: 7, bg: "bg_hotel_balcony", title: ["Chapter 7 · Our Last Night", "အခန်း ၇ · နောက်ဆုံးည"] },
  { w: "n", ex: "", t: ["The last night. {P}'s suite has a balcony right over the sea. The moon draws a silver road across the water.", "နောက်ဆုံးည။ {P} ရဲ့ အခန်းမှာ ပင်လယ်ကို တည့်တည့်မျက်နှာမူထားတဲ့ ဝရန်တာရှိတယ်။ လရောင်က ရေပြင်ပေါ်မှာ ငွေရောင်လမ်းကြောင်း ဆွဲထားတယ်။"] },
  { w: "p", ex: "s", t: ["I don't want tonight to end. Stay with me? We can just talk until the sun comes up.", "ဒီည မကုန်စေချင်ဘူး။ ငါနဲ့ နေခဲ့ပါလား? နေထွက်တဲ့အထိ စကားပြောနေကြမယ်။"],
    c: [["Stay, and wrap a blanket around you both.", 10, ["This is perfect.", "ဒါ ပြီးပြည့်စုံနေပြီ။"]],
        ["Stay, but only for one more drink.", 5, ["I'll take it.", "ရပါတယ်၊ လက်ခံတယ်။"]],
        ["Say goodnight and go to your room.", -5, ["…Goodnight, {me}.", "…ကောင်းသောညပါ {me}။"]]],
    cm: [["နေခဲ့မယ်၊ စောင်လေးနဲ့ နှစ်ယောက်လုံး ခြုံထားမယ်။"], ["နေခဲ့မယ်၊ ဒါပေမဲ့ တစ်ခွက်ပဲနော်။"], ["ကောင်းသောညပြောပြီး ကိုယ့်အခန်း ပြန်မယ်။"]] },
  { w: "p", ex: "h", t: ["I talked to my editor today. Iceland can wait a week. I'm not ready to say goodbye to you.", "ဒီနေ့ editor နဲ့ ပြောပြီးပြီ။ Iceland က တစ်ပတ်စောင့်လို့ရတယ်။ မင်းကို နှုတ်ဆက်ဖို့ ငါ အဆင်သင့်မဖြစ်သေးဘူး။"], need: 60 },
  { cg: "night", need: 85, mature: true, t: ["{He} rests {his} head on your shoulder. The sea hums below. Somewhere between the stars and the waves, you both fall asleep in each other's arms…", "သူက ကိုယ့်ပခုံးပေါ် ခေါင်းမှီထားတယ်။ အောက်မှာ ပင်လယ်က တဖြည်းဖြည်း ညည်းနေတယ်။ ကြယ်တွေနဲ့ လှိုင်းတွေကြားမှာ တစ်ယောက်ကိုတစ်ယောက် ဖက်ရင်း အိပ်ပျော်သွားကြတယ်…"] },
  { end: true }
];

// Endings by love: [min, title, text]
window.CSL_BEACH_ENDINGS = [
  [85, ["💞 True Love Ending", "💞 စစ်မှန်တဲ့အချစ် Ending"], ["Morning light. {P} is making coffee in a hotel robe, humming. 'So… Iceland. Want to come with me?' You already know the answer.", "မနက်ခင်း နေရောင်။ {P} က သီချင်းညည်းရင်း ကော်ဖီဖျော်နေတယ်။ 'ဒါနဲ့… Iceland ကို ငါနဲ့အတူ လိုက်မလား?' အဖြေကို ကိုယ်သိပြီးသားပါ။"]],
  [60, ["💗 Summer Romance Ending", "💗 နွေရာသီ အချစ် Ending"], ["At the airport, {P} hugs you for a long time. 'Video call every night. Promise.' Your phone buzzes before the plane even takes off.", "လေဆိပ်မှာ {P} က ကြာကြာလေး ဖက်ထားတယ်။ 'ညတိုင်း video call ဆက်မယ်၊ ကတိ'။ လေယာဉ်မထွက်ခင်ကတည်းက ဖုန်းမြည်လာပြီ။"]],
  [0, ["🌊 Summer Friends Ending", "🌊 နွေရာသီ သူငယ်ချင်း Ending"], ["You trade numbers and a warm hug at the lobby. Maybe it wasn't love this time… but the summer was beautiful. (Try again for a sweeter ending!)", "Lobby မှာ ဖုန်းနံပါတ်လဲပြီး နွေးနွေးထွေးထွေး ဖက်နှုတ်ဆက်ကြတယ်။ ဒီတစ်ခါတော့ အချစ်မဖြစ်ခဲ့ဘူး… ဒါပေမဲ့ နွေရာသီက လှပခဲ့တယ်။ (ပိုချိုတဲ့ ending အတွက် ပြန်ကစားကြည့်ပါ!)"]]
];
