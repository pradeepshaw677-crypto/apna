import React, { useState } from 'react';
import { MapPin, Plus, Check, Trash2, Home, Briefcase, Building, X, ArrowLeft } from 'lucide-react';
import { DeliveryAddress } from '../types';

interface AddressesViewProps {
  onSelectAddress?: (addr: DeliveryAddress) => void;
  onBackToShop?: () => void;
}

export const AddressesView: React.FC<AddressesViewProps> = ({ onSelectAddress, onBackToShop }) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr-1',
      fullName: 'Bhabani Shit',
      phoneNumber: '9876543210',
      streetAddress: 'Plot 42, Green Avenue, Sector 14, Main Road',
      landmark: 'Near City Center Mall',
      area: 'Sector 14',
      city: 'Baharagora',
      state: 'Jharkhand',
      pincode: '832101',
      addressType: 'home',
      isDefault: true,
    },
    {
      id: 'addr-2',
      fullName: 'Bhabani Shit (Commercial)',
      phoneNumber: '9876543210',
      streetAddress: 'Shop 18, Commercial Plaza, Market Hub',
      landmark: 'Opposite State Bank Branch',
      area: 'Main Market',
      city: 'Baharagora',
      state: 'Jharkhand',
      pincode: '832101',
      addressType: 'work',
      isDefault: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<DeliveryAddress>>({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    landmark: '',
    area: 'Sector 14',
    city: 'Baharagora',
    state: 'Jharkhand',
    pincode: '832101',
    addressType: 'home',
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.streetAddress || !formData.phoneNumber) return;

    const newAddr: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      fullName: formData.fullName || '',
      phoneNumber: formData.phoneNumber || '',
      streetAddress: formData.streetAddress || '',
      landmark: formData.landmark || '',
      area: formData.area || 'Baharagora',
      city: formData.city || 'Baharagora',
      state: formData.state || 'Jharkhand',
      pincode: formData.pincode || '832101',
      addressType: (formData.addressType as any) || 'home',
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    if (onSelectAddress) onSelectAddress(newAddr);
    setIsAdding(false);
    setFormData({
      fullName: '',
      phoneNumber: '',
      streetAddress: '',
      landmark: '',
      area: 'Sector 14',
      city: 'Baharagora',
      state: 'Jharkhand',
      pincode: '832101',
      addressType: 'home',
    });
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    const def = updated.find(a => a.isDefault);
    if (def && onSelectAddress) onSelectAddress(def);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-500" />
              <span>Saved Delivery Addresses</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select or add delivery addresses for hassle-free Cash on Delivery checkout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToShop && (
              <button
                onClick={onBackToShop}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Shop</span>
              </button>
            )}

            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {isAdding && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add New Delivery Address</h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <label className="text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Bhabani Shit"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit number"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-600 block mb-1">Street Address / House No. / Flat *</label>
                <input
                  type="text"
                  required
                  value={formData.streetAddress}
                  onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="e.g. Plot 42, Green Avenue, Main Road"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 832101"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Baharagora"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Address Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'home' })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold ${
                      formData.addressType === 'home'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'work' })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold ${
                      formData.addressType === 'work'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Work
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md cursor-pointer"
                >
                  Save Delivery Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`p-5 rounded-3xl border-2 transition-all space-y-3 bg-white ${
                addr.isDefault
                  ? 'border-amber-500 shadow-md shadow-amber-500/10'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                    {addr.addressType === 'work' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                  </span>
                  <span className="font-black text-slate-900 text-sm">{addr.fullName}</span>
                </div>

                {addr.isDefault && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    Default Address
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-0.5 font-medium">
                <p className="text-slate-800 font-bold">{addr.streetAddress}</p>
                {addr.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                <p>{addr.city}, {addr.state || 'Jharkhand'} - {addr.pincode}</p>
                <p className="pt-1 text-slate-900 font-bold">Mobile: {addr.phoneNumber}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id || '')}
                    className="text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected for Delivery
                  </span>
                )}

                <button
                  onClick={() => handleDelete(addr.id || '')}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
