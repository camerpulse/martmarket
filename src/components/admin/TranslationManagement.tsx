import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus, Search, Globe } from 'lucide-react';

interface Translation {
  id: string;
  language_code: string;
  translation_key: string;
  translation_value: string;
  context: string | null;
  created_at: string;
  updated_at: string;
}

interface TranslationManagementProps {
  open: boolean;
  onClose: () => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

export const TranslationManagement = ({ open, onClose }: TranslationManagementProps) => {
  const { toast } = useToast();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    language_code: 'en',
    translation_key: '',
    translation_value: '',
    context: ''
  });

  useEffect(() => {
    if (open) {
      loadTranslations();
    }
  }, [open]);

  const loadTranslations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('language_code')
        .order('translation_key');

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error",
        description: "Failed to load translations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTranslation = () => {
    setSelectedTranslation(null);
    setEditForm({
      language_code: 'en',
      translation_key: '',
      translation_value: '',
      context: ''
    });
    setIsCreating(true);
    setEditDialogOpen(true);
  };

  const handleEditTranslation = (translation: Translation) => {
    setSelectedTranslation(translation);
    setEditForm({
      language_code: translation.language_code,
      translation_key: translation.translation_key,
      translation_value: translation.translation_value,
      context: translation.context || ''
    });
    setIsCreating(false);
    setEditDialogOpen(true);
  };

  const saveTranslationChanges = async () => {
    try {
      if (isCreating) {
        const { error } = await supabase
          .from('translations')
          .insert({
            language_code: editForm.language_code,
            translation_key: editForm.translation_key,
            translation_value: editForm.translation_value,
            context: editForm.context || null
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Translation created successfully",
        });
      } else if (selectedTranslation) {
        const { error } = await supabase
          .from('translations')
          .update({
            language_code: editForm.language_code,
            translation_key: editForm.translation_key,
            translation_value: editForm.translation_value,
            context: editForm.context || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedTranslation.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Translation updated successfully",
        });
      }

      setEditDialogOpen(false);
      loadTranslations();
    } catch (error) {
      console.error('Error saving translation:', error);
      toast({
        title: "Error",
        description: "Failed to save translation",
        variant: "destructive",
      });
    }
  };

  const deleteTranslation = async (translation: Translation) => {
    if (!confirm('Are you sure you want to delete this translation?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', translation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation deleted successfully",
      });

      loadTranslations();
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: "Error",
        description: "Failed to delete translation",
        variant: "destructive",
      });
    }
  };

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = translation.translation_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.translation_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.context?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || translation.language_code === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const getLanguageInfo = (code: string) => {
    return AVAILABLE_LANGUAGES.find(lang => lang.code === code) || { name: code, flag: '🌐' };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Translation Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar and Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateTranslation}>
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
              <Button onClick={loadTranslations} variant="outline">
                Refresh
              </Button>
            </div>

            {/* Translations Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((translation) => {
                    const langInfo = getLanguageInfo(translation.language_code);
                    return (
                      <TableRow key={translation.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {langInfo.flag} {langInfo.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{translation.translation_key}</TableCell>
                        <TableCell className="max-w-xs truncate">{translation.translation_value}</TableCell>
                        <TableCell>
                          {translation.context ? (
                            <Badge variant="secondary">{translation.context}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(translation.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditTranslation(translation)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteTranslation(translation)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Translation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Add Translation' : 'Edit Translation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language_code">Language</Label>
              <Select value={editForm.language_code} onValueChange={(value) => setEditForm({ ...editForm, language_code: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="translation_key">Translation Key</Label>
              <Input
                id="translation_key"
                value={editForm.translation_key}
                onChange={(e) => setEditForm({ ...editForm, translation_key: e.target.value })}
                placeholder="e.g., nav.home, product.buy_now"
              />
            </div>
            <div>
              <Label htmlFor="translation_value">Translation Value</Label>
              <Textarea
                id="translation_value"
                value={editForm.translation_value}
                onChange={(e) => setEditForm({ ...editForm, translation_value: e.target.value })}
                placeholder="The translated text"
              />
            </div>
            <div>
              <Label htmlFor="context">Context (Optional)</Label>
              <Input
                id="context"
                value={editForm.context}
                onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                placeholder="Optional context for the translation"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTranslationChanges}>
              {isCreating ? 'Add Translation' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};