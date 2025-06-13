
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MoreVertical, Trash2, Copy, Edit, FileText, Layout } from 'lucide-react';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState([
    {
      id: '1',
      title: 'Questionario di Valutazione Aziendale',
      description: 'Valutazione della maturità digitale delle aziende',
      questions: 15,
      active: true,
      createdAt: '2023-05-10'
    },
    {
      id: '2',
      title: 'Analisi dei Bisogni formativi',
      description: 'Valutazione delle competenze e dei bisogni formativi',
      questions: 8,
      active: true,
      createdAt: '2023-06-22'
    },
    {
      id: '3',
      title: 'Soddisfazione Cliente',
      description: 'Valutazione del livello di soddisfazione dei clienti',
      questions: 5,
      active: false,
      createdAt: '2023-07-15'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shortcodeFormId, setShortcodeFormId] = useState<string | null>(null);
  const [shortcodeDialogOpen, setShortcodeDialogOpen] = useState(false);
  
  const filteredForms = forms.filter(form => {
    // Filtra per termine di ricerca
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtra per stato attivo/inattivo
    const matchesActiveState = showInactiveOnly ? !form.active : true;
    
    return matchesSearch && matchesActiveState;
  });

  const handleCreateNew = () => {
    navigate('/admin/form-builder/create');
  };

  const handleEdit = (formId: string) => {
    navigate(`/admin/form-builder/edit/${formId}`);
  };

  const handleDuplicate = (formId: string) => {
    const formToDuplicate = forms.find(f => f.id === formId);
    if (formToDuplicate) {
      const newForm = {
        ...formToDuplicate,
        id: (forms.length + 1).toString(),
        title: `${formToDuplicate.title} (Copia)`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setForms([...forms, newForm]);
      toast({
        title: 'Form duplicato',
        description: `"${formToDuplicate.title}" è stato duplicato con successo.`
      });
    }
  };

  const handleDelete = (formId: string) => {
    setDeleteFormId(formId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteFormId) {
      setForms(forms.filter(f => f.id !== deleteFormId));
      setDeleteDialogOpen(false);
      toast({
        title: 'Form eliminato',
        description: 'Il form è stato eliminato con successo.'
      });
    }
  };

  const handleToggleActive = (formId: string) => {
    setForms(forms.map(form => {
      if (form.id === formId) {
        return { ...form, active: !form.active };
      }
      return form;
    }));
    
    const form = forms.find(f => f.id === formId);
    if (form) {
      toast({
        title: 'Stato aggiornato',
        description: `Il form "${form.title}" è ora ${!form.active ? 'attivo' : 'inattivo'}.`
      });
    }
  };

  const handleShowShortcode = (formId: string) => {
    setShortcodeFormId(formId);
    setShortcodeDialogOpen(true);
  };

  const handleEditPageLayout = (formId: string) => {
    navigate(`/admin/form-builder/page-layout/${formId}`);
    toast({
      title: 'Editor layout pagina',
      description: 'Modifica la descrizione e il layout della pagina che visualizza il form'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i tuoi form e questionari
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Crea Nuovo Form
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Input
            type="search"
            placeholder="Cerca form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-inactive" className="text-sm font-medium">
            Mostra solo inattivi
          </Label>
          <Switch
            id="show-inactive"
            checked={showInactiveOnly}
            onCheckedChange={setShowInactiveOnly}
          />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredForms.map(form => (
          <Card key={form.id} className={`${!form.active ? 'border-dashed' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center">
                    {form.title}
                    {!form.active && (
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                        Inattivo
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem onClick={() => handleEdit(form.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifica Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditPageLayout(form.id)}>
                      <Layout className="mr-2 h-4 w-4" />
                      Editor Pagina Form
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(form.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplica
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShowShortcode(form.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Shortcode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(form.id)}>
                      <Switch
                        checked={form.active}
                        className="mr-2"
                      />
                      {form.active ? 'Disattiva' : 'Attiva'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600" 
                      onClick={() => handleDelete(form.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Domande: {form.questions}</span>
                <span className="text-muted-foreground">Creato: {form.createdAt}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit(form.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifica Form
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEditPageLayout(form.id)}
              >
                <Layout className="mr-2 h-4 w-4" />
                Editor Pagina
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredForms.length === 0 && (
        <div className="text-center p-10 border rounded-md">
          <p className="text-muted-foreground">Nessun form trovato</p>
          {searchTerm && (
            <p className="text-sm mt-2">Prova a modificare i criteri di ricerca</p>
          )}
        </div>
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questo form? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={shortcodeDialogOpen} onOpenChange={setShortcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shortcode del Form</DialogTitle>
            <DialogDescription>
              Copia questo shortcode per inserire il form in una pagina
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm overflow-x-auto my-4">
            [simoly_form id="{shortcodeFormId}"]
          </div>
          <p className="text-sm text-muted-foreground">
            Aggiungi questo shortcode in qualsiasi pagina per mostrare il form ai visitatori. 
            Solo gli utenti autenticati potranno compilarlo.
          </p>
          <DialogFooter>
            <Button onClick={() => {
              navigator.clipboard.writeText(`[simoly_form id="${shortcodeFormId}"]`);
              toast({
                title: 'Shortcode copiato',
                description: 'Lo shortcode è stato copiato negli appunti.'
              });
              setShortcodeDialogOpen(false);
            }}>
              Copia Shortcode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBuilder;
