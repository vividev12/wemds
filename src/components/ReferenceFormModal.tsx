import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Check } from 'lucide-react';
import { PhotoReference, Category } from '../types';
import { resolveImgurUrl } from '../services/storage';

interface ReferenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (refData: Omit<PhotoReference, 'id' | 'createdAt'>) => void;
  onUpdate?: (id: string, refData: Partial<PhotoReference>) => void;
  initialData?: PhotoReference | null;
  categories: Category[];
  onAddNewCategory: (name: string) => Category;
}

export const ReferenceFormModal: React.FC<ReferenceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialData,
  categories,
  onAddNewCategory,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Feminino');
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // New category inline creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Image upload state
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setImageUrl(initialData.imageUrl);
      setPrompt(initialData.prompt);
      setNotes(initialData.notes || '');
      setIsFavorite(initialData.isFavorite || false);
    } else {
      setTitle('');
      setCategory(categories[1]?.name || 'Feminino');
      setImageUrl('');
      setPrompt('');
      setNotes('');
      setIsFavorite(false);
    }
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const created = onAddNewCategory(newCategoryName.trim());
    setCategory(created.name);
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o título da fotografia.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Por favor, adicione uma foto de referência (upload ou URL).');
      return;
    }
    if (!prompt.trim()) {
      alert('Por favor, insira o prompt completo para esta referência.');
      return;
    }

    if (initialData && onUpdate) {
      onUpdate(initialData.id, {
        title: title.trim(),
        category,
        imageUrl: imageUrl.trim(),
        prompt: prompt.trim(),
        notes: notes.trim(),
        isFavorite,
      });
    } else {
      onSave({
        title: title.trim(),
        category,
        imageUrl: imageUrl.trim(),
        prompt: prompt.trim(),
        notes: notes.trim(),
        isFavorite,
      });
    }
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#050505]/88 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121212] border border-[#242424] rounded-xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E1E1E]">
          <div>
            <h2 className="font-display text-2xl font-normal text-[#EAE7E0]">
              {isEditing ? 'Editar Referência' : 'Adicionar Nova Referência'}
            </h2>
            <p className="text-xs font-light text-[#929292] mt-1">
              Cadastre a fotografia e associe integralmente o prompt correspondente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#929292] hover:text-[#EAE7E0] hover:bg-[#1B1B1B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5 overflow-y-auto flex-1 pr-1">
          {/* 1. Upload da Foto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-light text-[#EAE7E0] uppercase tracking-[0.12em]">
                1. Foto de Referência *
              </label>
              <div className="flex items-center gap-2 text-xs font-light">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#C6A75E]/15 text-[#D5BD83]'
                      : 'text-[#929292] hover:text-[#EAE7E0]'
                  }`}
                >
                  Arquivo do Computador
                </button>
                <span className="text-[#454545]">·</span>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
                    uploadMode === 'url'
                      ? 'bg-[#C6A75E]/15 text-[#D5BD83]'
                      : 'text-[#929292] hover:text-[#EAE7E0]'
                  }`}
                >
                  URL da Web
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#C6A75E] bg-[#C6A75E]/10'
                    : imageUrl
                    ? 'border-[#2E2E2E] bg-[#0A0A0A]'
                    : 'border-[#262626] hover:border-[#C6A75E]/50 bg-[#0D0D0D]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={imageUrl}
                      alt="Prévia"
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover rounded border border-[#2C2C2C]"
                    />
                    <div className="text-left">
                      <p className="text-xs font-normal text-[#EAE7E0]">Foto carregada</p>
                      <p className="text-[11px] font-light text-[#929292] mt-0.5">
                        Clique ou arraste outro arquivo para substituir
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-7 h-7 text-[#C6A75E] mb-2 stroke-[1.25]" />
                    <p className="text-xs text-[#EAE7E0] font-light">
                      Clique para escolher a foto ou arraste o arquivo aqui
                    </p>
                    <p className="text-[11px] text-[#6E6E6E] font-light mt-1">
                      Suporta JPG, PNG e WEBP em alta resolução
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Link do Imgur ou URL direta (ex: https://i.imgur.com/...)"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-xs font-light text-[#EAE7E0] placeholder-[#5F5F5F] outline-none"
                />
                <p className="text-[11px] font-light text-[#7A7A7A]">
                  Suporta links de álbuns ou imagens diretas do Imgur, ou qualquer URL HTTPS.
                </p>
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#0A0A0A] rounded-md border border-[#1E1E1E]">
                    <img
                      src={resolveImgurUrl(imageUrl)}
                      alt="Prévia"
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded border border-[#282828]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-left overflow-hidden">
                      <span className="text-xs text-[#EAE7E0] font-normal block">Imagem pronta</span>
                      <span className="text-[10px] text-[#929292] font-mono truncate block">
                        {resolveImgurUrl(imageUrl)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Título da Fotografia */}
          <div>
            <label className="block text-[11px] font-light text-[#EAE7E0] uppercase tracking-[0.12em] mb-1.5">
              2. Título da Fotografia *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ensaio Editorial Alta Costura"
              required
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-sm font-light text-[#EAE7E0] placeholder-[#5F5F5F] outline-none"
            />
          </div>

          {/* 3. Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-light text-[#EAE7E0] uppercase tracking-[0.12em]">
                3. Categoria *
              </label>
              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs font-light text-[#D5BD83] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Nova Categoria</span>
                </button>
              ) : null}
            </div>

            {isCreatingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria..."
                  className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-xs font-light text-[#EAE7E0] outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-3 py-2 bg-[#C6A75E] text-[#0A0A0A] font-medium text-xs rounded-md hover:bg-[#D5BD83] cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-2.5 py-2 bg-[#1B1B1B] text-[#929292] hover:text-[#EAE7E0] text-xs font-light rounded-md cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-sm font-light text-[#EAE7E0] outline-none cursor-pointer"
              >
                {categories
                  .filter((c) => c.name.toLowerCase() !== 'todas')
                  .map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* 4. Prompt Completo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-light text-[#EAE7E0] uppercase tracking-[0.12em]">
                4. Prompt Completo *
              </label>
              <span className="font-mono text-[11px] font-light text-[#7A7A7A] tabular-nums">
                {prompt.length} caracteres
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Cole aqui o prompt integral..."
              required
              className="w-full px-3.5 py-3 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-xs font-mono font-light text-[#EAE7E0] placeholder-[#5F5F5F] outline-none leading-relaxed resize-y"
            />
          </div>

          {/* 5. Notas / Observações de Uso (Opcional) */}
          <div>
            <label className="block text-xs font-light text-[#929292] mb-1">
              Notas adicionais (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ensaio executivo, iluminação suave, lente 85mm"
              className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] focus:border-[#C6A75E]/60 rounded-md text-xs font-light text-[#EAE7E0] placeholder-[#5F5F5F] outline-none"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-[#1E1E1E] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md border border-[#242424] text-[#929292] hover:text-[#EAE7E0] hover:bg-[#181818] text-xs font-light transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-[#C6A75E] hover:bg-[#D5BD83] active:bg-[#B2934B] text-[#0A0A0A] font-medium text-xs uppercase tracking-[0.1em] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2]" />
              <span>{isEditing ? 'Salvar Alterações' : 'Salvar Referência'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
