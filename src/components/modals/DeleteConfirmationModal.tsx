'use client';

import { Trash2 } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    title?: string;
    description?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    title = 'Excluir item?',
    description = 'Esta ação não pode ser desfeita. O item será removido permanentemente.'
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-md w-full border-error-500/30">
                <CardContent className="p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
                            <Trash2 className="w-8 h-8 text-error-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{title}</h3>
                        <p className="text-foreground-muted mb-6">
                            {description}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                fullWidth
                                className="bg-error-500 hover:bg-error-600"
                                isLoading={isDeleting}
                                onClick={onConfirm}
                            >
                                Excluir
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
