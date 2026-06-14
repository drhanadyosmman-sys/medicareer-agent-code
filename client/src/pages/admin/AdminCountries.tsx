import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { store, Country, Pathway } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Globe, ChevronRight } from 'lucide-react';

export default function AdminCountries() {
  const [countries, setCountries] = useState(store.getCountries());
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [showAddPathway, setShowAddPathway] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');

  // Form state for new country
  const [newCountry, setNewCountry] = useState({ name: '', flag: '', status: 'coming-soon' as 'active' | 'coming-soon' });
  // Form state for new pathway
  const [newPathway, setNewPathway] = useState({ type: '', status: 'coming-soon' as 'active' | 'coming-soon', requirements: '', documentsNeeded: '' });

  const refreshCountries = () => setCountries(store.getCountries());

  const handleAddCountry = () => {
    if (!newCountry.name) { toast.error('Country name is required'); return; }
    const country: Country = {
      id: newCountry.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCountry.name,
      flag: newCountry.flag || '🏳️',
      status: newCountry.status,
      pathways: []
    };
    store.addCountry(country);
    refreshCountries();
    setShowAddCountry(false);
    setNewCountry({ name: '', flag: '', status: 'coming-soon' });
    toast.success(`${country.name} added successfully`);
  };

  const handleAddPathway = () => {
    if (!newPathway.type || !selectedCountryId) { toast.error('Pathway type and country are required'); return; }
    const country = countries.find(c => c.id === selectedCountryId);
    if (!country) return;

    const pathway: Pathway = {
      id: `${selectedCountryId}-${newPathway.type.toLowerCase().replace(/\s+/g, '-')}`,
      countryId: selectedCountryId,
      type: newPathway.type,
      status: newPathway.status,
      requirements: newPathway.requirements.split('\n').filter(r => r.trim()),
      documentsNeeded: newPathway.documentsNeeded.split('\n').filter(d => d.trim()),
      applicationStages: ['Submitted', 'Under Review', 'CV Optimization', 'Job Matching', 'Applications Prepared', 'Interview Preparation'],
      faqs: []
    };

    const updatedPathways = [...country.pathways, pathway];
    store.updateCountry(selectedCountryId, { pathways: updatedPathways });
    refreshCountries();
    setShowAddPathway(false);
    setNewPathway({ type: '', status: 'coming-soon', requirements: '', documentsNeeded: '' });
    toast.success(`${newPathway.type} pathway added to ${country.name}`);
  };

  const toggleCountryStatus = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (!country) return;
    const newStatus = country.status === 'active' ? 'coming-soon' : 'active';
    store.updateCountry(countryId, { status: newStatus });
    refreshCountries();
    toast.success(`${country.name} status changed to ${newStatus === 'active' ? 'Active' : 'Coming Soon'}`);
  };

  const deleteCountry = (countryId: string) => {
    store.deleteCountry(countryId);
    refreshCountries();
    toast.success('Country removed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy">Countries & Pathways</h1>
          <p className="text-sm text-muted-foreground">Manage destination countries and career pathways</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPathway(true)} variant="outline" className="btn-press">
            <Plus className="w-4 h-4 mr-2" /> Add Pathway
          </Button>
          <Button onClick={() => setShowAddCountry(true)} className="bg-navy hover:bg-navy/90 text-white btn-press">
            <Plus className="w-4 h-4 mr-2" /> Add Country
          </Button>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="space-y-4">
        {countries.map(country => (
          <Card key={country.id} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <h3 className="font-medium text-navy">{country.name}</h3>
                    <Badge className={country.status === 'active' ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'}>
                      {country.status === 'active' ? 'Active' : 'Coming Soon'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleCountryStatus(country.id)} className="btn-press">
                    {country.status === 'active' ? 'Set Coming Soon' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCountry(country.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Pathways */}
              {country.pathways.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {country.pathways.map(pathway => (
                    <div key={pathway.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-navy">{pathway.type}</p>
                        <p className="text-xs text-muted-foreground">{pathway.requirements.length} requirements • {pathway.documentsNeeded.length} documents</p>
                      </div>
                      <Badge className={pathway.status === 'active' ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'} variant="secondary">
                        {pathway.status === 'active' ? 'Active' : 'Soon'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No pathways configured yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Country Dialog */}
      <Dialog open={showAddCountry} onOpenChange={setShowAddCountry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">Add New Country</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Country Name</Label>
              <Input value={newCountry.name} onChange={e => setNewCountry(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Saudi Arabia" className="mt-1.5" />
            </div>
            <div>
              <Label>Flag Emoji</Label>
              <Input value={newCountry.flag} onChange={e => setNewCountry(p => ({ ...p, flag: e.target.value }))} placeholder="e.g. 🇸🇦" className="mt-1.5" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newCountry.status} onValueChange={v => setNewCountry(p => ({ ...p, status: v as any }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCountry} className="w-full bg-navy hover:bg-navy/90 text-white btn-press">Add Country</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Pathway Dialog */}
      <Dialog open={showAddPathway} onOpenChange={setShowAddPathway}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">Add New Pathway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Country</Label>
              <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select country..." /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.flag} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pathway Type</Label>
              <Select value={newPathway.type} onValueChange={v => setNewPathway(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctors">Doctors</SelectItem>
                  <SelectItem value="Nurses">Nurses</SelectItem>
                  <SelectItem value="Dentists">Dentists</SelectItem>
                  <SelectItem value="Pharmacists">Pharmacists</SelectItem>
                  <SelectItem value="Allied Health">Allied Health</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Fellowship">Fellowship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newPathway.status} onValueChange={v => setNewPathway(p => ({ ...p, status: v as any }))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming-soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea value={newPathway.requirements} onChange={e => setNewPathway(p => ({ ...p, requirements: e.target.value }))} placeholder="Medical degree&#10;Internship&#10;English test" className="mt-1.5" />
            </div>
            <div>
              <Label>Documents Needed (one per line)</Label>
              <Textarea value={newPathway.documentsNeeded} onChange={e => setNewPathway(p => ({ ...p, documentsNeeded: e.target.value }))} placeholder="CV&#10;Passport&#10;Degree certificate" className="mt-1.5" />
            </div>
            <Button onClick={handleAddPathway} className="w-full bg-navy hover:bg-navy/90 text-white btn-press">Add Pathway</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
