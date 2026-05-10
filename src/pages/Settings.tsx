import React from 'react';
import { 
  Settings as SettingsIcon, Shield, User, Bell, Database, HardDrive, Key, LogOut, Plus, Trash2, 
  Copy, Eye, EyeOff, Check, AlertCircle, Terminal, Smartphone, Laptop, Monitor, Tablet, 
  Globe, Activity, Lock, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { ApiKey, RegisteredDevice } from '../types';

export const Settings = () => {
  const { user, logout } = useAuthStore();
  const [activeSection, setActiveSection] = React.useState('Profile Security');
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = React.useState(false);
  
  const [devices, setDevices] = React.useState<RegisteredDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = React.useState(false);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState('');
  const [newKeyDesc, setNewKeyDesc] = React.useState('');
  const [showKeyForm, setShowKeyForm] = React.useState(false);
  const [visibleKeys, setVisibleKeys] = React.useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // API Keys Sync
  React.useEffect(() => {
    if (!user?.tenantId || activeSection !== 'API Management') return;
    setIsLoadingKeys(true);
    // Mock data
    setApiKeys([]);
    setIsLoadingKeys(false);
  }, [user?.tenantId, activeSection]);

  // Devices Sync
  React.useEffect(() => {
    if (!user?.tenantId || activeSection !== 'Registered Devices') return;
    setIsLoadingDevices(true);
    // Mock data
    setDevices([]);
    setIsLoadingDevices(false);
  }, [user?.tenantId, activeSection]);

  const addCurrentDevice = async () => {
    console.log('Registering device...');
  };

  const removeDevice = async (deviceId: string) => {
    console.log('Removing device:', deviceId);
  };

  const generateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Generating API Key...');
  };

  const revokeKey = async (keyId: string) => {
    console.log('Revoking key:', keyId);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderApiKeyManagement = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 leading-none">API Key Access Control</h3>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">Manage programmatic access tokens for external integrations</p>
          </div>
          <button 
            onClick={() => setShowKeyForm(!showKeyForm)}
            className="bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
          >
            {showKeyForm ? 'CANCEL' : <><Plus className="w-3 h-3" /> GENERATE NEW KEY</>}
          </button>
        </div>

        {showKeyForm && (
          <form onSubmit={generateApiKey} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Key Name</label>
                <input 
                  type="text" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Lab Integration Service" 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Description</label>
                <input 
                  type="text" 
                  value={newKeyDesc}
                  onChange={(e) => setNewKeyDesc(e.target.value)}
                  placeholder="Provide context for this key's usage" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-2 focus:ring-blue-500/10 outline-none" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isGenerating}
                className="bg-blue-600 text-white px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isGenerating ? 'GENERATING...' : 'FINALIZE & DEPLOY'}
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-100">
          {isLoadingKeys ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : apiKeys.length > 0 ? (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-6 space-y-4 hover:bg-slate-50/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-none flex items-center gap-2">
                       {apiKey.name}
                       <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px] font-bold uppercase tracking-tighter">Active</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">{apiKey.description || 'No description provided.'}</p>
                  </div>
                  <button 
                    onClick={() => revokeKey(apiKey.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type={visibleKeys[apiKey.id] ? "text" : "password"} 
                      value={apiKey.key} 
                      readOnly 
                      className="w-full pl-10 pr-10 py-2 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-600 select-all outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {visibleKeys[apiKey.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {copiedKey === apiKey.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3" />
                    CREATED: {new Date(apiKey.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3 h-3" />
                    LAST USED: {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString() : 'NEVER'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <Key className="w-12 h-12 text-slate-200 mx-auto opacity-50" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Service Identifiers Found</p>
              <p className="text-[9px] text-slate-400 lowercase italic">Generate a key to begin external data instrumentation</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
         <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
         <div>
            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-tight">Security Warning</p>
            <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5">
              API keys provide full clinical data access within your tenant scope. Treat them as sensitive as professional credentials. Never commit keys to version control.
            </p>
         </div>
      </div>
    </div>
  );

  const renderDeviceManagement = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 leading-none">Registered Hardware Inventory</h3>
            <p className="text-[9px] text-slate-400 mt-1 uppercase font-mono">Monitor authorized access points and device telemetry</p>
          </div>
          <button 
            onClick={addCurrentDevice}
            className="bg-slate-900 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Smartphone className="w-3 h-3" /> REGISTER CURRENT DEVICE
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoadingDevices ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ) : devices.length > 0 ? (
            devices.map((device) => (
              <div key={device.id} className="p-6 hover:bg-slate-50/30 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center border",
                    device.isTrusted ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}>
                    {device.type === 'Mobile' ? <Smartphone className="w-6 h-6" /> : 
                     device.type === 'Tablet' ? <Tablet className="w-6 h-6" /> : 
                     <Laptop className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm leading-none">{device.name}</h4>
                      {device.isTrusted && (
                        <span className="flex items-center gap-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-100 px-1 rounded">
                          <Shield className="w-2 h-2" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium italic">
                          <Globe className="w-3 h-3" /> {device.browser} • {device.os}
                       </span>
                       <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium italic">
                          <Activity className="w-3 h-3" /> {device.lastIp}
                       </span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-300 mt-1 uppercase">Owner: {device.userName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</p>
                      <p className="text-[10px] font-mono text-slate-600">{new Date(device.lastSeen).toLocaleString()}</p>
                   </div>
                   <button 
                     onClick={() => removeDevice(device.id)}
                     className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                     title="Revoke Permission"
                   >
                     <LogOut className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <Monitor className="w-12 h-12 text-slate-200 mx-auto opacity-50" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Registered Hardware Nodes Detected</p>
              <button 
                onClick={addCurrentDevice}
                className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
              >
                Enroll Current Interface
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-slate-900 text-white overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Lock className="w-32 h-32" />
         </div>
         <div className="p-6 relative z-10">
            <h3 className="font-bold text-sm uppercase tracking-widest mb-2">Endpoint Security Enforcement</h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
               All hardware accessing the Medical Core must be explicitly registered. Unrecognized endpoints will be automatically challenged with multi-factor verification protocols to ensure clinical data integrity.
            </p>
            <div className="mt-6 flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                  ))}
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">128-bit Encryption Active</span>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">System Variables</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Tenant Configuration & Security Protocols</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border-r border-slate-50 pr-4 space-y-1">
          {[
            { label: 'Profile Security', icon: User, roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 'STAFF', 'MANAGER', 'ACCOUNTS_OFFICER'] },
            { label: 'Access Control', icon: Shield, roles: ['ADMIN', 'MANAGER'] },
            { label: 'Registered Devices', icon: Smartphone, roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'TECHNICIAN', 'RECEPTIONIST', 'STAFF', 'MANAGER', 'ACCOUNTS_OFFICER'] },
            { label: 'API Management', icon: Key, roles: ['ADMIN', 'MANAGER'] },
            { label: 'Alert Protocols', icon: Bell, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'MANAGER'] },
            { label: 'Database Sync', icon: Database, roles: ['ADMIN'] },
            { label: 'Infrastructure', icon: HardDrive, roles: ['ADMIN'] },
          ].filter(item => item.roles.includes(user?.role || '')).map((item, i) => (
            <button 
              key={i} 
              onClick={() => setActiveSection(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all",
                item.label === activeSection ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}

          <div className="pt-8 px-2">
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest hover:underline"
            >
              <LogOut className="w-4 h-4" />
              Logout Session
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'API Management' ? renderApiKeyManagement() : 
           activeSection === 'Registered Devices' ? renderDeviceManagement() : (
            <div className="space-y-6">
              <div className="card">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Personnel Profile</h3>
                </div>
                <div className="p-6 space-y-6">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                         <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-lg font-bold text-slate-900">{user?.name}</h4>
                         <div className="flex gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-widest">Rank: {user?.role}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest">ID: {user?.uid.slice(0, 8)}</span>
                         </div>
                         <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Update Identification</button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Email</label>
                         <input type="text" value={user?.email} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-500" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tenant Authority</label>
                         <input type="text" value={user?.tenantId} readOnly className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-500" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="card">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Security Clearance</h3>
                </div>
                <div className="p-6 space-y-4">
                   <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded bg-rose-100 text-rose-600">
                            <Key className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-xs font-bold text-rose-900">Emergency Override Protocol</h4>
                            <p className="text-[10px] text-rose-700 mt-0.5 font-medium">Bypass standard RBAC for emergency triage situations.</p>
                         </div>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 rounded-full cursor-not-allowed" />
                   </div>

                   <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-xs font-bold text-slate-800">Biometric Authentication</h4>
                            <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Status: Inactive (Secondary Node Required)</p>
                         </div>
                         <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Configure</button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-xs font-bold text-slate-800">API Access Point</h4>
                            <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Token: MED-CORE-***************</p>
                         </div>
                         <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Rotate Key</button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
