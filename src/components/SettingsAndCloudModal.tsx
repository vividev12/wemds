import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Key,
  FolderPlus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Category, SupabaseConfig } from '../types';
import { storageService } from '../services/storage';

interface SettingsAndCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onReloadData: () => void;
}

export const SettingsAndCloudModal: React.FC<SettingsAndCloudModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  onReloadData,
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'backup' | 'categories' | 'security'>('cloud');

  // Supabase states
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() =>
    storageService.getSupabaseConfig()
  );
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Category state
  const [newCatName, setNewCatName] = useState('');

  // Security state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Backup state
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSupabaseConfig(supabaseConfig);
    setSaveStatus('Configurações salvas localmente com sucesso!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleExportBackup = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `we-media-catalogo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBackupStatus('Backup JSON exportado com sucesso!');
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importBackup(content);
      if (res.success) {
        setBackupStatus(`Sucesso! ${res.count} referências restauradas.`);
        onReloadData();
      } else {
        setBackupStatus(`Erro ao importar: ${res.error}`);
      }
      setTimeout(() => setBackupStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setPinMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage('As senhas não coincidem.');
      return;
    }
    storageService.setNewAdminPin(newPin);
    setPinMessage('Senha de Administrador alterada com sucesso!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinMessage(null), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm('Tem certeza? Isso restaurará as referências e categorias de demonstração padrão.')) {
      storageService.resetToDefault();
      onReloadData();
      alert('Catálogo restaurado para as referências padrão.');
    }
  };

  const sqlScript = `-- SQL para Supabase (Execute no SQL Editor do seu projeto Supabase)
-- 1. Tabela de Categorias
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  is_custom boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Referências & Prompts
create table if not exists public.photo_references (
  id text primary key,
  title text not null,
  category text not null,
  image_url text not null,
  prompt text not null,
  notes text,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone
);

-- 3. Habilitar RLS (Row Level Security) e permitir leitura pública
alter table public.photo_references enable row level security;
alter table public.categories enable row level security;

create policy "Permitir leitura publica de referencias" on public.photo_references for select using (true);
create policy "Permitir leitura publica de categorias" on public.categories for select using (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#141414] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Configurações &amp; Nuvem
              </h2>
              <p className="text-xs text-neutral-400">
                Gerencie persistência em nuvem (Supabase), categorias, segurança e backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#222222] px-6 bg-[#0E0E0E] overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Nuvem (Supabase)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup &amp; Exportar</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Segurança Admin</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#222222]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#D4AF37]">✦</span> Como conectar seu banco de dados Supabase
                </h3>
                <ol className="text-xs text-neutral-400 mt-2 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>
                    Crie uma conta gratuita em{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    e crie um novo projeto.
                  </li>
                  <li>No menu lateral do Supabase, clique em <strong>SQL Editor</strong> e cole o script abaixo.</li>
                  <li>Vá em <strong>Project Settings → API</strong> e copie sua <strong>URL</strong> e <strong>anon public key</strong>.</li>
                  <li>Cole as credenciais nos campos abaixo para sincronização automática entre múltiplos dispositivos.</li>
                </ol>
              </div>

              {/* Form de credenciais Supabase */}
              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) =>
                      setSupabaseConfig({ ...supabaseConfig, url: e.target.value })
                    }
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#262626] focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={(e) =>
                      setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#262626] focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-600 outline-none font-mono"
                  />
                </div>

                {saveStatus && (
                  <div className="flex items-center gap-1.5 text-xs text-[#55D833]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-neutral-500">
                    * Sem Supabase, todas as referências ficam permanentemente seguras no armazenamento local do navegador.
                  </p>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Credenciais
                  </button>
                </div>
              </form>

              {/* Script SQL para copiar */}
              <div className="pt-3 border-t border-[#222222]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Script SQL para criar as tabelas no Supabase
                  </span>
                  <button
                    onClick={copySql}
                    className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>SQL Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#0A0A0A] rounded-xl border border-[#222222] text-[11px] font-mono text-neutral-400 overflow-x-auto max-h-40 leading-relaxed">
                  {sqlScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & EXPORTAR */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#222222] space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Backup e Portabilidade do Catálogo
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Exporte todo o seu catálogo particular (fotos, títulos, categorias e prompts integrais) em um único arquivo JSON. Você pode salvar uma cópia no seu computador ou restaurar em outro dispositivo a qualquer momento.
                </p>
              </div>

              {backupStatus && (
                <div className="p-3 bg-[#112411] border border-[#226322] rounded-lg text-xs text-[#62DF43] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{backupStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Exportar */}
                <div className="p-4 bg-[#101010] border border-[#222222] rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#D4AF37]" />
                      Exportar Catálogo
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Gera um arquivo .json seguro com todas as referências cadastradas.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="mt-4 w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Backup (.JSON)
                  </button>
                </div>

                {/* Importar */}
                <div className="p-4 bg-[#101010] border border-[#222222] rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      Restaurar Backup
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Carregue um arquivo .json salvo anteriormente para restaurar referências.
                    </p>
                  </div>
                  <label className="mt-4 w-full py-2.5 px-4 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 border border-[#333333]">
                    <Upload className="w-4 h-4" />
                    Selecionar Arquivo .JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to defaults */}
              <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300">Restaurar referências padrão</h4>
                  <p className="text-[11px] text-neutral-500">
                    Recarrega as 8 referências fotográficas originais de fábrica do WE MEDIA.
                  </p>
                </div>
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 border border-[#333333] hover:border-red-800 text-xs text-neutral-400 hover:text-red-400 rounded-lg cursor-pointer"
                >
                  Restaurar Padrão
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIAS */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nome de uma nova categoria (ex: Gastronomia, Automotivo)..."
                  className="flex-1 px-3.5 py-2.5 bg-[#0E0E0E] border border-[#262626] focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-600 outline-none"
                />
                <button
                  onClick={() => {
                    if (newCatName.trim()) {
                      onAddCategory(newCatName.trim());
                      setNewCatName('');
                    }
                  }}
                  className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  + Adicionar Categoria
                </button>
              </div>

              <div className="border border-[#222222] rounded-xl overflow-hidden divide-y divide-[#1F1F1F]">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#101010] text-xs"
                  >
                    <span className="font-medium text-neutral-200">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      {cat.isCustom ? (
                        <>
                          <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-mono">
                            Personalizada
                          </span>
                          <button
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                            title="Remover categoria personalizada"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                          Padrão
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEGURANÇA ADMIN */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0A0A0A] rounded-xl border border-[#222222]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                  Alterar Senha do Administrador
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Defina uma nova senha para proteger o cadastro, edição e exclusão de referências fotográficas.
                </p>
              </div>

              <form onSubmit={handleChangePin} className="space-y-3.5 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#262626] focus:border-[#D4AF37] rounded-lg text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0E0E0E] border border-[#262626] focus:border-[#D4AF37] rounded-lg text-xs text-white outline-none"
                  />
                </div>

                {pinMessage && (
                  <p className="text-xs text-[#D4AF37]">{pinMessage}</p>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Atualizar Senha
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
