import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Plus, Check, Link as LinkIcon } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#141414] border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-display flex items-center gap-2">
              <span className="text-[#D4AF37]">✦</span>
              {isEditing ? 'Editar Referência' : 'Adicionar Nova Referência'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadastre a fotografia e associe permanentemente o prompt correspondente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
          {/* 1. Upload da Foto */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                1. Foto de Referência *
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Arquivo do Computador
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`cursor-pointer px-2 py-0.5 rounded transition-colors ${
                    uploadMode === 'url'
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'text-neutral-500 hover:text-neutral-300'
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
                className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : imageUrl
                    ? 'border-[#333333] bg-[#0E0E0E]'
                    : 'border-[#262626] hover:border-[#D4AF37]/60 bg-[#111111]'
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
                      className="w-20 h-24 object-cover rounded-lg border border-[#333333] shadow"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white">Foto carregada</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Clique ou arraste outro arquivo para substituir
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#D4AF37] mb-2 stroke-[1.5]" />
                    <p className="text-xs text-neutral-300 font-medium">
                      Clique para escolher a foto ou arraste o arquivo aqui
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Suporta JPG, PNG, WEBP em alta resolução
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setImageUrl(val);
                  }}
                  placeholder="Link do Imgur ou URL direta (ex: https://i.imgur.com/... ou https://imgur.com/a/...)"
                  className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#2A2A2A] focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-500 outline-none"
                />
                <p className="text-[11px] text-neutral-500">
                  Suporta links de álbuns ou imagens diretas do Imgur, ou qualquer URL HTTPS.
                </p>
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-[#0E0E0E] rounded-lg border border-[#222222]">
                    <img
                      src={resolveImgurUrl(imageUrl)}
                      alt="Prévia"
                      className="w-12 h-16 object-cover rounded border border-[#333333]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-left overflow-hidden">
                      <span className="text-xs text-white font-medium block">Imagem pronta</span>
                      <span className="text-[10px] text-neutral-400 font-mono truncate block">
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
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              2. Título da Fotografia *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ensaio Editorial Alta Costura"
              required
              className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#2A2A2A] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg text-sm text-white placeholder-neutral-600 outline-none"
            />
          </div>

          {/* 3. Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                3. Categoria *
              </label>
              {!isCreatingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Nova Categoria
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
                  className="flex-1 px-3 py-2 bg-[#101010] border border-[#2A2A2A] focus:border-[#D4AF37] rounded-lg text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-3 py-2 bg-[#D4AF37] text-black font-semibold text-xs rounded-lg hover:bg-[#E5C158] cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(false)}
                  className="px-2.5 py-2 bg-[#222222] text-neutral-400 hover:text-white text-xs rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101010] border border-[#2A2A2A] focus:border-[#D4AF37] rounded-lg text-sm text-white outline-none cursor-pointer"
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

          {/* 4. Campo de Texto Grande para o Prompt Completo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                4. Prompt Completo *
              </label>
              <span className="font-mono text-[11px] text-neutral-500">
                {prompt.length} caracteres
              </span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Cole aqui o prompt integral (aceita prompts longos, múltiplos parágrafos, comandos como --ar 3:4, --v 6.1, --style raw, tags técnicas de iluminação e câmera)..."
              required
              className="w-full px-3.5 py-3 bg-[#0E0E0E] border border-[#2A2A2A] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs font-mono text-neutral-200 placeholder-neutral-600 outline-none leading-relaxed resize-y"
            />
          </div>

          {/* 5. Notas / Observações de Uso (Opcional) */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Notas adicionais (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Ensaio executivo, iluminação Rembrandt, lente 85mm"
              className="w-full px-3.5 py-2 bg-[#101010] border border-[#2A2A2A] focus:border-[#D4AF37] rounded-lg text-xs text-white placeholder-neutral-600 outline-none"
            />
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#2A2A2A] text-neutral-300 hover:text-white hover:bg-[#1A1A1A] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] active:bg-[#C5A028] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'SALVAR ALTERAÇÕES' : 'SALVAR REFERÊNCIA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
