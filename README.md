# Ariadne

Evidenzbasiertes Journaling als Obsidian-Plugin. Plugin First: Alle Nutzeraktionen laufen ueber das Plugin. Der Vault ist die alleinige Wahrheit. Ariadne ist Werkzeug, nicht Therapie.

## Features (v0.5)

- Ribbon-Button (Faden-Symbol) mit Menue: Neuer Journal-Eintrag, taggen, Stimmung vor Ort, Reflektieren, Chat-Platzhalter
- Neuer Journal-Eintrag mit Stimmungserfassung: optionaler Titel, vier Slider (Valenz, Aktivierung, Belastung, Koerper, 0 bis 10), Kontext-Kacheln (Lehre, Forschung, Admin, Sport, Sozial, Familie, Allein), Ausnahme-Schalter. Legt eintraege/JJJJ-MM-TT-HHmm.md an (Datum und Uhrzeit), taggt als journal und oeffnet die Notiz zum Schreiben. Mehrere Eintraege pro Tag, Ordner werden automatisch angelegt. Komplett offline.
- Notiz taggen: Bestehende Notiz per Frontmatter-Flag freigeben, Typ-Auswahl als Klartext-Liste (journal, impuls, order-log, ttrpg, meeting, hobby, reflexion). Getaggte Notizen bilden den spaeteren Chat-Kontext.
- Stimmung an dieser Stelle erfassen: dieselben Slider und Kontext-Kacheln wie beim Journal-Eintrag, aber als Chiffre-Kommentar (%%ariadne-stimmung ...) direkt an der Cursor-Position einer bestehenden Notiz, z.B. unter dem Datums-Unterueberschrift eines Lehrveranstaltungs-Logs. Obsidian-Kommentare sind in der Lesansicht unsichtbar, fuer Studierende und Kollegen bleibt die Notiz sauber. Beim Taggen genuegt die Checkbox Stimmung miterfassen; der eigene Befehl (ariadne-stimmung) und das Editor-Kontextmenue funktionieren auch in bereits getaggten Notizen. Komplett offline.
- Reflektieren: gefuehrter Pfad evidenzbasierter Schreibuebungen (Pennebaker-Episode in drei Schritten, Nuclear Episodes). Ohne Modell, komplett offline.
- Mit Ariadne sprechen (M4, folgt): Chat ueber alle getaggten Notizen desselben Vaults gegen das lokale Modell. Fragen wie "Welche Muster deckst du auf?" oder "Was hat die letzten vier Wochen Kraft gegeben?" werden dann gestellt und beantwortet; Erkenntnisse lassen sich als Callout in einer Notiz verankern.

Aktuell ruft keine Funktion ein Modell auf. Der Chat (M4) wird der einzige Modellpfad; eine Analyse pro Einzelnotiz gibt es bewusst nicht mehr.

## Installation (BRAT)

1. BRAT-Plugin installieren
2. BRAT: Add Beta Plugin, Repository: FMeixner/ariadne
3. Ariadne in den Community-Plugins aktivieren

Voraussetzung ist ein GitHub-Release mit main.js, manifest.json und styles.css. Die Release-Action erstellt es automatisch, sobald die Versionsnummer in der manifest.json erhoeht und auf main gepusht wird.

## Setup

Bis M4 ist kein Modell noetig: Journal-Eintrage, Taggen und Reflexion laufen komplett offline.

Ab M4 (Chat):

1. Ollama installieren, Modell ziehen:

       ollama pull llama3.2

2. systemd-Override (/etc/systemd/system/ollama.service.d/override.conf), damit Obsidian den Endpunkt aufrufen darf:

       [Service]
       Environment="OLLAMA_ORIGINS=app://obsidian.md,https://obsidian.md,http://localhost:1312"
       Environment="OLLAMA_HOST=0.0.0.0"

   Danach daemon-reload und Ollama neustarten. OLLAMA_HOST=0.0.0.0 nur fuer Heim-LAN-Nutzung (mobil), niemals ins Internet freigeben.

3. Ariadne-Einstellungen: Endpunkt (Standard http://127.0.0.1:11434, mobil http://RECHNER-IP:11434), Modell, Temperatur, Chat-Kontext.

## Frontmatter-Schema

Freigabe und Typ pro Notiz:

    ---
    typ: journal
    ariadne: true
    ---

Typen mit Klartext: journal (Tages- und Abendreflexion mit Stimmungserfassung), impuls (situativer Eintrag unterwegs), meeting (Uni- oder Dienstsitzung), order-log (Log fuer das Order-Projekt), ttrpg (Rollenspiel), hobby (andere Freizeit), reflexion (gefuhrte Schreibpfade). Nur Notizen mit ariadne: true im selben Vault bilden den Chat-Kontext.

Journal-Eintraege tragen zusaetzlich: datum, uhrzeit, valence, arousal, belastung, koerper (0 bis 10), kontexte (Liste, z.B. [Lehre, Sport]), ausnahme (true/false) und zustand: gesprochen.

Stimmungs-Chiffre in fortlaufenden Notizen: %%ariadne-stimmung JJJJ-MM-TT HH:mm v=7 a=3 b=2 k=5 kontexte=Lehre ausnahme=true%% steht als Obsidian-Kommentar an der Cursor-Position. v = Valenz, a = Aktivierung, b = Belastung, k = Koerper (je 0 bis 10). In der Lesansicht unsichtbar, im Quelltextmodus sichtbar; der spaetere Chat (M4) liest die Werte mit.

## Die Mauer: Trennung privat und Uni

Ariadne arbeitet pro Vault. Das Tag gilt nur innerhalb des Vaults, in dem es gesetzt wurde. Ariadne kopiert oder verschiebt niemals automatisch Notizen zwischen Vaults. Rohnotizen wandern nie ueber die Grenze; nur verankerte Erkenntnis-Callouts sind portabel. Uni-Daten (Meeting-Recaps) leben im Uni-Vault, Private im Privat-Vault.

## Reflexionspfad und Evidenz

Zwei Protokolle: die Pennebaker-Episode (drei Schritte: Fakten, Gefuehle und Koerper, Verknuepfung und Perspektive; je 15 bis 20 Minuten an aufeinanderfolgenden Tagen) und Nuclear Episodes (praegende Wendepunkte, 20 bis 30 Minuten). Die Dosierung folgt dem Standard expressiven Schreibens: kleine, aber robuste Effekte unter genau diesem Format (Frattaroli, 2006). Die Kombination Fakten plus Gefuehle ist der staerkste Moderator. Replicationen fallen kleiner aus (Morisano et al., 2010; spaetere Replicationen gegen null), deshalb gilt: der Pfad ist eine Uebung mit Chance auf Erkenntnis, keine Garantie. Ariadne ist Werkzeug, nicht Therapie.

## Datenschutz und Grenzen

- Ab M4 gehen Anfragen ausschliesslich an den in den Einstellungen konfigurierten Endpunkt. Keine Cloud-Defaults, keine Telemetrie.
- Getaggte Notizen verlassen das Geraet nur in Richtung dieses Endpunkts.
- Krisensignale: Der Chat (M4) prueft jede Anfrage gegen eine Liste akuter Begriffe und verweist bei Treffern auf die Telefonseelsorge (0800 111 0 111, 0800 111 0 222). Im akuten Notfall gilt 112.

## Manuelle Pruefliste (v0.5)

- [ ] Ribbon oeffnet das Menue
- [ ] Der Journal-Eintrag legt eintraege/YYYY-MM-DD-HHmm.md an, auch wenn der Ordner fehlte
- [ ] Mehrere Journal-Eintraege am selben Tag sind moeglich
- [ ] Die Typ-Auswahl zeigt Klartext-Beschreibungen
- [ ] Taggen setzt ariadne: true und typ
- [ ] Eine Reflexionssitzung legt eine Notiz unter reflexionen/ an
- [ ] Die Release-Action erstellt das Release bei Versionsbump automatisch
- [ ] Beim Taggen fuehrt die Checkbox Stimmung miterfassen zu den Slidern und fuegt die Chiffre an der Cursor-Position ein
- [ ] Der Befehl ariadne-stimmung fuegt die Chiffre auch in bereits getaggten Notizen ein
- [ ] In der Lesansicht ist die Chiffre unsichtbar, im Quelltextmodus sichtbar

## Lizenz

AGPL-3.0 (Volltext in LICENSE).
