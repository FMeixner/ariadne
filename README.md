# Ariadne

Evidenzbasiertes Journaling als Obsidian-Plugin. Plugin First: Alle Nutzeraktionen laufen ueber das Plugin, keine vault-seitigen Vorlagen-Workarounds mehr. Alles laeuft lokal gegen Ollama (oder einen anderen OpenAI-kompatiblen Endpunkt). Der Vault ist die alleinige Wahrheit. Ariadne ist Werkzeug, nicht Therapie.

## Features (v0.2)

- Ribbon-Button (Faden-Symbol) mit Menue: Neuer Check-in, Markierung, Verankerung, Reflexion, Chat-Platzhalter
- Abend-Check-in: Modal mit vier Slidern (Valenz, Aktivierung, Belastung, Koerper, jeweils 0 bis 10), Kontext-Kacheln (Lehre, Forschung, Admin, Sport, Sozial, Familie, Allein) und Ausnahme-Ereignis-Schalter. Legt eintraege/JJJJ-MM-TT.md als journal an und gibt ihn sofort frei. Kein Meta Bind, keine manuellen Templates noetig.
- Editor-Kontextmenue: markieren, Abfrage verankern, Reflektieren
- Ariadne markieren: Notiz per Frontmatter-Flag fuer Auswertungen freigeben, mit Typ-Auswahl (journal, impuls, order-log, ttrpg, meeting, reflexion)
- Abfrage verankern: Analyse der aktuellen Notiz durch das lokale Modell, Ergebnis als versionierter Callout in der Notiz. Optional fliesst der Kontext freigegebener Notizen desselben Vaults ein.
- Reflektieren: fortschreitender Pfad evidenzbasierter Schreibuebungen (Pennebaker-Episode in drei Schritten, Nuclear Episodes)
- Chat mit dem lokalen Modell: als Menue-Eintrag sichtbar, Funktion folgt als M4. Bis dahin: Copilot for Obsidian mit dem Sparring-Prompt.

## Installation (BRAT)

1. BRAT-Plugin installieren
2. BRAT: Add Beta Plugin, Repository: FMeixner/ariadne
3. Ariadne in den Community-Plugins aktivieren

Voraussetzung ist ein GitHub-Release mit main.js, manifest.json und styles.css. Die Release-Action erstellt es automatisch, sobald die Versionsnummer in der manifest.json erhoeht und auf main gepusht wird.

## Setup

1. Ollama installieren, Modell ziehen:

       ollama pull llama3.2

2. systemd-Override (/etc/systemd/system/ollama.service.d/override.conf), damit Obsidian den Endpunkt aufrufen darf:

       [Service]
       Environment="OLLAMA_ORIGINS=app://obsidian.md,https://obsidian.md,http://localhost:1312"
       Environment="OLLAMA_HOST=0.0.0.0"

   Danach daemon-reload und Ollama neustarten. OLLAMA_HOST=0.0.0.0 nur fuer Heim-LAN-Nutzung (mobil), niemals ins Internet freigeben.

3. Ariadne-Einstellungen: Endpunkt (Standard http://127.0.0.1:11434, mobil http://RECHNER-IP:11434), Modell, Temperatur, Kontext.

## Frontmatter-Schema

Freigabe und Typ pro Notiz:

    ---
    typ: journal
    ariadne: true
    ---

Typen: journal, impuls, order-log, ttrpg, meeting, reflexion. Nur Notizen mit ariadne: true im selben Vault fließen in Analysen ein.

Check-ins tragen zusaetzlich: valence, arousal, belastung, koerper (0 bis 10), kontexte (Liste, z.B. [Lehre, Sport]), ausnahme (true/false) und zustand: gesprochen.

## Die Mauer: Trennung privat und Uni

Ariadne wertet pro Vault aus. Die Freigabe gilt nur innerhalb des Vaults, in dem sie gesetzt wurde. Ariadne kopiert oder verschiebt niemals automatisch Notizen zwischen Vaults. Rohnotizen wandern nie ueber die Grenze; nur die verankerten Analyse-Callouts sind portabel. Uni-Daten (Meeting-Recaps) leben im Uni-Vault, Private im Privat-Vault.

## Reflexionspfad und Evidenz

Zwei Protokolle: die Pennebaker-Episode (drei Schritte: Fakten, Gefuehle und Koerper, Verknuepfung und Perspektive; je 15 bis 20 Minuten an aufeinanderfolgenden Tagen) und Nuclear Episodes (praegende Wendepunkte, 20 bis 30 Minuten). Die Dosierung folgt dem Standard expressiven Schreibens: kleine, aber robuste Effekte unter genau diesem Format (Frattaroli, 2006). Die Kombination Fakten plus Gefuehle ist der staerkste Moderator. Replicationen fallen kleiner aus (Morisano et al., 2010; spaetere Replicationen gegen null), deshalb gilt: der Pfad ist eine Uebung mit Chance auf Erkenntnis, keine Garantie. Ariadne ist Werkzeug, nicht Therapie.

## Datenschutz und Grenzen

- Anfragen gehen ausschliesslich an den in den Einstellungen konfigurierten Endpunkt. Keine Cloud-Defaults, keine Telemetrie.
- Freigegebene Notizen verlassen das Geraet nur in Richtung dieses Endpunkts.
- Krisensignale: Vor jeder Analyse prueft Ariadne den Text gegen eine Liste akuter Begriffe. Bei Treffer bricht die Analyse ab und es wird ein Hinweisblock mit der Telefonseelsorge (0800 111 0 111, 0800 111 0 222) verankert. Im akuten Notfall gilt 112.

## Manuelle Pruefliste (v0.2)

- [ ] Ribbon oeffnet das Menue
- [ ] Der Check-in-Modal legt eintraege/YYYY-MM-DD.md mit Slidern, Kontexten und ariadne: true an
- [ ] Markierung setzt ariadne: true und typ
- [ ] Analyse verankert den Callout; ein erneuter Lauf ersetzt ihn statt zu duplizieren
- [ ] Der Kontext enthaelt nur freigegebene Notizen desselben Vaults
- [ ] Ein Krisenterm loest den Hinweisblock aus
- [ ] Eine Reflexionssitzung legt eine Notiz unter reflexionen/ an
- [ ] Die Release-Action erstellt das Release bei Versionsbump automatisch

## Lizenz

AGPL-3.0 (Volltext in LICENSE).
