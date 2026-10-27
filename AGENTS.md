# AGENTS.md

Regeln fuer alle Agenten (Menschen, Copilots, automatisierte Helfer), die an diesem Repository arbeiten.

- Sprache: UI-Texte und Doku Deutsch. Fachbegriffe bleiben unuebersetzt.
- UI-Sprache: griffig und funktional statt mechanisch: "Neuer Journal-Eintrag mit Stimmungserfassung", "Notiz taggen", "Mit Ariadne sprechen". Keine Systembezeichnungen wie "Slider-Abfrage" in Menues.
- Alles lokal: keine Cloud-Aufrufe, keine Telemetrie, keine externen Abhaengigkeiten in der Laufzeit. Modellpfad ist allein der Chat (M4) gegen den konfigurierten Endpunkt (OpenAI-kompatibel, Standard Ollama). Eine Analyse pro Einzelnotiz gibt es nicht: getaggte Notizen sind der Kontext des Chats.
- Plugin First: Alle Nutzeraktionen laufen ueber das Plugin (Ribbon, Befehlspalette, Kontextmenue). Vault-seitige Umwege (Meta Bind, manuelle Templates) sind abgeloest und werden nicht weitergepflegt. Neue Features wandern ins Plugin.
- Mauer: Das Tag (ariadne-Flag) gilt nur innerhalb eines Vaults. Niemals automatisch Notizen zwischen Vaults kopieren, verschieben oder synchronisieren. Uni- und Privates bleiben getrennt.
- Verankerung: Erkenntnisse aus dem Chat (M4) werden als versionierter Callout mit dem Marker %%ariadne-analyse%% verankert. Ein erneutes Verankern ersetzt den Block, nie duplizieren.
- Stimmungs-Chiffre: Nachtraegliche Stimmungserfassung in fortlaufenden Notizen (z.B. Lehrveranstaltungs-Logs) laeuft ueber den Marker %%ariadne-stimmung ...%% als Obsidian-Kommentar an der Cursor-Position. In der Lesansicht unsichtbar, wird vom Chat (M4) mitgelesen.
- KRISTERME: Die Liste der Krisensignale in src/main.ts darf nur ergaenzt, niemals gekuerzt oder geschwaecht werden. Der Chat-Pfad (M4) enthaelt die Krisenweiterleitung (Telefonseelsorge 0800 111 0 111, 0800 111 0 222, Notruf 112).
- Reflexionspfad: Die Dosierung (15 bis 20 Minuten, ein Schritt pro Tag) wird nicht geaendert. Der Evidenzrahmen im README (Pennebaker-Standard, Frattaroli 2006, Morisano et al. 2010) bleibt Teil der Doku.
- Code: TypeScript strict, keine neuen Laufzeit-Abhaengigkeiten ohne Not. src/main.ts bleibt monolithisch, bis ein Split wirklich faellig ist.
- Build: main.js wird nie manuell committet. Die GitHub Actions bauen und committen sie; die Release-Action erstellt Re
leases aus der manifest-Version. Installation und Updates ueber BRAT.
- Ehrlichkeit: Das Plugin ist Werkzeug, nicht Therapie. Diese Formulierung bleibt in UI und Doku erhalten.
