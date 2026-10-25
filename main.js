"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AriadnePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  endpoint: "http://127.0.0.1:11434",
  model: "llama3.2",
  temperature: 0.4,
  kontextEinbeziehen: true,
  kontextAnzahl: 8,
  protokoll: "pennebaker-episode",
  schritt: 0
};
var TYPEN = ["journal", "impuls", "order-log", "ttrpg", "meeting", "reflexion"];
var MARKER = "%%ariadne-analyse%%";
var KRISTERME = [
  "suizid",
  "suizidgedanke",
  "suizidabsicht",
  "selbstmord",
  "selbstverletz",
  "todeswunsch",
  "nicht mehr weiterleben",
  "nicht mehr leben wollen",
  "leben beenden",
  "sturzkrise",
  "akute krise",
  "ohnmacht",
  "panikattacke"
];
var ANALYSE_PROMPT = [
  "Du bist der Sparringspartner in einem evidenzbasierten Journaling-System namens Ariadne.",
  "Grundhaltung: kollegial, praezise, hart in der Sache, herzlich in der Form. Du bist kein Therapeut.",
  "",
  "Aufgabe: Analysiere die AKTUELLE NOTIZ. Der KONTEXT freigegebener Notizen ist Hintergrund, nicht Hauptobjekt.",
  "",
  "Regeln:",
  "1. Nur belegbare Beobachtungen: verweise auf konkrete Stellen der Notiz (Zitate, Zahlen, Frontmatter-Werte).",
  "2. Suche aktiv nach Gegenbeispielen, bevor du ein Muster behauptest (Bestaetigungsfehler-Bremse).",
  "3. Wenn Frontmatter-Werte vorhanden sind (Slider, typ): pruefe, ob sie zum Ton des Textes passen. Diskrepanzen benennst du direkt.",
  "4. Sprich Fakten UND Gefuehle an, nie nur eines von beidem.",
  "5. Keine Diagnosen, keine Therapievorschlaege, keine Selbstoptimierungs-Rhetorik.",
  "6. Bei akuten Krisensignalen in der Notiz: unterbrich die Analyse, benenne klar und respektvoll die Grenze und verweise auf Telefonseelsorge (0800 111 0 111, 0800 111 0 222) und im Notfall 112.",
  "7. Maximal drei Beobachtungen oder Muster-Hypothesen, dann genau eine offene Frage.",
  "",
  "Struktur deiner Antwort:",
  "Beobachtungen: (kurze Liste mit Belegen)",
  "Auffaellig: (maximal zwei Hypothesen, jede mit Gegenbeispiel-Pruefung)",
  "Frage: (genau eine, zum Weiterdenken)",
  "",
  "Antworte auf Deutsch und bleibe unter 250 Woertern."
].join("\n");
var PROTOKOLLE = [
  {
    id: "pennebaker-episode",
    name: "Pennebaker-Episode (3 Schritte, je 15 bis 20 Minuten, an aufeinanderfolgenden Tagen)",
    schritte: [
      {
        titel: "Fakten",
        anleitung: [
          "Waehle EINE konkrete Episode der letzten sieben Tage.",
          "Schreibe 15 bis 20 Minuten nur darueber, was tatsaechlich passiert ist: Ort, Beteiligte, Ablauf, Deine Handlungen. Keine Bewertung, keine Deutung. Eine Faktenlage wie ein Protokoll."
        ]
      },
      {
        titel: "Gefuehle und Koerper",
        anleitung: [
          "Nimm dieselbe Episode erneut.",
          "Schreibe 15 bis 20 Minuten diesmal nur ueber Deine Gefuehle und Deine Koerpererfahrung: Was hast Du in der Situation gefuehlt, wo im Koerper hast Du es gespuert, was davon ist heute noch da. Fakten nur als Anker, wenn Du sie brauchst."
        ]
      },
      {
        titel: "Verknuepfung und Perspektive",
        anleitung: [
          "Zum dritten Mal dieselbe Episode: Was bedeuten Fakten und Gefuehle zusammen?",
          "Was wuerde ein aussenstehender, wohlwollender Beobachter sehen? Welcher naechste Schritt ergibt sich? Schliesse mit einem Satz, den Du in zwei Wochen wiederlesen willst."
        ]
      }
    ]
  },
  {
    id: "nuclear-episodes",
    name: "Nuclear Episodes (praegende Wendepunkte, 20 bis 30 Minuten)",
    schritte: [
      {
        titel: "Wendepunkte",
        anleitung: [
          "Denke an zwei bis drei praegende Wendepunkte deines Lebenswegs, insbesondere der letzten Jahre.",
          "Beschreibe fuer jeden: Was geschah, was haettest du dir damals gewuenscht, was hat sich daraus entwickelt, und welche Ahnung hast du heute, wozu es gut war oder noch werden koennte.",
          "Nimm dir dafuer 20 bis 30 Minuten in Ruhe."
        ]
      }
    ]
  }
];
var TypModal = class extends import_obsidian.Modal {
  constructor(app, onChoose) {
    super(app);
    this.onChoose = onChoose;
  }
  onOpen() {
    this.contentEl.createEl("h3", { text: "Notiz fuer Ariadne freigeben" });
    this.contentEl.createEl("p", { text: "Welcher Art ist diese Notiz? Der Typ steuert die spaetere Auswertung." });
    const zeile = new import_obsidian.Setting(this.contentEl);
    for (const t of TYPEN) {
      zeile.addButton((b) => b.setButtonText(t).onClick(() => {
        this.onChoose(t);
        this.close();
      }));
    }
  }
};
var ReflexionModal = class extends import_obsidian.Modal {
  constructor(app, plugin, protokoll, idx) {
    super(app);
    this.plugin = plugin;
    this.protokoll = protokoll;
    this.idx = idx;
  }
  onOpen() {
    const s = this.protokoll.schritte[this.idx];
    this.contentEl.createEl("h3", { text: this.protokoll.name });
    this.contentEl.createEl("p", { text: "Schritt " + (this.idx + 1) + " von " + this.protokoll.schritte.length + ": " + s.titel });
    for (const a of s.anleitung) {
      this.contentEl.createEl("p", { text: a });
    }
    this.contentEl.createEl("p", { text: "Nimm dir die Zeit in Ruhe. Ein Schritt pro Tag, nicht mehr." });
    new import_obsidian.Setting(this.contentEl).addButton((b) => b.setButtonText("Sitzung starten").setCta().onClick(async () => {
      await this.plugin.starteSitzung(this.protokoll, this.idx);
      this.close();
    })).addButton((b) => b.setButtonText("Schritt abschliessen").onClick(async () => {
      await this.plugin.schrittAbschliessen(this.protokoll, this.idx);
      this.close();
    }));
  }
};
var AriadneSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const c = this.containerEl;
    c.empty();
    c.createEl("h2", { text: "Ariadne" });
    new import_obsidian.Setting(c).setName("Endpunkt").setDesc("OpenAI-kompatibler lokaler Endpunkt. Standard: Ollama auf diesem Geraet.").addText((t) => t.setPlaceholder("http://127.0.0.1:11434").setValue(this.plugin.settings.endpoint).onChange(async (v) => {
      this.plugin.settings.endpoint = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Modell").setDesc("z.B. llama3.2, mistral-small").addText((t) => t.setValue(this.plugin.settings.model).onChange(async (v) => {
      this.plugin.settings.model = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Temperatur").addText((t) => t.setValue(String(this.plugin.settings.temperature)).onChange(async (v) => {
      const n = parseFloat(v.replace(",", "."));
      this.plugin.settings.temperature = isNaN(n) ? 0.4 : n;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Kontext freigegebener Notizen").setDesc("Bei jeder Analyse: Kontext aus freigegebenen Notizen desselben Vaults einbeziehen.").addToggle((t) => t.setValue(this.plugin.settings.kontextEinbeziehen).onChange(async (v) => {
      this.plugin.settings.kontextEinbeziehen = v;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Anzahl Kontextnotizen").addText((t) => t.setValue(String(this.plugin.settings.kontextAnzahl)).onChange(async (v) => {
      const n = parseInt(v, 10);
      this.plugin.settings.kontextAnzahl = isNaN(n) ? 8 : n;
      await this.plugin.saveSettings();
    }));
    const drop = new import_obsidian.Setting(c).setName("Reflexionsprotokoll").setDesc("Der Pfad, den Reflektieren weiterfuehrt.");
    drop.addDropdown((d) => {
      for (const p of PROTOKOLLE) {
        d.addOption(p.id, p.name);
      }
      d.setValue(this.plugin.settings.protokoll).onChange(async (v) => {
        this.plugin.settings.protokoll = v;
        this.plugin.settings.schritt = 0;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    new import_obsidian.Setting(c).setName("Aktueller Schritt").addText((t) => t.setValue(String(this.plugin.settings.schritt + 1)).setDisabled(true));
    new import_obsidian.Setting(c).setName("Krisenweiterleitung").setDesc("Bei Krisensignalen bricht jede Ariadne-Analyse ab. Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222. Im akuten Notfall: 112.");
  }
};
var AriadnePlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addRibbonIcon("git-branch", "Ariadne", (evt) => this.oeffneMenue(evt));
    this.addCommand({ id: "ariadne-markierung", name: "Ariadne: Markierung umschalten", callback: () => this.toggleMarkierung() });
    this.addCommand({ id: "ariadne-analyse", name: "Ariadne: Abfrage in dieser Notiz verankern", editorCallback: (editor) => this.verankern(editor) });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: markieren").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Abfrage verankern").setIcon("sparkles").onClick(() => {
        const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
        if (view) {
          this.verankern(view.editor);
        }
      }));
      menu.addItem((i) => i.setTitle("Ariadne: Reflektieren").setIcon("footprints").onClick(() => this.reflektieren()));
    }));
    this.addSettingTab(new AriadneSettingTab(this.app, this));
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  oeffneMenue(evt) {
    const menu = new import_obsidian.Menu();
    menu.addItem((i) => i.setTitle("Markierung umschalten").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
    menu.addItem((i) => i.setTitle("Abfrage in dieser Notiz verankern").setIcon("sparkles").onClick(() => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
      if (view) {
        this.verankern(view.editor);
      } else {
        new import_obsidian.Notice("Ariadne: Keine Notiz im Fokus.");
      }
    }));
    menu.addItem((i) => i.setTitle("Reflektieren - naechster Schritt").setIcon("footprints").onClick(() => this.reflektieren()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Erkenntnisse gewinnen (M4)").onClick(() => new import_obsidian.Notice("Ariadne: Erkenntnisse gewinnen folgt als M4. Bis dahin: Copilot for Obsidian mit dem Sparring-Prompt.")));
    menu.showAtMouseEvent(evt);
  }
  frontmatterVon(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (cache && cache.frontmatter) {
      return cache.frontmatter;
    }
    return null;
  }
  async toggleMarkierung() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    const file = view ? view.file : this.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian.Notice("Ariadne: Keine aktive Notiz.");
      return;
    }
    const fm = this.frontmatterVon(file);
    if (fm && fm["ariadne"] === true) {
      await this.app.fileManager.processFrontMatter(file, (f) => {
        f["ariadne"] = false;
      });
      new import_obsidian.Notice("Ariadne: Markierung entfernt.");
      return;
    }
    const typ = fm ? fm["typ"] : null;
    if (typ) {
      await this.app.fileManager.processFrontMatter(file, (f) => {
        f["ariadne"] = true;
      });
      new import_obsidian.Notice("Ariadne: Notiz freigegeben (typ: " + String(typ) + ").");
    } else {
      new TypModal(this.app, async (t) => {
        await this.app.fileManager.processFrontMatter(file, (f) => {
          f["ariadne"] = true;
          f["typ"] = t;
        });
        new import_obsidian.Notice("Ariadne: Notiz freigegeben als " + t + ".");
      }).open();
    }
  }
  freigegebeneDateien() {
    return this.app.vault.getMarkdownFiles().filter((f) => {
      const fm = this.frontmatterVon(f);
      return fm !== null && fm["ariadne"] === true;
    });
  }
  async kontextBilden() {
    const dateien = this.freigegebeneDateien().sort((a, b) => b.stat.mtime - a.stat.mtime).slice(0, this.settings.kontextAnzahl);
    const teile = [];
    for (const d of dateien) {
      const fm = this.frontmatterVon(d);
      const typ = fm && fm["typ"] ? String(fm["typ"]) : "ohne-typ";
      let text = await this.app.vault.read(d);
      if (text.length > 1200) {
        text = text.slice(0, 1200) + " ...";
      }
      teile.push("--- Notiz: " + d.basename + " (typ: " + typ + ") ---");
      teile.push(text);
    }
    return teile.join("\n\n");
  }
  krisencheck(text) {
    const t = text.toLowerCase();
    return KRISTERME.some((k) => t.includes(k));
  }
  async ollamaChat(prompt) {
    const url = this.settings.endpoint + "/v1/chat/completions";
    const body = JSON.stringify({ model: this.settings.model, messages: [{ role: "user", content: prompt }], temperature: this.settings.temperature, stream: false });
    const res = await (0, import_obsidian.requestUrl)({ url, method: "POST", headers: { "Content-Type": "application/json" }, body, throw: false });
    if (res.status >= 400) {
      throw new Error("HTTP " + res.status + " von " + url);
    }
    const data = res.json;
    if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return String(data.choices[0].message.content);
    }
    throw new Error("Ungueltige Antwort vom Endpunkt.");
  }
  baueBlock(antwort) {
    const zeilen = antwort.split("\n").map((l) => l.trim().length > 0 ? "> " + l.trim() : ">");
    const kopf = [
      MARKER,
      "> [!ariadne] Ariadne-Analyse",
      "> Erstellt: " + (0, import_obsidian.moment)().format("YYYY-MM-DD") + " | Modell: " + this.settings.model + " | Prompt: analyse-v1"
    ];
    return kopf.concat(zeilen).join("\n");
  }
  setzeBlock(editor, block) {
    const lines = editor.getValue().split("\n");
    let start = -1;
    for (let i = lines.length - 1; i >= 0; i = i - 1) {
      if (lines[i].trim() === MARKER) {
        start = i;
        break;
      }
    }
    if (start === -1) {
      const last = editor.lastLine();
      const len = editor.getLine(last).length;
      editor.replaceRange("\n\n" + block, { line: last, ch: len });
      return;
    }
    let end = start;
    for (let i = start + 1; i < lines.length; i = i + 1) {
      const l = lines[i].trim();
      if (l.length === 0 || l.slice(0, 1) === ">" || l.slice(0, 2) === "%%") {
        end = i;
      } else {
        break;
      }
    }
    if (end >= lines.length - 1) {
      editor.replaceRange(block, { line: start, ch: 0 }, { line: lines.length - 1, ch: lines[lines.length - 1].length });
    } else {
      editor.replaceRange(block, { line: start, ch: 0 }, { line: end + 1, ch: 0 });
    }
  }
  async verankern(editor) {
    if (!editor) {
      new import_obsidian.Notice("Ariadne: Keine Notiz im Fokus.");
      return;
    }
    const text = editor.getValue();
    if (this.krisencheck(text)) {
      this.setzeBlock(editor, [
        MARKER,
        "> [!warning] Grenze erreicht",
        "> Ariadne erkennt ein akutes Krisensignal in dieser Notiz und beendet die Auswertung hier.",
        "> Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222 (rund um die Uhr, kostenlos, anonym). Im akuten Notfall: 112.",
        "> Ariadne ist Werkzeug, nicht Therapie. Bitte hol dir Unterstuetzung."
      ].join("\n"));
      new import_obsidian.Notice("Ariadne: Krisensignal erkannt - Analyse beendet.");
      return;
    }
    const parts = [ANALYSE_PROMPT];
    if (this.settings.kontextEinbeziehen) {
      const kontext = await this.kontextBilden();
      if (kontext.length > 0) {
        parts.push("KONTEXT AUS FREIGEGEBENEN NOTIZEN (Hintergrund):");
        parts.push(kontext);
      }
    }
    parts.push("AKTUELLE NOTIZ:");
    parts.push(text);
    const prompt = parts.join("\n\n");
    const n = new import_obsidian.Notice("Ariadne analysiert ...");
    try {
      const antwort = await this.ollamaChat(prompt);
      n.hide();
      this.setzeBlock(editor, this.baueBlock(antwort));
      new import_obsidian.Notice("Ariadne: Analyse verankert.");
    } catch (e) {
      n.hide();
      new import_obsidian.Notice("Ariadne: Endpunkt nicht erreichbar oder Fehler - " + (e && e.message ? e.message : "unbekannt"));
    }
  }
  reflektieren() {
    const p = PROTOKOLLE.find((x) => x.id === this.settings.protokoll);
    const prot = p ? p : PROTOKOLLE[0];
    if (this.settings.schritt >= prot.schritte.length) {
      new import_obsidian.Notice("Ariadne: Protokoll abgeschlossen. Setze den Schritt in den Einstellungen zurueck oder wechsle das Protokoll.");
      return;
    }
    new ReflexionModal(this.app, this, prot, this.settings.schritt).open();
  }
  async starteSitzung(p, idx) {
    const s = p.schritte[idx];
    const iso = (0, import_obsidian.moment)().format("YYYY-MM-DD");
    const pfad = "reflexionen/" + iso + "-" + p.id + "-" + (idx + 1) + ".md";
    const zeilen = [
      "---",
      "typ: reflexion",
      "ariadne: true",
      "protokoll: " + p.id,
      "schritt: " + (idx + 1),
      "datum: " + iso,
      "zustand: gesprochen",
      "---",
      "",
      "# " + s.titel,
      ""
    ].concat(s.anleitung).concat([
      "",
      "(15 bis 20 Minuten, ohne Pause. Tippen oder diktieren - beides zaehlt.)",
      ""
    ]);
    try {
      const f = await this.app.vault.create(pfad, zeilen.join("\n"));
      await this.app.workspace.getLeaf(true).openFile(f);
      new import_obsidian.Notice("Ariadne: Sitzung gestartet - " + s.titel + ".");
    } catch (e) {
      new import_obsidian.Notice("Ariadne: Konnte die Sitzungsnotiz nicht anlegen (existiert sie schon?).");
    }
  }
  async schrittAbschliessen(p, idx) {
    this.settings.schritt = idx + 1;
    if (this.settings.schritt >= p.schritte.length) {
      new import_obsidian.Notice("Ariadne: Protokoll abgeschlossen - " + p.name + ".");
    } else {
      new import_obsidian.Notice("Ariadne: Naechster Schritt ist " + p.schritte[this.settings.schritt].titel + ".");
    }
    await this.saveSettings();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1lbnUsIE1vZGFsLCBtb21lbnQsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCByZXF1ZXN0VXJsLCBTZXR0aW5nLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5pbnRlcmZhY2UgQXJpYWRuZVNldHRpbmdzIHtcbiAgZW5kcG9pbnQ6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAga29udGV4dEVpbmJlemllaGVuOiBib29sZWFuO1xuICBrb250ZXh0QW56YWhsOiBudW1iZXI7XG4gIHByb3Rva29sbDogc3RyaW5nO1xuICBzY2hyaXR0OiBudW1iZXI7XG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEFyaWFkbmVTZXR0aW5ncyA9IHtcbiAgZW5kcG9pbnQ6IFwiaHR0cDovLzEyNy4wLjAuMToxMTQzNFwiLFxuICBtb2RlbDogXCJsbGFtYTMuMlwiLFxuICB0ZW1wZXJhdHVyZTogMC40LFxuICBrb250ZXh0RWluYmV6aWVoZW46IHRydWUsXG4gIGtvbnRleHRBbnphaGw6IDgsXG4gIHByb3Rva29sbDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgc2Nocml0dDogMFxufTtcblxuY29uc3QgVFlQRU46IHN0cmluZ1tdID0gW1wiam91cm5hbFwiLCBcImltcHVsc1wiLCBcIm9yZGVyLWxvZ1wiLCBcInR0cnBnXCIsIFwibWVldGluZ1wiLCBcInJlZmxleGlvblwiXTtcblxuY29uc3QgTUFSS0VSID0gXCIlJWFyaWFkbmUtYW5hbHlzZSUlXCI7XG5cbi8vIEtSSVNURVJNRTogTnVyIGVyZ2FlbnplbiwgbmllbWFscyBzY2h3YWVjaGVuIChzaWVoZSBBR0VOVFMubWQpLlxuY29uc3QgS1JJU1RFUk1FOiBzdHJpbmdbXSA9IFtcbiAgXCJzdWl6aWRcIixcbiAgXCJzdWl6aWRnZWRhbmtlXCIsXG4gIFwic3VpemlkYWJzaWNodFwiLFxuICBcInNlbGJzdG1vcmRcIixcbiAgXCJzZWxic3R2ZXJsZXR6XCIsXG4gIFwidG9kZXN3dW5zY2hcIixcbiAgXCJuaWNodCBtZWhyIHdlaXRlcmxlYmVuXCIsXG4gIFwibmljaHQgbWVociBsZWJlbiB3b2xsZW5cIixcbiAgXCJsZWJlbiBiZWVuZGVuXCIsXG4gIFwic3R1cnprcmlzZVwiLFxuICBcImFrdXRlIGtyaXNlXCIsXG4gIFwib2hubWFjaHRcIixcbiAgXCJwYW5pa2F0dGFja2VcIlxuXTtcblxuY29uc3QgQU5BTFlTRV9QUk9NUFQgPSBbXG4gIFwiRHUgYmlzdCBkZXIgU3BhcnJpbmdzcGFydG5lciBpbiBlaW5lbSBldmlkZW56YmFzaWVydGVuIEpvdXJuYWxpbmctU3lzdGVtIG5hbWVucyBBcmlhZG5lLlwiLFxuICBcIkdydW5kaGFsdHVuZzoga29sbGVnaWFsLCBwcmFlemlzZSwgaGFydCBpbiBkZXIgU2FjaGUsIGhlcnpsaWNoIGluIGRlciBGb3JtLiBEdSBiaXN0IGtlaW4gVGhlcmFwZXV0LlwiLFxuICBcIlwiLFxuICBcIkF1ZmdhYmU6IEFuYWx5c2llcmUgZGllIEFLVFVFTExFIE5PVElaLiBEZXIgS09OVEVYVCBmcmVpZ2VnZWJlbmVyIE5vdGl6ZW4gaXN0IEhpbnRlcmdydW5kLCBuaWNodCBIYXVwdG9iamVrdC5cIixcbiAgXCJcIixcbiAgXCJSZWdlbG46XCIsXG4gIFwiMS4gTnVyIGJlbGVnYmFyZSBCZW9iYWNodHVuZ2VuOiB2ZXJ3ZWlzZSBhdWYga29ua3JldGUgU3RlbGxlbiBkZXIgTm90aXogKFppdGF0ZSwgWmFobGVuLCBGcm9udG1hdHRlci1XZXJ0ZSkuXCIsXG4gIFwiMi4gU3VjaGUgYWt0aXYgbmFjaCBHZWdlbmJlaXNwaWVsZW4sIGJldm9yIGR1IGVpbiBNdXN0ZXIgYmVoYXVwdGVzdCAoQmVzdGFldGlndW5nc2ZlaGxlci1CcmVtc2UpLlwiLFxuICBcIjMuIFdlbm4gRnJvbnRtYXR0ZXItV2VydGUgdm9yaGFuZGVuIHNpbmQgKFNsaWRlciwgdHlwKTogcHJ1ZWZlLCBvYiBzaWUgenVtIFRvbiBkZXMgVGV4dGVzIHBhc3Nlbi4gRGlza3JlcGFuemVuIGJlbmVubnN0IGR1IGRpcmVrdC5cIixcbiAgXCI0LiBTcHJpY2ggRmFrdGVuIFVORCBHZWZ1ZWhsZSBhbiwgbmllIG51ciBlaW5lcyB2b24gYmVpZGVtLlwiLFxuICBcIjUuIEtlaW5lIERpYWdub3Nlbiwga2VpbmUgVGhlcmFwaWV2b3JzY2hsYWVnZSwga2VpbmUgU2VsYnN0b3B0aW1pZXJ1bmdzLVJoZXRvcmlrLlwiLFxuICBcIjYuIEJlaSBha3V0ZW4gS3Jpc2Vuc2lnbmFsZW4gaW4gZGVyIE5vdGl6OiB1bnRlcmJyaWNoIGRpZSBBbmFseXNlLCBiZW5lbm5lIGtsYXIgdW5kIHJlc3Bla3R2b2xsIGRpZSBHcmVuemUgdW5kIHZlcndlaXNlIGF1ZiBUZWxlZm9uc2VlbHNvcmdlICgwODAwIDExMSAwIDExMSwgMDgwMCAxMTEgMCAyMjIpIHVuZCBpbSBOb3RmYWxsIDExMi5cIixcbiAgXCI3LiBNYXhpbWFsIGRyZWkgQmVvYmFjaHR1bmdlbiBvZGVyIE11c3Rlci1IeXBvdGhlc2VuLCBkYW5uIGdlbmF1IGVpbmUgb2ZmZW5lIEZyYWdlLlwiLFxuICBcIlwiLFxuICBcIlN0cnVrdHVyIGRlaW5lciBBbnR3b3J0OlwiLFxuICBcIkJlb2JhY2h0dW5nZW46IChrdXJ6ZSBMaXN0ZSBtaXQgQmVsZWdlbilcIixcbiAgXCJBdWZmYWVsbGlnOiAobWF4aW1hbCB6d2VpIEh5cG90aGVzZW4sIGplZGUgbWl0IEdlZ2VuYmVpc3BpZWwtUHJ1ZWZ1bmcpXCIsXG4gIFwiRnJhZ2U6IChnZW5hdSBlaW5lLCB6dW0gV2VpdGVyZGVua2VuKVwiLFxuICBcIlwiLFxuICBcIkFudHdvcnRlIGF1ZiBEZXV0c2NoIHVuZCBibGVpYmUgdW50ZXIgMjUwIFdvZXJ0ZXJuLlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbmludGVyZmFjZSBSZWZsZXhpb25zU2Nocml0dCB7XG4gIHRpdGVsOiBzdHJpbmc7XG4gIGFubGVpdHVuZzogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBSZWZsZXhpb25zUHJvdG9rb2xsIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBzY2hyaXR0ZTogUmVmbGV4aW9uc1NjaHJpdHRbXTtcbn1cblxuY29uc3QgUFJPVE9LT0xMRTogUmVmbGV4aW9uc1Byb3Rva29sbFtdID0gW1xuICB7XG4gICAgaWQ6IFwicGVubmViYWtlci1lcGlzb2RlXCIsXG4gICAgbmFtZTogXCJQZW5uZWJha2VyLUVwaXNvZGUgKDMgU2Nocml0dGUsIGplIDE1IGJpcyAyMCBNaW51dGVuLCBhbiBhdWZlaW5hbmRlcmZvbGdlbmRlbiBUYWdlbilcIixcbiAgICBzY2hyaXR0ZTogW1xuICAgICAge1xuICAgICAgICB0aXRlbDogXCJGYWt0ZW5cIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJXYWVobGUgRUlORSBrb25rcmV0ZSBFcGlzb2RlIGRlciBsZXR6dGVuIHNpZWJlbiBUYWdlLlwiLFxuICAgICAgICAgIFwiU2NocmVpYmUgMTUgYmlzIDIwIE1pbnV0ZW4gbnVyIGRhcnVlYmVyLCB3YXMgdGF0c2FlY2hsaWNoIHBhc3NpZXJ0IGlzdDogT3J0LCBCZXRlaWxpZ3RlLCBBYmxhdWYsIERlaW5lIEhhbmRsdW5nZW4uIEtlaW5lIEJld2VydHVuZywga2VpbmUgRGV1dHVuZy4gRWluZSBGYWt0ZW5sYWdlIHdpZSBlaW4gUHJvdG9rb2xsLlwiXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIkdlZnVlaGxlIHVuZCBLb2VycGVyXCIsXG4gICAgICAgIGFubGVpdHVuZzogW1xuICAgICAgICAgIFwiTmltbSBkaWVzZWxiZSBFcGlzb2RlIGVybmV1dC5cIixcbiAgICAgICAgICBcIlNjaHJlaWJlIDE1IGJpcyAyMCBNaW51dGVuIGRpZXNtYWwgbnVyIHVlYmVyIERlaW5lIEdlZnVlaGxlIHVuZCBEZWluZSBLb2VycGVyZXJmYWhydW5nOiBXYXMgaGFzdCBEdSBpbiBkZXIgU2l0dWF0aW9uIGdlZnVlaGx0LCB3byBpbSBLb2VycGVyIGhhc3QgRHUgZXMgZ2VzcHVlcnQsIHdhcyBkYXZvbiBpc3QgaGV1dGUgbm9jaCBkYS4gRmFrdGVuIG51ciBhbHMgQW5rZXIsIHdlbm4gRHUgc2llIGJyYXVjaHN0LlwiXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIlZlcmtudWVwZnVuZyB1bmQgUGVyc3Bla3RpdmVcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJadW0gZHJpdHRlbiBNYWwgZGllc2VsYmUgRXBpc29kZTogV2FzIGJlZGV1dGVuIEZha3RlbiB1bmQgR2VmdWVobGUgenVzYW1tZW4/XCIsXG4gICAgICAgICAgXCJXYXMgd3VlcmRlIGVpbiBhdXNzZW5zdGVoZW5kZXIsIHdvaGx3b2xsZW5kZXIgQmVvYmFjaHRlciBzZWhlbj8gV2VsY2hlciBuYWVjaHN0ZSBTY2hyaXR0IGVyZ2lidCBzaWNoPyBTY2hsaWVzc2UgbWl0IGVpbmVtIFNhdHosIGRlbiBEdSBpbiB6d2VpIFdvY2hlbiB3aWVkZXJsZXNlbiB3aWxsc3QuXCJcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIGlkOiBcIm51Y2xlYXItZXBpc29kZXNcIixcbiAgICBuYW1lOiBcIk51Y2xlYXIgRXBpc29kZXMgKHByYWVnZW5kZSBXZW5kZXB1bmt0ZSwgMjAgYmlzIDMwIE1pbnV0ZW4pXCIsXG4gICAgc2Nocml0dGU6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiV2VuZGVwdW5rdGVcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJEZW5rZSBhbiB6d2VpIGJpcyBkcmVpIHByYWVnZW5kZSBXZW5kZXB1bmt0ZSBkZWluZXMgTGViZW5zd2VncywgaW5zYmVzb25kZXJlIGRlciBsZXR6dGVuIEphaHJlLlwiLFxuICAgICAgICAgIFwiQmVzY2hyZWliZSBmdWVyIGplZGVuOiBXYXMgZ2VzY2hhaCwgd2FzIGhhZXR0ZXN0IGR1IGRpciBkYW1hbHMgZ2V3dWVuc2NodCwgd2FzIGhhdCBzaWNoIGRhcmF1cyBlbnR3aWNrZWx0LCB1bmQgd2VsY2hlIEFobnVuZyBoYXN0IGR1IGhldXRlLCB3b3p1IGVzIGd1dCB3YXIgb2RlciBub2NoIHdlcmRlbiBrb2VubnRlLlwiLFxuICAgICAgICAgIFwiTmltbSBkaXIgZGFmdWVyIDIwIGJpcyAzMCBNaW51dGVuIGluIFJ1aGUuXCJcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfVxuXTtcblxuY2xhc3MgVHlwTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9uQ2hvb3NlOiAodHlwOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIk5vdGl6IGZ1ZXIgQXJpYWRuZSBmcmVpZ2ViZW5cIiB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIldlbGNoZXIgQXJ0IGlzdCBkaWVzZSBOb3Rpej8gRGVyIFR5cCBzdGV1ZXJ0IGRpZSBzcGFldGVyZSBBdXN3ZXJ0dW5nLlwiIH0pO1xuICAgIGNvbnN0IHplaWxlID0gbmV3IFNldHRpbmcodGhpcy5jb250ZW50RWwpO1xuICAgIGZvciAoY29uc3QgdCBvZiBUWVBFTikge1xuICAgICAgemVpbGUuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQodCkub25DbGljaygoKSA9PiB7IHRoaXMub25DaG9vc2UodCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBSZWZsZXhpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcGx1Z2luOiBBcmlhZG5lUGx1Z2luLCBwcml2YXRlIHByb3Rva29sbDogUmVmbGV4aW9uc1Byb3Rva29sbCwgcHJpdmF0ZSBpZHg6IG51bWJlcikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgcyA9IHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlW3RoaXMuaWR4XTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogdGhpcy5wcm90b2tvbGwubmFtZSB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlNjaHJpdHQgXCIgKyAodGhpcy5pZHggKyAxKSArIFwiIHZvbiBcIiArIHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlLmxlbmd0aCArIFwiOiBcIiArIHMudGl0ZWwgfSk7XG4gICAgZm9yIChjb25zdCBhIG9mIHMuYW5sZWl0dW5nKSB7XG4gICAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBhIH0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5pbW0gZGlyIGRpZSBaZWl0IGluIFJ1aGUuIEVpbiBTY2hyaXR0IHBybyBUYWcsIG5pY2h0IG1laHIuXCIgfSk7XG4gICAgbmV3IFNldHRpbmcodGhpcy5jb250ZW50RWwpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJTaXR6dW5nIHN0YXJ0ZW5cIikuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7IGF3YWl0IHRoaXMucGx1Z2luLnN0YXJ0ZVNpdHp1bmcodGhpcy5wcm90b2tvbGwsIHRoaXMuaWR4KTsgdGhpcy5jbG9zZSgpOyB9KSlcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIlNjaHJpdHQgYWJzY2hsaWVzc2VuXCIpLm9uQ2xpY2soYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5zY2hyaXR0QWJzY2hsaWVzc2VuKHRoaXMucHJvdG9rb2xsLCB0aGlzLmlkeCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICB9XG59XG5cbmNsYXNzIEFyaWFkbmVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHBsdWdpbjogQXJpYWRuZVBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKSB7XG4gICAgY29uc3QgYyA9IHRoaXMuY29udGFpbmVyRWw7XG4gICAgYy5lbXB0eSgpO1xuICAgIGMuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQXJpYWRuZVwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJFbmRwdW5rdFwiKS5zZXREZXNjKFwiT3BlbkFJLWtvbXBhdGlibGVyIGxva2FsZXIgRW5kcHVua3QuIFN0YW5kYXJkOiBPbGxhbWEgYXVmIGRpZXNlbSBHZXJhZXQuXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRQbGFjZWhvbGRlcihcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIikuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5kcG9pbnQpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmRwb2ludCA9IHYudHJpbSgpOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJNb2RlbGxcIikuc2V0RGVzYyhcInouQi4gbGxhbWEzLjIsIG1pc3RyYWwtc21hbGxcIilcbiAgICAgIC5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZWwgPSB2LnRyaW0oKTsgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiVGVtcGVyYXR1clwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnRlbXBlcmF0dXJlKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGNvbnN0IG4gPSBwYXJzZUZsb2F0KHYucmVwbGFjZShcIixcIiwgXCIuXCIpKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGVyYXR1cmUgPSBpc05hTihuKSA/IDAuNCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIktvbnRleHQgZnJlaWdlZ2ViZW5lciBOb3RpemVuXCIpLnNldERlc2MoXCJCZWkgamVkZXIgQW5hbHlzZTogS29udGV4dCBhdXMgZnJlaWdlZ2ViZW5lbiBOb3RpemVuIGRlc3NlbGJlbiBWYXVsdHMgZWluYmV6aWVoZW4uXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbilcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbiA9IHY7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFuemFobCBLb250ZXh0bm90aXplblwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRBbnphaGwpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgY29uc3QgbiA9IHBhcnNlSW50KHYsIDEwKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua29udGV4dEFuemFobCA9IGlzTmFOKG4pID8gOCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgY29uc3QgZHJvcCA9IG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJSZWZsZXhpb25zcHJvdG9rb2xsXCIpLnNldERlc2MoXCJEZXIgUGZhZCwgZGVuIFJlZmxla3RpZXJlbiB3ZWl0ZXJmdWVocnQuXCIpO1xuICAgIGRyb3AuYWRkRHJvcGRvd24oKGQpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBQUk9UT0tPTExFKSB7IGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7IH1cbiAgICAgIGQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsID0gdjsgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2Nocml0dCA9IDA7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB0aGlzLmRpc3BsYXkoKTsgfSk7XG4gICAgfSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFrdHVlbGxlciBTY2hyaXR0XCIpLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnNjaHJpdHQgKyAxKSkuc2V0RGlzYWJsZWQodHJ1ZSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJLcmlzZW53ZWl0ZXJsZWl0dW5nXCIpLnNldERlc2MoXCJCZWkgS3Jpc2Vuc2lnbmFsZW4gYnJpY2h0IGplZGUgQXJpYWRuZS1BbmFseXNlIGFiLiBUZWxlZm9uc2VlbHNvcmdlOiAwODAwIDExMSAwIDExMSBvZGVyIDA4MDAgMTExIDAgMjIyLiBJbSBha3V0ZW4gTm90ZmFsbDogMTEyLlwiKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmlhZG5lUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEFyaWFkbmVTZXR0aW5ncztcblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwiZ2l0LWJyYW5jaFwiLCBcIkFyaWFkbmVcIiwgKGV2dDogTW91c2VFdmVudCkgPT4gdGhpcy5vZWZmbmVNZW51ZShldnQpKTtcbiAgICB0aGlzLmFkZENvbW1hbmQoeyBpZDogXCJhcmlhZG5lLW1hcmtpZXJ1bmdcIiwgbmFtZTogXCJBcmlhZG5lOiBNYXJraWVydW5nIHVtc2NoYWx0ZW5cIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlTWFya2llcnVuZygpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtYW5hbHlzZVwiLCBuYW1lOiBcIkFyaWFkbmU6IEFiZnJhZ2UgaW4gZGllc2VyIE5vdGl6IHZlcmFua2VyblwiLCBlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yKSA9PiB0aGlzLnZlcmFua2VybihlZGl0b3IpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtcmVmbGVrdGllcmVuXCIsIG5hbWU6IFwiQXJpYWRuZTogUmVmbGVrdGllcmVuIC0gbmFlY2hzdGVyIFNjaHJpdHRcIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkgfSk7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImVkaXRvci1tZW51XCIsIChtZW51OiBNZW51KSA9PiB7XG4gICAgICBtZW51LmFkZFNlcGFyYXRvcigpO1xuICAgICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiQXJpYWRuZTogbWFya2llcmVuXCIpLnNldEljb24oXCJib29rbWFya1wiKS5vbkNsaWNrKCgpID0+IHRoaXMudG9nZ2xlTWFya2llcnVuZygpKSk7XG4gICAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBcmlhZG5lOiBBYmZyYWdlIHZlcmFua2VyblwiKS5zZXRJY29uKFwic3BhcmtsZXNcIikub25DbGljaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgICAgICBpZiAodmlldykgeyB0aGlzLnZlcmFua2Vybih2aWV3LmVkaXRvcik7IH1cbiAgICAgIH0pKTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFyaWFkbmU6IFJlZmxla3RpZXJlblwiKS5zZXRJY29uKFwiZm9vdHByaW50c1wiKS5vbkNsaWNrKCgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkpKTtcbiAgICB9KSk7XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBcmlhZG5lU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBwcml2YXRlIG9lZmZuZU1lbnVlKGV2dDogTW91c2VFdmVudCkge1xuICAgIGNvbnN0IG1lbnUgPSBuZXcgTWVudSgpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIk1hcmtpZXJ1bmcgdW1zY2hhbHRlblwiKS5zZXRJY29uKFwiYm9va21hcmtcIikub25DbGljaygoKSA9PiB0aGlzLnRvZ2dsZU1hcmtpZXJ1bmcoKSkpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFiZnJhZ2UgaW4gZGllc2VyIE5vdGl6IHZlcmFua2VyblwiKS5zZXRJY29uKFwic3BhcmtsZXNcIikub25DbGljaygoKSA9PiB7XG4gICAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgIGlmICh2aWV3KSB7IHRoaXMudmVyYW5rZXJuKHZpZXcuZWRpdG9yKTsgfSBlbHNlIHsgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtlaW5lIE5vdGl6IGltIEZva3VzLlwiKTsgfVxuICAgIH0pKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJSZWZsZWt0aWVyZW4gLSBuYWVjaHN0ZXIgU2Nocml0dFwiKS5zZXRJY29uKFwiZm9vdHByaW50c1wiKS5vbkNsaWNrKCgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkpKTtcbiAgICBtZW51LmFkZFNlcGFyYXRvcigpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkVya2VubnRuaXNzZSBnZXdpbm5lbiAoTTQpXCIpLm9uQ2xpY2soKCkgPT4gbmV3IE5vdGljZShcIkFyaWFkbmU6IEVya2VubnRuaXNzZSBnZXdpbm5lbiBmb2xndCBhbHMgTTQuIEJpcyBkYWhpbjogQ29waWxvdCBmb3IgT2JzaWRpYW4gbWl0IGRlbSBTcGFycmluZy1Qcm9tcHQuXCIpKSk7XG4gICAgbWVudS5zaG93QXRNb3VzZUV2ZW50KGV2dCk7XG4gIH1cblxuICBwcml2YXRlIGZyb250bWF0dGVyVm9uKGZpbGU6IFRGaWxlKTogYW55IHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgIGlmIChjYWNoZSAmJiBjYWNoZS5mcm9udG1hdHRlcikgeyByZXR1cm4gY2FjaGUuZnJvbnRtYXR0ZXI7IH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZU1hcmtpZXJ1bmcoKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgY29uc3QgZmlsZSA9IHZpZXcgPyB2aWV3LmZpbGUgOiB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghZmlsZSkgeyBuZXcgTm90aWNlKFwiQXJpYWRuZTogS2VpbmUgYWt0aXZlIE5vdGl6LlwiKTsgcmV0dXJuOyB9XG4gICAgY29uc3QgZm0gPSB0aGlzLmZyb250bWF0dGVyVm9uKGZpbGUpO1xuICAgIGlmIChmbSAmJiBmbVtcImFyaWFkbmVcIl0gPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gZmFsc2U7IH0pO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE1hcmtpZXJ1bmcgZW50ZmVybnQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0eXAgPSBmbSA/IGZtW1widHlwXCJdIDogbnVsbDtcbiAgICBpZiAodHlwKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IHRydWU7IH0pO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5vdGl6IGZyZWlnZWdlYmVuICh0eXA6IFwiICsgU3RyaW5nKHR5cCkgKyBcIikuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXcgVHlwTW9kYWwodGhpcy5hcHAsIGFzeW5jICh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmOiBhbnkpID0+IHsgZltcImFyaWFkbmVcIl0gPSB0cnVlOyBmW1widHlwXCJdID0gdDsgfSk7XG4gICAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBOb3RpeiBmcmVpZ2VnZWJlbiBhbHMgXCIgKyB0ICsgXCIuXCIpO1xuICAgICAgfSkub3BlbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZnJlaWdlZ2ViZW5lRGF0ZWllbigpOiBURmlsZVtdIHtcbiAgICByZXR1cm4gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpLmZpbHRlcigoZikgPT4ge1xuICAgICAgY29uc3QgZm0gPSB0aGlzLmZyb250bWF0dGVyVm9uKGYpO1xuICAgICAgcmV0dXJuIGZtICE9PSBudWxsICYmIGZtW1wiYXJpYWRuZVwiXSA9PT0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMga29udGV4dEJpbGRlbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGRhdGVpZW4gPSB0aGlzLmZyZWlnZWdlYmVuZURhdGVpZW4oKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGIuc3RhdC5tdGltZSAtIGEuc3RhdC5tdGltZSlcbiAgICAgIC5zbGljZSgwLCB0aGlzLnNldHRpbmdzLmtvbnRleHRBbnphaGwpO1xuICAgIGNvbnN0IHRlaWxlOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZCBvZiBkYXRlaWVuKSB7XG4gICAgICBjb25zdCBmbSA9IHRoaXMuZnJvbnRtYXR0ZXJWb24oZCk7XG4gICAgICBjb25zdCB0eXAgPSBmbSAmJiBmbVtcInR5cFwiXSA/IFN0cmluZyhmbVtcInR5cFwiXSkgOiBcIm9obmUtdHlwXCI7XG4gICAgICBsZXQgdGV4dCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZCk7XG4gICAgICBpZiAodGV4dC5sZW5ndGggPiAxMjAwKSB7IHRleHQgPSB0ZXh0LnNsaWNlKDAsIDEyMDApICsgXCIgLi4uXCI7IH1cbiAgICAgIHRlaWxlLnB1c2goXCItLS0gTm90aXo6IFwiICsgZC5iYXNlbmFtZSArIFwiICh0eXA6IFwiICsgdHlwICsgXCIpIC0tLVwiKTtcbiAgICAgIHRlaWxlLnB1c2godGV4dCk7XG4gICAgfVxuICAgIHJldHVybiB0ZWlsZS5qb2luKFwiXFxuXFxuXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBrcmlzZW5jaGVjayh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB0ID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBLUklTVEVSTUUuc29tZSgoaykgPT4gdC5pbmNsdWRlcyhrKSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG9sbGFtYUNoYXQocHJvbXB0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHVybCA9IHRoaXMuc2V0dGluZ3MuZW5kcG9pbnQgKyBcIi92MS9jaGF0L2NvbXBsZXRpb25zXCI7XG4gICAgY29uc3QgYm9keSA9IEpTT04uc3RyaW5naWZ5KHsgbW9kZWw6IHRoaXMuc2V0dGluZ3MubW9kZWwsIG1lc3NhZ2VzOiBbeyByb2xlOiBcInVzZXJcIiwgY29udGVudDogcHJvbXB0IH1dLCB0ZW1wZXJhdHVyZTogdGhpcy5zZXR0aW5ncy50ZW1wZXJhdHVyZSwgc3RyZWFtOiBmYWxzZSB9KTtcbiAgICBjb25zdCByZXMgPSBhd2FpdCByZXF1ZXN0VXJsKHsgdXJsOiB1cmwsIG1ldGhvZDogXCJQT1NUXCIsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSwgYm9keTogYm9keSwgdGhyb3c6IGZhbHNlIH0pO1xuICAgIGlmIChyZXMuc3RhdHVzID49IDQwMCkgeyB0aHJvdyBuZXcgRXJyb3IoXCJIVFRQIFwiICsgcmVzLnN0YXR1cyArIFwiIHZvbiBcIiArIHVybCk7IH1cbiAgICBjb25zdCBkYXRhID0gcmVzLmpzb247XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5jaG9pY2VzICYmIGRhdGEuY2hvaWNlcy5sZW5ndGggPiAwICYmIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlICYmIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBTdHJpbmcoZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZ3VlbHRpZ2UgQW50d29ydCB2b20gRW5kcHVua3QuXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBiYXVlQmxvY2soYW50d29ydDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB6ZWlsZW4gPSBhbnR3b3J0LnNwbGl0KFwiXFxuXCIpLm1hcCgobDogc3RyaW5nKSA9PiBsLnRyaW0oKS5sZW5ndGggPiAwID8gXCI+IFwiICsgbC50cmltKCkgOiBcIj5cIik7XG4gICAgY29uc3Qga29wZjogc3RyaW5nW10gPSBbXG4gICAgICBNQVJLRVIsXG4gICAgICBcIj4gWyFhcmlhZG5lXSBBcmlhZG5lLUFuYWx5c2VcIixcbiAgICAgIFwiPiBFcnN0ZWxsdDogXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpICsgXCIgfCBNb2RlbGw6IFwiICsgdGhpcy5zZXR0aW5ncy5tb2RlbCArIFwiIHwgUHJvbXB0OiBhbmFseXNlLXYxXCJcbiAgICBdO1xuICAgIHJldHVybiBrb3BmLmNvbmNhdCh6ZWlsZW4pLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBwcml2YXRlIHNldHplQmxvY2soZWRpdG9yOiBFZGl0b3IsIGJsb2NrOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaW5lcyA9IGVkaXRvci5nZXRWYWx1ZSgpLnNwbGl0KFwiXFxuXCIpO1xuICAgIGxldCBzdGFydCA9IC0xO1xuICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGkgPSBpIC0gMSkge1xuICAgICAgaWYgKGxpbmVzW2ldLnRyaW0oKSA9PT0gTUFSS0VSKSB7IHN0YXJ0ID0gaTsgYnJlYWs7IH1cbiAgICB9XG4gICAgaWYgKHN0YXJ0ID09PSAtMSkge1xuICAgICAgY29uc3QgbGFzdCA9IGVkaXRvci5sYXN0TGluZSgpO1xuICAgICAgY29uc3QgbGVuID0gZWRpdG9yLmdldExpbmUobGFzdCkubGVuZ3RoO1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShcIlxcblxcblwiICsgYmxvY2ssIHsgbGluZTogbGFzdCwgY2g6IGxlbiB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGVuZCA9IHN0YXJ0O1xuICAgIGZvciAobGV0IGkgPSBzdGFydCArIDE7IGkgPCBsaW5lcy5sZW5ndGg7IGkgPSBpICsgMSkge1xuICAgICAgY29uc3QgbCA9IGxpbmVzW2ldLnRyaW0oKTtcbiAgICAgIGlmIChsLmxlbmd0aCA9PT0gMCB8fCBsLnNsaWNlKDAsIDEpID09PSBcIj5cIiB8fCBsLnNsaWNlKDAsIDIpID09PSBcIiUlXCIpIHsgZW5kID0gaTsgfSBlbHNlIHsgYnJlYWs7IH1cbiAgICB9XG4gICAgaWYgKGVuZCA+PSBsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGJsb2NrLCB7IGxpbmU6IHN0YXJ0LCBjaDogMCB9LCB7IGxpbmU6IGxpbmVzLmxlbmd0aCAtIDEsIGNoOiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGggfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoYmxvY2ssIHsgbGluZTogc3RhcnQsIGNoOiAwIH0sIHsgbGluZTogZW5kICsgMSwgY2g6IDAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdmVyYW5rZXJuKGVkaXRvcjogRWRpdG9yIHwgbnVsbCkge1xuICAgIGlmICghZWRpdG9yKSB7IG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLZWluZSBOb3RpeiBpbSBGb2t1cy5cIik7IHJldHVybjsgfVxuICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICBpZiAodGhpcy5rcmlzZW5jaGVjayh0ZXh0KSkge1xuICAgICAgdGhpcy5zZXR6ZUJsb2NrKGVkaXRvciwgW1xuICAgICAgICBNQVJLRVIsXG4gICAgICAgIFwiPiBbIXdhcm5pbmddIEdyZW56ZSBlcnJlaWNodFwiLFxuICAgICAgICBcIj4gQXJpYWRuZSBlcmtlbm50IGVpbiBha3V0ZXMgS3Jpc2Vuc2lnbmFsIGluIGRpZXNlciBOb3RpeiB1bmQgYmVlbmRldCBkaWUgQXVzd2VydHVuZyBoaWVyLlwiLFxuICAgICAgICBcIj4gVGVsZWZvbnNlZWxzb3JnZTogMDgwMCAxMTEgMCAxMTEgb2RlciAwODAwIDExMSAwIDIyMiAocnVuZCB1bSBkaWUgVWhyLCBrb3N0ZW5sb3MsIGFub255bSkuIEltIGFrdXRlbiBOb3RmYWxsOiAxMTIuXCIsXG4gICAgICAgIFwiPiBBcmlhZG5lIGlzdCBXZXJremV1ZywgbmljaHQgVGhlcmFwaWUuIEJpdHRlIGhvbCBkaXIgVW50ZXJzdHVldHp1bmcuXCJcbiAgICAgIF0uam9pbihcIlxcblwiKSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogS3Jpc2Vuc2lnbmFsIGVya2FubnQgLSBBbmFseXNlIGJlZW5kZXQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbQU5BTFlTRV9QUk9NUFRdO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbikge1xuICAgICAgY29uc3Qga29udGV4dCA9IGF3YWl0IHRoaXMua29udGV4dEJpbGRlbigpO1xuICAgICAgaWYgKGtvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICBwYXJ0cy5wdXNoKFwiS09OVEVYVCBBVVMgRlJFSUdFR0VCRU5FTiBOT1RJWkVOIChIaW50ZXJncnVuZCk6XCIpO1xuICAgICAgICBwYXJ0cy5wdXNoKGtvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBwYXJ0cy5wdXNoKFwiQUtUVUVMTEUgTk9USVo6XCIpO1xuICAgIHBhcnRzLnB1c2godGV4dCk7XG4gICAgY29uc3QgcHJvbXB0ID0gcGFydHMuam9pbihcIlxcblxcblwiKTtcbiAgICBjb25zdCBuID0gbmV3IE5vdGljZShcIkFyaWFkbmUgYW5hbHlzaWVydCAuLi5cIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFudHdvcnQgPSBhd2FpdCB0aGlzLm9sbGFtYUNoYXQocHJvbXB0KTtcbiAgICAgIG4uaGlkZSgpO1xuICAgICAgdGhpcy5zZXR6ZUJsb2NrKGVkaXRvciwgdGhpcy5iYXVlQmxvY2soYW50d29ydCkpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEFuYWx5c2UgdmVyYW5rZXJ0LlwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuLmhpZGUoKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBFbmRwdW5rdCBuaWNodCBlcnJlaWNoYmFyIG9kZXIgRmVobGVyIC0gXCIgKyAoZSAmJiBlLm1lc3NhZ2UgPyBlLm1lc3NhZ2UgOiBcInVuYmVrYW5udFwiKSk7XG4gICAgfVxuICB9XG5cbiAgcmVmbGVrdGllcmVuKCkge1xuICAgIGNvbnN0IHAgPSBQUk9UT0tPTExFLmZpbmQoKHgpID0+IHguaWQgPT09IHRoaXMuc2V0dGluZ3MucHJvdG9rb2xsKTtcbiAgICBjb25zdCBwcm90ID0gcCA/IHAgOiBQUk9UT0tPTExFWzBdO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLnNjaHJpdHQgPj0gcHJvdC5zY2hyaXR0ZS5sZW5ndGgpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBQcm90b2tvbGwgYWJnZXNjaGxvc3Nlbi4gU2V0emUgZGVuIFNjaHJpdHQgaW4gZGVuIEVpbnN0ZWxsdW5nZW4genVydWVjayBvZGVyIHdlY2hzbGUgZGFzIFByb3Rva29sbC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5ldyBSZWZsZXhpb25Nb2RhbCh0aGlzLmFwcCwgdGhpcywgcHJvdCwgdGhpcy5zZXR0aW5ncy5zY2hyaXR0KS5vcGVuKCk7XG4gIH1cblxuICBhc3luYyBzdGFydGVTaXR6dW5nKHA6IFJlZmxleGlvbnNQcm90b2tvbGwsIGlkeDogbnVtYmVyKSB7XG4gICAgY29uc3QgcyA9IHAuc2Nocml0dGVbaWR4XTtcbiAgICBjb25zdCBpc28gPSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuICAgIGNvbnN0IHBmYWQgPSBcInJlZmxleGlvbmVuL1wiICsgaXNvICsgXCItXCIgKyBwLmlkICsgXCItXCIgKyAoaWR4ICsgMSkgKyBcIi5tZFwiO1xuICAgIGNvbnN0IHplaWxlbjogc3RyaW5nW10gPSBbXG4gICAgICBcIi0tLVwiLFxuICAgICAgXCJ0eXA6IHJlZmxleGlvblwiLFxuICAgICAgXCJhcmlhZG5lOiB0cnVlXCIsXG4gICAgICBcInByb3Rva29sbDogXCIgKyBwLmlkLFxuICAgICAgXCJzY2hyaXR0OiBcIiArIChpZHggKyAxKSxcbiAgICAgIFwiZGF0dW06IFwiICsgaXNvLFxuICAgICAgXCJ6dXN0YW5kOiBnZXNwcm9jaGVuXCIsXG4gICAgICBcIi0tLVwiLFxuICAgICAgXCJcIixcbiAgICAgIFwiIyBcIiArIHMudGl0ZWwsXG4gICAgICBcIlwiXG4gICAgXS5jb25jYXQocy5hbmxlaXR1bmcpLmNvbmNhdChbXG4gICAgICBcIlwiLFxuICAgICAgXCIoMTUgYmlzIDIwIE1pbnV0ZW4sIG9obmUgUGF1c2UuIFRpcHBlbiBvZGVyIGRpa3RpZXJlbiAtIGJlaWRlcyB6YWVobHQuKVwiLFxuICAgICAgXCJcIlxuICAgIF0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKHBmYWQsIHplaWxlbi5qb2luKFwiXFxuXCIpKTtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKHRydWUpLm9wZW5GaWxlKGYpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFNpdHp1bmcgZ2VzdGFydGV0IC0gXCIgKyBzLnRpdGVsICsgXCIuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLb25udGUgZGllIFNpdHp1bmdzbm90aXogbmljaHQgYW5sZWdlbiAoZXhpc3RpZXJ0IHNpZSBzY2hvbj8pLlwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzY2hyaXR0QWJzY2hsaWVzc2VuKHA6IFJlZmxleGlvbnNQcm90b2tvbGwsIGlkeDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXR0aW5ncy5zY2hyaXR0ID0gaWR4ICsgMTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2hyaXR0ID49IHAuc2Nocml0dGUubGVuZ3RoKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogUHJvdG9rb2xsIGFiZ2VzY2hsb3NzZW4gLSBcIiArIHAubmFtZSArIFwiLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5hZWNoc3RlciBTY2hyaXR0IGlzdCBcIiArIHAuc2Nocml0dGVbdGhpcy5zZXR0aW5ncy5zY2hyaXR0XS50aXRlbCArIFwiLlwiKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUE2SDtBQVk3SCxJQUFNLG1CQUFvQztBQUFBLEVBQ3hDLFVBQVU7QUFBQSxFQUNWLE9BQU87QUFBQSxFQUNQLGFBQWE7QUFBQSxFQUNiLG9CQUFvQjtBQUFBLEVBQ3BCLGVBQWU7QUFBQSxFQUNmLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFDWDtBQUVBLElBQU0sUUFBa0IsQ0FBQyxXQUFXLFVBQVUsYUFBYSxTQUFTLFdBQVcsV0FBVztBQUUxRixJQUFNLFNBQVM7QUFHZixJQUFNLFlBQXNCO0FBQUEsRUFDMUI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUVBLElBQU0saUJBQWlCO0FBQUEsRUFDckI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFD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
