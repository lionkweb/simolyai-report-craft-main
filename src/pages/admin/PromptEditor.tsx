
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronLeft, PlusCircle, Save, Trash2, Info } from 'lucide-react';
import { fetchPlan } from '@/services/plans';
import { fetchPlanQuestionnaires } from '@/services/questionnaire-config';
import { 
  fetchPromptTemplate, 
  savePromptTemplate, 
  ReportSectionWithPrompt,
  PromptTemplateWithSections
} from '@/services/prompt-templates';
import type { SubscriptionPlan, PlanQuestionnaire, PlanSettings, PromptTemplate, PromptVariable } from '@/types/supabase';
import { chartTypeOptions, tableTypeOptions } from '@/services/chart-config';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

const PromptEditor = () => {
  const { planId, promptId } = useParams<{ planId: string; promptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as { duplicate?: boolean; template?: PromptTemplateWithSections; questionnaireId?: string } | null;

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [planSettings, setPlanSettings] = useState<PlanSettings | null>(null);
  const [questionnaires, setQuestionnaires] = useState<PlanQuestionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('prompt');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionType, setEditingSectionType] = useState<'text' | 'charts' | 'tables' | null>(null);

  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState<number>(0);

  const [promptTemplate, setPromptTemplate] = useState<PromptTemplateWithSections>({
    title: '',
    content: '',
    system_prompt: 'Sei un assistente esperto che analizza i dati dei questionari.',
    variables: [],
    sequence_index: 0,
    reportTemplate: '',
    sections: {
      text: [],
      charts: [],
      tables: []
    }
  });

  const [currentSectionPrompt, setCurrentSectionPrompt] = useState({
    id: '',
    type: '',
    title: '',
    prompt: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!planId) return;

      try {
        setLoading(true);

        const planData = await fetchPlan(planId);
        if (planData) {
          setPlan(planData.plan);
          setPlanSettings(planData.settings);

          const questionnairesData = await fetchPlanQuestionnaires(planId);
          setQuestionnaires(questionnairesData);

          // Se viene passato un questionnaireId dallo state, lo usiamo subito
          if (state?.questionnaireId) {
            setSelectedQuestionnaireId(state.questionnaireId);
          } else if (questionnairesData.length > 0) {
            setSelectedQuestionnaireId(questionnairesData[0].questionnaire_id);
          }

          if (promptId && promptId !== 'new') {
            const template = await fetchPromptTemplate(promptId) as PromptTemplateWithSections;
            if (template) {
              // Converti il formato sections_data se presente
              const sections = template.sections_data ? {
                text: template.sections_data.text || [],
                charts: template.sections_data.charts || [],
                tables: template.sections_data.tables || []
              } : {
                text: [
                  { id: '1', title: 'Introduzione', shortcode: 'intro', prompt: '' },
                  { id: '2', title: 'Analisi Generale', shortcode: 'analisi_generale', prompt: '' }
                ],
                charts: [
                  { id: '1', title: 'Panoramica Risultati', shortcode: 'chart_overview', type: 'bar', prompt: '' }
                ],
                tables: [
                  { id: '1', title: 'Riepilogo Dati', shortcode: 'table_summary', type: 'simple', prompt: '' }
                ]
              };

              setPromptTemplate({
                ...template,
                reportTemplate: template.report_template || '',
                sections
              });
              setSelectedQuestionnaireId(template.questionnaire_id);
              setSelectedSequenceIndex(template.sequence_index);
            }
          } else if (state?.duplicate && state.template) {
            // Duplica un template esistente
            const { id, ...rest } = state.template;
            setPromptTemplate({
              ...rest,
              title: `Copia di ${rest.title}`
            });
            setSelectedQuestionnaireId(rest.questionnaire_id);
            setSelectedSequenceIndex(rest.sequence_index);
          } else {
            // Template di default per nuovi prompt
            setPromptTemplate({
              title: 'Nuovo Prompt',
              content: '',
              system_prompt: 'Sei un assistente esperto che analizza i dati dei questionari.',
              variables: [],
              sequence_index: 0,
              reportTemplate: '',
              sections: {
                text: [
                  { id: '1', title: 'Introduzione', shortcode: 'intro', prompt: '' },
                  { id: '2', title: 'Analisi Generale', shortcode: 'analisi_generale', prompt: '' }
                ],
                charts: [
                  { id: '1', title: 'Panoramica Risultati', shortcode: 'chart_overview', type: 'bar', prompt: '' }
                ],
                tables: [
                  { id: '1', title: 'Riepilogo Dati', shortcode: 'table_summary', type: 'simple', prompt: '' }
                ]
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore nel caricamento dei dati',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [planId, promptId, toast, state]);

  const getMaxSequences = () => {
    if (!planSettings) return 1;

    if (planSettings.is_periodic && planSettings.retake_limit) {
      return planSettings.retake_limit;
    } else if (planSettings.can_retake && planSettings.retake_limit) {
      return planSettings.retake_limit + 1;
    }

    return 1;
  };

  const sequenceIndexes = Array.from({ length: getMaxSequences() }, (_, i) => i);

  const handleAddVariable = () => {
    setPromptTemplate(prev => ({
      ...prev,
      variables: [
        ...(prev.variables || []),
        { name: '', description: '' }
      ]
    }));
  };

  const handleVariableChange = (index: number, field: keyof PromptVariable, value: string) => {
    setPromptTemplate(prev => {
      const variables = [...(prev.variables || [])];
      variables[index] = {
        ...variables[index],
        [field]: value
      };
      return { ...prev, variables };
    });
  };

  const handleRemoveVariable = (index: number) => {
    setPromptTemplate(prev => {
      const variables = [...(prev.variables || [])];
      variables.splice(index, 1);
      return { ...prev, variables };
    });
  };

  const handleAddTextSection = () => {
    const sections = promptTemplate.sections || { text: [], charts: [], tables: [] };
    const newId = (sections.text.length + 1).toString();
    const newShortcode = `sezione_testo_${newId}`;
    
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        text: [...(prev.sections?.text || []), { 
          id: newId, 
          title: `Nuova Sezione Testo ${newId}`, 
          shortcode: newShortcode,
          prompt: ''
        }]
      }
    }));
  };

  const handleAddChartSection = () => {
    const sections = promptTemplate.sections || { text: [], charts: [], tables: [] };
    const newId = (sections.charts.length + 1).toString();
    const newShortcode = `grafico_${newId}`;
    
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        charts: [...(prev.sections?.charts || []), { 
          id: newId, 
          title: `Grafico ${newId}`, 
          type: 'bar', 
          shortcode: newShortcode,
          prompt: '',
          config: {
            colors: ['#4f46e5', '#2dd4bf', '#fbbf24'],
            height: 350,
            animations: { enabled: true }
          }
        }]
      }
    }));
  };

  const handleAddTableSection = () => {
    const sections = promptTemplate.sections || { text: [], charts: [], tables: [] };
    const newId = (sections.tables.length + 1).toString();
    const newShortcode = `tabella_${newId}`;
    
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        tables: [...(prev.sections?.tables || []), { 
          id: newId, 
          title: `Tabella ${newId}`, 
          type: 'simple', 
          shortcode: newShortcode,
          prompt: '',
          config: {
            headers: ['Colonna 1', 'Colonna 2', 'Colonna 3'],
            sortable: true
          }
        }]
      }
    }));
  };

  const handleRemoveSection = (type: 'text' | 'charts' | 'tables', id: string) => {
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [type]: prev.sections![type].filter(item => item.id !== id)
      }
    }));
  };

  const handleSectionChange = (
    type: 'text' | 'charts' | 'tables', 
    id: string, 
    field: string, 
    value: any
  ) => {
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [type]: prev.sections![type].map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const openSectionPromptDialog = (type: 'text' | 'charts' | 'tables', id: string) => {
    const section = promptTemplate.sections![type].find(item => item.id === id);
    if (section) {
      setEditingSectionType(type);
      setEditingSectionId(id);
      setCurrentSectionPrompt({
        id,
        type,
        title: section.title,
        prompt: section.prompt || ''
      });
    }
  };

  const saveSectionPrompt = () => {
    if (!editingSectionType || !editingSectionId) return;
    
    setPromptTemplate(prev => ({
      ...prev,
      sections: {
        ...prev.sections!,
        [editingSectionType]: prev.sections![editingSectionType].map(item => 
          item.id === editingSectionId 
            ? { ...item, prompt: currentSectionPrompt.prompt }
            : item
        )
      }
    }));

    setEditingSectionId(null);
    setEditingSectionType(null);
  };

  const handleSaveTemplate = async () => {
    if (!planId || !selectedQuestionnaireId) {
      toast({
        title: 'Errore',
        description: 'Manca il questionario selezionato',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      // Salva il template del prompt
      const templateToSave: PromptTemplateWithSections = {
        ...promptTemplate,
        plan_id: planId,
        questionnaire_id: selectedQuestionnaireId,
        sequence_index: selectedSequenceIndex
      };

      const savedTemplate = await savePromptTemplate(templateToSave as any);

      if (savedTemplate) {
        toast({
          title: 'Template salvato',
          description: 'Il template del prompt è stato salvato con successo'
        });

        // Navigate back to the templates list
        navigate(`/admin/plans/${planId}/prompts`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore nel salvataggio del template',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getShortcodesForTemplate = () => {
    if (!promptTemplate.sections) return '';
    
    let allShortcodes = '';
    
    // Aggiungi shortcode per le sezioni di testo
    promptTemplate.sections.text.forEach(section => {
      allShortcodes += `[${section.shortcode}]\n\n`;
    });
    
    // Aggiungi shortcode per i grafici
    promptTemplate.sections.charts.forEach(chart => {
      allShortcodes += `[${chart.shortcode}]\n\n`;
    });
    
    // Aggiungi shortcode per le tabelle
    promptTemplate.sections.tables.forEach(table => {
      allShortcodes += `[${table.shortcode}]\n\n`;
    });
    
    return allShortcodes;
  };
  
  // Funzione per ottenere il titolo del questionario selezionato
  const getSelectedQuestionnaireTitle = () => {
    const questionnaire = questionnaires.find(q => q.questionnaire_id === selectedQuestionnaireId);
    return questionnaire?.questionnaire?.title || 'Questionario selezionato';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/plans/${planId}/prompts`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Torna alla lista dei prompt
          </Button>
          <h1 className="text-2xl font-bold ml-4">
            {promptId && promptId !== 'new' ? 'Modifica Prompt' : 'Nuovo Prompt'}
          </h1>
        </div>
        <Button onClick={handleSaveTemplate} disabled={saving || !selectedQuestionnaireId || !promptTemplate.title}>
          <Save className="h-4 w-4 mr-2" />
          Salva Template
        </Button>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="w-full">
          <h2 className="text-lg font-medium mb-2">
            {selectedQuestionnaireId ? `Configurazione Prompt per "${getSelectedQuestionnaireTitle()}"` : 'Seleziona un questionario'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Questionario</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mt-1">
                    {selectedQuestionnaireId ? getSelectedQuestionnaireTitle() : 'Seleziona questionario'}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {questionnaires.length > 0 ? (
                    questionnaires.map((item) => (
                      <DropdownMenuItem
                        key={item.questionnaire_id}
                        onClick={() => setSelectedQuestionnaireId(item.questionnaire_id)}
                      >
                        {item.questionnaire?.title || 'Questionario senza nome'}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Nessun questionario disponibile
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label>Sequenza</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mt-1">
                    {selectedSequenceIndex === 0 ? 'Prima compilazione' : `Verifica ${selectedSequenceIndex}`}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {sequenceIndexes.map((index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => setSelectedSequenceIndex(index)}
                    >
                      {index === 0 ? 'Prima compilazione' : `Verifica ${index}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="prompt" className="flex-1">Configurazione Prompt Generale</TabsTrigger>
          <TabsTrigger value="sections" className="flex-1">Sezioni Report e Prompt</TabsTrigger>
          <TabsTrigger value="template" className="flex-1">Struttura Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>Configura il Prompt Generale per {selectedQuestionnaireId ? getSelectedQuestionnaireTitle() : 'il questionario'}</CardTitle>
              <CardDescription>
                Imposta il prompt base utilizzato da ChatGPT per analizzare le risposte e generare il report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="template-title">Titolo del Template</Label>
                <Input
                  id="template-title"
                  value={promptTemplate.title || ''}
                  onChange={(e) => setPromptTemplate({ ...promptTemplate, title: e.target.value })}
                  placeholder="Es. Analisi iniziale del questionario"
                />
              </div>
              
              <div>
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  rows={3}
                  value={promptTemplate.system_prompt || ''}
                  onChange={(e) => setPromptTemplate({ ...promptTemplate, system_prompt: e.target.value })}
                  placeholder="Es. Sei un assistente esperto in analisi di questionari aziendali..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Il system prompt definisce il comportamento generale dell'assistente AI
                </p>
              </div>
              
              <div>
                <Label htmlFor="prompt-content">Prompt Principale</Label>
                <Textarea
                  id="prompt-content"
                  rows={8}
                  value={promptTemplate.content || ''}
                  onChange={(e) => setPromptTemplate({ ...promptTemplate, content: e.target.value })}
                  placeholder="Inserisci qui il contenuto del prompt generale con le variabili tra parentesi graffe, es: {nome_variabile}..."
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Questo è il prompt generale per tutto il report. I prompt specifici per ogni sezione possono essere definiti nella scheda "Sezioni Report e Prompt".
                  Usa {'{questionnaire_data}'} per includere automaticamente i dati del questionario.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variabili</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddVariable}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Aggiungi Variabile
                  </Button>
                </div>
                
                {(promptTemplate.variables || []).length > 0 ? (
                  <div className="space-y-2">
                    {(promptTemplate.variables || []).map((variable, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          placeholder="Nome variabile"
                          className="w-1/3"
                        />
                        <Input
                          value={variable.description}
                          onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                          placeholder="Descrizione"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Nessuna variabile definita. Le variabili ti permettono di personalizzare il prompt con dati specifici.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSaveTemplate} disabled={saving || !selectedQuestionnaireId || !promptTemplate.title}>
                <Save className="h-4 w-4 mr-2" />
                Salva Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sezioni di Testo</CardTitle>
                <CardDescription>
                  Definisci le sezioni di testo con i relativi prompt specifici
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {promptTemplate.sections?.text.map(section => (
                  <div key={section.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor={`text-title-${section.id}`}>Titolo Sezione</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveSection('text', section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id={`text-title-${section.id}`}
                      value={section.title}
                      onChange={(e) => handleSectionChange('text', section.id, 'title', e.target.value)}
                    />
                    <div>
                      <Label htmlFor={`text-shortcode-${section.id}`}>Shortcode</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id={`text-shortcode-${section.id}`}
                          value={section.shortcode}
                          onChange={(e) => handleSectionChange('text', section.id, 'shortcode', e.target.value)}
                          className="font-mono"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`[${section.shortcode}]`);
                            toast({
                              title: 'Copiato',
                              description: `Shortcode [${section.shortcode}] copiato negli appunti`
                            });
                          }}
                          className="ml-2"
                        >
                          Copia
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        {section.prompt ? 'Prompt configurato' : 'Nessun prompt specifico'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openSectionPromptDialog('text', section.id)}
                      >
                        {section.prompt ? 'Modifica Prompt' : 'Aggiungi Prompt'}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAddTextSection}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> 
                  Aggiungi Sezione Testo
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grafici</CardTitle>
                  <CardDescription>
                    Definisci i grafici con i relativi prompt specifici
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {promptTemplate.sections?.charts.map(chart => (
                    <div key={chart.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`chart-title-${chart.id}`}>Titolo Grafico</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveSection('charts', chart.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id={`chart-title-${chart.id}`}
                        value={chart.title}
                        onChange={(e) => handleSectionChange('charts', chart.id, 'title', e.target.value)}
                      />
                      <div>
                        <Label htmlFor={`chart-type-${chart.id}`}>Tipo di Grafico</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between mt-1">
                              {chart.type || 'bar'}
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                            {chartTypeOptions.map(option => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleSectionChange('charts', chart.id, 'type', option.value)}
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <Label htmlFor={`chart-shortcode-${chart.id}`}>Shortcode</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id={`chart-shortcode-${chart.id}`}
                            value={chart.shortcode}
                            onChange={(e) => handleSectionChange('charts', chart.id, 'shortcode', e.target.value)}
                            className="font-mono"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`[${chart.shortcode}]`);
                              toast({
                                title: 'Copiato',
                                description: `Shortcode [${chart.shortcode}] copiato negli appunti`
                              });
                            }}
                            className="ml-2"
                          >
                            Copia
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {chart.prompt ? 'Prompt configurato' : 'Nessun prompt specifico'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSectionPromptDialog('charts', chart.id)}
                        >
                          {chart.prompt ? 'Modifica Prompt' : 'Aggiungi Prompt'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAddChartSection}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> 
                    Aggiungi Grafico
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tabelle</CardTitle>
                  <CardDescription>
                    Definisci le tabelle con i relativi prompt specifici
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {promptTemplate.sections?.tables.map(table => (
                    <div key={table.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`table-title-${table.id}`}>Titolo Tabella</Label>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveSection('tables', table.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        id={`table-title-${table.id}`}
                        value={table.title}
                        onChange={(e) => handleSectionChange('tables', table.id, 'title', e.target.value)}
                      />
                      <div>
                        <Label htmlFor={`table-type-${table.id}`}>Tipo di Tabella</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between mt-1">
                              {tableTypeOptions.find(o => o.value === table.type)?.label || table.type || 'simple'}
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            {tableTypeOptions.map(option => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => handleSectionChange('tables', table.id, 'type', option.value)}
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <Label htmlFor={`table-shortcode-${table.id}`}>Shortcode</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            id={`table-shortcode-${table.id}`}
                            value={table.shortcode}
                            onChange={(e) => handleSectionChange('tables', table.id, 'shortcode', e.target.value)}
                            className="font-mono"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`[${table.shortcode}]`);
                              toast({
                                title: 'Copiato',
                                description: `Shortcode [${table.shortcode}] copiato negli appunti`
                              });
                            }}
                            className="ml-2"
                          >
                            Copia
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {table.prompt ? 'Prompt configurato' : 'Nessun prompt specifico'}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openSectionPromptDialog('tables', table.id)}
                        >
                          {table.prompt ? 'Modifica Prompt' : 'Aggiungi Prompt'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAddTableSection}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> 
                    Aggiungi Tabella
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Struttura del Report</CardTitle>
              <CardDescription>
                Definisci la struttura del report usando gli shortcode delle sezioni create
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={20}
                placeholder="Inserisci la struttura del report utilizzando gli shortcode tra parentesi quadre [shortcode]..."
                className="font-mono"
                value={promptTemplate.reportTemplate || getShortcodesForTemplate()}
                onChange={(e) => setPromptTemplate({ ...promptTemplate, reportTemplate: e.target.value })}
              />
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-semibold mb-2">Shortcode Disponibili:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <h4 className="text-xs font-medium mb-1">Sezioni di Testo:</h4>
                    <div className="space-y-1">
                      {promptTemplate.sections?.text.map(section => (
                        <div key={section.id} className="text-xs bg-background p-1 rounded flex justify-between items-center">
                          <code>[{section.shortcode}]</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`[${section.shortcode}]`);
                              toast({
                                title: 'Copiato',
                                description: `Shortcode [${section.shortcode}] copiato negli appunti`
                              });
                            }}
                            className="h-6 px-2"
                          >
                            Copia
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium mb-1">Grafici:</h4>
                    <div className="space-y-1">
                      {promptTemplate.sections?.charts.map(chart => (
                        <div key={chart.id} className="text-xs bg-background p-1 rounded flex justify-between items-center">
                          <code>[{chart.shortcode}]</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`[${chart.shortcode}]`);
                              toast({
                                title: 'Copiato',
                                description: `Shortcode [${chart.shortcode}] copiato negli appunti`
                              });
                            }}
                            className="h-6 px-2"
                          >
                            Copia
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium mb-1">Tabelle:</h4>
                    <div className="space-y-1">
                      {promptTemplate.sections?.tables.map(table => (
                        <div key={table.id} className="text-xs bg-background p-1 rounded flex justify-between items-center">
                          <code>[{table.shortcode}]</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`[${table.shortcode}]`);
                              toast({
                                title: 'Copiato',
                                description: `Shortcode [${table.shortcode}] copiato negli appunti`
                              });
                            }}
                            className="h-6 px-2"
                          >
                            Copia
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSaveTemplate} disabled={saving || !selectedQuestionnaireId || !promptTemplate.title}>
                <Save className="h-4 w-4 mr-2" />
                Salva Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog per modificare i prompt specifici per sezione */}
      <Dialog open={editingSectionId !== null} onOpenChange={(open) => { if(!open) setEditingSectionId(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prompt specifico per: {currentSectionPrompt.title}</DialogTitle>
            <DialogDescription>
              Configura il prompt che ChatGPT utilizzerà per generare specificamente questa sezione del report
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Questo prompt verrà utilizzato per generare specificamente il contenuto di questa sezione. 
                Puoi fare riferimento ai dati del questionario con {'{questionnaire_data}'}.
              </p>
            </div>
            
            <Textarea
              value={currentSectionPrompt.prompt}
              onChange={(e) => setCurrentSectionPrompt({...currentSectionPrompt, prompt: e.target.value})}
              placeholder="Inserisci qui il prompt specifico per questa sezione..."
              rows={12}
              className="font-mono"
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annulla</Button>
            </DialogClose>
            <Button onClick={saveSectionPrompt}>Salva Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptEditor;
