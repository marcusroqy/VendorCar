import { DollarSign } from 'lucide-react';

export default function SalesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Vendas</h1>
                <p className="text-foreground-muted">Histórico de vendas realizadas</p>
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning-500/10 flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-warning-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Nenhuma venda registrada</h2>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                    Quando você finalizar uma venda através de um lead, ela aparecerá aqui.
                </p>
            </div>
        </div>
    );
}
