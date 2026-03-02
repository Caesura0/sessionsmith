import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
    id: string;
    label: string;
    onMoveUp: (e: React.MouseEvent) => void;
    onMoveDown: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onRemove: (e: React.MouseEvent) => void;
};

export function SortableChip({ id, label, onMoveUp, onMoveDown, onEdit, onRemove }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center justify-between rounded-xl bg-dark-3 px-3 py-2 text-sm w-full transition ${isDragging ? 'shadow-lg border border-light-3' : 'hover:bg-dark-4'}`}
        >
            <div
                className="flex-1 pr-4 flex items-center gap-2 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <span className="text-light-4 opacity-50 select-none">⋮⋮</span>
                <span>{label}</span>
            </div>
            <div className="hidden group-hover:flex items-center gap-1 opacity-80 pl-2 border-l border-white/10">
                <button
                    onClick={onMoveUp}
                    className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Move up"
                >↑</button>
                <button
                    onClick={onMoveDown}
                    className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Move down"
                >↓</button>
                <button
                    onClick={onEdit}
                    className="p-1 hover:text-white hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center cursor-pointer" title="Edit text"
                >✎</button>
                <button
                    onClick={onRemove}
                    className="p-1 hover:text-red-400 hover:bg-black/20 rounded h-7 w-7 flex items-center justify-center text-red-500 cursor-pointer" title="Remove"
                >✕</button>
            </div>
        </div>
    );
}
