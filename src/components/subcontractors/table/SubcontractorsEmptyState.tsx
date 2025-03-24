
interface SubcontractorsEmptyStateProps {
  searchQuery: string;
}

const SubcontractorsEmptyState = ({ searchQuery }: SubcontractorsEmptyStateProps) => {
  return (
    <div className="rounded-md border p-8 text-center">
      <p className="text-muted-foreground">
        {searchQuery
          ? `No subcontractors found matching "${searchQuery}"`
          : "No subcontractors found. Add your first subcontractor to get started."}
      </p>
    </div>
  );
};

export default SubcontractorsEmptyState;
