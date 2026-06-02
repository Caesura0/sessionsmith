import { useModalStore } from '../store/modalStore';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export function GlobalConfirmModal() {
    const { isOpen, options, closeDialog } = useModalStore();

    if (!isOpen || !options) return null;

    const {
        title,
        message,
        confirmText = "Confirm",
        cancelText = "Cancel",
        danger = false
    } = options;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-dark-2 border border-white/10 rounded-2xl shadow-2xl p-6 w-[90%] max-w-md animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "p-3 rounded-full shrink-0",
                        danger ? "bg-red-500/10 text-red-400" : "bg-accent-blue/10 text-accent-blue"
                    )}>
                        {danger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 mt-1">
                        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
                        <p className="text-light-3 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{message}</p>
                        
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => closeDialog(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-light-3 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => closeDialog(true)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2",
                                    danger 
                                        ? "bg-red-500 hover:bg-red-600 focus:ring-red-500" 
                                        : "bg-accent-blue hover:bg-accent-blue-hover focus:ring-accent-blue"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
