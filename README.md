# Ariadne

Evidenzbasiertes Journaling als Obsidian-Plugin. Alles laeuft lokal gegen Ollama (oder einen anderen OpenAI-kompatiblen Endpunkt). Der Vault ist die alleinige Wahrheit. Ariadne ist Werkzeug, nicht Therapie.

## Features (v0.1)

- Ribbon-Button (Faden-Symbol) mit Menue
- Editor-Kontextmenue: markieren, Abfrage verankern, Reflektieren
- Ariadne markieren: Notiz per Frontmatter-Flag fuer Auswertungen freigeben, mit Typ-Auswahl (journal, impuls, order-log, ttrpg, meeting, reflexion)
- Abfrage verankern: Analyse der aktuellen Notiz durch das lokale Modell, Ergebnis als versionierter Callout in der Notiz. Optional fliesst der Kontext freigegebener Notizen desselben Vaults ein.
- Reflektieren: fortschreitender Pfad evidenzbasierter Schreibuebungen (Pennebaker-Episode in drei Schritten, Nuclear Episodes)
- Erkenntnisse gewinnen (Chat ueber alle freigegebenen Notizen): geplant als M4. Bis dahin: Copilot for Obsidian mit dem Sparring-Prompt.

## Installation (BRAT)

1. BRAT-Plugin installieren
2. BRAT: Add Beta Plugin, Repository: FMeixner/ariadne
3. Ariadne in den Community-Plugins aktivieren

Voraussetzung ist die main.js im Repo. Die Build-Action erstellt und committet sie nach jedem Push auf main automatisch.

## Setup

1. Ollama installieren, Modell ziehen:

       ollama pull llama3.2

2. systemd-Override (/etc/systemd/system/ollama.service.d/override.conf), damit Obsidian den Endpunkt aufrufen darf:

       [Service]
       Environment="OLLAMA_ORIGINS=app://obsidian.md,https://obsidian.md,http://localhost:1312"
       Environment="OLLAMA_HOST=0.0.0.0"

   Danach daemon-reload und Ollama neustarten. OLLAMA_HOST=0.0.0.0 nur fuer Heim-LAN-Nutzung, niemals ins Internet freigeben.

3. Ariadne-Einstellungen: Endpunkt (Standard http://127.0.0.1:11434), Modell, Temperatur, Kontext.

## Frontmatter-Schema

Freigabe und Typ pro Notiz:

    ---
    typ: journal
    ariadne: true
    ---

Typen: journal, impuls, order-log, ttrpg, meeting, reflexion. Nur Notizen mit ariadne: true im selben Vault fließen in Analysen ein.

## Die Mauer: Trennung privat und Uni

Ariadne wertet pro Vault aus. Die Freigabe gilt nur innerhalb des Vaults, in dem sie gesetzt wurde. Ariadne kopiert oder verschiebt niemals automatisch Notizen zwischen Vaults. Rohnotizen wandern nie ueber die Grenze; nur die verankerten Analyse-Callouts sind portabel. Uni-Daten (Meeting-Recaps) leben im Uni-Vault, Private im Privat-Vault.

## Reflexionspfad und Evidenz

Zwei Protokolle: die Pennebaker-Episode (drei Schritte: Fakten, Gefuehle und Koerper, Verknuepfung und Perspektive; je 15 bis 20 Minuten an aufeinanderfolgenden Tagen) und Nuclear Episodes (praegende Wendepunkte, 20 bis 30 Minuten). Die Dosierung folgt dem Standard expressiven Schreibens: kleine, aber robuste Effekte unter genau diesem Format (Frattaroli, 2006). Die Kombination Fakten plus Gefuehle ist der staerkste Moderator. Replicationen fallen kleiner aus (Morisano et al., 2010; spaetere Replicationen gegen null), deshalb gilt: der Pfad ist eine Uebung mit Chance auf Erkenntnis, keine Garantie. Ariadne ist Werkzeug, nicht Therapie.

## Datenschutz und Grenzen

- Anfragen gehen ausschliesslich an den in den Einstellungen konfigurierten Endpunkt. Keine Cloud-Defaults, keine Telemetrie.
- Freigegebene Notizen verlassen das Geraet nur in Richtung dieses Endpunkts.
- Krisensignale: Vor jeder Analyse prueft Ariadne den Text gegen eine Liste akuter Begriffe. Bei Treffer bricht die Analyse ab und es wird ein Hinweisblock mit der Telefonseelsorge (0800 111 0 111, 0800 111 0 222) verankert. Im akuten Notfall gilt 112.

## Manuelle Pruefliste (v0.1)

- [ ] Ribbon oeffnet das Menue
- [ ] Markierung setzt ariadne: true und typ
- [ ] Analyse verankert den Callout; ein erneuter Lauf ersetzt ihn statt zu duplizieren
- [ ] Der Kontext enthaelt nur freigegebene Notizen desselben Vaults
- [ ] Ein Krisenterm loest den Hinweisblock aus
- [ ] Eine Reflexionssitzung legt eine Notiz unter reflexionen/ an
- [ ] Die Build-Action committet die main.js

## Lizenz

AGPL-3.0 (Volltext in LICENSE, identisch mit dem Repo order).