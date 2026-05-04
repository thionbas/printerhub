# PRINTER HUB

Eine zusammengefasste Single-Page Druck-App für Etiketten und Schilder. Ersetzt die bisherigen Einzel-Repos (`schilder`, `kanister`, `behaelter`, `probegross`, `probeklein`, `hobbock`, `tankwagen`, `lolc`).

## Inhalt

| Seite | Format | Bogen-Modus | Beschreibung |
|------|--------|------|------|
| Schilder Druck | 99,1×42,3 mm (Avery L4743REV, 12 Stk.) | ✅ | Rohrleitung — Farbe nach DIN, Pfeil, GHS, Signal |
| Kanister Druck | 4× A6 (A4 quer) | ❌ (immer 4) | Bezeichnung, GHS, Signal, Sonstiges |
| Behälter Druck | A4 quer | ❌ (1 Blatt) | Anlagenteil + Stoffname, GHS, Signal |
| Probe Groß Druck | 99,1×42,3 mm (L4743REV, 12 Stk.) | ✅ | Stoff / P.-Stelle / Probenehmer / Datum, GHS, Signal |
| Probe Klein Druck | 35,6×16,9 mm (L4732, 80 Stk.) | ✅ | Stoffname, GHS, Datum |
| Hobbock Druck | 4× A6 (A4 quer) | ❌ (immer 4) | Wie Kanister |
| Tankwagen Druck | A4 quer | ❌ (1 Blatt) | Container-Nr., Stoffname, GHS, Signal, Fußzeile |
| LO/LC & EA Druck | 99,1×42,3 mm (12 Stk.) | ✅ | Farbig kodierter Status-Bogen |

## Funktionen

### Bogen-Modus (Schilder, Probe Groß, Probe Klein, LO/LC)
- **Position + Anzahl**: bestimmt, ab welcher Position des Bogens und wie viele Etiketten gedruckt werden.
- **+ Zum Bogen**: aktuellen Stoff inkl. GHS und Position zur Liste hinzufügen.
- **Bogen drucken**:
  - Liste leer → druckt nur den aktuellen Stoff (Position+Anzahl).
  - Liste hat Einträge → druckt alle Einträge auf einem Bogen, jeder an seiner Position. Slots ohne Eintrag bleiben leer.
- Verschiedene Stoffe auf einem Blatt sind dadurch möglich.

### Dynamische GHS-Skalierung
- Bis zu 9 GHS-Symbole pro Etikett auswählbar.
- Wenig Symbole → größer dargestellt, viele → automatisch kleiner, damit alles in die Zeile passt.
- Gilt für Vorschau und PDF-Output.

### Eingabemodus-Toggle (Tastatur / Dashboard)
- Oben rechts in der Menüleiste umschaltbar.
- Tastatur (Standard): System-Tastatur des Geräts.
- Dashboard: Beim Tippen auf ein Eingabefeld erscheint unten eine deutsche QWERTZ-Bildschirmtastatur mit Umlauten (ä, ö, ü, ß), Shift, Caps Lock, Backspace, Enter und Schließen-Button. Die Auswahl wird im Browser gespeichert.

## Dateien

- `index.html` — die komplette App (alle Seiten, CSS, Logik, On-Screen-Tastatur)
- `ghs-data.js` — die 9 GHS-Symbole als Base64 eingebettet

Keine weiteren Dateien, kein Build-Schritt.

## Deployment (GitHub Pages)

1. Repository `printerhub` neu anlegen.
2. Beide Dateien plus dieses README hochladen.
3. Settings → Pages → Source: main / root aktivieren.
4. Erreichbar unter `https://thionbas.github.io/printerhub/`.

## LO/LC Farben

- LO = Grün / Schwarz
- LC = Rot / Weiß
- NO = Weiß / Schwarz
- NC = Weiß / Schwarz
- EA = Weiß / Schwarz

## Tankwagen

Neue Zeile „Container / Tankwagen-Nummer" ganz oben (schmaler dargestellt als der Stoffname).
