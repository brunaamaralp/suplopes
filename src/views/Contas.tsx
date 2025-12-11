import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, Button, Input } from '../components/ui';
import { Account, FORMAT_CURRENCY } from '../types';
import { Plus, Edit2, Trash2, CheckCircle, Landmark, Download } from 'lucide-react';
import { exportToCSV } from '../services/export';

export const Contas: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
  const [isEditing, setIsEditing] = useState<Account | null>(null);
  const [formData, setFormData] = useState<{ name: string; initialBalance: number }>({
    name: '',
    initialBalance: 0,
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; initialBalance?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!formData.name || String(formData.name).trim() === '') errors.name = 'Informe o nome da conta';
    const duplicate = accounts.some(a => a.name.trim().toLowerCase() === String(formData.name).trim().toLowerCase() && (!isEditing || a.id !== isEditing.id));
    if (duplicate) errors.name = 'Já existe uma conta com este nome';
    const bal = Number(formData.initialBalance);
    if (!isFinite(bal)) errors.initialBalance = 'Saldo inicial inválido';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (isEditing) {
        const res = await updateAccount({ ...isEditing, ...formData });
        if (!res.ok) {
          const mapped: typeof formErrors = {};
          (res.errors || []).forEach((err: any) => {
            if (err.field && err.message) (mapped as any)[err.field] = err.message;
          });
          setFormErrors(mapped);
          return;
        }
        setIsEditing(null);
      } else {
        const res = await addAccount({
          id: crypto.randomUUID(),
          name: formData.name,
          initialBalance: Number(formData.initialBalance),
        });
        if (!res.ok) {
          const mapped: typeof formErrors = {};
          (res.errors || []).forEach((err: any) => {
            if (err.field && err.message) (mapped as any)[err.field] = err.message;
          });
          setFormErrors(mapped);
          return;
        }
      }
      setFormData({ name: '', initialBalance: 0 });
      setFormErrors({});
    } catch { }
  };

  const handleEdit = (acc: Account) => {
    setIsEditing(acc);
    setFormData({ name: acc.name, initialBalance: acc.initialBalance });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setFormData({ name: '', initialBalance: 0 });
  };

  const handleExport = () => {
    exportToCSV<Account>(
      accounts,
      [
        { header: 'ID', key: 'id' },
        { header: 'Nome da Conta', key: 'name' },
        { header: 'Saldo Inicial Configurado', key: (item: Account) => FORMAT_CURRENCY(item.initialBalance || 0) }
      ],
      'Contas_Bancarias'
    );
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">Contas Bancárias</h2>
          <p className="text-sm text-textSecondary">Gerencie caixas físicos e contas bancárias</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download size={18} /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4 text-textPrimary">
              {isEditing ? 'Editar Conta' : 'Nova Conta'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome da Conta"
                value={formData.name}
                onChange={e => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => ({ ...prev, name: undefined })); }}
                placeholder="Ex: Caixa Loja, Banco X..."
                required
                error={formErrors.name}
              />
              <Input
                label="Saldo Inicial (R$)"
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={e => { setFormData({ ...formData, initialBalance: parseFloat(e.target.value) }); setFormErrors(prev => ({ ...prev, initialBalance: undefined })); }}
                placeholder="0.00"
                error={formErrors.initialBalance}
              />

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">
                  {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
                  {isEditing ? 'Salvar' : 'Adicionar'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-textSecondary border-b border-glass">
                    <th className="py-3 px-2 font-medium">Nome</th>
                    <th className="py-3 px-2 font-medium text-right">Saldo Inicial Configurado</th>
                    <th className="py-3 px-2 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-glass/50 hover:bg-input/30 transition-colors">
                      <td className="py-3 px-2 text-textPrimary flex items-center gap-2">
                        <Landmark size={16} className="text-primary" />
                        {acc.name}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-textSecondary">
                        {FORMAT_CURRENCY(acc.initialBalance || 0)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-textSecondary hover:text-primary hover:bg-input rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
                                deleteAccount(acc.id);
                              }
                            }}
                            className="p-2 text-textSecondary hover:text-negative hover:bg-negative/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-textSecondary">
                        Nenhuma conta cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
