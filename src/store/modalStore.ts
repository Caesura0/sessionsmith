import { create } from 'zustand';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
};

type ModalState = {
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolver: ((value: boolean) => void) | null;
    confirmDialog: (options: ConfirmOptions) => Promise<boolean>;
    closeDialog: (result: boolean) => void;
};

export const useModalStore = create<ModalState>((set, get) => ({
    isOpen: false,
    options: null,
    resolver: null,
    confirmDialog: (options) => {
        return new Promise((resolve) => {
            set({ isOpen: true, options, resolver: resolve });
        });
    },
    closeDialog: (result) => {
        const { resolver } = get();
        if (resolver) resolver(result);
        set({ isOpen: false, options: null, resolver: null });
    }
}));
