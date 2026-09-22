import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus
} from 'lucide-react';
import {
  reorderBlocks,
  setSelectedBlockId,
  removeBlock,
  duplicateBlock,
  moveBlockStep
} from './editorSlice.js';
import { BLOCK_REGISTRY } from '../../blocks/registry.js';

function SortableBlockItem({ block, theme, isSelected, onSelect, onRemove, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.6 : 1
  };

  const blockMeta = BLOCK_REGISTRY[block.type];
  const Component = blockMeta?.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(block.id)}
      className={`relative group transition-all my-3 ${
        isSelected
          ? 'ring-2 ring-[#111111] ring-offset-2'
          : 'hover:ring-1 hover:ring-zinc-400/60'
      }`}
    >
      {/* Block Controls Toolbar (visible on hover / selected) */}
      <div className={`absolute -top-3.5 right-4 z-20 flex items-center gap-1 px-2 py-1 bg-zinc-900 text-white rounded-md shadow-lg text-xs transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="font-semibold text-zinc-300 mr-1.5 capitalize">{block.type}</span>

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          className="p-1 hover:bg-zinc-800 rounded cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Move Up */}
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(block.id); }}
          disabled={isFirst}
          title="Move up"
          className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-400 hover:text-white"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* Move Down */}
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(block.id); }}
          disabled={isLast}
          title="Move down"
          className="p-1 hover:bg-zinc-800 disabled:opacity-30 rounded text-zinc-400 hover:text-white"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Duplicate */}
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(block.id); }}
          title="Duplicate block"
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          title="Delete block"
          className="p-1 hover:bg-red-600 rounded text-zinc-400 hover:text-white"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render the actual block component */}
      {Component ? (
        <Component props={block.props} theme={theme} />
      ) : (
        <div className="p-4 bg-red-50 text-red-600 text-xs">Unknown block: {block.type}</div>
      )}
    </div>
  );
}

export default function Canvas() {
  const dispatch = useDispatch();
  const { present: site, selectedBlockId, deviceView } = useSelector((state) => state.editor);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  if (!site) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-zinc-400">
        Loading canvas...
      </div>
    );
  }

  const { theme, blocks = [] } = site;
  const isDark = theme?.mode === 'dark';

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch(reorderBlocks({ activeId: active.id, overId: over.id }));
    }
  };

  // Device width wrapper
  const getDeviceWidthClass = () => {
    switch (deviceView) {
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl border-x border-zinc-300 dark:border-zinc-700 my-8 rounded-2xl overflow-hidden';
      case 'tablet':
        return 'w-[768px] min-h-[900px] shadow-xl border-x border-zinc-300 dark:border-zinc-700 my-8 rounded-xl overflow-hidden';
      case 'desktop':
      default:
        return 'w-full max-w-5xl my-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden';
    }
  };

  return (
    <div
      onClick={() => dispatch(setSelectedBlockId(null))}
      className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-8 flex justify-center items-start"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`transition-all duration-300 ${getDeviceWidthClass()} ${isDark ? 'dark' : ''}`}
        style={{
          backgroundColor: isDark ? '#141416' : '#ffffff',
          fontFamily: theme?.fontFamily ? `'${theme.fontFamily}', sans-serif` : 'sans-serif'
        }}
      >
        {blocks.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <p className="text-lg font-medium mb-2">No blocks on your canvas</p>
            <p className="text-sm">Click any block in the left palette to add it.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col">
                {blocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    theme={theme}
                    isSelected={selectedBlockId === block.id}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onSelect={(id) => dispatch(setSelectedBlockId(id))}
                    onRemove={(id) => dispatch(removeBlock(id))}
                    onDuplicate={(id) => dispatch(duplicateBlock(id))}
                    onMoveUp={(id) => dispatch(moveBlockStep({ blockId: id, direction: 'up' }))}
                    onMoveDown={(id) => dispatch(moveBlockStep({ blockId: id, direction: 'down' }))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
