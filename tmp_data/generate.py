import docx, json, re, unicodedata
from collections import Counter, OrderedDict

doc = docx.Document('/app/tmp_data/proverbs.docx')

def is_bold_para(p):
    runs = [r for r in p.runs if r.text.strip()]
    if not runs:
        return False
    bold_chars = sum(len(r.text) for r in runs if r.bold)
    total = sum(len(r.text) for r in runs)
    return total > 0 and bold_chars / total >= 0.6

paras = [p for p in doc.paragraphs if p.text.strip()]

# --- Parse entries ---
entries = []
cur = None
started = False
for p in paras:
    text = p.text.strip()
    if is_bold_para(p):
        if not started and 'KIRGIZ ATAS' in text.upper():
            started = True
            continue
        started = True
        if cur is not None:
            entries.append(cur)
        cur = {'proverb': text, 'lines': []}
    else:
        if cur is not None:
            cur['lines'].append(text)
if cur:
    entries.append(cur)

# --- Turkish-aware helpers ---
TR_UPPER = {'i': 'İ', 'ı': 'I'}

def tr_upper_first(s):
    for ch in s:
        if ch.isalpha():
            return TR_UPPER.get(ch, ch.upper())
    return '#'

def normalize(s):
    s = s.lower()
    s = (s.replace('â', 'a').replace('î', 'i').replace('û', 'u')
           .replace('ç', 'c').replace('ğ', 'g').replace('ı', 'i')
           .replace('ö', 'o').replace('ş', 's').replace('ü', 'u')
           .replace('ñ', 'n'))
    s = ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# --- Category keyword map (heuristic, whole-word on normalized Turkish meaning/explanation) ---
CATEGORIES = OrderedDict([
    ('Aile', ['aile', 'baba', 'ana', 'anne', 'evlat', 'ogul', 'kiz', 'kardes', 'akraba', 'ata', 'cocuk', 'gelin', 'kayin', 'damat', 'torun', 'soy', 'nine', 'dede', 'yavru']),
    ('Ask', ['ask', 'sevgi', 'sevda', 'gonul', 'sevgili', 'asik', 'yar']),
    ('Arkadaslik', ['arkadas', 'ahbap', 'yoldas']),
    ('Dostluk', ['dost', 'dostluk']),
    ('Dusmanlik', ['dusman', 'kin', 'husumet', 'kavga', 'dusmanlik', 'nifak']),
    ('Calisma', ['calis', 'emek', 'zahmet', 'huner', 'meslek', 'usta', 'ciftci', 'ekin', 'harman', 'tarla']),
    ('Sabir', ['sabir', 'sabret', 'sabreden', 'tahammul', 'katlan']),
    ('Basari', ['basar', 'zafer', 'muvaffak', 'galip', 'kazanan']),
    ('Para', ['para', 'akce', 'kurus', 'pul', 'borc', 'kredi']),
    ('Zenginlik', ['zengin', 'servet', 'varlik', 'mal', 'hazine', 'dovlet', 'devlet']),
    ('Fakirlik', ['fakir', 'yoksul', 'zugurt', 'garip', 'muhtac', 'aclik', 'dilenci']),
    ('Egitim', ['ilim', 'oku', 'ogren', 'mektep', 'terbiye', 'bilgi', 'ogret', 'egitim', 'ilm', 'alim', 'cahil']),
    ('Akil', ['akil', 'zeka', 'mantik', 'dusun', 'akl', 'akilli', 'akilsiz', 'delilik', 'deli']),
    ('Zaman', ['zaman', 'vakit', 'saat', 'cag', 'yarin', 'bugun', 'dunya vakti', 'mevsim', 'gecikme']),
    ('Hayat', ['hayat', 'yasam', 'omur', 'olum', 'dunya', 'ecel', 'yasa']),
    ('Doga', ['dag', 'deniz', 'gol', 'irmak', 'nehir', 'yagmur', 'ruzgar', 'toprak', 'agac', 'cicek', 'gunes', 'firtina', 'sel', 'orman', 'tabiat', 'yildiz', 'bulut', 'dere']),
    ('Hayvanlar', ['kopek', 'kurt', 'tilki', 'aslan', 'koyun', 'keci', 'inek', 'okuz', 'deve', 'tavuk', 'horoz', 'karga', 'yilan', 'esek', 'tavsan', 'balik', 'kedi', 'ari', 'kus', 'kuzu', 'boru', 'ayi', 'sinek', 'fare', 'katir', 'buzagi']),
    ('Saglik', ['saglik', 'hasta', 'dert', 'derman', 'ilac', 'sifa', 'tabip', 'hekim', 'yara', 'agri']),
    ('Adalet', ['adalet', 'hukuk', 'adil', 'hakim', 'kadi', 'zulum', 'haksiz', 'zalim', 'hak']),
    ('Cesaret', ['cesaret', 'yurek', 'cesur', 'korku', 'yigit', 'mert', 'kahraman', 'korkak']),
    ('Tecrube', ['tecrube', 'deneyim', 'gormus', 'yasli', 'ihtiyar', 'gecirmis']),
    ('Insan Iliskileri', ['komsu', 'misafir', 'konuk', 'toplum', 'el gun', 'insanlik', 'gorgusuz', 'saygi']),
])

def categorize(meaning, explanation):
    text = normalize((meaning or '') + ' ' + (explanation or ''))
    tokens = set(text.split())
    hits = []
    for cat, kws in CATEGORIES.items():
        for kw in kws:
            if ' ' in kw:
                if kw in text:
                    hits.append(cat); break
            elif kw in tokens:
                hits.append(cat); break
    return hits

# --- Build records + duplicate detection ---
records = []
seen = {}
duplicates = []
for idx, e in enumerate(entries):
    proverb = e['proverb']
    lines = e['lines']
    meaning = lines[0] if len(lines) >= 1 else ''
    explanation = '\n'.join(lines[1:]) if len(lines) > 1 else ''
    norm = normalize(proverb)
    if norm in seen:
        duplicates.append(proverb)
        # merge extra info into the existing record if the existing lacks explanation
        continue
    seen[norm] = True
    rec = {
        'id': f'p{len(records)+1}',
        'proverb': proverb,
        'meaning': meaning,
        'explanation': explanation,
        'firstLetter': tr_upper_first(proverb),
        'categories': categorize(meaning, explanation),
    }
    records.append(rec)

# --- Stats ---
incomplete = [r for r in records if not r['meaning']]
letter_counts = Counter(r['firstLetter'] for r in records)
cat_counts = Counter()
for r in records:
    for c in r['categories']:
        cat_counts[c] += 1
uncategorized = sum(1 for r in records if not r['categories'])

report = {
    'total_entries_found': len(entries),
    'imported': len(records),
    'duplicates_detected': len(duplicates),
    'incomplete_records': len(incomplete),
    'first_letters': dict(sorted(letter_counts.items())),
    'category_counts': dict(cat_counts),
    'uncategorized': uncategorized,
}

with open('/app/tmp_data/report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
with open('/app/tmp_data/duplicates.json', 'w', encoding='utf-8') as f:
    json.dump(duplicates, f, ensure_ascii=False, indent=2)

# --- Write proverbs.json (compact) ---
out = [{'id': r['id'], 'proverb': r['proverb'], 'meaning': r['meaning'],
        'explanation': r['explanation'], 'firstLetter': r['firstLetter'],
        'categories': r['categories']} for r in records]
with open('/app/tmp_data/proverbs.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

print(json.dumps(report, ensure_ascii=False, indent=2))
import os
print('proverbs.json size KB:', round(os.path.getsize('/app/tmp_data/proverbs.json')/1024, 1))
print('sample duplicates:', duplicates[:8])
