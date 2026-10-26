import { App, MarkdownView, Menu, Modal, moment, Notice, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";

interface AriadneSettings {
  endpoint: string;
  model: string;
  temperature: number;
  kontextEinbeziehen: boolean;
  kontextAnzahl: number;
  protokoll: string;
  schritt: number;
}

const DEFAULT_SETTINGS: AriadneSettings = {
  endpoint: "http://127.0.0.1:11434",
  model: "llama3.2",
  temperature: 0.4,
  kontextEinbeziehen: true,
  kontextAnzahl: 8,
  protokoll: "pennebaker-episode",
  schritt: 0
};

const TYPEN: string[] = ["journal", "impuls", "order-log", "ttrpg", "meeting", "hobby", "reflexion"];

const TYP_TEXT: Record<string, string> = {
  "journal": "Tages- und Abendreflexion mit Stimmungserfassung",
  "impuls": "Situativer Eintrag unterwegs, ohne Stimmungserfassung",
  "meeting": "Uni- oder Dienstsitzung mit Recap",
  "order-log": "Log fuer das Order-Projekt",
  "ttrpg": "Rollenspiel: Sessions, Welten, Figuren",
  "hobby": "Andere Freizeit und Erholung",
  "reflexion": "Gefuehrte Schreibpfade (Pennebaker, Nuclear Episodes)"
};

const KONTEXTE: string[] = ["Lehre", "Forschung", "Admin", "Sport", "Sozial", "Familie", "Allein"];

const MARKER = "%%ariadne-analyse%%";

// KRISTERME: Nur ergaenzen, niemals schwaechen (siehe AGENTS.md). Der Chat (M4) prueft damit jede Anfrage.
const KRISTERME: string[] = [
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

interface ReflexionsSchritt {
  titel: string;
  anleitung: string[];
}

interface ReflexionsProtokoll {
  id: string;
  name: string;
  schritte: ReflexionsSchritt[];
}

const PROTOKOLLE: ReflexionsProtokoll[] = [
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

interface JournalDaten {
  titel: string;
  valence: number;
  arousal: number;
  belastung: number;
  koerper: number;
  kontexte: string[];
  ausnahme: boolean;
}

class TypModal extends Modal {
  constructor(app: App, private onChoose: (typ: string) => void) {
    super(app);
  }

  onOpen() {
    this.contentEl.createEl("h3", { text: "Notiz taggen" });
    this.contentEl.createEl("p", { text: "Welcher Art ist diese Notiz? Der Typ ordnet sie fuer den spaeteren Chat ein." });
    for (const t of TYPEN) {
      new Setting(this.contentEl).setName(t).setDesc(TYP_TEXT[t])
        .addButton((b) => b.setButtonText("Waehlen").onClick(() => { this.onChoose(t); this.close(); }));
    }
  }
}

class JournalModal extends Modal {
  private daten: JournalDaten = { titel: "", valence: 5, arousal: 5, belastung: 5, koerper: 5, kontexte: [], ausnahme: false };

  constructor(app: App, private onFertig: (d: JournalDaten) => void) {
    super(app);
  }

  private baueSlider(container: HTMLElement, titel: string, hinweis: string, onWert: (n: number) => void) {
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
    new Setting(c).setName("Titel (optional)").addText((t) => t.setPlaceholder("z.B. Nach der Lehre").onChange((v) => { this.daten.titel = v; }));
    this.baueSlider(c, "Valenz", "0 unangenehm, 10 angenehm", (n) => { this.daten.valence = n; });
    this.baueSlider(c, "Aktivierung", "0 ruhig, 10 aktiviert", (n) => { this.daten.arousal = n; });
    this.baueSlider(c, "Belastung", "0 entspannt, 10 angespannt", (n) => { this.daten.belastung = n; });
    this.baueSlider(c, "Koerper", "0 verspannt, 10 frei", (n) => { this.daten.koerper = n; });
    c.createEl("p", { text: "Kontexte heute (Mehrfachwahl)" });
    const kacheln = c.createEl("div", { cls: "ariadne-kacheln" });
    for (const k of KONTEXTE) {
      const b = kacheln.createEl("button", { text: k, cls: "ariadne-kachel" });
      b.type = "button";
      b.addEventListener("click", () => {
        const pos = this.daten.kontexte.indexOf(k);
        if (pos === -1) { this.daten.kontexte.push(k); b.addClass("ariadne-kachel-aktiv"); }
        else { this.daten.kontexte.splice(pos, 1); b.removeClass("ariadne-kachel-aktiv"); }
      });
    }
    new Setting(c).setName("Ausnahme-Ereignis").setDesc("Etwas Aussergewoehnliches ist passiert.")
      .addToggle((t) => t.setValue(false).onChange((v) => { this.daten.ausnahme = v; }));
    new Setting(c)
      .addButton((b) => b.setButtonText("Eintrag anlegen").setCta().onClick(() => { this.onFertig(this.daten); this.close(); }))
      .addButton((b) => b.setButtonText("Abbrechen").onClick(() => this.close()));
  }
}

class ReflexionModal extends Modal {
  constructor(app: App, private plugin: AriadnePlugin, private protokoll: ReflexionsProtokoll, private idx: number) {
    super(app);
  }

  onOpen() {
    const s = this.protokoll.schritte[this.idx];
    this.contentEl.createEl("h3", { text: this.protokoll.name });
    this.contentEl.createEl("p", { text: "Schritt " + (this.idx + 1) + " von " + this.protokoll.schritte.length + ": " + s.titel });
    for (const a of s.anleitung) {
      this.contentEl.createEl("p", { text: a });
    }
    this.contentEl.createEl("p", { text: "Nimm dir die Zeit in Ruhe. Ein Schritt pro Tag, nicht mehr." });
    new Setting(this.contentEl)
      .addButton((b) => b.setButtonText("Sitzung starten").setCta().onClick(async () => { await this.plugin.starteSitzung(this.protokoll, this.idx); this.close(); }))
      .addButton((b) => b.setButtonText("Schritt abschliessen").onClick(async () => { await this.plugin.schrittAbschliessen(this.protokoll, this.idx); this.close(); }));
  }
}

class AriadneSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AriadnePlugin) {
    super(app, plugin);
  }

  display() {
    const c = this.containerEl;
    c.empty();
    c.createEl("h2", { text: "Ariadne" });
    new Setting(c).setName("Endpunkt").setDesc("OpenAI-kompatibler Endpunkt, Standard Ollama. Wird erst mit dem Chat (M4) gebraucht.")
      .addText((t) => t.setPlaceholder("http://127.0.0.1:11434").setValue(this.plugin.settings.endpoint)
        .onChange(async (v) => { this.plugin.settings.endpoint = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(c).setName("Modell").setDesc("z.B. llama3.2, mistral-small. Wird erst mit dem Chat (M4) gebraucht.")
      .addText((t) => t.setValue(this.plugin.settings.model)
        .onChange(async (v) => { this.plugin.settings.model = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(c).setName("Temperatur")
      .addText((t) => t.setValue(String(this.plugin.settings.temperature))
        .onChange(async (v) => { const n = parseFloat(v.replace(",", ".")); this.plugin.settings.temperature = isNaN(n) ? 0.4 : n; await this.plugin.saveSettings(); }));
    new Setting(c).setName("Getaggte Notizen als Chat-Kontext").setDesc("Ab M4: getaggte Notizen desselben Vaults fliesen in den Chat ein.")
      .addToggle((t) => t.setValue(this.plugin.settings.kontextEinbeziehen)
        .onChange(async (v) => { this.plugin.settings.kontextEinbeziehen = v; await this.plugin.saveSettings(); }));
    new Setting(c).setName("Anzahl Kontextnotizen")
      .addText((t) => t.setValue(String(this.plugin.settings.kontextAnzahl))
        .onChange(async (v) => { const n = parseInt(v, 10); this.plugin.settings.kontextAnzahl = isNaN(n) ? 8 : n; await this.plugin.saveSettings(); }));
    const drop = new Setting(c).setName("Reflexionsprotokoll").setDesc("Der Pfad, den Reflektieren weiterfuehrt.");
    drop.addDropdown((d) => {
      for (const p of PROTOKOLLE) { d.addOption(p.id, p.name); }
      d.setValue(this.plugin.settings.protokoll)
        .onChange(async (v) => { this.plugin.settings.protokoll = v; this.plugin.settings.schritt = 0; await this.plugin.saveSettings(); this.display(); });
    });
    new Setting(c).setName("Aktueller Schritt").addText((t) => t.setValue(String(this.plugin.settings.schritt + 1)).setDisabled(true));
    new Setting(c).setName("Krisenweiterleitung").setDesc("Der Chat (M4) prueft Anfragen auf Krisensignale. Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222. Im akuten Notfall: 112.");
  }
}

export default class AriadnePlugin extends Plugin {
  settings: AriadneSettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    this.addRibbonIcon("git-branch", "Ariadne", (evt: MouseEvent) => this.oeffneMenue(evt));
    this.addCommand({ id: "ariadne-journal", name: "Ariadne: Neuer Journal-Eintrag mit Stimmungserfassung", callback: () => this.oeffneJournalEintrag() });
    this.addCommand({ id: "ariadne-markierung", name: "Ariadne: Notiz taggen", callback: () => this.toggleMarkierung() });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu: Menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: taggen").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Reflektieren").setIcon("footprints").onClick(() => this.reflektieren()));
    }));
    this.addSettingTab(new AriadneSettingTab(this.app, this));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private oeffneMenue(evt: MouseEvent) {
    const menu = new Menu();
    menu.addItem((i) => i.setTitle("Neuer Journal-Eintrag mit Stimmungserfassung").setIcon("activity").onClick(() => this.oeffneJournalEintrag()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Notiz taggen").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
    menu.addItem((i) => i.setTitle("Reflektieren - naechster Schritt").setIcon("footprints").onClick(() => this.reflektieren()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Mit Ariadne sprechen (folgt)").setIcon("message-circle").onClick(() => new Notice("Ariadne: Der Chat ueber alle getaggten Notizen folgt als M4. Fragen wie 'Welche Muster deckst du auf?' oder 'Was hat Kraft gegeben?' werden dann moeglich.")));
    menu.showAtMouseEvent(evt);
  }

  oeffneJournalEintrag() {
    new JournalModal(this.app, async (d: JournalDaten) => { await this.erstelleJournalEintrag(d); }).open();
  }

  private async sichererOrdner(pfad: string) {
    if (!(await this.app.vault.adapter.exists(pfad))) {
      try {
        await this.app.vault.createFolder(pfad);
      } catch (e) {
        // Ordner kann schon existieren, ignorieren.
      }
    }
  }

  async erstelleJournalEintrag(d: JournalDaten) {
    const iso = moment().format("YYYY-MM-DD");
    const zeit = moment().format("HH:mm");
    const pfad = "eintraege/" + moment().format("YYYY-MM-DD-HHmm") + ".md";
    const titel = d.titel.trim().length > 0 ? d.titel.trim() : iso + " " + zeit;
    const kontexte = d.kontexte.length === 0 ? "[]" : "[" + d.kontexte.join(", ") + "]";
    const baseline = [
      "Valenz " + String(d.valence) + "/10 (0 unangenehm, 10 angenehm)",
      "Aktivierung " + String(d.arousal) + "/10 (0 ruhig, 10 aktiviert)",
      "Belastung " + String(d.belastung) + "/10 (0 entspannt, 10 angespannt)",
      "Koerper " + String(d.koerper) + "/10 (0 verspannt, 10 frei)"
    ].join(", ");
    const zeilen: string[] = [
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
      new Notice("Ariadne: Journal-Eintrag angelegt und getaggt.");
    } catch (e) {
      new Notice("Ariadne: Konnte den Journal-Eintrag nicht anlegen.");
    }
  }

  private frontmatterVon(file: TFile): any {
    const cache = this.app.metadataCache.getFileCache(file);
    if (cache && cache.frontmatter) { return cache.frontmatter; }
    return null;
  }

  async toggleMarkierung() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = view ? view.file : this.app.workspace.getActiveFile();
    if (!file) { new Notice("Ariadne: Keine aktive Notiz."); return; }
    const fm = this.frontmatterVon(file);
    if (fm && fm["ariadne"] === true) {
      await this.app.fileManager.processFrontMatter(file, (f: any) => { f["ariadne"] = false; });
      new Notice("Ariadne: Tag entfernt.");
      return;
    }
    const typ = fm ? fm["typ"] : null;
    if (typ) {
      await this.app.fileManager.processFrontMatter(file, (f: any) => { f["ariadne"] = true; });
      new Notice("Ariadne: Notiz getaggt (typ: " + String(typ) + ").");
    } else {
      new TypModal(this.app, async (t: string) => {
        await this.app.fileManager.processFrontMatter(file, (f: any) => { f["ariadne"] = true; f["typ"] = t; });
        new Notice("Ariadne: Notiz getaggt als " + t + ".");
      }).open();
    }
  }

  reflektieren() {
    const p = PROTOKOLLE.find((x) => x.id === this.settings.protokoll);
    const prot = p ? p : PROTOKOLLE[0];
    if (this.settings.schritt >= prot.schritte.length) {
      new Notice("Ariadne: Protokoll abgeschlossen. Setze den Schritt in den Einstellungen zurueck oder wechsle das Protokoll.");
      return;
    }
    new ReflexionModal(this.app, this, prot, this.settings.schritt).open();
  }

  async starteSitzung(p: ReflexionsProtokoll, idx: number) {
    const s = p.schritte[idx];
    const iso = moment().format("YYYY-MM-DD");
    const pfad = "reflexionen/" + iso + "-" + p.id + "-" + (idx + 1) + ".md";
    const zeilen: string[] = [
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
      new Notice("Ariadne: Sitzung gestartet - " + s.titel + ".");
    } catch (e) {
      new Notice("Ariadne: Konnte die Sitzungsnotiz nicht anlegen (existiert sie schon?).");
    }
  }

  async schrittAbschliessen(p: ReflexionsProtokoll, idx: number) {
    this.settings.schritt = idx + 1;
    if (this.settings.schritt >= p.schritte.length) {
      new Notice("Ariadne: Protokoll abgeschlossen - " + p.name + ".");
    } else {
      new Notice("Ariadne: Naechster Schritt ist " + p.schritte[this.settings.schritt].titel + ".");
    }
    await this.saveSettings();
  }
}
