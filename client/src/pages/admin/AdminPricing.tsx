import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { store, PricingPackage } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CreditCard, Star } from 'lucide-react';

export default function AdminPricing() {
  const [packages, setPackages] = useState(store.getPackages());
  const [showAdd, setShowAdd] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PricingPackage | null>(null);

  const [form, setForm] = useState({ name: '', price: '', features: '', active: true, popular: false });

  const refreshPackages = () => setPackages(store.getPackages());

  const resetForm = () => setForm({ name: '', price: '', features: '', active: true, popular: false });

  const handleAdd = () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    const pkg: PricingPackage = {
      id: `pkg-${Date.now()}`,
      name: form.name,
      price: parseFloat(form.price),
      currency: 'GBP',
      features: form.features.split('\n').filter(f => f.trim()),
      active: form.active,
      popular: form.popular,
    };
    store.addPackage(pkg);
    refreshPackages();
    setShowAdd(false);
    resetForm();
    toast.success('Package created');
  };

  const handleEdit = () => {
    if (!editingPkg || !form.name || !form.price) return;
    store.updatePackage(editingPkg.id, {
      name: form.name,
      price: parseFloat(form.price),
      features: form.features.split('\n').filter(f => f.trim()),
      active: form.active,
      popular: form.popular,
    });
    refreshPackages();
    setEditingPkg(null);
    resetForm();
    toast.success('Package updated');
  };

  const handleDelete = (id: string) => {
    store.deletePackage(id);
    refreshPackages();
    toast.success('Package deleted');
  };

  const openEdit = (pkg: PricingPackage) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      price: pkg.price.toString(),
      features: pkg.features.join('\n'),
      active: pkg.active,
      popular: pkg.popular || false,
    });
  };

  const toggleActive = (pkg: PricingPackage) => {
    store.updatePackage(pkg.id, { active: !pkg.active });
    refreshPackages();
    toast.success(`${pkg.name} ${!pkg.active ? 'activated' : 'deactivated'}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy">Pricing Manager</h1>
          <p className="text-sm text-muted-foreground">Manage service packages and pricing</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAdd(true); }} className="bg-navy hover:bg-navy/90 text-white btn-press">
          <Plus className="w-4 h-4 mr-2" /> Add Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id} className={`border-0 shadow-sm ${!pkg.active ? 'opacity-60' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-navy">{pkg.name}</h3>
                    {pkg.popular && <Star className="w-4 h-4 text-gold fill-gold" />}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-navy">£{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">GBP</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={pkg.active ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {pkg.features.map((f, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-teal mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(pkg)} className="flex-1 btn-press">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleActive(pkg)} className="btn-press">
                  {pkg.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(pkg.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd || !!editingPkg} onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditingPkg(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">{editingPkg ? 'Edit Package' : 'Add New Package'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Package Name</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. VIP Career Agent" className="mt-1.5" />
            </div>
            <div>
              <Label>Price (GBP)</Label>
              <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 399" className="mt-1.5" />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="NHS-style CV rewrite&#10;Supporting information&#10;Up to 5 applications" className="mt-1.5 min-h-[120px]" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mark as Popular</Label>
              <Switch checked={form.popular} onCheckedChange={v => setForm(p => ({ ...p, popular: v }))} />
            </div>
            <Button onClick={editingPkg ? handleEdit : handleAdd} className="w-full bg-navy hover:bg-navy/90 text-white btn-press">
              {editingPkg ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
