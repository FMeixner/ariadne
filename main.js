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
var TYPEN = ["journal", "impuls", "order-log", "ttrpg", "meeting", "hobby", "reflexion"];
var TYP_TEXT = {
  "journal": "Tages- und Abendreflexion mit Slider-Abfrage",
  "impuls": "Situativer Eintrag unterwegs, ohne Slider",
  "meeting": "Uni- oder Dienstsitzung mit Recap",
  "order-log": "Log fuer das Order-Projekt",
  "ttrpg": "Rollenspiel: Sessions, Welten, Figuren",
  "hobby": "Andere Freizeit und Erholung",
  "reflexion": "Gefuehrte Schreibpfade (Pennebaker, Nuclear Episodes)"
};
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
    for (const t of TYPEN) {
      new import_obsidian.Setting(this.contentEl).setName(t).setDesc(TYP_TEXT[t]).addButton((b) => b.setButtonText("Waehlen").onClick(() => {
        this.onChoose(t);
        this.close();
      }));
    }
  }
};
var JournalModal = class extends import_obsidian.Modal {
  constructor(app, onFertig) {
    super(app);
    this.onFertig = onFertig;
    this.daten = { titel: "", valence: 5, arousal: 5, belastung: 5, koerper: 5, kontexte: [], ausnahme: false };
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
    c.createEl("h3", { text: "Journal-Eintrag" });
    c.createEl("p", { text: "Optional ein Titel, dann vier Werte von 0 bis 10 und die Kontexte. Der Eintrag wird unter eintraege/ als journal angelegt, sofort freigegeben und zum Schreiben geoeffnet. Mehrere Eintraege pro Tag sind erlaubt." });
    new import_obsidian.Setting(c).setName("Titel (optional)").addText((t) => t.setPlaceholder("z.B. Nach der Lehre").onChange((v) => {
      this.daten.titel = v;
    }));
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
    new import_obsidian.Setting(c).setName("Ausnahme-Ereignis").setDesc("Etwas Aussergewoehnliches ist passiert.").addToggle((t) => t.setValue(false).onChange((v) => {
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
    this.addCommand({ id: "ariadne-journal", name: "Ariadne: Neuer Journal-Eintrag", callback: () => this.oeffneJournalEintrag() });
    this.addCommand({ id: "ariadne-markierung", name: "Ariadne: Markierung umschalten", callback: () => this.toggleMarkierung() });
    this.addCommand({ id: "ariadne-analyse", name: "Ariadne: Analyse in dieser Notiz verankern", editorCallback: (editor) => this.verankern(editor) });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: markieren").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Analyse verankern").setIcon("sparkles").onClick(() => {
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
    menu.addItem((i) => i.setTitle("Neuer Journal-Eintrag (Slider-Abfrage)").setIcon("activity").onClick(() => this.oeffneJournalEintrag()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Markierung umschalten").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
    menu.addItem((i) => i.setTitle("Analyse in dieser Notiz verankern").setIcon("sparkles").onClick(() => {
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
  oeffneJournalEintrag() {
    new JournalModal(this.app, async (d) => {
      await this.erstelleJournalEintrag(d);
    }).open();
  }
  async sichererOrdner(pfad) {
    if (!await this.app.vault.adapter.exists(pfad)) {
      try {
        await this.app.vault.createFolder(pfad);
      } catch (e) {
      }
    }
  }
  async erstelleJournalEintrag(d) {
    const iso = (0, import_obsidian.moment)().format("YYYY-MM-DD");
    const zeit = (0, import_obsidian.moment)().format("HH:mm");
    const pfad = "eintraege/" + (0, import_obsidian.moment)().format("YYYY-MM-DD-HHmm") + ".md";
    const titel = d.titel.trim().length > 0 ? d.titel.trim() : iso + " " + zeit;
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
      "uhrzeit: " + zeit,
      "zustand: gesprochen",
      "valence: " + String(d.valence),
      "arousal: " + String(d.arousal),
      "belastung: " + String(d.belastung),
      "koerper: " + String(d.koerper),
      "kontexte: " + kontexte,
      "ausnahme: " + (d.ausnahme ? "true" : "false"),
      "---",
      "",
      "# " + titel,
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
    await this.sichererOrdner("eintraege");
    try {
      const f = await this.app.vault.create(pfad, zeilen.join("\n"));
      await this.app.workspace.getLeaf(true).openFile(f);
      new import_obsidian.Notice("Ariadne: Journal-Eintrag angelegt und freigegeben.");
    } catch (e) {
      new import_obsidian.Notice("Ariadne: Konnte den Journal-Eintrag nicht anlegen.");
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
    await this.sichererOrdner("reflexionen");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1lbnUsIE1vZGFsLCBtb21lbnQsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCByZXF1ZXN0VXJsLCBTZXR0aW5nLCBURmlsZSB9IGZyb20gXCJvYnNpZGlhblwiO1xuXG5pbnRlcmZhY2UgQXJpYWRuZVNldHRpbmdzIHtcbiAgZW5kcG9pbnQ6IHN0cmluZztcbiAgbW9kZWw6IHN0cmluZztcbiAgdGVtcGVyYXR1cmU6IG51bWJlcjtcbiAga29udGV4dEVpbmJlemllaGVuOiBib29sZWFuO1xuICBrb250ZXh0QW56YWhsOiBudW1iZXI7XG4gIHByb3Rva29sbDogc3RyaW5nO1xuICBzY2hyaXR0OiBudW1iZXI7XG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IEFyaWFkbmVTZXR0aW5ncyA9IHtcbiAgZW5kcG9pbnQ6IFwiaHR0cDovLzEyNy4wLjAuMToxMTQzNFwiLFxuICBtb2RlbDogXCJsbGFtYTMuMlwiLFxuICB0ZW1wZXJhdHVyZTogMC40LFxuICBrb250ZXh0RWluYmV6aWVoZW46IHRydWUsXG4gIGtvbnRleHRBbnphaGw6IDgsXG4gIHByb3Rva29sbDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgc2Nocml0dDogMFxufTtcblxuY29uc3QgVFlQRU46IHN0cmluZ1tdID0gW1wiam91cm5hbFwiLCBcImltcHVsc1wiLCBcIm9yZGVyLWxvZ1wiLCBcInR0cnBnXCIsIFwibWVldGluZ1wiLCBcImhvYmJ5XCIsIFwicmVmbGV4aW9uXCJdO1xuXG5jb25zdCBUWVBfVEVYVDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgXCJqb3VybmFsXCI6IFwiVGFnZXMtIHVuZCBBYmVuZHJlZmxleGlvbiBtaXQgU2xpZGVyLUFiZnJhZ2VcIixcbiAgXCJpbXB1bHNcIjogXCJTaXR1YXRpdmVyIEVpbnRyYWcgdW50ZXJ3ZWdzLCBvaG5lIFNsaWRlclwiLFxuICBcIm1lZXRpbmdcIjogXCJVbmktIG9kZXIgRGllbnN0c2l0enVuZyBtaXQgUmVjYXBcIixcbiAgXCJvcmRlci1sb2dcIjogXCJMb2cgZnVlciBkYXMgT3JkZXItUHJvamVrdFwiLFxuICBcInR0cnBnXCI6IFwiUm9sbGVuc3BpZWw6IFNlc3Npb25zLCBXZWx0ZW4sIEZpZ3VyZW5cIixcbiAgXCJob2JieVwiOiBcIkFuZGVyZSBGcmVpemVpdCB1bmQgRXJob2x1bmdcIixcbiAgXCJyZWZsZXhpb25cIjogXCJHZWZ1ZWhydGUgU2NocmVpYnBmYWRlIChQZW5uZWJha2VyLCBOdWNsZWFyIEVwaXNvZGVzKVwiXG59O1xuXG5jb25zdCBLT05URVhURTogc3RyaW5nW10gPSBbXCJMZWhyZVwiLCBcIkZvcnNjaHVuZ1wiLCBcIkFkbWluXCIsIFwiU3BvcnRcIiwgXCJTb3ppYWxcIiwgXCJGYW1pbGllXCIsIFwiQWxsZWluXCJdO1xuXG5jb25zdCBNQVJLRVIgPSBcIiUlYXJpYWRuZS1hbmFseXNlJSVcIjtcblxuLy8gS1JJU1RFUk1FOiBOdXIgZXJnYWVuemVuLCBuaWVtYWxzIHNjaHdhZWNoZW4gKHNpZWhlIEFHRU5UUy5tZCkuXG5jb25zdCBLUklTVEVSTUU6IHN0cmluZ1tdID0gW1xuICBcInN1aXppZFwiLFxuICBcInN1aXppZGdlZGFua2VcIixcbiAgXCJzdWl6aWRhYnNpY2h0XCIsXG4gIFwic2VsYnN0bW9yZFwiLFxuICBcInNlbGJzdHZlcmxldHpcIixcbiAgXCJ0b2Rlc3d1bnNjaFwiLFxuICBcIm5pY2h0IG1laHIgd2VpdGVybGViZW5cIixcbiAgXCJuaWNodCBtZWhyIGxlYmVuIHdvbGxlblwiLFxuICBcImxlYmVuIGJlZW5kZW5cIixcbiAgXCJzdHVyemtyaXNlXCIsXG4gIFwiYWt1dGUga3Jpc2VcIixcbiAgXCJvaG5tYWNodFwiLFxuICBcInBhbmlrYXR0YWNrZVwiXG5dO1xuXG5jb25zdCBBTkFMWVNFX1BST01QVCA9IFtcbiAgXCJEdSBiaXN0IGRlciBTcGFycmluZ3NwYXJ0bmVyIGluIGVpbmVtIGV2aWRlbnpiYXNpZXJ0ZW4gSm91cm5hbGluZy1TeXN0ZW0gbmFtZW5zIEFyaWFkbmUuXCIsXG4gIFwiR3J1bmRoYWx0dW5nOiBrb2xsZWdpYWwsIHByYWV6aXNlLCBoYXJ0IGluIGRlciBTYWNoZSwgaGVyemxpY2ggaW4gZGVyIEZvcm0uIER1IGJpc3Qga2VpbiBUaGVyYXBldXQuXCIsXG4gIFwiXCIsXG4gIFwiQXVmZ2FiZTogQW5hbHlzaWVyZSBkaWUgQUtUVUVMTEUgTk9USVouIERlciBLT05URVhUIGZyZWlnZWdlYmVuZXIgTm90aXplbiBpc3QgSGludGVyZ3J1bmQsIG5pY2h0IEhhdXB0b2JqZWt0LlwiLFxuICBcIlwiLFxuICBcIlJlZ2VsbjpcIixcbiAgXCIxLiBOdXIgYmVsZWdiYXJlIEJlb2JhY2h0dW5nZW46IHZlcndlaXNlIGF1ZiBrb25rcmV0ZSBTdGVsbGVuIGRlciBOb3RpeiAoWml0YXRlLCBaYWhsZW4sIEZyb250bWF0dGVyLVdlcnRlKS5cIixcbiAgXCIyLiBTdWNoZSBha3RpdiBuYWNoIEdlZ2VuYmVpc3BpZWxlbiwgYmV2b3IgZHUgZWluIE11c3RlciBiZWhhdXB0ZXN0IChCZXN0YWV0aWd1bmdzZmVobGVyLUJyZW1zZSkuXCIsXG4gIFwiMy4gV2VubiBGcm9udG1hdHRlci1XZXJ0ZSB2b3JoYW5kZW4gc2luZCAoU2xpZGVyLCB0eXApOiBwcnVlZmUsIG9iIHNpZSB6dW0gVG9uIGRlcyBUZXh0ZXMgcGFzc2VuLiBEaXNrcmVwYW56ZW4gYmVuZW5uc3QgZHUgZGlyZWt0LlwiLFxuICBcIjQuIFNwcmljaCBGYWt0ZW4gVU5EIEdlZnVlaGxlIGFuLCBuaWUgbnVyIGVpbmVzIHZvbiBiZWlkZW0uXCIsXG4gIFwiNS4gS2VpbmUgRGlhZ25vc2VuLCBrZWluZSBUaGVyYXBpZXZvcnNjaGxhZWdlLCBrZWluZSBTZWxic3RvcHRpbWllcnVuZ3MtUmhldG9yaWsuXCIsXG4gIFwiNi4gQmVpIGFrdXRlbiBLcmlzZW5zaWduYWxlbiBpbiBkZXIgTm90aXo6IHVudGVyYnJpY2ggZGllIEFuYWx5c2UsIGJlbmVubmUga2xhciB1bmQgcmVzcGVrdHZvbGwgZGllIEdyZW56ZSB1bmQgdmVyd2Vpc2UgYXVmIFRlbGVmb25zZWVsc29yZ2UgKDA4MDAgMTExIDAgMTExLCAwODAwIDExMSAwIDIyMikgdW5kIGltIE5vdGZhbGwgMTEyLlwiLFxuICBcIjcuIE1heGltYWwgZHJlaSBCZW9iYWNodHVuZ2VuIG9kZXIgTXVzdGVyLUh5cG90aGVzZW4sIGRhbm4gZ2VuYXUgZWluZSBvZmZlbmUgRnJhZ2UuXCIsXG4gIFwiXCIsXG4gIFwiU3RydWt0dXIgZGVpbmVyIEFudHdvcnQ6XCIsXG4gIFwiQmVvYmFjaHR1bmdlbjogKGt1cnplIExpc3RlIG1pdCBCZWxlZ2VuKVwiLFxuICBcIkF1ZmZhZWxsaWc6IChtYXhpbWFsIHp3ZWkgSHlwb3RoZXNlbiwgamVkZSBtaXQgR2VnZW5iZWlzcGllbC1QcnVlZnVuZylcIixcbiAgXCJGcmFnZTogKGdlbmF1IGVpbmUsIHp1bSBXZWl0ZXJkZW5rZW4pXCIsXG4gIFwiXCIsXG4gIFwiQW50d29ydGUgYXVmIERldXRzY2ggdW5kIGJsZWliZSB1bnRlciAyNTAgV29lcnRlcm4uXCJcbl0uam9pbihcIlxcblwiKTtcblxuaW50ZXJmYWNlIFJlZmxleGlvbnNTY2hyaXR0IHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgYW5sZWl0dW5nOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFJlZmxleGlvbnNQcm90b2tvbGwge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjaHJpdHRlOiBSZWZsZXhpb25zU2Nocml0dFtdO1xufVxuXG5jb25zdCBQUk9UT0tPTExFOiBSZWZsZXhpb25zUHJvdG9rb2xsW10gPSBbXG4gIHtcbiAgICBpZDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgICBuYW1lOiBcIlBlbm5lYmFrZXItRXBpc29kZSAoMyBTY2hyaXR0ZSwgamUgMTUgYmlzIDIwIE1pbnV0ZW4sIGFuIGF1ZmVpbmFuZGVyZm9sZ2VuZGVuIFRhZ2VuKVwiLFxuICAgIHNjaHJpdHRlOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIkZha3RlblwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIldhZWhsZSBFSU5FIGtvbmtyZXRlIEVwaXNvZGUgZGVyIGxldHp0ZW4gc2llYmVuIFRhZ2UuXCIsXG4gICAgICAgICAgXCJTY2hyZWliZSAxNSBiaXMgMjAgTWludXRlbiBudXIgZGFydWViZXIsIHdhcyB0YXRzYWVjaGxpY2ggcGFzc2llcnQgaXN0OiBPcnQsIEJldGVpbGlndGUsIEFibGF1ZiwgRGVpbmUgSGFuZGx1bmdlbi4gS2VpbmUgQmV3ZXJ0dW5nLCBrZWluZSBEZXV0dW5nLiBFaW5lIEZha3RlbmxhZ2Ugd2llIGVpbiBQcm90b2tvbGwuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiR2VmdWVobGUgdW5kIEtvZXJwZXJcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJOaW1tIGRpZXNlbGJlIEVwaXNvZGUgZXJuZXV0LlwiLFxuICAgICAgICAgIFwiU2NocmVpYmUgMTUgYmlzIDIwIE1pbnV0ZW4gZGllc21hbCBudXIgdWViZXIgRGVpbmUgR2VmdWVobGUgdW5kIERlaW5lIEtvZXJwZXJlcmZhaHJ1bmc6IFdhcyBoYXN0IER1IGluIGRlciBTaXR1YXRpb24gZ2VmdWVobHQsIHdvIGltIEtvZXJwZXIgaGFzdCBEdSBlcyBnZXNwdWVydCwgd2FzIGRhdm9uIGlzdCBoZXV0ZSBub2NoIGRhLiBGYWt0ZW4gbnVyIGFscyBBbmtlciwgd2VubiBEdSBzaWUgYnJhdWNoc3QuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiVmVya251ZXBmdW5nIHVuZCBQZXJzcGVrdGl2ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIlp1bSBkcml0dGVuIE1hbCBkaWVzZWxiZSBFcGlzb2RlOiBXYXMgYmVkZXV0ZW4gRmFrdGVuIHVuZCBHZWZ1ZWhsZSB6dXNhbW1lbj9cIixcbiAgICAgICAgICBcIldhcyB3dWVyZGUgZWluIGF1c3NlbnN0ZWhlbmRlciwgd29obHdvbGxlbmRlciBCZW9iYWNodGVyIHNlaGVuPyBXZWxjaGVyIG5hZWNoc3RlIFNjaHJpdHQgZXJnaWJ0IHNpY2g/IFNjaGxpZXNzZSBtaXQgZWluZW0gU2F0eiwgZGVuIER1IGluIHp3ZWkgV29jaGVuIHdpZWRlcmxlc2VuIHdpbGxzdC5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgaWQ6IFwibnVjbGVhci1lcGlzb2Rlc1wiLFxuICAgIG5hbWU6IFwiTnVjbGVhciBFcGlzb2RlcyAocHJhZWdlbmRlIFdlbmRlcHVua3RlLCAyMCBiaXMgMzAgTWludXRlbilcIixcbiAgICBzY2hyaXR0ZTogW1xuICAgICAge1xuICAgICAgICB0aXRlbDogXCJXZW5kZXB1bmt0ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIkRlbmtlIGFuIHp3ZWkgYmlzIGRyZWkgcHJhZWdlbmRlIFdlbmRlcHVua3RlIGRlaW5lcyBMZWJlbnN3ZWdzLCBpbnNiZXNvbmRlcmUgZGVyIGxldHp0ZW4gSmFocmUuXCIsXG4gICAgICAgICAgXCJCZXNjaHJlaWJlIGZ1ZXIgamVkZW46IFdhcyBnZXNjaGFoLCB3YXMgaGFldHRlc3QgZHUgZGlyIGRhbWFscyBnZXd1ZW5zY2h0LCB3YXMgaGF0IHNpY2ggZGFyYXVzIGVudHdpY2tlbHQsIHVuZCB3ZWxjaGUgQWhudW5nIGhhc3QgZHUgaGV1dGUsIHdvenUgZXMgZ3V0IHdhciBvZGVyIG5vY2ggd2VyZGVuIGtvZW5udGUuXCIsXG4gICAgICAgICAgXCJOaW1tIGRpciBkYWZ1ZXIgMjAgYmlzIDMwIE1pbnV0ZW4gaW4gUnVoZS5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9XG5dO1xuXG5pbnRlcmZhY2UgSm91cm5hbERhdGVuIHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgdmFsZW5jZTogbnVtYmVyO1xuICBhcm91c2FsOiBudW1iZXI7XG4gIGJlbGFzdHVuZzogbnVtYmVyO1xuICBrb2VycGVyOiBudW1iZXI7XG4gIGtvbnRleHRlOiBzdHJpbmdbXTtcbiAgYXVzbmFobWU6IGJvb2xlYW47XG59XG5cbmNsYXNzIFR5cE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkNob29zZTogKHR5cDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJOb3RpeiBmdWVyIEFyaWFkbmUgZnJlaWdlYmVuXCIgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJXZWxjaGVyIEFydCBpc3QgZGllc2UgTm90aXo/IERlciBUeXAgc3RldWVydCBkaWUgc3BhZXRlcmUgQXVzd2VydHVuZy5cIiB9KTtcbiAgICBmb3IgKGNvbnN0IHQgb2YgVFlQRU4pIHtcbiAgICAgIG5ldyBTZXR0aW5nKHRoaXMuY29udGVudEVsKS5zZXROYW1lKHQpLnNldERlc2MoVFlQX1RFWFRbdF0pXG4gICAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIldhZWhsZW5cIikub25DbGljaygoKSA9PiB7IHRoaXMub25DaG9vc2UodCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBKb3VybmFsTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgZGF0ZW46IEpvdXJuYWxEYXRlbiA9IHsgdGl0ZWw6IFwiXCIsIHZhbGVuY2U6IDUsIGFyb3VzYWw6IDUsIGJlbGFzdHVuZzogNSwga29lcnBlcjogNSwga29udGV4dGU6IFtdLCBhdXNuYWhtZTogZmFsc2UgfTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkZlcnRpZzogKGQ6IEpvdXJuYWxEYXRlbikgPT4gdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBwcml2YXRlIGJhdWVTbGlkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdGl0ZWw6IHN0cmluZywgaGlud2Vpczogc3RyaW5nLCBvbldlcnQ6IChuOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICBjb250YWluZXIuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogdGl0ZWwgKyBcIiAoXCIgKyBoaW53ZWlzICsgXCIpXCIgfSk7XG4gICAgY29uc3QgcmVpaGUgPSBjb250YWluZXIuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwiYXJpYWRuZS1zbGlkZXItemVpbGVcIiB9KTtcbiAgICBjb25zdCBpbnB1dCA9IHJlaWhlLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInJhbmdlXCIgfSk7XG4gICAgaW5wdXQubWluID0gXCIwXCI7XG4gICAgaW5wdXQubWF4ID0gXCIxMFwiO1xuICAgIGlucHV0LnN0ZXAgPSBcIjFcIjtcbiAgICBpbnB1dC52YWx1ZSA9IFwiNVwiO1xuICAgIGNvbnN0IGFuemVpZ2UgPSByZWloZS5jcmVhdGVFbChcInNwYW5cIiwgeyB0ZXh0OiBcIjVcIiB9KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgbiA9IHBhcnNlSW50KGlucHV0LnZhbHVlLCAxMCk7XG4gICAgICBhbnplaWdlLnNldFRleHQoU3RyaW5nKG4pKTtcbiAgICAgIG9uV2VydChuKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICBjb25zdCBjID0gdGhpcy5jb250ZW50RWw7XG4gICAgYy5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJKb3VybmFsLUVpbnRyYWdcIiB9KTtcbiAgICBjLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiT3B0aW9uYWwgZWluIFRpdGVsLCBkYW5uIHZpZXIgV2VydGUgdm9uIDAgYmlzIDEwIHVuZCBkaWUgS29udGV4dGUuIERlciBFaW50cmFnIHdpcmQgdW50ZXIgZWludHJhZWdlLyBhbHMgam91cm5hbCBhbmdlbGVndCwgc29mb3J0IGZyZWlnZWdlYmVuIHVuZCB6dW0gU2NocmVpYmVuIGdlb2VmZm5ldC4gTWVocmVyZSBFaW50cmFlZ2UgcHJvIFRhZyBzaW5kIGVybGF1YnQuXCIgfSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIlRpdGVsIChvcHRpb25hbClcIikuYWRkVGV4dCgodCkgPT4gdC5zZXRQbGFjZWhvbGRlcihcInouQi4gTmFjaCBkZXIgTGVocmVcIikub25DaGFuZ2UoKHYpID0+IHsgdGhpcy5kYXRlbi50aXRlbCA9IHY7IH0pKTtcbiAgICB0aGlzLmJhdWVTbGlkZXIoYywgXCJWYWxlbnpcIiwgXCIwIHVuYW5nZW5laG0sIDEwIGFuZ2VuZWhtXCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4udmFsZW5jZSA9IG47IH0pO1xuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIkFrdGl2aWVydW5nXCIsIFwiMCBydWhpZywgMTAgYWt0aXZpZXJ0XCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4uYXJvdXNhbCA9IG47IH0pO1xuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIkJlbGFzdHVuZ1wiLCBcIjAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50XCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4uYmVsYXN0dW5nID0gbjsgfSk7XG4gICAgdGhpcy5iYXVlU2xpZGVyKGMsIFwiS29lcnBlclwiLCBcIjAgdmVyc3Bhbm50LCAxMCBmcmVpXCIsIChuKSA9PiB7IHRoaXMuZGF0ZW4ua29lcnBlciA9IG47IH0pO1xuICAgIGMuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJLb250ZXh0ZSBoZXV0ZSAoTWVocmZhY2h3YWhsKVwiIH0pO1xuICAgIGNvbnN0IGthY2hlbG4gPSBjLmNyZWF0ZUVsKFwiZGl2XCIsIHsgY2xzOiBcImFyaWFkbmUta2FjaGVsblwiIH0pO1xuICAgIGZvciAoY29uc3QgayBvZiBLT05URVhURSkge1xuICAgICAgY29uc3QgYiA9IGthY2hlbG4uY3JlYXRlRWwoXCJidXR0b25cIiwgeyB0ZXh0OiBrLCBjbHM6IFwiYXJpYWRuZS1rYWNoZWxcIiB9KTtcbiAgICAgIGIudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgICBiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZGF0ZW4ua29udGV4dGUuaW5kZXhPZihrKTtcbiAgICAgICAgaWYgKHBvcyA9PT0gLTEpIHsgdGhpcy5kYXRlbi5rb250ZXh0ZS5wdXNoKGspOyBiLmFkZENsYXNzKFwiYXJpYWRuZS1rYWNoZWwtYWt0aXZcIik7IH1cbiAgICAgICAgZWxzZSB7IHRoaXMuZGF0ZW4ua29udGV4dGUuc3BsaWNlKHBvcywgMSk7IGIucmVtb3ZlQ2xhc3MoXCJhcmlhZG5lLWthY2hlbC1ha3RpdlwiKTsgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJBdXNuYWhtZS1FcmVpZ25pc1wiKS5zZXREZXNjKFwiRXR3YXMgQXVzc2VyZ2V3b2VobmxpY2hlcyBpc3QgcGFzc2llcnQuXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKGZhbHNlKS5vbkNoYW5nZSgodikgPT4geyB0aGlzLmRhdGVuLmF1c25haG1lID0gdjsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJFaW50cmFnIGFubGVnZW5cIikuc2V0Q3RhKCkub25DbGljaygoKSA9PiB7IHRoaXMub25GZXJ0aWcodGhpcy5kYXRlbik7IHRoaXMuY2xvc2UoKTsgfSkpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJBYmJyZWNoZW5cIikub25DbGljaygoKSA9PiB0aGlzLmNsb3NlKCkpKTtcbiAgfVxufVxuXG5jbGFzcyBSZWZsZXhpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcGx1Z2luOiBBcmlhZG5lUGx1Z2luLCBwcml2YXRlIHByb3Rva29sbDogUmVmbGV4aW9uc1Byb3Rva29sbCwgcHJpdmF0ZSBpZHg6IG51bWJlcikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgcyA9IHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlW3RoaXMuaWR4XTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogdGhpcy5wcm90b2tvbGwubmFtZSB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlNjaHJpdHQgXCIgKyAodGhpcy5pZHggKyAxKSArIFwiIHZvbiBcIiArIHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlLmxlbmd0aCArIFwiOiBcIiArIHMudGl0ZWwgfSk7XG4gICAgZm9yIChjb25zdCBhIG9mIHMuYW5sZWl0dW5nKSB7XG4gICAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBhIH0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5pbW0gZGlyIGRpZSBaZWl0IGluIFJ1aGUuIEVpbiBTY2hyaXR0IHBybyBUYWcsIG5pY2h0IG1laHIuXCIgfSk7XG4gICAgbmV3IFNldHRpbmcodGhpcy5jb250ZW50RWwpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJTaXR6dW5nIHN0YXJ0ZW5cIikuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7IGF3YWl0IHRoaXMucGx1Z2luLnN0YXJ0ZVNpdHp1bmcodGhpcy5wcm90b2tvbGwsIHRoaXMuaWR4KTsgdGhpcy5jbG9zZSgpOyB9KSlcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIlNjaHJpdHQgYWJzY2hsaWVzc2VuXCIpLm9uQ2xpY2soYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5zY2hyaXR0QWJzY2hsaWVzc2VuKHRoaXMucHJvdG9rb2xsLCB0aGlzLmlkeCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICB9XG59XG5cbmNsYXNzIEFyaWFkbmVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHBsdWdpbjogQXJpYWRuZVBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKSB7XG4gICAgY29uc3QgYyA9IHRoaXMuY29udGFpbmVyRWw7XG4gICAgYy5lbXB0eSgpO1xuICAgIGMuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQXJpYWRuZVwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJFbmRwdW5rdFwiKS5zZXREZXNjKFwiT3BlbkFJLWtvbXBhdGlibGVyIGxva2FsZXIgRW5kcHVua3QuIFN0YW5kYXJkOiBPbGxhbWEgYXVmIGRpZXNlbSBHZXJhZXQuXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRQbGFjZWhvbGRlcihcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIikuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5kcG9pbnQpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmRwb2ludCA9IHYudHJpbSgpOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJNb2RlbGxcIikuc2V0RGVzYyhcInouQi4gbGxhbWEzLjIsIG1pc3RyYWwtc21hbGxcIilcbiAgICAgIC5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm1vZGVsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZWwgPSB2LnRyaW0oKTsgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiVGVtcGVyYXR1clwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnRlbXBlcmF0dXJlKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGNvbnN0IG4gPSBwYXJzZUZsb2F0KHYucmVwbGFjZShcIixcIiwgXCIuXCIpKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGVyYXR1cmUgPSBpc05hTihuKSA/IDAuNCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIktvbnRleHQgZnJlaWdlZ2ViZW5lciBOb3RpemVuXCIpLnNldERlc2MoXCJCZWkgamVkZXIgQW5hbHlzZTogS29udGV4dCBhdXMgZnJlaWdlZ2ViZW5lbiBOb3RpemVuIGRlc3NlbGJlbiBWYXVsdHMgZWluYmV6aWVoZW4uXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbilcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbiA9IHY7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFuemFobCBLb250ZXh0bm90aXplblwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRBbnphaGwpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgY29uc3QgbiA9IHBhcnNlSW50KHYsIDEwKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua29udGV4dEFuemFobCA9IGlzTmFOKG4pID8gOCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgY29uc3QgZHJvcCA9IG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJSZWZsZXhpb25zcHJvdG9rb2xsXCIpLnNldERlc2MoXCJEZXIgUGZhZCwgZGVuIFJlZmxla3RpZXJlbiB3ZWl0ZXJmdWVocnQuXCIpO1xuICAgIGRyb3AuYWRkRHJvcGRvd24oKGQpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBQUk9UT0tPTExFKSB7IGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7IH1cbiAgICAgIGQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsID0gdjsgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2Nocml0dCA9IDA7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB0aGlzLmRpc3BsYXkoKTsgfSk7XG4gICAgfSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFrdHVlbGxlciBTY2hyaXR0XCIpLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnNjaHJpdHQgKyAxKSkuc2V0RGlzYWJsZWQodHJ1ZSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJLcmlzZW53ZWl0ZXJsZWl0dW5nXCIpLnNldERlc2MoXCJCZWkgS3Jpc2Vuc2lnbmFsZW4gYnJpY2h0IGplZGUgQXJpYWRuZS1BbmFseXNlIGFiLiBUZWxlZm9uc2VlbHNvcmdlOiAwODAwIDExMSAwIDExMSBvZGVyIDA4MDAgMTExIDAgMjIyLiBJbSBha3V0ZW4gTm90ZmFsbDogMTEyLlwiKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmlhZG5lUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEFyaWFkbmVTZXR0aW5ncztcblxuICBhc3luYyBvbmxvYWQoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSlcbiAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJnaXQtYnJhbmNoXCIsIFwiQXJpYWRuZVwiLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB0aGlzLm9lZmZuZU1lbnVlKGV2dCkpO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtam91cm5hbFwiLCBuYW1lOiBcIkFyaWFkbmU6IE5ldWVyIEpvdXJuYWwtRWludHJhZ1wiLCBjYWxsYmFjazogKCkgPT4gdGhpcy5vZWZmbmVKb3VybmFsRWludHJhZygpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtbWFya2llcnVuZ1wiLCBuYW1lOiBcIkFyaWFkbmU6IE1hcmtpZXJ1bmcgdW1zY2hhbHRlblwiLCBjYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkgfSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1hbmFseXNlXCIsIG5hbWU6IFwiQXJpYWRuZTogQW5hbHlzZSBpbiBkaWVzZXIgTm90aXogdmVyYW5rZXJuXCIsIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IpID0+IHRoaXMudmVyYW5rZXJuKGVkaXRvcikgfSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1yZWZsZWt0aWVyZW5cIiwgbmFtZTogXCJBcmlhZG5lOiBSZWZsZWt0aWVyZW4gLSBuYWVjaHN0ZXIgU2Nocml0dFwiLCBjYWxsYmFjazogKCkgPT4gdGhpcy5yZWZsZWt0aWVyZW4oKSB9KTtcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZWRpdG9yLW1lbnVcIiwgKG1lbnU6IE1lbnUpID0+IHtcbiAgICAgIG1lbnUuYWRkU2VwYXJhdG9yKCk7XG4gICAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBcmlhZG5lOiBtYXJraWVyZW5cIikuc2V0SWNvbihcImJvb2ttYXJrXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkpKTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFyaWFkbmU6IEFuYWx5c2UgdmVyYW5rZXJuXCIpLnNldEljb24oXCJzcGFya2xlc1wiKS5vbkNsaWNrKCgpID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgIGlmICh2aWV3KSB7IHRoaXMudmVyYW5rZXJuKHZpZXcuZWRpdG9yKTsgfVxuICAgICAgfSkpO1xuICAgICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiQXJpYWRuZTogUmVmbGVrdGllcmVuXCIpLnNldEljb24oXCJmb290cHJpbnRzXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy5yZWZsZWt0aWVyZW4oKSkpO1xuICAgIH0pKTtcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IEFyaWFkbmVTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgb2VmZm5lTWVudWUoZXZ0OiBNb3VzZUV2ZW50KSB7XG4gICAgY29uc3QgbWVudSA9IG5ldyBNZW51KCk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiTmV1ZXIgSm91cm5hbC1FaW50cmFnIChTbGlkZXItQWJmcmFnZSlcIikuc2V0SWNvbihcImFjdGl2aXR5XCIpLm9uQ2xpY2soKCkgPT4gdGhpcy5vZWZmbmVKb3VybmFsRWludHJhZygpKSk7XG4gICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJNYXJraWVydW5nIHVtc2NoYWx0ZW5cIikuc2V0SWNvbihcImJvb2ttYXJrXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkpKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBbmFseXNlIGluIGRpZXNlciBOb3RpeiB2ZXJhbmtlcm5cIikuc2V0SWNvbihcInNwYXJrbGVzXCIpLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICBpZiAodmlldykgeyB0aGlzLnZlcmFua2Vybih2aWV3LmVkaXRvcik7IH0gZWxzZSB7IG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLZWluZSBOb3RpeiBpbSBGb2t1cy5cIik7IH1cbiAgICB9KSk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiUmVmbGVrdGllcmVuIC0gbmFlY2hzdGVyIFNjaHJpdHRcIikuc2V0SWNvbihcImZvb3RwcmludHNcIikub25DbGljaygoKSA9PiB0aGlzLnJlZmxla3RpZXJlbigpKSk7XG4gICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJDaGF0IG1pdCBkZW0gbG9rYWxlbiBNb2RlbGwgKGZvbGd0KVwiKS5zZXRJY29uKFwibWVzc2FnZS1jaXJjbGVcIikub25DbGljaygoKSA9PiBuZXcgTm90aWNlKFwiQXJpYWRuZTogRGVyIENoYXQgZm9sZ3QgYWxzIE00LiBCaXMgZGFoaW46IENvcGlsb3QgZm9yIE9ic2lkaWFuIG1pdCBkZW0gU3BhcnJpbmctUHJvbXB0LlwiKSkpO1xuICAgIG1lbnUuc2hvd0F0TW91c2VFdmVudChldnQpO1xuICB9XG5cbiAgb2VmZm5lSm91cm5hbEVpbnRyYWcoKSB7XG4gICAgbmV3IEpvdXJuYWxNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKGQ6IEpvdXJuYWxEYXRlbikgPT4geyBhd2FpdCB0aGlzLmVyc3RlbGxlSm91cm5hbEVpbnRyYWcoZCk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2ljaGVyZXJPcmRuZXIocGZhZDogc3RyaW5nKSB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGZhZCkpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIocGZhZCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9yZG5lciBrYW5uIHNjaG9uIGV4aXN0aWVyZW4sIGlnbm9yaWVyZW4uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZXJzdGVsbGVKb3VybmFsRWludHJhZyhkOiBKb3VybmFsRGF0ZW4pIHtcbiAgICBjb25zdCBpc28gPSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuICAgIGNvbnN0IHplaXQgPSBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcbiAgICBjb25zdCBwZmFkID0gXCJlaW50cmFlZ2UvXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLURELUhIbW1cIikgKyBcIi5tZFwiO1xuICAgIGNvbnN0IHRpdGVsID0gZC50aXRlbC50cmltKCkubGVuZ3RoID4gMCA/IGQudGl0ZWwudHJpbSgpIDogaXNvICsgXCIgXCIgKyB6ZWl0O1xuICAgIGNvbnN0IGtvbnRleHRlID0gZC5rb250ZXh0ZS5sZW5ndGggPT09IDAgPyBcIltdXCIgOiBcIltcIiArIGQua29udGV4dGUuam9pbihcIiwgXCIpICsgXCJdXCI7XG4gICAgY29uc3QgYmFzZWxpbmUgPSBbXG4gICAgICBcIlZhbGVueiBcIiArIFN0cmluZyhkLnZhbGVuY2UpICsgXCIvMTAgKDAgdW5hbmdlbmVobSwgMTAgYW5nZW5laG0pXCIsXG4gICAgICBcIkFrdGl2aWVydW5nIFwiICsgU3RyaW5nKGQuYXJvdXNhbCkgKyBcIi8xMCAoMCBydWhpZywgMTAgYWt0aXZpZXJ0KVwiLFxuICAgICAgXCJCZWxhc3R1bmcgXCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpICsgXCIvMTAgKDAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50KVwiLFxuICAgICAgXCJLb2VycGVyIFwiICsgU3RyaW5nKGQua29lcnBlcikgKyBcIi8xMCAoMCB2ZXJzcGFubnQsIDEwIGZyZWkpXCJcbiAgICBdLmpvaW4oXCIsIFwiKTtcbiAgICBjb25zdCB6ZWlsZW46IHN0cmluZ1tdID0gW1xuICAgICAgXCItLS1cIixcbiAgICAgIFwidHlwOiBqb3VybmFsXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwiZGF0dW06IFwiICsgaXNvLFxuICAgICAgXCJ1aHJ6ZWl0OiBcIiArIHplaXQsXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwidmFsZW5jZTogXCIgKyBTdHJpbmcoZC52YWxlbmNlKSxcbiAgICAgIFwiYXJvdXNhbDogXCIgKyBTdHJpbmcoZC5hcm91c2FsKSxcbiAgICAgIFwiYmVsYXN0dW5nOiBcIiArIFN0cmluZyhkLmJlbGFzdHVuZyksXG4gICAgICBcImtvZXJwZXI6IFwiICsgU3RyaW5nKGQua29lcnBlciksXG4gICAgICBcImtvbnRleHRlOiBcIiArIGtvbnRleHRlLFxuICAgICAgXCJhdXNuYWhtZTogXCIgKyAoZC5hdXNuYWhtZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgdGl0ZWwsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIyBCYXNlbGluZVwiLFxuICAgICAgXCJcIixcbiAgICAgIGJhc2VsaW5lLFxuICAgICAgXCJcIixcbiAgICAgIFwiS29udGV4dGU6IFwiICsgKGQua29udGV4dGUubGVuZ3RoID09PSAwID8gXCJrZWluZVwiIDogZC5rb250ZXh0ZS5qb2luKFwiLCBcIikpICsgKGQuYXVzbmFobWUgPyBcIiB8IEF1c25haG1lLUVyZWlnbmlzXCIgOiBcIlwiKSxcbiAgICAgIFwiXCIsXG4gICAgICBcIiMjIFdhcyB3YXIgaGV1dGVcIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkZha3RlbjogV2FzIGlzdCBwYXNzaWVydD9cIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkdlZnVlaGxlOiBXYXMgaGF0IGVzIG1pdCBtaXIgZ2VtYWNodD9cIixcbiAgICAgIFwiXCJcbiAgICBdO1xuICAgIGF3YWl0IHRoaXMuc2ljaGVyZXJPcmRuZXIoXCJlaW50cmFlZ2VcIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGYgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUocGZhZCwgemVpbGVuLmpvaW4oXCJcXG5cIikpO1xuICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSkub3BlbkZpbGUoZik7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogSm91cm5hbC1FaW50cmFnIGFuZ2VsZWd0IHVuZCBmcmVpZ2VnZWJlbi5cIik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtvbm50ZSBkZW4gSm91cm5hbC1FaW50cmFnIG5pY2h0IGFubGVnZW4uXCIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZnJvbnRtYXR0ZXJWb24oZmlsZTogVEZpbGUpOiBhbnkge1xuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgaWYgKGNhY2hlICYmIGNhY2hlLmZyb250bWF0dGVyKSB7IHJldHVybiBjYWNoZS5mcm9udG1hdHRlcjsgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgdG9nZ2xlTWFya2llcnVuZygpIHtcbiAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICBjb25zdCBmaWxlID0gdmlldyA/IHZpZXcuZmlsZSA6IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgaWYgKCFmaWxlKSB7IG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLZWluZSBha3RpdmUgTm90aXouXCIpOyByZXR1cm47IH1cbiAgICBjb25zdCBmbSA9IHRoaXMuZnJvbnRtYXR0ZXJWb24oZmlsZSk7XG4gICAgaWYgKGZtICYmIGZtW1wiYXJpYWRuZVwiXSA9PT0gdHJ1ZSkge1xuICAgICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucHJvY2Vzc0Zyb250TWF0dGVyKGZpbGUsIChmOiBhbnkpID0+IHsgZltcImFyaWFkbmVcIl0gPSBmYWxzZTsgfSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTWFya2llcnVuZyBlbnRmZXJudC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHR5cCA9IGZtID8gZm1bXCJ0eXBcIl0gOiBudWxsO1xuICAgIGlmICh0eXApIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gdHJ1ZTsgfSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTm90aXogZnJlaWdlZ2ViZW4gKHR5cDogXCIgKyBTdHJpbmcodHlwKSArIFwiKS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ldyBUeXBNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKHQ6IHN0cmluZykgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IHRydWU7IGZbXCJ0eXBcIl0gPSB0OyB9KTtcbiAgICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5vdGl6IGZyZWlnZWdlYmVuIGFscyBcIiArIHQgKyBcIi5cIik7XG4gICAgICB9KS5vcGVuKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmcmVpZ2VnZWJlbmVEYXRlaWVuKCk6IFRGaWxlW10ge1xuICAgIHJldHVybiB0aGlzLmFwcC52YXVsdC5nZXRNYXJrZG93bkZpbGVzKCkuZmlsdGVyKChmKSA9PiB7XG4gICAgICBjb25zdCBmbSA9IHRoaXMuZnJvbnRtYXR0ZXJWb24oZik7XG4gICAgICByZXR1cm4gZm0gIT09IG51bGwgJiYgZm1bXCJhcmlhZG5lXCJdID09PSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBrb250ZXh0QmlsZGVuKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZGF0ZWllbiA9IHRoaXMuZnJlaWdlZ2ViZW5lRGF0ZWllbigpXG4gICAgICAuc29ydCgoYSwgYikgPT4gYi5zdGF0Lm10aW1lIC0gYS5zdGF0Lm10aW1lKVxuICAgICAgLnNsaWNlKDAsIHRoaXMuc2V0dGluZ3Mua29udGV4dEFuemFobCk7XG4gICAgY29uc3QgdGVpbGU6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBkIG9mIGRhdGVpZW4pIHtcbiAgICAgIGNvbnN0IGZtID0gdGhpcy5mcm9udG1hdHRlclZvbihkKTtcbiAgICAgIGNvbnN0IHR5cCA9IGZtICYmIGZtW1widHlwXCJdID8gU3RyaW5nKGZtW1widHlwXCJdKSA6IFwib2huZS10eXBcIjtcbiAgICAgIGxldCB0ZXh0ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChkKTtcbiAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDEyMDApIHsgdGV4dCA9IHRleHQuc2xpY2UoMCwgMTIwMCkgKyBcIiAuLi5cIjsgfVxuICAgICAgdGVpbGUucHVzaChcIi0tLSBOb3RpejogXCIgKyBkLmJhc2VuYW1lICsgXCIgKHR5cDogXCIgKyB0eXAgKyBcIikgLS0tXCIpO1xuICAgICAgdGVpbGUucHVzaCh0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRlaWxlLmpvaW4oXCJcXG5cXG5cIik7XG4gIH1cblxuICBwcml2YXRlIGtyaXNlbmNoZWNrKHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIEtSSVNURVJNRS5zb21lKChrKSA9PiB0LmluY2x1ZGVzKGspKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb2xsYW1hQ2hhdChwcm9tcHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgdXJsID0gdGhpcy5zZXR0aW5ncy5lbmRwb2ludCArIFwiL3YxL2NoYXQvY29tcGxldGlvbnNcIjtcbiAgICBjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkoeyBtb2RlbDogdGhpcy5zZXR0aW5ncy5tb2RlbCwgbWVzc2FnZXM6IFt7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBwcm9tcHQgfV0sIHRlbXBlcmF0dXJlOiB0aGlzLnNldHRpbmdzLnRlbXBlcmF0dXJlLCBzdHJlYW06IGZhbHNlIH0pO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHJlcXVlc3RVcmwoeyB1cmw6IHVybCwgbWV0aG9kOiBcIlBPU1RcIiwgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LCBib2R5OiBib2R5LCB0aHJvdzogZmFsc2UgfSk7XG4gICAgaWYgKHJlcy5zdGF0dXMgPj0gNDAwKSB7IHRocm93IG5ldyBFcnJvcihcIkhUVFAgXCIgKyByZXMuc3RhdHVzICsgXCIgdm9uIFwiICsgdXJsKTsgfVxuICAgIGNvbnN0IGRhdGEgPSByZXMuanNvbjtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmNob2ljZXMgJiYgZGF0YS5jaG9pY2VzLmxlbmd0aCA+IDAgJiYgZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UgJiYgZGF0YS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCkge1xuICAgICAgcmV0dXJuIFN0cmluZyhkYXRhLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5ndWVsdGlnZSBBbnR3b3J0IHZvbSBFbmRwdW5rdC5cIik7XG4gIH1cblxuICBwcml2YXRlIGJhdWVCbG9jayhhbnR3b3J0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHplaWxlbiA9IGFudHdvcnQuc3BsaXQoXCJcXG5cIikubWFwKChsOiBzdHJpbmcpID0+IGwudHJpbSgpLmxlbmd0aCA+IDAgPyBcIj4gXCIgKyBsLnRyaW0oKSA6IFwiPlwiKTtcbiAgICBjb25zdCBrb3BmOiBzdHJpbmdbXSA9IFtcbiAgICAgIE1BUktFUixcbiAgICAgIFwiPiBbIWFyaWFkbmVdIEFyaWFkbmUtQW5hbHlzZVwiLFxuICAgICAgXCI+IEVyc3RlbGx0OiBcIiArIG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIikgKyBcIiB8IE1vZGVsbDogXCIgKyB0aGlzLnNldHRpbmdzLm1vZGVsICsgXCIgfCBQcm9tcHQ6IGFuYWx5c2UtdjFcIlxuICAgIF07XG4gICAgcmV0dXJuIGtvcGYuY29uY2F0KHplaWxlbikuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0emVCbG9jayhlZGl0b3I6IEVkaXRvciwgYmxvY2s6IHN0cmluZykge1xuICAgIGNvbnN0IGxpbmVzID0gZWRpdG9yLmdldFZhbHVlKCkuc3BsaXQoXCJcXG5cIik7XG4gICAgbGV0IHN0YXJ0ID0gLTE7XG4gICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaSA9IGkgLSAxKSB7XG4gICAgICBpZiAobGluZXNbaV0udHJpbSgpID09PSBNQVJLRVIpIHsgc3RhcnQgPSBpOyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICBjb25zdCBsYXN0ID0gZWRpdG9yLmxhc3RMaW5lKCk7XG4gICAgICBjb25zdCBsZW4gPSBlZGl0b3IuZ2V0TGluZShsYXN0KS5sZW5ndGg7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFwiXFxuXFxuXCIgKyBibG9jaywgeyBsaW5lOiBsYXN0LCBjaDogbGVuIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZW5kID0gc3RhcnQ7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0ICsgMTsgaSA8IGxpbmVzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG4gICAgICBjb25zdCBsID0gbGluZXNbaV0udHJpbSgpO1xuICAgICAgaWYgKGwubGVuZ3RoID09PSAwIHx8IGwuc2xpY2UoMCwgMSkgPT09IFwiPlwiIHx8IGwuc2xpY2UoMCwgMikgPT09IFwiJSVcIikgeyBlbmQgPSBpOyB9IGVsc2UgeyBicmVhazsgfVxuICAgIH1cbiAgICBpZiAoZW5kID49IGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoYmxvY2ssIHsgbGluZTogc3RhcnQsIGNoOiAwIH0sIHsgbGluZTogbGluZXMubGVuZ3RoIC0gMSwgY2g6IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWRpdG9yLnJlcGxhY2VSYW5nZShibG9jaywgeyBsaW5lOiBzdGFydCwgY2g6IDAgfSwgeyBsaW5lOiBlbmQgKyAxLCBjaDogMCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB2ZXJhbmtlcm4oZWRpdG9yOiBFZGl0b3IgfCBudWxsKSB7XG4gICAgaWYgKCFlZGl0b3IpIHsgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtlaW5lIE5vdGl6IGltIEZva3VzLlwiKTsgcmV0dXJuOyB9XG4gICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIGlmICh0aGlzLmtyaXNlbmNoZWNrKHRleHQpKSB7XG4gICAgICB0aGlzLnNldHplQmxvY2soZWRpdG9yLCBbXG4gICAgICAgIE1BUktFUixcbiAgICAgICAgXCI+IFshd2FybmluZ10gR3JlbnplIGVycmVpY2h0XCIsXG4gICAgICAgIFwiPiBBcmlhZG5lIGVya2VubnQgZWluIGFrdXRlcyBLcmlzZW5zaWduYWwgaW4gZGllc2VyIE5vdGl6IHVuZCBiZWVuZGV0IGRpZSBBdXN3ZXJ0dW5nIGhpZXIuXCIsXG4gICAgICAgIFwiPiBUZWxlZm9uc2VlbHNvcmdlOiAwODAwIDExMSAwIDExMSBvZGVyIDA4MDAgMTExIDAgMjIyIChydW5kIHVtIGRpZSBVaHIsIGtvc3RlbmxvcywgYW5vbnltKS4gSW0gYWt1dGVuIE5vdGZhbGw6IDExMi5cIixcbiAgICAgICAgXCI+IEFyaWFkbmUgaXN0IFdlcmt6ZXVnLCBuaWNodCBUaGVyYXBpZS4gQml0dGUgaG9sIGRpciBVbnRlcnN0dWV0enVuZy5cIlxuICAgICAgXS5qb2luKFwiXFxuXCIpKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLcmlzZW5zaWduYWwgZXJrYW5udCAtIEFuYWx5c2UgYmVlbmRldC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtBTkFMWVNFX1BST01QVF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Mua29udGV4dEVpbmJlemllaGVuKSB7XG4gICAgICBjb25zdCBrb250ZXh0ID0gYXdhaXQgdGhpcy5rb250ZXh0QmlsZGVuKCk7XG4gICAgICBpZiAoa29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhcnRzLnB1c2goXCJLT05URVhUIEFVUyBGUkVJR0VHRUJFTkVOIE5PVElaRU4gKEhpbnRlcmdydW5kKTpcIik7XG4gICAgICAgIHBhcnRzLnB1c2goa29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICAgIHBhcnRzLnB1c2goXCJBS1RVRUxMRSBOT1RJWjpcIik7XG4gICAgcGFydHMucHVzaCh0ZXh0KTtcbiAgICBjb25zdCBwcm9tcHQgPSBwYXJ0cy5qb2luKFwiXFxuXFxuXCIpO1xuICAgIGNvbnN0IG4gPSBuZXcgTm90aWNlKFwiQXJpYWRuZSBhbmFseXNpZXJ0IC4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYW50d29ydCA9IGF3YWl0IHRoaXMub2xsYW1hQ2hhdChwcm9tcHQpO1xuICAgICAgbi5oaWRlKCk7XG4gICAgICB0aGlzLnNldHplQmxvY2soZWRpdG9yLCB0aGlzLmJhdWVCbG9jayhhbnR3b3J0KSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogQW5hbHlzZSB2ZXJhbmtlcnQuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG4uaGlkZSgpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IEVuZHB1bmt0IG5pY2h0IGVycmVpY2hiYXIgb2RlciBGZWhsZXIgLSBcIiArIChlICYmIGUubWVzc2FnZSA/IGUubWVzc2FnZSA6IFwidW5iZWthbm50XCIpKTtcbiAgICB9XG4gIH1cblxuICByZWZsZWt0aWVyZW4oKSB7XG4gICAgY29uc3QgcCA9IFBST1RPS09MTEUuZmluZCgoeCkgPT4geC5pZCA9PT0gdGhpcy5zZXR0aW5ncy5wcm90b2tvbGwpO1xuICAgIGNvbnN0IHByb3QgPSBwID8gcCA6IFBST1RPS09MTEVbMF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2Nocml0dCA+PSBwcm90LnNjaHJpdHRlLmxlbmd0aCkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFByb3Rva29sbCBhYmdlc2NobG9zc2VuLiBTZXR6ZSBkZW4gU2Nocml0dCBpbiBkZW4gRWluc3RlbGx1bmdlbiB6dXJ1ZWNrIG9kZXIgd2VjaHNsZSBkYXMgUHJvdG9rb2xsLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbmV3IFJlZmxleGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLCBwcm90LCB0aGlzLnNldHRpbmdzLnNjaHJpdHQpLm9wZW4oKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0ZVNpdHp1bmcocDogUmVmbGV4aW9uc1Byb3Rva29sbCwgaWR4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzID0gcC5zY2hyaXR0ZVtpZHhdO1xuICAgIGNvbnN0IGlzbyA9IG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIik7XG4gICAgY29uc3QgcGZhZCA9IFwicmVmbGV4aW9uZW4vXCIgKyBpc28gKyBcIi1cIiArIHAuaWQgKyBcIi1cIiArIChpZHggKyAxKSArIFwiLm1kXCI7XG4gICAgY29uc3QgemVpbGVuOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcInR5cDogcmVmbGV4aW9uXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwicHJvdG9rb2xsOiBcIiArIHAuaWQsXG4gICAgICBcInNjaHJpdHQ6IFwiICsgKGlkeCArIDEpLFxuICAgICAgXCJkYXR1bTogXCIgKyBpc28sXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgcy50aXRlbCxcbiAgICAgIFwiXCJcbiAgICBdLmNvbmNhdChzLmFubGVpdHVuZykuY29uY2F0KFtcbiAgICAgIFwiXCIsXG4gICAgICBcIigxNSBiaXMgMjAgTWludXRlbiwgb2huZSBQYXVzZS4gVGlwcGVuIG9kZXIgZGlrdGllcmVuIC0gYmVpZGVzIHphZWhsdC4pXCIsXG4gICAgICBcIlwiXG4gICAgXSk7XG4gICAgYXdhaXQgdGhpcy5zaWNoZXJlck9yZG5lcihcInJlZmxleGlvbmVuXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKHBmYWQsIHplaWxlbi5qb2luKFwiXFxuXCIpKTtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKHRydWUpLm9wZW5GaWxlKGYpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFNpdHp1bmcgZ2VzdGFydGV0IC0gXCIgKyBzLnRpdGVsICsgXCIuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLb25udGUgZGllIFNpdHp1bmdzbm90aXogbmljaHQgYW5sZWdlbiAoZXhpc3RpZXJ0IHNpZSBzY2hvbj8pLlwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzY2hyaXR0QWJzY2hsaWVzc2VuKHA6IFJlZmxleGlvbnNQcm90b2tvbGwsIGlkeDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXR0aW5ncy5zY2hyaXR0ID0gaWR4ICsgMTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2hyaXR0ID49IHAuc2Nocml0dGUubGVuZ3RoKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogUHJvdG9rb2xsIGFiZ2VzY2hsb3NzZW4gLSBcIiArIHAubmFtZSArIFwiLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5hZWNoc3RlciBTY2hyaXR0IGlzdCBcIiArIHAuc2Nocml0dGVbdGhpcy5zZXR0aW5ncy5zY2hyaXR0XS50aXRlbCArIFwiLlwiKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQTZIO0FBWTdILElBQU0sbUJBQW9DO0FBQUEsRUFDeEMsVUFBVTtBQUFBLEVBQ1YsT0FBTztBQUFBLEVBQ1AsYUFBYTtBQUFBLEVBQ2Isb0JBQW9CO0FBQUEsRUFDcEIsZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsU0FBUztBQUNYO0FBRUEsSUFBTSxRQUFrQixDQUFDLFdBQVcsVUFBVSxhQUFhLFNBQVMsV0FBVyxTQUFTLFdBQVc7QUFFbkcsSUFBTSxXQUFtQztBQUFBLEVBQ3ZDLFdBQVc7QUFBQSxFQUNYLFVBQVU7QUFBQSxFQUNWLFdBQVc7QUFBQSxFQUNYLGFBQWE7QUFB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
