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
    this.stimmungErfassen = false;
  }
  onOpen() {
    this.contentEl.createEl("h3", { text: "Notiz taggen" });
    this.contentEl.createEl("p", { text: "Welcher Art ist diese Notiz? Der Typ ordnet sie fuer den spaeteren Chat ein." });
    new import_obsidian.Setting(this.contentEl).setName("Stimmung miterfassen").setDesc("Nach der Typ-Wahl erscheinen die Stimmungsslider. Die Werte werden als Chiffre-Kommentar an der Cursor-Position eingefuegt, in der Lesansicht unsichtbar.").addToggle((s) => s.setValue(false).onChange((v) => {
      this.stimmungErfassen = v;
    }));
    for (const t of TYPEN) {
      new import_obsidian.Setting(this.contentEl).setName(t).setDesc(TYP_TEXT[t]).addButton((b) => b.setButtonText("Waehlen").onClick(() => {
        this.onChoose(t, this.stimmungErfassen);
        this.close();
      }));
    }
  }
};
var JournalModal = class extends import_obsidian.Modal {
  constructor(app, onFertig, nachtrag) {
    super(app);
    this.onFertig = onFertig;
    this.nachtrag = nachtrag;
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
    c.createEl("h3", { text: this.nachtrag ? "Stimmung an dieser Stelle erfassen" : "Neuer Journal-Eintrag" });
    c.createEl("p", { text: this.nachtrag ? "Stimmung erfassen, Kontexte waehlen, dann einfuegen. Die Chiffre landet an der Cursor-Position, die Zeile darunter ist bereit zum Diktieren. In der Lesansicht bleibt alles unsichtbar." : "Stimmung erfassen, Kontexte waehlen, dann schreiben. Der Eintrag landet unter eintraege/, ist sofort getaggt und offen zum Diktieren. Mehrere pro Tag sind erlaubt." });
    if (!this.nachtrag) {
      new import_obsidian.Setting(c).setName("Titel (optional)").addText((t) => t.setPlaceholder("z.B. Nach der Lehre").onChange((v) => {
        this.daten.titel = v;
      }));
    }
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
    new import_obsidian.Setting(c).addButton((b) => b.setButtonText(this.nachtrag ? "Chiffre einfuegen" : "Eintrag anlegen").setCta().onClick(() => {
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
    this.addCommand({ id: "ariadne-stimmung", name: "Ariadne: Stimmung an dieser Stelle erfassen", callback: () => this.oeffneStimmungErfassung() });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: taggen").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Stimmung hier erfassen").setIcon("heart-pulse").onClick(() => this.oeffneStimmungErfassung()));
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
    menu.addItem((i) => i.setTitle("Stimmung an dieser Stelle erfassen").setIcon("heart-pulse").onClick(() => this.oeffneStimmungErfassung()));
    menu.addItem((i) => i.setTitle("Reflektieren - naechster Schritt").setIcon("footprints").onClick(() => this.reflektieren()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Mit Ariadne sprechen (folgt)").setIcon("message-circle").onClick(() => new import_obsidian.Notice("Ariadne: Der Chat ueber alle getaggten Notizen folgt als M4. Fragen wie 'Welche Muster deckst du auf?' oder 'Was hat Kraft gegeben?' werden dann moeglich.")));
    menu.showAtMouseEvent(evt);
  }
  oeffneJournalEintrag() {
    new JournalModal(this.app, async (d) => {
      await this.erstelleJournalEintrag(d);
    }, false).open();
  }
  oeffneStimmungErfassung() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    new JournalModal(this.app, async (d) => {
      await this.fuegeStimmungEin(view, d);
    }, true).open();
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
  async fuegeStimmungEin(view, d) {
    if (!view || !view.editor) {
      new import_obsidian.Notice("Ariadne: Keine offene Notiz - Stimmung kann nicht eingefuegt werden.");
      return;
    }
    const zeit = (0, import_obsidian.moment)().format("YYYY-MM-DD HH:mm");
    const teile = [
      "%%ariadne-stimmung " + zeit,
      "v=" + String(d.valence),
      "a=" + String(d.arousal),
      "b=" + String(d.belastung),
      "k=" + String(d.koerper)
    ];
    if (d.kontexte.length > 0) {
      teile.push("kontexte=" + d.kontexte.join(","));
    }
    if (d.ausnahme) {
      teile.push("ausnahme=true");
    }
    const chiffre = teile.join(" ") + "%%";
    const editor = view.editor;
    const pos = editor.getCursor();
    editor.replaceSelection((pos.ch > 0 ? "\n" : "") + chiffre + "\n");
    new import_obsidian.Notice("Ariadne: Stimmung als Chiffre eingefuegt (Lesansicht zeigt sie nicht).");
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
      new TypModal(this.app, async (t, stimmungErfassen) => {
        await this.app.fileManager.processFrontMatter(file, (f) => {
          f["ariadne"] = true;
          f["typ"] = t;
        });
        new import_obsidian.Notice("Ariadne: Notiz getaggt als " + t + ".");
        if (stimmungErfassen) {
          new JournalModal(this.app, async (d) => {
            await this.fuegeStimmungEin(view, d);
          }, true).open();
        }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IEFwcCwgTWFya2Rvd25WaWV3LCBNZW51LCBNb2RhbCwgbW9tZW50LCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcblxuaW50ZXJmYWNlIEFyaWFkbmVTZXR0aW5ncyB7XG4gIGVuZHBvaW50OiBzdHJpbmc7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIHRlbXBlcmF0dXJlOiBudW1iZXI7XG4gIGtvbnRleHRFaW5iZXppZWhlbjogYm9vbGVhbjtcbiAga29udGV4dEFuemFobDogbnVtYmVyO1xuICBwcm90b2tvbGw6IHN0cmluZztcbiAgc2Nocml0dDogbnVtYmVyO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBBcmlhZG5lU2V0dGluZ3MgPSB7XG4gIGVuZHBvaW50OiBcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIixcbiAgbW9kZWw6IFwibGxhbWEzLjJcIixcbiAgdGVtcGVyYXR1cmU6IDAuNCxcbiAga29udGV4dEVpbmJlemllaGVuOiB0cnVlLFxuICBrb250ZXh0QW56YWhsOiA4LFxuICBwcm90b2tvbGw6IFwicGVubmViYWtlci1lcGlzb2RlXCIsXG4gIHNjaHJpdHQ6IDBcbn07XG5cbmNvbnN0IFRZUEVOOiBzdHJpbmdbXSA9IFtcImpvdXJuYWxcIiwgXCJpbXB1bHNcIiwgXCJvcmRlci1sb2dcIiwgXCJ0dHJwZ1wiLCBcIm1lZXRpbmdcIiwgXCJob2JieVwiLCBcInJlZmxleGlvblwiXTtcblxuY29uc3QgVFlQX1RFWFQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIFwiam91cm5hbFwiOiBcIlRhZ2VzLSB1bmQgQWJlbmRyZWZsZXhpb24gbWl0IFN0aW1tdW5nc2VyZmFzc3VuZ1wiLFxuICBcImltcHVsc1wiOiBcIlNpdHVhdGl2ZXIgRWludHJhZyB1bnRlcndlZ3MsIG9obmUgU3RpbW11bmdzZXJmYXNzdW5nXCIsXG4gIFwibWVldGluZ1wiOiBcIlVuaS0gb2RlciBEaWVuc3RzaXR6dW5nIG1pdCBSZWNhcFwiLFxuICBcIm9yZGVyLWxvZ1wiOiBcIkxvZyBmdWVyIGRhcyBPcmRlci1Qcm9qZWt0XCIsXG4gIFwidHRycGdcIjogXCJSb2xsZW5zcGllbDogU2Vzc2lvbnMsIFdlbHRlbiwgRmlndXJlblwiLFxuICBcImhvYmJ5XCI6IFwiQW5kZXJlIEZyZWl6ZWl0IHVuZCBFcmhvbHVuZ1wiLFxuICBcInJlZmxleGlvblwiOiBcIkdlZnVlaHJ0ZSBTY2hyZWlicGZhZGUgKFBlbm5lYmFrZXIsIE51Y2xlYXIgRXBpc29kZXMpXCJcbn07XG5cbmNvbnN0IEtPTlRFWFRFOiBzdHJpbmdbXSA9IFtcIkxlaHJlXCIsIFwiRm9yc2NodW5nXCIsIFwiQWRtaW5cIiwgXCJTcG9ydFwiLCBcIlNvemlhbFwiLCBcIkZhbWlsaWVcIiwgXCJBbGxlaW5cIl07XG5cbmNvbnN0IE1BUktFUiA9IFwiJSVhcmlhZG5lLWFuYWx5c2UlJVwiO1xuXG4vLyBLUklTVEVSTUU6IE51ciBlcmdhZW56ZW4sIG5pZW1hbHMgc2Nod2FlY2hlbiAoc2llaGUgQUdFTlRTLm1kKS4gRGVyIENoYXQgKE00KSBwcnVlZnQgZGFtaXQgamVkZSBBbmZyYWdlLlxuY29uc3QgS1JJU1RFUk1FOiBzdHJpbmdbXSA9IFtcbiAgXCJzdWl6aWRcIixcbiAgXCJzdWl6aWRnZWRhbmtlXCIsXG4gIFwic3VpemlkYWJzaWNodFwiLFxuICBcInNlbGJzdG1vcmRcIixcbiAgXCJzZWxic3R2ZXJsZXR6XCIsXG4gIFwidG9kZXN3dW5zY2hcIixcbiAgXCJuaWNodCBtZWhyIHdlaXRlcmxlYmVuXCIsXG4gIFwibmljaHQgbWVociBsZWJlbiB3b2xsZW5cIixcbiAgXCJsZWJlbiBiZWVuZGVuXCIsXG4gIFwic3R1cnprcmlzZVwiLFxuICBcImFrdXRlIGtyaXNlXCIsXG4gIFwib2hubWFjaHRcIixcbiAgXCJwYW5pa2F0dGFja2VcIlxuXTtcblxuaW50ZXJmYWNlIFJlZmxleGlvbnNTY2hyaXR0IHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgYW5sZWl0dW5nOiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIFJlZmxleGlvbnNQcm90b2tvbGwge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIHNjaHJpdHRlOiBSZWZsZXhpb25zU2Nocml0dFtdO1xufVxuXG5jb25zdCBQUk9UT0tPTExFOiBSZWZsZXhpb25zUHJvdG9rb2xsW10gPSBbXG4gIHtcbiAgICBpZDogXCJwZW5uZWJha2VyLWVwaXNvZGVcIixcbiAgICBuYW1lOiBcIlBlbm5lYmFrZXItRXBpc29kZSAoMyBTY2hyaXR0ZSwgamUgMTUgYmlzIDIwIE1pbnV0ZW4sIGFuIGF1ZmVpbmFuZGVyZm9sZ2VuZGVuIFRhZ2VuKVwiLFxuICAgIHNjaHJpdHRlOiBbXG4gICAgICB7XG4gICAgICAgIHRpdGVsOiBcIkZha3RlblwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIldhZWhsZSBFSU5FIGtvbmtyZXRlIEVwaXNvZGUgZGVyIGxldHp0ZW4gc2llYmVuIFRhZ2UuXCIsXG4gICAgICAgICAgXCJTY2hyZWliZSAxNSBiaXMgMjAgTWludXRlbiBudXIgZGFydWViZXIsIHdhcyB0YXRzYWVjaGxpY2ggcGFzc2llcnQgaXN0OiBPcnQsIEJldGVpbGlndGUsIEFibGF1ZiwgRGVpbmUgSGFuZGx1bmdlbi4gS2VpbmUgQmV3ZXJ0dW5nLCBrZWluZSBEZXV0dW5nLiBFaW5lIEZha3RlbmxhZ2Ugd2llIGVpbiBQcm90b2tvbGwuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiR2VmdWVobGUgdW5kIEtvZXJwZXJcIixcbiAgICAgICAgYW5sZWl0dW5nOiBbXG4gICAgICAgICAgXCJOaW1tIGRpZXNlbGJlIEVwaXNvZGUgZXJuZXV0LlwiLFxuICAgICAgICAgIFwiU2NocmVpYmUgMTUgYmlzIDIwIE1pbnV0ZW4gZGllc21hbCBudXIgdWViZXIgRGVpbmUgR2VmdWVobGUgdW5kIERlaW5lIEtvZXJwZXJlcmZhaHJ1bmc6IFdhcyBoYXN0IER1IGluIGRlciBTaXR1YXRpb24gZ2VmdWVobHQsIHdvIGltIEtvZXJwZXIgaGFzdCBEdSBlcyBnZXNwdWVydCwgd2FzIGRhdm9uIGlzdCBoZXV0ZSBub2NoIGRhLiBGYWt0ZW4gbnVyIGFscyBBbmtlciwgd2VubiBEdSBzaWUgYnJhdWNoc3QuXCJcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGl0ZWw6IFwiVmVya251ZXBmdW5nIHVuZCBQZXJzcGVrdGl2ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIlp1bSBkcml0dGVuIE1hbCBkaWVzZWxiZSBFcGlzb2RlOiBXYXMgYmVkZXV0ZW4gRmFrdGVuIHVuZCBHZWZ1ZWhsZSB6dXNhbW1lbj9cIixcbiAgICAgICAgICBcIldhcyB3dWVyZGUgZWluIGF1c3NlbnN0ZWhlbmRlciwgd29obHdvbGxlbmRlciBCZW9iYWNodGVyIHNlaGVuPyBXZWxjaGVyIG5hZWNoc3RlIFNjaHJpdHQgZXJnaWJ0IHNpY2g/IFNjaGxpZXNzZSBtaXQgZWluZW0gU2F0eiwgZGVuIER1IGluIHp3ZWkgV29jaGVuIHdpZWRlcmxlc2VuIHdpbGxzdC5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9LFxuICB7XG4gICAgaWQ6IFwibnVjbGVhci1lcGlzb2Rlc1wiLFxuICAgIG5hbWU6IFwiTnVjbGVhciBFcGlzb2RlcyAocHJhZWdlbmRlIFdlbmRlcHVua3RlLCAyMCBiaXMgMzAgTWludXRlbilcIixcbiAgICBzY2hyaXR0ZTogW1xuICAgICAge1xuICAgICAgICB0aXRlbDogXCJXZW5kZXB1bmt0ZVwiLFxuICAgICAgICBhbmxlaXR1bmc6IFtcbiAgICAgICAgICBcIkRlbmtlIGFuIHp3ZWkgYmlzIGRyZWkgcHJhZWdlbmRlIFdlbmRlcHVua3RlIGRlaW5lcyBMZWJlbnN3ZWdzLCBpbnNiZXNvbmRlcmUgZGVyIGxldHp0ZW4gSmFocmUuXCIsXG4gICAgICAgICAgXCJCZXNjaHJlaWJlIGZ1ZXIgamVkZW46IFdhcyBnZXNjaGFoLCB3YXMgaGFldHRlc3QgZHUgZGlyIGRhbWFscyBnZXd1ZW5zY2h0LCB3YXMgaGF0IHNpY2ggZGFyYXVzIGVudHdpY2tlbHQsIHVuZCB3ZWxjaGUgQWhudW5nIGhhc3QgZHUgaGV1dGUsIHdvenUgZXMgZ3V0IHdhciBvZGVyIG5vY2ggd2VyZGVuIGtvZW5udGUuXCIsXG4gICAgICAgICAgXCJOaW1tIGRpciBkYWZ1ZXIgMjAgYmlzIDMwIE1pbnV0ZW4gaW4gUnVoZS5cIlxuICAgICAgICBdXG4gICAgICB9XG4gICAgXVxuICB9XG5dO1xuXG5pbnRlcmZhY2UgSm91cm5hbERhdGVuIHtcbiAgdGl0ZWw6IHN0cmluZztcbiAgdmFsZW5jZTogbnVtYmVyO1xuICBhcm91c2FsOiBudW1iZXI7XG4gIGJlbGFzdHVuZzogbnVtYmVyO1xuICBrb2VycGVyOiBudW1iZXI7XG4gIGtvbnRleHRlOiBzdHJpbmdbXTtcbiAgYXVzbmFobWU6IGJvb2xlYW47XG59XG5cbmNsYXNzIFR5cE1vZGFsIGV4dGVuZHMgTW9kYWwge1xuICBwcml2YXRlIHN0aW1tdW5nRXJmYXNzZW46IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcHJpdmF0ZSBvbkNob29zZTogKHR5cDogc3RyaW5nLCBzdGltbXVuZ0VyZmFzc2VuOiBib29sZWFuKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIG9uT3BlbigpIHtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogXCJOb3RpeiB0YWdnZW5cIiB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIldlbGNoZXIgQXJ0IGlzdCBkaWVzZSBOb3Rpej8gRGVyIFR5cCBvcmRuZXQgc2llIGZ1ZXIgZGVuIHNwYWV0ZXJlbiBDaGF0IGVpbi5cIiB9KTtcbiAgICBuZXcgU2V0dGluZyh0aGlzLmNvbnRlbnRFbCkuc2V0TmFtZShcIlN0aW1tdW5nIG1pdGVyZmFzc2VuXCIpLnNldERlc2MoXCJOYWNoIGRlciBUeXAtV2FobCBlcnNjaGVpbmVuIGRpZSBTdGltbXVuZ3NzbGlkZXIuIERpZSBXZXJ0ZSB3ZXJkZW4gYWxzIENoaWZmcmUtS29tbWVudGFyIGFuIGRlciBDdXJzb3ItUG9zaXRpb24gZWluZ2VmdWVndCwgaW4gZGVyIExlc2Fuc2ljaHQgdW5zaWNodGJhci5cIilcbiAgICAgIC5hZGRUb2dnbGUoKHMpID0+IHMuc2V0VmFsdWUoZmFsc2UpLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuc3RpbW11bmdFcmZhc3NlbiA9IHY7IH0pKTtcbiAgICBmb3IgKGNvbnN0IHQgb2YgVFlQRU4pIHtcbiAgICAgIG5ldyBTZXR0aW5nKHRoaXMuY29udGVudEVsKS5zZXROYW1lKHQpLnNldERlc2MoVFlQX1RFWFRbdF0pXG4gICAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIldhZWhsZW5cIikub25DbGljaygoKSA9PiB7IHRoaXMub25DaG9vc2UodCwgdGhpcy5zdGltbXVuZ0VyZmFzc2VuKTsgdGhpcy5jbG9zZSgpOyB9KSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEpvdXJuYWxNb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgcHJpdmF0ZSBkYXRlbjogSm91cm5hbERhdGVuID0geyB0aXRlbDogXCJcIiwgdmFsZW5jZTogNSwgYXJvdXNhbDogNSwgYmVsYXN0dW5nOiA1LCBrb2VycGVyOiA1LCBrb250ZXh0ZTogW10sIGF1c25haG1lOiBmYWxzZSB9O1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIG9uRmVydGlnOiAoZDogSm91cm5hbERhdGVuKSA9PiB2b2lkLCBwcml2YXRlIG5hY2h0cmFnOiBib29sZWFuKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgfVxuXG4gIHByaXZhdGUgYmF1ZVNsaWRlcihjb250YWluZXI6IEhUTUxFbGVtZW50LCB0aXRlbDogc3RyaW5nLCBoaW53ZWlzOiBzdHJpbmcsIG9uV2VydDogKG46IG51bWJlcikgPT4gdm9pZCkge1xuICAgIGNvbnRhaW5lci5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiB0aXRlbCArIFwiIChcIiArIGhpbndlaXMgKyBcIilcIiB9KTtcbiAgICBjb25zdCByZWloZSA9IGNvbnRhaW5lci5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJhcmlhZG5lLXNsaWRlci16ZWlsZVwiIH0pO1xuICAgIGNvbnN0IGlucHV0ID0gcmVpaGUuY3JlYXRlRWwoXCJpbnB1dFwiLCB7IHR5cGU6IFwicmFuZ2VcIiB9KTtcbiAgICBpbnB1dC5taW4gPSBcIjBcIjtcbiAgICBpbnB1dC5tYXggPSBcIjEwXCI7XG4gICAgaW5wdXQuc3RlcCA9IFwiMVwiO1xuICAgIGlucHV0LnZhbHVlID0gXCI1XCI7XG4gICAgY29uc3QgYW56ZWlnZSA9IHJlaWhlLmNyZWF0ZUVsKFwic3BhblwiLCB7IHRleHQ6IFwiNVwiIH0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBuID0gcGFyc2VJbnQoaW5wdXQudmFsdWUsIDEwKTtcbiAgICAgIGFuemVpZ2Uuc2V0VGV4dChTdHJpbmcobikpO1xuICAgICAgb25XZXJ0KG4pO1xuICAgIH0pO1xuICB9XG5cbiAgb25PcGVuKCkge1xuICAgIGNvbnN0IGMgPSB0aGlzLmNvbnRlbnRFbDtcbiAgICBjLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiB0aGlzLm5hY2h0cmFnID8gXCJTdGltbXVuZyBhbiBkaWVzZXIgU3RlbGxlIGVyZmFzc2VuXCIgOiBcIk5ldWVyIEpvdXJuYWwtRWludHJhZ1wiIH0pO1xuICAgIGMuY3JlYXRlRWwoXCJwXCIsIHsgdGV4dDogdGhpcy5uYWNodHJhZyA/IFwiU3RpbW11bmcgZXJmYXNzZW4sIEtvbnRleHRlIHdhZWhsZW4sIGRhbm4gZWluZnVlZ2VuLiBEaWUgQ2hpZmZyZSBsYW5kZXQgYW4gZGVyIEN1cnNvci1Qb3NpdGlvbiwgZGllIFplaWxlIGRhcnVudGVyIGlzdCBiZXJlaXQgenVtIERpa3RpZXJlbi4gSW4gZGVyIExlc2Fuc2ljaHQgYmxlaWJ0IGFsbGVzIHVuc2ljaHRiYXIuXCIgOiBcIlN0aW1tdW5nIGVyZmFzc2VuLCBLb250ZXh0ZSB3YWVobGVuLCBkYW5uIHNjaHJlaWJlbi4gRGVyIEVpbnRyYWcgbGFuZGV0IHVudGVyIGVpbnRyYWVnZS8sIGlzdCBzb2ZvcnQgZ2V0YWdndCB1bmQgb2ZmZW4genVtIERpa3RpZXJlbi4gTWVocmVyZSBwcm8gVGFnIHNpbmQgZXJsYXVidC5cIiB9KTtcbiAgICBpZiAoIXRoaXMubmFjaHRyYWcpIHtcbiAgICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJUaXRlbCAob3B0aW9uYWwpXCIpLmFkZFRleHQoKHQpID0+IHQuc2V0UGxhY2Vob2xkZXIoXCJ6LkIuIE5hY2ggZGVyIExlaHJlXCIpLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuZGF0ZW4udGl0ZWwgPSB2OyB9KSk7XG4gICAgfVxuICAgIHRoaXMuYmF1ZVNsaWRlcihjLCBcIlZhbGVuelwiLCBcIjAgdW5hbmdlbmVobSwgMTAgYW5nZW5laG1cIiwgKG4pID0+IHsgdGhpcy5kYXRlbi52YWxlbmNlID0gbjsgfSk7XG4gICAgdGhpcy5iYXVlU2xpZGVyKGMsIFwiQWt0aXZpZXJ1bmdcIiwgXCIwIHJ1aGlnLCAxMCBha3RpdmllcnRcIiwgKG4pID0+IHsgdGhpcy5kYXRlbi5hcm91c2FsID0gbjsgfSk7XG4gICAgdGhpcy5iYXVlU2xpZGVyKGMsIFwiQmVsYXN0dW5nXCIsIFwiMCBlbnRzcGFubnQsIDEwIGFuZ2VzcGFubnRcIiwgKG4pID0+IHsgdGhpcy5kYXRlbi5iZWxhc3R1bmcgPSBuOyB9KTtcbiAgICB0aGlzLmJhdWVTbGlkZXIoYywgXCJLb2VycGVyXCIsIFwiMCB2ZXJzcGFubnQsIDEwIGZyZWlcIiwgKG4pID0+IHsgdGhpcy5kYXRlbi5rb2VycGVyID0gbjsgfSk7XG4gICAgYy5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIktvbnRleHRlIGhldXRlIChNZWhyZmFjaHdhaGwpXCIgfSk7XG4gICAgY29uc3Qga2FjaGVsbiA9IGMuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwiYXJpYWRuZS1rYWNoZWxuXCIgfSk7XG4gICAgZm9yIChjb25zdCBrIG9mIEtPTlRFWFRFKSB7XG4gICAgICBjb25zdCBiID0ga2FjaGVsbi5jcmVhdGVFbChcImJ1dHRvblwiLCB7IHRleHQ6IGssIGNsczogXCJhcmlhZG5lLWthY2hlbFwiIH0pO1xuICAgICAgYi50eXBlID0gXCJidXR0b25cIjtcbiAgICAgIGIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgcG9zID0gdGhpcy5kYXRlbi5rb250ZXh0ZS5pbmRleE9mKGspO1xuICAgICAgICBpZiAocG9zID09PSAtMSkgeyB0aGlzLmRhdGVuLmtvbnRleHRlLnB1c2goayk7IGIuYWRkQ2xhc3MoXCJhcmlhZG5lLWthY2hlbC1ha3RpdlwiKTsgfVxuICAgICAgICBlbHNlIHsgdGhpcy5kYXRlbi5rb250ZXh0ZS5zcGxpY2UocG9zLCAxKTsgYi5yZW1vdmVDbGFzcyhcImFyaWFkbmUta2FjaGVsLWFrdGl2XCIpOyB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkF1c25haG1lLUVyZWlnbmlzXCIpLnNldERlc2MoXCJFdHdhcyBBdXNzZXJnZXdvZWhubGljaGVzIGlzdCBwYXNzaWVydC5cIilcbiAgICAgIC5hZGRUb2dnbGUoKHQpID0+IHQuc2V0VmFsdWUoZmFsc2UpLm9uQ2hhbmdlKCh2KSA9PiB7IHRoaXMuZGF0ZW4uYXVzbmFobWUgPSB2OyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYylcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dCh0aGlzLm5hY2h0cmFnID8gXCJDaGlmZnJlIGVpbmZ1ZWdlblwiIDogXCJFaW50cmFnIGFubGVnZW5cIikuc2V0Q3RhKCkub25DbGljaygoKSA9PiB7IHRoaXMub25GZXJ0aWcodGhpcy5kYXRlbik7IHRoaXMuY2xvc2UoKTsgfSkpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJBYmJyZWNoZW5cIikub25DbGljaygoKSA9PiB0aGlzLmNsb3NlKCkpKTtcbiAgfVxufVxuXG5jbGFzcyBSZWZsZXhpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHByaXZhdGUgcGx1Z2luOiBBcmlhZG5lUGx1Z2luLCBwcml2YXRlIHByb3Rva29sbDogUmVmbGV4aW9uc1Byb3Rva29sbCwgcHJpdmF0ZSBpZHg6IG51bWJlcikge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKSB7XG4gICAgY29uc3QgcyA9IHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlW3RoaXMuaWR4XTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcImgzXCIsIHsgdGV4dDogdGhpcy5wcm90b2tvbGwubmFtZSB9KTtcbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIlNjaHJpdHQgXCIgKyAodGhpcy5pZHggKyAxKSArIFwiIHZvbiBcIiArIHRoaXMucHJvdG9rb2xsLnNjaHJpdHRlLmxlbmd0aCArIFwiOiBcIiArIHMudGl0ZWwgfSk7XG4gICAgZm9yIChjb25zdCBhIG9mIHMuYW5sZWl0dW5nKSB7XG4gICAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBhIH0pO1xuICAgIH1cbiAgICB0aGlzLmNvbnRlbnRFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIk5pbW0gZGlyIGRpZSBaZWl0IGluIFJ1aGUuIEVpbiBTY2hyaXR0IHBybyBUYWcsIG5pY2h0IG1laHIuXCIgfSk7XG4gICAgbmV3IFNldHRpbmcodGhpcy5jb250ZW50RWwpXG4gICAgICAuYWRkQnV0dG9uKChiKSA9PiBiLnNldEJ1dHRvblRleHQoXCJTaXR6dW5nIHN0YXJ0ZW5cIikuc2V0Q3RhKCkub25DbGljayhhc3luYyAoKSA9PiB7IGF3YWl0IHRoaXMucGx1Z2luLnN0YXJ0ZVNpdHp1bmcodGhpcy5wcm90b2tvbGwsIHRoaXMuaWR4KTsgdGhpcy5jbG9zZSgpOyB9KSlcbiAgICAgIC5hZGRCdXR0b24oKGIpID0+IGIuc2V0QnV0dG9uVGV4dChcIlNjaHJpdHQgYWJzY2hsaWVzc2VuXCIpLm9uQ2xpY2soYXN5bmMgKCkgPT4geyBhd2FpdCB0aGlzLnBsdWdpbi5zY2hyaXR0QWJzY2hsaWVzc2VuKHRoaXMucHJvdG9rb2xsLCB0aGlzLmlkeCk7IHRoaXMuY2xvc2UoKTsgfSkpO1xuICB9XG59XG5cbmNsYXNzIEFyaWFkbmVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwcml2YXRlIHBsdWdpbjogQXJpYWRuZVBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgfVxuXG4gIGRpc3BsYXkoKSB7XG4gICAgY29uc3QgYyA9IHRoaXMuY29udGFpbmVyRWw7XG4gICAgYy5lbXB0eSgpO1xuICAgIGMuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQXJpYWRuZVwiIH0pO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJFbmRwdW5rdFwiKS5zZXREZXNjKFwiT3BlbkFJLWtvbXBhdGlibGVyIEVuZHB1bmt0LCBTdGFuZGFyZCBPbGxhbWEuIFdpcmQgZXJzdCBtaXQgZGVtIENoYXQgKE00KSBnZWJyYXVjaHQuXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRQbGFjZWhvbGRlcihcImh0dHA6Ly8xMjcuMC4wLjE6MTE0MzRcIikuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZW5kcG9pbnQpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyB0aGlzLnBsdWdpbi5zZXR0aW5ncy5lbmRwb2ludCA9IHYudHJpbSgpOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJNb2RlbGxcIikuc2V0RGVzYyhcInouQi4gbGxhbWEzLjIsIG1pc3RyYWwtc21hbGwuIFdpcmQgZXJzdCBtaXQgZGVtIENoYXQgKE00KSBnZWJyYXVjaHQuXCIpXG4gICAgICAuYWRkVGV4dCgodCkgPT4gdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5tb2RlbClcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLm1vZGVsID0gdi50cmltKCk7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIlRlbXBlcmF0dXJcIilcbiAgICAgIC5hZGRUZXh0KCh0KSA9PiB0LnNldFZhbHVlKFN0cmluZyh0aGlzLnBsdWdpbi5zZXR0aW5ncy50ZW1wZXJhdHVyZSkpXG4gICAgICAgIC5vbkNoYW5nZShhc3luYyAodikgPT4geyBjb25zdCBuID0gcGFyc2VGbG9hdCh2LnJlcGxhY2UoXCIsXCIsIFwiLlwiKSk7IHRoaXMucGx1Z2luLnNldHRpbmdzLnRlbXBlcmF0dXJlID0gaXNOYU4obikgPyAwLjQgOiBuOyBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTsgfSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJHZXRhZ2d0ZSBOb3RpemVuIGFscyBDaGF0LUtvbnRleHRcIikuc2V0RGVzYyhcIkFiIE00OiBnZXRhZ2d0ZSBOb3RpemVuIGRlc3NlbGJlbiBWYXVsdHMgZmxpZXNlbiBpbiBkZW4gQ2hhdCBlaW4uXCIpXG4gICAgICAuYWRkVG9nZ2xlKCh0KSA9PiB0LnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbilcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2KSA9PiB7IHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRFaW5iZXppZWhlbiA9IHY7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFuemFobCBLb250ZXh0bm90aXplblwiKVxuICAgICAgLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLmtvbnRleHRBbnphaGwpKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgY29uc3QgbiA9IHBhcnNlSW50KHYsIDEwKTsgdGhpcy5wbHVnaW4uc2V0dGluZ3Mua29udGV4dEFuemFobCA9IGlzTmFOKG4pID8gOCA6IG47IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB9KSk7XG4gICAgY29uc3QgZHJvcCA9IG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJSZWZsZXhpb25zcHJvdG9rb2xsXCIpLnNldERlc2MoXCJEZXIgUGZhZCwgZGVuIFJlZmxla3RpZXJlbiB3ZWl0ZXJmdWVocnQuXCIpO1xuICAgIGRyb3AuYWRkRHJvcGRvd24oKGQpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBQUk9UT0tPTExFKSB7IGQuYWRkT3B0aW9uKHAuaWQsIHAubmFtZSk7IH1cbiAgICAgIGQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsKVxuICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHYpID0+IHsgdGhpcy5wbHVnaW4uc2V0dGluZ3MucHJvdG9rb2xsID0gdjsgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2Nocml0dCA9IDA7IGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpOyB0aGlzLmRpc3BsYXkoKTsgfSk7XG4gICAgfSk7XG4gICAgbmV3IFNldHRpbmcoYykuc2V0TmFtZShcIkFrdHVlbGxlciBTY2hyaXR0XCIpLmFkZFRleHQoKHQpID0+IHQuc2V0VmFsdWUoU3RyaW5nKHRoaXMucGx1Z2luLnNldHRpbmdzLnNjaHJpdHQgKyAxKSkuc2V0RGlzYWJsZWQodHJ1ZSkpO1xuICAgIG5ldyBTZXR0aW5nKGMpLnNldE5hbWUoXCJLcmlzZW53ZWl0ZXJsZWl0dW5nXCIpLnNldERlc2MoXCJEZXIgQ2hhdCAoTTQpIHBydWVmdCBBbmZyYWdlbiBhdWYgS3Jpc2Vuc2lnbmFsZS4gVGVsZWZvbnNlZWxzb3JnZTogMDgwMCAxMTEgMCAxMTEgb2RlciAwODAwIDExMSAwIDIyMi4gSW0gYWt1dGVuIE5vdGZhbGw6IDExMi5cIik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJpYWRuZVBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XG4gIHNldHRpbmdzOiBBcmlhZG5lU2V0dGluZ3M7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpXG4gICAgdGhpcy5hZGRSaWJib25JY29uKFwiZ2l0LWJyYW5jaFwiLCBcIkFyaWFkbmVcIiwgKGV2dDogTW91c2VFdmVudCkgPT4gdGhpcy5vZWZmbmVNZW51ZShldnQpKTtcbiAgICB0aGlzLmFkZENvbW1hbmQoeyBpZDogXCJhcmlhZG5lLWpvdXJuYWxcIiwgbmFtZTogXCJBcmlhZG5lOiBOZXVlciBKb3VybmFsLUVpbnRyYWcgbWl0IFN0aW1tdW5nc2VyZmFzc3VuZ1wiLCBjYWxsYmFjazogKCkgPT4gdGhpcy5vZWZmbmVKb3VybmFsRWludHJhZygpIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7IGlkOiBcImFyaWFkbmUtbWFya2llcnVuZ1wiLCBuYW1lOiBcIkFyaWFkbmU6IE5vdGl6IHRhZ2dlblwiLCBjYWxsYmFjazogKCkgPT4gdGhpcy50b2dnbGVNYXJraWVydW5nKCkgfSk7XG4gICAgdGhpcy5hZGRDb21tYW5kKHsgaWQ6IFwiYXJpYWRuZS1zdGltbXVuZ1wiLCBuYW1lOiBcIkFyaWFkbmU6IFN0aW1tdW5nIGFuIGRpZXNlciBTdGVsbGUgZXJmYXNzZW5cIiwgY2FsbGJhY2s6ICgpID0+IHRoaXMub2VmZm5lU3RpbW11bmdFcmZhc3N1bmcoKSB9KTtcbiAgICB0aGlzLmFkZENvbW1hbmQoeyBpZDogXCJhcmlhZG5lLXJlZmxla3RpZXJlblwiLCBuYW1lOiBcIkFyaWFkbmU6IFJlZmxla3RpZXJlbiAtIG5hZWNoc3RlciBTY2hyaXR0XCIsIGNhbGxiYWNrOiAoKSA9PiB0aGlzLnJlZmxla3RpZXJlbigpIH0pO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudCh0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJlZGl0b3ItbWVudVwiLCAobWVudTogTWVudSkgPT4ge1xuICAgICAgbWVudS5hZGRTZXBhcmF0b3IoKTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFyaWFkbmU6IHRhZ2dlblwiKS5zZXRJY29uKFwiYm9va21hcmtcIikub25DbGljaygoKSA9PiB0aGlzLnRvZ2dsZU1hcmtpZXJ1bmcoKSkpO1xuICAgICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiQXJpYWRuZTogU3RpbW11bmcgaGllciBlcmZhc3NlblwiKS5zZXRJY29uKFwiaGVhcnQtcHVsc2VcIikub25DbGljaygoKSA9PiB0aGlzLm9lZmZuZVN0aW1tdW5nRXJmYXNzdW5nKCkpKTtcbiAgICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIkFyaWFkbmU6IFJlZmxla3RpZXJlblwiKS5zZXRJY29uKFwiZm9vdHByaW50c1wiKS5vbkNsaWNrKCgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkpKTtcbiAgICB9KSk7XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBcmlhZG5lU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cblxuICBwcml2YXRlIG9lZmZuZU1lbnVlKGV2dDogTW91c2VFdmVudCkge1xuICAgIGNvbnN0IG1lbnUgPSBuZXcgTWVudSgpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIk5ldWVyIEpvdXJuYWwtRWludHJhZyBtaXQgU3RpbW11bmdzZXJmYXNzdW5nXCIpLnNldEljb24oXCJhY3Rpdml0eVwiKS5vbkNsaWNrKCgpID0+IHRoaXMub2VmZm5lSm91cm5hbEVpbnRyYWcoKSkpO1xuICAgIG1lbnUuYWRkU2VwYXJhdG9yKCk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiTm90aXogdGFnZ2VuXCIpLnNldEljb24oXCJib29rbWFya1wiKS5vbkNsaWNrKCgpID0+IHRoaXMudG9nZ2xlTWFya2llcnVuZygpKSk7XG4gICAgbWVudS5hZGRJdGVtKChpKSA9PiBpLnNldFRpdGxlKFwiU3RpbW11bmcgYW4gZGllc2VyIFN0ZWxsZSBlcmZhc3NlblwiKS5zZXRJY29uKFwiaGVhcnQtcHVsc2VcIikub25DbGljaygoKSA9PiB0aGlzLm9lZmZuZVN0aW1tdW5nRXJmYXNzdW5nKCkpKTtcbiAgICBtZW51LmFkZEl0ZW0oKGkpID0+IGkuc2V0VGl0bGUoXCJSZWZsZWt0aWVyZW4gLSBuYWVjaHN0ZXIgU2Nocml0dFwiKS5zZXRJY29uKFwiZm9vdHByaW50c1wiKS5vbkNsaWNrKCgpID0+IHRoaXMucmVmbGVrdGllcmVuKCkpKTtcbiAgICBtZW51LmFkZFNlcGFyYXRvcigpO1xuICAgIG1lbnUuYWRkSXRlbSgoaSkgPT4gaS5zZXRUaXRsZShcIk1pdCBBcmlhZG5lIHNwcmVjaGVuIChmb2xndClcIikuc2V0SWNvbihcIm1lc3NhZ2UtY2lyY2xlXCIpLm9uQ2xpY2soKCkgPT4gbmV3IE5vdGljZShcIkFyaWFkbmU6IERlciBDaGF0IHVlYmVyIGFsbGUgZ2V0YWdndGVuIE5vdGl6ZW4gZm9sZ3QgYWxzIE00LiBGcmFnZW4gd2llICdXZWxjaGUgTXVzdGVyIGRlY2tzdCBkdSBhdWY/JyBvZGVyICdXYXMgaGF0IEtyYWZ0IGdlZ2ViZW4/JyB3ZXJkZW4gZGFubiBtb2VnbGljaC5cIikpKTtcbiAgICBtZW51LnNob3dBdE1vdXNlRXZlbnQoZXZ0KTtcbiAgfVxuXG4gIG9lZmZuZUpvdXJuYWxFaW50cmFnKCkge1xuICAgIG5ldyBKb3VybmFsTW9kYWwodGhpcy5hcHAsIGFzeW5jIChkOiBKb3VybmFsRGF0ZW4pID0+IHsgYXdhaXQgdGhpcy5lcnN0ZWxsZUpvdXJuYWxFaW50cmFnKGQpOyB9LCBmYWxzZSkub3BlbigpO1xuICB9XG5cbiAgb2VmZm5lU3RpbW11bmdFcmZhc3N1bmcoKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgbmV3IEpvdXJuYWxNb2RhbCh0aGlzLmFwcCwgYXN5bmMgKGQ6IEpvdXJuYWxEYXRlbikgPT4geyBhd2FpdCB0aGlzLmZ1ZWdlU3RpbW11bmdFaW4odmlldywgZCk7IH0sIHRydWUpLm9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgc2ljaGVyZXJPcmRuZXIocGZhZDogc3RyaW5nKSB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMocGZhZCkpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGVGb2xkZXIocGZhZCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIE9yZG5lciBrYW5uIHNjaG9uIGV4aXN0aWVyZW4sIGlnbm9yaWVyZW4uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZXJzdGVsbGVKb3VybmFsRWludHJhZyhkOiBKb3VybmFsRGF0ZW4pIHtcbiAgICBjb25zdCBpc28gPSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuICAgIGNvbnN0IHplaXQgPSBtb21lbnQoKS5mb3JtYXQoXCJISDptbVwiKTtcbiAgICBjb25zdCBwZmFkID0gXCJlaW50cmFlZ2UvXCIgKyBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLURELUhIbW1cIikgKyBcIi5tZFwiO1xuICAgIGNvbnN0IHRpdGVsID0gZC50aXRlbC50cmltKCkubGVuZ3RoID4gMCA/IGQudGl0ZWwudHJpbSgpIDogaXNvICsgXCIgXCIgKyB6ZWl0O1xuICAgIGNvbnN0IGtvbnRleHRlID0gZC5rb250ZXh0ZS5sZW5ndGggPT09IDAgPyBcIltdXCIgOiBcIltcIiArIGQua29udGV4dGUuam9pbihcIiwgXCIpICsgXCJdXCI7XG4gICAgY29uc3QgYmFzZWxpbmUgPSBbXG4gICAgICBcIlZhbGVueiBcIiArIFN0cmluZyhkLnZhbGVuY2UpICsgXCIvMTAgKDAgdW5hbmdlbmVobSwgMTAgYW5nZW5laG0pXCIsXG4gICAgICBcIkFrdGl2aWVydW5nIFwiICsgU3RyaW5nKGQuYXJvdXNhbCkgKyBcIi8xMCAoMCBydWhpZywgMTAgYWt0aXZpZXJ0KVwiLFxuICAgICAgXCJCZWxhc3R1bmcgXCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpICsgXCIvMTAgKDAgZW50c3Bhbm50LCAxMCBhbmdlc3Bhbm50KVwiLFxuICAgICAgXCJLb2VycGVyIFwiICsgU3RyaW5nKGQua29lcnBlcikgKyBcIi8xMCAoMCB2ZXJzcGFubnQsIDEwIGZyZWkpXCJcbiAgICBdLmpvaW4oXCIsIFwiKTtcbiAgICBjb25zdCB6ZWlsZW46IHN0cmluZ1tdID0gW1xuICAgICAgXCItLS1cIixcbiAgICAgIFwidHlwOiBqb3VybmFsXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwiZGF0dW06IFwiICsgaXNvLFxuICAgICAgXCJ1aHJ6ZWl0OiBcIiArIHplaXQsXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwidmFsZW5jZTogXCIgKyBTdHJpbmcoZC52YWxlbmNlKSxcbiAgICAgIFwiYXJvdXNhbDogXCIgKyBTdHJpbmcoZC5hcm91c2FsKSxcbiAgICAgIFwiYmVsYXN0dW5nOiBcIiArIFN0cmluZyhkLmJlbGFzdHVuZyksXG4gICAgICBcImtvZXJwZXI6IFwiICsgU3RyaW5nKGQua29lcnBlciksXG4gICAgICBcImtvbnRleHRlOiBcIiArIGtvbnRleHRlLFxuICAgICAgXCJhdXNuYWhtZTogXCIgKyAoZC5hdXNuYWhtZSA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiKSxcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgdGl0ZWwsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIyBCYXNlbGluZVwiLFxuICAgICAgXCJcIixcbiAgICAgIGJhc2VsaW5lLFxuICAgICAgXCJcIixcbiAgICAgIFwiS29udGV4dGU6IFwiICsgKGQua29udGV4dGUubGVuZ3RoID09PSAwID8gXCJrZWluZVwiIDogZC5rb250ZXh0ZS5qb2luKFwiLCBcIikpICsgKGQuYXVzbmFobWUgPyBcIiB8IEF1c25haG1lLUVyZWlnbmlzXCIgOiBcIlwiKSxcbiAgICAgIFwiXCIsXG4gICAgICBcIiMjIFdhcyB3YXIgaGV1dGVcIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkZha3RlbjogV2FzIGlzdCBwYXNzaWVydD9cIixcbiAgICAgIFwiXCIsXG4gICAgICBcIkdlZnVlaGxlOiBXYXMgaGF0IGVzIG1pdCBtaXIgZ2VtYWNodD9cIixcbiAgICAgIFwiXCJcbiAgICBdO1xuICAgIGF3YWl0IHRoaXMuc2ljaGVyZXJPcmRuZXIoXCJlaW50cmFlZ2VcIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGYgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUocGZhZCwgemVpbGVuLmpvaW4oXCJcXG5cIikpO1xuICAgICAgYXdhaXQgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYodHJ1ZSkub3BlbkZpbGUoZik7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogSm91cm5hbC1FaW50cmFnIGFuZ2VsZWd0IHVuZCBnZXRhZ2d0LlwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogS29ubnRlIGRlbiBKb3VybmFsLUVpbnRyYWcgbmljaHQgYW5sZWdlbi5cIik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZnVlZ2VTdGltbXVuZ0Vpbih2aWV3OiBNYXJrZG93blZpZXcgfCBudWxsLCBkOiBKb3VybmFsRGF0ZW4pIHtcbiAgICBpZiAoIXZpZXcgfHwgIXZpZXcuZWRpdG9yKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogS2VpbmUgb2ZmZW5lIE5vdGl6IC0gU3RpbW11bmcga2FubiBuaWNodCBlaW5nZWZ1ZWd0IHdlcmRlbi5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHplaXQgPSBtb21lbnQoKS5mb3JtYXQoXCJZWVlZLU1NLUREIEhIOm1tXCIpO1xuICAgIGNvbnN0IHRlaWxlOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiJSVhcmlhZG5lLXN0aW1tdW5nIFwiICsgemVpdCxcbiAgICAgIFwidj1cIiArIFN0cmluZyhkLnZhbGVuY2UpLFxuICAgICAgXCJhPVwiICsgU3RyaW5nKGQuYXJvdXNhbCksXG4gICAgICBcImI9XCIgKyBTdHJpbmcoZC5iZWxhc3R1bmcpLFxuICAgICAgXCJrPVwiICsgU3RyaW5nKGQua29lcnBlcilcbiAgICBdO1xuICAgIGlmIChkLmtvbnRleHRlLmxlbmd0aCA+IDApIHtcbiAgICAgIHRlaWxlLnB1c2goXCJrb250ZXh0ZT1cIiArIGQua29udGV4dGUuam9pbihcIixcIikpO1xuICAgIH1cbiAgICBpZiAoZC5hdXNuYWhtZSkge1xuICAgICAgdGVpbGUucHVzaChcImF1c25haG1lPXRydWVcIik7XG4gICAgfVxuICAgIGNvbnN0IGNoaWZmcmUgPSB0ZWlsZS5qb2luKFwiIFwiKSArIFwiJSVcIjtcbiAgICBjb25zdCBlZGl0b3IgPSB2aWV3LmVkaXRvcjtcbiAgICBjb25zdCBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oKHBvcy5jaCA+IDAgPyBcIlxcblwiIDogXCJcIikgKyBjaGlmZnJlICsgXCJcXG5cIik7XG4gICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFN0aW1tdW5nIGFscyBDaGlmZnJlIGVpbmdlZnVlZ3QgKExlc2Fuc2ljaHQgemVpZ3Qgc2llIG5pY2h0KS5cIik7XG4gIH1cblxuICBwcml2YXRlIGZyb250bWF0dGVyVm9uKGZpbGU6IFRGaWxlKTogYW55IHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgIGlmIChjYWNoZSAmJiBjYWNoZS5mcm9udG1hdHRlcikgeyByZXR1cm4gY2FjaGUuZnJvbnRtYXR0ZXI7IH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZU1hcmtpZXJ1bmcoKSB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgY29uc3QgZmlsZSA9IHZpZXcgPyB2aWV3LmZpbGUgOiB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgIGlmICghZmlsZSkgeyBuZXcgTm90aWNlKFwiQXJpYWRuZTogS2VpbmUgYWt0aXZlIE5vdGl6LlwiKTsgcmV0dXJuOyB9XG4gICAgY29uc3QgZm0gPSB0aGlzLmZyb250bWF0dGVyVm9uKGZpbGUpO1xuICAgIGlmIChmbSAmJiBmbVtcImFyaWFkbmVcIl0gPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gZmFsc2U7IH0pO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFRhZyBlbnRmZXJudC5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHR5cCA9IGZtID8gZm1bXCJ0eXBcIl0gOiBudWxsO1xuICAgIGlmICh0eXApIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gdHJ1ZTsgfSk7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTm90aXogZ2V0YWdndCAodHlwOiBcIiArIFN0cmluZyh0eXApICsgXCIpLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3IFR5cE1vZGFsKHRoaXMuYXBwLCBhc3luYyAodDogc3RyaW5nLCBzdGltbXVuZ0VyZmFzc2VuOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLmZpbGVNYW5hZ2VyLnByb2Nlc3NGcm9udE1hdHRlcihmaWxlLCAoZjogYW55KSA9PiB7IGZbXCJhcmlhZG5lXCJdID0gdHJ1ZTsgZltcInR5cFwiXSA9IHQ7IH0pO1xuICAgICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogTm90aXogZ2V0YWdndCBhbHMgXCIgKyB0ICsgXCIuXCIpO1xuICAgICAgICBpZiAoc3RpbW11bmdFcmZhc3Nlbikge1xuICAgICAgICAgIG5ldyBKb3VybmFsTW9kYWwodGhpcy5hcHAsIGFzeW5jIChkOiBKb3VybmFsRGF0ZW4pID0+IHsgYXdhaXQgdGhpcy5mdWVnZVN0aW1tdW5nRWluKHZpZXcsIGQpOyB9LCB0cnVlKS5vcGVuKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLm9wZW4oKTtcbiAgICB9XG4gIH1cblxuICByZWZsZWt0aWVyZW4oKSB7XG4gICAgY29uc3QgcCA9IFBST1RPS09MTEUuZmluZCgoeCkgPT4geC5pZCA9PT0gdGhpcy5zZXR0aW5ncy5wcm90b2tvbGwpO1xuICAgIGNvbnN0IHByb3QgPSBwID8gcCA6IFBST1RPS09MTEVbMF07XG4gICAgaWYgKHRoaXMuc2V0dGluZ3Muc2Nocml0dCA+PSBwcm90LnNjaHJpdHRlLmxlbmd0aCkge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFByb3Rva29sbCBhYmdlc2NobG9zc2VuLiBTZXR6ZSBkZW4gU2Nocml0dCBpbiBkZW4gRWluc3RlbGx1bmdlbiB6dXJ1ZWNrIG9kZXIgd2VjaHNsZSBkYXMgUHJvdG9rb2xsLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbmV3IFJlZmxleGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLCBwcm90LCB0aGlzLnNldHRpbmdzLnNjaHJpdHQpLm9wZW4oKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0ZVNpdHp1bmcocDogUmVmbGV4aW9uc1Byb3Rva29sbCwgaWR4OiBudW1iZXIpIHtcbiAgICBjb25zdCBzID0gcC5zY2hyaXR0ZVtpZHhdO1xuICAgIGNvbnN0IGlzbyA9IG1vbWVudCgpLmZvcm1hdChcIllZWVktTU0tRERcIik7XG4gICAgY29uc3QgcGZhZCA9IFwicmVmbGV4aW9uZW4vXCIgKyBpc28gKyBcIi1cIiArIHAuaWQgKyBcIi1cIiArIChpZHggKyAxKSArIFwiLm1kXCI7XG4gICAgY29uc3QgemVpbGVuOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcInR5cDogcmVmbGV4aW9uXCIsXG4gICAgICBcImFyaWFkbmU6IHRydWVcIixcbiAgICAgIFwicHJvdG9rb2xsOiBcIiArIHAuaWQsXG4gICAgICBcInNjaHJpdHQ6IFwiICsgKGlkeCArIDEpLFxuICAgICAgXCJkYXR1bTogXCIgKyBpc28sXG4gICAgICBcInp1c3RhbmQ6IGdlc3Byb2NoZW5cIixcbiAgICAgIFwiLS0tXCIsXG4gICAgICBcIlwiLFxuICAgICAgXCIjIFwiICsgcy50aXRlbCxcbiAgICAgIFwiXCJcbiAgICBdLmNvbmNhdChzLmFubGVpdHVuZykuY29uY2F0KFtcbiAgICAgIFwiXCIsXG4gICAgICBcIigxNSBiaXMgMjAgTWludXRlbiwgb2huZSBQYXVzZS4gVGlwcGVuIG9kZXIgZGlrdGllcmVuIC0gYmVpZGVzIHphZWhsdC4pXCIsXG4gICAgICBcIlwiXG4gICAgXSk7XG4gICAgYXdhaXQgdGhpcy5zaWNoZXJlck9yZG5lcihcInJlZmxleGlvbmVuXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKHBmYWQsIHplaWxlbi5qb2luKFwiXFxuXCIpKTtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKHRydWUpLm9wZW5GaWxlKGYpO1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IFNpdHp1bmcgZ2VzdGFydGV0IC0gXCIgKyBzLnRpdGVsICsgXCIuXCIpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIG5ldyBOb3RpY2UoXCJBcmlhZG5lOiBLb25udGUgZGllIFNpdHp1bmdzbm90aXogbmljaHQgYW5sZWdlbiAoZXhpc3RpZXJ0IHNpZSBzY2hvbj8pLlwiKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzY2hyaXR0QWJzY2hsaWVzc2VuKHA6IFJlZmxleGlvbnNQcm90b2tvbGwsIGlkeDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXR0aW5ncy5zY2hyaXR0ID0gaWR4ICsgMTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5zY2hyaXR0ID49IHAuc2Nocml0dGUubGVuZ3RoKSB7XG4gICAgICBuZXcgTm90aWNlKFwiQXJpYWRuZTogUHJvdG9rb2xsIGFiZ2VzY2hsb3NzZW4gLSBcIiArIHAubmFtZSArIFwiLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3IE5vdGljZShcIkFyaWFkbmU6IE5hZWNoc3RlciBTY2hyaXR0IGlzdCBcIiArIHAuc2Nocml0dGVbdGhpcy5zZXR0aW5ncy5zY2hyaXR0XS50aXRlbCArIFwiLlwiKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQXlHO0FBWXpHLElBQU0sbUJBQW9DO0FBQUEsRUFDeEMsVUFBVTtBQUFBLEVBQ1YsT0FBTztBQUFBLEVBQ1AsYUFBYTtBQUFBLEVBQ2Isb0JBQW9CO0FBQUEsRUFDcEIsZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsU0FBUztBQUNYO0FBRUEsSUFBTSxRQUFrQixDQUFDLFdBQVcsVUFBVSxhQUFhLFNBQVMsV0FBVyxTQUFTLFdBQVc7QUFFbkcsSUFBTSxXQUFtQztBQUFBLEVBQ3ZDLFdBQVc7QUFBQSxFQUNYLFVBQVU7QUFBQSxFQUNWLFdBQVc7QUFBQSxFQUNYLGFBQWE7QUFBQSxFQUNiLFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULGFBQWE7QUFDZjtBQUVBLElBQU0sV0FBcUIsQ0FBQyxTQUFTLGFBQWEsU0FBUyxTQUFTLFVBQVUsV0FBVyxRQUFRO0FBZ0NqRyxJQUFNLGFBQW9DO0FBQUEsRUFDeEM7QUFBQSxJQUNFLElBQUk7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0E7QUFBQSxJQUNFLElBQUk7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxNQUNSO0FBQUEsUUFDRSxPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBWUEsSUFBTSxXQUFOLGNBQXVCLHNCQUFNO0FBQUEsRUFHM0IsWUFBWSxLQUFrQixVQUE0RDtBQUN4RixVQUFNLEdBQUc7QUFEbUI7QUFGOUIsU0FBUSxtQkFBNEI7QUFBQSxFQUlwQztBQUFBLEVBRUEsU0FBUztBQUNQLFNBQUssVUFBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0RCxTQUFLLFVBQVUsU0FBUyxLQUFLLEVBQUUsTUFBTSwrRUFBK0UsQ0FBQztBQUNySCxRQUFJLHdCQUFRLEtBQUssU0FBUyxFQUFFLFFBQVEsc0JBQXNCLEVBQUUsUUFBUSwySkFBMkosRUFDNU4sVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTTtBQUFFLFdBQUssbUJBQW1CO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFDckYsZUFBVyxLQUFLLE9BQU87QUFDckIsVUFBSSx3QkFBUSxLQUFLLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLFNBQVMsQ0FBQyxDQUFDLEVBQ3ZELFVBQVUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxTQUFTLEVBQUUsUUFBUSxNQUFNO0FBQUUsYUFBSyxTQUFTLEdBQUcsS0FBSyxnQkFBZ0I7QUFBRyxhQUFLLE1BQU07QUFBQSxNQUFHLENBQUMsQ0FBQztBQUFBLElBQzFIO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTSxlQUFOLGNBQTJCLHNCQUFNO0FBQUEsRUFHL0IsWUFBWSxLQUFrQixVQUE2QyxVQUFtQjtBQUM1RixVQUFNLEdBQUc7QUFEbUI7QUFBNkM7QUFGM0UsU0FBUSxRQUFzQixFQUFFLE9BQU8sSUFBSSxTQUFTLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVSxNQUFNO0FBQUEsRUFJM0g7QUFBQSxFQUVRLFdBQVcsV0FBd0IsT0FBZSxTQUFpQixRQUE2QjtBQUN0RyxjQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0sUUFBUSxPQUFPLFVBQVUsSUFBSSxDQUFDO0FBQzlELFVBQU0sUUFBUSxVQUFVLFNBQVMsT0FBTyxFQUFFLEtBQUssdUJBQXVCLENBQUM7QUFDdkUsVUFBTSxRQUFRLE1BQU0sU0FBUyxTQUFTLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDdkQsVUFBTSxNQUFNO0FBQ1osVUFBTSxNQUFNO0FBQ1osVUFBTSxPQUFPO0FBQ2IsVUFBTSxRQUFRO0FBQ2QsVUFBTSxVQUFVLE1BQU0sU0FBUyxRQUFRLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDcEQsVUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQ3BDLFlBQU0sSUFBSSxTQUFTLE1BQU0sT0FBTyxFQUFFO0FBQ2xDLGNBQVEsUUFBUSxPQUFPLENBQUMsQ0FBQztBQUN6QixhQUFPLENBQUM7QUFBQSxJQUNWLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxTQUFTO0FBQ1AsVUFBTSxJQUFJLEtBQUs7QUFDZixNQUFFLFNBQVMsTUFBTSxFQUFFLE1BQU0sS0FBSyxXQUFXLHVDQUF1Qyx3QkFBd0IsQ0FBQztBQUN6RyxNQUFFLFNBQVMsS0FBSyxFQUFFLE1BQU0sS0FBSyxXQUFXLDRMQUE0TCxzS0FBc0ssQ0FBQztBQUMzWSxRQUFJLENBQUMsS0FBSyxVQUFVO0FBQ2xCLFVBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxlQUFlLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQUUsYUFBSyxNQUFNLFFBQVE7QUFBQSxNQUFHLENBQUMsQ0FBQztBQUFBLElBQzlJO0FBQ0EsU0FBSyxXQUFXLEdBQUcsVUFBVSw2QkFBNkIsQ0FBQyxNQUFNO0FBQUUsV0FBSyxNQUFNLFVBQVU7QUFBQSxJQUFHLENBQUM7QUFDNUYsU0FBSyxXQUFXLEdBQUcsZUFBZSx5QkFBeUIsQ0FBQyxNQUFNO0FBQUUsV0FBSyxNQUFNLFVBQVU7QUFBQSxJQUFHLENBQUM7QUFDN0YsU0FBSyxXQUFXLEdBQUcsYUFBYSw4QkFBOEIsQ0FBQyxNQUFNO0FBQUUsV0FBSyxNQUFNLFlBQVk7QUFBQSxJQUFHLENBQUM7QUFDbEcsU0FBSyxXQUFXLEdBQUcsV0FBVyx3QkFBd0IsQ0FBQyxNQUFNO0FBQUUsV0FBSyxNQUFNLFVBQVU7QUFBQSxJQUFHLENBQUM7QUFDeEYsTUFBRSxTQUFTLEtBQUssRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3pELFVBQU0sVUFBVSxFQUFFLFNBQVMsT0FBTyxFQUFFLEtBQUssa0JBQWtCLENBQUM7QUFDNUQsZUFBVyxLQUFLLFVBQVU7QUFDeEIsWUFBTSxJQUFJLFFBQVEsU0FBUyxVQUFVLEVBQUUsTUFBTSxHQUFHLEtBQUssaUJBQWlCLENBQUM7QUFDdkUsUUFBRSxPQUFPO0FBQ1QsUUFBRSxpQkFBaUIsU0FBUyxNQUFNO0FBQ2hDLGNBQU0sTUFBTSxLQUFLLE1BQU0sU0FBUyxRQUFRLENBQUM7QUFDekMsWUFBSSxRQUFRLElBQUk7QUFBRSxlQUFLLE1BQU0sU0FBUyxLQUFLLENBQUM7QUFBRyxZQUFFLFNBQVMsc0JBQXNCO0FBQUEsUUFBRyxPQUM5RTtBQUFFLGVBQUssTUFBTSxTQUFTLE9BQU8sS0FBSyxDQUFDO0FBQUcsWUFBRSxZQUFZLHNCQUFzQjtBQUFBLFFBQUc7QUFBQSxNQUNwRixDQUFDO0FBQUEsSUFDSDtBQUNBLFFBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsbUJBQW1CLEVBQUUsUUFBUSx5Q0FBeUMsRUFDMUYsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTTtBQUFFLFdBQUssTUFBTSxXQUFXO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFDbkYsUUFBSSx3QkFBUSxDQUFDLEVBQ1YsVUFBVSxDQUFDLE1BQU0sRUFBRSxjQUFjLEtBQUssV0FBVyxzQkFBc0IsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFFBQVEsTUFBTTtBQUFFLFdBQUssU0FBUyxLQUFLLEtBQUs7QUFBRyxXQUFLLE1BQU07QUFBQSxJQUFHLENBQUMsQ0FBQyxFQUM5SixVQUFVLENBQUMsTUFBTSxFQUFFLGNBQWMsV0FBVyxFQUFFLFFBQVEsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBQUEsRUFDOUU7QUFDRjtBQUVBLElBQU0saUJBQU4sY0FBNkIsc0JBQU07QUFBQSxFQUNqQyxZQUFZLEtBQWtCLFFBQStCLFdBQXdDLEtBQWE7QUFDaEgsVUFBTSxHQUFHO0FBRG1CO0FBQStCO0FBQXdDO0FBQUEsRUFFckc7QUFBQSxFQUVBLFNBQVM7QUFDUCxVQUFNLElBQUksS0FBSyxVQUFVLFNBQVMsS0FBSyxHQUFHO0FBQzFDLFNBQUssVUFBVSxTQUFTLE1BQU0sRUFBRSxNQUFNLEtBQUssVUFBVSxLQUFLLENBQUM7QUFDM0QsU0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0sY0FBYyxLQUFLLE1BQU0sS0FBSyxVQUFVLEtBQUssVUFBVSxTQUFTLFNBQVMsT0FBTyxFQUFFLE1BQU0sQ0FBQztBQUM5SCxlQUFXLEtBQUssRUFBRSxXQUFXO0FBQzNCLFdBQUssVUFBVSxTQUFTLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUFBLElBQzFDO0FBQ0EsU0FBSyxVQUFVLFNBQVMsS0FBSyxFQUFFLE1BQU0sOERBQThELENBQUM7QUFDcEcsUUFBSSx3QkFBUSxLQUFLLFNBQVMsRUFDdkIsVUFBVSxDQUFDLE1BQU0sRUFBRSxjQUFjLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxRQUFRLFlBQVk7QUFBRSxZQUFNLEtBQUssT0FBTyxjQUFjLEtBQUssV0FBVyxLQUFLLEdBQUc7QUFBRyxXQUFLLE1BQU07QUFBQSxJQUFHLENBQUMsQ0FBQyxFQUM5SixVQUFVLENBQUMsTUFBTSxFQUFFLGNBQWMsc0JBQXNCLEVBQUUsUUFBUSxZQUFZO0FBQUUsWUFBTSxLQUFLLE9BQU8sb0JBQW9CLEtBQUssV0FBVyxLQUFLLEdBQUc7QUFBRyxXQUFLLE1BQU07QUFBQSxJQUFHLENBQUMsQ0FBQztBQUFBLEVBQ3JLO0FBQ0Y7QUFFQSxJQUFNLG9CQUFOLGNBQWdDLGlDQUFpQjtBQUFBLEVBQy9DLFlBQVksS0FBa0IsUUFBdUI7QUFDbkQsVUFBTSxLQUFLLE1BQU07QUFEVztBQUFBLEVBRTlCO0FBQUEsRUFFQSxVQUFVO0FBQ1IsVUFBTSxJQUFJLEtBQUs7QUFDZixNQUFFLE1BQU07QUFDUixNQUFFLFNBQVMsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3BDLFFBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsVUFBVSxFQUFFLFFBQVEsc0ZBQXNGLEVBQzlILFFBQVEsQ0FBQyxNQUFNLEVBQUUsZUFBZSx3QkFBd0IsRUFBRSxTQUFTLEtBQUssT0FBTyxTQUFTLFFBQVEsRUFDOUYsU0FBUyxPQUFPLE1BQU07QUFBRSxXQUFLLE9BQU8sU0FBUyxXQUFXLEVBQUUsS0FBSztBQUFHLFlBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxJQUFHLENBQUMsQ0FBQztBQUMzRyxRQUFJLHdCQUFRLENBQUMsRUFBRSxRQUFRLFFBQVEsRUFBRSxRQUFRLHNFQUFzRSxFQUM1RyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxPQUFPLFNBQVMsS0FBSyxFQUNsRCxTQUFTLE9BQU8sTUFBTTtBQUFFLFdBQUssT0FBTyxTQUFTLFFBQVEsRUFBRSxLQUFLO0FBQUcsWUFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLElBQUcsQ0FBQyxDQUFDO0FBQ3hHLFFBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsWUFBWSxFQUNoQyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsT0FBTyxLQUFLLE9BQU8sU0FBUyxXQUFXLENBQUMsRUFDaEUsU0FBUyxPQUFPLE1BQU07QUFBRSxZQUFNLElBQUksV0FBVyxFQUFFLFFBQVEsS0FBSyxHQUFHLENBQUM7QUFBRyxXQUFLLE9BQU8sU0FBUyxjQUFjLE1BQU0sQ0FBQyxJQUFJLE1BQU07QUFBRyxZQUFNLEtBQUssT0FBTyxhQUFhO0FBQUEsSUFBRyxDQUFDLENBQUM7QUFDbkssUUFBSSx3QkFBUSxDQUFDLEVBQUUsUUFBUSxtQ0FBbUMsRUFBRSxRQUFRLG1FQUFtRSxFQUNwSSxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsS0FBSyxPQUFPLFNBQVMsa0JBQWtCLEVBQ2pFLFNBQVMsT0FBTyxNQUFNO0FBQUUsV0FBSyxPQUFPLFNBQVMscUJBQXFCO0FBQUcsWUFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLElBQUcsQ0FBQyxDQUFDO0FBQzlHLFFBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsdUJBQXVCLEVBQzNDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxPQUFPLEtBQUssT0FBTyxTQUFTLGFBQWEsQ0FBQyxFQUNsRSxTQUFTLE9BQU8sTUFBTTtBQUFFLFlBQU0sSUFBSSxTQUFTLEdBQUcsRUFBRTtBQUFHLFdBQUssT0FBTyxTQUFTLGdCQUFnQixNQUFNLENBQUMsSUFBSSxJQUFJO0FBQUcsWUFBTSxLQUFLLE9BQU8sYUFBYTtBQUFBLElBQUcsQ0FBQyxDQUFDO0FBQ25KLFVBQU0sT0FBTyxJQUFJLHdCQUFRLENBQUMsRUFBRSxRQUFRLHFCQUFxQixFQUFFLFFBQVEsMENBQTBDO0FBQzdHLFNBQUssWUFBWSxDQUFDLE1BQU07QUFDdEIsaUJBQVcsS0FBSyxZQUFZO0FBQUUsVUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUk7QUFBQSxNQUFHO0FBQ3pELFFBQUUsU0FBUyxLQUFLLE9BQU8sU0FBUyxTQUFTLEVBQ3RDLFNBQVMsT0FBTyxNQUFNO0FBQUUsYUFBSyxPQUFPLFNBQVMsWUFBWTtBQUFHLGFBQUssT0FBTyxTQUFTLFVBQVU7QUFBRyxjQUFNLEtBQUssT0FBTyxhQUFhO0FBQUcsYUFBSyxRQUFRO0FBQUEsTUFBRyxDQUFDO0FBQUEsSUFDdEosQ0FBQztBQUNELFFBQUksd0JBQVEsQ0FBQyxFQUFFLFFBQVEsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLE9BQU8sS0FBSyxPQUFPLFNBQVMsVUFBVSxDQUFDLENBQUMsRUFBRSxZQUFZLElBQUksQ0FBQztBQUNqSSxRQUFJLHdCQUFRLENBQUMsRUFBRSxRQUFRLHFCQUFxQixFQUFFLFFBQVEsZ0lBQWdJO0FBQUEsRUFDeEw7QUFDRjtBQUVBLElBQXFCLGdCQUFyQixjQUEyQyx1QkFBTztBQUFBLEVBR2hELE1BQU0sU0FBUztBQUNiLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQ3pFLFNBQUssY0FBYyxjQUFjLFdBQVcsQ0FBQyxRQUFvQixLQUFLLFlBQVksR0FBRyxDQUFDO0FBQ3RGLFNBQUssV0FBVyxFQUFFLElBQUksbUJBQW1CLE1BQU0seURBQXlELFVBQVUsTUFBTSxLQUFLLHFCQUFxQixFQUFFLENBQUM7QUFDckosU0FBSyxXQUFXLEVBQUUsSUFBSSxzQkFBc0IsTUFBTSx5QkFBeUIsVUFBVSxNQUFNLEtBQUssaUJBQWlCLEVBQUUsQ0FBQztBQUNwSCxTQUFLLFdBQVcsRUFBRSxJQUFJLG9CQUFvQixNQUFNLCtDQUErQyxVQUFVLE1BQU0sS0FBSyx3QkFBd0IsRUFBRSxDQUFDO0FBQy9JLFNBQUssV0FBVyxFQUFFLElBQUksd0JBQXdCLE1BQU0sNkNBQTZDLFVBQVUsTUFBTSxLQUFLLGFBQWEsRUFBRSxDQUFDO0FBQ3RJLFNBQUssY0FBYyxLQUFLLElBQUksVUFBVSxHQUFHLGVBQWUsQ0FBQyxTQUFlO0FBQ3RFLFdBQUssYUFBYTtBQUNsQixXQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxpQkFBaUIsRUFBRSxRQUFRLFVBQVUsRUFBRSxRQUFRLE1BQU0sS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVHLFdBQUssUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLGlDQUFpQyxFQUFFLFFBQVEsYUFBYSxFQUFFLFFBQVEsTUFBTSxLQUFLLHdCQUF3QixDQUFDLENBQUM7QUFDdEksV0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsdUJBQXVCLEVBQUUsUUFBUSxZQUFZLEVBQUUsUUFBUSxNQUFNLEtBQUssYUFBYSxDQUFDLENBQUM7QUFBQSxJQUNsSCxDQUFDLENBQUM7QUFDRixTQUFLLGNBQWMsSUFBSSxrQkFBa0IsS0FBSyxLQUFLLElBQUksQ0FBQztBQUFBLEVBQzFEO0FBQUEsRUFFQSxNQUFNLGVBQWU7QUFDbkIsVUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsRUFDbkM7QUFBQSxFQUVRLFlBQVksS0FBaUI7QUFDbkMsVUFBTSxPQUFPLElBQUkscUJBQUs7QUFDdEIsU0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsOENBQThDLEVBQUUsUUFBUSxVQUFVLEVBQUUsUUFBUSxNQUFNLEtBQUsscUJBQXFCLENBQUMsQ0FBQztBQUM3SSxTQUFLLGFBQWE7QUFDbEIsU0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsY0FBYyxFQUFFLFFBQVEsVUFBVSxFQUFFLFFBQVEsTUFBTSxLQUFLLGlCQUFpQixDQUFDLENBQUM7QUFDekcsU0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsb0NBQW9DLEVBQUUsUUFBUSxhQUFhLEVBQUUsUUFBUSxNQUFNLEtBQUssd0JBQXdCLENBQUMsQ0FBQztBQUN6SSxTQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxrQ0FBa0MsRUFBRSxRQUFRLFlBQVksRUFBRSxRQUFRLE1BQU0sS0FBSyxhQUFhLENBQUMsQ0FBQztBQUMzSCxTQUFLLGFBQWE7QUFDbEIsU0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsOEJBQThCLEVBQUUsUUFBUSxnQkFBZ0IsRUFBRSxRQUFRLE1BQU0sSUFBSSx1QkFBTyw0SkFBNEosQ0FBQyxDQUFDO0FBQ2hSLFNBQUssaUJBQWlCLEdBQUc7QUFBQSxFQUMzQjtBQUFBLEVBRUEsdUJBQXVCO0FBQ3JCLFFBQUksYUFBYSxLQUFLLEtBQUssT0FBTyxNQUFvQjtBQUFFLFlBQU0sS0FBSyx1QkFBdUIsQ0FBQztBQUFBLElBQUcsR0FBRyxLQUFLLEVBQUUsS0FBSztBQUFBLEVBQy9HO0FBQUEsRUFFQSwwQkFBMEI7QUFDeEIsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxRQUFJLGFBQWEsS0FBSyxLQUFLLE9BQU8sTUFBb0I7QUFBRSxZQUFNLEtBQUssaUJBQWlCLE1BQU0sQ0FBQztBQUFBLElBQUcsR0FBRyxJQUFJLEVBQUUsS0FBSztBQUFBLEVBQzlHO0FBQUEsRUFFQSxNQUFjLGVBQWUsTUFBYztBQUN6QyxRQUFJLENBQUUsTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sSUFBSSxHQUFJO0FBQ2hELFVBQUk7QUFDRixjQUFNLEtBQUssSUFBSSxNQUFNLGFBQWEsSUFBSTtBQUFBLE1BQ3hDLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSx1QkFBdUIsR0FBaUI7QUFDNUMsVUFBTSxVQUFNLHdCQUFPLEVBQUUsT0FBTyxZQUFZO0FBQ3hDLFVBQU0sV0FBTyx3QkFBTyxFQUFFLE9BQU8sT0FBTztBQUNwQyxVQUFNLE9BQU8sbUJBQWUsd0JBQU8sRUFBRSxPQUFPLGlCQUFpQixJQUFJO0FBQ2pFLFVBQU0sUUFBUSxFQUFFLE1BQU0sS0FBSyxFQUFFLFNBQVMsSUFBSSxFQUFFLE1BQU0sS0FBSyxJQUFJLE1BQU0sTUFBTTtBQUN2RSxVQUFNLFdBQVcsRUFBRSxTQUFTLFdBQVcsSUFBSSxPQUFPLE1BQU0sRUFBRSxTQUFTLEtBQUssSUFBSSxJQUFJO0FBQ2hGLFVBQU0sV0FBVztBQUFBLE1BQ2YsWUFBWSxPQUFPLEVBQUUsT0FBTyxJQUFJO0FBQUEsTUFDaEMsaUJBQWlCLE9BQU8sRUFBRSxPQUFPLElBQUk7QUFBQSxNQUNyQyxlQUFlLE9BQU8sRUFBRSxTQUFTLElBQUk7QUFBQSxNQUNyQyxhQUFhLE9BQU8sRUFBRSxPQUFPLElBQUk7QUFBQSxJQUNuQyxFQUFFLEtBQUssSUFBSTtBQUNYLFVBQU0sU0FBbUI7QUFBQSxNQUN2QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxZQUFZO0FBQUEsTUFDWixjQUFjO0FBQUEsTUFDZDtBQUFBLE1BQ0EsY0FBYyxPQUFPLEVBQUUsT0FBTztBQUFBLE1BQzlCLGNBQWMsT0FBTyxFQUFFLE9BQU87QUFBQSxNQUM5QixnQkFBZ0IsT0FBTyxFQUFFLFNBQVM7QUFBQSxNQUNsQyxjQUFjLE9BQU8sRUFBRSxPQUFPO0FBQUEsTUFDOUIsZUFBZTtBQUFBLE1BQ2YsZ0JBQWdCLEVBQUUsV0FBVyxTQUFTO0FBQUEsTUFDdEM7QUFBQSxNQUNBO0FBQUEsTUFDQSxPQUFPO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLGdCQUFnQixFQUFFLFNBQVMsV0FBVyxJQUFJLFVBQVUsRUFBRSxTQUFTLEtBQUssSUFBSSxNQUFNLEVBQUUsV0FBVyx5QkFBeUI7QUFBQSxNQUNwSDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFDQSxVQUFNLEtBQUssZUFBZSxXQUFXO0FBQ3JDLFFBQUk7QUFDRixZQUFNLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLE1BQU0sT0FBTyxLQUFLLElBQUksQ0FBQztBQUM3RCxZQUFNLEtBQUssSUFBSSxVQUFVLFFBQVEsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUNqRCxVQUFJLHVCQUFPLGdEQUFnRDtBQUFBLElBQzdELFNBQVMsR0FBRztBQUNWLFVBQUksdUJBQU8sb0RBQW9EO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLGlCQUFpQixNQUEyQixHQUFpQjtBQUNqRSxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUTtBQUN6QixVQUFJLHVCQUFPLHNFQUFzRTtBQUNqRjtBQUFBLElBQ0Y7QUFDQSxVQUFNLFdBQU8sd0JBQU8sRUFBRSxPQUFPLGtCQUFrQjtBQUMvQyxVQUFNLFFBQWtCO0FBQUEsTUFDdEIsd0JBQXdCO0FBQUEsTUFDeEIsT0FBTyxPQUFPLEVBQUUsT0FBTztBQUFBLE1BQ3ZCLE9BQU8sT0FBTyxFQUFFLE9BQU87QUFBQSxNQUN2QixPQUFPLE9BQU8sRUFBRSxTQUFTO0FBQUEsTUFDekIsT0FBTyxPQUFPLEVBQUUsT0FBTztBQUFBLElBQ3pCO0FBQ0EsUUFBSSxFQUFFLFNBQVMsU0FBUyxHQUFHO0FBQ3pCLFlBQU0sS0FBSyxjQUFjLEVBQUUsU0FBUyxLQUFLLEdBQUcsQ0FBQztBQUFBLElBQy9DO0FBQ0EsUUFBSSxFQUFFLFVBQVU7QUFDZCxZQUFNLEtBQUssZUFBZTtBQUFBLElBQzVCO0FBQ0EsVUFBTSxVQUFVLE1BQU0sS0FBSyxHQUFHLElBQUk7QUFDbEMsVUFBTSxTQUFTLEtBQUs7QUFDcEIsVUFBTSxNQUFNLE9BQU8sVUFBVTtBQUM3QixXQUFPLGtCQUFrQixJQUFJLEtBQUssSUFBSSxPQUFPLE1BQU0sVUFBVSxJQUFJO0FBQ2pFLFFBQUksdUJBQU8sd0VBQXdFO0FBQUEsRUFDckY7QUFBQSxFQUVRLGVBQWUsTUFBa0I7QUFDdkMsVUFBTSxRQUFRLEtBQUssSUFBSSxjQUFjLGFBQWEsSUFBSTtBQUN0RCxRQUFJLFNBQVMsTUFBTSxhQUFhO0FBQUUsYUFBTyxNQUFNO0FBQUEsSUFBYTtBQUM1RCxXQUFPO0FBQUEsRUFDVDtBQUFBLEVBRUEsTUFBTSxtQkFBbUI7QUFDdkIsVUFBTSxPQUFPLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw0QkFBWTtBQUNoRSxVQUFNLE9BQU8sT0FBTyxLQUFLLE9BQU8sS0FBSyxJQUFJLFVBQVUsY0FBYztBQUNqRSxRQUFJLENBQUMsTUFBTTtBQUFFLFVBQUksdUJBQU8sOEJBQThCO0FBQUc7QUFBQSxJQUFRO0FBQ2pFLFVBQU0sS0FBSyxLQUFLLGVBQWUsSUFBSTtBQUNuQyxRQUFJLE1BQU0sR0FBRyxTQUFTLE1BQU0sTUFBTTtBQUNoQyxZQUFNLEtBQUssSUFBSSxZQUFZLG1CQUFtQixNQUFNLENBQUMsTUFBVztBQUFFLFVBQUUsU0FBUyxJQUFJO0FBQUEsTUFBTyxDQUFDO0FBQ3pGLFVBQUksdUJBQU8sd0JBQXdCO0FBQ25DO0FBQUEsSUFDRjtBQUNBLFVBQU0sTUFBTSxLQUFLLEdBQUcsS0FBSyxJQUFJO0FBQzdCLFFBQUksS0FBSztBQUNQLFlBQU0sS0FBSyxJQUFJLFlBQVksbUJBQW1CLE1BQU0sQ0FBQyxNQUFXO0FBQUUsVUFBRSxTQUFTLElBQUk7QUFBQSxNQUFNLENBQUM7QUFDeEYsVUFBSSx1QkFBTyxrQ0FBa0MsT0FBTyxHQUFHLElBQUksSUFBSTtBQUFBLElBQ2pFLE9BQU87QUFDTCxVQUFJLFNBQVMsS0FBSyxLQUFLLE9BQU8sR0FBVyxxQkFBOEI7QUFDckUsY0FBTSxLQUFLLElBQUksWUFBWSxtQkFBbUIsTUFBTSxDQUFDLE1BQVc7QUFBRSxZQUFFLFNBQVMsSUFBSTtBQUFNLFlBQUUsS0FBSyxJQUFJO0FBQUEsUUFBRyxDQUFDO0FBQ3RHLFlBQUksdUJBQU8sZ0NBQWdDLElBQUksR0FBRztBQUNsRCxZQUFJLGtCQUFrQjtBQUNwQixjQUFJLGFBQWEsS0FBSyxLQUFLLE9BQU8sTUFBb0I7QUFBRSxrQkFBTSxLQUFLLGlCQUFpQixNQUFNLENBQUM7QUFBQSxVQUFHLEdBQUcsSUFBSSxFQUFFLEtBQUs7QUFBQSxRQUM5RztBQUFBLE1BQ0YsQ0FBQyxFQUFFLEtBQUs7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBRUEsZUFBZTtBQUNiLFVBQU0sSUFBSSxXQUFXLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLLFNBQVMsU0FBUztBQUNqRSxVQUFNLE9BQU8sSUFBSSxJQUFJLFdBQVcsQ0FBQztBQUNqQyxRQUFJLEtBQUssU0FBUyxXQUFXLEtBQUssU0FBUyxRQUFRO0FBQ2pELFVBQUksdUJBQU8sOEdBQThHO0FBQ3pIO0FBQUEsSUFDRjtBQUNBLFFBQUksZUFBZSxLQUFLLEtBQUssTUFBTSxNQUFNLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSztBQUFBLEVBQ3ZFO0FBQUEsRUFFQSxNQUFNLGNBQWMsR0FBd0IsS0FBYTtBQUN2RCxVQUFNLElBQUksRUFBRSxTQUFTLEdBQUc7QUFDeEIsVUFBTSxVQUFNLHdCQUFPLEVBQUUsT0FBTyxZQUFZO0FBQ3hDLFVBQU0sT0FBTyxpQkFBaUIsTUFBTSxNQUFNLEVBQUUsS0FBSyxPQUFPLE1BQU0sS0FBSztBQUNuRSxVQUFNLFNBQW1CO0FBQUEsTUFDdkI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsZ0JBQWdCLEVBQUU7QUFBQSxNQUNsQixlQUFlLE1BQU07QUFBQSxNQUNyQixZQUFZO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxPQUFPLEVBQUU7QUFBQSxNQUNUO0FBQUEsSUFDRixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTztBQUFBLE1BQzNCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLENBQUM7QUFDRCxVQUFNLEtBQUssZUFBZSxhQUFhO0FBQ3ZDLFFBQUk7QUFDRixZQUFNLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxPQUFPLE1BQU0sT0FBTyxLQUFLLElBQUksQ0FBQztBQUM3RCxZQUFNLEtBQUssSUFBSSxVQUFVLFFBQVEsSUFBSSxFQUFFLFNBQVMsQ0FBQztBQUNqRCxVQUFJLHVCQUFPLGtDQUFrQyxFQUFFLFFBQVEsR0FBRztBQUFBLElBQzVELFNBQVMsR0FBRztBQUNWLFVBQUksdUJBQU8seUVBQXlFO0FBQUEsSUFDdEY7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNLG9CQUFvQixHQUF3QixLQUFhO0FBQzdELFNBQUssU0FBUyxVQUFVLE1BQU07QUFDOUIsUUFBSSxLQUFLLFNBQVMsV0FBVyxFQUFFLFNBQVMsUUFBUTtBQUM5QyxVQUFJLHVCQUFPLHdDQUF3QyxFQUFFLE9BQU8sR0FBRztBQUFBLElBQ2pFLE9BQU87QUFDTCxVQUFJLHVCQUFPLG9DQUFvQyxFQUFFLFNBQVMsS0FBSyxTQUFTLE9BQU8sRUFBRSxRQUFRLEdBQUc7QUFBQSxJQUM5RjtBQUNBLFVBQU0sS0FBSyxhQUFhO0FBQUEsRUFDMUI7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
