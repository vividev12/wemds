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
  const defaultCategory =
    categories.find((c) => c.name.toLowerCase() !== 'todas')?.name || 'PRÉVIAS';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory);
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
      setCategory(defaultCategory);
      setImageUrl('');
      setPrompt('');
      setNotes('');
      setIsFavorite(false);
    }
  }, [initialData, defaultCategory, isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#151515] border-2 border-[#2E2E2E] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-white">
              {isEditing ? 'Editar Referência' : 'Adicionar Nova Referência'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#B5B5B5] mt-1">
              Cadastre a fotografia e associe integralmente o prompt correspondente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#B5B5B5] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5 overflow-y-auto flex-1 pr-1">
          {/* 1. Upload da Foto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                1. Foto de Referência *
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#FFD400] text-[#080808] font-bold'
                      : 'text-[#B5B5B5] hover:text-white bg-[#202020]'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`cursor-pointer px-2.5 py-1 rounded-lg transition-colors ${
                    uploadMode === 'url'
                      ? 'bg-[#FFD400] text-[#080808] font-bold'
                      : 'text-[#B5B5B5] hover:text-white bg-[#202020]'
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
                className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#FFD400] bg-[#FFD400]/10'
                    : imageUrl
                    ? 'border-[#383838] bg-[#0D0D0D]'
                    : 'border-[#2E2E2E] hover:border-[#FFD400]/70 bg-[#101010]'
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
                      className="w-20 h-24 object-cover rounded-lg border border-[#363636]"
                    />
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Foto carregada</p>
                      <p className="text-xs font-medium text-[#B5B5B5] mt-0.5">
                        Clique ou arraste outro arquivo para substituir
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#FFD400] mb-2 stroke-[2]" />
                    <p className="text-sm text-white font-semibold">
                      Clique para escolher a foto ou arraste o arquivo aqui
                    </p>
                    <p className="text-xs text-[#B5B5B5] font-medium mt-1">
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
                  className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none"
                />
                <p className="text-xs font-medium text-[#B5B5B5]">
                  Suporta links de álbuns ou imagens diretas do Imgur, ou qualquer URL HTTPS.
                </p>
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#0D0D0D] rounded-xl border border-[#242424]">
                    <img
                      src={resolveImgurUrl(imageUrl)}
                      alt="Prévia"
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg border border-[#343434]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-left overflow-hidden">
                      <span className="text-xs text-white font-bold block">Imagem pronta</span>
                      <span className="text-xs text-[#B5B5B5] font-mono truncate block">
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
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              2. Título da Fotografia *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ensaio Editorial Alta Costura"
              required
              className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none"
            />
          </div>

          {/* 3. Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                3. Categoria *
              </label>
              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs font-bold text-[#FFD400] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
                  className="flex-1 px-3.5 py-2.5 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-4 py-2.5 bg-[#FFD400] hover:bg-[#FFCC00] text-[#080808] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-3 py-2.5 bg-[#202020] text-[#B5B5B5] hover:text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-semibold text-white outline-none cursor-pointer"
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
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                4. Prompt Completo *
              </label>
              <span className="font-mono text-xs font-medium text-[#B5B5B5] tabular-nums">
                {prompt.length} caracteres
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Cole aqui o prompt integral..."
              required
              className="w-full px-3.5 py-3 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-xs font-mono text-neutral-100 placeholder-[#7A7A7A] outline-none leading-relaxed resize-y"
            />
          </div>

          {/* 5. Notas / Observações (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-[#B5B5B5] mb-1.5">
              Notas adicionais (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ensaio executivo, iluminação suave, lente 85mm"
              className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border-2 border-[#2A2A2A] focus:border-[#FFD400] rounded-xl text-sm font-medium text-white placeholder-[#7A7A7A] outline-none"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-[#262626] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#343434] bg-[#202020] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#FFCC00] active:bg-[#EAB900] text-[#080808] font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Salvar Alterações' : 'Salvar Referência'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
