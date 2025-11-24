import React, { useState, useEffect } from 'react';
import { 
  User, Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle, History, 
  BarChart3, Search, LogOut, Plus, Minus, ClipboardCheck, Lock, 
  UserCheck, Beaker, Palette, Layers, X, WifiOff, RefreshCw, CheckCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics"; 
import { 
  getFirestore, collection, addDoc, setDoc, onSnapshot, query, 
  orderBy, updateDoc, doc, serverTimestamp, increment, limit, 
  enableIndexedDbPersistence 
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

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-50 flex items-center animate-in slide-in-from-top-5 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle size={18} className="mr-2" /> : <AlertTriangle size={18} className="mr-2" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

// --- COMPONENTS ---

const LoginScreen = ({ onLogin, authError, onRetry }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    if (role === 'Director') {
      setSelectedRole('Director');
      setError('');
      setPassword('');
    } else {
      onLogin(role);
    }
  };

  const handleDirectorLogin = (e) => {
    e.preventDefault();
    if (password === 'alwaris') {
      onLogin('Director');
    } else {
      setError('Invalid Password');
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="text-red-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6 text-sm">{authError}</p>
          <button onClick={onRetry} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center justify-center">
            <RefreshCw size={18} className="mr-2" /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (selectedRole === 'Director') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden p-8 animate-in zoom-in duration-300">
          <button onClick={() => setSelectedRole(null)} className="text-sm text-slate-500 mb-4 hover:text-blue-600">← Back</button>
          <div className="text-center mb-6">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-slate-700" size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Director Access</h2>
            <p className="text-sm text-slate-500">Please enter secure password</p>
          </div>
          <form onSubmit={handleDirectorLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800" autoFocus />
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Verify & Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-500">
        <div className="bg-slate-800 p-8 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">AL-WARIS <span className="text-blue-400">IMS</span></h1>
          <p className="text-slate-400 text-sm mt-2">Inventory Management System</p>
        </div>
        <div className="p-8">
          <p className="text-slate-600 mb-6 text-center font-medium">Select your role to continue:</p>
          <div className="space-y-3">
            <button onClick={() => handleRoleSelect('Dye Manager')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className="bg-blue-100 p-2 rounded-lg mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors"><ArrowDownCircle size={24} /></div>
              <div className="text-left"><div className="font-bold text-slate-900">Dye Manager</div><div className="text-xs text-slate-500">Inward Stock (Receiving)</div></div>
            </button>
            <button onClick={() => handleRoleSelect('Production Manager')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <div className="bg-purple-100 p-2 rounded-lg mr-4 group-hover:bg-purple-500 group-hover:text-white transition-colors"><ArrowUpCircle size={24} /></div>
              <div className="text-left"><div className="font-bold text-slate-900">Production Manager</div><div className="text-xs text-slate-500">Outward Stock (Usage)</div></div>
            </button>
            <button onClick={() => handleRoleSelect('Director')} className="w-full flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-slate-800 hover:bg-slate-50 transition-all group">
              <div className="bg-slate-200 p-2 rounded-lg mr-4 group-hover:bg-slate-800 group-hover:text-white transition-colors"><BarChart3 size={24} /></div>
              <div className="text-left"><div className="font-bold text-slate-900">Director</div><div className="text-xs text-slate-500">Audits & Reports (Secure)</div></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ qty, threshold }) => {
  if (qty <= 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">Out of Stock</span>;
  if (qty < threshold) return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md flex items-center"><AlertTriangle size={10} className="mr-1" /> Low</span>;
  return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Good</span>;
};

const InventoryCard = ({ item, onAction, role }) => {
  const totalStock = (item.stockUnit1 || 0) + (item.stockUnit2 || 0);
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h3>
          <span className="text-xs text-slate-400 mt-1 block">ID: {item.id ? item.id.slice(0,8) : '...'}</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-black text-slate-800">{totalStock} <span className="text-xs font-medium text-slate-500">{item.unit}</span></div>
          <StatusBadge qty={totalStock} threshold={item.threshold} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2 rounded-lg mt-auto">
        <div className="text-center border-r border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Unit 1</div>
          <div className="font-bold text-slate-700">{item.stockUnit1 || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wide">Unit 2</div>
          <div className="font-bold text-slate-700">{item.stockUnit2 || 0}</div>
        </div>
      </div>
      <div className="flex gap-2">
        {(role === 'Dye Manager' || role === 'Director') && (
          <button onClick={() => onAction(item, 'IN')} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center">
            <Plus size={14} className="mr-1" /> Add
          </button>
        )}
        {(role === 'Production Manager' || role === 'Director') && (
          <button onClick={() => onAction(item, 'OUT')} className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center justify-center">
            <Minus size={14} className="mr-1" /> Use
          </button>
        )}
      </div>
    </div>
  );
};

const NewItemModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({ name: '', type: 'Dye', supplier: '', unit: 'kg', threshold: 10 });
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); setFormData({ name: '', type: 'Dye', supplier: '', unit: 'kg', threshold: 10 }); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 flex justify-between items-center bg-slate-900 text-white">
          <h3 className="font-bold flex items-center"><Package className="mr-2" /> Register New Item</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" placeholder="e.g., Turquoise Blue G" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option value="Dye">Dye</option><option value="Chemical">Chemical</option></select></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
              <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option value="kg">kg</option><option value="L">L</option><option value="g">g</option><option value="drum">drum</option></select></div>
          </div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Supplier Name</label>
            <input type="text" required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" placeholder="e.g., Archroma" /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Low Stock Alert Level</label>
            <input type="number" required value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" /></div>
          <button className="w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-all">Add Item to Database (Instant)</button>
        </form>
      </div>
    </div>
  );
};

const ActionModal = ({ isOpen, onClose, type, item, onSubmit }) => {
  if (!isOpen || !item) return null;
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('Unit 2');
  const [notes, setNotes] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ itemId: item.id, qty: Number(qty), unit, notes, itemName: item.name, actionType: type, operatorName }); setQty(''); setNotes(''); setOperatorName(''); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className={`p-4 flex justify-between items-center ${type === 'IN' ? 'bg-blue-600' : 'bg-slate-800'} text-white`}>
          <h3 className="font-bold flex items-center">{type === 'IN' ? <ArrowDownCircle className="mr-2" /> : <ArrowUpCircle className="mr-2" />}{type === 'IN' ? 'Receive Stock' : 'Record Usage'}</h3><button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item</label><div className="text-lg font-bold text-slate-900">{item.name}</div><div className="text-sm text-slate-500">{item.supplier}</div></div>
          <div className="bg-slate-50 p-3 rounded-xl border border-blue-100"><label className="block text-xs font-bold text-blue-700 uppercase mb-1 flex items-center"><UserCheck size={12} className="mr-1" /> Your Name (Required)</label><input type="text" required value={operatorName} onChange={(e) => setOperatorName(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium outline-none" placeholder="e.g. Ali Ahmed" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label><select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"><option value="Unit 1">Unit 1 (Azizabad)</option><option value="Unit 2">Unit 2 (Highway)</option></select></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity ({item.unit})</label><input type="number" required min="0.01" step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" placeholder="0.00" /></div>
          </div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">{type === 'IN' ? 'Supplier / Invoice #' : 'Batch Number / Purpose'}</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" placeholder={type === 'IN' ? "e.g. Inv-998" : "e.g. Lot-55"} /></div>
          <button disabled={!operatorName} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center ${type === 'IN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'} disabled:opacity-50 transition-all`}>Confirm (Instant Save)</button>
        </form>
      </div>
    </div>
  );
};

const AuditModal = ({ isOpen, onClose, item, onSubmit }) => {
  if (!isOpen || !item) return null;
  const [actualQty, setActualQty] = useState('');
  const [unit, setUnit] = useState('Unit 2');
  const [operatorName, setOperatorName] = useState('');
  const systemQty = unit === 'Unit 1' ? (item.stockUnit1 || 0) : (item.stockUnit2 || 0);
  const handleSubmit = (e) => { e.preventDefault(); const diff = Number(actualQty) - systemQty; onSubmit({ itemId: item.id, diff, actualQty: Number(actualQty), unit, itemName: item.name, operatorName }); setActualQty(''); setOperatorName(''); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-amber-500 p-4 text-white flex justify-between items-center"><h3 className="font-bold flex items-center"><ClipboardCheck className="mr-2" /> Audit / Mismatch Check</h3><button onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-800 text-sm">Use this to correct inventory when the physical stock doesn't match the app.</div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item</label><div className="font-bold text-slate-900">{item.name}</div></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Auditor Name</label><input type="text" required value={operatorName} onChange={(e) => setOperatorName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none" placeholder="e.g. Director Shahid" /></div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label><select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"><option value="Unit 1">Unit 1</option><option value="Unit 2">Unit 2</option></select></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Says</label><div className="p-3 bg-slate-100 rounded-xl font-mono text-slate-500">{systemQty} {item.unit}</div></div>
          </div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Physical Count (Actual)</label><input type="number" required value={actualQty} onChange={(e) => setActualQty(e.target.value)} className="w-full p-3 bg-white border-2 border-amber-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          <button disabled={!operatorName} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">Update Mismatch</button>
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [inventoryCategory, setInventoryCategory] = useState('Dye');
  const [modalOpen, setModalOpen] = useState(false);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [actionType, setActionType] = useState('IN');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const connectAuth = async () => {
    setAuthError(null);
    try { 
      await signInAnonymously(auth); 
    } catch (e) { 
      console.error("Auth failed:", e);
      setUser({ uid: 'guest', isAnonymous: true });
    }
  };

  useEffect(() => {
    // Attempt to enable offline persistence
    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
           // Multiple tabs open, persistence can only be enabled in one tab at a a time.
           console.log("Persistence failed: Multiple tabs open");
        } else if (err.code == 'unimplemented') {
           // The current browser does not support all of the features required to enable persistence
           console.log("Persistence not supported");
        }
      });
    } catch (e) {
      console.log("Persistence init error:", e);
    }

    connectAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsInitialLoad(true);

    const itemsRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
    const unsubItems = onSnapshot(itemsRef, (snapshot) => {
      const loadedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(loadedItems);
      setIsInitialLoad(false);
    }, (err) => {
        console.error("Items Fetch Error:", err);
        setIsInitialLoad(false);
    });

    const logsRef = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'logs'), 
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const unsubLogs = onSnapshot(logsRef, (snapshot) => {
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Logs Fetch Error:", err));
    
    return () => { unsubItems(); unsubLogs(); };
  }, [user]);

  // --- HANDLERS (OPTIMISTIC UPDATE) ---
  
  const handleTransaction = async ({ itemId, qty, unit, notes, itemName, actionType, operatorName }) => {
    // 1. Close Modal IMMEDIATELY
    setModalOpen(false);
    showToast("Transaction Saved! Syncing...", "success");

    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', itemId);
      const fieldToUpdate = unit === 'Unit 1' ? 'stockUnit1' : 'stockUnit2';
      const change = actionType === 'IN' ? qty : -qty;
      
      // 2. Send to Firebase in Background
      await setDoc(itemRef, {
        [fieldToUpdate]: increment(change)
      }, { merge: true });

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), { 
        type: actionType, 
        itemName, 
        itemId, 
        qty, 
        unit, 
        notes, 
        operatorName, 
        userRole: role, 
        timestamp: serverTimestamp() 
      });

    } catch (error) { 
      console.error("Transaction failed:", error); 
      showToast("Sync Failed. Check Connection.", "error");
    }
  };

  const handleAddItem = async (formData) => {
    // 1. Close Modal IMMEDIATELY
    setNewItemModalOpen(false);
    showToast("New Item Added!", "success");

    try { 
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), { ...formData, stockUnit1: 0, stockUnit2: 0 }); 
    } catch (error) { 
      console.error("Error adding item:", error); 
      showToast("Failed to add item", "error");
    }
  };

  const handleAudit = async ({ itemId, diff, actualQty, unit, itemName, operatorName }) => {
    setAuditModalOpen(false);
    showToast("Audit Recorded.", "success");

    try {
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', itemId);
      const fieldToUpdate = unit === 'Unit 1' ? 'stockUnit1' : 'stockUnit2';
      await setDoc(itemRef, { [fieldToUpdate]: actualQty }, { merge: true });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), { type: 'AUDIT', itemName, itemId, qty: diff, unit, notes: `Mismatch corrected. System was off by ${Math.abs(diff)}.`, operatorName, userRole: role, timestamp: serverTimestamp() });
    } catch (error) { console.error(error); showToast("Audit Sync Failed", "error"); }
  };

  const getGroupedItems = () => {
    let filtered = items.filter(i => { if (inventoryCategory === 'Chemical') return i.type === 'Chemical' || i.type === 'Auxiliary'; return i.type === inventoryCategory; });
    if (searchQuery) filtered = filtered.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const groups = {};
    filtered.forEach(item => { const sup = item.supplier || 'Unknown Supplier'; if (!groups[sup]) groups[sup] = []; groups[sup].push(item); });
    return groups;
  };
  const groupedItems = getGroupedItems();

  if (!role) return <LoginScreen onLogin={setRole} authError={authError} onRetry={connectAuth} />;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 md:pb-0 md:pl-64">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="md:fixed md:inset-y-0 md:left-0 md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-30">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center md:block">
          <div><h1 className="font-black text-xl tracking-tight">AL-WARIS <span className="text-blue-500">IMS</span></h1><p className="text-xs text-slate-500 mt-1">{role}</p></div><button onClick={() => setRole(null)} className="md:hidden text-slate-400"><LogOut size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 hidden md:block">
          <button onClick={() => setView('inventory')} className={`w-full flex items-center p-3 rounded-xl transition-colors ${view === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={20} className="mr-3" /> Inventory</button>
          <button onClick={() => setView('logs')} className={`w-full flex items-center p-3 rounded-xl transition-colors ${view === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><History size={20} className="mr-3" /> Logs & Audit</button>
        </nav>
        <div className="p-4 border-t border-slate-800 hidden md:block"><button onClick={() => setRole(null)} className="flex items-center text-slate-400 hover:text-white transition-colors"><LogOut size={16} className="mr-2" /> Switch User</button></div>
      </div>
      <div className="md:hidden bg-white p-2 flex justify-around shadow-sm sticky top-0 z-10"><button onClick={() => setView('inventory')} className={`p-2 rounded-lg font-bold text-sm ${view === 'inventory' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>Inventory</button><button onClick={() => setView('logs')} className={`p-2 rounded-lg font-bold text-sm ${view === 'logs' ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>History</button></div>
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        
        {isInitialLoad ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 animate-in fade-in">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="font-medium animate-pulse">Loading Stock Data...</p>
          </div>
        ) : (
          <>
            {view === 'inventory' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 hidden md:block">Current Stock</h2>
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                    <button onClick={() => setInventoryCategory('Dye')} className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${inventoryCategory === 'Dye' ? 'bg-purple-100 text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><Palette size={16} className="mr-2" /> Dyes</button>
                    <button onClick={() => setInventoryCategory('Chemical')} className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all ${inventoryCategory === 'Chemical' ? 'bg-cyan-100 text-cyan-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><Beaker size={16} className="mr-2" /> Chemicals</button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center"><Search className="text-slate-400 ml-3" size={20} /><input type="text" placeholder={`Search ${inventoryCategory.toLowerCase()}s...`} className="w-full p-3 outline-none text-slate-700 font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                  {(role === 'Director' || role === 'Dye Manager') && (<button onClick={() => setNewItemModalOpen(true)} className="bg-slate-900 text-white px-6 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center"><Plus size={20} className="mr-2" /> <span className="hidden md:inline">New</span></button>)}
                </div>
                <div className="space-y-8">
                  {Object.keys(groupedItems).length === 0 ? (<div className="text-center py-12 text-slate-400"><Package size={48} className="mx-auto mb-4 opacity-20" /><p>No items found in this category.</p></div>) : (
                    Object.entries(groupedItems).map(([supplier, products]) => (
                      <div key={supplier} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center mb-4"><div className="h-px bg-slate-300 flex-1"></div><h3 className="px-4 text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center"><Layers size={14} className="mr-2" /> Supplier: <span className="text-slate-900 ml-1">{supplier}</span></h3><div className="h-px bg-slate-300 flex-1"></div></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {products.map(item => (
                            <div key={item.id} className="relative group">
                              <InventoryCard item={item} role={role} onAction={(itm, type) => { setActiveItem(itm); setActionType(type); setModalOpen(true); }} />
                                {role === 'Director' && (<button onClick={() => { setActiveItem(item); setAuditModalOpen(true); }} className="absolute top-2 right-2 p-2 bg-amber-100 text-amber-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-200" title="Report Mismatch"><ClipboardCheck size={16} /></button>)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {view === 'logs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                        <tr><th className="p-4">Type</th><th className="p-4">Item</th><th className="p-4">Qty</th><th className="p-4">User / Role</th><th className="p-4">Notes</th><th className="p-4">Time</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${log.type === 'IN' ? 'bg-blue-100 text-blue-700' : log.type === 'OUT' ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>{log.type}</span></td>
                            <td className="p-4 font-medium text-slate-900">{log.itemName}</td><td className="p-4 font-bold">{log.qty} ({log.unit})</td>
                            <td className="p-4"><div className="font-bold text-slate-900">{log.operatorName}</div><div className="text-xs text-slate-500">{log.userRole}</div></td>
                            <td className="p-4 text-slate-500 max-w-xs truncate">{log.notes}</td>
                            <td className="p-4 text-slate-400">{log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <ActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={activeItem} type={actionType} onSubmit={handleTransaction} />
      <NewItemModal isOpen={newItemModalOpen} onClose={() => setNewItemModalOpen(false)} onSubmit={handleAddItem} />
      <AuditModal isOpen={auditModalOpen} onClose={() => setAuditModalOpen(false)} item={activeItem} onSubmit={handleAudit} />
    </div>
  );
};

export default App;