
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { 
  Save,
  Plus,
  Copy,
  Trash,
  MoveUp,
  MoveDown,
  GripVertical,
  Settings,
  Edit,
  Eye,
  ArrowLeft,
  Layers,
  FileText,
  MessageSquare,
  ListTodo,
  ImageIcon,
  Calendar,
  Clock,
  Pencil,
  Star,
  CheckSquare,
  CheckCircle,
  Circle,
  Mail,
  Phone,
  User,
  HelpCircle,
} from 'lucide-react';

// Definire i tipi per i campi del form
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: { id: string; value: string }[];
  defaultValue?: string | string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  properties?: Record<string, any>;
}

interface FormPage {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormData {
  id?: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  pages: FormPage[];
  settings: {
    showProgressBar: boolean;
    showPageTitles: boolean;
    allowSave: boolean;
    themeName: string;
    submitButtonText: string;
    successMessage: string;
  };
}

const defaultField: FormField = {
  id: '',
  type: 'text',
  label: '',
  placeholder: '',
  required: false,
  helpText: '',
};

const defaultPage: FormPage = {
  id: '',
  title: '',
  description: '',
  fields: [],
};

const defaultForm: FormData = {
  title: 'Nuovo Form',
  description: 'Descrizione del form',
  status: 'draft',
  pages: [{ ...defaultPage, id: 'page-1', title: 'Pagina 1' }],
  settings: {
    showProgressBar: true,
    showPageTitles: true,
    allowSave: true,
    themeName: 'default',
    submitButtonText: 'Invia',
    successMessage: 'Grazie per aver compilato il form!',
  },
};

const FormBuilderEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [activePage, setActivePage] = useState<number>(0);
  const [fieldMenuOpen, setFieldMenuOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<{ pageIndex: number; fieldIndex: number } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      // Carica il form esistente (esempio)
      setTimeout(() => {
        const mockForm: FormData = {
          id: id,
          title: 'Questionario di Analisi Aziendale',
          description: 'Valutazione completa delle performance aziendali',
          status: 'draft',
          pages: [
            {
              id: 'page-1',
              title: 'Informazioni Generali',
              description: 'Fornisci alcune informazioni di base sulla tua azienda',
              fields: [
                {
                  id: 'field-1',
                  type: 'text',
                  label: 'Nome Azienda',
                  placeholder: 'Inserisci il nome della tua azienda',
                  required: true,
                  helpText: 'Nome legale completo dell\'azienda',
                },
                {
                  id: 'field-2',
                  type: 'email',
                  label: 'Email di contatto',
                  placeholder: 'email@azienda.com',
                  required: true,
                  helpText: 'Email principale per le comunicazioni',
                },
                {
                  id: 'field-3',
                  type: 'number',
                  label: 'Numero di dipendenti',
                  placeholder: 'Es. 50',
                  required: true,
                  validation: {
                    min: 1,
                    max: 10000,
                  },
                },
              ],
            },
            {
              id: 'page-2',
              title: 'Performance Aziendale',
              description: 'Valuta le performance della tua azienda nelle seguenti aree',
              fields: [
                {
                  id: 'field-4',
                  type: 'radio',
                  label: 'Settore principale',
                  required: true,
                  options: [
                    { id: 'option-1', value: 'Tecnologia' },
                    { id: 'option-2', value: 'Finanza' },
                    { id: 'option-3', value: 'Sanità' },
                    { id: 'option-4', value: 'Produzione' },
                    { id: 'option-5', value: 'Altro' },
                  ],
                },
                {
                  id: 'field-5',
                  type: 'scale',
                  label: 'Valuta l\'efficienza dei processi interni',
                  required: true,
                  properties: {
                    min: 1,
                    max: 5,
                    minLabel: 'Molto inefficiente',
                    maxLabel: 'Molto efficiente',
                  },
                },
              ],
            },
          ],
          settings: {
            showProgressBar: true,
            showPageTitles: true,
            allowSave: true,
            themeName: 'modern',
            submitButtonText: 'Invia Valutazione',
            successMessage: 'Grazie per aver completato il questionario!',
          },
        };
        
        setForm(mockForm);
        setLoading(false);
      }, 1000);
    } else {
      // Nuovo form
      setForm({
        ...defaultForm,
        id: 'new-' + Date.now(),
      });
      setLoading(false);
    }
  }, [id]);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePageChange = (pageIndex: number, field: string, value: any) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        [field]: value,
      };
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const handleFieldChange = (pageIndex: number, fieldIndex: number, field: string, value: any) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const updatedFields = [...updatedPages[pageIndex].fields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        [field]: value,
      };
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        fields: updatedFields,
      };
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const handleSettingChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const addNewPage = () => {
    setForm(prev => {
      const newPageId = `page-${Date.now()}`;
      return {
        ...prev,
        pages: [...prev.pages, { ...defaultPage, id: newPageId, title: `Pagina ${prev.pages.length + 1}` }],
      };
    });
    
    // Vai alla nuova pagina
    setTimeout(() => {
      setActivePage(form.pages.length);
    }, 10);
  };

  const deletePage = (pageIndex: number) => {
    if (form.pages.length <= 1) {
      toast({
        title: "Operazione non consentita",
        description: "Il form deve avere almeno una pagina",
        variant: "destructive",
      });
      return;
    }
    
    setForm(prev => {
      const updatedPages = prev.pages.filter((_, index) => index !== pageIndex);
      return {
        ...prev,
        pages: updatedPages,
      };
    });
    
    // Aggiorna la pagina attiva se necessario
    if (activePage >= pageIndex && activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const addNewField = (pageIndex: number, fieldType: string) => {
    const newFieldId = `field-${Date.now()}`;
    let newField: FormField = {
      ...defaultField,
      id: newFieldId,
      type: fieldType,
      label: getDefaultLabelForType(fieldType),
    };
    
    // Aggiungi proprietà specifiche in base al tipo
    if (fieldType === 'radio' || fieldType === 'checkbox' || fieldType === 'select') {
      newField.options = [
        { id: `option-${Date.now()}-1`, value: 'Opzione 1' },
        { id: `option-${Date.now()}-2`, value: 'Opzione 2' },
      ];
    } else if (fieldType === 'scale') {
      newField.properties = {
        min: 1,
        max: 5,
        minLabel: 'Min',
        maxLabel: 'Max',
      };
    }
    
    setForm(prev => {
      const updatedPages = [...prev.pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        fields: [...updatedPages[pageIndex].fields, newField],
      };
      return {
        ...prev,
        pages: updatedPages,
      };
    });
    
    // Seleziona il nuovo campo
    setTimeout(() => {
      setSelectedField({
        pageIndex,
        fieldIndex: form.pages[pageIndex].fields.length,
      });
    }, 10);
    
    setFieldMenuOpen(false);
  };

  const deleteField = (pageIndex: number, fieldIndex: number) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const updatedFields = updatedPages[pageIndex].fields.filter((_, index) => index !== fieldIndex);
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        fields: updatedFields,
      };
      return {
        ...prev,
        pages: updatedPages,
      };
    });
    
    setSelectedField(null);
  };

  const duplicateField = (pageIndex: number, fieldIndex: number) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const fieldToCopy = { ...updatedPages[pageIndex].fields[fieldIndex] };
      const newFieldId = `field-${Date.now()}`;
      
      const duplicatedField: FormField = {
        ...fieldToCopy,
        id: newFieldId,
        label: `${fieldToCopy.label} (copia)`,
      };
      
      const updatedFields = [...updatedPages[pageIndex].fields];
      updatedFields.splice(fieldIndex + 1, 0, duplicatedField);
      
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        fields: updatedFields,
      };
      
      return {
        ...prev,
        pages: updatedPages,
      };
    });
    
    // Seleziona il campo duplicato
    setTimeout(() => {
      setSelectedField({
        pageIndex,
        fieldIndex: fieldIndex + 1,
      });
    }, 10);
  };

  const moveField = (pageIndex: number, fieldIndex: number, direction: 'up' | 'down') => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const updatedFields = [...updatedPages[pageIndex].fields];
      
      if (direction === 'up' && fieldIndex > 0) {
        // Sposta il campo in su
        const temp = updatedFields[fieldIndex];
        updatedFields[fieldIndex] = updatedFields[fieldIndex - 1];
        updatedFields[fieldIndex - 1] = temp;
        
        // Aggiorna l'indice del campo selezionato
        if (selectedField && selectedField.pageIndex === pageIndex && selectedField.fieldIndex === fieldIndex) {
          setSelectedField({
            pageIndex,
            fieldIndex: fieldIndex - 1,
          });
        }
      } else if (direction === 'down' && fieldIndex < updatedFields.length - 1) {
        // Sposta il campo in giù
        const temp = updatedFields[fieldIndex];
        updatedFields[fieldIndex] = updatedFields[fieldIndex + 1];
        updatedFields[fieldIndex + 1] = temp;
        
        // Aggiorna l'indice del campo selezionato
        if (selectedField && selectedField.pageIndex === pageIndex && selectedField.fieldIndex === fieldIndex) {
          setSelectedField({
            pageIndex,
            fieldIndex: fieldIndex + 1,
          });
        }
      }
      
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        fields: updatedFields,
      };
      
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const addOption = (pageIndex: number, fieldIndex: number) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const fieldToUpdate = updatedPages[pageIndex].fields[fieldIndex];
      
      if (!fieldToUpdate.options) {
        fieldToUpdate.options = [];
      }
      
      const newOption = {
        id: `option-${Date.now()}`,
        value: `Opzione ${fieldToUpdate.options.length + 1}`,
      };
      
      fieldToUpdate.options = [...fieldToUpdate.options, newOption];
      
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const updateOption = (pageIndex: number, fieldIndex: number, optionIndex: number, value: string) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const fieldToUpdate = updatedPages[pageIndex].fields[fieldIndex];
      
      if (fieldToUpdate.options) {
        fieldToUpdate.options[optionIndex] = {
          ...fieldToUpdate.options[optionIndex],
          value,
        };
      }
      
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const deleteOption = (pageIndex: number, fieldIndex: number, optionIndex: number) => {
    setForm(prev => {
      const updatedPages = [...prev.pages];
      const fieldToUpdate = updatedPages[pageIndex].fields[fieldIndex];
      
      if (fieldToUpdate.options) {
        if (fieldToUpdate.options.length <= 2) {
          toast({
            title: "Operazione non consentita",
            description: "È necessario avere almeno 2 opzioni",
            variant: "destructive",
          });
          return prev;
        }
        
        fieldToUpdate.options = fieldToUpdate.options.filter((_, index) => index !== optionIndex);
      }
      
      return {
        ...prev,
        pages: updatedPages,
      };
    });
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;
    
    if (!destination) return;
    
    if (type === 'page') {
      // Riordinamento pagine
      const newPages = Array.from(form.pages);
      const [removed] = newPages.splice(source.index, 1);
      newPages.splice(destination.index, 0, removed);
      
      setForm({ ...form, pages: newPages });
      
      // Aggiorna la pagina attiva se necessario
      if (activePage === source.index) {
        setActivePage(destination.index);
      }
    } else if (type === 'field') {
      // Riordinamento campi nella stessa pagina
      if (source.droppableId === destination.droppableId) {
        const pageIndex = parseInt(source.droppableId.split('-')[1]);
        const newFields = Array.from(form.pages[pageIndex].fields);
        const [removed] = newFields.splice(source.index, 1);
        newFields.splice(destination.index, 0, removed);
        
        const updatedPages = [...form.pages];
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          fields: newFields,
        };
        
        setForm({ ...form, pages: updatedPages });
        
        // Aggiorna l'indice del campo selezionato se necessario
        if (selectedField && 
            selectedField.pageIndex === pageIndex && 
            selectedField.fieldIndex === source.index) {
          setSelectedField({
            pageIndex,
            fieldIndex: destination.index,
          });
        }
      } else {
        // Spostamento campi tra pagine diverse
        const sourcePageIndex = parseInt(source.droppableId.split('-')[1]);
        const destPageIndex = parseInt(destination.droppableId.split('-')[1]);
        
        const sourceFields = Array.from(form.pages[sourcePageIndex].fields);
        const destFields = Array.from(form.pages[destPageIndex].fields);
        
        const [removed] = sourceFields.splice(source.index, 1);
        destFields.splice(destination.index, 0, removed);
        
        const updatedPages = [...form.pages];
        updatedPages[sourcePageIndex] = {
          ...updatedPages[sourcePageIndex],
          fields: sourceFields,
        };
        updatedPages[destPageIndex] = {
          ...updatedPages[destPageIndex],
          fields: destFields,
        };
        
        setForm({ ...form, pages: updatedPages });
        
        // Aggiorna l'indice del campo selezionato se necessario
        if (selectedField && 
            selectedField.pageIndex === sourcePageIndex && 
            selectedField.fieldIndex === source.index) {
          setSelectedField({
            pageIndex: destPageIndex,
            fieldIndex: destination.index,
          });
        }
      }
    }
  };

  const getDefaultLabelForType = (type: string): string => {
    const labels: Record<string, string> = {
      'text': 'Campo di Testo',
      'textarea': 'Area di Testo',
      'email': 'Email',
      'number': 'Numero',
      'tel': 'Telefono',
      'radio': 'Scelta Singola',
      'checkbox': 'Scelta Multipla',
      'select': 'Menu a Tendina',
      'date': 'Data',
      'time': 'Ora',
      'scale': 'Scala di Valutazione',
      'rating': 'Valutazione a Stelle',
      'file': 'Caricamento File',
      'image-choice': 'Scelta Immagine',
      'name': 'Nome',
      'address': 'Indirizzo',
    };
    
    return labels[type] || 'Nuovo Campo';
  };

  const getFieldIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'text': <FileText size={16} />,
      'textarea': <MessageSquare size={16} />,
      'email': <Mail size={16} />,
      'number': <ListTodo size={16} />,
      'tel': <Phone size={16} />,
      'radio': <Circle size={16} />,
      'checkbox': <CheckSquare size={16} />,
      'select': <ListTodo size={16} />,
      'date': <Calendar size={16} />,
      'time': <Clock size={16} />,
      'scale': <Layers size={16} />,
      'rating': <Star size={16} />,
      'file': <FileText size={16} />,
      'image-choice': <ImageIcon size={16} />,
      'name': <User size={16} />,
      'address': <FileText size={16} />,
    };
    
    return icons[type] || <HelpCircle size={16} />;
  };

  const handleSaveForm = () => {
    setSaving(true);
    
    // Simula il salvataggio
    setTimeout(() => {
      setSaving(false);
      
      toast({
        title: "Form salvato",
        description: "Il form è stato salvato con successo",
      });
      
      // Redirect alla lista form
      // navigate('/admin/form-builder');
    }, 1000);
  };

  const handlePublishForm = () => {
    setForm(prev => ({
      ...prev,
      status: 'published',
    }));
    
    // Simula il salvataggio
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      
      toast({
        title: "Form pubblicato",
        description: "Il form è stato pubblicato con successo",
      });
    }, 1000);
  };

  if (loading) {
    return <div className="flex justify-center p-10">Caricamento...</div>;
  }

  const FormFieldEditor = ({ field, pageIndex, fieldIndex }: { field: FormField, pageIndex: number, fieldIndex: number }) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`field-${field.id}-label`}>Etichetta</Label>
            <Input
              id={`field-${field.id}-label`}
              value={field.label}
              onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'label', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`field-${field.id}-type`}>Tipo di campo</Label>
            <Select
              value={field.type}
              onValueChange={(value) => handleFieldChange(pageIndex, fieldIndex, 'type', value)}
            >
              <SelectTrigger id={`field-${field.id}-type`}>
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Campo di Testo</SelectItem>
                <SelectItem value="textarea">Area di Testo</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="number">Numero</SelectItem>
                <SelectItem value="tel">Telefono</SelectItem>
                <SelectItem value="radio">Scelta Singola (Radio)</SelectItem>
                <SelectItem value="checkbox">Scelta Multipla (Checkbox)</SelectItem>
                <SelectItem value="select">Menu a Tendina</SelectItem>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="time">Ora</SelectItem>
                <SelectItem value="scale">Scala di Valutazione</SelectItem>
                <SelectItem value="rating">Valutazione a Stelle</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="address">Indirizzo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {['text', 'textarea', 'email', 'number', 'tel', 'date', 'time'].includes(field.type) && (
          <div className="space-y-2">
            <Label htmlFor={`field-${field.id}-placeholder`}>Placeholder</Label>
            <Input
              id={`field-${field.id}-placeholder`}
              value={field.placeholder || ''}
              onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'placeholder', e.target.value)}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor={`field-${field.id}-help`}>Testo di aiuto</Label>
          <Input
            id={`field-${field.id}-help`}
            value={field.helpText || ''}
            onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'helpText', e.target.value)}
            placeholder="Descrizione opzionale del campo"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id={`field-${field.id}-required`}
            checked={field.required}
            onCheckedChange={(checked) => handleFieldChange(pageIndex, fieldIndex, 'required', checked)}
          />
          <Label htmlFor={`field-${field.id}-required`}>Campo obbligatorio</Label>
        </div>
        
        {['radio', 'checkbox', 'select'].includes(field.type) && field.options && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Opzioni</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addOption(pageIndex, fieldIndex)}
              >
                <Plus className="h-4 w-4 mr-1" /> Aggiungi
              </Button>
            </div>
            <div className="space-y-2 border rounded-md p-2">
              {field.options.map((option, optIndex) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Input
                    value={option.value}
                    onChange={(e) => updateOption(pageIndex, fieldIndex, optIndex, e.target.value)}
                    placeholder={`Opzione ${optIndex + 1}`}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteOption(pageIndex, fieldIndex, optIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {field.type === 'scale' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-min`}>Valore minimo</Label>
                <Input
                  id={`field-${field.id}-min`}
                  type="number"
                  value={field.properties?.min || 1}
                  onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'properties', {
                    ...field.properties,
                    min: parseInt(e.target.value),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-max`}>Valore massimo</Label>
                <Input
                  id={`field-${field.id}-max`}
                  type="number"
                  value={field.properties?.max || 5}
                  onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'properties', {
                    ...field.properties,
                    max: parseInt(e.target.value),
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-min-label`}>Etichetta minima</Label>
                <Input
                  id={`field-${field.id}-min-label`}
                  value={field.properties?.minLabel || 'Min'}
                  onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'properties', {
                    ...field.properties,
                    minLabel: e.target.value,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`field-${field.id}-max-label`}>Etichetta massima</Label>
                <Input
                  id={`field-${field.id}-max-label`}
                  value={field.properties?.maxLabel || 'Max'}
                  onChange={(e) => handleFieldChange(pageIndex, fieldIndex, 'properties', {
                    ...field.properties,
                    maxLabel: e.target.value,
                  })}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <div>
            <Button variant="destructive" size="sm" onClick={() => deleteField(pageIndex, fieldIndex)}>
              <Trash className="h-4 w-4 mr-1" /> Elimina
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => duplicateField(pageIndex, fieldIndex)}>
              <Copy className="h-4 w-4 mr-1" /> Duplica
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveField(pageIndex, fieldIndex, 'up')}
              disabled={fieldIndex === 0}
            >
              <MoveUp className="h-4 w-4 mr-1" /> Su
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveField(pageIndex, fieldIndex, 'down')}
              disabled={fieldIndex === form.pages[pageIndex].fields.length - 1}
            >
              <MoveDown className="h-4 w-4 mr-1" /> Giù
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const FormFieldPreview = ({ field }: { field: FormField }) => {
    const renderField = () => {
      switch (field.type) {
        case 'text':
          return <Input placeholder={field.placeholder || ''} />;
        case 'textarea':
          return <Textarea placeholder={field.placeholder || ''} />;
        case 'email':
          return <Input type="email" placeholder={field.placeholder || ''} />;
        case 'number':
          return <Input type="number" placeholder={field.placeholder || ''} />;
        case 'tel':
          return <Input type="tel" placeholder={field.placeholder || ''} />;
        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input type="radio" id={option.id} name={field.id} />
                  <Label htmlFor={option.id}>{option.value}</Label>
                </div>
              ))}
            </div>
          );
        case 'checkbox':
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input type="checkbox" id={option.id} name={field.id} />
                  <Label htmlFor={option.id}>{option.value}</Label>
                </div>
              ))}
            </div>
          );
        case 'select':
          return (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un'opzione" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'date':
          return <Input type="date" />;
        case 'time':
          return <Input type="time" />;
        case 'scale':
          return (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{field.properties?.minLabel || 'Min'}</span>
                <span>{field.properties?.maxLabel || 'Max'}</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: (field.properties?.max || 5) - (field.properties?.min || 1) + 1 }).map((_, idx) => {
                  const value = (field.properties?.min || 1) + idx;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <input type="radio" id={`scale-${field.id}-${value}`} name={field.id} value={value} />
                      <Label htmlFor={`scale-${field.id}-${value}`} className="text-xs mt-1">
                        {value}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        default:
          return <Input placeholder="Anteprima non disponibile" />;
      }
    };
    
    return (
      <div className="space-y-2 p-4 border rounded-md">
        <div className="flex justify-between">
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
        {renderField()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/form-builder')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Indietro
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-muted-foreground mt-1">
              {form.status === 'draft' ? 'Bozza' : form.status === 'published' ? 'Pubblicato' : 'Archiviato'}
            </p>
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Edit className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {previewMode ? 'Modifica' : 'Anteprima'}
          </Button>
          <Button onClick={handleSaveForm} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Salvando...' : 'Salva'}
          </Button>
          {form.status !== 'published' && (
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handlePublishForm} 
              disabled={saving}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Pubblica
            </Button>
          )}
        </div>
      </div>
      
      {previewMode ? (
        // Modalità anteprima
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-2">{form.title}</h2>
            <p className="text-gray-500 mb-4">{form.description}</p>
            
            <div className="space-y-8 mt-6">
              {form.pages.map((page, pageIndex) => (
                <div key={page.id} className="space-y-6">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold">{page.title}</h3>
                    {page.description && <p className="text-gray-500 mt-1">{page.description}</p>}
                  </div>
                  
                  {page.fields.map((field) => (
                    <FormFieldPreview key={field.id} field={field} />
                  ))}
                </div>
              ))}
              
              <div className="pt-4 border-t flex justify-end">
                <Button>{form.settings.submitButtonText}</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Modalità modifica
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
            <TabsTrigger value="logic">Logica</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Base</CardTitle>
                <CardDescription>
                  Informazioni generali sul form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="form-title">Titolo</Label>
                    <Input
                      id="form-title"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="form-description">Descrizione</Label>
                    <Textarea
                      id="form-description"
                      value={form.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Descrizione opzionale del form"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Pagine</CardTitle>
                    <CardDescription>
                      Organizza il form in pagine
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="pages" type="page">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {form.pages.map((page, index) => (
                              <Draggable
                                key={page.id}
                                draggableId={page.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center justify-between p-2 border rounded-md ${
                                      index === activePage ? 'bg-gray-100' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div 
                                      className="flex items-center cursor-pointer flex-1"
                                      onClick={() => setActivePage(index)}
                                    >
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-grab"
                                      >
                                        <GripVertical size={16} />
                                      </div>
                                      <span className="truncate">{page.title}</span>
                                    </div>
                                    <div className="flex">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() => deletePage(index)}
                                      >
                                        <Trash size={16} />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={addNewPage}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi Pagina
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>
                          Editor Pagina: {form.pages[activePage]?.title || ''}
                        </CardTitle>
                        <CardDescription>
                          Modifica i dettagli e i campi della pagina corrente
                        </CardDescription>
                      </div>
                      <Dialog open={fieldMenuOpen} onOpenChange={setFieldMenuOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-1" /> Aggiungi Campo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aggiungi un nuovo campo</DialogTitle>
                            <DialogDescription>
                              Seleziona il tipo di campo da aggiungere al form
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'text')}
                            >
                              <FileText className="h-5 w-5 mr-2" /> Campo di Testo
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'textarea')}
                            >
                              <MessageSquare className="h-5 w-5 mr-2" /> Area di Testo
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'email')}
                            >
                              <Mail className="h-5 w-5 mr-2" /> Email
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'number')}
                            >
                              <ListTodo className="h-5 w-5 mr-2" /> Numero
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'radio')}
                            >
                              <Circle className="h-5 w-5 mr-2" /> Scelta Singola
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'checkbox')}
                            >
                              <CheckSquare className="h-5 w-5 mr-2" /> Scelta Multipla
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'select')}
                            >
                              <ListTodo className="h-5 w-5 mr-2" /> Menu a Tendina
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'date')}
                            >
                              <Calendar className="h-5 w-5 mr-2" /> Data
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'time')}
                            >
                              <Clock className="h-5 w-5 mr-2" /> Ora
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'scale')}
                            >
                              <Layers className="h-5 w-5 mr-2" /> Scala
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'rating')}
                            >
                              <Star className="h-5 w-5 mr-2" /> Valutazione
                            </Button>
                            <Button
                              variant="outline"
                              className="justify-start h-auto py-3"
                              onClick={() => addNewField(activePage, 'name')}
                            >
                              <User className="h-5 w-5 mr-2" /> Nome
                            </Button>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setFieldMenuOpen(false)}>
                              Annulla
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Page Properties */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="page-title">Titolo della Pagina</Label>
                          <Input
                            id="page-title"
                            value={form.pages[activePage]?.title || ''}
                            onChange={(e) => handlePageChange(activePage, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="page-description">Descrizione della Pagina</Label>
                          <Textarea
                            id="page-description"
                            value={form.pages[activePage]?.description || ''}
                            onChange={(e) => handlePageChange(activePage, 'description', e.target.value)}
                            placeholder="Descrizione opzionale della pagina"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Fields List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Campi</h3>
                      
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={`fields-${activePage}`} type="field">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {form.pages[activePage]?.fields.map((field, fieldIndex) => (
                                <Draggable
                                  key={field.id}
                                  draggableId={field.id}
                                  index={fieldIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Card>
                                        <CardHeader className="pb-2 pt-4 px-4">
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                              <div
                                                {...provided.dragHandleProps}
                                                className="mr-2 cursor-grab"
                                              >
                                                <GripVertical size={16} />
                                              </div>
                                              <div className="flex items-center">
                                                {getFieldIcon(field.type)}
                                                <span className="ml-2 font-medium">{field.label}</span>
                                              </div>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                if (selectedField && 
                                                    selectedField.pageIndex === activePage && 
                                                    selectedField.fieldIndex === fieldIndex) {
                                                  setSelectedField(null);
                                                } else {
                                                  setSelectedField({
                                                    pageIndex: activePage,
                                                    fieldIndex,
                                                  });
                                                }
                                              }}
                                            >
                                              {selectedField && 
                                               selectedField.pageIndex === activePage && 
                                               selectedField.fieldIndex === fieldIndex ? 
                                                'Chiudi' : 'Modifica'}
                                            </Button>
                                          </div>
                                        </CardHeader>
                                        {selectedField && 
                                         selectedField.pageIndex === activePage && 
                                         selectedField.fieldIndex === fieldIndex && (
                                          <CardContent className="px-4 pb-4">
                                            <FormFieldEditor
                                              field={field}
                                              pageIndex={activePage}
                                              fieldIndex={fieldIndex}
                                            />
                                          </CardContent>
                                        )}
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      
                      {form.pages[activePage]?.fields.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-md">
                          <p className="text-muted-foreground mb-4">
                            Nessun campo in questa pagina
                          </p>
                          <Button onClick={() => setFieldMenuOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Aggiungi Campo
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Impostazioni Form</CardTitle>
                <CardDescription>
                  Personalizza le impostazioni del form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Aspetto</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema</Label>
                      <Select
                        value={form.settings.themeName}
                        onValueChange={(value) => handleSettingChange('themeName', value)}
                      >
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Seleziona tema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="submit-text">Testo Pulsante Invio</Label>
                      <Input
                        id="submit-text"
                        value={form.settings.submitButtonText}
                        onChange={(e) => handleSettingChange('submitButtonText', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-progress"
                        checked={form.settings.showProgressBar}
                        onCheckedChange={(checked) => handleSettingChange('showProgressBar', checked)}
                      />
                      <Label htmlFor="show-progress">Mostra barra di avanzamento</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-titles"
                        checked={form.settings.showPageTitles}
                        onCheckedChange={(checked) => handleSettingChange('showPageTitles', checked)}
                      />
                      <Label htmlFor="show-titles">Mostra titoli delle pagine</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Comportamento</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-save"
                        checked={form.settings.allowSave}
                        onCheckedChange={(checked) => handleSettingChange('allowSave', checked)}
                      />
                      <Label htmlFor="allow-save">Permetti di salvare e riprendere</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="success-message">Messaggio di successo</Label>
                    <Textarea
                      id="success-message"
                      value={form.settings.successMessage}
                      onChange={(e) => handleSettingChange('successMessage', e.target.value)}
                      placeholder="Messaggio mostrato dopo l'invio del form"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveForm} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? 'Salvando...' : 'Salva Impostazioni'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="logic">
            <Card>
              <CardHeader>
                <CardTitle>Logica Condizionale</CardTitle>
                <CardDescription>
                  Configura la logica condizionale del form
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Logica Condizionale</h3>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  La logica condizionale permette di mostrare o nascondere campi e pagine in base alle risposte dell'utente.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Regola
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash className="h-4 w-4 mr-1" /> Elimina Form
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo form?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione è irreversibile. Una volta eliminato, il form e tutti i suoi dati saranno persi definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                toast({
                  title: "Form eliminato",
                  description: "Il form è stato eliminato con successo",
                });
                navigate('/admin/form-builder');
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormBuilderEditor;
