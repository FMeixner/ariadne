import { App, Editor, MarkdownView, Menu, Modal, moment, Notice, Plugin, PluginSettingTab, requestUrl, Setting, TFile } from "obsidian";

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

const TYPEN: string[] = ["journal", "impuls", "order-log", "ttrpg", "meeting", "reflexion"];

const MARKER = "%%ariadne-analyse%%";

// KRISTERME: Nur ergaenzen, niemals schwaechen (siehe AGENTS.md).
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

const ANALYSE_PROMPT = [
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

class TypModal extends Modal {
  constructor(app: App, private onChoose: (typ: string) => void) {
    super(app);
  }

  onOpen() {
    this.contentEl.createEl("h3", { text: "Notiz fuer Ariadne freigeben" });
    this.contentEl.createEl("p", { text: "Welcher Art ist diese Notiz? Der Typ steuert die spaetere Auswertung." });
    const zeile = new Setting(this.contentEl);
    for (const t of TYPEN) {
      zeile.addButton((b) => b.setButtonText(t).onClick(() => { this.onChoose(t); this.close(); }));
    }
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
    new Setting(c).setName("Endpunkt").setDesc("OpenAI-kompatibler lokaler Endpunkt. Standard: Ollama auf diesem Geraet.")
      .addText((t) => t.setPlaceholder("http://127.0.0.1:11434").setValue(this.plugin.settings.endpoint)
        .onChange(async (v) => { this.plugin.settings.endpoint = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(c).setName("Modell").setDesc("z.B. llama3.2, mistral-small")
      .addText((t) => t.setValue(this.plugin.settings.model)
        .onChange(async (v) => { this.plugin.settings.model = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(c).setName("Temperatur")
      .addText((t) => t.setValue(String(this.plugin.settings.temperature))
        .onChange(async (v) => { const n = parseFloat(v.replace(",", ".")); this.plugin.settings.temperature = isNaN(n) ? 0.4 : n; await this.plugin.saveSettings(); }));
    new Setting(c).setName("Kontext freigegebener Notizen").setDesc("Bei jeder Analyse: Kontext aus freigegebenen Notizen desselben Vaults einbeziehen.")
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
    new Setting(c).setName("Krisenweiterleitung").setDesc("Bei Krisensignalen bricht jede Ariadne-Analyse ab. Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222. Im akuten Notfall: 112.");
  }
}

export default class AriadnePlugin extends Plugin {
  settings: AriadneSettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addRibbonIcon("git-branch", "Ariadne", (evt: MouseEvent) => this.oeffneMenue(evt));
    this.addCommand({ id: "ariadne-markierung", name: "Ariadne: Markierung umschalten", callback: () => this.toggleMarkierung() });
    this.addCommand({ id: "ariadne-analyse", name: "Ariadne: Abfrage in dieser Notiz verankern", editorCallback: (editor: Editor) => this.verankern(editor) });
    this.addCommand({ id: "ariadne-reflektieren", name: "Ariadne: Reflektieren - naechster Schritt", callback: () => this.reflektieren() });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu: Menu) => {
      menu.addSeparator();
      menu.addItem((i) => i.setTitle("Ariadne: markieren").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
      menu.addItem((i) => i.setTitle("Ariadne: Abfrage verankern").setIcon("sparkles").onClick(() => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) { this.verankern(view.editor); }
      }));
      menu.addItem((i) => i.setTitle("Ariadne: Reflektieren").setIcon("footprints").onClick(() => this.reflektieren()));
    }));
    this.addSettingTab(new AriadneSettingTab(this.app, this));
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private oeffneMenue(evt: MouseEvent) {
    const menu = new Menu();
    menu.addItem((i) => i.setTitle("Markierung umschalten").setIcon("bookmark").onClick(() => this.toggleMarkierung()));
    menu.addItem((i) => i.setTitle("Abfrage in dieser Notiz verankern").setIcon("sparkles").onClick(() => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) { this.verankern(view.editor); } else { new Notice("Ariadne: Keine Notiz im Fokus."); }
    }));
    menu.addItem((i) => i.setTitle("Reflektieren - naechster Schritt").setIcon("footprints").onClick(() => this.reflektieren()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle("Erkenntnisse gewinnen (M4)").onClick(() => new Notice("Ariadne: Erkenntnisse gewinnen folgt als M4. Bis dahin: Copilot for Obsidian mit dem Sparring-Prompt.")));
    menu.showAtMouseEvent(evt);
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
      new Notice("Ariadne: Markierung entfernt.");
      return;
    }
    const typ = fm ? fm["typ"] : null;
    if (typ) {
      await this.app.fileManager.processFrontMatter(file, (f: any) => { f["ariadne"] = true; });
      new Notice("Ariadne: Notiz freigegeben (typ: " + String(typ) + ").");
    } else {
      new TypModal(this.app, async (t: string) => {
        await this.app.fileManager.processFrontMatter(file, (f: any) => { f["ariadne"] = true; f["typ"] = t; });
        new Notice("Ariadne: Notiz freigegeben als " + t + ".");
      }).open();
    }
  }

  private freigegebeneDateien(): TFile[] {
    return this.app.vault.getMarkdownFiles().filter((f) => {
      const fm = this.frontmatterVon(f);
      return fm !== null && fm["ariadne"] === true;
    });
  }

  private async kontextBilden(): Promise<string> {
    const dateien = this.freigegebeneDateien()
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, this.settings.kontextAnzahl);
    const teile: string[] = [];
    for (const d of dateien) {
      const fm = this.frontmatterVon(d);
      const typ = fm && fm["typ"] ? String(fm["typ"]) : "ohne-typ";
      let text = await this.app.vault.read(d);
      if (text.length > 1200) { text = text.slice(0, 1200) + " ..."; }
      teile.push("--- Notiz: " + d.basename + " (typ: " + typ + ") ---");
      teile.push(text);
    }
    return teile.join("\n\n");
  }

  private krisencheck(text: string): boolean {
    const t = text.toLowerCase();
    return KRISTERME.some((k) => t.includes(k));
  }

  private async ollamaChat(prompt: string): Promise<string> {
    const url = this.settings.endpoint + "/v1/chat/completions";
    const body = JSON.stringify({ model: this.settings.model, messages: [{ role: "user", content: prompt }], temperature: this.settings.temperature, stream: false });
    const res = await requestUrl({ url: url, method: "POST", headers: { "Content-Type": "application/json" }, body: body, throw: false });
    if (res.status >= 400) { throw new Error("HTTP " + res.status + " von " + url); }
    const data = res.json;
    if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return String(data.choices[0].message.content);
    }
    throw new Error("Ungueltige Antwort vom Endpunkt.");
  }

  private baueBlock(antwort: string): string {
    const zeilen = antwort.split("\n").map((l: string) => l.trim().length > 0 ? "> " + l.trim() : ">");
    const kopf: string[] = [
      MARKER,
      "> [!ariadne] Ariadne-Analyse",
      "> Erstellt: " + moment().format("YYYY-MM-DD") + " | Modell: " + this.settings.model + " | Prompt: analyse-v1"
    ];
    return kopf.concat(zeilen).join("\n");
  }

  private setzeBlock(editor: Editor, block: string) {
    const lines = editor.getValue().split("\n");
    let start = -1;
    for (let i = lines.length - 1; i >= 0; i = i - 1) {
      if (lines[i].trim() === MARKER) { start = i; break; }
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
      if (l.length === 0 || l.slice(0, 1) === ">" || l.slice(0, 2) === "%%") { end = i; } else { break; }
    }
    if (end >= lines.length - 1) {
      editor.replaceRange(block, { line: start, ch: 0 }, { line: lines.length - 1, ch: lines[lines.length - 1].length });
    } else {
      editor.replaceRange(block, { line: start, ch: 0 }, { line: end + 1, ch: 0 });
    }
  }

  async verankern(editor: Editor | null) {
    if (!editor) { new Notice("Ariadne: Keine Notiz im Fokus."); return; }
    const text = editor.getValue();
    if (this.krisencheck(text)) {
      this.setzeBlock(editor, [
        MARKER,
        "> [!warning] Grenze erreicht",
        "> Ariadne erkennt ein akutes Krisensignal in dieser Notiz und beendet die Auswertung hier.",
        "> Telefonseelsorge: 0800 111 0 111 oder 0800 111 0 222 (rund um die Uhr, kostenlos, anonym). Im akuten Notfall: 112.",
        "> Ariadne ist Werkzeug, nicht Therapie. Bitte hol dir Unterstuetzung."
      ].join("\n"));
      new Notice("Ariadne: Krisensignal erkannt - Analyse beendet.");
      return;
    }
    const parts: string[] = [ANALYSE_PROMPT];
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
    const n = new Notice("Ariadne analysiert ...");
    try {
      const antwort = await this.ollamaChat(prompt);
      n.hide();
      this.setzeBlock(editor, this.baueBlock(antwort));
      new Notice("Ariadne: Analyse verankert.");
    } catch (e) {
      n.hide();
      new Notice("Ariadne: Endpunkt nicht erreichbar oder Fehler - " + (e && e.message ? e.message : "unbekannt"));
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