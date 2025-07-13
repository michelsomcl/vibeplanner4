
import BudgetItemForm from "@/components/BudgetItemForm";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface BudgetFormsProps {
  incomeFormOpen: boolean;
  expenseFormOpen: boolean;
  deleteDialogOpen: boolean;
  editingItem: any;
  editingType: 'income' | 'expense';
  itemToDelete: any;
  clientId: string;
  monthYear: string | null;
  isReadOnly: boolean;
  onFormClose: () => void;
  onDeleteClose: () => void;
  onConfirmDelete: () => void;
}

const BudgetForms = ({
  incomeFormOpen,
  expenseFormOpen,
  deleteDialogOpen,
  editingItem,
  editingType,
  itemToDelete,
  clientId,
  monthYear,
  isReadOnly,
  onFormClose,
  onDeleteClose,
  onConfirmDelete
}: BudgetFormsProps) => {
  if (isReadOnly) return null;

  return (
    <>
      <BudgetItemForm
        isOpen={incomeFormOpen}
        onClose={onFormClose}
        clientId={clientId}
        type="income"
        editItem={editingType === 'income' ? editingItem : undefined}
        monthYear={monthYear}
      />
      
      <BudgetItemForm
        isOpen={expenseFormOpen}
        onClose={onFormClose}
        clientId={clientId}
        type="expense"
        editItem={editingType === 'expense' ? editingItem : undefined}
        monthYear={monthYear}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={onDeleteClose}
        onConfirm={onConfirmDelete}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.budget_categories?.type === 'income' ? 'receita' : 'despesa'}
      />
    </>
  );
};

export default BudgetForms;
