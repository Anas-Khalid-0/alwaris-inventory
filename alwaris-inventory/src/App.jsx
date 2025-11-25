import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, History, 
  BarChart3, Search, LogOut, Plus, Minus, ClipboardCheck, Lock, 
  UserCheck, Beaker, Palette, Layers, X, WifiOff, RefreshCw, CheckCircle,
  Languages, FileText, ScanLine, Printer, Calendar, DollarSign, Banknote
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics"; 
import { 
  getFirestore, collection, addDoc, setDoc, onSnapshot, query, 
  orderBy, updateDoc, doc, serverTimestamp, increment, limit 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBsSaIFKeeFllALWLt5wINVX30NajUjqes",
  authDomain: "alwaris-inventory.firebaseapp.com",
  projectId: "alwaris-inventory",
  storageBucket: "alwaris-inventory.firebasestorage.app",
  messagingSenderId: "67652948926",
  appId: "1:67652948926:web:e2b36a4c01ef413f685fef",
  measurementId: "G-8EQNVMQRTZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId || 'alwaris-default';

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    inventory: "Inventory",
    logs: "Logs & Audit",
    reports: "Reports",
    currentStock: "Current Stock",
    dyes: "Dyes",
    chemicals: "Chemicals",
    new: "New Item",
    searchPlaceholder: "Search items...",
    add: "Add",
    use: "Use",
    lowStock: "Low Stock",
    outOfStock: "Empty",
    good: "Good",
    expired: "Expired",
    expiring: "Expiring Soon",
    directorAccess: "Director Access",
    password: "Password",
    verify: "Login",
    totalValue: "Total Inventory Value",
    scanMode: "Scan",
    lowStockAlerts: "Low Stock Alerts",
    supplierDist: "Items by Supplier",
    typeDist: "Inventory Type"
  },
  ur: {
    inventory: "اسٹاک (Inventory)",
    logs: "رکارڈ (Logs)",
    reports: "رپورٹ (Reports)",
    currentStock: "موجودہ اسٹاک",
    dyes: "رنگ (Dyes)",
    chemicals: "کیمیکل",
    new: "نیا آئٹم",
    searchPlaceholder: "تلاش کریں...",
    add: "جمع",
    use: "خرچ",
    lowStock: "کم ہے",
    outOfStock: "ختم",
    good: "موجود",
    expired: "ایکسپائر",
    expiring: "ایکسپائر ہو رہا ہے",
    directorAccess: "ڈائریکٹر لاگ ان",
    password: "پاس ورڈ",
    verify: "داخل ہوں",
    totalValue: "کل مالیت",
    scanMode: "اسکین",
    lowStockAlerts: "وارننگ",
    supplierDist: "سپلائر کی تفصیل",
    typeDist: "قسم"
  }
};

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 flex items-center animate-in slide-in-from-top-5 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
      {type === 'success' ? <CheckCircle size={18} className="mr-2" /> : <AlertTriangle size={18} className="mr-2" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

// --- HELPERS ---
const exportPDF = () => {
  window.print();
};

const checkExpiry = (dateString) => {
  if (!dateString) return 'good';
  const today = new Date();
  const expiry = new Date(dateString);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays < 0) return 'expired';
  if (diffDays < 30) return 'expiring';
  return 'good';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumSignificantDigits: 3 }).format(value);
};

// --- COMPONENTS ---

const LoginScreen = ({ onLogin, authError, onRetry, lang, setLang, t }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDirectorLogin = (e) => {
    e.preventDefault();
    if (password === 'alwaris') onLogin('Director');
    else setError('Invalid Password');
  };

  if (selectedRole === 'Director') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden p-8">
          <button onClick={() => setSelectedRole(null)} className="text-sm text-slate-500 mb-4">← Back</button>
          <div className="text-center mb-6">
            <Lock className="text-slate-700 mx-auto mb-4" size={28} />
            <h2 className="text-xl font-bold text-slate-900">{t.directorAccess}</h2>
          </div>
          <form onSubmit={handleDirectorLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" autoFocus />
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">{t.verify}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-slate-800 p-8 text-center relative">
          <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="absolute top-4 right-4 bg-slate-700 text-white text-xs px-2 py-1 rounded flex items-center">
            <Languages size={12} className="mr-1"/> {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <h1 className="text-2xl font-black text-white tracking-tight">AL-WARIS <span className="text-blue-400">IMS</span></h1>
          <p className="text-slate-400 text-sm mt-2">Inventory Management System</p>
        </div>
        <div className="p-8 space-y-3">
          <button onClick={() => onLogin('Dye Manager')} className="w-full flex items-center p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 group">
            <div className="bg-blue-100 p-2 rounded-lg mr-4"><ArrowDownCircle size={24} className="text-blue-600"/></div>
            <div className="text-left"><div className="font-bold text-slate-900">Dye Manager</div></div>
          </button>
          <button onClick={() => onLogin('Production Manager')} className="w-full flex items-center p-4 border-2 rounded-xl hover:border-purple-500 hover:bg-purple-50 group">
            <div className="bg-purple-100 p-2 rounded-lg mr-4"><ArrowUpCircle size={24} className="text-purple-600"/></div>
            <div className="text-left"><div className="font-bold text-slate-900">Production Manager</div></div>
          </button>
          <button onClick={() => setSelectedRole('Director')} className="w-full flex items-center p-4 border-2 rounded-xl hover:border-slate-800 hover:bg-slate-50 group">
            <div className="bg-slate-200 p-2 rounded-lg mr-4"><BarChart3 size={24} className="text-slate-800"/></div>
            <div className="text-left"><div className="font-bold text-slate-900">Director</div></div>
          </button>
        </div>
      </div>
    </div>
  );
};

const InventoryCard = ({ item, onAction, role, t }) => {
  const totalStock = (item.stockUnit1 || 0) + (item.stockUnit2 || 0);
  const expiryStatus = checkExpiry(item.expiryDate);
  const totalValue = totalStock * (item.price || 0);

  const getBadge = (qty, thresh) => {
    if (qty <= 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">{t.outOfStock}</span>;
    if (qty < thresh) return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md flex items-center"><AlertTriangle size={10} className="mr-1" /> {t.lowStock}</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">{t.good}</span>;
  };

  return (
    <div className={`bg-white p-4 rounded-xl border shadow-sm h-full flex flex-col ${expiryStatus === 'expired' ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h3>
          <span className="text-xs text-slate-400 block mt-1">{item.supplier}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-slate-800">{totalStock} <span className="text-xs font-medium text-slate-500">{item.unit}</span></div>
          {getBadge(totalStock, item.threshold)}
        </div>
      </div>

      {/* Expiry & Value Section */}
      <div className="mb-3 flex items-center justify-between text-xs">
        {item.expiryDate ? (
          <div className={`flex items-center font-medium ${expiryStatus === 'expired' ? 'text-red-600' : expiryStatus === 'expiring' ? 'text-amber-600' : 'text-slate-500'}`}>
            <Calendar size={12} className="mr-1" /> {item.expiryDate}
            {expiryStatus === 'expired' && <span className="ml-1 font-bold">({t.expired})</span>}
          </div>
        ) : <span className="text-slate-300">-</span>}
        
        {role === 'Director' && item.price > 0 && (
          <div className="text-green-700 font-bold flex items-center">
            <Banknote size={12} className="mr-1" /> {formatCurrency(totalValue)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2 rounded-lg mt-auto">
        <div className="text-center border-r border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase">Unit 1</div>
          <div className="font-bold text-slate-700">{item.stockUnit1 || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase">Unit 2</div>
          <div className="font-bold text-slate-700">{item.stockUnit2 || 0}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {(role === 'Dye Manager' || role === 'Director') && (
          <button onClick={() => onAction(item, 'IN')} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center">
            <Plus size={14} className="mr-1" /> {t.add}
          </button>
        )}
        {(role === 'Production Manager' || role === 'Director') && (
          <button onClick={() => onAction(item, 'OUT')} className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center justify-center">
            <Minus size={14} className="mr-1" /> {t.use}
          </button>
        )}
      </div>
    </div>
  );
};

// --- REPORTING DASHBOARD ---
const ReportsDashboard = ({ items, t }) => {
  const totalInventoryValue = useMemo(() => {
    return items.reduce((acc, item) => acc + ((item.stockUnit1 + item.stockUnit2) * (item.price || 0)), 0);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Value Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-xs uppercase font-bold mb-1">{t.totalValue}</h3>
          <div className="text-3xl font-black tracking-tight">{formatCurrency(totalInventoryValue)}</div>
        </div>
        <div className="bg-white/10 p-3 rounded-full"><DollarSign size={32} className="text-green-400" /></div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-500 text-sm uppercase mb-4 flex items-center">
          <AlertTriangle size={16} className="mr-2 text-red-500" /> {t.lowStockAlerts}
        </h3>
        <div className="space-y-2">
          {items.filter(i => (i.stockUnit1+i.stockUnit2) < i.threshold).map(i => (
            <div key={i.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex flex-col">
                <span className="font-bold text-red-900">{i.name}</span>
                <span className="text-xs text-red-500">{i.supplier}</span>
              </div>
              <div className="text-right">
                <span className="block text-red-600 font-black text-lg">{(i.stockUnit1+i.stockUnit2)} {i.unit}</span>
                <span className="text-xs text-red-400">Threshold: {i.threshold}</span>
              </div>
            </div>
          ))}
          {items.filter(i => (i.stockUnit1+i.stockUnit2) < i.threshold).length === 0 && <p className="text-slate-400 italic p-4 text-center">All stock levels good.</p>}
        </div>
      </div>
    </div>
  );
};

// --- MODALS ---
const ActionModal = ({ isOpen, onClose, type, item, onSubmit }) => {
  if (!isOpen || !item) return null;
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('Unit 2');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('');
  
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ itemId: item.id, qty: Number(qty), unit, notes, itemName: item.name, actionType: type, operatorName }); setQty(''); setNotes(''); setOperatorName(''); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
        <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">{type === 'IN' ? 'Add Stock' : 'Use Stock'} - {item.name}</h3><button onClick={onClose}><X /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-xl" value={operatorName} onChange={e => setOperatorName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <select className="p-3 border rounded-xl" value={unit} onChange={e => setUnit(e.target.value)}><option value="Unit 1">Unit 1</option><option value="Unit 2">Unit 2</option></select>
            <input type="number" placeholder={`Qty (${item.unit})`} className="p-3 border rounded-xl" value={qty} onChange={e => setQty(e.target.value)} required />
          </div>
          <input type="text" placeholder="Notes / Batch #" className="w-full p-3 border rounded-xl" value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Confirm</button>
        </form>
      </div>
    </div>
  );
};

const NewItemModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;
  const [data, setData] = useState({ name: '', type: 'Dye', supplier: '', unit: 'kg', threshold: 10, price: '', expiryDate: '' });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(data); setData({ name: '', type: 'Dye', supplier: '', unit: 'kg', threshold: 10, price: '', expiryDate: '' }); };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">New Item</h3><button onClick={onClose}><X /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Item Name" className="w-full p-3 border rounded-xl" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <select className="p-3 border rounded-xl" value={data.type} onChange={e => setData({...data, type: e.target.value})}><option value="Dye">Dye</option><option value="Chemical">Chemical</option></select>
            <select className="p-3 border rounded-xl" value={data.unit} onChange={e => setData({...data, unit: e.target.value})}><option value="kg">kg</option><option value="L">L</option></select>
          </div>
          <input type="text" placeholder="Supplier" className="w-full p-3 border rounded-xl" value={data.supplier} onChange={e => setData({...data, supplier: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Low Alert" className="w-full p-3 border rounded-xl" value={data.threshold} onChange={e => setData({...data, threshold: Number(e.target.value)})} required />
            <input type="number" placeholder="Price/Unit" className="w-full p-3 border rounded-xl" value={data.price} onChange={e => setData({...data, price: Number(e.target.value)})} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 mb-1">Expiry Date (Optional)</label>
            <input type="date" className="w-full p-3 border rounded-xl" value={data.expiryDate} onChange={e => setData({...data, expiryDate: e.target.value})} />
          </div>
          <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Add Item</button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [role, setRole] = useState(null);
  const [view, setView] = useState('inventory');
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [inventoryCategory, setInventoryCategory] = useState('Dye');
  const [lang, setLang] = useState('en'); // Language State
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [actionType, setActionType] = useState('IN');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const t = TRANSLATIONS[lang];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const connectAuth = async () => {
    try { await signInAnonymously(auth); } 
    catch (e) { setUser({ uid: 'guest', isAnonymous: true }); }
  };

  useEffect(() => {
    connectAuth();
    onAuthStateChanged(auth, (u) => u && setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsInitialLoad(true);
    const itemsRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
    const unsubItems = onSnapshot(itemsRef, (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsInitialLoad(false);
    });
    const logsRef = query(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubLogs = onSnapshot(logsRef, (snap) => setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => { unsubItems(); unsubLogs(); };
  }, [user]);

  const handleTransaction = async ({ itemId, qty, unit, notes, itemName, actionType, operatorName }) => {
    setModalOpen(false);
    showToast(lang === 'en' ? "Updating Stock..." : "اسٹاک اپ ڈیٹ ہو رہا ہے...");
    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', itemId);
      const field = unit === 'Unit 1' ? 'stockUnit1' : 'stockUnit2';
      await setDoc(itemRef, { [field]: increment(actionType === 'IN' ? qty : -qty) }, { merge: true });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), { 
        type: actionType, itemName, itemId, qty, unit, notes, operatorName, userRole: role, timestamp: serverTimestamp() 
      });
    } catch (error) { showToast("Update Failed", "error"); }
  };

  const handleAddItem = async (formData) => {
    setNewItemModalOpen(false);
    showToast(lang === 'en' ? "Adding Item..." : "نیا آئٹم شامل کر رہا ہے...");
    try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), { ...formData, stockUnit1: 0, stockUnit2: 0 }); } 
    catch (error) { showToast("Failed", "error"); }
  };

  const groupedItems = useMemo(() => {
    let filtered = items.filter(i => inventoryCategory === 'Chemical' ? (i.type === 'Chemical' || i.type === 'Auxiliary') : i.type === inventoryCategory);
    if (searchQuery) filtered = filtered.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const groups = {};
    filtered.forEach(item => { const sup = item.supplier || 'Unknown'; if (!groups[sup]) groups[sup] = []; groups[sup].push(item); });
    return groups;
  }, [items, inventoryCategory, searchQuery]);

  if (!role) return <LoginScreen onLogin={setRole} authError={authError} onRetry={connectAuth} lang={lang} setLang={setLang} t={t} />;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 md:pb-0 md:pl-64">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* SIDEBAR */}
      <div className="md:fixed md:inset-y-0 md:left-0 md:w-64 bg-slate-900 text-white flex flex-col z-30">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center md:block">
          <div><h1 className="font-black text-xl">AL-WARIS <span className="text-blue-500">IMS</span></h1><p className="text-xs text-slate-500 mt-1">{role}</p></div>
          <button onClick={() => setRole(null)} className="md:hidden text-slate-400"><LogOut size={20}/></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 hidden md:block">
          <button onClick={() => setView('inventory')} className={`w-full flex items-center p-3 rounded-xl transition-colors ${view === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Package size={20} className="mr-3"/> {t.inventory}</button>
          <button onClick={() => setView('logs')} className={`w-full flex items-center p-3 rounded-xl transition-colors ${view === 'logs' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><History size={20} className="mr-3"/> {t.logs}</button>
          {role === 'Director' && <button onClick={() => setView('reports')} className={`w-full flex items-center p-3 rounded-xl transition-colors ${view === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><BarChart3 size={20} className="mr-3"/> {t.reports}</button>}
        </nav>
        <div className="p-4 border-t border-slate-800 hidden md:block space-y-2">
          <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="flex items-center text-slate-400 hover:text-white"><Languages size={16} className="mr-2"/> {lang === 'en' ? 'Urdu' : 'English'}</button>
          <button onClick={() => setRole(null)} className="flex items-center text-slate-400 hover:text-white"><LogOut size={16} className="mr-2"/> Logout</button>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden bg-white p-2 flex justify-around shadow-sm sticky top-0 z-10">
         <div className="flex items-center justify-between w-full px-4">
            <div className="flex space-x-8">
              <button onClick={() => setView('inventory')} className={`p-2 rounded-lg ${view === 'inventory' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><Package /></button>
              <button onClick={() => setView('logs')} className={`p-2 rounded-lg ${view === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}><History /></button>
            </div>
            {/* MOBILE LANG TOGGLE */}
            <button onClick={() => setLang(lang === 'en' ? 'ur' : 'en')} className="flex items-center text-slate-600 text-xs font-bold bg-slate-100 px-2 py-1 rounded">
              {lang === 'en' ? 'اردو' : 'ENG'}
            </button>
         </div>
      </div>

      {/* MAIN */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {view === 'inventory' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="bg-white p-1 rounded-xl shadow-sm border flex">
                <button onClick={() => setInventoryCategory('Dye')} className={`px-6 py-2 rounded-lg text-sm font-bold ${inventoryCategory === 'Dye' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>{t.dyes}</button>
                <button onClick={() => setInventoryCategory('Chemical')} className={`px-6 py-2 rounded-lg text-sm font-bold ${inventoryCategory === 'Chemical' ? 'bg-cyan-100 text-cyan-700' : 'text-slate-500'}`}>{t.chemicals}</button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white p-2 rounded-xl border flex items-center">
                  <Search className="text-slate-400 mx-2" size={20}/>
                  <input type="text" placeholder={t.searchPlaceholder} className="w-full outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button className="text-slate-400 hover:text-blue-600"><ScanLine size={20} title={t.scanMode} /></button>
                </div>
                <button onClick={() => exportPDF(items, lang)} className="bg-white p-3 rounded-xl border hover:bg-slate-50 text-slate-600"><Printer size={20}/></button>
                {(role === 'Director' || role === 'Dye Manager') && <button onClick={() => setNewItemModalOpen(true)} className="bg-slate-900 text-white px-4 rounded-xl font-bold hover:bg-slate-800"><Plus/></button>}
              </div>
            </div>

            {/* Grouped List */}
            {isInitialLoad ? <div className="text-center py-12 text-slate-400">Loading...</div> : 
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([supplier, products]) => (
                  <div key={supplier} className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center mb-4"><div className="h-px bg-slate-300 flex-1"></div><h3 className="px-4 text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center"><Layers size={14} className="mr-2"/> {supplier}</h3><div className="h-px bg-slate-300 flex-1"></div></div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {products.map(item => (
                        <InventoryCard key={item.id} item={item} role={role} t={t} onAction={(itm, type) => { setActiveItem(itm); setActionType(type); setModalOpen(true); }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {view === 'reports' && role === 'Director' && <ReportsDashboard items={items} t={t} />}
        
        {view === 'logs' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase"><tr><th className="p-4">Type</th><th className="p-4">Item</th><th className="p-4">Qty</th><th className="p-4">User</th><th className="p-4">Time</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${log.type === 'IN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{log.type}</span></td>
                      <td className="p-4 font-medium">{log.itemName}</td><td className="p-4 font-bold">{log.qty} ({log.unit})</td><td className="p-4">{log.operatorName}</td>
                      <td className="p-4 text-slate-400">
                        {log.timestamp?.seconds 
                          ? new Date(log.timestamp.seconds * 1000).toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) 
                          : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={activeItem} type={actionType} onSubmit={handleTransaction} />
      <NewItemModal isOpen={newItemModalOpen} onClose={() => setNewItemModalOpen(false)} onSubmit={handleAddItem} />
    </div>
  );
};

export default App;