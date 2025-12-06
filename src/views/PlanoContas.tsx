
import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Input, Select, Badge } from '../components/ui';
import { Category, TransactionType, Nature, AccountType } from '../types';
import { Plus, Edit2, Archive, CheckCircle, FolderTree, Download, ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { exportToCSV } from '../services/export';

export const PlanoContas: React.FC = () => {
  const { categories, addCategory, updateCategory, toggleCategoryStatus, categoriesOrigin } = useFinance();
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // State for expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Split form data to manage Code and Name separately
  const [formData, setFormData] = useState<{ code: string; name: string; type: TransactionType; group: string }>({
    code: '',
    name: '',
    type: TransactionType.EXPENSE,
    group: '',
  });
  const [formErrors, setFormErrors] = useState<{ code?: string; name?: string; group?: string }>({});

  // Helper to extract clean name if it contains the code (Legacy support)
  const getCleanName = (cat: Category) => {
    const prefix = cat.code || cat.id;
    if (cat.name.startsWith(prefix)) {
      return cat.name.substring(prefix.length).replace(/^[ -]+/, '').trim();
    }
    return cat.name;
  };

  const handleEdit = (cat: Category) => {
    if (cat.isEditable === false) return;
    setIsEditing(cat);
    // Infer group from ID/Code if not set explicitly
    const effectiveId = cat.code || cat.id;
    const inferredGroup = cat.group || (effectiveId.includes('.') ? effectiveId.split('.').slice(0, -1).join('.') : '');

    setFormData({
      code: effectiveId,
      name: getCleanName(cat),
      type: cat.type,
      group: inferredGroup
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.code || String(formData.code).trim() === '') errors.code = 'Informe o código';
    if (!formData.name || String(formData.name).trim() === '') errors.name = 'Informe o nome';
    const codeRegex = /^\d+(?:\.\d+)*$/;
    if (formData.code && !codeRegex.test(formData.code)) errors.code = 'Código deve ser números separados por ponto (ex: 1.1.01)';
    if (formData.group && !formData.code.startsWith(formData.group + '.')) errors.group = 'Código deve começar com o grupo selecionado';

    const fullName = `${formData.code} - ${formData.name}`;

    // Check existence using code, not ID (since ID is backend auto-inc)
    const exists = categories.some(c => (c.code === formData.code || c.id === formData.code) && c.id !== isEditing?.id);
    if (exists) errors.code = 'Já existe uma categoria com este código';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Helper to derive properties
    const deriveProps = (code: string, type: TransactionType) => {
      const root = code.split('.')[0];
      let accountType = AccountType.DESPESA_OPERACIONAL;
      switch (root) {
        case '1': accountType = AccountType.RECEITA; break;
        case '2': accountType = AccountType.CUSTO; break;
        case '3': accountType = AccountType.DESPESA_OPERACIONAL; break;
        case '4': accountType = AccountType.DESPESA_FINANCEIRA; break;
        case '5': accountType = AccountType.OPERACAO_PATRIMONIAL; break;
        case '8': accountType = AccountType.MOVIMENTACAO_COMPLEMENTAR; break;
        case '9': accountType = AccountType.OPERACAO_PERMUTATIVA; break;
      }
      return {
        nature: type === TransactionType.INCOME ? Nature.CREDIT : Nature.DEBIT,
        level: code.split('.').length,
        side: type === TransactionType.INCOME ? 'RECEITA' : 'DESPESA/CUSTO' as any,
        accountType,
        sortOrder: code.split('.').reduce((acc, part) => acc * 100 + Math.min(parseInt(part.replace(/\D/g, '') || '0', 10), 99), 0)
      };
    };

    const props = deriveProps(formData.code, formData.type);

    if (isEditing) {
      if (isEditing.isEditable === false) {
        alert('Esta conta é padrão do sistema e não pode ser editada.');
        return;
      }
      const res = await updateCategory({
        ...isEditing,
        // We don't change ID, but we update name which contains the code
        name: fullName,
        type: formData.type,
        group: formData.group,
        parentCode: formData.group || null,
        isSystem: false,
        isEditable: true,
        canDelete: true,
        ...props
      });
      if (!res.ok) {
        const mapped: typeof formErrors = {};
        (res.errors || []).forEach((err: any) => { if (err.field && err.message) (mapped as any)[err.field] = err.message; });
        setFormErrors(mapped);
        return;
      }
      setIsEditing(null);
      setShowModal(false);
    } else {
      const res = await addCategory({
        id: formData.code, // Ideally backend ignores this and uses auto-inc, but we send it for consistency in frontend optimistic updates if needed
        name: fullName,
        type: formData.type,
        isActive: true,
        group: formData.group,
        parentCode: formData.group || null,
        isSystem: false,
        isEditable: true,
        canDelete: true,
        ...props
      });
      if (!res.ok) {
        const mapped: typeof formErrors = {};
        (res.errors || []).forEach((err: any) => { if (err.field && err.message) (mapped as any)[err.field] = err.message; });
        setFormErrors(mapped);
        return;
      }
      setShowModal(false);
    }
    setFormData({ code: '', name: '', type: TransactionType.EXPENSE, group: '' });
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(null);
    setFormData({ code: '', name: '', type: TransactionType.EXPENSE, group: '' });
    setShowModal(false);
  };

  const getDepth = (codeOrId: string) => codeOrId.split('.').length - 1;

  // Sort categories naturally using CODE
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const codeA = a.code || a.id;
      const codeB = b.code || b.id;
      return codeA.localeCompare(codeB, undefined, { numeric: true });
    });
  }, [categories]);

  // Expand all groups initially or when categories change significantly
  useEffect(() => {
    // Optional: Auto-expand top levels
    const topLevels = sortedCategories.filter(c => getDepth(c.code || c.id) < 1).map(c => c.id);
    setExpandedGroups(prev => {
      const next = new Set(prev);
      topLevels.forEach(id => next.add(id));
      return next;
    });
  }, [categories.length]); // Simple dependency to trigger on load

  const groupOptions = useMemo(() => {
    return sortedCategories.map(c => ({
      value: c.code || c.id, // Use code for grouping selection
      label: `${c.code || c.id} - ${getCleanName(c)}`
    }));
  }, [sortedCategories]);

  const getCategoryNature = (cat: Category) => {
    const effectiveId = cat.code || cat.id;
    const hasChildren = sortedCategories.some(c => {
      const cCode = c.code || c.id;
      return cCode.startsWith(effectiveId + '.');
    });
    return hasChildren ? 'Sintética' : 'Analítica';
  };

  const handleExport = () => {
    exportToCSV<Category>(
      sortedCategories,
      [
        { header: 'Código', key: (item) => item.code || item.id },
        { header: 'Nome', key: (item: Category) => getCleanName(item) },
        { header: 'Tipo', key: 'type' },
        { header: 'Grupo Pai', key: (item: Category) => item.group || '' },
        { header: 'Classificação', key: (item: Category) => getCategoryNature(item) },
        { header: 'Status', key: (item: Category) => item.isActive ? 'Ativo' : 'Inativo' }
      ],
      'Plano_de_Contas'
    );
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter visible categories based on expanded groups
  const visibleCategories = useMemo(() => {
    return sortedCategories.filter(cat => {
      const effectiveId = cat.code || cat.id;
      const parentCode = cat.group || (effectiveId.includes('.') ? effectiveId.split('.').slice(0, -1).join('.') : null);

      if (!parentCode) return true; // Always show roots

      // Check if all ancestors are expanded
      // We need to find the ID of the parent to check expandedGroups (which stores IDs)
      // But expandedGroups stores IDs (backend IDs), so we need to map code -> ID?
      // Wait, toggleGroup uses cat.id. So expandedGroups stores cat.id.
      // But we are traversing up using CODES.

      // We need to find the category corresponding to the parentCode
      let currentParentCode = parentCode;
      while (currentParentCode) {
        const parentCat = sortedCategories.find(c => (c.code || c.id) === currentParentCode);
        if (!parentCat) break; // Should not happen if integrity is good

        if (!expandedGroups.has(parentCat.id)) return false;

        const parentEffectiveId = parentCat.code || parentCat.id;
        currentParentCode = parentCat.group || (parentEffectiveId.includes('.') ? parentEffectiveId.split('.').slice(0, -1).join('.') : '');
      }
      return true;
    });
  }, [sortedCategories, expandedGroups]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary">Plano de Contas (DFC)</h2>
            {categoriesOrigin === 'seed' && <Badge type="warning">Seed</Badge>}
            {categoriesOrigin === 'backend' && <Badge type="info">Backend</Badge>}
          </div>
          <p className="text-sm text-textSecondary">Estrutura hierárquica para Relatórios Financeiros</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={18} /> Exportar Excel
          </Button>
          <Button onClick={() => { setIsEditing(null); setFormData({ code: '', name: '', type: TransactionType.EXPENSE, group: '' }); setShowModal(true); }}>
            <Plus size={18} /> Nova Conta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <Card className="p-0 overflow-hidden min-h-[600px] bg-card border border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-10">
                  <tr className="text-textSecondary border-b border-border text-xs uppercase tracking-wider font-medium">
                    <th className="py-4 px-6 w-[60%]">Conta / Estrutura</th>
                    <th className="py-4 px-4 w-[15%]">Natureza</th>
                    <th className="py-4 px-4 w-[10%] text-center">Status</th>
                    <th className="py-4 px-4 w-[15%] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {visibleCategories.map((cat) => {
                    const effectiveId = cat.code || cat.id;
                    const depth = getDepth(effectiveId);
                    const nature = getCategoryNature(cat);
                    const isGroup = nature === 'Sintética';
                    const isExpanded = expandedGroups.has(cat.id);

                    // Visual Styling based on hierarchy
                    let rowClass = "hover:bg-gray-50/50 transition-colors duration-150";
                    let textClass = "text-textSecondary";
                    let codeClass = "text-textSecondary/70 font-mono";

                    if (depth === 0) { // Root (e.g., 1 - RECEITAS)
                      rowClass = "bg-gray-100/80 hover:bg-gray-100";
                      textClass = "font-bold text-lg text-primary uppercase tracking-tight";
                      codeClass = "font-bold text-lg text-primary mr-3";
                    } else if (depth === 1) { // Subgroup (e.g., 1.1)
                      rowClass = "bg-gray-50/40";
                      textClass = "font-semibold text-base text-textPrimary uppercase tracking-tight";
                      codeClass = "font-semibold text-base text-primary/80 mr-3";
                    } else if (isGroup) { // Other groups
                      textClass = "font-medium text-sm text-textPrimary uppercase";
                      codeClass = "font-medium text-sm text-primary/70 mr-2";
                    } else { // Analytical
                      textClass = "text-sm text-textSecondary font-normal";
                      codeClass = "text-sm text-textSecondary/60 mr-2";
                    }

                    const isCredit = cat.nature === Nature.CREDIT || (!cat.nature && cat.type === TransactionType.INCOME);

                    // Helper to format name: Uppercase for groups, Sentence case for analytical
                    const displayName = getCleanName(cat);
                    const formattedName = isGroup
                      ? displayName.toUpperCase()
                      : displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

                    return (
                      <tr key={cat.id} className={rowClass}>
                        {/* Structure Column */}
                        <td className="py-3 px-6 align-middle">
                          <div
                            className="flex items-center"
                            style={{ paddingLeft: `${depth * 24}px` }}
                          >
                            {isGroup ? (
                              <button
                                onClick={() => toggleGroup(cat.id)}
                                className="mr-2 p-1 hover:bg-black/5 rounded transition-colors text-textSecondary"
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            ) : (
                              <div className="w-6 mr-2 flex justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                              </div>
                            )}

                            <div className="flex items-center">
                              <span className={codeClass}>{effectiveId}</span>
                              <span className={textClass}>{formattedName}</span>
                            </div>
                          </div>
                        </td>

                        {/* Natureza */}
                        <td className="py-3 px-4 align-middle">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${isCredit
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                            }`}>
                            {isCredit ? 'Entrada (+)' : 'Saída (-)'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 align-middle text-center">
                          <button onClick={() => toggleCategoryStatus(cat.id)} className="relative inline-flex items-center cursor-pointer group">
                            <div className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out ${cat.isActive ? 'bg-primary' : 'bg-slate-300'}`}>
                              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out mt-1 ml-1 ${cat.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-right align-middle">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(cat)}
                              className={`p-1.5 rounded-md transition-all ${cat.isEditable === false
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : 'text-slate-500 hover:text-primary hover:bg-primary/10'
                                }`}
                              disabled={cat.isEditable === false}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => toggleCategoryStatus(cat.id)}
                              className={`p-1.5 rounded-md transition-all ${cat.isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              title={cat.isActive ? "Arquivar" : "Ativar"}
                            >
                              {cat.isActive ? <Archive size={16} /> : <CheckCircle size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-textSecondary flex flex-col items-center justify-center">
                        <FolderTree size={48} className="mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-500">Nenhuma conta encontrada</p>
                        <p className="text-sm text-slate-400">Comece adicionando uma nova conta ou importe um modelo.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal remains largely the same but with updated styling if needed */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <Card className="w-full max-w-2xl shadow-2xl border-0">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                {isEditing ? <Edit2 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                {isEditing ? 'Editar Conta' : 'Nova Conta'}
              </h3>
              <button onClick={handleCancel} className="text-textSecondary hover:text-textPrimary">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                label="Grupo Superior (Pai)"
                value={formData.group}
                onChange={e => {
                  const newGroup = e.target.value;
                  const newCodePrefix = newGroup ? `${newGroup}.` : '';
                  setFormData({ ...formData, group: newGroup, code: newCodePrefix });
                }}
                options={[{ value: '', label: 'Raiz (Sem Pai)' }, ...groupOptions]}
                error={formErrors.group}
              />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Input
                    label="Código"
                    value={formData.code}
                    onChange={e => { setFormData({ ...formData, code: e.target.value }); setFormErrors(prev => ({ ...prev, code: undefined })); }}
                    placeholder="Ex: 1.1.01"
                    required
                    error={formErrors.code}
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    label="Natureza do Fluxo"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    options={[{ value: TransactionType.INCOME, label: 'Entrada (Receita)' }, { value: TransactionType.EXPENSE, label: 'Saída (Despesa)' }]}
                    disabled={!!isEditing}
                  />
                </div>
              </div>
              <Input
                label="Nome da Conta"
                value={formData.name}
                onChange={e => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => ({ ...prev, name: undefined })); }}
                placeholder="Ex: Vendas à Vista"
                required
                error={formErrors.name}
              />
              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
