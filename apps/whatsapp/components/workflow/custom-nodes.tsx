import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MousePointerClick, Split, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_REGISTRY } from './node-registry';

// --- Base Minimal Node ---
const MinimalNode = ({ title, icon: Icon, summary, isConnectable, colorClass, selected }: any) => (
  <div className={cn(
      "min-w-[200px] max-w-[200px] bg-card rounded-lg shadow-sm border transition-all group relative",
      selected ? "ring-2 ring-primary border-primary shadow-md" : "border-border hover:border-primary/50"
  )}>
    {/* Colored Strip / Icon Header */}
    <div className="flex items-center gap-3 p-3 pb-2">
        <div className={cn("p-1.5 rounded-md text-white shadow-sm shrink-0", colorClass)}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate leading-tight">{title}</span>
        </div>
    </div>
    
    {/* Summary Body */}
    <div className="px-3 pb-3 pt-1">
        <p className="text-[11px] text-muted-foreground truncate font-medium opacity-80">
            {summary || <span className="italic opacity-50">Not configured</span>}
        </p>
    </div>

    {/* Handles */}
    <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable} 
        className="w-2.5! h-2.5! bg-muted-foreground/30! border-[3px]! border-background! hover:bg-primary! transition-colors -left-[6px]!" 
    />
    <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable} 
        className="w-2.5! h-2.5! bg-muted-foreground/30! border-[3px]! border-background! hover:bg-primary! transition-colors -right-[6px]!" 
    />
  </div>
);

// --- Special Case: Button Node ---
const ButtonNodeComponent = memo(({ data, isConnectable, selected }: NodeProps) => {
    return (
      <div className={cn(
          "min-w-[200px] max-w-[200px] bg-card rounded-lg shadow-sm border transition-all relative",
          selected ? "ring-2 ring-primary border-primary shadow-md" : "border-border hover:border-primary/50"
      )}>
        <div className="flex items-center gap-3 p-3 pb-2">
            <div className="p-1.5 rounded-md text-white shadow-sm shrink-0 bg-purple-500">
                <MousePointerClick className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate leading-tight">Buttons</span>
            </div>
        </div>
        
        <div className="px-3 pb-3 pt-1">
             <p className="text-[11px] text-muted-foreground truncate font-medium opacity-80 mb-2">
                {data.label ? String(data.label) : "Select option..."}
            </p>
            <div className="space-y-1.5">
                {(Array.isArray(data.options) ? data.options : []).map((opt: string, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] bg-muted/30 px-2 py-1 rounded border border-transparent hover:border-purple-200">
                        <span className="truncate max-w-[120px]">{opt}</span>
                        <div className="relative w-2 h-2">
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={`option-${idx}`} 
                                isConnectable={isConnectable} 
                                className="w-2! h-2! bg-purple-500! border-0! -right-[20px]! top-1/2 -translate-y-1/2" 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
         <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2.5! h-2.5! bg-muted-foreground/30! border-[3px]! border-background! -left-[6px]!" />
      </div>
    );
});

// --- Special Case: Condition Node ---
const ConditionNodeComponent = memo(({ data, isConnectable, selected }: NodeProps) => {
    return (
      <div className={cn(
          "min-w-[200px] max-w-[200px] bg-card rounded-lg shadow-sm border transition-all relative",
          selected ? "ring-2 ring-primary border-primary shadow-md" : "border-border hover:border-primary/50"
      )}>
        <div className="flex items-center gap-3 p-3 pb-2">
            <div className="p-1.5 rounded-md text-white shadow-sm shrink-0 bg-rose-500">
                <Split className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm truncate">Condition</span>
        </div>
        <div className="px-3 pb-3 pt-1 space-y-2">
             <p className="text-[11px] text-muted-foreground font-medium">
                If <code className="text-rose-600 bg-rose-50 px-1 rounded">{`{{${String(data.variable)}}}`}</code> {data.operator === 'equals' ? '==' : String(data.operator)} {String(data.value)}
            </p>
            <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-end items-center gap-2 text-[10px] font-bold text-green-600 relative">
                    True
                     <Handle type="source" position={Position.Right} id="true" isConnectable={isConnectable} className="w-2! h-2! bg-green-500! border-0! -right-[16px]!" />
                </div>
                <div className="flex justify-end items-center gap-2 text-[10px] font-bold text-red-600 relative">
                    False
                     <Handle type="source" position={Position.Right} id="false" isConnectable={isConnectable} className="w-2! h-2! bg-red-500! border-0! -right-[16px]!" />
                </div>
            </div>
        </div>
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2.5! h-2.5! bg-muted-foreground/30! border-[3px]! border-background! -left-[6px]!" />
      </div>
    );
});

// --- Special Case: Menu Node ---
const MenuNodeComponent = memo(({ data, isConnectable, selected }: NodeProps) => {
    return (
      <div className={cn(
          "min-w-[220px] max-w-[220px] bg-card rounded-lg shadow-sm border transition-all relative",
          selected ? "ring-2 ring-primary border-primary shadow-md" : "border-border hover:border-primary/50"
      )}>
        <div className="flex items-center gap-3 p-3 pb-2">
            <div className="p-1.5 rounded-md text-white shadow-sm shrink-0 bg-pink-500">
                <List className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate leading-tight">List Menu</span>
            </div>
        </div>
        
        <div className="px-3 pb-3 pt-1">
             <div className="mb-2 space-y-1">
                 {!!data.header && <p className="text-[10px] font-bold truncate">{String(data.header)}</p>}
                 <p className="text-[11px] text-muted-foreground line-clamp-2 font-medium opacity-80">
                    {data.body ? String(data.body) : "Menu Content..."}
                </p>
                 {!!data.footer && <p className="text-[9px] text-muted-foreground/60 truncate">{String(data.footer)}</p>}
             </div>
             <p className="text-[9px] uppercase tracking-wider font-bold text-pink-500 mb-1">{data.button ? String(data.button) : "Menu"}</p>
            <div className="space-y-1">
                {(Array.isArray(data.options) ? data.options : []).map((opt: string, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] bg-muted/30 px-2 py-1.5 rounded border border-transparent hover:border-pink-200">
                        <span className="truncate max-w-[140px]">{opt}</span>
                        <div className="relative w-2 h-2">
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={`option-${idx}`} 
                                isConnectable={isConnectable} 
                                className="w-2! h-2! bg-pink-500! border-0! -right-[20px]! top-1/2 -translate-y-1/2" 
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
         <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2.5! h-2.5! bg-muted-foreground/30! border-[3px]! border-background! -left-[6px]!" />
      </div>
    );
});

// --- Factory for Standard Nodes ---
const createGenericNode = (type: string) => {
    const def = NODE_REGISTRY[type];
    if (!def) return () => <div>Unknown Node</div>;

    return memo(({ data, isConnectable, selected }: NodeProps) => {
        // Resolve Summary
        let summary = "Configure node";
        
        if (def.summaryTemplate) {
            // Replace {{key}} with data[key]
            summary = def.summaryTemplate.replace(/\{\{(.*?)\}\}/g, (_, key) => String(data[key.trim()] || '...'));
        } else if (def.summaryKey) {
            summary = String(data[def.summaryKey] || '');
        }

        return (
            <MinimalNode 
                title={def.title} 
                icon={def.icon} 
                summary={summary}
                isConnectable={isConnectable} 
                selected={selected}
                colorClass={def.colorClass}
            />
        );
    });
};

// --- Export All Types ---
export const customNodeTypes: Record<string, React.ComponentType<any>> = {
    button: ButtonNodeComponent,
    condition: ConditionNodeComponent,
    menu: MenuNodeComponent,
};

// Generate others dynamically from Registry (excluding custom handling ones)
Object.keys(NODE_REGISTRY).forEach(type => {
    if (type !== 'button' && type !== 'condition' && type !== 'menu') {
        customNodeTypes[type] = createGenericNode(type);
    }
});
