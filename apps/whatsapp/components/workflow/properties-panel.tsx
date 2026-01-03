
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, HelpCircle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getNodeDefinition, PropertyField } from "./node-registry";

interface PropertiesPanelProps {
    node: any;
    onChange: (id: string, data: any) => void;
    onClose: () => void;
}

export function PropertiesPanel({ node, onChange, onClose }: PropertiesPanelProps) {
    if (!node) return null;

    const def = getNodeDefinition(node.type);
    const data = node.data || {};

    if (!def) {
        return (
             <div className="w-[350px] border-l border-border bg-background flex flex-col h-full shadow-2xl z-20">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-destructive">Unknown Node Type</h3>
                </div>
                <div className="p-4">
                    <p>No definition found for type: {node.type}</p>
                </div>
             </div>
        )
    }

    const handleChange = (field: string, value: any) => {
        onChange(node.id, { ...data, [field]: value });
    };

    // Generic Field Renderer
    const renderField = (field: PropertyField) => {
        const val = data[field.key] !== undefined ? data[field.key] : field.defaultValue;

        switch (field.type) {
            case 'text':
                return (
                    <Input 
                        value={val || ''} 
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                    />
                );
            case 'textarea':
                return (
                    <Textarea 
                        value={val || ''} 
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="min-h-[80px] resize-none"
                    />
                );
            case 'number':
                return (
                    <Input 
                        type="number"
                        value={val} 
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        min={field.min}
                        max={field.max}
                    />
                );
            case 'variable':
                 return (
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/20">
                        <span className="font-mono text-muted-foreground text-xs">{`{{`}</span>
                        <input 
                            className="flex-1 bg-transparent border-none text-sm focus:outline-none font-mono text-primary placeholder:text-muted-foreground/50" 
                            value={val || ''} 
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                        />
                        <span className="font-mono text-muted-foreground text-xs">{`}}`}</span>
                    </div>
                 );
            case 'select':
                return (
                    <Select value={val} onValueChange={(v) => handleChange(field.key, v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(field.options || []).map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'info':
                 return (
                     <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                         <Info className="w-4 h-4 shrink-0" />
                         <span>{field.description}</span>
                     </div>
                 );
            case 'list':
                // Special case for options list
                const list = Array.isArray(val) ? val : [];
                return (
                    <div className="space-y-2">
                        {(list).map((item: string, idx: number) => (
                             <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono text-muted-foreground border shrink-0">
                                    {idx + 1}
                                </div>
                                <Input 
                                    value={item} 
                                    onChange={(e) => {
                                        const newList = [...list];
                                        newList[idx] = e.target.value;
                                        handleChange(field.key, newList);
                                    }}
                                    className="h-9 text-sm"
                                />
                                <Button variant="ghost" size="icon" onClick={() => {
                                     const newList = list.filter((_: any, i: number) => i !== idx);
                                     handleChange(field.key, newList);
                                }} className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => {
                            const newList = [...list, `Option ${list.length + 1}`];
                            handleChange(field.key, newList);
                        }} className="w-full text-xs gap-1 mt-2 border-dashed">
                             <Plus className="h-3 w-3"/> Add Item
                         </Button>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="w-[350px] border-l border-border bg-background flex flex-col h-full shadow-2xl z-20 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg text-white shadow-sm ${def.colorClass}`}>
                        {(() => { const NodeIcon = def.icon; return <NodeIcon className="w-4 h-4" /> })()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{def.title}</h3>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {node.id.split('-').pop()}</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {def.schema.map((field) => (
                    <div key={field.key} className="space-y-2">
                        {field.type !== 'info' && (
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">{field.label}</Label>
                            </div>
                        )}
                        {renderField(field)}
                        {field.description && field.type !== 'info' && (
                             <p className="text-[10px] text-muted-foreground">{field.description}</p>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-border bg-muted/10 text-[10px] text-muted-foreground text-center">
                Configure {def.title} Properties
            </div>
        </div>
    );
}
