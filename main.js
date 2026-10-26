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
var KONTEXTE = ["Lehre", "Forschung", "Admin", "Sport", "Sozial", "Familie", "Allein"];
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
var CheckInModal = class extends import_obsidian.Modal {
  constructor(app, onFertig) {
    super(app);
    this.onFertig = onFertig;
    this.daten = { valence: 5, arousal: 5, belastung: 5, koerper: 5, kontexte: [], ausnahme: false };
  }
  baueSlider(container, titel, hinweis, onWert) {
    container.createEl("p", { text: titel + " (" + hinweis + ")" });
    const reihe = container.createEl("div", { cls: "ariadne-slider-zeile" });
    const input = reihe.createEl("input", { type: "range" });
    input.min = "0";
    input.max = "10";
    input.step = "1";
    input.value = "5";
    const anzeige = reihe.createEl("span", { text: "5" });
    input.addEventListener("input", () => {
      const n = parseInt(input.value, 10);
      anzeige.setText(String(n));
      onWert(n);
    });
  }
  onOpen() {
    const c = this.contentEl;
    c.createEl("h3", { text: "Abend-Check-in" });
    c.createEl("p", { text: "Vier Werte von 0 bis 10, dann die Kontexte des Tages. Der Eintrag wird unter eintraege/ als journal angelegt und fuer Auswertungen freigegeben." });
    this.baueSlider(c, "Valenz", "0 unangenehm, 10 angenehm", (n) => {
      this.daten.valence = n;
    });
    this.baueSlider(c, "Aktivierung", "0 ruhig, 10 aktiviert", (n) => {
      this.daten.arousal = n;
    });
    this.baueSlider(c, "Belastung", "0 entspannt, 10 angespannt", (n) => {
      this.daten.belastung = n;
    });
    this.baueSlider(c, "Koerper", "0 verspannt, 10 frei", (n) => {
      this.daten.koerper = n;
    });
    c.createEl("p", { text: "Kontexte heute (Mehrfachwahl)" });
    const kacheln = c.createEl("div", { cls: "ariadne-kacheln" });
    for (const k of KONTEXTE) {
      const b = kacheln.createEl("button", { text: k, cls: "ariadne-kachel" });
      b.type = "button";
      b.addEventListener("click", () => {
        const pos = this.daten.kontexte.indexOf(k);
        if (pos === -1) {
          this.daten.kontexte.push(k);
          b.addClass("ariadne-kachel-aktiv");
        } else {
          this.daten.kontexte.splice(pos, 1);
          b.removeClass("ariadne-kachel-aktiv");
        }
      });
    }
    new import_obsidian.Setting(c).setName("Ausnahme-Ereignis").setDesc("Etwas Aussergewoehnliches ist heute passiert.").addToggle((t) => t.setValue(false).onChange((v) => {
      this.daten.ausnahme = v;
    }));
    new import_obsidian.Setting(c).addButton((b) => b.setButtonText("Eintrag anlegen").setCta().onClick(() => {
      this.onFertig(this.daten);
      this.close();
    })).addButton((b) => b.setButtonText("Abbrechen").onClick(() => this.close()));
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
    this.addCommand({ id: "ariadne-checkin", name: "Ariadne: Neuer Check-in (Abend)", callback: () => this.oeffneCheckIn() });
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
    menu.addItem((i) => i.setTitle("Neuer Check-in (Abfrage)").setIcon("activity").onClick(() => this.oeffneCheckIn()));
    menu.addSeparator();
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
    menu.addItem((i) => i.setTitle("Chat mit dem lokalen Modell (folgt)").setIcon("message-circle").onClick(() => new import_obsidian.Notice("Ariadne: Der Chat folgt als M4. Bis dahin: Copilot for Obsidian mit dem Sparring-Prompt.")));
    menu.showAtMouseEvent(evt);
  }
  oeffneCheckIn() {
    new CheckInModal(this.app, async (d) => {
      await this.erstelleCheckIn(d);
    }).open();
  }
  async erstelleCheckIn(d) {
    const iso = (0, import_obsidian.moment)().format("YYYY-MM-DD");
    const pfad = "eintraege/" + iso + ".md";
    if (await this.app.vault.adapter.exists(pfad)) {
      new import_obsidian.Notice("Ariadne: Fuer heute existiert schon ein Check-in.");
      return;
    }
    const kontexte = d.kontexte.length === 0 ? "[]" : "[" + d.kontexte.join(", ") + "]";
    const baseline = [
      "Valenz " + String(d.valence) + "/10 (0 unangenehm, 10 angenehm)",
      "Aktivierung " + String(d.arousal) + "/10 (0 ruhig, 10 aktiviert)",
      "Belastung " + String(d.belastung) + "/10 (0 entspannt, 10 angespannt)",
      "Koerper " + String(d.koerper) + "/10 (0 verspannt, 10 frei)"
    ].join(", ");
    const zeilen = [
      "---",
      "typ: journal",
      "ariadne: true",
      "datum: " + iso,
      "zustand: gesprochen",
      "valence: " + String(d.valence),
      "arousal: " + String(d.arousal),
      "belastung: " + String(d.belastung),
      "koerper: " + String(d.koerper),
      "kontexte: " + kontexte,
      "ausnahme: " + (d.ausnahme ? "true" : "false"),
      "---",
      "",
      "## Baseline",
      "",
      baseline,
      "",
      "Kontexte: " + (d.kontexte.length === 0 ? "keine" : d.kontexte.join(", ")) + (d.ausnahme ? " | Ausnahme-Ereignis" : ""),
      "",
      "## Was war heute",
      "",
      "Fakten: Was ist passiert?",
      "",
      "Gefuehle: Was hat es mit mir gemacht?",
      ""
    ];
    try {
      const f = await this.app.vault.create(pfad, zeilen.join("\n"));
      await this.app.workspace.getLeaf(true).openFile(f);
      new import_obsidian.Notice("Ariadne: Check-in angelegt und freigegeben.");
    } catch (e) {
      new import_obsidian.Notice("Ariadne: Konnte den Check-in nicht anlegen.");
    }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1lbnUsIE1vZGFsLCBtb21lbnQsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCByZXF1ZXN0VXJsLCBTZXR0aW5nLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5pbnRlcmZhY2UgQXJpYWRuZVNldHRpbmdzIHtcbiAgZW5kcG9pbnQ6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAga29udGV4dEVpbmJlemllaGVuOiBib29sZWFuO1xuICBrb250ZXh0QW56YWhsOiBudW1iZXI7XG4gIHByb3Rva29sbDogc3RyaW5nO1xuICBzY2hyaXR0OiBudW1iZXI7XG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEFyaWFkbmVTZXR0aW5ncyA9IHtcbiAgZW5kcG9pbnQ6IFwiaHR0cDovLzEyNy4wLjAuMToxMTQzNFwiLFxuICBtb2RlbDogXCJsbGFtYTMuMlwiLFxuICB0ZW1wZXJhdHVyZTogMC40LFxuICBrb250ZXh0RWluYmV6aWVoZW46IHRydWUsXG4gIGtvbnRleHRBbnphaGw6IDgsXG4gIHByb3Rva29sbDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgc2Nocml0dDogMFxufTtcblxuY29uc3QgVFlQRU46IHN0cmluZ1tdID0gW1wiam91cm5hbFwiLCBcImltcHVsc1wiLCBcIm9yZGVyLWxvZ1wiLCBcInR0cnBnXCIsIFwibWVldGluZ1wiLCBcInJlZmxleGlvblwiXTtcblxuY29uc3QgS09OVEVYVEU6IHN0cmluZ1tdID0gW1wiTGVocmVcIiwgXCJGb3JzY2h1bmdcIiwgXCJBZG1pblwiLCBcIlNwb3J0XCIsIFwiU296aWFsXCIsIFwiRmFtaWxpZVwiLCBcIkFsbGVpblwiXTtcblxuY29uc3QgTUFSS0VSID0gXCIlJWFyaWFkbmUtYW5hbHlzZSUlXCI7XG5cbi8vIEtSSVNURVJNRTogTnVyIGVyZ2FlbnplbiwgbmllbWFscyBzY2h3YWVjaGVuIChzaWVoZSBBR0VOVFMubWQpLlxuY29uc3QgS1JJU1RFUk1FOiBzdHJpbmdbXSA9IFtcbiAgXCJzdWl6aWRcIixcbiAgXCJzdWl6aWRnZWRhbmtlXCIsXG4gIFwic3VpemlkYWJzaWNodFwiLFxuICBcInNlbGJzdG1vcmRcIixcbiAgXCJzZWxic3R2ZXJsZXR6XCIsXG4gIFwidG9kZXN3dW5zY2hcIixcbiAgXCJuaWNodCBtZWhyIHdlaXRlcmxlYmVuXCIsXG4gIFwibmljaHQgbWVociBsZWJlbiB3b2xsZW5cIixcbiAgXCJsZWJlbiBiZWVuZGVuXCIsXG4gIFwic3R1cnprcmlzZVwiLFxuICBcImFrdXRlIGtyaXNlXCIsXG4gIFwib2hubWFjaHRcIixcbiAgXCJwYW5pa2F0dGFja2VcIlxuXTtcblxuY29uc3QgQU5BTFlTRV9QUk9NUFQgPSBbXG4gIFwiRHUgYmlzdCBkZXIgU3BhcnJpbmdzcGFydG5lciBpbiBlaW5lbSBldmlkZW56YmFzaWVydGVuIEpvdXJuYWxpbmctU3lzdGVtIG5hbWVucyBBcmlhZG5lLlwiLFxuICBcIkdydW5kaGFsdHVuZzoga29sbGVnaWFsLCBwcmFlemlzZSwgaGFydCBpbiBkZXIgU2FjaGUsIGhlcnpsaWNoIGluIGRlciBGb3JtLiBEdSBiaXN0IGtlaW4gVGhlcmFwZXV0LlwiLFxuICBcIlwiLFxuICBcIkF1ZmdhYmU6IEFuYWx5c2llcmUgZGllIEFLVFVFTExFIE5PVElaLiBEZXIgS09OVEVYVCBmcmVpZ2VnZWJlbmVyIE5vdGl6ZW4gaXN0IEhpbnRlcmdydW5kLCBuaWNodCBIYXVwdG9iamVrdC5cIixcbiAgXCJcIixcbiAgXCJSZWdlbG46XCIsXG4gIFwiMS4gTnVyIGJlbGVnYmFyZSBCZW9iYWNodHVuZ2VuOiB2ZXJ3ZWlzZSBhdWYga29ua3JldGUgU3RlbGxlbiBkZXIgTm90aXogKFppdGF0ZSwgWmFobGVuLCBGcm9udG1hdHRlci1XZXJ0ZSkuXCIsXG4gIFwiMi4gU3VjaGUgYWt0aXYgbmFjaCBHZWdlbmJlaXNwaWVsZW4sIGJldm9yIGR1IGVpbiBNdXN0ZXIgYmVoYXVwdGVzdCAoQmVzdGFldGlndW5nc2ZlaGxlci1CcmVtc2UpLlwiLFxuICBcIjMuIFdlbm4gRnJvbnRtYXR0ZXItV2VydGUgdm9yaGFuZGVuIHNpbmQgKFNsaWRlciwgdHlwKTogcHJ1ZWZlLCBvYiBzaWUgenVtIFRvbiBkZXMgVGV4dGVzIHBhc3Nlbi4gRGlza3JlcGFuemVuIGJlbmVubnN0IGR1IGRpcmVrdC5cIixcbiAgXCI0LiBTcHJpY2ggRmFrdGVuIFVORCBHZWZ1ZWhsZSBhbiwgbmllIG51ciBlaW5lcyB2b24gYmVpZGVtLlwiLFxuICBcIjUuIEtlaW5lIERpYWdub3Nlbiwga2VpbmUgVGhlcmFwaWV2b3JzY2hsYWVnZSwga2VpbmUgU2VsYnN0b3B0aW1pZXJ1bmdzLVJoZXRvcmlrLlwiLFxuICBcIjYuIEJlaSBha3V0ZW4gS3Jpc2Vuc2lnbmFsZW4gaW4gZGVyIE5vdGl6OiB1bnRlcmJyaWNoIGRpZSBBbmFseXNlLCBiZW5lbm5lIGtsYXIgdW5kIHJlc3Bla3R2b2xsIGRpZSBHcmVuemUgdW5kIHZlcndlaXNlIGF1ZiBUZWxlZm9uc2VlbHNvcmdlICgwODAwIDExMSAwIDExMSwgMDgwMCAxMTEgMCAyMjIpIHVuZCBpbSBOb3RmYWxsIDExMi5cIixcbiAgXCI3LiBNYXhpbWFsIGRyZWkgQmVvYmFjaHR1bmdlbiBvZGVyIE11c3Rlci1IeXBvdGhlc2VuLCBkYW5uIGdlbmF1IGVpbmUgb2ZmZW5lIEZyYWdlLlwiLFxuICBcIlwiLFxuICBcIlN0cnVrdHVyIGRlaW5lciBBbnR3b3J0OlwiLFxuICBcIkJlb2JhY2h0dW5nZW46IChrdXJ6ZSBMaXN0ZSBtaXQgQmVsZWdlbilcIixcbiAgXCJBdWZmYWVsbGlnOiAobWF4aW1hbCB6d2VpIEh5cG90aGVzZW4sIGplZGUgbWl0IEdlZ2VuYmVpc3BpZWwtUHJ1ZWZ1bmcpXCIsXG4gIFwiRnJhZ2U6IChnZW5hdSBlaW5lLCB6dW0gV2VpdGVyZGVua2VuKVwiLFxuICBcIlwiLFxuICBcIkFudHdvcnRlIGF1ZiBEZXV0c2NoIHVuZCBibGVpYmUgdW50ZXIgMjUwIFdvZXJ0ZXJuLlwiXG5dLmpvaW4oXCJcXG5cIik7XG5cbmludGVyZmFjZSBSZWZsZXhpb25zU2Nocml0dCB7XG4gIHRpdGVsOiBzdHJpbmc7XG4gIGFubGVpdHVuZzogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBSZWZsZXhpb25zUHJvdG9rb2xsIHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBzY2hyaXR0ZTogUmVmbGV4aW9uc1NjaHJpdHRbXTtcbn1cblxuY29uc3QgUFJPVE9LT0xMRTogUmVmbGV4aW9uc1Byb3Rva29sbFtdID0gW1xuICB7XG4gICAgaWQ6IFwicGVubmViYWtlci1lcGlzb2RlXCIsXG4gICAgbmFtZTogXCJQZW5uZWJha2VyLUVwaXNvZGUgKDMgU2Nocml0dGUsIGplIDE1IGJpcyAyMCBNaW51dGVuLCBhbiBhdWZlaW5hbmRlcmZvbGdlbmRlbiBUYWdlbilcIixcbiAgICBzY2hyaXR0ZTogW1xuICAgICAge1xuICAgICAgICB0aXRlbDogXCJGYWt0ZW5cIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJXYWVobGUgRUlORSBrb25rcmV0ZSBFcGlzb2RlIGRlciBsZXR6dGVuIHNpZWJlbiBUYWdlLlwiLFxuICAgICAgICAgIFwiU2NocmVpYmUgMTUgYmlzIDIwIE1pbnV0ZW4gbnVyIGRhcnVlYmVyLCB3YXMgdGF0c2FlY2hsaWNoIHBhc3NpZXJ0IGlzdDogT3J0LCBCZXRlaWxpZ3RlLCBBYmxhdWYsIERlaW5lIEhhbmRsdW5nZW4uIEtlaW5lIEJld2VydHVuZywga2VpbmUgRGV1dHVuZy4gRWluZSBGYWt0ZW5sYWdlIHdpZSBlaW4gUHJvdG9rb2xsLlwiXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIkdlZnVlaGxlIHVuZCBLb2VycGVyXCIsXG4gICAgICAgIGFubGVpdHVuZzogW1xuICAgICAgICAgIFwiTmltbSBkaWVzZWxiZSBFcGlzb2RlIGVybmV1dC5cIixcbiAgICAgICAgICBcIlNjaHJlaWJlIDE1IGJpcyAyMCBNaW51dGVuIGRpZXNtYWwgbnVyIHVlYmVyIERlaW5lIEdlZnVlaGxlIHVuZCBEZWluZSBLb2VycGVyZXJmYWhydW5nOiBXYXMgaGFzdCBEdSBpbiBkZXIgU2l0dWF0aW9uIGdlZnVlaGx0LCB3byBpbSBLb2VycGVyIGhhc3QgRHUgZXMgZ2VzcHVlcnQsIHdhcyBkYXZvbiBpc3QgaGV1dGUgbm9jaCBkYS4gRmFrdGVuIG51ciBhbHMgQW5rZXIsIHdlbm4gRHUgc2llIGJyYXVjaHN0LlwiXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIlZlcmtudWVwZnVuZyB1bmQgUGVyc3Bla3RpdmVcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJadW0gZHJpdHRlbiBNYWwgZGllc2VsYmUgRXBpc29kZTogV2FzIGJlZGV1dGVuIEZha3RlbiB1bmQgR2VmdWVobGUgenVzYW1tZW4/XCIsXG4gICAgICAgICAgXCJXYXMgd3VlcmRlIGVpbiBhdXNzZW5zdGVoZW5kZXIsIHdvaGx3b2xsZW5kZXIgQmVvYmFjaHRlciBzZWhlbj8gV2VsY2hlciBuYWVjaHN0ZSBTY2hyaXR0IGVyZ2lidCBzaWNoPyBTY2hsaWVzc2UgbWl0IGVpbmVtIFNhdHosIGRlbiBEdSBpbiB6d2VpIFdvY2hlbiB3aWVkZXJsZXNlbiB3aWxsc3QuXCJcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIGlkOiBcIm51Y2xlYXItZXBpc29kZXNcIixcbiAgICBuYW1lOiBcIk51Y2xlYXIgRXBpc29kZXMgKHByYWVnZW5kZSBXZW5kZXB1bmt0ZSwgMjAgYmlzIDMwIE1pbnV0ZW4pXCIsXG4gICAgc2Nocml0dGU6IFtcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiV2VuZGVwdW5rdGVcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJEZW5rZSBhbiB6d2VpIGJpcyBkcmVpIHByYWVnZW5kZSBXZW5kZXB1bmt0ZSBkZWluZXMgTGViZW5zd2VncywgaW5zYmVzb25kZXJlIGRlciBsZXR6dGVuIEphaHJlLlwiLFxuICAgICAgICAgIFwiQmVzY2hyZWliZSBmdWVyIGplZGVuOiBXYXMgZ2VzY2hhaCwgd2FzIGhhZXR0ZXN0IGR1IGRpciBkYW1hbHMgZ2V3dWVuc2NodCwgd2FzIGhhdCBzaWNoIGRhcmF1cyBlbnR3aWNrZWx0LCB1bmQgd2VsY2hlIEFobnVuZyBoYXN0IGR1IGhldXRlLCB3b3p1IGVzIGd1dCB3YXIgb2RlciBub2NoIHdlcmRlbiBrb2VubnRlLlwiLFxuICAgICAgICAgIFwiTmltbSBkaXIgZGFmdWVyIDIwIGJpcyAzMCBNaW51dGVuIGluIFJ1aGUuXCJcbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfVxuXTtcblxuaW50ZXJmYWNlIENoZWNrSW5EYXRlbiB7XG4gIHZhbGVuY2U6IG51bWJlcjtcbiAgYXJvdXNhbDogbnVtYmVyO1xuICBiZWxhc3R1bmc6IG51bWJlcjtcbiAga29lcnBlcjogbnVtYmVyO1xuICBrb250ZXh0ZTogc3RyaW5nW107XG4gIGF1c25haG1lOiBib29sZWFuO1xufVxuXG5jbGFzcyBUeXBNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb25DaG9vc2U6ICh0eXA6IHN0cmluZykgPT4gdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiTm90aXogZnVlciBBcmlhZG5lIGZyZWlnZWJlblwiIH0pO1xuICAgIHRoaXMuY29udGVudEVsLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiV2VsY2hlciBBcnQgaXN0IGRpZXNlIE5vdGl6PyBEZXIgVHlwIHN0ZXVlcnQgZGllIHNwYWV0ZXJlIEF1c3dlcnR1bmcuXCIgfSk7XG4gICAgY29uc3QgemVpbGUgPSBuZXcgU2V0dGluZyh0aGlzLmNvbnRlbnRFbCk7XG4gICAgZm9yIChjb25zdCB0IG9mIFRZUEVOKSB7XG4gICAgICB6ZWlsZS5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dCh0KS5vbkNsaWNrKCgpID0+IHsgdGhpcy5vbkNob29zZSh0KTsgdGhpcy5jbG9zZSgpOyB9KSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENoZWNrSW5Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBkYXRlbjogQ2hlY2tJbkRhdGVuID0geyB2YWxlbmNlOiA1LCBhcm91c2FsOiA1LCBiZWxhc3R1bmc6IDUsIGtvZXJwZXI6IDUsIGtvbnRleHRlOiBbXSwgYXVzbmFobWU6IGZhbHNlIH07XG5cbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgb25GZXJ0aWc6IChkOiBDaGVja0luRGF0ZW4pID0+IHZvaWQpIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgcHJpdmF0ZSBiYXVlU2xpZGVyKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQsIHRpdGVsOiBzdHJpbmcsIGhpbndlaXM6IHN0cmluZywgb25XZXJ0OiAobjogbnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgY29udGFpbmVyLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IHRpdGVsICsgXCIgKFwiICsgaGlud2VpcyArIFwiKVwiIH0pO1xuICAgIGNvbnN0IHJlaWhlID0gY29udGFpbmVyLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcImFyaWFkbmUtc2xpZGVyLXplaWxlXCIgfSk7XG4gICAgY29uc3QgaW5wdXQgPSByZWloZS5jcmVhdGVFbChcImlucHV0XCIsIHsgdHlwZTogXCJyYW5nZVwiIH0pO1xuICAgIGlucHV0Lm1pbiA9IFwiMFwiO1xuICAgIGlucHV0Lm1heCA9IFwiMTBcIjtcbiAgICBpbnB1dC5zdGVwID0gXCIxXCI7XG4gICAgaW5wdXQudmFsdWUgPSBcIjVcIjtcbiAgICBjb25zdCBhbnplaWdlID0gcmVpaGUuY3JlYXRlRWwoXCJzcGFuXCIsIHsgdGV4dDogXCI1XCIgfSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgIGNvbnN0IG4gPSBwYXJzZUludChpbnB1dC52YWx1ZSwgMTApO1xuICAgICAgYW56ZWlnZS5zZXRUZXh0KFN0cmluZyhuKSk7XG4gICAgICBvbldlcnQobik7XG4gICAgfSk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgYyA9IHRoaXMuY29udGVudEVsO1xuICAgIGMuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IFwiQWJlbmQtQ2hlY2staW5cIiB9KTtcbiAgICBjLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiVmllciBXZXJ0ZSB2b24gMCBiaXMgMTAsIGRhbm4gZGllIEtvbnRleHRlIGRlcyBUYWdlcy4gRGVyIEVpbnRyYWcgd2lyZCB1bnRlciBlaW50cmFlZ2UvIGFscyBqb3VybmFsIGFuZ2VsZWd0IHVuZCBmdWVyIEF1c3dlcnR1bmdlbiBmcmVpZ2VnZWJlbi5cIiB9KTtcbiAgICB0aGlzLmJhdWVTbGlkZXIoYywgXCJWYWxlbnpcIiwgXCIwIHVuYW5nZW5laG0sIDEwIGFuZ2VuZWhtXCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4udmFsZW5jZSA9IG47IH0pO1xuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIkFrdGl2aWVydW5nXCIsIFwiMCBydWhpZywgMTAgYWt0aXZpZXJ0XCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4uYXJvdXNhbCA9IG47IH0pO1xuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIkJlbGFzdHVuZ1wiLCBcIjAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50XCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4uYmVsYXN0dW5nID0gbjsgfSk7XG4gICAgdGhpcy5iYXVlU2xpZGVyKGMsIFwiS29lcnBlclwiLCBcIjAgdmVyc3Bhbm50LCAxMCBmcmVpXCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4ua29lcnBlciA9IG47IH0pO1xuICAgIGMuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJLb250ZXh0ZSBoZXV0ZSAoTWVocmZhY2h3YWhsKVwiIH0pO1xuICAgIGNvbnN0IGthY2hlbG4gPSBjLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcImFyaWFkbmUta2FjaGVsblwiIH0pO1xuICAgIGZvciAoY29uc3QgayBvZiBLT05URVhURSkge1xuICAgICAgY29uc3QgYiA9IGthY2hlbG4uY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBrLCBjbHM6IFwiYXJpYWRuZS1rYWNoZWxcIiB9KTtcbiAgICAgIGIudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICBiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZGF0ZW4ua29udGV4dGUuaW5kZXhPZihrKTtcbiAgICAgICAgaWYgKHBvcyA9PT0gLTEpIHsgdGhpcy5kYXRlbi5rb250ZXh0ZS5wdXNoKGspOyBiLmFkZENsYXNzKFwiYXJpYWRuZS1rYWNoZWwtYWt0aXZcIik7IH1cbiAgICAgICAgZWxzZSB7IHRoaXMuZGF0ZW4ua29udGV4dGUuc3BsaWNlKHBvcywgMSk7IGIucmVtb3ZlQ2xhc3MoXCJhcmlhZG5lLWthY2hlbC1ha3RpdlwiKTsgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJBdXNuYWhtZS1FcmVpZ25pc1wiKS5zZXREZXNjKFwiRXR3YXMgQXVzc2VyZ2V3b2VobmxpY2hlcyBpc3QgaGV1dGUgcGFzc2llcnQuXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKGZhbHNlKS5vbkNoYW5nZSgodikgPT4geyB0aGlzLmRhdGVuLmF1c25haG1lID0gdjsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJFaW50cmFnIGFubGVnZW5cIikuc2V0Q3RhKCkub25DbGljaygoKSA9PiB7IHRoaXMub25GZXJ0aWcodGhpcy5kYXRlbik7IHRoaXMuY2xvc2UoKTsgfSkpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJBYmJyZWNoZW5cIikub25DbGljaygoKSA9PiB0aGlzLmNsb3NlKCkpKTtcbiAgfVxufVxuXG5jbGFzcyBSZWZsZXhpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcGx1Z2luOiBBcmlhZG5lUGx1Z2luLCBwcml2YXRlIHByb3Rva29sbDogUmVmbGV4aW9uc1Byb3Rva29sbCwgcHJpdmF0ZSBpZHg6IG51bWJlcikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgcyA9IHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlW3RoaXMuaWR4XTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogdGhpcy5wcm90b2tvbGwubmFtZSB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlNjaHJpdHQgXCIgKyAodGhpcy5pZHggKyAxKSArIFwiIHZvbiBcIiArIHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlLmxlbmd0aCArIFwiOiBcIiArIHMudGl0ZWwgfSk7XG4gICAgZm9yIChjb25zdCBhIG9mIHMuYW5sZWl0dW5nKSB7XG4gICAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBhIH0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5pbW0gZGlyIGRpZSBaZWl0IGluIFJ1aGUuIEVpbiBTY2hyaXR0IHBybyBUYWcsIG5pY2h0IG1laHIuXCIgfSk7XG4gICAgbmV3IFNldHRpbmcodGhpcy5jb250ZW50RWwpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJTaXR6dW5nIHN0YXJ0ZW5cIikuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7IGF3YWl0IHRoaXMucGx1Z2luLnN0YXJ0ZVNpdHp1bmcodGhpcy5wcm90b2tvbGwsIHRoaXMuaWR4KTsgdGhpcy5jbG9zZSgpOyB9KSlcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIlNjaHJpdHQgYWJzY2hsaWVzc2VuXCIpLm9uQ2xpY2soYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5zY2hyaXR0QWJzY2hsaWVzc2VuKHRoaXMucHJvdG9rb2xsLCB0aGlzLmlkeCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICB9XG59XG5cbmNsYXNzIEFyaWFkbmVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHBsdWdpbjogQXJpYWRuZVBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKSB7XG4gICAgY29uc3QgYyA9IHRoaXMuY29udGFpbmVyRWw7XG4gICAgYy5lbXB0eSgpO1xuICAgIGMuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQXJpYWRuZVwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJFbmRwdW5rdFwiKS5zZXREZXNjKFwiT3BlbkFJLWtvbXBhdGlibGVyIGxva2FsZXIgRW5kcHVua3QuIFN0YW5kYXJkOiBPbGxhbWEgYXVmIGRpZXNlbSBHZXJhZXQuXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRQbGFjZWhvbGRlcihcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIikuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5kcG9pbnQpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmRwb2ludCA9IHYudHJpbSgpOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJNb2RlbGxcIikuc2V0RGVzYyhcInouQi4gbGxhbWEzLjIsIG1pc3RyYWwtc21hbGxcIilcbiAgICAgIC5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZWwgPSB2LnRyaW0oKTsgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiVGVtcGVyYXR1clwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnRlbXBlcmF0dXJlKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGNvbnN0IG4gPSBwYXJzZUZsb2F0KHYucmVwbGFjZShcIixcIiwgXCIuXCIpKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGVyYXR1cmUgPSBpc05hTihuKSA/IDAuNCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIktvbnRleHQgZnJlaWdlZ2ViZW5lciBOb3RpemVuXCIpLnNldERlc2MoXCJCZWkgamVkZXIgQW5hbHlzZTogS29udGV4dCBhdXMgZnJlaWdlZ2ViZW5lbiBOb3RpemVuIGRlc3NlbGJlbiBWYXVsdHMgZWluYmV6aWVoZW4uXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbilcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbiA9IHY7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFuemFobCBLb250ZXh0bm90aXplblwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRBbnphaGwpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgY29uc3QgbiA9IHBhcnNlSW50KHYsIDEwKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua29udGV4dEFuemFobCA9IGlzTmFOKG4pID8gOCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgY29uc3QgZHJvcCA9IG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJSZWZsZXhpb25zcHJvdG9rb2xsXCIpLnNldERlc2MoXCJEZXIgUGZhZCwgZGVuIFJlZmxla3RpZXJlbiB3ZWl0ZXJmdWVocnQuXCIpO1xuICAgIGRyb3AuYWRkRHJvcGRvd24oKGQpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBQUk9UT0tPTExFKSB7IGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7IH1cbiAgICAgIGQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsID0gdjsgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2Nocml0dCA9IDA7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB0aGlzLmRpc3BsYXkoKTsgfSk7XG4gICAgfSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFrdHVlbGxlciBTY2hyaXR0XCIpLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnNjaHJpdHQgKyAxKSkuc2V0RGlzYWJsZWQodHJ1ZSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJLcmlzZW53ZWl0ZXJsZWl0dW5nXCIpLnNldERlc2MoXCJCZWkgS3Jpc2Vuc2lnbmFsZW4gYnJpY2h0IGplZGUgQXJpYWRuZS1BbmFseXNlIGFiLiBUZWxlZm9uc2VlbHNvcmdlOiAwODAwIDExMSAwIDExMSBvZGVyIDA4MDAgMTExIDAgMjIyLiBJbSBha3V0ZW4gTm90ZmFsbDogMTEyLlwiKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmlhZG5lUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEFyaWFkbmVTZXR0aW5ncztcblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSlcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJnaXQtYnJhbmNoXCIsIFwiQXJpYWRuZVwiLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB0aGlzLm9lZmZuZU1lbnVlKGV2dCkpO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtY2hlY2tpblwiLCBuYW1lOiBcIkFyaWFkbmU6IE5ldWVyIENoZWNrLWluIChBYmVuZClcIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMub2VmZm5lQ2hlY2tJbigpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtbWFya2llcnVuZ1wiLCBuYW1lOiBcIkFyaWFkbmU6IE1hcmtpZXJ1bmcgdW1zY2hhbHRlblwiLCBjYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkgfSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1hbmFseXNlXCIsIG5hbWU6IFwiQXJpYWRuZTogQWJmcmFnZSBpbiBkaWVzZXIgTm90aXogdmVyYW5rZXJuXCIsIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHRoaXMudmVyYW5rZXJuKGVkaXRvcikgfSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1yZWZsZWt0aWVyZW5cIiwgbmFtZTogXCJBcmlhZG5lOiBSZWZsZWt0aWVyZW4gLSBuYWVjaHN0ZXIgU2Nocml0dFwiLCBjYWxsYmFjazogKCkgPT4gdGhpcy5yZWZsZWt0aWVyZW4oKSB9KTtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZWRpdG9yLW1lbnVcIiwgKG1lbnU6IE1lbnUpID0+IHtcbiAgICAgIG1lbnUuYWRkU2VwYXJhdG9yKCk7XG4gICAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBcmlhZG5lOiBtYXJraWVyZW5cIikuc2V0SWNvbihcImJvb2ttYXJrXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkpKTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFyaWFkbmU6IEFiZnJhZ2UgdmVyYW5rZXJuXCIpLnNldEljb24oXCJzcGFya2xlc1wiKS5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIGlmICh2aWV3KSB7IHRoaXMudmVyYW5rZXJuKHZpZXcuZWRpdG9yKTsgfVxuICAgICAgfSkpO1xuICAgICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiQXJpYWRuZTogUmVmbGVrdGllcmVuXCIpLnNldEljb24oXCJmb290cHJpbnRzXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy5yZWZsZWt0aWVyZW4oKSkpO1xuICAgIH0pKTtcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFyaWFkbmVTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgb2VmZm5lTWVudWUoZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgbWVudSA9IG5ldyBNZW51KCk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiTmV1ZXIgQ2hlY2staW4gKEFiZnJhZ2UpXCIpLnNldEljb24oXCJhY3Rpdml0eVwiKS5vbkNsaWNrKCgpID0+IHRoaXMub2VmZm5lQ2hlY2tJbigpKSk7XG4gICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJNYXJraWVydW5nIHVtc2NoYWx0ZW5cIikuc2V0SWNvbihcImJvb2ttYXJrXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkpKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBYmZyYWdlIGluIGRpZXNlciBOb3RpeiB2ZXJhbmtlcm5cIikuc2V0SWNvbihcInNwYXJrbGVzXCIpLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICBpZiAodmlldykgeyB0aGlzLnZlcmFua2Vybih2aWV3LmVkaXRvcik7IH0gZWxzZSB7IG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLZWluZSBOb3RpeiBpbSBGb2t1cy5cIik7IH1cbiAgICB9KSk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiUmVmbGVrdGllcmVuIC0gbmFlY2hzdGVyIFNjaHJpdHRcIikuc2V0SWNvbihcImZvb3RwcmludHNcIikub25DbGljaygoKSA9PiB0aGlzLnJlZmxla3RpZXJlbigpKSk7XG4gICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJDaGF0IG1pdCBkZW0gbG9rYWxlbiBNb2RlbGwgKGZvbGd0KVwiKS5zZXRJY29uKFwibWVzc2FnZS1jaXJjbGVcIikub25DbGljaygoKSA9PiBuZXcgTm90aWNlKFwiQXJpYWRuZTogRGVyIENoYXQgZm9sZ3QgYWxzIE00LiBCaXMgZGFoaW46IENvcGlsb3QgZm9yIE9ic2lkaWFuIG1pdCBkZW0gU3BhcnJpbmctUHJvbXB0LlwiKSkpO1xuICAgIG1lbnUuc2hvd0F0TW91c2VFdmVudChldnQpO1xuICB9XG5cbiAgb2VmZm5lQ2hlY2tJbigpIHtcbiAgICBuZXcgQ2hlY2tJbk1vZGFsKHRoaXMuYXBwLCBhc3luYyAoZDogQ2hlY2tJbkRhdGVuKSA9PiB7IGF3YWl0IHRoaXMuZXJzdGVsbGVDaGVja0luKGQpOyB9KS5vcGVuKCk7XG4gIH1cblxuICBhc3luYyBlcnN0ZWxsZUNoZWNrSW4oZDogQ2hlY2tJbkRhdGVuKSB7XG4gICAgY29uc3QgaXNvID0gbW9tZW50KCkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKTtcbiAgICBjb25zdCBwZmFkID0gXCJlaW50cmFlZ2UvXCIgKyBpc28gKyBcIi5tZFwiO1xuICAgIGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhwZmFkKSkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEZ1ZXIgaGV1dGUgZXhpc3RpZXJ0IHNjaG9uIGVpbiBDaGVjay1pbi5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGtvbnRleHRlID0gZC5rb250ZXh0ZS5sZW5ndGggPT09IDAgPyBcIltdXCIgOiBcIltcIiArIGQua29udGV4dGUuam9pbihcIiwgXCIpICsgXCJdXCI7XG4gICAgY29uc3QgYmFzZWxpbmUgPSBbXG4gICAgICBcIlZhbGVueiBcIiArIFN0cmluZyhkLnZhbGVuY2UpICsgXCIvMTAgKDAgdW5hbmdlbmVobSwgMTAgYW5nZW5laG0pXCIsXG4gICAgICBcIkFrdGl2aWVydW5nIFwiICsgU3RyaW5nKGQuYXJvdXNhbCkgKyBcIi8xMCAoMCBydWhpZywgMTAgYWt0aXZpZXJ0KVwiLFxuICAgICAgXCJCZWxhc3R1bmcgXCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpICsgXCIvMTAgKDAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50KVwiLFxuICAgICAgXCJLb2VycGVyIFwiICsgU3RyaW5nKGQua29lcnBlcikgKyBcIi8xMCAoMCB2ZXJzcGFubnQsIDEwIGZyZWkpXCJcbiAgICBdLmpvaW4oXCIsIFwiKTtcbiAgICBjb25zdCB6ZWlsZW46IHN0cmluZ1tdID0gW1xuICAgICAgXCItLS1cIixcbiAgICAgIFwidHlwOiBqb3VybmFsXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwiZGF0dW06IFwiICsgaXNvLFxuICAgICAgXCJ6dXN0YW5kOiBnZXNwcm9jaGVuXCIsXG4gICAgICBcInZhbGVuY2U6IFwiICsgU3RyaW5nKGQudmFsZW5jZSksXG4gICAgICBcImFyb3VzYWw6IFwiICsgU3RyaW5nKGQuYXJvdXNhbCksXG4gICAgICBcImJlbGFzdHVuZzogXCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpLFxuICAgICAgXCJrb2VycGVyOiBcIiArIFN0cmluZyhkLmtvZXJwZXIpLFxuICAgICAgXCJrb250ZXh0ZTogXCIgKyBrb250ZXh0ZSxcbiAgICAgIFwiYXVzbmFobWU6IFwiICsgKGQuYXVzbmFobWUgPyBcInRydWVcIiA6IFwiZmFsc2VcIiksXG4gICAgICBcIi0tLVwiLFxuICAgICAgXCJcIixcbiAgICAgIFwiIyMgQmFzZWxpbmVcIixcbiAgICAgIFwiXCIsXG4gICAgICBiYXNlbGluZSxcbiAgICAgIFwiXCIsXG4gICAgICBcIktvbnRleHRlOiBcIiArIChkLmtvbnRleHRlLmxlbmd0aCA9PT0gMCA/IFwia2VpbmVcIiA6IGQua29udGV4dGUuam9pbihcIiwgXCIpKSArIChkLmF1c25haG1lID8gXCIgfCBBdXNuYWhtZS1FcmVpZ25pc1wiIDogXCJcIiksXG4gICAgICBcIlwiLFxuICAgICAgXCIjIyBXYXMgd2FyIGhldXRlXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCJGYWt0ZW46IFdhcyBpc3QgcGFzc2llcnQ/XCIsXG4gICAgICBcIlwiLFxuICAgICAgXCJHZWZ1ZWhsZTogV2FzIGhhdCBlcyBtaXQgbWlyIGdlbWFjaHQ/XCIsXG4gICAgICBcIlwiXG4gICAgXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZiA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShwZmFkLCB6ZWlsZW4uam9pbihcIlxcblwiKSk7XG4gICAgICBhd2FpdCB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZih0cnVlKS5vcGVuRmlsZShmKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBDaGVjay1pbiBhbmdlbGVndCB1bmQgZnJlaWdlZ2ViZW4uXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLb25udGUgZGVuIENoZWNrLWluIG5pY2h0IGFubGVnZW4uXCIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZnJvbnRtYXR0ZXJWb24oZmlsZTogVEZpbGUpOiBhbnkge1xuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgaWYgKGNhY2hlICYmIGNhY2hlLmZyb250bWF0dGVyKSB7IHJldHVybiBjYWNoZS5mcm9udG1hdHRlcjsgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgdG9nZ2xlTWFya2llcnVuZygpIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBjb25zdCBmaWxlID0gdmlldyA/IHZpZXcuZmlsZSA6IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlKSB7IG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLZWluZSBha3RpdmUgTm90aXouXCIpOyByZXR1cm47IH1cbiAgICBjb25zdCBmbSA9IHRoaXMuZnJvbnRtYXR0ZXJWb24oZmlsZSk7XG4gICAgaWYgKGZtICYmIGZtW1wiYXJpYWRuZVwiXSA9PT0gdHJ1ZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmOiBhbnkpID0+IHsgZltcImFyaWFkbmVcIl0gPSBmYWxzZTsgfSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTWFya2llcnVuZyBlbnRmZXJudC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHR5cCA9IGZtID8gZm1bXCJ0eXBcIl0gOiBudWxsO1xuICAgIGlmICh0eXApIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gdHJ1ZTsgfSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTm90aXogZnJlaWdlZ2ViZW4gKHR5cDogXCIgKyBTdHJpbmcodHlwKSArIFwiKS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ldyBUeXBNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKHQ6IHN0cmluZykgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IHRydWU7IGZbXCJ0eXBcIl0gPSB0OyB9KTtcbiAgICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5vdGl6IGZyZWlnZWdlYmVuIGFscyBcIiArIHQgKyBcIi5cIik7XG4gICAgICB9KS5vcGVuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmcmVpZ2VnZWJlbmVEYXRlaWVuKCk6IFRGaWxlW10ge1xuICAgIHJldHVybiB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkuZmlsdGVyKChmKSA9PiB7XG4gICAgICBjb25zdCBmbSA9IHRoaXMuZnJvbnRtYXR0ZXJWb24oZik7XG4gICAgICByZXR1cm4gZm0gIT09IG51bGwgJiYgZm1bXCJhcmlhZG5lXCJdID09PSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBrb250ZXh0QmlsZGVuKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZGF0ZWllbiA9IHRoaXMuZnJlaWdlZ2ViZW5lRGF0ZWllbigpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5zdGF0Lm10aW1lIC0gYS5zdGF0Lm10aW1lKVxuICAgICAgLnNsaWNlKDAsIHRoaXMuc2V0dGluZ3Mua29udGV4dEFuemFobCk7XG4gICAgY29uc3QgdGVpbGU6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBkIG9mIGRhdGVpZW4pIHtcbiAgICAgIGNvbnN0IGZtID0gdGhpcy5mcm9udG1hdHRlclZvbihkKTtcbiAgICAgIGNvbnN0IHR5cCA9IGZtICYmIGZtW1widHlwXCJdID8gU3RyaW5nKGZtW1widHlwXCJdKSA6IFwib2huZS10eXBcIjtcbiAgICAgIGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChkKTtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDEyMDApIHsgdGV4dCA9IHRleHQuc2xpY2UoMCwgMTIwMCkgKyBcIiAuLi5cIjsgfVxuICAgICAgdGVpbGUucHVzaChcIi0tLSBOb3RpejogXCIgKyBkLmJhc2VuYW1lICsgXCIgKHR5cDogXCIgKyB0eXAgKyBcIikgLS0tXCIpO1xuICAgICAgdGVpbGUucHVzaCh0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlaWxlLmpvaW4oXCJcXG5cXG5cIik7XG4gIH1cblxuICBwcml2YXRlIGtyaXNlbmNoZWNrKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIEtSSVNURVJNRS5zb21lKChrKSA9PiB0LmluY2x1ZGVzKGspKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb2xsYW1hQ2hhdChwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgdXJsID0gdGhpcy5zZXR0aW5ncy5lbmRwb2ludCArIFwiL3YxL2NoYXQvY29tcGxldGlvbnNcIjtcbiAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoeyBtb2RlbDogdGhpcy5zZXR0aW5ncy5tb2RlbCwgbWVzc2FnZXM6IFt7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBwcm9tcHQgfV0sIHRlbXBlcmF0dXJlOiB0aGlzLnNldHRpbmdzLnRlbXBlcmF0dXJlLCBzdHJlYW06IGZhbHNlIH0pO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlcXVlc3RVcmwoeyB1cmw6IHVybCwgbWV0aG9kOiBcIlBPU1RcIiwgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LCBib2R5OiBib2R5LCB0aHJvdzogZmFsc2UgfSk7XG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7IHRocm93IG5ldyBFcnJvcihcIkhUVFAgXCIgKyByZXMuc3RhdHVzICsgXCIgdm9uIFwiICsgdXJsKTsgfVxuICAgIGNvbnN0IGRhdGEgPSByZXMuanNvbjtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmNob2ljZXMgJiYgZGF0YS5jaG9pY2VzLmxlbmd0aCA+IDAgJiYgZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UgJiYgZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCkge1xuICAgICAgcmV0dXJuIFN0cmluZyhkYXRhLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5ndWVsdGlnZSBBbnR3b3J0IHZvbSBFbmRwdW5rdC5cIik7XG4gIH1cblxuICBwcml2YXRlIGJhdWVCbG9jayhhbnR3b3J0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHplaWxlbiA9IGFudHdvcnQuc3BsaXQoXCJcXG5cIikubWFwKChsOiBzdHJpbmcpID0+IGwudHJpbSgpLmxlbmd0aCA+IDAgPyBcIj4gXCIgKyBsLnRyaW0oKSA6IFwiPlwiKTtcbiAgICBjb25zdCBrb3BmOiBzdHJpbmdbXSA9IFtcbiAgICAgIE1BUktFUixcbiAgICAgIFwiPiBbIWFyaWFkbmVdIEFyaWFkbmUtQW5hbHlzZVwiLFxuICAgICAgXCI+IEVyc3RlbGx0OiBcIiArIG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIikgKyBcIiB8IE1vZGVsbDogXCIgKyB0aGlzLnNldHRpbmdzLm1vZGVsICsgXCIgfCBQcm9tcHQ6IGFuYWx5c2UtdjFcIlxuICAgIF07XG4gICAgcmV0dXJuIGtvcGYuY29uY2F0KHplaWxlbikuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0emVCbG9jayhlZGl0b3I6IEVkaXRvciwgYmxvY2s6IHN0cmluZykge1xuICAgIGNvbnN0IGxpbmVzID0gZWRpdG9yLmdldFZhbHVlKCkuc3BsaXQoXCJcXG5cIik7XG4gICAgbGV0IHN0YXJ0ID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKSB7XG4gICAgICBpZiAobGluZXNbaV0udHJpbSgpID09PSBNQVJLRVIpIHsgc3RhcnQgPSBpOyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICBjb25zdCBsYXN0ID0gZWRpdG9yLmxhc3RMaW5lKCk7XG4gICAgICBjb25zdCBsZW4gPSBlZGl0b3IuZ2V0TGluZShsYXN0KS5sZW5ndGg7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFwiXFxuXFxuXCIgKyBibG9jaywgeyBsaW5lOiBsYXN0LCBjaDogbGVuIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZW5kID0gc3RhcnQ7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0ICsgMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG4gICAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpO1xuICAgICAgaWYgKGwubGVuZ3RoID09PSAwIHx8IGwuc2xpY2UoMCwgMSkgPT09IFwiPlwiIHx8IGwuc2xpY2UoMCwgMikgPT09IFwiJSVcIikgeyBlbmQgPSBpOyB9IGVsc2UgeyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAoZW5kID49IGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoYmxvY2ssIHsgbGluZTogc3RhcnQsIGNoOiAwIH0sIHsgbGluZTogbGluZXMubGVuZ3RoIC0gMSwgY2g6IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShibG9jaywgeyBsaW5lOiBzdGFydCwgY2g6IDAgfSwgeyBsaW5lOiBlbmQgKyAxLCBjaDogMCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB2ZXJhbmtlcm4oZWRpdG9yOiBFZGl0b3IgfCBudWxsKSB7XG4gICAgaWYgKCFlZGl0b3IpIHsgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtlaW5lIE5vdGl6IGltIEZva3VzLlwiKTsgcmV0dXJuOyB9XG4gICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIGlmICh0aGlzLmtyaXNlbmNoZWNrKHRleHQpKSB7XG4gICAgICB0aGlzLnNldHplQmxvY2soZWRpdG9yLCBbXG4gICAgICAgIE1BUktFUixcbiAgICAgICAgXCI+IFshd2FybmluZ10gR3JlbnplIGVycmVpY2h0XCIsXG4gICAgICAgIFwiPiBBcmlhZG5lIGVya2VubnQgZWluIGFrdXRlcyBLcmlzZW5zaWduYWwgaW4gZGllc2VyIE5vdGl6IHVuZCBiZWVuZGV0IGRpZSBBdXN3ZXJ0dW5nIGhpZXIuXCIsXG4gICAgICAgIFwiPiBUZWxlZm9uc2VlbHNvcmdlOiAwODAwIDExMSAwIDExMSBvZGVyIDA4MDAgMTExIDAgMjIyIChydW5kIHVtIGRpZSBVaHIsIGtvc3RlbmxvcywgYW5vbnltKS4gSW0gYWt1dGVuIE5vdGZhbGw6IDExMi5cIixcbiAgICAgICAgXCI+IEFyaWFkbmUgaXN0IFdlcmt6ZXVnLCBuaWNodCBUaGVyYXBpZS4gQml0dGUgaG9sIGRpciBVbnRlcnN0dWV0enVuZy5cIlxuICAgICAgXS5qb2luKFwiXFxuXCIpKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLcmlzZW5zaWduYWwgZXJrYW5udCAtIEFuYWx5c2UgYmVlbmRldC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtBTkFMWVNFX1BST01QVF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mua29udGV4dEVpbmJlemllaGVuKSB7XG4gICAgICBjb25zdCBrb250ZXh0ID0gYXdhaXQgdGhpcy5rb250ZXh0QmlsZGVuKCk7XG4gICAgICBpZiAoa29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhcnRzLnB1c2goXCJLT05URVhUIEFVUyBGUkVJR0VHRUJFTkVOIE5PVElaRU4gKEhpbnRlcmdydW5kKTpcIik7XG4gICAgICAgIHBhcnRzLnB1c2goa29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICAgIHBhcnRzLnB1c2goXCJBS1RVRUxMRSBOT1RJWjpcIik7XG4gICAgcGFydHMucHVzaCh0ZXh0KTtcbiAgICBjb25zdCBwcm9tcHQgPSBwYXJ0cy5qb2luKFwiXFxuXFxuXCIpO1xuICAgIGNvbnN0IG4gPSBuZXcgTm90aWNlKFwiQXJpYWRuZSBhbmFseXNpZXJ0IC4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYW50d29ydCA9IGF3YWl0IHRoaXMub2xsYW1hQ2hhdChwcm9tcHQpO1xuICAgICAgbi5oaWRlKCk7XG4gICAgICB0aGlzLnNldHplQmxvY2soZWRpdG9yLCB0aGlzLmJhdWVCbG9jayhhbnR3b3J0KSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogQW5hbHlzZSB2ZXJhbmtlcnQuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG4uaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEVuZHB1bmt0IG5pY2h0IGVycmVpY2hiYXIgb2RlciBGZWhsZXIgLSBcIiArIChlICYmIGUubWVzc2FnZSA/IGUubWVzc2FnZSA6IFwidW5iZWthbm50XCIpKTtcbiAgICB9XG4gIH1cblxuICByZWZsZWt0aWVyZW4oKSB7XG4gICAgY29uc3QgcCA9IFBST1RPS09MTEUuZmluZCgoeCkgPT4geC5pZCA9PT0gdGhpcy5zZXR0aW5ncy5wcm90b2tvbGwpO1xuICAgIGNvbnN0IHByb3QgPSBwID8gcCA6IFBST1RPS09MTEVbMF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2Nocml0dCA+PSBwcm90LnNjaHJpdHRlLmxlbmd0aCkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFByb3Rva29sbCBhYmdlc2NobG9zc2VuLiBTZXR6ZSBkZW4gU2Nocml0dCBpbiBkZW4gRWluc3RlbGx1bmdlbiB6dXJ1ZWNrIG9kZXIgd2VjaHNsZSBkYXMgUHJvdG9rb2xsLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbmV3IFJlZmxleGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLCBwcm90LCB0aGlzLnNldHRpbmdzLnNjaHJpdHQpLm9wZW4oKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0ZVNpdHp1bmcocDogUmVmbGV4aW9uc1Byb3Rva29sbCwgaWR4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzID0gcC5zY2hyaXR0ZVtpZHhdO1xuICAgIGNvbnN0IGlzbyA9IG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIik7XG4gICAgY29uc3QgcGZhZCA9IFwicmVmbGV4aW9uZW4vXCIgKyBpc28gKyBcIi1cIiArIHAuaWQgKyBcIi1cIiArIChpZHggKyAxKSArIFwiLm1kXCI7XG4gICAgY29uc3QgemVpbGVuOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcInR5cDogcmVmbGV4aW9uXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwicHJvdG9rb2xsOiBcIiArIHAuaWQsXG4gICAgICBcInNjaHJpdHQ6IFwiICsgKGlkeCArIDEpLFxuICAgICAgXCJkYXR1bTogXCIgKyBpc28sXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgcy50aXRlbCxcbiAgICAgIFwiXCJcbiAgICBdLmNvbmNhdChzLmFubGVpdHVuZykuY29uY2F0KFtcbiAgICAgIFwiXCIsXG4gICAgICBcIigxNSBiaXMgMjAgTWludXRlbiwgb2huZSBQYXVzZS4gVGlwcGVuIG9kZXIgZGlrdGllcmVuIC0gYmVpZGVzIHphZWhsdC4pXCIsXG4gICAgICBcIlwiXG4gICAgXSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGYgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUocGZhZCwgemVpbGVuLmpvaW4oXCJcXG5cIikpO1xuICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSkub3BlbkZpbGUoZik7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogU2l0enVuZyBnZXN0YXJ0ZXQgLSBcIiArIHMudGl0ZWwgKyBcIi5cIik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtvbm50ZSBkaWUgU2l0enVuZ3Nub3RpeiBuaWNodCBhbmxlZ2VuIChleGlzdGllcnQgc2llIHNjaG9uPykuXCIpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNjaHJpdHRBYnNjaGxpZXNzZW4ocDogUmVmbGV4aW9uc1Byb3Rva29sbCwgaWR4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldHRpbmdzLnNjaHJpdHQgPSBpZHggKyAxO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLnNjaHJpdHQgPj0gcC5zY2hyaXR0ZS5sZW5ndGgpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBQcm90b2tvbGwgYWJnZXNjaGxvc3NlbiAtIFwiICsgcC5uYW1lICsgXCIuXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTmFlY2hzdGVyIFNjaHJpdHQgaXN0IFwiICsgcC5zY2hyaXR0ZVt0aGlzLnNldHRpbmdzLnNjaHJpdHRdLnRpdGVsICsgXCIuXCIpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnNhdmVTZXR0aW5ncygpO1xuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBNkg7QUFZN0gsSUFBTSxtQkFBb0M7QUFBQSxFQUN4QyxVQUFVO0FBQUEsRUFDVixPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFDYixvQkFBb0I7QUFBQSxFQUNwQixlQUFlO0FBQUEsRUFDZixXQUFXO0FBQUEsRUFDWCxTQUFTO0FBQ1g7QUFFQSxJQUFNLFFBQWtCLENBQUMsV0FBVyxVQUFVLGFBQWEsU0FBUyxXQUFXLFdBQVc7QUFFMUYsSUFBTSxXQUFxQixDQUFDLFNBQVMsYUFBYSxTQUFTLFNBQVMsVUFBVSxXQUFXLFFBQVE7QUFFakcsSUFBTSxTQUFTO0FBR2YsSUFBTSxZQUFzQjtBQUFBLEVBQzFCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7QUFFQSxJQUFNLGlCQUFpQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FB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
