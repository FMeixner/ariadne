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
  "journal": "Tages- und Abendreflexion mit Stimmungserfassung",
  "impuls": "Situativer Eintrag unterwegs, ohne Stimmungserfassung",
  "meeting": "Uni- oder Dienstsitzung mit Recap",
  "order-log": "Log fuer das Order-Projekt",
  "ttrpg": "Rollenspiel: Sessions, Welten, Figuren",
  "hobby": "Andere Freizeit und Erholung",
  "reflexion": "Gefuehrte Schreibpfade (Pennebaker, Nuclear Episodes)"
};
var KONTEXTE = ["Lehre", "Forschung", "Admin", "Sport", "Sozial", "Familie", "Allein"];
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
    this.contentEl.createEl("h3", { text: "Notiz taggen" });
    this.contentEl.createEl("p", { text: "Welcher Art ist diese Notiz? Der Typ ordnet sie fuer den spaeteren Chat ein." });
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
    c.createEl("h3", { text: "Neuer Journal-Eintrag" });
    c.createEl("p", { text: "Stimmung erfassen, Kontexte waehlen, dann schreiben. Der Eintrag landet unter eintraege/, ist sofort getaggt und offen zum Diktieren. Mehrere pro Tag sind erlaubt." });
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
    new import_obsidian.Setting(c).setName("Endpunkt").setDesc("OpenAI-kompatibler Endpunkt, Standard Ollama. Wird erst mit dem Chat (M4) gebraucht.").addText((t) => t.setPlaceholder("http://127.0.0.1:11434").setValue(this.plugin.settings.endpoint).onChange(async (v) => {
      this.plugin.settings.endpoint = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Modell").setDesc("z.B. llama3.2, mistral-small. Wird erst mit dem Chat (M4) gebraucht.").addText((t) => t.setValue(this.plugin.settings.model).onChange(async (v) => {
      this.plugin.settings.model = v.trim();
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Temperatur").addText((t) => t.setValue(String(this.plugin.settings.temperature)).onChange(async (v) => {
      const n = parseFloat(v.replace(",", "."));
      this.plugin.settings.temperature = isNaN(n) ? 0.4 : n;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(c).setName("Getaggte Notizen als Chat-Kontext").setDesc("Ab M4: getaggte Notizen desselben Vaults fliesen in den Chat ein.").addToggle((t) => t.setValue(this.plugin.settings.kontextEinbeziehen).onChange(async (v) => {
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
    new import_obsidian.Setting(c).setName("Krisenweiterleitung").setDesc("Der Chat (M4) prueft Anfragen auf Krisensignale. Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222. Im akuten Notfall: 112.");
  }
};
var AriadnePlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addRibbonIcon("git-branch", "Ariadne", (evt) => this.oeffneMenue(evt));
    this.addCommand({ id: "ariadne-journal", name: "Ariadne: Neuer Journal-Eintrag mit Stimmungserfassung", callback: () => this.oeffneJournalEintrag() });
    this.addCommand({ id: "ariadne-markierung", name: "Ariadne: Notiz taggen", callback: () => this.toggleMarkierung() });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: taggen").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Reflektieren").setIcon("footprints").onClick(() => this.reflektieren()));
    }));
    this.addSettingTab(new AriadneSettingTab(this.app, this));
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  oeffneMenue(evt) {
    const menu = new import_obsidian.Menu();
    menu.addItem((i) => i.setTitle("Neuer Journal-Eintrag mit Stimmungserfassung").setIcon("activity").onClick(() => this.oeffneJournalEintrag()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Notiz taggen").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
    menu.addItem((i) => i.setTitle("Reflektieren - naechster Schritt").setIcon("footprints").onClick(() => this.reflektieren()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Mit Ariadne sprechen (folgt)").setIcon("message-circle").onClick(() => new import_obsidian.Notice("Ariadne: Der Chat ueber alle getaggten Notizen folgt als M4. Fragen wie 'Welche Muster deckst du auf?' oder 'Was hat Kraft gegeben?' werden dann moeglich.")));
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
      new import_obsidian.Notice("Ariadne: Journal-Eintrag angelegt und getaggt.");
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
      new import_obsidian.Notice("Ariadne: Tag entfernt.");
      return;
    }
    const typ = fm ? fm["typ"] : null;
    if (typ) {
      await this.app.fileManager.processFrontMatter(file, (f) => {
        f["ariadne"] = true;
      });
      new import_obsidian.Notice("Ariadne: Notiz getaggt (typ: " + String(typ) + ").");
    } else {
      new TypModal(this.app, async (t) => {
        await this.app.fileManager.processFrontMatter(file, (f) => {
          f["ariadne"] = true;
          f["typ"] = t;
        });
        new import_obsidian.Notice("Ariadne: Notiz getaggt als " + t + ".");
      }).open();
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgTWFya2Rvd25WaWV3LCBNZW51LCBNb2RhbCwgbW9tZW50LCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcblxuaW50ZXJmYWNlIEFyaWFkbmVTZXR0aW5ncyB7XG4gIGVuZHBvaW50OiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gIGtvbnRleHRFaW5iZXppZWhlbjogYm9vbGVhbjtcbiAga29udGV4dEFuemFobDogbnVtYmVyO1xuICBwcm90b2tvbGw6IHN0cmluZztcbiAgc2Nocml0dDogbnVtYmVyO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBcmlhZG5lU2V0dGluZ3MgPSB7XG4gIGVuZHBvaW50OiBcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIixcbiAgbW9kZWw6IFwibGxhbWEzLjJcIixcbiAgdGVtcGVyYXR1cmU6IDAuNCxcbiAga29udGV4dEVpbmJlemllaGVuOiB0cnVlLFxuICBrb250ZXh0QW56YWhsOiA4LFxuICBwcm90b2tvbGw6IFwicGVubmViYWtlci1lcGlzb2RlXCIsXG4gIHNjaHJpdHQ6IDBcbn07XG5cbmNvbnN0IFRZUEVOOiBzdHJpbmdbXSA9IFtcImpvdXJuYWxcIiwgXCJpbXB1bHNcIiwgXCJvcmRlci1sb2dcIiwgXCJ0dHJwZ1wiLCBcIm1lZXRpbmdcIiwgXCJob2JieVwiLCBcInJlZmxleGlvblwiXTtcblxuY29uc3QgVFlQX1RFWFQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIFwiam91cm5hbFwiOiBcIlRhZ2VzLSB1bmQgQWJlbmRyZWZsZXhpb24gbWl0IFN0aW1tdW5nc2VyZmFzc3VuZ1wiLFxuICBcImltcHVsc1wiOiBcIlNpdHVhdGl2ZXIgRWludHJhZyB1bnRlcndlZ3MsIG9obmUgU3RpbW11bmdzZXJmYXNzdW5nXCIsXG4gIFwibWVldGluZ1wiOiBcIlVuaS0gb2RlciBEaWVuc3RzaXR6dW5nIG1pdCBSZWNhcFwiLFxuICBcIm9yZGVyLWxvZ1wiOiBcIkxvZyBmdWVyIGRhcyBPcmRlci1Qcm9qZWt0XCIsXG4gIFwidHRycGdcIjogXCJSb2xsZW5zcGllbDogU2Vzc2lvbnMsIFdlbHRlbiwgRmlndXJlblwiLFxuICBcImhvYmJ5XCI6IFwiQW5kZXJlIEZyZWl6ZWl0IHVuZCBFcmhvbHVuZ1wiLFxuICBcInJlZmxleGlvblwiOiBcIkdlZnVlaHJ0ZSBTY2hyZWlicGZhZGUgKFBlbm5lYmFrZXIsIE51Y2xlYXIgRXBpc29kZXMpXCJcbn07XG5cbmNvbnN0IEtPTlRFWFRFOiBzdHJpbmdbXSA9IFtcIkxlaHJlXCIsIFwiRm9yc2NodW5nXCIsIFwiQWRtaW5cIiwgXCJTcG9ydFwiLCBcIlNvemlhbFwiLCBcIkZhbWlsaWVcIiwgXCJBbGxlaW5cIl07XG5cbmNvbnN0IE1BUktFUiA9IFwiJSVhcmlhZG5lLWFuYWx5c2UlJVwiO1xuXG4vLyBLUklTVEVSTUU6IE51ciBlcmdhZW56ZW4sIG5pZW1hbHMgc2Nod2FlY2hlbiAoc2llaGUgQUdFTlRTLm1kKS4gRGVyIENoYXQgKE00KSBwcnVlZnQgZGFtaXQgamVkZSBBbmZyYWdlLlxuY29uc3QgS1JJU1RFUk1FOiBzdHJpbmdbXSA9IFtcbiAgXCJzdWl6aWRcIixcbiAgXCJzdWl6aWRnZWRhbmtlXCIsXG4gIFwic3VpemlkYWJzaWNodFwiLFxuICBcInNlbGJzdG1vcmRcIixcbiAgXCJzZWxic3R2ZXJsZXR6XCIsXG4gIFwidG9kZXN3dW5zY2hcIixcbiAgXCJuaWNodCBtZWhyIHdlaXRlcmxlYmVuXCIsXG4gIFwibmljaHQgbWVociBsZWJlbiB3b2xsZW5cIixcbiAgXCJsZWJlbiBiZWVuZGVuXCIsXG4gIFwic3R1cnprcmlzZVwiLFxuICBcImFrdXRlIGtyaXNlXCIsXG4gIFwib2hubWFjaHRcIixcbiAgXCJwYW5pa2F0dGFja2VcIlxuXTtcblxuaW50ZXJmYWNlIFJlZmxleGlvbnNTY2hyaXR0IHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgYW5sZWl0dW5nOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFJlZmxleGlvbnNQcm90b2tvbGwge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjaHJpdHRlOiBSZWZsZXhpb25zU2Nocml0dFtdO1xufVxuXG5jb25zdCBQUk9UT0tPTExFOiBSZWZsZXhpb25zUHJvdG9rb2xsW10gPSBbXG4gIHtcbiAgICBpZDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgICBuYW1lOiBcIlBlbm5lYmFrZXItRXBpc29kZSAoMyBTY2hyaXR0ZSwgamUgMTUgYmlzIDIwIE1pbnV0ZW4sIGFuIGF1ZmVpbmFuZGVyZm9sZ2VuZGVuIFRhZ2VuKVwiLFxuICAgIHNjaHJpdHRlOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIkZha3RlblwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIldhZWhsZSBFSU5FIGtvbmtyZXRlIEVwaXNvZGUgZGVyIGxldHp0ZW4gc2llYmVuIFRhZ2UuXCIsXG4gICAgICAgICAgXCJTY2hyZWliZSAxNSBiaXMgMjAgTWludXRlbiBudXIgZGFydWViZXIsIHdhcyB0YXRzYWVjaGxpY2ggcGFzc2llcnQgaXN0OiBPcnQsIEJldGVpbGlndGUsIEFibGF1ZiwgRGVpbmUgSGFuZGx1bmdlbi4gS2VpbmUgQmV3ZXJ0dW5nLCBrZWluZSBEZXV0dW5nLiBFaW5lIEZha3RlbmxhZ2Ugd2llIGVpbiBQcm90b2tvbGwuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiR2VmdWVobGUgdW5kIEtvZXJwZXJcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJOaW1tIGRpZXNlbGJlIEVwaXNvZGUgZXJuZXV0LlwiLFxuICAgICAgICAgIFwiU2NocmVpYmUgMTUgYmlzIDIwIE1pbnV0ZW4gZGllc21hbCBudXIgdWViZXIgRGVpbmUgR2VmdWVobGUgdW5kIERlaW5lIEtvZXJwZXJlcmZhaHJ1bmc6IFdhcyBoYXN0IER1IGluIGRlciBTaXR1YXRpb24gZ2VmdWVobHQsIHdvIGltIEtvZXJwZXIgaGFzdCBEdSBlcyBnZXNwdWVydCwgd2FzIGRhdm9uIGlzdCBoZXV0ZSBub2NoIGRhLiBGYWt0ZW4gbnVyIGFscyBBbmtlciwgd2VubiBEdSBzaWUgYnJhdWNoc3QuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiVmVya251ZXBmdW5nIHVuZCBQZXJzcGVrdGl2ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIlp1bSBkcml0dGVuIE1hbCBkaWVzZWxiZSBFcGlzb2RlOiBXYXMgYmVkZXV0ZW4gRmFrdGVuIHVuZCBHZWZ1ZWhsZSB6dXNhbW1lbj9cIixcbiAgICAgICAgICBcIldhcyB3dWVyZGUgZWluIGF1c3NlbnN0ZWhlbmRlciwgd29obHdvbGxlbmRlciBCZW9iYWNodGVyIHNlaGVuPyBXZWxjaGVyIG5hZWNoc3RlIFNjaHJpdHQgZXJnaWJ0IHNpY2g/IFNjaGxpZXNzZSBtaXQgZWluZW0gU2F0eiwgZGVuIER1IGluIHp3ZWkgV29jaGVuIHdpZWRlcmxlc2VuIHdpbGxzdC5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgaWQ6IFwibnVjbGVhci1lcGlzb2Rlc1wiLFxuICAgIG5hbWU6IFwiTnVjbGVhciBFcGlzb2RlcyAocHJhZWdlbmRlIFdlbmRlcHVua3RlLCAyMCBiaXMgMzAgTWludXRlbilcIixcbiAgICBzY2hyaXR0ZTogW1xuICAgICAge1xuICAgICAgICB0aXRlbDogXCJXZW5kZXB1bmt0ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIkRlbmtlIGFuIHp3ZWkgYmlzIGRyZWkgcHJhZWdlbmRlIFdlbmRlcHVua3RlIGRlaW5lcyBMZWJlbnN3ZWdzLCBpbnNiZXNvbmRlcmUgZGVyIGxldHp0ZW4gSmFocmUuXCIsXG4gICAgICAgICAgXCJCZXNjaHJlaWJlIGZ1ZXIgamVkZW46IFdhcyBnZXNjaGFoLCB3YXMgaGFldHRlc3QgZHUgZGlyIGRhbWFscyBnZXd1ZW5zY2h0LCB3YXMgaGF0IHNpY2ggZGFyYXVzIGVudHdpY2tlbHQsIHVuZCB3ZWxjaGUgQWhudW5nIGhhc3QgZHUgaGV1dGUsIHdvenUgZXMgZ3V0IHdhciBvZGVyIG5vY2ggd2VyZGVuIGtvZW5udGUuXCIsXG4gICAgICAgICAgXCJOaW1tIGRpciBkYWZ1ZXIgMjAgYmlzIDMwIE1pbnV0ZW4gaW4gUnVoZS5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9XG5dO1xuXG5pbnRlcmZhY2UgSm91cm5hbERhdGVuIHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgdmFsZW5jZTogbnVtYmVyO1xuICBhcm91c2FsOiBudW1iZXI7XG4gIGJlbGFzdHVuZzogbnVtYmVyO1xuICBrb2VycGVyOiBudW1iZXI7XG4gIGtvbnRleHRlOiBzdHJpbmdbXTtcbiAgYXVzbmFobWU6IGJvb2xlYW47XG59XG5cbmNsYXNzIFR5cE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkNob29zZTogKHR5cDogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJOb3RpeiB0YWdnZW5cIiB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIldlbGNoZXIgQXJ0IGlzdCBkaWVzZSBOb3Rpej8gRGVyIFR5cCBvcmRuZXQgc2llIGZ1ZXIgZGVuIHNwYWV0ZXJlbiBDaGF0IGVpbi5cIiB9KTtcbiAgICBmb3IgKGNvbnN0IHQgb2YgVFlQRU4pIHtcbiAgICAgIG5ldyBTZXR0aW5nKHRoaXMuY29udGVudEVsKS5zZXROYW1lKHQpLnNldERlc2MoVFlQX1RFWFRbdF0pXG4gICAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIldhZWhsZW5cIikub25DbGljaygoKSA9PiB7IHRoaXMub25DaG9vc2UodCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBKb3VybmFsTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIHByaXZhdGUgZGF0ZW46IEpvdXJuYWxEYXRlbiA9IHsgdGl0ZWw6IFwiXCIsIHZhbGVuY2U6IDUsIGFyb3VzYWw6IDUsIGJlbGFzdHVuZzogNSwga29lcnBlcjogNSwga29udGV4dGU6IFtdLCBhdXNuYWhtZTogZmFsc2UgfTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkZlcnRpZzogKGQ6IEpvdXJuYWxEYXRlbikgPT4gdm9pZCkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBwcml2YXRlIGJhdWVTbGlkZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdGl0ZWw6IHN0cmluZywgaGlud2Vpczogc3RyaW5nLCBvbldlcnQ6IChuOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICBjb250YWluZXIuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogdGl0ZWwgKyBcIiAoXCIgKyBoaW53ZWlzICsgXCIpXCIgfSk7XG4gICAgY29uc3QgcmVpaGUgPSBjb250YWluZXIuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwiYXJpYWRuZS1zbGlkZXItemVpbGVcIiB9KTtcbiAgICBjb25zdCBpbnB1dCA9IHJlaWhlLmNyZWF0ZUVsKFwiaW5wdXRcIiwgeyB0eXBlOiBcInJhbmdlXCIgfSk7XG4gICAgaW5wdXQubWluID0gXCIwXCI7XG4gICAgaW5wdXQubWF4ID0gXCIxMFwiO1xuICAgIGlucHV0LnN0ZXAgPSBcIjFcIjtcbiAgICBpbnB1dC52YWx1ZSA9IFwiNVwiO1xuICAgIGNvbnN0IGFuemVpZ2UgPSByZWloZS5jcmVhdGVFbChcInNwYW5cIiwgeyB0ZXh0OiBcIjVcIiB9KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgbiA9IHBhcnNlSW50KGlucHV0LnZhbHVlLCAxMCk7XG4gICAgICBhbnplaWdlLnNldFRleHQoU3RyaW5nKG4pKTtcbiAgICAgIG9uV2VydChuKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICBjb25zdCBjID0gdGhpcy5jb250ZW50RWw7XG4gICAgYy5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJOZXVlciBKb3VybmFsLUVpbnRyYWdcIiB9KTtcbiAgICBjLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiU3RpbW11bmcgZXJmYXNzZW4sIEtvbnRleHRlIHdhZWhsZW4sIGRhbm4gc2NocmVpYmVuLiBEZXIgRWludHJhZyBsYW5kZXQgdW50ZXIgZWludHJhZWdlLywgaXN0IHNvZm9ydCBnZXRhZ2d0IHVuZCBvZmZlbiB6dW0gRGlrdGllcmVuLiBNZWhyZXJlIHBybyBUYWcgc2luZCBlcmxhdWJ0LlwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJUaXRlbCAob3B0aW9uYWwpXCIpLmFkZFRleHQoKHQpID0+IHQuc2V0UGxhY2Vob2xkZXIoXCJ6LkIuIE5hY2ggZGVyIExlaHJlXCIpLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuZGF0ZW4udGl0ZWwgPSB2OyB9KSk7XG4gICAgdGhpcy5iYXVlU2xpZGVyKGMsIFwiVmFsZW56XCIsIFwiMCB1bmFuZ2VuZWhtLCAxMCBhbmdlbmVobVwiLCAobikgPT4geyB0aGlzLmRhdGVuLnZhbGVuY2UgPSBuOyB9KTtcbiAgICB0aGlzLmJhdWVTbGlkZXIoYywgXCJBa3RpdmllcnVuZ1wiLCBcIjAgcnVoaWcsIDEwIGFrdGl2aWVydFwiLCAobikgPT4geyB0aGlzLmRhdGVuLmFyb3VzYWwgPSBuOyB9KTtcbiAgICB0aGlzLmJhdWVTbGlkZXIoYywgXCJCZWxhc3R1bmdcIiwgXCIwIGVudHNwYW5udCwgMTAgYW5nZXNwYW5udFwiLCAobikgPT4geyB0aGlzLmRhdGVuLmJlbGFzdHVuZyA9IG47IH0pO1xuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIktvZXJwZXJcIiwgXCIwIHZlcnNwYW5udCwgMTAgZnJlaVwiLCAobikgPT4geyB0aGlzLmRhdGVuLmtvZXJwZXIgPSBuOyB9KTtcbiAgICBjLmNyZWF0ZUVsKFwicFwiLCB7IHRleHQ6IFwiS29udGV4dGUgaGV1dGUgKE1laHJmYWNod2FobClcIiB9KTtcbiAgICBjb25zdCBrYWNoZWxuID0gYy5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJhcmlhZG5lLWthY2hlbG5cIiB9KTtcbiAgICBmb3IgKGNvbnN0IGsgb2YgS09OVEVYVEUpIHtcbiAgICAgIGNvbnN0IGIgPSBrYWNoZWxuLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHsgdGV4dDogaywgY2xzOiBcImFyaWFkbmUta2FjaGVsXCIgfSk7XG4gICAgICBiLnR5cGUgPSBcImJ1dHRvblwiO1xuICAgICAgYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmRhdGVuLmtvbnRleHRlLmluZGV4T2Yoayk7XG4gICAgICAgIGlmIChwb3MgPT09IC0xKSB7IHRoaXMuZGF0ZW4ua29udGV4dGUucHVzaChrKTsgYi5hZGRDbGFzcyhcImFyaWFkbmUta2FjaGVsLWFrdGl2XCIpOyB9XG4gICAgICAgIGVsc2UgeyB0aGlzLmRhdGVuLmtvbnRleHRlLnNwbGljZShwb3MsIDEpOyBiLnJlbW92ZUNsYXNzKFwiYXJpYWRuZS1rYWNoZWwtYWt0aXZcIik7IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiQXVzbmFobWUtRXJlaWduaXNcIikuc2V0RGVzYyhcIkV0d2FzIEF1c3Nlcmdld29laG5saWNoZXMgaXN0IHBhc3NpZXJ0LlwiKVxuICAgICAgLmFkZFRvZ2dsZSgodCkgPT4gdC5zZXRWYWx1ZShmYWxzZSkub25DaGFuZ2UoKHYpID0+IHsgdGhpcy5kYXRlbi5hdXNuYWhtZSA9IHY7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKVxuICAgICAgLmFkZEJ1dHRvbigoYikgPT4gYi5zZXRCdXR0b25UZXh0KFwiRWludHJhZyBhbmxlZ2VuXCIpLnNldEN0YSgpLm9uQ2xpY2soKCkgPT4geyB0aGlzLm9uRmVydGlnKHRoaXMuZGF0ZW4pOyB0aGlzLmNsb3NlKCk7IH0pKVxuICAgICAgLmFkZEJ1dHRvbigoYikgPT4gYi5zZXRCdXR0b25UZXh0KFwiQWJicmVjaGVuXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy5jbG9zZSgpKSk7XG4gIH1cbn1cblxuY2xhc3MgUmVmbGV4aW9uTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHBsdWdpbjogQXJpYWRuZVBsdWdpbiwgcHJpdmF0ZSBwcm90b2tvbGw6IFJlZmxleGlvbnNQcm90b2tvbGwsIHByaXZhdGUgaWR4OiBudW1iZXIpIHtcbiAgICBzdXBlcihhcHApO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IHMgPSB0aGlzLnByb3Rva29sbC5zY2hyaXR0ZVt0aGlzLmlkeF07XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJoM1wiLCB7IHRleHQ6IHRoaXMucHJvdG9rb2xsLm5hbWUgfSk7XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJTY2hyaXR0IFwiICsgKHRoaXMuaWR4ICsgMSkgKyBcIiB2b24gXCIgKyB0aGlzLnByb3Rva29sbC5zY2hyaXR0ZS5sZW5ndGggKyBcIjogXCIgKyBzLnRpdGVsIH0pO1xuICAgIGZvciAoY29uc3QgYSBvZiBzLmFubGVpdHVuZykge1xuICAgICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogYSB9KTtcbiAgICB9XG4gICAgdGhpcy5jb250ZW50RWwuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogXCJOaW1tIGRpciBkaWUgWmVpdCBpbiBSdWhlLiBFaW4gU2Nocml0dCBwcm8gVGFnLCBuaWNodCBtZWhyLlwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKHRoaXMuY29udGVudEVsKVxuICAgICAgLmFkZEJ1dHRvbigoYikgPT4gYi5zZXRCdXR0b25UZXh0KFwiU2l0enVuZyBzdGFydGVuXCIpLnNldEN0YSgpLm9uQ2xpY2soYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5zdGFydGVTaXR6dW5nKHRoaXMucHJvdG9rb2xsLCB0aGlzLmlkeCk7IHRoaXMuY2xvc2UoKTsgfSkpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJTY2hyaXR0IGFic2NobGllc3NlblwiKS5vbkNsaWNrKGFzeW5jICgpID0+IHsgYXdhaXQgdGhpcy5wbHVnaW4uc2Nocml0dEFic2NobGllc3Nlbih0aGlzLnByb3Rva29sbCwgdGhpcy5pZHgpOyB0aGlzLmNsb3NlKCk7IH0pKTtcbiAgfVxufVxuXG5jbGFzcyBBcmlhZG5lU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBwbHVnaW46IEFyaWFkbmVQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gIH1cblxuICBkaXNwbGF5KCkge1xuICAgIGNvbnN0IGMgPSB0aGlzLmNvbnRhaW5lckVsO1xuICAgIGMuZW1wdHkoKTtcbiAgICBjLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIkFyaWFkbmVcIiB9KTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiRW5kcHVua3RcIikuc2V0RGVzYyhcIk9wZW5BSS1rb21wYXRpYmxlciBFbmRwdW5rdCwgU3RhbmRhcmQgT2xsYW1hLiBXaXJkIGVyc3QgbWl0IGRlbSBDaGF0IChNNCkgZ2VicmF1Y2h0LlwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0UGxhY2Vob2xkZXIoXCJodHRwOi8vMTI3LjAuMC4xOjExNDM0XCIpLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmVuZHBvaW50KVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5kcG9pbnQgPSB2LnRyaW0oKTsgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiTW9kZWxsXCIpLnNldERlc2MoXCJ6LkIuIGxsYW1hMy4yLCBtaXN0cmFsLXNtYWxsLiBXaXJkIGVyc3QgbWl0IGRlbSBDaGF0IChNNCkgZ2VicmF1Y2h0LlwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZWwpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb2RlbCA9IHYudHJpbSgpOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJUZW1wZXJhdHVyXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRWYWx1ZShTdHJpbmcodGhpcy5wbHVnaW4uc2V0dGluZ3MudGVtcGVyYXR1cmUpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgY29uc3QgbiA9IHBhcnNlRmxvYXQodi5yZXBsYWNlKFwiLFwiLCBcIi5cIikpOyB0aGlzLnBsdWdpbi5zZXR0aW5ncy50ZW1wZXJhdHVyZSA9IGlzTmFOKG4pID8gMC40IDogbjsgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7IH0pKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiR2V0YWdndGUgTm90aXplbiBhbHMgQ2hhdC1Lb250ZXh0XCIpLnNldERlc2MoXCJBYiBNNDogZ2V0YWdndGUgTm90aXplbiBkZXNzZWxiZW4gVmF1bHRzIGZsaWVzZW4gaW4gZGVuIENoYXQgZWluLlwiKVxuICAgICAgLmFkZFRvZ2dsZSgodCkgPT4gdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5rb250ZXh0RWluYmV6aWVoZW4pXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5rb250ZXh0RWluYmV6aWVoZW4gPSB2OyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJBbnphaGwgS29udGV4dG5vdGl6ZW5cIilcbiAgICAgIC5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5rb250ZXh0QW56YWhsKSlcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IGNvbnN0IG4gPSBwYXJzZUludCh2LCAxMCk7IHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRBbnphaGwgPSBpc05hTihuKSA/IDggOiBuOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIGNvbnN0IGRyb3AgPSBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiUmVmbGV4aW9uc3Byb3Rva29sbFwiKS5zZXREZXNjKFwiRGVyIFBmYWQsIGRlbiBSZWZsZWt0aWVyZW4gd2VpdGVyZnVlaHJ0LlwiKTtcbiAgICBkcm9wLmFkZERyb3Bkb3duKChkKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgUFJPVE9LT0xMRSkgeyBkLmFkZE9wdGlvbihwLmlkLCBwLm5hbWUpOyB9XG4gICAgICBkLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnByb3Rva29sbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLnByb3Rva29sbCA9IHY7IHRoaXMucGx1Z2luLnNldHRpbmdzLnNjaHJpdHQgPSAwOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgdGhpcy5kaXNwbGF5KCk7IH0pO1xuICAgIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJBa3R1ZWxsZXIgU2Nocml0dFwiKS5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zY2hyaXR0ICsgMSkpLnNldERpc2FibGVkKHRydWUpKTtcbiAgICBuZXcgU2V0dGluZyhjKS5zZXROYW1lKFwiS3Jpc2Vud2VpdGVybGVpdHVuZ1wiKS5zZXREZXNjKFwiRGVyIENoYXQgKE00KSBwcnVlZnQgQW5mcmFnZW4gYXVmIEtyaXNlbnNpZ25hbGUuIFRlbGVmb25zZWVsc29yZ2U6IDA4MDAgMTExIDAgMTExIG9kZXIgMDgwMCAxMTEgMCAyMjIuIEltIGFrdXRlbiBOb3RmYWxsOiAxMTIuXCIpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyaWFkbmVQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQXJpYWRuZVNldHRpbmdzO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKVxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcImdpdC1icmFuY2hcIiwgXCJBcmlhZG5lXCIsIChldnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMub2VmZm5lTWVudWUoZXZ0KSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1qb3VybmFsXCIsIG5hbWU6IFwiQXJpYWRuZTogTmV1ZXIgSm91cm5hbC1FaW50cmFnIG1pdCBTdGltbXVuZ3NlcmZhc3N1bmdcIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMub2VmZm5lSm91cm5hbEVpbnRyYWcoKSB9KTtcbiAgICB0aGlzLmFkZENvbW1hbmQoeyBpZDogXCJhcmlhZG5lLW1hcmtpZXJ1bmdcIiwgbmFtZTogXCJBcmlhZG5lOiBOb3RpeiB0YWdnZW5cIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMudG9nZ2xlTWFya2llcnVuZygpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtcmVmbGVrdGllcmVuXCIsIG5hbWU6IFwiQXJpYWRuZTogUmVmbGVrdGllcmVuIC0gbmFlY2hzdGVyIFNjaHJpdHRcIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkgfSk7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImVkaXRvci1tZW51XCIsIChtZW51OiBNZW51KSA9PiB7XG4gICAgICBtZW51LmFkZFNlcGFyYXRvcigpO1xuICAgICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiQXJpYWRuZTogdGFnZ2VuXCIpLnNldEljb24oXCJib29rbWFya1wiKS5vbkNsaWNrKCgpID0+IHRoaXMudG9nZ2xlTWFya2llcnVuZygpKSk7XG4gICAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJBcmlhZG5lOiBSZWZsZWt0aWVyZW5cIikuc2V0SWNvbihcImZvb3RwcmludHNcIikub25DbGljaygoKSA9PiB0aGlzLnJlZmxla3RpZXJlbigpKSk7XG4gICAgfSkpO1xuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgQXJpYWRuZVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcbiAgfVxuXG4gIGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBvZWZmbmVNZW51ZShldnQ6IE1vdXNlRXZlbnQpIHtcbiAgICBjb25zdCBtZW51ID0gbmV3IE1lbnUoKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJOZXVlciBKb3VybmFsLUVpbnRyYWcgbWl0IFN0aW1tdW5nc2VyZmFzc3VuZ1wiKS5zZXRJY29uKFwiYWN0aXZpdHlcIikub25DbGljaygoKSA9PiB0aGlzLm9lZmZuZUpvdXJuYWxFaW50cmFnKCkpKTtcbiAgICBtZW51LmFkZFNlcGFyYXRvcigpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIk5vdGl6IHRhZ2dlblwiKS5zZXRJY29uKFwiYm9va21hcmtcIikub25DbGljaygoKSA9PiB0aGlzLnRvZ2dsZU1hcmtpZXJ1bmcoKSkpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIlJlZmxla3RpZXJlbiAtIG5hZWNoc3RlciBTY2hyaXR0XCIpLnNldEljb24oXCJmb290cHJpbnRzXCIpLm9uQ2xpY2soKCkgPT4gdGhpcy5yZWZsZWt0aWVyZW4oKSkpO1xuICAgIG1lbnUuYWRkU2VwYXJhdG9yKCk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiTWl0IEFyaWFkbmUgc3ByZWNoZW4gKGZvbGd0KVwiKS5zZXRJY29uKFwibWVzc2FnZS1jaXJjbGVcIikub25DbGljaygoKSA9PiBuZXcgTm90aWNlKFwiQXJpYWRuZTogRGVyIENoYXQgdWViZXIgYWxsZSBnZXRhZ2d0ZW4gTm90aXplbiBmb2xndCBhbHMgTTQuIEZyYWdlbiB3aWUgJ1dlbGNoZSBNdXN0ZXIgZGVja3N0IGR1IGF1Zj8nIG9kZXIgJ1dhcyBoYXQgS3JhZnQgZ2VnZWJlbj8nIHdlcmRlbiBkYW5uIG1vZWdsaWNoLlwiKSkpO1xuICAgIG1lbnUuc2hvd0F0TW91c2VFdmVudChldnQpO1xuICB9XG5cbiAgb2VmZm5lSm91cm5hbEVpbnRyYWcoKSB7XG4gICAgbmV3IEpvdXJuYWxNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKGQ6IEpvdXJuYWxEYXRlbikgPT4geyBhd2FpdCB0aGlzLmVyc3RlbGxlSm91cm5hbEVpbnRyYWcoZCk7IH0pLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2ljaGVyZXJPcmRuZXIocGZhZDogc3RyaW5nKSB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGZhZCkpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIocGZhZCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9yZG5lciBrYW5uIHNjaG9uIGV4aXN0aWVyZW4sIGlnbm9yaWVyZW4uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZXJzdGVsbGVKb3VybmFsRWludHJhZyhkOiBKb3VybmFsRGF0ZW4pIHtcbiAgICBjb25zdCBpc28gPSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuICAgIGNvbnN0IHplaXQgPSBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcbiAgICBjb25zdCBwZmFkID0gXCJlaW50cmFlZ2UvXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLURELUhIbW1cIikgKyBcIi5tZFwiO1xuICAgIGNvbnN0IHRpdGVsID0gZC50aXRlbC50cmltKCkubGVuZ3RoID4gMCA/IGQudGl0ZWwudHJpbSgpIDogaXNvICsgXCIgXCIgKyB6ZWl0O1xuICAgIGNvbnN0IGtvbnRleHRlID0gZC5rb250ZXh0ZS5sZW5ndGggPT09IDAgPyBcIltdXCIgOiBcIltcIiArIGQua29udGV4dGUuam9pbihcIiwgXCIpICsgXCJdXCI7XG4gICAgY29uc3QgYmFzZWxpbmUgPSBbXG4gICAgICBcIlZhbGVueiBcIiArIFN0cmluZyhkLnZhbGVuY2UpICsgXCIvMTAgKDAgdW5hbmdlbmVobSwgMTAgYW5nZW5laG0pXCIsXG4gICAgICBcIkFrdGl2aWVydW5nIFwiICsgU3RyaW5nKGQuYXJvdXNhbCkgKyBcIi8xMCAoMCBydWhpZywgMTAgYWt0aXZpZXJ0KVwiLFxuICAgICAgXCJCZWxhc3R1bmcgXCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpICsgXCIvMTAgKDAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50KVwiLFxuICAgICAgXCJLb2VycGVyIFwiICsgU3RyaW5nKGQua29lcnBlcikgKyBcIi8xMCAoMCB2ZXJzcGFubnQsIDEwIGZyZWkpXCJcbiAgICBdLmpvaW4oXCIsIFwiKTtcbiAgICBjb25zdCB6ZWlsZW46IHN0cmluZ1tdID0gW1xuICAgICAgXCItLS1cIixcbiAgICAgIFwidHlwOiBqb3VybmFsXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwiZGF0dW06IFwiICsgaXNvLFxuICAgICAgXCJ1aHJ6ZWl0OiBcIiArIHplaXQsXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwidmFsZW5jZTogXCIgKyBTdHJpbmcoZC52YWxlbmNlKSxcbiAgICAgIFwiYXJvdXNhbDogXCIgKyBTdHJpbmcoZC5hcm91c2FsKSxcbiAgICAgIFwiYmVsYXN0dW5nOiBcIiArIFN0cmluZyhkLmJlbGFzdHVuZyksXG4gICAgICBcImtvZXJwZXI6IFwiICsgU3RyaW5nKGQua29lcnBlciksXG4gICAgICBcImtvbnRleHRlOiBcIiArIGtvbnRleHRlLFxuICAgICAgXCJhdXNuYWhtZTogXCIgKyAoZC5hdXNuYWhtZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgdGl0ZWwsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIyBCYXNlbGluZVwiLFxuICAgICAgXCJcIixcbiAgICAgIGJhc2VsaW5lLFxuICAgICAgXCJcIixcbiAgICAgIFwiS29udGV4dGU6IFwiICsgKGQua29udGV4dGUubGVuZ3RoID09PSAwID8gXCJrZWluZVwiIDogZC5rb250ZXh0ZS5qb2luKFwiLCBcIikpICsgKGQuYXVzbmFobWUgPyBcIiB8IEF1c25haG1lLUVyZWlnbmlzXCIgOiBcIlwiKSxcbiAgICAgIFwiXCIsXG4gICAgICBcIiMjIFdhcyB3YXIgaGV1dGVcIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkZha3RlbjogV2FzIGlzdCBwYXNzaWVydD9cIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkdlZnVlaGxlOiBXYXMgaGF0IGVzIG1pdCBtaXIgZ2VtYWNodD9cIixcbiAgICAgIFwiXCJcbiAgICBdO1xuICAgIGF3YWl0IHRoaXMuc2ljaGVyZXJPcmRuZXIoXCJlaW50cmFlZ2VcIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGYgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUocGZhZCwgemVpbGVuLmpvaW4oXCJcXG5cIikpO1xuICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSkub3BlbkZpbGUoZik7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogSm91cm5hbC1FaW50cmFnIGFuZ2VsZWd0IHVuZCBnZXRhZ2d0LlwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogS29ubnRlIGRlbiBKb3VybmFsLUVpbnRyYWcgbmljaHQgYW5sZWdlbi5cIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmcm9udG1hdHRlclZvbihmaWxlOiBURmlsZSk6IGFueSB7XG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICBpZiAoY2FjaGUgJiYgY2FjaGUuZnJvbnRtYXR0ZXIpIHsgcmV0dXJuIGNhY2hlLmZyb250bWF0dGVyOyB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBhc3luYyB0b2dnbGVNYXJraWVydW5nKCkge1xuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgIGNvbnN0IGZpbGUgPSB2aWV3ID8gdmlldy5maWxlIDogdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcbiAgICBpZiAoIWZpbGUpIHsgbmV3IE5vdGljZShcIkFyaWFkbmU6IEtlaW5lIGFrdGl2ZSBOb3Rpei5cIik7IHJldHVybjsgfVxuICAgIGNvbnN0IGZtID0gdGhpcy5mcm9udG1hdHRlclZvbihmaWxlKTtcbiAgICBpZiAoZm0gJiYgZm1bXCJhcmlhZG5lXCJdID09PSB0cnVlKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IGZhbHNlOyB9KTtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBUYWcgZW50ZmVybnQuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0eXAgPSBmbSA/IGZtW1widHlwXCJdIDogbnVsbDtcbiAgICBpZiAodHlwKSB7XG4gICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IHRydWU7IH0pO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5vdGl6IGdldGFnZ3QgKHR5cDogXCIgKyBTdHJpbmcodHlwKSArIFwiKS5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ldyBUeXBNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKHQ6IHN0cmluZykgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC5maWxlTWFuYWdlci5wcm9jZXNzRnJvbnRNYXR0ZXIoZmlsZSwgKGY6IGFueSkgPT4geyBmW1wiYXJpYWRuZVwiXSA9IHRydWU7IGZbXCJ0eXBcIl0gPSB0OyB9KTtcbiAgICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5vdGl6IGdldGFnZ3QgYWxzIFwiICsgdCArIFwiLlwiKTtcbiAgICAgIH0pLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICByZWZsZWt0aWVyZW4oKSB7XG4gICAgY29uc3QgcCA9IFBST1RPS09MTEUuZmluZCgoeCkgPT4geC5pZCA9PT0gdGhpcy5zZXR0aW5ncy5wcm90b2tvbGwpO1xuICAgIGNvbnN0IHByb3QgPSBwID8gcCA6IFBST1RPS09MTEVbMF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2Nocml0dCA+PSBwcm90LnNjaHJpdHRlLmxlbmd0aCkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFByb3Rva29sbCBhYmdlc2NobG9zc2VuLiBTZXR6ZSBkZW4gU2Nocml0dCBpbiBkZW4gRWluc3RlbGx1bmdlbiB6dXJ1ZWNrIG9kZXIgd2VjaHNsZSBkYXMgUHJvdG9rb2xsLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbmV3IFJlZmxleGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLCBwcm90LCB0aGlzLnNldHRpbmdzLnNjaHJpdHQpLm9wZW4oKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0ZVNpdHp1bmcocDogUmVmbGV4aW9uc1Byb3Rva29sbCwgaWR4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzID0gcC5zY2hyaXR0ZVtpZHhdO1xuICAgIGNvbnN0IGlzbyA9IG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIik7XG4gICAgY29uc3QgcGZhZCA9IFwicmVmbGV4aW9uZW4vXCIgKyBpc28gKyBcIi1cIiArIHAuaWQgKyBcIi1cIiArIChpZHggKyAxKSArIFwiLm1kXCI7XG4gICAgY29uc3QgemVpbGVuOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcInR5cDogcmVmbGV4aW9uXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwicHJvdG9rb2xsOiBcIiArIHAuaWQsXG4gICAgICBcInNjaHJpdHQ6IFwiICsgKGlkeCArIDEpLFxuICAgICAgXCJkYXR1bTogXCIgKyBpc28sXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgcy50aXRlbCxcbiAgICAgIFwiXCJcbiAgICBdLmNvbmNhdChzLmFubGVpdHVuZykuY29uY2F0KFtcbiAgICAgIFwiXCIsXG4gICAgICBcIigxNSBiaXMgMjAgTWludXRlbiwgb2huZSBQYXVzZS4gVGlwcGVuIG9kZXIgZGlrdGllcmVuIC0gYmVpZGVzIHphZWhsdC4pXCIsXG4gICAgICBcIlwiXG4gICAgXSk7XG4gICAgYXdhaXQgdGhpcy5zaWNoZXJlck9yZG5lcihcInJlZmxleGlvbmVuXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKHBmYWQsIHplaWxlbi5qb2luKFwiXFxuXCIpKTtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKHRydWUpLm9wZW5GaWxlKGYpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFNpdHp1bmcgZ2VzdGFydGV0IC0gXCIgKyBzLnRpdGVsICsgXCIuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLb25udGUgZGllIFNpdHp1bmdzbm90aXogbmljaHQgYW5sZWdlbiAoZXhpc3RpZXJ0IHNpZSBzY2hvbj8pLlwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzY2hyaXR0QWJzY2hsaWVzc2VuKHA6IFJlZmxleGlvbnNQcm90b2tvbGwsIGlkeDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXR0aW5ncy5zY2hyaXR0ID0gaWR4ICsgMTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2hyaXR0ID49IHAuc2Nocml0dGUubGVuZ3RoKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogUHJvdG9rb2xsIGFiZ2VzY2hsb3NzZW4gLSBcIiArIHAubmFtZSArIFwiLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5hZWNoc3RlciBTY2hyaXR0IGlzdCBcIiArIHAuc2Nocml0dGVbdGhpcy5zZXR0aW5ncy5zY2hyaXR0XS50aXRlbCArIFwiLlwiKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JB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
