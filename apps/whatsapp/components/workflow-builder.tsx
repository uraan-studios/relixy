import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  Panel,
  useOnSelectionChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Plus, Save, Settings as SettingsIcon, Play, AlertCircle, Zap, Split, MousePointerClick, MessageSquare, Type, Repeat, Clock, ChevronRight } from "lucide-react";
import { customNodeTypes } from './workflow/custom-nodes';
import { PropertiesPanel } from './workflow/properties-panel';
import { NODE_REGISTRY, getNodeDefinition } from './workflow/node-registry';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialNodes: Node[] = [];

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  
  const [workflowSettings, setWorkflowSettings] = useState({
      sessionTimeout: 5,
      resetOnInactivity: true,
      agentName: "Support Bot"
  });

  const nodeTypes = useMemo(() => customNodeTypes, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Handle Node Click -> Select
  const onNodeClick = useCallback((event: any, node: Node) => {
      setSelectedNodeId(node.id);
  }, []);

  // Handle Pane Click -> Deselect
  const onPaneClick = useCallback(() => {
      setSelectedNodeId(null);
  }, []);

  // Update Node Data from Sidebar
  const onNodeUpdate = (nodeId: string, newData: any) => {
      setNodes((nds) => nds.map((n) => {
          if (n.id === nodeId) {
              return { ...n, data: newData };
          }
          return n;
      }));
  };
  
  // Load Workflow (same as before)
  useEffect(() => {
      const fetchWorkflow = async () => {
          try {
              const res = await fetch('http://localhost:8080/workflows');
              const data = await res.json();
              if (data.success && data.data && data.data.length > 0) {
                  const sorted = data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  const wf = sorted[0]; 
                  setWorkflowId(wf.id);
                  let parsedNodes = typeof wf.nodes === 'string' ? JSON.parse(wf.nodes) : wf.nodes;
                  parsedNodes = parsedNodes.map((n: any) => ({ ...n, position: n.position || { x: 0, y: 0 } }));
                  setNodes(parsedNodes);
                  setEdges(typeof wf.edges === 'string' ? JSON.parse(wf.edges) : wf.edges);
                  setWorkflowSettings(s => ({...s, agentName: wf.name}));
                  toast.success("Latest workflow loaded");
              }
          } catch (e) {
              console.error("Failed to load workflow", e);
          }
      };
      fetchWorkflow();
  }, [setNodes, setEdges]);
  
  const addNode = (type: string) => {
      const def = getNodeDefinition(type);
      if(!def) return;

      const id = `${type}-${Date.now()}`;
      const newNode: Node = {
          id,
          type,
          position: { x: Math.random() * 200 + 200, y: Math.random() * 200 + 100 },
          data: { ...def.defaultData }
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id); // Auto-select new node
  };

  const handleSave = async () => {
      // (Save logic same as before...)
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const triggerKeyword = triggerNode ? (triggerNode.data.triggerKeyword as string) : '';

      if (!triggerKeyword) {
          toast.error("Please add a Trigger node with keywords.");
          return;
      }

      const payload = {
          name: workflowSettings.agentName || "Untitled Agent",
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
          triggerKeyword: triggerKeyword,
          isActive: true
      };

      // ... fetch call ...
       try {
          const url = workflowId ? `http://localhost:8080/workflows/${workflowId}` : 'http://localhost:8080/workflows';
          const method = workflowId ? 'PUT' : 'POST';
          
          const res = await fetch(url, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Workflow saved!");
              if (data.data.id) setWorkflowId(data.data.id);
          } else {
              toast.error("Failed to save: " + data.error);
          }
      } catch (e) {
          toast.error("Network error while saving");
      }
  };

  // Find selected node object
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-border/40 flex justify-between items-center bg-background px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
           <div className="bg-primary/10 text-primary p-2 rounded-lg">
               <Zap className="h-4 w-4"/> 
           </div>
           <div>
               <h2 className="text-sm font-semibold">{workflowSettings.agentName}</h2>
               <p className="text-[10px] text-muted-foreground">Auto-saved</p>
           </div>
        </div>
        
        <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 text-xs font-normal" onClick={() => setNodes([])}>Reset</Button>
            <Button size="sm" className="h-8 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black shadow-sm text-xs" onClick={handleSave}>
                <Save className="mr-1.5 h-3.5 w-3.5"/> Publish
            </Button>
        </div>
      </div>
      
      {/* Main Workspace */}
      <div className="flex-1 flex w-full relative h-[calc(100%-3.5rem)]">
         {/* Canvas */}
        <div className="flex-1 h-full relative bg-secondary/5">
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1 }}
            colorMode="system"
            className="bg-dots-pattern"
            >
            <Controls className="!bg-background !border-border !shadow-sm !m-4" showInteractive={false} />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="currentColor" className="opacity-[0.15]" />
            
            {/* Toolbar Panel (Floating) */}
            <Panel position="top-left" className="m-4 ml-2 mt-2">
                <div className="flex flex-col gap-2 p-1.5 bg-background/90 backdrop-blur-md border border-border/50 rounded-xl shadow-xl">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Tools</p>
                    
                    {Object.values(NODE_REGISTRY).map((def) => (
                        <Button 
                            key={def.type}
                            variant="ghost" 
                            className="justify-start h-8 text-xs font-medium w-36 hover:bg-accent group transition-all" 
                            onClick={() => addNode(def.type)}
                        >
                            <def.icon className={`mr-2 h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors`}/> 
                            <span className="group-hover:translate-x-0.5 transition-transform">{def.title}</span>
                        </Button>
                    ))}
                </div>
            </Panel>
            </ReactFlow>
        </div>

        {/* Right Sidebar Properties Panel */}
        {selectedNode && (
             <PropertiesPanel 
                node={selectedNode} 
                onChange={onNodeUpdate} 
                onClose={() => setSelectedNodeId(null)} 
            />
        )}
      </div>
    </div>
  );
}
