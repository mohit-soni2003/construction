import React, { createContext, useContext, useEffect, useState } from 'react';

// UI text: English string -> Hindi. Missing keys fall back to English.
const UI_HI = {
  // header / tabs
  'House Construction': 'मकान निर्माण',
  Expenses: 'खर्च',
  Budget: 'बजट',
  Settings: 'सेटिंग्स',
  'Could not load data: {err}. Is the server / MongoDB running?': 'डेटा लोड नहीं हुआ: {err}. क्या सर्वर / MongoDB चल रहा है?',
  'New category name:': 'नई श्रेणी का नाम:',
  'New unit (e.g. bag, kg, trolley):': 'नई इकाई (जैसे बोरी, किलो, ट्रॉली):',

  // types
  Material: 'सामग्री',
  Labour: 'मजदूरी',
  'Small expense': 'छोटा खर्च',
  'Small expenses': 'छोटे खर्च',
  Small: 'छोटा',
  All: 'सभी',

  // expenses page
  'Total spent': 'कुल खर्च',
  'Budget left': 'बचा हुआ बजट',
  'All categories': 'सभी श्रेणियाँ',
  'No expenses yet.': 'अभी कोई खर्च नहीं जोड़ा गया।',
  'Delete this expense?': 'यह खर्च हटाएँ?',
  Date: 'तारीख',
  Type: 'प्रकार',
  'Category / Item': 'श्रेणी / सामान',
  Qty: 'मात्रा',
  Notes: 'नोट',
  Amount: 'राशि',
  Edit: 'बदलें',
  Delete: 'हटाएँ',
  'Total ({n} entries)': 'कुल ({n} एंट्री)',

  // expense form
  'Add expense': 'खर्च जोड़ें',
  'Edit expense': 'खर्च बदलें',
  'Amount (₹)': 'राशि (₹)',
  'Labour type': 'मजदूर का प्रकार',
  'Work (budget head)': 'काम (बजट मद)',
  Category: 'श्रेणी',
  '— Not linked —': '— नहीं जोड़ा —',
  '— Select —': '— चुनें —',
  '+ Add new…': '+ नया जोड़ें…',
  'Item / brand / details (optional)': 'सामान / ब्रांड / विवरण (वैकल्पिक)',
  'Item name': 'सामान का नाम',
  'Name / work': 'नाम / काम',
  'Name (optional)': 'नाम (वैकल्पिक)',
  'e.g. Sponge, sand paper': 'जैसे स्पंज, रेगमाल',
  'e.g. UltraTech, 53 grade': 'जैसे अल्ट्राटेक, 53 ग्रेड',
  Quantity: 'मात्रा',
  'e.g. 50': 'जैसे 50',
  unit: 'इकाई',
  budget: 'बजट',
  spent: 'खर्च',
  needed: 'ज़रूरत',
  '{x} left': '{x} बाकी',
  'Over by {x}': '{x} ज़्यादा खर्च',
  'Description / notes': 'विवरण / नोट',
  'Saving…': 'सेव हो रहा है…',
  Update: 'अपडेट करें',
  Add: 'जोड़ें',
  Cancel: 'रद्द करें',

  // budget page
  'Expected cost': 'अनुमानित लागत',
  'Spent on budget items': 'बजट मदों पर खर्च',
  'Still to spend': 'अभी खर्च होना बाकी',
  'Spent outside budget': 'बजट के बाहर खर्च',
  '{p}% of maximum budget used.': 'अधिकतम बजट का {p}% खर्च हो चुका है।',
  'Green = under minimum estimate, amber = between min and max, red = over max.':
    'हरा = न्यूनतम अनुमान से कम, पीला = न्यूनतम और अधिकतम के बीच, लाल = अधिकतम से ज़्यादा।',
  '{p}% of max': 'अधिकतम का {p}%',
  Item: 'सामान',
  Expected: 'अनुमानित',
  Spent: 'खर्च',
  Left: 'बाकी',
  'Section total': 'सेक्शन कुल',
  Total: 'कुल',
  'Small expenses and categories without a budget amount. Set a budget in Settings to track them above.':
    'छोटे खर्च और बिना बजट वाली श्रेणियाँ। इन्हें ऊपर देखने के लिए सेटिंग्स में बजट डालें।',
  '({n} entries)': '({n} एंट्री)',
  '{type} – no category': '{type} – बिना श्रेणी',

  // settings page
  'Edit “{name}”': '“{name}” बदलें',
  'Add category / budget item': 'श्रेणी / बजट मद जोड़ें',
  Name: 'नाम',
  'e.g. Cement': 'जैसे सीमेंट',
  Section: 'सेक्शन',
  'Group on budget page': 'बजट पेज पर समूह',
  'Default unit': 'डिफ़ॉल्ट इकाई',
  'Required quantity': 'आवश्यक मात्रा',
  'e.g. 80–100 bags': 'जैसे 80–100 बोरी',
  'Unit rate': 'इकाई दर',
  'e.g. ₹305–310/bag': 'जैसे ₹305–310/बोरी',
  'Budget min (₹)': 'न्यूनतम बजट (₹)',
  'Budget max (₹)': 'अधिकतम बजट (₹)',
  'Leave budget empty for items you only want to track (no expected amount).':
    'जिन चीज़ों का सिर्फ़ हिसाब रखना है (कोई अनुमानित राशि नहीं), उनका बजट खाली छोड़ दें।',
  'Delete category “{name}”?': 'श्रेणी “{name}” हटाएँ?',
  '{kind} categories': '{kind} की श्रेणियाँ',
  'None yet.': 'अभी कुछ नहीं।',
  Required: 'आवश्यक',
  Unit: 'इकाई',
  'No budget': 'बजट नहीं',
  Units: 'इकाइयाँ',
  'New unit, e.g. quintal': 'नई इकाई, जैसे क्विंटल',
  'Add unit': 'इकाई जोड़ें',

  // PIN screen
  'Enter the 6-digit PIN': '6 अंकों का पिन डालें',
  'Checking…': 'जाँच हो रही है…',
  Unlock: 'खोलें',
  Lock: 'लॉक करें',
  'Wrong PIN': 'गलत पिन',
  'Too many wrong attempts. Try again in 15 minutes.': 'बहुत बार गलत पिन डाला गया। 15 मिनट बाद फिर कोशिश करें।',
  'Database connection failed': 'डेटाबेस से जुड़ नहीं पाए',

  // server messages
  'Choose a material category': 'सामग्री की श्रेणी चुनें',
  'Item name is required': 'सामान का नाम ज़रूरी है',
  'Labour type is required': 'मजदूर का प्रकार ज़रूरी है',
  'Name is required when type is Other': '"अन्य" चुनने पर नाम ज़रूरी है',
  'Name is required': 'नाम ज़रूरी है',
  'Unit name is required': 'इकाई का नाम ज़रूरी है',
  'That name already exists': 'यह नाम पहले से मौजूद है',
  'Minimum budget cannot be more than maximum': 'न्यूनतम बजट अधिकतम से ज़्यादा नहीं हो सकता',
  'Request failed': 'अनुरोध विफल रहा',
  'Server error': 'सर्वर में गड़बड़ी',
  'Not found': 'नहीं मिला',
  'Invalid id or value': 'गलत मान',
};

// Built-in data (seeded budget items, labour types, units). Names you add yourself are shown as typed.
const DATA_HI = {
  // labour types
  Thakedar: 'ठेकेदार',
  Electrician: 'इलेक्ट्रीशियन',
  Painter: 'पेंटर',
  Plumber: 'प्लंबर',
  Tiling: 'टाइल मिस्त्री',
  Other: 'अन्य',

  // units
  bag: 'बोरी',
  pcs: 'नग',
  'sq. ft.': 'वर्ग फुट',
  'm³': 'घन मीटर',
  'cu. ft.': 'घन फुट',
  litre: 'लीटर',
  kg: 'किलो',
  ton: 'टन',
  trolley: 'ट्रॉली',
  ft: 'फुट',
  meter: 'मीटर',
  box: 'डिब्बा',
  packet: 'पैकेट',
  set: 'सेट',
  'lump sum': 'एकमुश्त',

  // sections
  'General construction materials': 'सामान्य निर्माण सामग्री',
  'Hard / finishing materials': 'हार्ड / फिनिशिंग सामग्री',
  'Labour charges': 'मजदूरी खर्च',
  'Small expenses': 'छोटे खर्च',
  'Other materials': 'अन्य सामग्री',

  // budget items
  'Reti (sand)': 'रेती (बालू)',
  Bricks: 'ईंट',
  Cement: 'सीमेंट',
  'Churi (aggregate)': 'चूरी (रोड़ी)',
  Tiles: 'टाइल्स',
  'Sanitary fittings': 'सैनिटरी फिटिंग',
  Tin: 'टीन',
  'Wash basin': 'वॉश बेसिन',
  Sink: 'सिंक',
  'Zhiri box material': 'झिरी बॉक्स सामग्री',
  Marble: 'मार्बल',
  'Terrace ventilation jali + lantern box jalis': 'छत वेंटिलेशन जाली + लालटेन बॉक्स जाली',
  'Gitti and sariya': 'गिट्टी और सरिया',
  'Electrical wiring material': 'बिजली वायरिंग सामग्री',
  Putty: 'पुट्टी',
  'Colour / paint': 'रंग / पेंट',
  Shutter: 'शटर',
  'Plaster, paracoat and terrace finishing': 'प्लास्टर, पैराकोट और छत फिनिशिंग',
  'Tile fitting': 'टाइल फिटिंग',
  'Plumbing fitting': 'प्लंबिंग फिटिंग',
  'Tin fitting': 'टीन फिटिंग',
  'Zhiri box work': 'झिरी बॉक्स काम',
  'Small items': 'छोटे सामान',

  // required qty / unit rate text
  'As required': 'आवश्यकतानुसार',
  'Complete work': 'पूरा काम',
  'Lump sum': 'एकमुश्त',
  Combined: 'संयुक्त',
  '1 unit': '1 नग',
  '2,000 units': '2,000 नग',
  '80–100 bags': '80–100 बोरी',
  '9 bags': '9 बोरी',
  '40 litres': '40 लीटर',
  '5 jalis': '5 जाली',
  '10–15 m³': '10–15 घन मीटर',
  '10 m³': '10 घन मीटर',
  '1,000 sq. ft.': '1,000 वर्ग फुट',
  '700 sq. ft.': '700 वर्ग फुट',
  '₹8.50–9/unit': '₹8.50–9/नग',
  '₹305–310/bag': '₹305–310/बोरी',
  '₹40–47/sq. ft.': '₹40–47/वर्ग फुट',
  '~₹444–556/bag': '~₹444–556/बोरी',
  '₹375/litre': '₹375/लीटर',
  '₹70–80/sq. ft.': '₹70–80/वर्ग फुट',
};

const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s);

function read() {
  try {
    return localStorage.getItem('lang') === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {}
    document.documentElement.lang = lang;
    document.title = lang === 'hi' ? 'मकान निर्माण खर्च' : 'House Construction Expenses';
  }, [lang]);

  const hi = lang === 'hi';
  const value = {
    lang,
    toggle: () => setLang((l) => (l === 'hi' ? 'en' : 'hi')),
    // UI text
    t: (s, vars) => fill((hi && UI_HI[s]) || s, vars),
    // stored data values (category names, units, labour types…)
    td: (s) => (hi && s && DATA_HI[s]) || s,
    // error messages from the server
    tErr: (msg) => {
      if (!hi || !msg) return msg;
      return msg
        .split(', ')
        .map((part) => {
          const m = part.match(/^(\d+) expense\(s\) use this category/);
          if (m) return `${m[1]} खर्च इस श्रेणी में हैं। पहले उन्हें बदलें या हटाएँ।`;
          return UI_HI[part] || part;
        })
        .join(', ');
    },
    fmtDate: (d) =>
      new Date(d).toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
