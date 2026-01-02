import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Zap } from "lucide-react";

const NodeLayout = ({ title, children, isConnectable, colorClass = "bg-muted/50" }: any) => (
  <div className="min-w-[180px] max-w-[250px] border shadow-sm bg-card rounded-md overflow-hidden text-xs">
    <div className={`px-2 py-1.5 border-b flex items-center justify-between ${colorClass}`}>
        <span className="font-semibold text-foreground/90">{title}</span>
    </div>
    <div className="p-2 space-y-2">
      {children}
    </div>
    <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2.5 h-2.5 bg-primary/50" />
    <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2.5 h-2.5 bg-primary/50" />
  </div>
);

export const TriggerNode = memo(({ data, isConnectable }: any) => {
  return (
    <NodeLayout title="Trigger" isConnectable={isConnectable} colorClass="bg-yellow-100/50 dark:bg-yellow-900/20">
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Keywords</Label>
        <Input 
            className="h-6 text-xs px-1" 
            placeholder="e.g. hi, hello" 
            defaultValue={data.triggerKeyword} 
            onChange={(evt) => data.onChange?.(evt.target.value)}
        />
        <p className="text-[9px] text-muted-foreground">Comma separated</p>
      </div>
       {/* Triggers typically don't have input handles, but can if chained */}
       <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2.5 h-2.5 bg-primary/50" />
    </NodeLayout>
  );
});

export const MessageNode = memo(({ data, isConnectable }: any) => {
  return (
    <NodeLayout title="Send Message" isConnectable={isConnectable} colorClass="bg-blue-100/50 dark:bg-blue-900/20">
      <div className="space-y-1">
        <Textarea 
            className="text-xs min-h-[50px] resize-none leading-tight p-1.5" 
            placeholder="Hello {{name}}!" 
            defaultValue={data.label} 
            onChange={(evt) => data.onChange?.(evt.target.value)}
        />
        <p className="text-[9px] text-muted-foreground">Use {'{{var}}'} for variables</p>
      </div>
    </NodeLayout>
  );
});

export const ButtonNode = memo(({ data, isConnectable }: any) => {
    const addOption = () => {
        const newOptions = [...(data.options || []), "New Option"];
        data.onOptionsChange?.(newOptions);
    };

    const updateOption = (index: number, val: string) => {
        const newOptions = [...(data.options || [])];
        newOptions[index] = val;
        data.onOptionsChange?.(newOptions);
    };

    const removeOption = (index: number) => {
        const newOptions = (data.options || []).filter((_: any, i: number) => i !== index);
        data.onOptionsChange?.(newOptions);
    }

    return (
        <NodeLayout title="Buttons / Menu" isConnectable={isConnectable} colorClass="bg-purple-100/50 dark:bg-purple-900/20">
            <div className="space-y-1 pb-2">
                <Label className="text-[10px] text-muted-foreground">Message</Label>
                 <Input 
                    className="h-6 text-xs px-1" 
                    placeholder="Choose an option:"
                    defaultValue={data.label}
                    onChange={(evt) => data.onChange?.(evt.target.value)}
                />
            </div>
            <div className="space-y-1">
                 <Label className="text-[10px] text-muted-foreground flex justify-between items-center">
                    Options
                    <Plus className="h-3 w-3 cursor-pointer hover:text-primary" onClick={addOption}/>
                 </Label>
                 <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {(data.options || []).map((opt: string, idx: number) => (
                        <div key={idx} className="relative flex gap-1 items-center">
                            <Input 
                                value={opt} 
                                onChange={(e) => updateOption(idx, e.target.value)}
                                className="h-6 text-xs px-1 flex-1"
                            />
                            <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeOption(idx)}/>
                            
                            {/* Dynamic Handle for this option */}
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={`option-${idx}`} // Crucial for identifying the branch
                                isConnectable={isConnectable} 
                                className="w-2.5 h-2.5 bg-purple-500 !right-[-8px]" 
                                style={{ top: '50%', transform: 'translateY(-50%)' }}
                            />
                        </div>
                    ))}
                    {(data.options || []).length === 0 && <p className="text-[9px] text-muted-foreground italic">No options added</p>}
                 </div>
            </div>
            {/* Remove default handle, as we now branch from options */}
        </NodeLayout>
    );
});

export const InputNode = memo(({ data, isConnectable }: any) => {
  return (
    <NodeLayout title="Collect Input" isConnectable={isConnectable} colorClass="bg-green-100/50 dark:bg-green-900/20">
       <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Question</Label>
        <Textarea 
            className="text-xs min-h-[30px] resize-none leading-tight p-1.5" 
            placeholder="What is your name?" 
            defaultValue={data.question} 
            onChange={(evt) => data.onQuestionChange?.(evt.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Save to Context</Label>
        <Input 
            className="h-6 text-xs px-1" 
            placeholder="e.g. user_name" 
            defaultValue={data.variable}
            onChange={(evt) => data.onVariableChange?.(evt.target.value)}
        />
      </div>
    </NodeLayout>
  );
});
