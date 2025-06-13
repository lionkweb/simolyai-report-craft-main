
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Copy, Trash2, ArrowRight } from "lucide-react";
import { ChartConfig } from '@/services/prompt-templates';
import ChartPreview from './ChartPreview';
import TablePreview from './TablePreview';
import { chartTypeOptions, tableTypeOptions } from '@/services/chart-config';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

// Definizione dei tipi per le sezioni
export type ShortcodeItem = {
  id: string;
  title: string;
  shortcode: string;
  type?: string;
  chartType?: string;
  tableType?: string;
  prompt?: string;
  config?: any;
};

const defaultChartConfig: ChartConfig = {
  height: 350,
  width: '100%',
  colors: ['#4f46e5', '#2dd4bf', '#fbbf24', '#f87171', '#a78bfa'],
  animations: {
    enabled: true,
    speed: 800
  },
  tooltip: {
    enabled: true
  },
  legend: {
    show: true,
    position: 'bottom'
  },
  grid: {
    show: true
  },
  dataLabels: {
    enabled: false
  }
};

const defaultTableConfig = {
  type: 'simple',
  striped: true,
  bordered: false,
  hoverable: true,
  compact: false,
  width: '100%'
};

const AdvancedPromptEditor = () => {
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<Array<{ name: string; description: string }>>([]);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [systemPrompt, setSystemPrompt] = useState('Sei un assistente virtuale esperto di report aziendali.');
  const { toast } = useToast();
  const [title, setTitle] = useState('Nuovo Prompt');
  
  // Stati per le sezioni
  const [textSections, setTextSections] = useState<ShortcodeItem[]>([
    { id: '1', title: 'Analisi Generale', shortcode: 'analisi_generale', prompt: '' }
  ]);
  
  const [chartSections, setChartSections] = useState<ShortcodeItem[]>([
    { 
      id: '1', 
      title: 'Panoramica Risultati', 
      shortcode: 'chart_overview', 
      type: 'chart',
      chartType: 'bar', 
      prompt: '',
      config: { ...defaultChartConfig }
    }
  ]);
  
  const [tableSections, setTableSections] = useState<ShortcodeItem[]>([
    { 
      id: '1', 
      title: 'Riepilogo Dati', 
      shortcode: 'table_summary', 
      type: 'table',
      tableType: 'simple', 
      prompt: '',
      config: { ...defaultTableConfig }
    }
  ]);

  // Stato per il prompt specifico corrente in fase di modifica
  const [currentEditSection, setCurrentEditSection] = useState<{
    id: string;
    type: 'text' | 'chart' | 'table';
    title: string;
    prompt: string;
  } | null>(null);

  // Stato per la sezione attualmente in fase di configurazione
  const [currentChartConfig, setCurrentChartConfig] = useState<{
    sectionId: string;
    chartType: string;
    config: ChartConfig;
  } | null>(null);

  const [currentTableConfig, setCurrentTableConfig] = useState<{
    sectionId: string;
    tableType: string;
    config: any;
  } | null>(null);

  const addVariable = () => {
    setVariables([...variables, { name: '', description: '' }]);
  };

  const updateVariable = (index: number, field: 'name' | 'description', value: string) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const removeVariable = (index: number) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  const handleSave = () => {
    // Preparazione dei dati da salvare
    const configData = {
      apiSettings: {
        apiKey,
        model,
        temperature,
        maxTokens,
      },
      promptSettings: {
        title,
        systemPrompt,
        userPrompt: prompt,
        variables,
      },
      sections: {
        text: textSections,
        charts: chartSections,
        tables: tableSections,
      }
    };
    
    console.log("Configurazione salvata:", configData);
    
    toast({
      title: "Prompt salvato",
      description: "Il prompt e le configurazioni sono stati salvati con successo"
    });
  };

  // Funzione per mostrare un preview del prompt con le variabili
  const getPreviewPrompt = () => {
    let previewPrompt = prompt;
    variables.forEach(variable => {
      if (variable.name) {
        const placeholder = `{${variable.name}}`;
        previewPrompt = previewPrompt.replace(new RegExp(placeholder, 'g'), `[Valore per "${variable.name}"]`);
      }
    });
    return previewPrompt;
  };

  const testPrompt = () => {
    toast({
      title: "Test avviato",
      description: "Richiesta inviata all'API di OpenAI"
    });
    
    // Simuliamo una risposta dopo un breve ritardo
    setTimeout(() => {
      toast({
        title: "Risposta ricevuta",
        description: "Il test è stato completato con successo"
      });
    }, 2000);
  };

  // Gestione delle sezioni
  const addTextSection = () => {
    const newId = (textSections.length + 1).toString();
    const newSection = {
      id: newId,
      title: `Nuova Sezione Testo ${newId}`,
      shortcode: `sezione_testo_${newId}`,
      prompt: ''
    };
    setTextSections([...textSections, newSection]);
  };

  const addChartSection = () => {
    const newId = (chartSections.length + 1).toString();
    const newSection = {
      id: newId,
      title: `Nuovo Grafico ${newId}`,
      shortcode: `chart_${newId}`,
      type: 'chart',
      chartType: 'bar',
      prompt: '',
      config: { ...defaultChartConfig }
    };
    setChartSections([...chartSections, newSection]);
    
    // Apri automaticamente la configurazione per il nuovo grafico
    setCurrentChartConfig({
      sectionId: newId,
      chartType: 'bar',
      config: { ...defaultChartConfig }
    });
  };

  const addTableSection = () => {
    const newId = (tableSections.length + 1).toString();
    const newSection = {
      id: newId,
      title: `Nuova Tabella ${newId}`,
      shortcode: `table_${newId}`,
      type: 'table',
      tableType: 'simple',
      prompt: '',
      config: { ...defaultTableConfig }
    };
    setTableSections([...tableSections, newSection]);
    
    // Apri automaticamente la configurazione per la nuova tabella
    setCurrentTableConfig({
      sectionId: newId,
      tableType: 'simple',
      config: { ...defaultTableConfig }
    });
  };

  const updateTextSection = (index: number, field: string, value: string) => {
    const updatedSections = [...textSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setTextSections(updatedSections);
  };

  const updateChartSection = (index: number, field: string, value: string) => {
    const updatedSections = [...chartSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setChartSections(updatedSections);
    
    // Se stiamo aggiornando il tipo di grafico, aggiorna anche la configurazione corrente
    if (field === 'chartType' && currentChartConfig?.sectionId === updatedSections[index].id) {
      setCurrentChartConfig({
        ...currentChartConfig,
        chartType: value
      });
    }
  };

  const updateTableSection = (index: number, field: string, value: string) => {
    const updatedSections = [...tableSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setTableSections(updatedSections);
    
    // Se stiamo aggiornando il tipo di tabella, aggiorna anche la configurazione corrente
    if (field === 'tableType' && currentTableConfig?.sectionId === updatedSections[index].id) {
      setCurrentTableConfig({
        ...currentTableConfig,
        tableType: value
      });
    }
  };

  const updateChartConfig = (index: number, config: ChartConfig) => {
    const updatedSections = [...chartSections];
    updatedSections[index] = { 
      ...updatedSections[index], 
      config: config 
    };
    setChartSections(updatedSections);
  };

  const updateTableConfig = (index: number, config: any) => {
    const updatedSections = [...tableSections];
    updatedSections[index] = { 
      ...updatedSections[index], 
      config: config 
    };
    setTableSections(updatedSections);
  };

  const removeTextSection = (index: number) => {
    const updatedSections = [...textSections];
    updatedSections.splice(index, 1);
    setTextSections(updatedSections);
  };

  const removeChartSection = (index: number) => {
    const updatedSections = [...chartSections];
    const removedSection = updatedSections[index];
    updatedSections.splice(index, 1);
    setChartSections(updatedSections);
    
    // Se la sezione rimossa è quella attualmente in configurazione, chiudi la configurazione
    if (currentChartConfig?.sectionId === removedSection.id) {
      setCurrentChartConfig(null);
    }
  };

  const removeTableSection = (index: number) => {
    const updatedSections = [...tableSections];
    const removedSection = updatedSections[index];
    updatedSections.splice(index, 1);
    setTableSections(updatedSections);
    
    // Se la sezione rimossa è quella attualmente in configurazione, chiudi la configurazione
    if (currentTableConfig?.sectionId === removedSection.id) {
      setCurrentTableConfig(null);
    }
  };

  // Gestione del prompt specifico
  const openPromptDialog = (type: 'text' | 'chart' | 'table', id: string, title: string, prompt: string) => {
    setCurrentEditSection({
      id,
      type,
      title,
      prompt: prompt || ''
    });
  };

  const closePromptDialog = () => {
    setCurrentEditSection(null);
  };

  const saveSpecificPrompt = () => {
    if (!currentEditSection) return;

    const { id, type, prompt } = currentEditSection;

    if (type === 'text') {
      const updatedSections = textSections.map(section =>
        section.id === id ? { ...section, prompt } : section
      );
      setTextSections(updatedSections);
    } else if (type === 'chart') {
      const updatedSections = chartSections.map(section =>
        section.id === id ? { ...section, prompt } : section
      );
      setChartSections(updatedSections);
    } else if (type === 'table') {
      const updatedSections = tableSections.map(section =>
        section.id === id ? { ...section, prompt } : section
      );
      setTableSections(updatedSections);
    }

    closePromptDialog();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiato",
      description: "Testo copiato negli appunti"
    });
  };

  const openChartConfig = (section: ShortcodeItem) => {
    setCurrentChartConfig({
      sectionId: section.id,
      chartType: section.chartType || 'bar',
      config: section.config || { ...defaultChartConfig }
    });
  };

  const openTableConfig = (section: ShortcodeItem) => {
    setCurrentTableConfig({
      sectionId: section.id,
      tableType: section.tableType || 'simple',
      config: section.config || { ...defaultTableConfig }
    });
  };

  const handleChartConfigUpdate = (config: ChartConfig) => {
    if (!currentChartConfig) return;
    
    const index = chartSections.findIndex(s => s.id === currentChartConfig.sectionId);
    if (index >= 0) {
      updateChartConfig(index, config);
      setCurrentChartConfig({
        ...currentChartConfig,
        config: config
      });
    }
  };

  const handleTableConfigUpdate = (config: any) => {
    if (!currentTableConfig) return;
    
    const index = tableSections.findIndex(s => s.id === currentTableConfig.sectionId);
    if (index >= 0) {
      updateTableConfig(index, config);
      setCurrentTableConfig({
        ...currentTableConfig,
        config: config
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configura il Prompt Generale per il questionario</CardTitle>
          <CardDescription>
            Imposta il prompt base utilizzato da ChatGPT per analizzare le risposte e generare il report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="prompt-title">Titolo del Template</Label>
            <Input
              id="prompt-title"
              placeholder="Es. Nuovo Prompt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder="Sei un assistente esperto che analizza i dati dei questionari."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Il system prompt definisce il comportamento generale dell'assistente AI
            </p>
          </div>
          
          <div>
            <Label htmlFor="prompt-principale">Prompt Principale</Label>
            <Textarea
              id="prompt-principale"
              placeholder="Inserisci qui il contenuto del prompt generale con le variabili tra parentesi graffe, es: {nome_variabile}..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 font-mono"
              rows={8}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Questo è il prompt generale per tutto il report. I prompt specifici per ogni sezione possono essere definiti sotto.
              Usa {'{questionnaire_data}'} per includere automaticamente i dati del questionario.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <Label>Variabili</Label>
              <Button variant="outline" size="sm" onClick={addVariable}>
                <Plus className="h-4 w-4 mr-1" /> Aggiungi Variabile
              </Button>
            </div>
            
            <div className="space-y-2 mt-1">
              {variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    value={variable.name}
                    onChange={(e) => updateVariable(index, 'name', e.target.value)}
                    placeholder="Nome variabile"
                  />
                  <Input
                    value={variable.description}
                    onChange={(e) => updateVariable(index, 'description', e.target.value)}
                    placeholder="Descrizione"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeVariable(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {variables.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nessuna variabile definita</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezioni di Testo */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Sezioni di Testo</h2>
          <Button variant="outline" onClick={addTextSection}>
            <Plus className="h-4 w-4 mr-1" /> Aggiungi Sezione Testo
          </Button>
        </div>

        {textSections.map((section, index) => (
          <Card key={`text-${section.id}`}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-3 mb-4">
                <div>
                  <Label htmlFor={`text-title-${index}`}>Titolo Sezione</Label>
                  <Input
                    id={`text-title-${index}`}
                    value={section.title}
                    onChange={(e) => updateTextSection(index, 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`text-shortcode-${index}`}>Shortcode</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`text-shortcode-${index}`}
                      value={section.shortcode}
                      onChange={(e) => updateTextSection(index, 'shortcode', e.target.value)}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`[${section.shortcode}]`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <Button 
                    variant="outline"
                    onClick={() => openPromptDialog('text', section.id, section.title, section.prompt || '')}
                  >
                    {section.prompt ? "Modifica Prompt" : "Aggiungi Prompt"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeTextSection(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafici */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Grafici</h2>
          <Button variant="outline" onClick={addChartSection}>
            <Plus className="h-4 w-4 mr-1" /> Aggiungi Grafico
          </Button>
        </div>

        {chartSections.map((section, index) => (
          <Card key={`chart-${section.id}`}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_1fr] gap-3 mb-4">
                <div>
                  <Label htmlFor={`chart-title-${index}`}>Titolo Grafico</Label>
                  <Input
                    id={`chart-title-${index}`}
                    value={section.title}
                    onChange={(e) => updateChartSection(index, 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`chart-type-${index}`}>Tipo di Grafico</Label>
                  <Select
                    value={section.chartType || 'bar'}
                    onValueChange={(value) => updateChartSection(index, 'chartType', value)}
                  >
                    <SelectTrigger id={`chart-type-${index}`} className="mt-1">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(chartTypeOptions.reduce((groups: Record<string, typeof chartTypeOptions>, option) => {
                        const group = option.group;
                        if (!groups[group]) groups[group] = [];
                        groups[group].push(option);
                        return groups;
                      }, {})).map(([groupName, options]) => (
                        <SelectGroup key={groupName}>
                          <SelectLabel>{groupName}</SelectLabel>
                          {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`chart-shortcode-${index}`}>Shortcode</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`chart-shortcode-${index}`}
                      value={section.shortcode}
                      onChange={(e) => updateChartSection(index, 'shortcode', e.target.value)}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`[${section.shortcode}]`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2 mt-1">
                  <Button 
                    variant="outline"
                    onClick={() => openChartConfig(section)}
                    className="flex-1"
                  >
                    Configura
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => openPromptDialog('chart', section.id, section.title, section.prompt || '')}
                    className="flex-1"
                  >
                    {section.prompt ? "Prompt" : "Prompt"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeChartSection(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {currentChartConfig?.sectionId === section.id && (
                <ChartPreview
                  chartType={currentChartConfig.chartType}
                  config={currentChartConfig.config}
                  onConfigChange={handleChartConfigUpdate}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabelle */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Tabelle</h2>
          <Button variant="outline" onClick={addTableSection}>
            <Plus className="h-4 w-4 mr-1" /> Aggiungi Tabella
          </Button>
        </div>

        {tableSections.map((section, index) => (
          <Card key={`table-${section.id}`}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_1fr] gap-3 mb-4">
                <div>
                  <Label htmlFor={`table-title-${index}`}>Titolo Tabella</Label>
                  <Input
                    id={`table-title-${index}`}
                    value={section.title}
                    onChange={(e) => updateTableSection(index, 'title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`table-type-${index}`}>Tipo di Tabella</Label>
                  <Select
                    value={section.tableType || 'simple'}
                    onValueChange={(value) => updateTableSection(index, 'tableType', value)}
                  >
                    <SelectTrigger id={`table-type-${index}`} className="mt-1">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`table-shortcode-${index}`}>Shortcode</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`table-shortcode-${index}`}
                      value={section.shortcode}
                      onChange={(e) => updateTableSection(index, 'shortcode', e.target.value)}
                      className="font-mono"
                    />
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`[${section.shortcode}]`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2 mt-1">
                  <Button 
                    variant="outline"
                    onClick={() => openTableConfig(section)}
                    className="flex-1"
                  >
                    Configura
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => openPromptDialog('table', section.id, section.title, section.prompt || '')}
                    className="flex-1"
                  >
                    {section.prompt ? "Prompt" : "Prompt"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeTableSection(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {currentTableConfig?.sectionId === section.id && (
                <TablePreview
                  tableType={currentTableConfig.tableType}
                  config={currentTableConfig.config}
                  onConfigChange={handleTableConfigUpdate}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog per modifica prompt specifico */}
      {currentEditSection && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Prompt specifico per: {currentEditSection.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Questo prompt verrà utilizzato da ChatGPT per generare specificamente questa sezione del report
              </p>
              <Textarea
                value={currentEditSection.prompt}
                onChange={(e) => setCurrentEditSection({...currentEditSection, prompt: e.target.value})}
                placeholder="Inserisci il prompt specifico per questa sezione..."
                rows={10}
                className="mb-4 font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closePromptDialog}>Annulla</Button>
                <Button onClick={saveSpecificPrompt}>Salva Prompt</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Salva Configurazione
        </Button>
      </div>
    </div>
  );
};

export default AdvancedPromptEditor;
