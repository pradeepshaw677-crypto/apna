import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Check, 
  Trash2, 
  Home, 
  Briefcase, 
  Building, 
  X, 
  ArrowLeft, 
  Navigation, 
  Sparkles, 
  CheckCircle2,
  Phone,
  User,
  Compass
} from 'lucide-react';
import { DeliveryAddress } from '../types';
import { getSavedAddressesList, saveAddressesList, saveAddress, getSavedAddress } from '../utils/storage';
import { LocationPermissionModal } from './LocationPermissionModal';

interface AddressesViewProps {
  onSelectAddress?: (addr: DeliveryAddress) => void;
  onBackToShop?: () => void;
}

export const AddressesView: React.FC<AddressesViewProps> = ({ onSelectAddress, onBackToShop }) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() => {
    const list = getSavedAddressesList();
    if (list && list.length > 0) return list;
    const current = getSavedAddress();
    if (current && current.fullName && current.streetAddress) {
      return [{ ...current, id: 'addr-default', isDefault: true }];
    }
    return [];
  });

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<DeliveryAddress>>({
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    landmark: '',
    area: 'Baharagora Central Area',
    city: 'Baharagora',
    state: 'Jharkhand',
    pincode: '832101',
    addressType: 'home',
  });

  useEffect(() => {
    saveAddressesList(addresses);
    const def = addresses.find(a => a.isDefault) || addresses[0];
    if (def) {
      saveAddress(def);
    }
  }, [addresses]);

  const handleLocationConfirmedFromMap = (pin: string, detectedAddr: string, isExpressZone: boolean) => {
    setFormData(prev => ({
      ...prev,
      pincode: pin,
      streetAddress: detectedAddr,
      area: isExpressZone ? 'Baharagora Express Hub' : 'Jharkhand Delivery District',
      city: 'Baharagora',
      state: 'Jharkhand',
    }));
    setIsAdding(true);
  };

  const handleUseCurrentLocation = () => {
    setDetectingGps(true);
    setGpsMessage(null);

    if (!navigator.geolocation) {
      setDetectingGps(false);
      setGpsMessage('Geolocation not supported by browser. Pre-filled Baharagora Hub.');
      setFormData(prev => ({
        ...prev,
        city: 'Baharagora',
        state: 'Jharkhand',
        pincode: '832101',
        streetAddress: prev.streetAddress || 'Main Chowk, Dadu Complex Area',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({
          ...prev,
          city: 'Baharagora',
          state: 'Jharkhand',
          pincode: '832101',
          area: 'Dadu Complex / Main Chowk',
          streetAddress: prev.streetAddress || `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) - Baharagora Hub Entrance`,
        }));
        setGpsMessage('GPS Location Confirmed for 3-Day Express Delivery!');
        setTimeout(() => setGpsMessage(null), 4000);
      },
      () => {
        setDetectingGps(false);
        setFormData(prev => ({
          ...prev,
          city: 'Baharagora',
          state: 'Jharkhand',
          pincode: '832101',
          area: 'Dadu Complex Area',
          streetAddress: prev.streetAddress || 'Dadu Complex, Near Shitla Mandir',
        }));
        setGpsMessage('Defaulted to Baharagora, Jharkhand Hub (832101)');
        setTimeout(() => setGpsMessage(null), 4000);
      },
      { timeout: 8000 }
    );
  };

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
      area: 'Baharagora Central Area',
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
    const def = updated.find(a => a.id === id);
    if (def) {
      saveAddress(def);
      if (onSelectAddress) onSelectAddress(def);
    }
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-500" />
              <span>Saved Delivery Addresses</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select or add delivery addresses for ⚡ Fast 3-Day Express Doorstep Delivery with 100% Cash on Delivery.
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Address</span>
            </button>
          </div>
        </div>

        {/* 1. Map Point Banner matching Screenshot 1 */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs max-w-lg mx-auto">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <MapPin className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Where should we deliver?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                Please select your exact delivery location on the map to continue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="w-full py-4 px-5 rounded-2xl bg-[#00875a] hover:bg-[#00734c] text-white font-black text-sm inline-flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/25 transition-all active:scale-98 cursor-pointer"
            >
              <Navigation className="w-4 h-4 -rotate-45" />
              <span>🎯 Select Exact Delivery Point</span>
            </button>
          </div>
        </div>

        {/* Add Address Form Modal Card */}
        {isAdding && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-xl animate-fadeIn space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <MapPin className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-slate-900">Add New Delivery Address</h3>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Map and GPS Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Pick Exact Point on Map</span>
              </button>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingGps}
                className="py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 border border-amber-200 transition-all cursor-pointer"
              >
                <Navigation className={`w-4 h-4 text-amber-600 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'Detecting GPS...' : 'Auto-Detect Device GPS'}</span>
              </button>
            </div>

            {gpsMessage && (
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{gpsMessage}</span>
              </p>
            )}

            {/* Form Fields matching Screenshot 13 (Full Name, Phone Number, Address) */}
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
              <div>
                <label className="text-slate-700 block mb-1">Full Name (Recipient) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">10-Digit Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-700 block mb-1">House / Flat No., Building &amp; Street *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 302, Royal Residency, Near Main Market"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Landmark (e.g. Near Shitla Mandir)</label>
                <input
                  type="text"
                  placeholder="e.g. Dadu Complex, Town High School"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Area / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Baharagora Town"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">City / Town *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Pincode (6 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-700 block mb-1">Address Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'home' })}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.addressType === 'home'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🏠 Home Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: 'work' })}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.addressType === 'work'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🏢 Office / Work
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/20 cursor-pointer active:scale-98 transition-all"
                >
                  Save Delivery Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Grid */}
        {addresses.length === 0 && !isAdding ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900">No Saved Delivery Address</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your delivery address once. You won&apos;t ever have to type it again during checkout!
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your Address Now</span>
            </button>
          </div>
        ) : (
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
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-amber-600" /> Selected for Delivery
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
        )}

      </div>

      {/* Interactive Map Picker Modal */}
      <LocationPermissionModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        currentPincode={formData.pincode || '832101'}
        onConfirmPincode={handleLocationConfirmedFromMap}
      />
    </div>
  );
};
