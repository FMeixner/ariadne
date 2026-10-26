# AGENTS.md

Regeln fuer alle Agenten (Menschen, Copilots, automatisierte Helfer), die an diesem Repository arbeiten.

- Sprache: UI-Texte und Doku Deutsch. Fachbegriffe bleiben unuebersetzt.
- Alles lokal: keine Cloud-Aufrufe, keine Telemetrie, keine externen Abhaengigkeiten in der Laufzeit. fetch/requestUrl nur gegen den in den Einstellungen konfigurierten Endpunkt (OpenAI-kompatibel, Standard Ollama).
- Plugin First: Alle Nutzeraktionen laufen ueber das Plugin (Ribbon, Befehlspalette, Kontextmenue). Vault-seitige Umwege (Meta Bind, manuelle Templates) sind abgeloest und werden nicht weitergepflegt. Neue Features wandern ins Plugin.
- Mauer: Die Freigabe (ariadne-Flag) gilt nur innerhalb eines Vaults. Niemals automatisch Notizen zwischen Vaults kopieren, verschieben oder synchronisieren. Uni- und Privates bleiben getrennt.
- Verankerung: Analysen immer als versionierter Callout mit dem Marker %%ariadne-analyse%% im Kopf. Ein erneuter Lauf ersetzt den Block, nie duplizieren.
- KRISTERME: Die Liste der Krisensignale in src/main.ts darf nur ergaenzt, niemals gekuerzt oder geschwaecht werden. Jeder Analyse- und Chat-Pfad enthaelt die Krisenweiterleitung (Telefonseelsorge 0800 111 0 111, 0800 111 0 222, Notruf 112).
- Reflexionspfad: Die Dosierung (15 bis 20 Minuten, ein Schritt pro Tag) wird nicht geaendert. Der Evidenzrahmen im README (Pennebaker-Standard, Frattaroli 2006, Morisano et al. 2010) bleibt Teil der Doku.
- Code: TypeScript strict, keine neuen Laufzeit-Abhaengigkeiten ohne Not. src/main.ts bleibt monolithisch, bis ein Split wirklich faellig ist.
- Build: main.js wird nie manuell committet. Die GitHub Actions (build.yml) baut und committet sie; die Release-Action erstellt Releases aus der manifest-Version. Installation und Updates waehrend der Entwicklung ueber BRAT.
- Ehrlichkeit: Das Plugin ist Werkzeug, nicht Therapie. Diese Formulierung bleibt in UI und Doku erhalten.
