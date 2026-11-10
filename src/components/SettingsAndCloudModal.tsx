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
    if (confirm('Tem certeza? Isso restaurará as referências e categorias padrão do catálogo.')) {
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
        className="relative w-full max-w-3xl bg-[#151515] border-2 border-[#2E2E2E] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD400]/15 border-2 border-[#FFD400]/45 flex items-center justify-center text-[#FFD400]">
              <Database className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight">
                Configurações &amp; Nuvem
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] mt-0.5">
                Gerencie integração Supabase, categorias, segurança e backups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#B5B5B5] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#262626] px-6 bg-[#0D0D0D] overflow-x-auto scrollbar-none gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'cloud'
                ? 'border-[#FFD400] text-[#FFD400]'
                : 'border-transparent text-[#B5B5B5] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 stroke-[2]" />
            <span>Nuvem (Supabase)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'backup'
                ? 'border-[#FFD400] text-[#FFD400]'
                : 'border-transparent text-[#B5B5B5] hover:text-white'
            }`}
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Backup &amp; Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#FFD400] text-[#FFD400]'
                : 'border-transparent text-[#B5B5B5] hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4 stroke-[2]" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#FFD400] text-[#FFD400]'
                : 'border-transparent text-[#B5B5B5] hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 stroke-[2]" />
            <span>Segurança Admin</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SUPABASE */}
          {activeTab === 'cloud' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#0B0B0B] rounded-xl border border-[#262626]">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Como conectar seu banco de dados Supabase
                </h3>
                <ol className="text-xs sm:text-sm font-medium text-[#B5B5B5] mt-2.5 space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>
                    Crie uma conta em{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFD400] font-bold underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3.5 h-3.5" />
                    </a>{' '}
                    e crie um novo projeto.
                  </li>
                  <li>No menu lateral do Supabase, acesse <strong className="text-white">SQL Editor</strong> e execute o script abaixo.</li>
                  <li>Em <strong className="text-white">Project Settings → API</strong>, copie a <strong className="text-white">URL</strong> e <strong className="text-white">anon public key</strong>.</li>
                  <li>Salve as credenciais abaixo para sincronização futura entre dispositivos.</li>
                </ol>
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseConfig.url}
                    onChange={(e) =>
                      setSupabaseConfig({ ...supabaseConfig, url: e.target.value })
                    }
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={(e) =>
                      setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })
                    }
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-xs font-mono text-white placeholder-[#7A7A7A] outline-none"
                  />
                </div>

                {saveStatus && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#7CFF8E]">
                    <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs font-medium text-[#B5B5B5]">
                    Sem conexão ativa, todas as referências permanecem salvas localmente no navegador.
                  </p>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Save className="w-4 h-4 stroke-[2.2]" />
                    Salvar Credenciais
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-[#262626]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Script SQL para criar as tabelas no Supabase
                  </span>
                  <button
                    type="button"
                    onClick={copySql}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#FFD400] hover:underline cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>SQL Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Código SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 bg-[#0B0B0B] rounded-xl border border-[#242424] text-xs font-mono text-[#B5B5B5] overflow-x-auto max-h-40 leading-relaxed">
                  {sqlScript}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & EXPORTAR */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0B0B0B] rounded-xl border border-[#262626] space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">
                  Backup e Portabilidade do Catálogo
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] leading-relaxed">
                  Exporte todo o catálogo (fotografias, títulos, categorias e prompts integrais) em um único arquivo JSON para backup ou restauração.
                </p>
              </div>

              {backupStatus && (
                <div className="p-3.5 bg-[#14351A] border border-[#39C94A] rounded-xl text-xs sm:text-sm font-semibold text-[#7CFF8E] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2]" />
                  <span>{backupStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0D0D0D] border border-[#262626] rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#FFD400] stroke-[2.2]" />
                      Exportar Catálogo
                    </h4>
                    <p className="text-xs font-medium text-[#B5B5B5] mt-1.5">
                      Gera um arquivo .json seguro com todas as referências cadastradas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="mt-4 w-full py-2.5 px-4 bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 stroke-[2.2]" />
                    Baixar Backup (.JSON)
                  </button>
                </div>

                <div className="p-4 bg-[#0D0D0D] border border-[#262626] rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#FFD400] stroke-[2.2]" />
                      Restaurar Backup
                    </h4>
                    <p className="text-xs font-medium text-[#B5B5B5] mt-1.5">
                      Carregue um arquivo .json salvo anteriormente para restaurar os registros.
                    </p>
                  </div>
                  <label className="mt-4 w-full py-2.5 px-4 bg-[#202020] hover:bg-[#2A2A2A] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 border border-[#363636]">
                    <Upload className="w-4 h-4 stroke-[2.2]" />
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

              <div className="pt-4 border-t border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Restaurar referências padrão</h4>
                  <p className="text-xs font-medium text-[#B5B5B5]">
                    Recarrega o acervo fotográfico e categorias originais do We Media.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 border border-[#363636] hover:border-red-500/70 text-xs font-bold text-[#B5B5B5] hover:text-red-400 rounded-xl cursor-pointer transition-colors self-start sm:self-auto"
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
                  placeholder="Nome da nova categoria..."
                  className="flex-1 px-3.5 py-2.5 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCatName.trim()) {
                      onAddCategory(newCatName.trim());
                      setNewCatName('');
                    }
                  }}
                  className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  + Adicionar
                </button>
              </div>

              <div className="border border-[#262626] rounded-xl overflow-hidden divide-y divide-[#222222]">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-4 py-3 bg-[#0D0D0D] text-xs sm:text-sm"
                  >
                    <span className="font-semibold text-white">{cat.name}</span>
                    <div className="flex items-center gap-2.5">
                      {cat.isCustom ? (
                        <>
                          <span className="text-xs text-[#FFD400] uppercase tracking-wider font-bold">
                            Personalizada
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(cat.id)}
                            className="p-1.5 text-[#B5B5B5] hover:text-red-400 cursor-pointer transition-colors"
                            title="Remover categoria personalizada"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2]" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-[#B5B5B5] uppercase tracking-wider font-semibold">
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
              <div className="p-4 bg-[#0B0B0B] rounded-xl border border-[#262626]">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#FFD400] stroke-[2]" />
                  Alterar Senha do Administrador
                </h3>
                <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] mt-1.5">
                  Defina uma nova senha para proteger o cadastro, edição e exclusão de referências.
                </p>
              </div>

              <form onSubmit={handleChangePin} className="space-y-3.5 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#0B0B0B] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white outline-none"
                  />
                </div>

                {pinMessage && (
                  <p className="text-xs sm:text-sm font-bold text-[#FFD400]">{pinMessage}</p>
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
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
